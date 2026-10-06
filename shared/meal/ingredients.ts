import type { Ingredient } from './meal'

export type Unit = 'g' | 'ml' | 'piece'

export const INGREDIENT_CATEGORIES = [
  'vegetable',
  'fruit',
  'meat',
  'fish',
  'dairy-eggs',
  'grain',
  'legume',
  'herb-spice',
  'sauce-condiment',
  'other',
] as const

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number]

export type IngredientInfo = {
  id: string
  name: string
  category: IngredientCategory
  unit: Unit
  /** Only when a fitting emoji exists; no emoji is better than a misleading one. */
  emoji?: string
}

export const INGREDIENTS = [
  // vegetable
  { id: 'aubergine', name: 'Aubergine', category: 'vegetable', unit: 'piece', emoji: '🍆' },
  { id: 'bell-pepper', name: 'Bell pepper', category: 'vegetable', unit: 'piece', emoji: '🫑' },
  { id: 'broccoli', name: 'Broccoli', category: 'vegetable', unit: 'g', emoji: '🥦' },
  { id: 'carrot', name: 'Carrot', category: 'vegetable', unit: 'piece', emoji: '🥕' },
  { id: 'cherry-tomato', name: 'Cherry tomato', category: 'vegetable', unit: 'g', emoji: '🍅' },
  { id: 'courgette', name: 'Courgette', category: 'vegetable', unit: 'piece' },
  { id: 'cucumber', name: 'Cucumber', category: 'vegetable', unit: 'piece', emoji: '🥒' },
  { id: 'edamame', name: 'Edamame', category: 'vegetable', unit: 'g', emoji: '🫛' },
  { id: 'garlic', name: 'Garlic', category: 'vegetable', unit: 'piece', emoji: '🧄' },
  { id: 'green-bean', name: 'Green bean', category: 'vegetable', unit: 'g' },
  { id: 'green-chilli', name: 'Green chilli', category: 'vegetable', unit: 'piece', emoji: '🌶️' },
  { id: 'green-pea', name: 'Green pea', category: 'vegetable', unit: 'g', emoji: '🫛' },
  { id: 'lettuce', name: 'Lettuce', category: 'vegetable', unit: 'piece', emoji: '🥬' },
  { id: 'mushroom', name: 'Mushroom', category: 'vegetable', unit: 'g', emoji: '🍄' },
  { id: 'onion', name: 'Onion', category: 'vegetable', unit: 'piece', emoji: '🧅' },
  { id: 'potato', name: 'Potato', category: 'vegetable', unit: 'g', emoji: '🥔' },
  { id: 'red-cabbage', name: 'Red cabbage', category: 'vegetable', unit: 'g' },
  { id: 'red-onion', name: 'Red onion', category: 'vegetable', unit: 'piece', emoji: '🧅' },
  { id: 'salad-mix', name: 'Salad mix', category: 'vegetable', unit: 'g', emoji: '🥗' },
  { id: 'spinach', name: 'Spinach', category: 'vegetable', unit: 'g', emoji: '🥬' },
  { id: 'spring-onion', name: 'Spring onion', category: 'vegetable', unit: 'piece' },
  { id: 'sweet-corn', name: 'Sweet corn', category: 'vegetable', unit: 'g', emoji: '🌽' },
  { id: 'sweet-potato', name: 'Sweet potato', category: 'vegetable', unit: 'g', emoji: '🍠' },
  { id: 'tinned-tomato', name: 'Tinned tomato', category: 'vegetable', unit: 'g', emoji: '🥫' },
  { id: 'tomato', name: 'Tomato', category: 'vegetable', unit: 'piece', emoji: '🍅' },

  // fruit
  { id: 'apple', name: 'Apple', category: 'fruit', unit: 'piece', emoji: '🍎' },
  { id: 'avocado', name: 'Avocado', category: 'fruit', unit: 'piece', emoji: '🥑' },
  { id: 'banana', name: 'Banana', category: 'fruit', unit: 'piece', emoji: '🍌' },
  { id: 'blueberry', name: 'Blueberry', category: 'fruit', unit: 'g', emoji: '🫐' },
  { id: 'date', name: 'Date', category: 'fruit', unit: 'piece' },
  { id: 'lemon', name: 'Lemon', category: 'fruit', unit: 'piece', emoji: '🍋' },
  { id: 'lime', name: 'Lime', category: 'fruit', unit: 'piece' },
  { id: 'orange', name: 'Orange', category: 'fruit', unit: 'piece', emoji: '🍊' },
  { id: 'pomegranate', name: 'Pomegranate', category: 'fruit', unit: 'piece' },
  { id: 'raisin', name: 'Raisin', category: 'fruit', unit: 'g' },
  { id: 'strawberry', name: 'Strawberry', category: 'fruit', unit: 'g', emoji: '🍓' },

  // meat
  { id: 'beef-mince', name: 'Beef mince', category: 'meat', unit: 'g', emoji: '🥩' },
  { id: 'beef-steak', name: 'Beef steak', category: 'meat', unit: 'g', emoji: '🥩' },
  { id: 'beef-stew-meat', name: 'Beef stew meat', category: 'meat', unit: 'g', emoji: '🥩' },
  { id: 'chicken-breast', name: 'Chicken breast', category: 'meat', unit: 'g', emoji: '🍗' },
  { id: 'chicken-thigh', name: 'Chicken thigh', category: 'meat', unit: 'g', emoji: '🍗' },
  { id: 'lamb-mince', name: 'Lamb mince', category: 'meat', unit: 'g', emoji: '🥩' },
  { id: 'lamb-stew-meat', name: 'Lamb stew meat', category: 'meat', unit: 'g', emoji: '🥩' },
  { id: 'sliced-chicken', name: 'Sliced chicken', category: 'meat', unit: 'g', emoji: '🍗' },
  { id: 'sucuk', name: 'Sucuk', category: 'meat', unit: 'g' },
  { id: 'turkey-breast', name: 'Turkey breast', category: 'meat', unit: 'g', emoji: '🍗' },
  { id: 'turkey-ham', name: 'Turkey ham', category: 'meat', unit: 'g' },

  // fish
  { id: 'cod-fillet', name: 'Cod fillet', category: 'fish', unit: 'g', emoji: '🐟' },
  { id: 'pangasius-fillet', name: 'Pangasius fillet', category: 'fish', unit: 'g', emoji: '🐟' },
  { id: 'salmon-fillet', name: 'Salmon fillet', category: 'fish', unit: 'g', emoji: '🐟' },
  { id: 'shrimp', name: 'Shrimp', category: 'fish', unit: 'g', emoji: '🦐' },
  { id: 'tinned-tuna', name: 'Tinned tuna', category: 'fish', unit: 'g', emoji: '🐟' },

  // dairy-eggs
  { id: 'butter', name: 'Butter', category: 'dairy-eggs', unit: 'g', emoji: '🧈' },
  { id: 'cooking-cream', name: 'Cooking cream', category: 'dairy-eggs', unit: 'ml', emoji: '🥛' },
  { id: 'cottage-cheese', name: 'Cottage cheese', category: 'dairy-eggs', unit: 'g', emoji: '🧀' },
  { id: 'egg', name: 'Egg', category: 'dairy-eggs', unit: 'piece', emoji: '🥚' },
  { id: 'feta', name: 'Feta', category: 'dairy-eggs', unit: 'g', emoji: '🧀' },
  { id: 'gouda', name: 'Gouda', category: 'dairy-eggs', unit: 'g', emoji: '🧀' },
  { id: 'greek-yogurt', name: 'Greek yogurt', category: 'dairy-eggs', unit: 'g' },
  { id: 'kashk', name: 'Kashk', category: 'dairy-eggs', unit: 'ml' },
  { id: 'milk', name: 'Milk', category: 'dairy-eggs', unit: 'ml', emoji: '🥛' },
  { id: 'mozzarella', name: 'Mozzarella', category: 'dairy-eggs', unit: 'g', emoji: '🧀' },
  { id: 'parmesan', name: 'Parmesan', category: 'dairy-eggs', unit: 'g', emoji: '🧀' },
  { id: 'yogurt', name: 'Yogurt', category: 'dairy-eggs', unit: 'g' },

  // grain
  { id: 'basmati-rice', name: 'Basmati rice', category: 'grain', unit: 'g', emoji: '🍚' },
  { id: 'bread-roll', name: 'Bread roll', category: 'grain', unit: 'piece', emoji: '🍞' },
  { id: 'breadcrumb', name: 'Breadcrumb', category: 'grain', unit: 'g', emoji: '🍞' },
  { id: 'bulgur', name: 'Bulgur', category: 'grain', unit: 'g', emoji: '🌾' },
  { id: 'burger-bun', name: 'Burger bun', category: 'grain', unit: 'piece', emoji: '🍞' },
  { id: 'couscous', name: 'Couscous', category: 'grain', unit: 'g', emoji: '🌾' },
  { id: 'egg-noodle', name: 'Egg noodle', category: 'grain', unit: 'g', emoji: '🍜' },
  { id: 'flatbread', name: 'Flatbread', category: 'grain', unit: 'piece', emoji: '🫓' },
  { id: 'flour', name: 'Flour', category: 'grain', unit: 'g', emoji: '🌾' },
  { id: 'jasmine-rice', name: 'Jasmine rice', category: 'grain', unit: 'g', emoji: '🍚' },
  { id: 'macaroni', name: 'Macaroni', category: 'grain', unit: 'g', emoji: '🍝' },
  { id: 'oatmeal', name: 'Oatmeal', category: 'grain', unit: 'g', emoji: '🥣' },
  { id: 'reshteh', name: 'Reshteh', category: 'grain', unit: 'g', emoji: '🍜' },
  { id: 'spaghetti', name: 'Spaghetti', category: 'grain', unit: 'g', emoji: '🍝' },
  { id: 'tortilla-wrap', name: 'Tortilla wrap', category: 'grain', unit: 'piece', emoji: '🫓' },
  {
    id: 'wholegrain-bread',
    name: 'Wholegrain bread (slice)',
    category: 'grain',
    unit: 'piece',
    emoji: '🍞',
  },

  // legume
  { id: 'black-bean', name: 'Black bean', category: 'legume', unit: 'g', emoji: '🫘' },
  { id: 'chickpea', name: 'Chickpea', category: 'legume', unit: 'g', emoji: '🫘' },
  { id: 'green-lentil', name: 'Green lentil', category: 'legume', unit: 'g', emoji: '🫘' },
  { id: 'kidney-bean', name: 'Kidney bean', category: 'legume', unit: 'g', emoji: '🫘' },
  { id: 'red-lentil', name: 'Red lentil', category: 'legume', unit: 'g', emoji: '🫘' },
  { id: 'tofu', name: 'Tofu', category: 'legume', unit: 'g' },
  { id: 'yellow-split-pea', name: 'Yellow split pea', category: 'legume', unit: 'g', emoji: '🫘' },

  // herb-spice
  { id: 'advieh', name: 'Advieh', category: 'herb-spice', unit: 'g' },
  { id: 'black-pepper', name: 'Black pepper', category: 'herb-spice', unit: 'g' },
  { id: 'chilli-flake', name: 'Chilli flakes', category: 'herb-spice', unit: 'g', emoji: '🌶️' },
  { id: 'chive', name: 'Chives', category: 'herb-spice', unit: 'g', emoji: '🌿' },
  { id: 'cinnamon', name: 'Cinnamon', category: 'herb-spice', unit: 'g' },
  { id: 'cumin', name: 'Cumin', category: 'herb-spice', unit: 'g' },
  { id: 'curry-powder', name: 'Curry powder', category: 'herb-spice', unit: 'g' },
  { id: 'dill', name: 'Dill', category: 'herb-spice', unit: 'g', emoji: '🌿' },
  {
    id: 'dried-fenugreek',
    name: 'Dried fenugreek',
    category: 'herb-spice',
    unit: 'g',
    emoji: '🌿',
  },
  { id: 'dried-lime', name: 'Dried lime', category: 'herb-spice', unit: 'piece' },
  { id: 'dried-mint', name: 'Dried mint', category: 'herb-spice', unit: 'g', emoji: '🌿' },
  {
    id: 'fresh-coriander',
    name: 'Fresh coriander',
    category: 'herb-spice',
    unit: 'g',
    emoji: '🌿',
  },
  { id: 'ginger', name: 'Ginger', category: 'herb-spice', unit: 'g', emoji: '🫚' },
  { id: 'oregano', name: 'Oregano', category: 'herb-spice', unit: 'g', emoji: '🌿' },
  { id: 'paprika', name: 'Paprika', category: 'herb-spice', unit: 'g' },
  { id: 'parsley', name: 'Parsley', category: 'herb-spice', unit: 'g', emoji: '🌿' },
  { id: 'saffron', name: 'Saffron', category: 'herb-spice', unit: 'g' },
  { id: 'salt', name: 'Salt', category: 'herb-spice', unit: 'g', emoji: '🧂' },
  { id: 'sumac', name: 'Sumac', category: 'herb-spice', unit: 'g' },
  { id: 'taco-seasoning', name: 'Taco seasoning', category: 'herb-spice', unit: 'g' },
  { id: 'turmeric', name: 'Turmeric', category: 'herb-spice', unit: 'g' },

  // sauce-condiment
  { id: 'honey', name: 'Honey', category: 'sauce-condiment', unit: 'g', emoji: '🍯' },
  { id: 'ketchup', name: 'Ketchup', category: 'sauce-condiment', unit: 'g' },
  { id: 'mayonnaise', name: 'Mayonnaise', category: 'sauce-condiment', unit: 'g' },
  { id: 'mustard', name: 'Mustard', category: 'sauce-condiment', unit: 'g' },
  { id: 'olive-oil', name: 'Olive oil', category: 'sauce-condiment', unit: 'ml', emoji: '🫒' },
  {
    id: 'peanut-butter',
    name: 'Peanut butter',
    category: 'sauce-condiment',
    unit: 'g',
    emoji: '🥜',
  },
  { id: 'salsa', name: 'Salsa', category: 'sauce-condiment', unit: 'g' },
  { id: 'sesame-oil', name: 'Sesame oil', category: 'sauce-condiment', unit: 'ml' },
  { id: 'soy-sauce', name: 'Soy sauce', category: 'sauce-condiment', unit: 'ml' },
  { id: 'sriracha', name: 'Sriracha', category: 'sauce-condiment', unit: 'ml' },
  { id: 'teriyaki-sauce', name: 'Teriyaki sauce', category: 'sauce-condiment', unit: 'ml' },
  { id: 'tomato-paste', name: 'Tomato paste', category: 'sauce-condiment', unit: 'g', emoji: '🥫' },
  { id: 'vegetable-oil', name: 'Vegetable oil', category: 'sauce-condiment', unit: 'ml' },

  // other
  { id: 'almond', name: 'Almond', category: 'other', unit: 'g' },
  { id: 'chia-seed', name: 'Chia seed', category: 'other', unit: 'g' },
  { id: 'coconut-milk', name: 'Coconut milk', category: 'other', unit: 'ml', emoji: '🥥' },
  { id: 'jam', name: 'Jam', category: 'other', unit: 'g' },
  { id: 'sesame-seed', name: 'Sesame seed', category: 'other', unit: 'g' },
  { id: 'stock-cube', name: 'Stock cube', category: 'other', unit: 'piece' },
  { id: 'sugar', name: 'Sugar', category: 'other', unit: 'g' },
  { id: 'walnut', name: 'Walnut', category: 'other', unit: 'g' },
] as const satisfies readonly IngredientInfo[]

export type IngredientId = (typeof INGREDIENTS)[number]['id']

const ingredientById = new Map<string, IngredientInfo>(INGREDIENTS.map((item) => [item.id, item]))

/** The ingredient with this id, or undefined for an id we don't know. */
export function getIngredient(id: string): IngredientInfo | undefined {
  return ingredientById.get(id)
}

/** "300 g Beef stew meat", or "3 × Dried lime" for pieces. Falls back to the id for an unknown ingredient. */
export function formatIngredient({ ingredientId, amount, unit }: Ingredient): string {
  const name = getIngredient(ingredientId)?.name ?? ingredientId
  return unit === 'piece' ? `${amount} × ${name}` : `${amount} ${unit} ${name}`
}
