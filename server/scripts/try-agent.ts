// Chat with the agent in the terminal: real Bedrock, real meals and catalogue. Empty line to quit.
//   AWS_PROFILE=foodly AWS_REGION=eu-west-2 npx tsx --tsconfig tsconfig.node.json server/scripts/try-agent.ts
import { createInterface } from 'node:readline/promises'
import type { Message } from '@aws-sdk/client-bedrock-runtime'
import { runTurn, type RunTool } from '@server/lambda/agent/loop.ts'
import { bedrockModel } from '@server/lambda/agent/model.ts'
import { loadCatalog } from '@server/lambda/data/catalog.ts'
import { loadMeals } from '@server/lambda/data/meals.ts'
import {
  knownIdsFrom,
  runSearchMeals,
  SEARCH_MEALS,
  searchMealsTool,
} from '@server/lambda/suggest/search-tool.ts'

const SYSTEM = `You help a user plan their meals for the coming week.
Ask ONE short question at a time, only about what you still need: allergies, how much time they have, what they feel like.
Ask at most 4 questions. When you know enough, call search_meals and suggest 3 meals from its results, one line each.
Only suggest meals that search_meals returned. Describe a meal only with what search_meals returned (its name, time and ingredients): never add an ingredient it doesn't list.
Only say a meal uses up an ingredient if it is in that meal's usesWanted. If no suggested meal uses it, say so.
Write plain text, no Markdown.`

const [meals, catalog] = await Promise.all([loadMeals(), loadCatalog()])
const known = knownIdsFrom(catalog, meals)

const runTool: RunTool = async (name, input) => {
  console.log(`  [tool] ${name} ${JSON.stringify(input)}`)
  if (name === SEARCH_MEALS) {
    const result = runSearchMeals(input, meals, known)
    console.log(`  [tool] → ${result.meals.map((found) => found.id).join(', ') || 'no meals'}`)
    return result
  }
  throw new Error(`Unknown tool: ${name}`)
}

const terminal = createInterface({ input: process.stdin, output: process.stdout })
const callModel = bedrockModel(SYSTEM, [searchMealsTool(known)])
let messages: Message[] = []

while (true) {
  const text = await terminal.question('you: ')
  if (!text) break
  messages = await runTurn([...messages, { role: 'user', content: [{ text }] }], {
    callModel,
    runTool,
  })
  const reply = messages
    .at(-1)
    ?.content?.map((block) => block.text ?? '')
    .join('')
  console.log(`agent: ${reply}\n`)
}
terminal.close()
