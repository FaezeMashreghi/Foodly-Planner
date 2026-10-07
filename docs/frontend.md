# Frontend: structure, testing and accessibility

[← Back to the README](../README.md)

## Project structure

One repo, one `package.json` ([decision 4](decisions.md#4-project-structure-single-package-frontend-organized-by-route)).

```
src/                 React app (client-side only)
├── routes/          TanStack Router file routes; thin, routing only
│   ├── _guest/      sign-in, sign-up, confirm-email, forgot-password (signed-in users are redirected)
│   └── _authenticated/  weekly-plan, plan-questions (guard: not signed in → /sign-in)
├── api/             the only code that talks to Cognito or our backend
├── components/      ui/ (generic, accessible building blocks) and one folder per area
├── hooks/, lib/     shared hooks and helpers
└── styles/          design tokens, fonts, base styles, recipes
server/lambda/       the one Lambda: index.mjs (routes + validation), data/, suggest/, understand/, recipe/
shared/              types and rules used by both sides (meals, ingredients, validation)
infra/               CDK app: FoodlyStack (the app) and GithubDeployStack (CI access)
.github/workflows/   ci.yml (pull requests) and deploy.yml (main)
amplify.yml          how Amplify builds the frontend
customHttp.yml       security and cache headers for the frontend
```

Main rules: routes don't import each other; UI components only take props and report back, and one **flow** component per workflow owns API calls and navigation; `src/` and `server/` never import each other, only `shared/`. The full rules are in [`CLAUDE.md`](../CLAUDE.md).

## Testing

Vitest with two projects: `unit` (Node, plain functions and Lambda code) and `component` (jsdom, React with Testing Library). About 200 tests; they run in a few seconds.

- **Test critical scenarios, not coverage.** A test is written where a bug would leave a user stuck or misled: signing in, the plan questions flow, the AI daily limit, the token refresh, suggestion scoring, the cost counter, the meals cache.
- **Find elements like a user does** (`getByRole`, `getByLabelText`) and type and click with `user-event`. A field that can't be found by its label has a broken label, so the tests also check accessibility.
- **One axe test in every component test file**, on its richest state (error shown, dialog open). CI runs them as their own step, so an accessibility failure is easy to see.
- **The AI is not unit-tested**: it's checked with the evaluation script against real test cases. The code around it (`clean()`) is plain and testable.
- Not covered yet: sign up, password reset, the plan questions flow end to end, and real-browser tests (Playwright). See the roadmap.

## Accessibility

Accessibility is a main goal, so components are hand-written (no component library) and follow the WAI-ARIA Authoring Practices.

- Native elements first: `<dialog>` with `showModal()`, `<fieldset>`/`<legend>` radio groups, `<label htmlFor>` on every input, errors linked with `aria-describedby`.
- The design tokens only allow colors that pass WCAG AA contrast ([decision 10](decisions.md#10-visual-design-palette-and-font-from-the-illustration)). One focus ring style for everything, 44 px minimum targets, and reduced motion respected.
- Focus is managed: it moves to the new question in the wizard and to the recipe when it loads, and goes back to the opener when a dialog closes. Status changes use live regions.
- Checked by hand with the keyboard and VoiceOver, and automatically with axe in CI.
- **Known gaps:** placing a meal without dragging (WCAG 2.2, 2.5.7) and dnd-kit's default screen reader messages. Both are first on the roadmap.
