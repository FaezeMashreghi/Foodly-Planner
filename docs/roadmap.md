# Roadmap

[← Back to the README](../README.md)

I keep this list honest on purpose: it shows what I know is missing and in what order I'd fix it.

## Next

1. **A demo account** for visitors and reviewers.
2. **Open the current plan after sign-in:** today `/` always goes to the plan questions. If the user has a plan whose 7 days include today (or one starting in the next 6 days), open it in the weekly plan instead. Plans can start on any day, so the browser can't work out the `weekStart`: add `GET /plan/current?today=2026-10-07` (the browser sends its own date, because "today" depends on the user's timezone), a DynamoDB `Query` on `userId` with `weekStart BETWEEN today - 6 AND today + 6`, `Limit: 1` (the earliest, so a plan in progress wins over an upcoming one). `/weekly-plan` without `?start` (the nav link) should use the same lookup; today it opens the plan starting this Monday.
3. **Custom domain** for `foodlyplanner.com`: Cloudflare Registrar (~$10.50/year, sold at cost, free DNS) rather than Route 53 ($16/year + $6/year for the hosted zone). In Amplify choose manual configuration, add its records in Cloudflare as **DNS only** (grey cloud, not proxied, or the certificate check fails), then add the new origin to `ALLOWED_ORIGINS` and the CSP.
4. **"Move to…" button** on each meal card, so meals can be placed without dragging (WCAG 2.2, 2.5.7), with a `role="status"` message ("Added to Monday dinner") and a test. Decision 15 promised it, but it isn't built yet.
5. **IAM Identity Center admin user** for daily AWS work. My CLI still signs in as the root user (with MFA and temporary credentials), which decision 9 says to avoid.
6. **Backend tests for `index.mjs`**: routing, input validation (`400`), the daily limit (`429`), and the user id coming from the token.
7. **One list of ingredient and cuisine ids:** `understand.mjs` still has its own copy of the lists in `shared/meal/`. CDK's bundler can import `shared/` now. Converting the backend to TypeScript would fix this too.

## Release and deploy (single-page app)

