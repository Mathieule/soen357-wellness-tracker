# Output C – Requirements check

Checks Output C against:
1. the Task 2 Output C conceptual design (the latest document given by the team);
2. the redesign brief (premium design, user-dependent experiences, deliverables);
3. the Task 4 brief (§5–§7).

Status: **Met**, **Met (simulated)**, or **Partly** (with the reason). Test IDs refer to `Final_Testing/test-results.md`.

## 1. Task 2 Output C

| Requirement | Status | Where / how verified |
|---|---|---|
| App adapts to the user; more detail for performance athletes, hidden for casual users | Met | Personalization engine; T2-03 compares the three dashboards |
| **Accessibility mode with large font and interface elements** | Met | Questionnaire step 1 and Settings → Display → "Large text and buttons" (root 20 px, all controls scale); N-03 |
| **Labels larger and in bold for users with accessibility needs** | Met | Large mode makes labels, legends, buttons, headings and nav bold; N-03 checks label weight 700 |
| Questionnaire on fitness level and lifestyle habits → customized dashboard | Met | 6 steps: name, persona, level, workouts per week, what to track, fitness goals; T1-06 |
| One question per page; next question shown after choosing; no way forward without an answer | Met | Auto-advance on tap; errors on Continue; T1-04, T1-05, T1-07 |
| Persona before fitness goals; "Create my dashboard" only appears after ≥ 1 goal | Met | T1-07 |
| User keeps entering workouts, meals, sleep; the app adjusts over time | Met | Adaptive "Do you want to see more data?" (data-based reason), recommendations from logged data; N-01, N-05 |
| Concepts: fitness levels, calorie tracking, workout tracking, progression over time, sleep metrics, recommendation, lifestyle preferences | Met | Personas; Nutrition Metrics; Fitness Metrics; week / month / year charts; Sleep Metrics; Recommendations module; lifestyle editor |
| Relationship: lifestyle choices decide the persona (workout frequency, metrics of interest, meal tracking) | Met | Workouts per week, "What do you want to track?" and goals change the plan, tabs, modules and calorie goal |
| **Smart devices assist tracking: connect** a smart device | Met (simulated) | Settings → Smart device → Connect (imports 14 days of steps); T4-05 |
| **Sync** the smart device; **Sync device status** in Profile | Met (simulated) | Sync status chip on the dashboard; Settings → Sync now; failure → "Retry sync"; T2-04 |
| **Update the persona and preferences when habits change** (casual → performance) | Met | Settings → "Persona and lifestyle" with a preview and confirmation; T4-02 |
| Instructing: age, weight, height | Met | Settings → Personal information; T4-01 |
| Instructing: meal (items eaten, **quantity**) | Met | "Type it in" with quantity in servings; N-04 |
| Instructing: workout (exercises completed, time taken) | Met | Workout form; X-01 |
| Instructing: sleep log | Met | "Enter a new sleep log"; X-07, X-08 |
| Manipulating: pin, unpin, order metrics on the dashboard | Met | Customize: Up / Down / Unpin, Pin metric; T3-02, T3-03 |
| Exploring: progress charts for the **past week, month, year** | Met | Week / Month / Year on workout minutes, calorie intake and hours of sleep; N-02 |
| Exploring: previous workouts and meals; daily goals on the dashboard | Met | Previous workouts / meals / sleep logs with detail; calorie goal at the top; T3-04, T2-02 |
| Responding: rating satisfaction | Met | Settings → Rate the app; T4-04 |
| Responding: "Do you want to be presented with more data?" | Met | Dashboard card (casual), Display switch; N-01 |
| Content groups: Nutrition (new meal, calorie graph M/W/Y, past meal) · Fitness (new workout, previous workout, summary) · Sleep (new log, previous log, history) · Profile (see / edit info, **sync device status**) · Dashboard (today's workout and calorie goal, consolidated summary) | Met | See `interactions.md` |
| Screen hierarchy: account → questionnaire → dashboard; **top = today's calorie goal and workout**; widget → page; history → detail; return buttons | Met | T2-02 (first module = today's workout with "Calorie goal"), T3-01 |
| Labels: same label on the widget and the page ("Fitness Metrics"); "return", "pin metric", "unpin metric" | Met | Widgets and pages "Fitness / Nutrition / Sleep Metrics"; "Return" button; "Pin metric" / "Unpin metric: …"; T3-01, T3-03 |
| Profile changes confirmed a second time; green success; red error with retry | Met | Confirm dialogs (T4-01, T4-02, T4-06); toasts and inline errors |

## 2. Redesign brief

| Requirement | Status | Notes |
|---|---|---|
| Premium, coherent visual identity; design system with tokens | Met | `packages/design-system` (tokens, components, charts) |
| Three distinct experiences (Casual, Training-focused, Performance) from one personalization system | Met | `packages/core/src/experience.ts`; T2-03 |
| Profile affects the dashboard, widgets, order, detail, pages, navigation, recommendations | Met | Engine outputs modules, detail, sections, nav, quick actions; recommendations use profile and data |
| Preferences changeable later in Settings | Met | T4-02 |
| Empty and loading states designed; clear feedback | Met | Empty account and Get started (T1-06), loading on recognition and device, toasts and inline errors |
| Responsive (390 px first, larger screens) | Met | R-01, R-02 |
| A / B / C kept separate and identifiable | Met | Three apps; git tags; version badge on the welcome screen |
| Low-fi, hi-fi, interactions, design decisions, change explanation for each version | Met | `Output_A`, `Output_B`, `Output_C` folders |
| Tests, results, limitations, README | Met | `Final_Testing/`, `Output_C/README.md` |
| Tests with participants | **Partly** | Not run; see the test plan, section 5 |

## 3. Task 4 brief (§5–§7, Output C prototype)

All listed interactions exist: sign up and log in with validation and errors, the demo account, the questionnaire saved locally, a dashboard with pin / unpin / reorder persisted, fitness (routine, steps / active / calories, workout form, history, inspect sessions, calendar), nutrition (goals, macros, history, add a meal, simulated recognition with prediction, confirm / edit, failure state, manual fallback, saved locally), sleep (duration, stages graph, history, add / edit, inspect), profile and settings (edit info, dashboard preferences, preferred metrics, delete confirmation, simulated device, rating 1–5).

**Open points:** participant tests, a manual screen-reader session and real-device testing were not done (see `README.md` → Limitations).
