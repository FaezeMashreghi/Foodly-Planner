import { ConverseCommand, type Tool } from '@aws-sdk/client-bedrock-runtime'
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { Recipe } from '@shared/meal/meal'
import { bedrock, MODEL_ID } from '@server/lambda/data/bedrock.ts'
import { db, isConditionFailed } from '@server/lambda/data/db.ts'
import { MEALS_TABLE as TABLE, type MealItem } from '@server/lambda/data/meals.ts'

type MealWithRecipe = MealItem & { recipe?: Recipe }

const SYSTEM = `You write clear, simple home-cooking recipes.
Build the recipe around the ingredients given. Add any spices, herbs and pantry basics
(oil, butter, salt, pepper, water…) the dish needs to taste right, and list them in extras.
Write each step as one short instruction, in order. Include times and heat levels.`

const TOOL: Tool = {
  toolSpec: {
    name: 'save_recipe',
    description: 'Save the recipe for this meal.',
    inputSchema: {
      json: {
        type: 'object',
        properties: {
          extras: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Spices, herbs and pantry items used in the steps that are not in the ingredient list, with amounts, e.g. "1 tsp turmeric".',
          },
          steps: {
            type: 'array',
            items: { type: 'string' },
            description: 'Cooking steps in order, 4 to 12 steps.',
          },
          tips: {
            type: 'array',
            items: { type: 'string' },
            description: 'Up to 3 short tips. Empty if none.',
          },
        },
        required: ['extras', 'steps', 'tips'],
      },
    },
  },
}

/** The saved recipe, or a new one from the AI, saved for everyone. null if the meal doesn't exist. */
export async function getRecipe(mealId: string): Promise<Recipe | null> {
  const { Item } = await db.send(new GetCommand({ TableName: TABLE, Key: { id: mealId } }))
  const meal = Item as MealWithRecipe | undefined
  if (!meal) return null
  if (meal.recipe) return meal.recipe

  const recipe = await writeRecipe(meal)
  try {
    await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { id: mealId },
        UpdateExpression: 'SET recipe = :recipe',
        ConditionExpression: 'attribute_exists(id) AND attribute_not_exists(recipe)',
        ExpressionAttributeValues: { ':recipe': recipe },
      }),
    )
    return recipe
  } catch (error) {
    if (!isConditionFailed(error)) throw error
    // Someone saved a recipe first: return theirs, so everyone sees the same one.
    const { Item } = await db.send(new GetCommand({ TableName: TABLE, Key: { id: mealId } }))
    return (Item as MealWithRecipe | undefined)?.recipe ?? recipe
  }
}

async function writeRecipe(meal: MealItem): Promise<Recipe> {
  const ingredients = meal.ingredients
    .map((item) => `- ${item.amount} ${item.unit} ${item.ingredientId}`)
    .join('\n')
  const prompt = `Meal: ${meal.name} (${meal.cuisine}), serves ${meal.servings}.\nIngredients:\n${ingredients}`

  const response = await bedrock.send(
    new ConverseCommand({
      modelId: MODEL_ID,
      system: [{ text: SYSTEM }],
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      toolConfig: { tools: [TOOL], toolChoice: { tool: { name: 'save_recipe' } } },
      inferenceConfig: { maxTokens: 2048 },
    }),
  )
  console.log('bedrock usage (recipe)', JSON.stringify(response.usage))

  const input = (response.output?.message?.content?.find((block) => block.toolUse)?.toolUse
    ?.input ?? {}) as Record<string, unknown>
  const texts = (value: unknown, max: number) =>
    Array.isArray(value)
      ? value
          .filter((item) => typeof item === 'string' && item.trim())
          .map((item) => item.trim().slice(0, 400))
          .slice(0, max)
      : []

  const steps = texts(input.steps, 15)
  if (steps.length === 0) throw new Error(`The AI returned no steps for ${meal.id}`)

  return {
    extras: texts(input.extras, 15),
    steps,
    tips: texts(input.tips, 3),
    model: MODEL_ID,
    createdAt: new Date().toISOString(),
  }
}
