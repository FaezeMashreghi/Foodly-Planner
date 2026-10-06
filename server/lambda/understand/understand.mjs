import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime'
import { loadMeals } from '../data/meals.mjs'

const bedrock = new BedrockRuntimeClient({})
// The fallback is for eval.mjs, run on your machine; the Lambda gets it from infra.
export const MODEL_ID = process.env.MODEL_ID ?? 'eu.anthropic.claude-haiku-4-5-20251001-v1:0'
const TOOL_NAME = 'save_answers'

const INGREDIENTS_BY_CATEGORY = {
  vegetable:
    'aubergine bell-pepper broccoli carrot cherry-tomato courgette cucumber edamame garlic green-bean green-chilli green-pea lettuce mushroom onion potato red-cabbage red-onion salad-mix spinach spring-onion sweet-corn sweet-potato tinned-tomato tomato',
  fruit: 'apple avocado banana blueberry date lemon lime orange pomegranate raisin strawberry',
  meat: 'beef-mince beef-steak beef-stew-meat chicken-breast chicken-thigh lamb-mince lamb-stew-meat sliced-chicken sucuk turkey-breast turkey-ham',
  fish: 'cod-fillet pangasius-fillet salmon-fillet shrimp tinned-tuna',
  'dairy-eggs':
    'butter cooking-cream cottage-cheese egg feta gouda greek-yogurt kashk milk mozzarella parmesan yogurt',
  grain:
    'basmati-rice bread-roll breadcrumb bulgur burger-bun couscous egg-noodle flatbread flour jasmine-rice macaroni oatmeal reshteh spaghetti tortilla-wrap wholegrain-bread',
  legume: 'black-bean chickpea green-lentil kidney-bean red-lentil tofu yellow-split-pea',
  'herb-spice':
    'advieh black-pepper chilli-flake chive cinnamon cumin curry-powder dill dried-fenugreek dried-lime dried-mint fresh-coriander ginger oregano paprika parsley saffron salt sumac taco-seasoning turmeric',
  'sauce-condiment':
    'honey ketchup mayonnaise mustard olive-oil peanut-butter salsa sesame-oil soy-sauce sriracha teriyaki-sauce tomato-paste vegetable-oil',
  other: 'almond chia-seed coconut-milk jam sesame-seed stock-cube sugar walnut',
}

const CUISINES = ['persian', 'turkish', 'dutch', 'asian', 'international']

const INGREDIENT_IDS = new Set(
  Object.values(INGREDIENTS_BY_CATEGORY).flatMap((ids) => ids.split(' ')),
)
const CUISINE_IDS = new Set(CUISINES)

