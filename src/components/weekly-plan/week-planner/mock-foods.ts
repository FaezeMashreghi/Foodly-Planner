import type { Food } from '@shared/food/food'

// Temporary: replaced by suggestions from the backend. Emoji SVGs stand in for food photos.
function emojiImage(emoji: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#eef4e2"/><text x="24" y="33" font-size="26" text-anchor="middle">${emoji}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const MOCK_FOODS: Food[] = [
  {
    id: 'porridge',
    title: 'Berry porridge',
    description: 'Oats cooked in milk, topped with berries and honey',
    imageUrl: emojiImage('🥣'),
  },
  {
    id: 'avocado-toast',
    title: 'Avocado toast',
    description: 'Sourdough with smashed avocado, lemon and chilli flakes',
    imageUrl: emojiImage('🥑'),
  },
  {
    id: 'pancakes',
    title: 'Pancakes',
    description: 'Fluffy pancakes with maple syrup and banana',
    imageUrl: emojiImage('🥞'),
  },
  {
    id: 'greek-salad',
    title: 'Greek salad',
    description: 'Tomato, cucumber, olives and feta with olive oil',
    imageUrl: emojiImage('🥗'),
  },
  {
    id: 'chicken-wrap',
    title: 'Chicken wrap',
    description: 'Grilled chicken, lettuce and yoghurt sauce in a tortilla',
    imageUrl: emojiImage('🌯'),
  },
  {
    id: 'tomato-soup',
    title: 'Tomato soup',
    description: 'Roasted tomato and basil soup with crusty bread',
    imageUrl: emojiImage('🍅'),
  },
  {
    id: 'spaghetti',
    title: 'Spaghetti bolognese',
    description: 'Slow-cooked beef and tomato sauce over spaghetti',
    imageUrl: emojiImage('🍝'),
  },
  {
    id: 'salmon-rice',
    title: 'Salmon and rice',
    description: 'Baked salmon with rice and steamed greens',
    imageUrl: emojiImage('🐟'),
  },
  {
    id: 'vegetable-curry',
    title: 'Vegetable curry',
    description: 'Chickpea and vegetable curry with coconut milk',
    imageUrl: emojiImage('🍛'),
  },
  {
    id: 'mushroom-risotto',
    title: 'Mushroom risotto',
    description: 'Creamy risotto with mushrooms and parmesan',
    imageUrl: emojiImage('🍄'),
  },
]
