// Runs every test case against the real model and scores the result field by field.
//   AWS_PROFILE=foodly AWS_REGION=eu-west-2 node eval.mjs
//   MODEL_ID=<another model id> ... node eval.mjs    compare models
//   ... node eval.mjs lentil                          only cases whose name contains "lentil"
import { readFile } from 'node:fs/promises'
import { MODEL_ID, understand } from './understand.mjs'

const SET_FIELDS = ['expiring', 'wantMore', 'avoid', 'cuisines']
const EXACT_FIELDS = ['easyOnly', 'maxPrepMinutes', 'mustHaveMealId']
const FIELDS = [...SET_FIELDS, ...EXACT_FIELDS, 'mustHaveText', 'notes']

const allCases = JSON.parse(await readFile(new URL('./test-cases.json', import.meta.url), 'utf8'))
const filter = process.argv[2]
const cases = filter ? allCases.filter((test) => test.name.includes(filter)) : allCases

function compare(field, expected, actual) {
  if (SET_FIELDS.includes(field)) {
    const missing = expected.filter((id) => !actual.includes(id))
    const extra = actual.filter((id) => !expected.includes(id))
    const detail = [
      missing.length && `missing ${missing.join(', ')}`,
      extra.length && `extra ${extra.join(', ')}`,
    ]
    return { ok: !missing.length && !extra.length, detail: detail.filter(Boolean).join('; ') }
  }
  // Free text can't match word for word: only check that it's there when it should be.
  if (field === 'mustHaveText') {
    return { ok: (expected === null) === (actual === null), detail: JSON.stringify(actual) }
  }
  if (field === 'notes') {
    return { ok: expected.length === actual.length, detail: JSON.stringify(actual) }
  }
  return { ok: expected === actual, detail: `expected ${expected}, got ${actual}` }
}

const usage = { inputTokens: 0, outputTokens: 0 }
const fieldHits = Object.fromEntries(FIELDS.map((field) => [field, 0]))
let totalHits = 0
let failedCalls = 0
const started = Date.now()

console.log(`Model: ${MODEL_ID}\nCases: ${cases.length}\n`)

for (const test of cases) {
  console.log(`— ${test.name}`)
  let actual
  try {
    actual = await understand(test.input, {
      onUsage: (u) => {
        usage.inputTokens += u?.inputTokens ?? 0
        usage.outputTokens += u?.outputTokens ?? 0
      },
    })
  } catch (error) {
    failedCalls++
    console.log(`  ✗ call failed: ${error.name}: ${error.message}\n`)
    continue
  }

  let hits = 0
  for (const field of FIELDS) {
    const { ok, detail } = compare(field, test.expected[field], actual[field])
    if (ok) hits++
    if (ok) fieldHits[field]++
    const showDetail = !ok || field === 'notes' || field === 'mustHaveText'
    console.log(
      `  ${ok ? '✓' : '✗'} ${field.padEnd(15)}${showDetail && detail ? ` ${detail}` : ''}`,
    )
  }
  totalHits += hits
  console.log(`  score ${hits}/${FIELDS.length}\n`)
}

const possible = cases.length * FIELDS.length
console.log('Per field:')
for (const field of FIELDS) console.log(`  ${field.padEnd(15)} ${fieldHits[field]}/${cases.length}`)
console.log(`\nTotal: ${totalHits}/${possible} (${Math.round((totalHits / possible) * 100)}%)`)
if (failedCalls) console.log(`Failed calls: ${failedCalls}`)
console.log(`Tokens: ${usage.inputTokens} in, ${usage.outputTokens} out`)
console.log(`Time: ${((Date.now() - started) / 1000).toFixed(1)}s`)