const buildSystem = (
  meals,
) => `You read what a user wrote about their coming week of meals and call ${TOOL_NAME} with structured data. The app shows the result to the user (they can edit it), then plain code scores a catalogue of meals with it.

The user's text answers up to 4 questions, one per line: "Ingredients going off soon", "Food I feel like", "Cooking effort", "A dish I really want". Skipped questions are left out. People write casually, with typos, in English, Persian (script or Latin letters), Turkish, Dutch or a mix. Read the whole text: an allergy or a time limit can appear under any question.

# Fields

- expiring: ingredients the user HAS that are going off soon. Map each to the one closest id ("tomatoes" → tomato, "half a pot of yogurt" → yogurt, "minced beef" → beef-mince). No food-group expansion here.
- wantMore: ingredients they would like more of. Don't repeat ids that are already in expiring.
- avoid: ingredients to leave out. Meals containing any of these are removed, so for a food group list EVERY matching id (see the groups below). "I hate onions" → onion, red-onion, spring-onion.
- cuisines: cuisine ids they named or clearly implied ("Iranian" → persian, "Chinese", "Japanese", "Thai", "Korean", "Indian", "curry", "stir fry" → asian). A cuisine that is not in the list (Italian, Mexican, Greek, French…) → leave it out and write a note. A must-have dish on its own does not add a cuisine.
- easyOnly: true when they use a word like easy, simple, quick, fast or lazy, or say they are busy or tired. A number alone ("30 min") is not easyOnly. Otherwise false.
- maxPrepMinutes: a number when they give or imply a time limit: an explicit number wins ("under 20 minutes" → 20, "an hour max" → 60); "quick", "fast", "busy", "lazy", "not much time" → 30. "Easy" or "simple" alone is not a time limit → null. No limit → null. If the limit differs by day, use the weekday limit and put the other days in a note ("More time on Sunday.").
- mustHaveMealId: the catalogue id of the dish from "A dish I really want", if it is in the catalogue. Match loosely: spelling ("jujeh kabob" → joojeh-kabab), other names and languages ("کشک بادمجون" → kashk-e-bademjan), descriptions ("that Turkish lentil soup" → mercimek-corbasi). Only a clear match of the same dish; a similar but different dish is not a match. Not in the catalogue → null. If they name several dishes, use the first one that clearly matches ("ghormeh sabzi and kabab" → ghormeh-sabzi; "kabab" alone could be several meals, so it is not a clear match).
- mustHaveText: the dish in the user's own words, or null. If the answer is an ingredient rather than a dish ("something with chicken"), put the ingredient in wantMore and set both mustHave fields to null.
- notes: at most 3 short sentences for useful things that don't fit the fields: a cuisine that isn't in the list, "less" of something, which days have more or less time, a wish for one meal of the day ("Rice is a favourite for lunch."), guests or how many people. Write them in the language the user mostly wrote in. Don't repeat what the fields already say, and don't write a note because the must-have dish isn't in the catalogue.

# Food groups (use the complete list)

- fish / seafood: cod-fillet, pangasius-fillet, salmon-fillet, shrimp, tinned-tuna. Shellfish only: shrimp.
- meat: every id in the meat category. Red meat: beef-mince, beef-steak, beef-stew-meat, lamb-mince, lamb-stew-meat, sucuk. Chicken: chicken-breast, chicken-thigh, sliced-chicken.
- vegetarian / "no meat": every meat id and every fish id. Pescatarian: every meat id. Vegan: every meat, fish and dairy-eggs id, plus mayonnaise and honey.
- nuts: almond, walnut, peanut-butter.
- dairy / lactose: butter, cooking-cream, cottage-cheese, feta, gouda, greek-yogurt, kashk, milk, mozzarella, parmesan, yogurt.
- eggs: egg, mayonnaise.
- gluten / wheat: bread-roll, breadcrumb, bulgur, burger-bun, couscous, egg-noodle, flatbread, flour, macaroni, oatmeal, reshteh, spaghetti, tortilla-wrap, wholegrain-bread, soy-sauce, teriyaki-sauce.
- soy: tofu, edamame, soy-sauce, teriyaki-sauce.
- sesame: sesame-seed, sesame-oil.
- spicy: green-chilli, chilli-flake, sriracha.
- pork: no ids contain pork, so "no pork" or "halal" adds nothing.

# Vague wishes for wantMore (use exactly these)

- "light", "healthy", "fresh", "not heavy": salad-mix, lettuce, cucumber, tomato, chicken-breast.
- "more veg", "lots of vegetables": broccoli, spinach, courgette, bell-pepper, carrot, green-bean.
- "more protein": chicken-breast, egg, greek-yogurt, red-lentil, chickpea.
- "pasta": spaghetti, macaroni. "rice": basmati-rice, jasmine-rice.
- "more chicken" (or fish, red meat…): the complete group from the food groups above. "meat" on its own: the red meat group.
- Other moods ("comfort food", "something warm") add nothing.

# Rules

- Use only ids from the lists below. Never invent ids.
- Only use what the user actually said. Don't guess; an empty field is fine.
- "Less X" or "not too much X" is not avoid: write a note instead.
- An id can't be in both wantMore and avoid; avoid wins.

# Examples

Text:
Ingredients going off soon: 2 peppers and some feta
Food I feel like: turkish, allergic to sesame
Cooking effort: super quick, 15 min max
A dish I really want: manti
Call:
{"expiring":["bell-pepper","feta"],"wantMore":[],"avoid":["sesame-seed","sesame-oil"],"cuisines":["turkish"],"easyOnly":true,"maxPrepMinutes":15,"mustHaveMealId":"manti","mustHaveText":"manti","notes":[]}

Text:
Food I feel like: vegan this week, thai or mexican
Cooking effort: I love cooking, all the time in the world
A dish I really want: that sticky sesame tofu thing
Call:
{"expiring":[],"wantMore":[],"avoid":["beef-mince","beef-steak","beef-stew-meat","chicken-breast","chicken-thigh","lamb-mince","lamb-stew-meat","sliced-chicken","sucuk","turkey-breast","turkey-ham","cod-fillet","pangasius-fillet","salmon-fillet","shrimp","tinned-tuna","butter","cooking-cream","cottage-cheese","egg","feta","gouda","greek-yogurt","kashk","milk","mozzarella","parmesan","yogurt","mayonnaise","honey"],"cuisines":["asian"],"easyOnly":false,"maxPrepMinutes":null,"mustHaveMealId":"sesame-tofu-rice-bowl","mustHaveText":"sticky sesame tofu","notes":["Would also like Mexican food, which isn't one of our cuisines."]}

Text:
Ingredients going off soon: half a cucumber, few potatoes, milk
Food I feel like: more veggies, not too much meat
Cooking effort: weekdays 30 min max, saturday I cook for friends
A dish I really want: hutspot
Call:
{"expiring":["cucumber","potato","milk"],"wantMore":["broccoli","spinach","courgette","bell-pepper","carrot","green-bean"],"avoid":[],"cuisines":[],"easyOnly":false,"maxPrepMinutes":30,"mustHaveMealId":"hutspot-steak","mustHaveText":"hutspot","notes":["Not too much meat.","Cooking for friends on Saturday."]}

Text:
Food I feel like: dunno, surprise me
A dish I really want: pad thai
Call:
{"expiring":[],"wantMore":[],"avoid":[],"cuisines":[],"easyOnly":false,"maxPrepMinutes":null,"mustHaveMealId":null,"mustHaveText":"pad thai","notes":[]}

# Ingredient ids by category

${Object.entries(INGREDIENTS_BY_CATEGORY)
  .map(([category, ids]) => `${category}: ${ids.split(' ').join(', ')}`)
  .join('\n')}

# Cuisine ids

${CUISINES.join(', ')}

# Meal catalogue (id: name [cuisine])

${meals.map((meal) => `${meal.id}: ${meal.name} [${meal.cuisine}]`).join('\n')}`

