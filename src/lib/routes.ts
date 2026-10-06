import type { FileRoutesByTo } from '@/routeTree.gen'

/**
 * Every page's URL, written once. Use these instead of path strings in `<Link to>`,
 * `navigate` and `redirect`. `satisfies` checks each path exists in the router.
 */
export const ROUTES = {
  home: '/',
  weeklyPlan: '/weekly-plan',
  planQuestions: '/plan-questions',
  signIn: '/sign-in',
  signUp: '/sign-up',
  confirmEmail: '/confirm-email',
  forgotPassword: '/forgot-password',
} as const satisfies Record<string, keyof FileRoutesByTo>

export const NAV_LINKS = [
  { to: ROUTES.weeklyPlan, label: 'Weekly plan' },
  { to: ROUTES.planQuestions, label: 'Plan with Foodly' },
] as const
