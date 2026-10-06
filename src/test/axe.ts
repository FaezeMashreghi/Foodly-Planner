import axe from 'axe-core'
import { expect } from 'vitest'

const COMPONENT_TEST_RULES = {
  // jsdom doesn't paint the page, so colors can't be measured here.
  'color-contrast': { enabled: false },
  // A component tested on its own isn't inside the page's <main> or other landmarks.
  region: { enabled: false },
}

/**
 * Runs axe on what a component rendered and fails with one readable line per problem
 * (rule, what's wrong, which elements). Pass `baseElement` for content portaled to <body>.
 */
export async function expectNoAxeViolations(element: Element) {
  const { violations } = await axe.run(element, { rules: COMPONENT_TEST_RULES })
  expect(violations.map(describeViolation)).toEqual([])
}

function describeViolation(violation: axe.Result) {
  const elements = violation.nodes.map((node) => node.target.join(' ')).join(', ')
  return `${violation.id}: ${violation.help} → ${elements}`
}