const idList = (description) => ({ type: 'array', items: { type: 'string' }, description })

const TOOL = {
  toolSpec: {
    name: TOOL_NAME,
    description: 'Save what the user wants for their week of meals.',
    inputSchema: {
      json: {
        type: 'object',
        properties: {
          expiring: idList('Ingredient ids the user has that are going off soon.'),
          wantMore: idList('Ingredient ids they would like more of.'),
          avoid: idList('Ingredient ids to leave out. Complete for food groups.'),
          cuisines: idList('Cuisine ids they named or clearly implied.'),
          easyOnly: { type: 'boolean', description: 'True if they want easy or quick meals.' },
          maxPrepMinutes: {
            type: ['integer', 'null'],
            description: 'Time limit in minutes, or null.',
          },
          mustHaveMealId: {
            type: ['string', 'null'],
            description: 'Catalogue meal id of the dish they want, or null.',
          },
          mustHaveText: {
            type: ['string', 'null'],
            description: "The dish in the user's words, or null.",
          },
          notes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Up to 3 short sentences.',
          },
        },
        required: [
          'expiring',
          'wantMore',
          'avoid',
          'cuisines',
          'easyOnly',
          'maxPrepMinutes',
          'mustHaveMealId',
          'mustHaveText',
          'notes',
        ],
      },
    },
  },
}

// Built once per Lambda instance, then reused by every call it handles.
let catalogue

function getCatalogue() {
  catalogue ??= loadMeals().then(buildCatalogue).catch(forgetFailedCatalogue)
  return catalogue
}

function buildCatalogue(meals) {
  // Sorted so the prompt stays the same text between instances (needed for prompt caching).
  const sorted = meals.toSorted((a, b) => a.id.localeCompare(b.id))
  return {
    system: buildSystem(sorted),
    mealNames: new Map(sorted.map((meal) => [meal.id, meal.name])),
  }
}

function forgetFailedCatalogue(error) {
  catalogue = undefined
  throw error
}

export async function understand(text, { onUsage } = {}) {
  const { system, mealNames } = await getCatalogue()
  const response = await bedrock.send(
    new ConverseCommand({
      modelId: MODEL_ID,
      system: [{ text: system }],
      messages: [{ role: 'user', content: [{ text }] }],
      toolConfig: { tools: [TOOL], toolChoice: { tool: { name: TOOL_NAME } } },
      inferenceConfig: { maxTokens: 1024, temperature: 0 },
    }),
  )
  console.log('bedrock usage', JSON.stringify(response.usage))
  onUsage?.(response.usage)
  if (response.stopReason === 'max_tokens') console.warn('bedrock output cut off at maxTokens')
  const input =
    response.output?.message?.content?.find((block) => block.toolUse)?.toolUse?.input ?? {}
  return clean(input, mealNames)
}

/** Checks answers sent by the app (the user may have edited them) the same way as the AI's. */
export async function checkAnswers(input) {
  const { mealNames } = await getCatalogue()
  return clean(input, mealNames)
}

function ids(value, allowed) {
  if (!Array.isArray(value)) return []
  const valid = value
    .filter((id) => typeof id === 'string')
    .map((id) => id.trim().toLowerCase())
    .filter((id) => allowed.has(id))
  return [...new Set(valid)]
}

function shortText(value) {
  if (typeof value !== 'string') return null
  const text = value.trim().slice(0, 100)
  return text || null
}

function minutes(value) {
  const number = typeof value === 'string' && value.trim() ? Number(value) : value
  if (typeof number !== 'number' || !Number.isFinite(number)) return null
  return Math.min(240, Math.max(5, Math.round(number)))
}

export function clean(input, mealNames) {
  const expiring = ids(input.expiring, INGREDIENT_IDS)
  const avoid = ids(input.avoid, INGREDIENT_IDS)
  const wantMore = ids(input.wantMore, INGREDIENT_IDS).filter(
    (id) => !avoid.includes(id) && !expiring.includes(id),
  )
  const mustHaveMealId =
    typeof input.mustHaveMealId === 'string' && mealNames.has(input.mustHaveMealId.trim())
      ? input.mustHaveMealId.trim()
      : null
  const notes = Array.isArray(input.notes)
    ? input.notes.map(shortText).filter(Boolean).slice(0, 3)
    : []

  return {
    expiring,
    wantMore,
    avoid,
    cuisines: ids(input.cuisines, CUISINE_IDS),
    easyOnly: input.easyOnly === true,
    maxPrepMinutes: minutes(input.maxPrepMinutes),
    mustHaveMealId,
    mustHaveText:
      shortText(input.mustHaveText) ?? (mustHaveMealId && mealNames.get(mustHaveMealId)),
    notes,
  }
}
