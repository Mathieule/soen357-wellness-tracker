# Test plan – Output C

## 1. Goal
Check that a reviewer can complete the essential tasks T1–T4 in the Output C prototype; that validation, errors, cancellation, empty states and persistence work; and that the accessibility requirements AR1–AR15 hold on a 390 × 844 phone viewport.

## 2. Method
- **Automated scripted tests:** `tools/checks/run-tests.mjs` on the production build in headless Chromium 130, run with `npm run build && npm run test:c`. Each test performs the action and checks the expected result in the page (text, roles, focus, storage after reload, layout measurements).
- **Automated accessibility:** axe-core 4.10 (WCAG 2.1 A/AA tags) on the welcome screen and on the 5 main pages of each demo profile, which is 16 page views.
- **Visual review:** the 25 exported screens (`Output_C/hi-fi/screens`) were inspected by the team (with AI assistance) for clipping, wrapping, overlap and hierarchy.
- **Not done:** sessions with participants, a manual screen-reader session (NVDA / VoiceOver), and real devices. See section 5.

## 3. Test data
- **Demo accounts** (password `Demo1234`): Sam Lee (Casual), Alex Martin (Training) and Jordan Rivera (Performance), each with about 2 months of generated sample data.
- **New accounts** created during tests (e.g. nina@example.com / Welcome123) start empty.
- Every test starts from cleared storage in a new browser context.

## 4. Test cases

| ID | Task / area | Action (summary) | Expected result |
|---|---|---|---|
| T1-01 | T1 account | Create account with invalid email | Field error, no account |
| T1-02 | T1 | Weak password | Password rule error |
| T1-03 | T1 | Existing email | "Already exists" error |
| T1-04 | T1 questionnaire | Continue on the persona question without answer | Error, stays on question |
| T1-05 | T1 questionnaire (empty answers) | No data type selected | "Choose at least one" error |
| T1-06 | T1 | Complete questionnaire with 5 workouts per week | Empty dashboard + Get started; plan has 5 workouts |
| T1-07 | T1 (Task 2 rules) | Tap a persona; goals page before/after choosing | Auto-advance; "Create my dashboard" only after ≥ 1 goal |
| T2-01 | T2 | Wrong password | "Incorrect" error |
| T2-02 | T2 | Training demo dashboard | Top: today's workout + calorie goal |
| T2-03 | T2 / personalization | Compare the 3 demo dashboards | All start with today's workout; Casual simple; Performance has Readiness and Load |
| T2-04 | T2 sync | Forced sync failure | Error + "Retry sync" |
| T3-01 | T3 | Open Sleep from module | Sleep page; focus on main action |
| T3-02 | T3 reorder | Move a module up, reload | Order changed and kept |
| T3-03 | T3 pin | Remove a module, add another | Lists updated |
| T3-04 | T3 history | Calendar, past day | Day details shown |
| T3-05 | T3 / personalization | Casual opens Sleep | Via "More" |
| T4-01 | T4 personal info | Change name, confirm | Greeting updated |
| T4-02 | T4 preferences | Change experience; cancel then confirm | Cancel keeps; confirm changes dashboard |
| T4-03 | T4 validation | Sessions ≠ training days | Error |
| T4-04 | T4 rating | Send with no star, then 4 stars | Error, then thanks |
| T4-05 | T4 device | Connect simulated device (empty account) | Success; Get started item done |
| T4-06 | T4 delete | Cancel, then confirm deletion | Account removed; login fails |
| X-01 | Workout creation | Empty then valid workout | Errors, then saved and listed |
| X-02 | Workout edit/delete | Edit duration, delete | Updated; confirmation; removed |
| X-03 | Failed food recognition | Blurry sample | Error + retake + manual |
| X-04 | Food confirm / cancel | Confirm one, cancel one | +1 meal, then unchanged |
| X-05 | Edit prediction | Change calories before saving | Saved with edited value |
| X-06 | Manual food validation | Missing calories | Error, then saved |
| X-07 | Sleep editing | Edit bedtime, reload | Updated and persisted |
| X-08 | Sleep validation | 30-minute night | Error |
| K-01 | Keyboard | ↑ on main action | Nav item focused |
| K-02 | Keyboard | ↓ between modules; → on nav | Focus moves as specified |
| K-03 | Keyboard | Esc in a sheet | Closes; focus returns |
| N-01 | Adaptation / Responding | Casual: "Do you want to see more data?" → Yes | Prompt shown with reason; more modules |
| N-02 | Progress charts | Calorie intake → Year | 12 monthly values |
| N-03 | Accessibility mode | Large text and buttons on, reload | Root 20 px, bold labels, kept |
| N-04 | Meal quantity | Quantity 0 then 2 servings | Error, then saved with "2 servings" |
| N-05 | Recommendations | Training demo dashboard | At least one suggestion |
| R-01 | Responsiveness | 360 / 390 / 412 px, 5 pages | No horizontal scroll |
| R-02 | Responsiveness | 1280 px | Side rail only |
| R-03 | Responsiveness (added in C.1) | Sleep page at 390 px | No wrapped duration or time range |
| A-01 | AR4 | All visible targets | 44 × 44 px or more |
| A-02 | AR2 | All visible text, chart text | 16 px or more |
| A-03 | AR1/3/5/6/14 | axe-core, 16 page views | No serious or critical violation |

The remaining AR items were checked by design review: AR8 (no flashing; motion removed under reduced motion), AR9 and AR10 (instructions and status after every entry), AR11 and AR12 (simple words, consistent layout), AR13 (documented code), AR15 (menus with only the needed elements). See `Output_C/design-decisions.md`.

## 5. Suggested participant test (not yet run)
If the team runs sessions, use the same tasks with 3–5 people per profile type:
1. "Create an account for someone who trains 4 times a week."
2. "What is your workout today and how many calories are left?"
3. "Find how you slept last Tuesday and put Sleep first on your dashboard."
4. "Change your profile to Performance and rate the app."

Record time, errors, help requests and a satisfaction score. The results would go in a new results file; none are reported here.