- [x] **Commit `src/routeTree.gen.ts`**, so `tsc` works on a fresh machine (CI).
- [ ] **Reload on stale code:** listen for Vite's `vite:preloadError` event and reload the page once, so users with an old tab get the new version instead of "Failed to fetch dynamically imported module".
- [x] **SPA fallback:** an Amplify rewrite rule (`</^[^.]+$/>` → `/index.html`, `200`) sends page URLs (no dot) to the app, so opening or refreshing `/weekly-plan` works. Amplify's default "every 404 → `index.html`" rule was removed: it hides missing JS and image files.
- [x] **Caching:** hashed assets (`/assets/**`) get `public, max-age=31536000, immutable` from [`customHttp.yml`](../customHttp.yml); `index.html` keeps Amplify's `max-age=0`, so the browser always checks it and learns the new asset names after a deploy.
- [ ] **Open tabs after a deploy:** check whether Amplify still serves the previous build's hashed files; if not, the "reload on stale code" item above matters more.
- [ ] **One build per environment:** `VITE_` values are baked in at build time, so each environment needs its own build, with values from CI settings.
- [x] **Security headers** in [`customHttp.yml`](../customHttp.yml): a Content Security Policy (`script-src 'self'`, `connect-src` only our API and Cognito, `style-src` with `'unsafe-inline'` because dnd-kit adds a `<style>` tag, `img-src` with `data:` for Vite's inlined images, `frame-ancestors 'none'`), HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy`. This protects the tokens in `localStorage` (decision 5). Checked in a browser with no CSP errors. The API address is written in the CSP by hand: update it if the API URL changes.
- [x] **CORS:** the Amplify address is in `ALLOWED_ORIGINS` in `infra/foodly-stack.ts`, next to `localhost:5173`.
- [x] **Faster Amplify builds:** `nvm install --skip-default-packages` in `amplify.yml` skips the image's default global tools (Amplify CLI, Cypress, Bower…), about 35 s per build.
- [ ] **Move hosting into CDK (learning):** private S3 bucket + CloudFront with Origin Access Control, the SPA rewrite as a CloudFront Function, the headers as a response headers policy, and the API served under `/api` on the same domain (no CORS at all). See decision 27.
- [ ] **A staging environment and safe releases:** today every merge to `main` goes straight to production. Add a staging stack from the same CDK code (its own tables, Lambda, API and Amplify branch, with a stage name in the resource names). A merge to `main` deploys to staging and runs the Playwright tests there; production is deployed only after they pass, by a manual approval (a GitHub Actions environment with a required reviewer). Each environment gets its own build with its own `VITE_` values.

## Monitoring

- [ ] **Error monitoring with Sentry:** `@sentry/react` in the browser, with an error boundary around the router and source maps uploaded at build time (then deleted from the deploy) so stack traces show the real files. Later `@sentry/aws-serverless` on the Lambda. Add Sentry's ingest address to `connect-src` in the CSP in `customHttp.yml`, or the browser blocks the reports. No personal data: `sendDefaultPii: false`, and never send emails, tokens or what users type to the AI. One Sentry project per environment (staging, production).
- [ ] **Core Web Vitals from real users:** report LCP, INP and CLS from real visits (Sentry's browser tracing, or the `web-vitals` library), per page. Use them to find what to improve (the sign-in background image, the font, the weekly plan's drag and drop), and write down a limit for each (LCP < 2.5 s, INP < 200 ms, CLS < 0.1) to check after each change.

## Backend

- [ ] **Bedrock time limit:** one shared Bedrock client (like `data/db.mjs`) with a `requestTimeout` of ~15 s. Today a hanging call is killed by the Lambda's 20 s timeout before our `catch` can log it.
- [ ] **Protect the data:** `deletionProtection: true` and point-in-time recovery on `PlansTable` and `MealsTable` (AI recipes cost tokens). `RETAIN` only protects against CDK deleting them.
- [ ] **See throttled requests:** access logs on the API stage (API Gateway's own 429s never reach the Lambda), and JSON logs on the Lambda so CloudWatch Logs Insights can search by field.
- [ ] **Real dates only:** `isWeekStart` accepts `2026-02-31` and `9999-01-01`. Check that the date exists and is within about a year of today.
- [ ] **Prompt caching comment:** `understand.mjs` says the prompt is sorted "for prompt caching", but caching isn't on. It's probably not worth it: the prompt (~1,570 tokens) is likely below the model's minimum, and with few users the 5-minute cache would expire between calls. Fix the comment.
- [ ] **Recipes in the daily limit:** count `POST /meals/{id}/recipe` with `claimDailyCall(userId, 'recipe', …)` when a new recipe is written. A meal whose recipe keeps failing calls Bedrock on every click.
- [ ] **Node 24** (`Runtime.NODEJS_24_X`): Node 22 is in maintenance.
- [ ] **Stale comment:** `shared/meal/meal.ts` still says meals are "Stored as `_id` in MongoDB".

## Product

- [ ] **Open the current plan after sign-in**, see "Next".
- [ ] **Dislike a suggestion and get more:** a "Not for me" button on each suggestion card removes it and shows the next best match (the backend returns more suggestions than are shown, so no new request and no AI call). Disliked meals are saved per user (`disliked`) and never suggested again; they can be undone on the preferences page. A "Show more" button at the end of the list loads the next suggestions. A `role="status"` message says what changed ("Pasta removed, Curry added").
- [ ] **Plan history:** a page listing the user's past plans (newest first, the week's dates and how many meals were planned); opening one shows it read-only in the weekly plan. Add `GET /plans`: a DynamoDB `Query` on `userId`, newest `weekStart` first, in pages (`Limit` + `LastEvaluatedKey`). These plans are also the history for personal suggestions.
- [ ] Make the "We understood" answers editable (chips), so fixing a misunderstanding costs no AI call.
- [ ] A must-have meal that isn't in the catalogue → the AI creates it once and saves it to `meals`.
- [ ] Personal suggestions from each user's history (favourites, recently eaten).
- [ ] Preferences page and Google sign-in.
- [ ] **Mobile polish:** the layout is responsive, but it has been tested mostly on desktop. Test every page on real phones (iOS Safari and Android Chrome, including VoiceOver and TalkBack) and improve the small-screen layouts.

## Accessibility

- [ ] **dnd-kit announcements:** decision 15 says they're reworded ("Picked up Pasta. Dropped on Monday dinner"), but `DragDropProvider` still uses dnd-kit's defaults, which read ids, not meal names.
- [ ] **Focus and title after navigation:** each page gets its own `<title>` ("Sign in – Foodly"), and focus moves to the new page's `<h1>` so screen readers announce the change.
- [ ] **Page not found:** a `notFoundComponent` with an `<h1>` and a link home.
- [ ] **Full pages with Playwright + `@axe-core/playwright`** in a real browser: color contrast, landmarks and focus order across sign in → plan questions → weekly plan.
- [ ] Keep testing by hand with the keyboard and VoiceOver; automated checks find only part of the problems.

## Tests still missing (critical scenarios)

- [ ] **Playwright tests of the main flow in CI:** sign in → plan questions → weekly plan → place a meal → reload and it's still there, in Chrome, Firefox and WebKit, with `@axe-core/playwright` on each page. They run against staging before every production deploy, with a test user whose password is a GitHub secret and the AI answers faked (or a fixed test prompt) so runs are repeatable and cheap. Traces and screenshots are kept when a test fails.
- [ ] **Place a meal without dragging** (once "Move to…" exists): the meal lands in the right slot, the status message says so, and a failed save says so too.
- [ ] **Sign up** then **confirm email**: "account already exists", a wrong or expired code, then signed in.
- [ ] **Reset a forgotten password**: code sent, wrong code explained, new password rules.
- [ ] **Plan questions end to end** (`PlanQuestionsFlow`, `src/api/` mocked): AI answers → review → start day → saved; a failed save shows an error and keeps the answers.
- [ ] **The Lambda handler** (`index.mjs`), see "Next".

## Performance

- [ ] Run Lighthouse on the sign-in page. If the background image is the LCP element, preload it with `fetchpriority="high"`.
- [ ] Preload the Nunito Latin font file only if Lighthouse shows it loading late (needs a small Vite plugin because of the hashed name).

## Code quality and design

- [ ] **Button `type` lint rule:** `eslint-plugin-react` with only `react/button-has-type`.
- [ ] **Icons:** UI icons are emoji today (📖 🧂 👩‍🍳 💡). They look different on every system and don't follow the palette. Replace them with SVG icons (Lucide or Heroicons, colored with `currentColor`), and pick one consistent style for meal emoji, then record the choice here.
- [ ] **Illustration license:** check the license on the Figma Community files ("[FREE] Food & Meal Delivery Illustration", "Chef Cooking") and add a credit if needed.
