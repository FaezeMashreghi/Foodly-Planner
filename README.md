# Foodly Planner

A weekly meal planner. You tell Foodly in your own words what's in your fridge, what you feel like and how much time you have. An AI turns that into structured answers, the app suggests matching meals, and you drag them into the days of your week. Each meal has a recipe written by AI once and shared by everyone.

- **Live:** [main.d1wh7bghb5zvxn.amplifyapp.com](https://main.d1wh7bghb5zvxn.amplifyapp.com)
- **Demo account:** `demo@foodly.com` / `*Demo1234*` (no sign-up needed)
- **Meals follow my taste:** the catalogue of ~100 meals was built around what I like to cook, so suggestions lean towards Persian and Turkish dishes, with some international, Asian and Dutch ones.
- **Best on desktop:** the layout is responsive, but I've tested it mostly on desktop, and the mobile experience still needs polish.

<!-- TODO: screenshot or short GIF of the weekly planner -->

## Why I built it

- **"What should I eat?"** Deciding every day takes more energy than cooking. I wanted to answer a few questions once and get a week of meals I'd actually like.
- **Food going off in the fridge.** The first question is "What's going off soon?", and meals that use those ingredients come first.

It's also a personal challenge: to build one product end to end on my own, the way a team would, and write down every trade-off.

## What I'd like you to look at

I'm a frontend developer, so these are the parts I'm most proud of:

- **Accessible components without a library** ([`src/components/ui/`](src/components/ui/)): a native `<dialog>`, the WAI-ARIA tabs pattern, a GOV.UK-style password field, radio groups and form fields that link their hints and errors. Each component test file includes an axe check, and CI runs them as their own step. Also checked by hand with the keyboard and VoiceOver.
- **A small design system on Tailwind** ([`src/styles/`](src/styles/)): Tailwind's default palette is removed, so only our own tokens can be used, and every text color passes WCAG AA contrast.
- **Data loading with TanStack Router and Query** ([`src/api/foodly/`](src/api/foodly/)): route loaders fill the cache before a page shows (no blank page with a spinner), a dropped meal shows at once (if saving fails, the user is told and the plan is reloaded from the server), and suggestions are reloaded only when the answers change.
- **The plan questions flow** ([`plan-questions-flow/`](src/components/plan-questions/plan-questions-flow/)): one component owns the API calls, loading, errors and navigation, and the screens only take props. Each step has its own URL so the browser's Back button works, the answers survive a refresh, and focus moves to each new question.
- **The token manager** ([`session.ts`](src/api/auth/session.ts)): refreshes before the token expires, runs only one refresh at a time, retries a failed request once, and revokes the token on sign out.
- **Tests that act like a user** (Vitest, Testing Library, user-event): elements are found by role and label, and tests are written for the scenarios where a bug would leave a user stuck, not for coverage.

I also built the backend (AWS Lambda, DynamoDB, Bedrock for the AI, all in CDK) and the CI/CD pipeline myself.

## Tech stack

| Layer         | Choice                                                                |
| ------------- | --------------------------------------------------------------------- |
| Frontend      | React 19, TypeScript, Vite                                            |
| Routing, data | TanStack Router (file-based, typed) + TanStack Query                  |
| Styling       | Tailwind CSS v4 with my own design tokens                             |
| Drag and drop | dnd-kit                                                               |
| Auth          | Amazon Cognito with my own forms and token manager                    |
| Tests         | Vitest, Testing Library, user-event, axe-core                         |
| Backend       | AWS Lambda + API Gateway, DynamoDB, Bedrock (Claude Haiku), AWS CDK   |
| CI/CD         | GitHub Actions (lint, types, tests, axe on every PR), Amplify Hosting |

## Key decisions

A few of the trade-offs I made:

- **No component library**, so I control every accessibility detail myself. It is slower to build, and components need testing by hand.
- **AI only where it adds value:** the AI understands what the user writes, and plain, tested code ranks the meals. That keeps it cheap, fast and predictable.
- **The step in the URL, the answers in `sessionStorage`:** Back and refresh work, and private text never shows in the address bar.
- **Tokens in `localStorage`:** simple and common, so the real protection is preventing XSS, with a strict Content Security Policy.
- **One field with a Show/Hide button, no "confirm password"** (GOV.UK pattern).

## What's next

1. **Open the current plan after sign-in**, instead of always starting with the questions.
2. **Place a meal without dragging** ("Move to…" button), required by WCAG 2.2. This is the known accessibility gap.
3. **Playwright tests of the main flow** in a real browser, run in CI.
4. **Sentry and Core Web Vitals** from real users, to find what to improve.
5. **Dislike a suggestion and get another one.**
6. **Mobile polish:** test every page on real phones and improve the small-screen layouts.

## Running it

> **The easiest way to try the app is the [live site](https://main.d1wh7bghb5zvxn.amplifyapp.com) with the demo account.** Running it locally needs the deployed AWS backend (there is no local fake backend yet): copy `.env.example` to `.env.local` and fill in the Cognito and API values.

Requires Node 22 (`.nvmrc`).

```sh
npm install
npm run dev        # http://localhost:5173
npm run test:run   # all tests once (no backend needed)
npm run build      # type check + production build
```
