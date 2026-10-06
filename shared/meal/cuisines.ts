export const CUISINES = [
  { id: 'persian', name: 'Persian' },
  { id: 'turkish', name: 'Turkish' },
  { id: 'dutch', name: 'Dutch' },
  { id: 'asian', name: 'Asian' },
  { id: 'international', name: 'International (fast & healthy)' },
] as const

export type CuisineId = (typeof CUISINES)[number]['id']

const cuisineNameById = new Map<string, string>(
  CUISINES.map((cuisine) => [cuisine.id, cuisine.name]),
)

/** The cuisine's name, e.g. "persian" → "Persian"; the id itself for an id we don't know. */
export function getCuisineName(id: string): string {
  return cuisineNameById.get(id) ?? id
}
