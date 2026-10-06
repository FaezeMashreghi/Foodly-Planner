import { useState } from 'react'

export type SlideDirection = 'next' | 'back'

export function useSlideDirection(index: number): SlideDirection {
  const [shownIndex, setShownIndex] = useState(index)
  const [direction, setDirection] = useState<SlideDirection>('next')

  if (index !== shownIndex) {
    setShownIndex(index)
    setDirection(index > shownIndex ? 'next' : 'back')
  }

  return direction
}
