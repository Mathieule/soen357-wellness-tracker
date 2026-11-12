# Verification of AI output

What was checked, how, and the result. "Automated" means a script run by the AI
in this environment; it is **not** a user test.

| # | What | How | Result |
|---|---|---|---|
| V1 | Colour contrast of every text/surface pair | WCAG 2.x relative-luminance formula (Python), values recorded in `shared/src/theme.css` | All text pairs ≥ 5.28:1; non-text accents ≥ 4.87:1 |
| V2 | Output A compiles | `npm run build:a` (tsc --noEmit + vite build) | Pass |
| V3 | Output B compiles | `npm run build:b` | Pass |
| V4 | Output A screens and flows run | `npm run screens:a`: 24 scripted scenarios in headless Chromium 130, 390 × 844, reduced motion | 24/24 pass |
| V5 | Output B screens, incl. new features | `npm run screens:b`: 29 scenarios (B25–B29 cover customize, reorder, unpin, ↑ to nav, ← on nav) | 29/29 pass |
| V6 | Visual check of exported screens | AI viewed A02, A07, A08, A09, A12, A14, A19, A22, B25, B27, B28 | Layout OK; issues found → fixed (dialog footer buttons) or logged (A-P8, B-P1, B-P2) |
| V7 | Wireframes are valid SVG | XML parse of every generated file | Pass after fixing unescaped quotes |
| V8 | End-to-end flows on both builds | `npm run check:flows` (`tools/checks/flows.mjs`): sign up → questionnaire → dashboard, food confirm / cancel, sleep edit + reload persistence, delete account, deleted account cannot log in, storage keys separated, no page errors | 7/7 per output, repeated twice. **Bug found and fixed:** success messages after log in, the questionnaire and account deletion were lost, because the route guard's redirect replaced the router state; they are now queued (`shared/src/lib/useFlash.ts`) |
| V9 | Screen reader, real phones, user testing | – | **Not done yet** (planned for Output C testing) |

Environment notes: Chromium needed `libnss3`, `libnspr4` and `libasound2` (not installed system-wide); they were extracted locally from Ubuntu packages, without root, only for running the exporters. Arial is not installed on the test machine, so screenshots use Liberation Sans (metric-compatible).

## Output C (redesign) verification

| # | What | How | Result |
|---|---|---|---|
| V10 | Contrast of every new token pair | WCAG formula (Python); values in `packages/design-system/src/tokens.css` | Text ≥ 5.36:1 on allowed surfaces; secondary text restricted to neutral surfaces |
| V11 | Type check and production build | `npm run build` | Pass |
| V12 | All screens render | `npm run screens`: 25 scenarios incl. 3 profiles, empty account, sync failure, 1280 px | 25/25 |
| V13 | Essential tasks and edge cases | `npm run test:c` run 1 (original C) | 32/37: 1 product issue (C1-01), 4 test-script issues |
| V14 | Visual review of screens | AI viewed dashboards, Training, Sleep, Nutrition, Settings, onboarding, empty account, desktop | Found C1-02, C1-03 and several pre-test layout issues (fixed before run 1) |
| V15 | After C.1 | `npm run test:c` run 2 | 38/38, axe-core: no serious/critical violations on 16 page views |
| V16 | Not done | Participant tests, manual screen reader, real phones, Safari | Listed in Output_C/README.md limitations |
