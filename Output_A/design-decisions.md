# Output A – Design decisions

**Sources:**
- Task 2 Output A (conceptual design): personas, concepts, interaction types, content groups, screen hierarchy, labels, T1–T4 flows.
- Task 3 Output A (C1–C21, AR1–AR15).
- The team's redesign brief: a premium visual identity, with A already polished.

Output A is the same code base as B and C. It is configured by `ITERATIONS.A` in `packages/core/src/iteration.ts`.

## 1. What Output A contains (traceability to Task 2 Output A)

| Task 2 Output A | Where in the prototype |
|---|---|
| Fitness levels: casual users, performance athletes | Questionnaire Q1 and Profile → "Persona and goals" (2 personas) |
| Calorie tracking | Nutrition Metrics: calorie ring, meals, calorie intake chart; calorie goal on the dashboard |
| Workout tracking | Fitness Metrics: enter a workout, plan, month summary, previous workouts |
| A user belongs to a fitness group, which decides the dashboard and how much information is shown | Personalization engine: Casual = today's workout + steps + nutrition; Performance = + training load, macros, this week, fitness metrics |
| Instructing: age, weight, height | Profile → Personal information |
| Instructing: meal (items eaten, **quantity**) | "Type it in" form with quantity in servings; photo scan (simulated) |
| Instructing: workout (exercises completed, time taken) | "Enter a new workout": name, type, date, time, duration, intensity |
| Conversing: questionnaire | Q1 persona → Q2 fitness goals |
| Manipulating: **pin preferred metrics in settings** | Profile → "Dashboard metrics": Move up / down, **Unpin metric**, **Pin metric**, reset |
| Exploring: progress charts for the **past week, month, year** | Week / Month / Year control on "Workout minutes" and "Calorie intake" |
| Exploring: previous workouts and meals; daily goals on the dashboard | "Previous workouts", "Previous meals" (by day), detail views; calorie goal at the top |
| Responding: the app asks if the user wants **more data** | "Do you want to see more data?" card for casual users from the first visit; also a Display switch in Profile |
| Content: enter / view a meal, calorie graph; enter / view a workout, workout summary; see / edit user info; dashboard with today's workout and calorie goal | All present (see `interactions.md`) |
| Screen hierarchy: account → questionnaire (one question per page, next shown after choosing) → customized dashboard; the dashboard top shows the calorie goal (set by the user) and today's workout; a widget opens its page; history → detail; return buttons | Implemented as written; the next question opens automatically after a tap |
| Labels: same label on the widget and the page ("Fitness Metrics"); buttons "Return", "Pin metric", "Unpin metric" | Implemented |
| Persona before goals; "Create my dashboard" only appears after ≥ 1 goal; confirm profile changes; green success, red error with retry | Implemented |

## 2. Interpretations

| Point | Decision | Reason |
|---|---|---|
| "Next question shown after they choose an answer" | Auto-advance after a **tap / click**. With the keyboard, the user confirms with Continue | Arrow keys change radio choices; auto-advancing on them would move keyboard users by accident (AR7) |
| Settings location in A | A "Profile" tab in the bottom bar (Task 3 Output A had settings in the bar) | Task 3 Output B moves it to a top-right button, which keeps A and B distinct |
| Return buttons in A | Present (Task 2 Output A says "for each page, there are return buttons") | Task 2 is the latest source for A |
| Sleep in A | Not present | Task 2 lists sleep metrics only from Output B |
| Calorie goal "set by the user" | Default from persona and goals (e.g. −400 kcal for "Lose weight"), editable in Profile → Daily goals | Sensible start, user-controlled |
| Food from a photo (Task 3 C21) | Kept (simulated) alongside manual entry | An essential task in the brief |
| Readiness, recovery | Not in A (they depend on sleep) | No sleep data in A |

## 3. Visual identity (shared by A, B and C)

The visual identity is "warm graphite, luminous data":
- Background `#433D3D`, text `#F2F0EF`, Arial, as required.
- Category accents for marks only: activity `#FF9E94`, nutrition `#7FD98A`, sleep `#9CCBFF`. Deep versions carry text (≥ 5.6:1).
- One tinted hero card per screen; type scale 16–48 px; pill buttons ≥ 48 px; bottom sheets.
- All contrast ratios are listed in `packages/design-system/src/tokens.css`.
- References (patterns only): Skulpt (week strip, calendar), fitness-ui-mobile (arc gauge, highlighted curve, pills), logpress (big numbers).

## 4. Known limits of A (input for B)
- No sleep tracking, recommendations or satisfaction rating (Task 2 adds them in B).
- Pinning needs a trip to Profile: three taps away from the dashboard.
- Only two personas: regular training and peak performance share one view.
- Keyboard: no shortcut from a page's main action to the navigation bar.
