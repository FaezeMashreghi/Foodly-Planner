# Decision log

[← Back to the README](../README.md)

Each entry says what was chosen, why, what else was considered, and the trade-off accepted.

**Frontend highlights:** [2](#2-styling-tailwind-css--custom-design-system), [3](#3-no-component-library-components-are-hand-written), [5](#5-authentication-cognito-with-our-own-email--password-forms), [7](#7-routing-and-data-loading-tanstack-router--tanstack-query), [13](#13-password-fields-one-field-with-a-showhide-button-no-confirm-password), [14](#14-testing-vitest-with-testing-library-for-components), [15](#15-drag-and-drop-in-the-weekly-plan-dnd-kit), [23](#23-plan-questions-the-step-in-the-url-the-answers-in-a-sessionstorage-draft).

| #   | Decision                                                                                                                                                      | Status            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | [Backend on AWS with a single database](#1-backend-on-aws-with-a-single-database)                                                                             | Current           |
| 2   | [Styling: Tailwind CSS + custom design system](#2-styling-tailwind-css--custom-design-system)                                                                 | Current           |
| 3   | [No component library: components are hand-written](#3-no-component-library-components-are-hand-written)                                                      | Current           |
| 4   | [Project structure: single package, frontend organized by route](#4-project-structure-single-package-frontend-organized-by-route)                             | Current           |
| 5   | [Authentication: Cognito with our own email + password forms](#5-authentication-cognito-with-our-own-email--password-forms)                                   | Current           |
| 7   | [Routing and data loading: TanStack Router + TanStack Query](#7-routing-and-data-loading-tanstack-router--tanstack-query)                                     | Current           |
| 8   | [Auth page background: illustration on large screens only](#8-auth-page-background-illustration-on-large-screens-only)                                        | Current           |
| 9   | [AWS account and Cognito setup](#9-aws-account-and-cognito-setup)                                                                                             | Partly done       |
| 10  | [Visual design: palette and font from the illustration](#10-visual-design-palette-and-font-from-the-illustration)                                             | Current           |
| 11  | [Auth code: thin Cognito wrappers and typed errors](#11-auth-code-thin-cognito-wrappers-and-typed-errors)                                                     | Current           |
| 12  | [Code formatting: Prettier, with ESLint for correctness](#12-code-formatting-prettier-with-eslint-for-correctness)                                            | Current           |
| 13  | [Password fields: one field with a Show/Hide button, no "confirm password"](#13-password-fields-one-field-with-a-showhide-button-no-confirm-password)         | Current           |
| 14  | [Testing: Vitest, with Testing Library for components](#14-testing-vitest-with-testing-library-for-components)                                                | Current           |
| 15  | [Drag and drop in the weekly plan: dnd-kit](#15-drag-and-drop-in-the-weekly-plan-dnd-kit)                                                                     | Current           |
| 16  | [Backend: Lambda + API Gateway HTTP API, created with AWS CDK](#16-backend-lambda--api-gateway-http-api-created-with-aws-cdk)                                 | Updated by 18, 24 |
| 17  | [Meal planning: a meal catalogue, AI only to understand the user](#17-meal-planning-a-meal-catalogue-ai-only-to-understand-the-user)                          | Updated by 22     |
| 18  | [A small backend: one Lambda, DynamoDB, Bedrock](#18-a-small-backend-one-lambda-dynamodb-bedrock)                                                             | Updated by 24     |
| 19  | [Meal details: native `<dialog>`, recipes generated once, a YouTube search link](#19-meal-details-native-dialog-recipes-generated-once-a-youtube-search-link) | Current           |
| 20  | [App icon next to the name "Foodly"](#20-app-icon-next-to-the-name-foodly)                                                                                    | Current           |
| 21  | [Plan questions page illustration: cropped, white kept, three WebP sizes](#21-plan-questions-page-illustration-cropped-white-kept-three-webp-sizes)           | Current           |
| 22  | [Suggestions are scored in the backend](#22-suggestions-are-scored-in-the-backend)                                                                            | Current           |
| 23  | [Plan questions: the step in the URL, the answers in a `sessionStorage` draft](#23-plan-questions-the-step-in-the-url-the-answers-in-a-sessionstorage-draft)  | Current           |
| 24  | [Backend moved from the console to CDK](#24-backend-moved-from-the-console-to-cdk)                                                                            | Current           |
| 25  | [Backend hardening: errors, config in infra, cached meals, cost limits](#25-backend-hardening-errors-config-in-infra-cached-meals-cost-limits)                | Current           |
| 26  | [CI/CD: GitHub Actions with OIDC, no AWS keys stored](#26-cicd-github-actions-with-oidc-no-aws-keys-stored)                                                   | Current           |
| 27  | [Frontend hosting: Amplify Hosting, built only after CI](#27-frontend-hosting-amplify-hosting-built-only-after-ci)                                            | Current           |

## 1. Backend on AWS with a single database

**Chosen:** an AWS backend with one database for all data.

**Why:** the services most companies run on, with pay-per-use pricing that suits a small app.

**Instead of:** Firebase or Supabase (faster to start, but less control over auth, data and cost).

**Trade-off:** more setup than an all-in-one platform. Compute and database were decided later in 16, 17 and 18.

## 2. Styling: Tailwind CSS + custom design system

**Chosen:** Tailwind CSS v4 with our own tokens (`src/styles/theme.css`); Tailwind's default palette is removed.

**Why:** fast to build with, consistent spacing, small CSS. The tokens mean only contrast-checked colors can be used, and focus rings and reduced motion are handled once, globally.

- **Recipe or component:** shared _styling_ is an `@utility` recipe (`btn-primary`, `card`); shared _structure or behavior_ is a component (`<TextField>` links label, hint and error, so no field can forget its label).
- **Buttons stay a recipe:** the same style goes on a `<button>` (an action) and on a `<Link>` (navigation); a class works on both, a `<Button>` component would need extra logic to become a link.
- **Variants** are a plain object map in the component's file.

**Instead of:** plain CSS (class names clash), CSS Modules (slower to write), CSS-in-JS (runtime cost), `@apply` recipes for everything (styles far from the component), `cva` (not needed for a few variants).

**Trade-off:** long class strings in components. Single light theme, no dark mode.

## 3. No component library: components are hand-written

**Chosen:** every UI component is written by hand: buttons, dialog, tabs, radio groups, the weekly grid.

**Why:** full control over accessibility. Keyboard handling, focus management and ARIA are written and tested here, not hidden in a library.

**Instead of:** MUI, Mantine, Chakra (full libraries); Radix, React Aria, shadcn/ui (headless).

**Trade-off:** slower to build, and accessibility bugs are possible, so components are tested with axe, the keyboard and VoiceOver.

## 4. Project structure: single package, frontend organized by route

**Chosen:** one repo and one `package.json`: frontend in `src/`, Lambda in `server/`, shared types in `shared/`. Route files are thin; UI lives in `src/components/` (`ui/` for generic pieces, one folder per area). One folder per component, named exports, no `index.ts` re-exports. Path aliases `@/` and `@shared/` instead of `../../`.

**Why:** the simplest setup where frontend and backend share types; the URL tells you which route file to open.

**Instead of:** separate repos (duplicated types), npm workspaces (more setup than needed), folders by type or by feature, Atomic Design (endless "which level?" debates).

**Trade-off:** frontend and backend share one `package.json`; can move to workspaces if it starts to hurt.

## 5. Authentication: Cognito with our own email + password forms

**Chosen:** a Cognito User Pool stores users; our own forms call Cognito (AWS SDK v3) for sign up, confirm, sign in, reset and sign out, and our own token manager handles the tokens.

- The token manager refreshes ~1 minute before expiry, runs one refresh at a time (other requests wait), retries a `401` once, and revokes the refresh token on sign out.
- API Gateway checks the token; the backend takes the user id from the token, never from the request.

**Instead of:** Cognito's hosted login page (we wouldn't own the forms' accessibility), Amplify Auth (hides the token handling), our own password storage (easy to get wrong).

**Token storage:** `localStorage`. Memory alone signs users out on reload; `sessionStorage` signs them out in every new tab; an `HttpOnly` cookie needs a backend-for-frontend. The real protection is preventing XSS: a strict Content Security Policy, no unsafe HTML, short token lifetimes.

**Trade-off:** a script injected into the page could read the tokens. `USER_PASSWORD_AUTH` sends the password to Cognito over HTTPS instead of using SRP.

## 7. Routing and data loading: TanStack Router + TanStack Query

**Chosen:** TanStack Router with file-based routes (client-side only) and TanStack Query for backend data.

**Why:**

- A route's loader fills the Query cache before the page shows: no blank page with a spinner.
- Fully typed: a link to a route that doesn't exist is a TypeScript error.
- Login protection is written once in `_authenticated.tsx`; signed-in users are kept off the auth pages in `_guest.tsx`.
- Query holds only server data (keys in `src/api/foodly/query-keys.ts`); tokens stay in the token manager, and the API client adds them.
- Each route is its own code-split file.

**Instead of:** React Router (less type-safe, less connected to Query), Next.js or TanStack Start (SSR doesn't help an app behind a login), `useEffect` + `useState` (loading, errors and caching written by hand on every page).

**Trade-off:** TanStack Router is younger, with fewer answers online.

## 8. Auth page background: illustration on large screens only

**Chosen:** the food illustration as a background on large screens only; phones get a plain color.

**Why:** on a phone the form is what matters, the illustration would be squeezed, and it saves data.

**How:** AVIF with a WebP fallback via CSS `image-set()`, two sizes (14–40 KB, down from a 502 KB export), loaded inside a `min-width` media query so phones never download it, with the background color showing while it loads.

**Trade-off:** four image files to regenerate together, always from the lossless PNG (re-compressing a compressed file made it look smudged).

## 9. AWS account and Cognito setup

**Chosen:** root user with MFA, a budget alert, region `eu-west-2` (London). The Cognito User Pool was set up in the console with only the settings the app needs:

- A public app client with no secret (a browser can't keep one), and only the `USER_PASSWORD_AUTH` and refresh flows.
- Token revocation on, so sign out really cancels the refresh token.
- "Prevent user existence errors" on, so sign-in errors don't reveal which emails have accounts.

**Status:** the plan is daily work through an IAM Identity Center admin user instead of root; the CLI still uses root (with MFA and temporary credentials only). It's on the roadmap.

**Trade-off:** the pool is outside CDK (it holds the users); Cognito's default email has a low daily limit, so production needs SES.

## 10. Visual design: palette and font from the illustration

**Chosen:** colors taken from the illustration, every text color checked for WCAG AA. The brand green is darker than the illustration's (`#83a95b` gave white text only 2.7:1; `#3d6b22` gives 6.3:1). Focus is teal, so it stands out from the green buttons.

**Font:** Nunito, self-hosted: variable WOFF2, Latin subset (~39 KB), `font-display: swap` and a size-matched Arial fallback so text doesn't jump when it loads.

**Instead of:** a system font (no personality), Google Fonts `<link>` (sends every visitor's IP to Google, a GDPR concern).

**Trade-off:** ~39 KB on the first visit.

## 11. Auth code: thin Cognito wrappers and typed errors

**Chosen:** one small function per Cognito command in `src/api/auth/cognito.ts`, returning plain data and storing nothing. Error names live in one `as const` object, with a `Record` of user-facing messages, so a new error without a message is a compile error.

**Instead of:** error strings typed in each form (typos fail silently), TypeScript `enum` (not allowed by `erasableSyntaxOnly`), forms importing SDK error classes (ties the UI to the SDK).

**Trade-off:** messages never say whether an email exists, which is slightly less helpful for someone who mistyped it.

## 12. Code formatting: Prettier, with ESLint for correctness

**Chosen:** Prettier formats (with Tailwind class sorting); ESLint only looks for bugs; `eslint-config-prettier` stops them fighting. Checked in CI.

**Instead of:** ESLint stylistic rules (more to configure), Biome (less mature Tailwind and React support).

**Trade-off:** few formatting options, which is the point.

## 13. Password fields: one field with a Show/Hide button, no "confirm password"

**Chosen:** the new password is typed once, in a `<PasswordField>` with a Show/Hide button (GOV.UK pattern), and the rules are shown before typing.

- A real `<button type="button">` named "Show password" / "Hide password", so it says what it will do.
- A hidden `role="status"` message announces "Your password is visible/hidden".
- Not `aria-pressed`: the button's text changes, and mixing both confuses screen readers.

**Why:** typing it twice is hard on phones and for people with motor difficulties, and still misses Caps Lock mistakes. Seeing the password fixes typos directly, and a wrong password can always be reset by email.

## 14. Testing: Vitest, with Testing Library for components

**Chosen:** Vitest with two projects: `unit` (Node) for plain functions and `component` (jsdom) for React with Testing Library, user-event and jest-dom. Every component test file includes an axe test, run as its own CI step.

**How:** find elements like users and screen readers do (`getByRole`, `getByLabelText`), so a broken label fails the test. Logic lives in plain functions with fast unit tests. Tests are written for the scenarios where a bug would leave a user stuck, not for coverage. (The first `TextField` test found a real bug: the hidden "Error:" prefix ran into the message.)

**Instead of:** Jest (more setup with Vite and ESM), `fireEvent` (doesn't type or tab like a user), Vitest Browser Mode (slower).

**Trade-off:** jsdom has no layout or real CSS, so target sizes and color contrast need a real browser: Playwright is on the roadmap.

## 15. Drag and drop in the weekly plan: dnd-kit

**Chosen:** dnd-kit (`@dnd-kit/react`) to drag meals into slots.

**Why:** mouse, touch and keyboard support with screen reader announcements, and no UI of its own, so the grid and cards stay hand-written.

**Instead of:** native HTML drag and drop (no keyboard or touch support), Pragmatic drag and drop (no keyboard dragging), `@hello-pangea/dnd` (built for reordering lists, not a grid).

**Trade-off:** `@dnd-kit/react` is still below 1.0. A "Move to…" button, so meals can be placed without dragging (WCAG 2.5.7), and reworded announcements are planned but not built yet (see the roadmap).

## 16. Backend: Lambda + API Gateway HTTP API, created with AWS CDK

> **Updated by 18 and 24:** one Lambda for all routes, built in the console first, then moved to CDK.

**Chosen:** Lambda behind an API Gateway HTTP API with a Cognito JWT authorizer, defined in CDK (TypeScript).

**Why:** pay per request, nothing to patch; API Gateway rejects requests without a valid token before any code runs.

**Instead of:** ECS Fargate (always running, costs money with no users), REST API (more expensive and slower), SAM or Terraform (YAML or HCL instead of TypeScript).

**Trade-off:** cold starts on the first request after a quiet period.

## 17. Meal planning: a meal catalogue, AI only to understand the user

> **Updated by 22:** scoring moved to the backend.

**Chosen:**

- A catalogue of ~100 meals, generated once with AI and reviewed by hand, with fixed ingredient and cuisine ids so the AI, the UI and the scoring use the same words.
- The user answers four questions in their own words; **one** small AI call turns them into structured answers (`expiring`, `cuisines`, `easyOnly`, `mustHave`…), shown on a "We understood" screen.
- Plain, tested code scores the catalogue and suggests 10 meals per meal type. Plans store meal ids only.

**Why:** AI only where it adds value (understanding free text, writing recipes); predictable code does the rest. About 1,570 input + 110 output tokens per plan with Claude Haiku 4.5.

**Instead of:** the AI picking the meals (20–30× more tokens, can invent meals, hard to test), a plain form (cheaper but less natural), generating meals on every request (pays again, inconsistent).

**Trade-off:** a 1–2 s wait per plan, and the AI can misunderstand; the "We understood" screen shows what it understood (editing it is on the roadmap).

## 18. A small backend: one Lambda, DynamoDB, Bedrock

> **Updated by 24:** built in the console first, then moved to CDK.

**Chosen:** DynamoDB (`foodly-plans`, key `userId` + `weekStart`, so "this user's week" is one read), one Lambda for all routes, and Bedrock for AI through the Lambda's IAM role. Meals live in their own table.

**Why:** decision 17 moved filtering into code, so the database only saves and loads a plan by user and week: DynamoDB's simplest use. Everything stays in AWS, with no database password or API key to store.

**Instead of:** MongoDB Atlas (a second account and a secret), one Lambda per route (more setup, copied code), the Anthropic API directly (needs a stored API key).

**Trade-off:** one role for all routes (less least privilege); queries limited to the keys, which is fine here.

## 19. Meal details: native `<dialog>`, recipes generated once, a YouTube search link

**Chosen:**

- A **"Details" button beside each card**, not inside it: the card itself is draggable (dnd-kit gives it `role="button"`), and a button inside a button can't be used by screen readers.
- The **native `<dialog>`** with `showModal()` (top layer, Esc, focus in and back), wrapped once in `ui/dialog/` with a title, a Close button, backdrop click, a portal to `<body>` and no scrolling behind it.
- **Recipes written by AI once per meal** and saved for everyone, so a recipe is never paid for twice.
- A **YouTube search link** built in the app, because an AI often invents video URLs.

**Instead of:** a modal library (the browser now does the hard parts; 10–30 KB more), opening details by clicking the card (conflicts with dragging).

**Trade-off:** an AI recipe can contain mistakes; it's written from the meal's reviewed ingredient list.

## 20. App icon next to the name "Foodly"

**Chosen:** the illustration's blob shape with a transparent background, 40 px tall, in one `<AppLogo>` component: WebP in three densities (`srcSet`, 2–7 KB), `width`/`height` set so the layout doesn't jump, `alt=""` since the name is next to it.

**Trade-off:** the source PNG is kept outside the repo; new sizes are always made from it.

## 21. Plan questions page illustration: cropped, white kept, three WebP sizes

**Chosen:** the chef illustration cropped from the lossless PNG, 240 px wide, three WebP densities (5–17 KB), not lazy-loaded (it's at the top), `alt=""`.

**Why white is kept:** the chef's white coat touches the background, so making white transparent would cut into it.

**Trade-off:** only the WebP files are in the repo; never make new sizes from them (quality loss).

## 22. Suggestions are scored in the backend

**Chosen:** scoring moved from the browser to `suggest.mjs` in the Lambda. The answers are saved on the plan, and `GET /plan/suggestions` returns 10 meal ids per meal type. Must-have first, "avoid" ingredients removed, then points (+3 per expiring ingredient, +2 matching cuisine…), ties broken by id so the result is always the same.

**Why:** all the planning logic in one place, and suggestions survive a reload or a new device.

**Split from the plan:** slots change on every drop, but suggestions only change when the answers do. So `GET /plan` returns only the slots, and the browser caches suggestions with `staleTime: Infinity` until the answers are saved.

**Instead of:** scoring in the browser (logic split across two places), a stateless `POST` with the answers (lost on reload).

## 23. Plan questions: the step in the URL, the answers in a `sessionStorage` draft

**Chosen:** each screen has its own URL (`?step=1` … `?step=review`); the answers are kept in a `sessionStorage` draft for the tab, saved when the user moves between steps. Opening a later step without answers sends the user back to step 1.

**Why:** the browser's Back button goes to the previous screen, and answers survive a refresh. Rule: the URL says where you are; storage keeps what you typed.

**Instead of:** the step in React state (Back left the page), `localStorage` (an old draft could come back days later), answers in the URL (private text in the address bar), a draft in the backend (an endpoint and a request per step).

**Trade-off:** the draft is per tab; if storage is blocked, the flow still works but refresh loses the answers.

## 24. Backend moved from the console to CDK

**Chosen:** the whole backend in `infra/foodly-stack.ts`. Tables with data were **imported** with `cdk import` (not recreated) and kept with `RemovalPolicy.RETAIN`; the Lambda and API were created fresh, tested, then switched over. Permissions use `grant()`, limited to the actions the code uses.

**Why:** two tables, 7 routes and 5 hand-written policies were slow and risky to change by hand, with no history.

**Instead of:** recreating the tables (data lost), referencing them by name (CDK couldn't manage them).

**Trade-off:** changes go through code only (console edits cause drift); construct ids must never be renamed, or CloudFormation replaces the resource.

## 25. Backend hardening: errors, config in infra, cached meals, cost limits

**Chosen:**

- Errors caught in one place, logged with the route, and returned as `500`/`503` without details.
- Table names and the model id come from infra as environment variables.
- Meals are read once per Lambda instance, without recipes (DynamoDB bills by bytes read).
- API throttling, plus a **daily limit of 20 AI calls per user**, counted with one conditional DynamoDB write so parallel requests can't go over it.
- An AWS Budget alert.

**Why:** a crash gave a bare error with no route in the logs, and with open sign-up nothing capped the AI bill.

**Instead of:** throttling only (limits all users together, so one user can block everyone), read-then-write counting (two parallel requests could both pass).

**Trade-off:** a call counts even if Bedrock then fails.

## 26. CI/CD: GitHub Actions with OIDC, no AWS keys stored

**Chosen:**

- **Every pull request:** lint, format check, type check and build, tests, axe tests as their own step, and `cdk synth`. No AWS access.
- **Every merge to `main`:** the same checks, then `cdk deploy`, then the frontend build.
- **AWS sign-in with OIDC:** short-lived credentials for a role that trusts only this repo's `production` environment and can only use CDK's own deploy roles.
- One deploy at a time, minimal token permissions, third-party actions pinned to a commit.

**Instead of:** AWS keys in GitHub secrets (long-lived, can leak), deploying from a laptop (not repeatable), CodePipeline (more cost and a second place for logs).

**Trade-off:** no staging yet, so every merge goes straight to production (staging is on the roadmap); IAM changes are reviewed in the pull request.

## 27. Frontend hosting: Amplify Hosting, built only after CI

**Chosen:** the React build on Amplify Hosting. Its auto-build is off; the deploy workflow starts it with a webhook after the checks and the backend deploy, so a failing check means nothing goes live.

- A rewrite rule sends page URLs (no dot) to `index.html`; missing files stay a real `404`.
- [`customHttp.yml`](../customHttp.yml) adds a Content Security Policy and other security headers, and a one-year `immutable` cache to the hashed assets.

**Instead of:** S3 + CloudFront in CDK (full control but more to build; on the roadmap), Amplify auto-build (a failing commit could go live), Vercel or Netlify (a second provider).

**Trade-off:** Amplify is set up in the console; the API address is typed into the CSP by hand; the site and API are on different domains, so CORS stays.
