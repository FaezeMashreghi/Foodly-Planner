import { describe, expect, it } from 'vitest'
import { getYoutubeSearchUrl } from './youtube'

describe('getYoutubeSearchUrl', () => {
  it('links to the search results for the query', () => {
    expect(getYoutubeSearchUrl('Ghormeh sabzi recipe')).toBe(
      'https://www.youtube.com/results?search_query=Ghormeh%20sabzi%20recipe',
    )
  })

  it('encodes characters that have a meaning in a URL', () => {
    expect(getYoutubeSearchUrl('mac & cheese?')).toBe(
      'https://www.youtube.com/results?search_query=mac%20%26%20cheese%3F',
    )
  })
})
