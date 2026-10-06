import { describe, expect, it } from 'vitest'
import { getCuisineName } from './cuisines'

describe('getCuisineName', () => {
  it('returns the name of a cuisine', () => {
    expect(getCuisineName('persian')).toBe('Persian')
  })

  it('returns the id itself for a cuisine we do not know', () => {
    expect(getCuisineName('mexican')).toBe('mexican')
  })
})
