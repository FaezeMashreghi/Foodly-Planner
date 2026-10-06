export type PlanQuestion = {
  id: 'expiring' | 'cravings' | 'effort' | 'mustHave'
  text: string
  hint: string
  topic: string
}

export const PLAN_QUESTIONS: readonly PlanQuestion[] = [
  {
    id: 'expiring',
    text: 'Which ingredients do you have that are going off soon?',
    hint: 'For example: spinach, 2 tomatoes, half a pot of yogurt',
    topic: 'Ingredients going off soon',
  },
  {
    id: 'cravings',
    text: 'What kind of food do you feel like this week?',
    hint: 'For example: Persian, something light, lots of vegetables',
    topic: 'Food I feel like',
  },
  {
    id: 'effort',
    text: 'How much time do you want to spend cooking?',
    hint: 'For example: quick and easy on weekdays, more on Sunday',
    topic: 'Cooking effort',
  },
  {
    id: 'mustHave',
    text: "Is there one dish you'd really love to have this week?",
    hint: 'For example: ghormeh sabzi. Leave it empty if nothing comes to mind',
    topic: 'A dish I really want',
  },
]

export type PlanAnswersText = Partial<Record<PlanQuestion['id'], string>>

/** All answers as one text, so the AI understands them in a single call. Empty answers are left out. */
export function answersToText(answers: PlanAnswersText): string {
  return PLAN_QUESTIONS.filter((question) => answers[question.id]?.trim())
    .map((question) => `${question.topic}: ${answers[question.id]!.trim()}`)
    .join('\n')
}
