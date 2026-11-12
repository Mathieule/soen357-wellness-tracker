# Output A – Interaction annotations

- **Low-fidelity:** [lo-fi/index.html](lo-fi/index.html) (A-L01 to A-L12 and the flow)
- **High-fidelity:** [hi-fi/index.html](hi-fi/index.html) (A01–A20)
- **Run:** `npm run dev:a`, then open http://localhost:5171

## Navigation

| From | Control | To |
|---|---|---|
| Welcome | Create account (valid) | Questionnaire Q1 |
| Welcome | Log in / demo profile (Sam = Casual, Jordan = Performance) | Dashboard |
| Q1 persona | Tap an answer (or Continue) | Q2 fitness goals |
| Q2 goals | Choose ≥ 1 goal → **Create my dashboard** appears | Dashboard |
| Bottom bar | Home · Fitness · Nutrition · Profile | That page |
| Dashboard | Widget title ("Fitness Metrics", "Nutrition Metrics"…) | The page with the same label |
| Dashboard | **Pin metrics** | Profile → Dashboard metrics |
| Any metrics page | **Return** (top-left) | Dashboard |

## Screens

### Questionnaire (T1)
- **Q1 persona:** Casual user / Performance athlete. A tap moves to Q2. Continue with no answer shows a red error: "Choose the profile that fits you to continue."
- **Q2 fitness goals** (multiple choice): Lose weight, Build strength, Improve endurance, Stay healthy and active. **Create my dashboard** appears only after one goal is chosen. **Back** returns to Q1.

### Dashboard (T2)
- **Top:** **Today's workout** (or the next one) with the **calorie goal** (goal, eaten, left).
- **Casual:** "Do you want to see more data?" (**No, thanks** / **Yes, show more**), then the steps gauge and Nutrition Metrics. "Yes" adds This week and Fitness Metrics, and more detail on the pages.
- **Performance:** today's workout, training load (rolling 7 days), Nutrition Metrics with macros, this week, Fitness Metrics.
- **Keyboard:** focus starts on the first widget title; ↓ / ↑ move between widgets; ↓ on the last one goes to the bottom bar.

### Fitness Metrics
- **Enter a new workout** (focus starts here): name, type, date (not in the future), time, duration 1–600, intensity, optional calories. Errors appear per field with a summary; the green toast says "Workout saved".
- **Plan** (Performance or "more data"): week strip and the selected day's exercises, with **Log this session**. Casual: next workout.
- **This month:** workouts, time, average, burned.
- **Workout minutes:** Week / Month / Year.
- **Previous workouts:** grouped by day; a tap opens the details, with a **Return** button.

### Nutrition Metrics
- **Scan photo** (simulated recognition): sample photos or a file; the prediction shows **Confirm and save** / **Retake**; a failure shows a red error and **Take another photo**.
- **Type it in:** item, meal chips, **quantity (servings)**, calories, protein / carbs / fat, all validated.
- **Today:** ring and kcal left; macros for Performance.
- **Today's meals** by meal; a tap opens the meal details.
- **Calorie intake:** Week (daily bars), Month (daily curve), Year (monthly average).
- **Previous meals:** by day; a tap shows that day's meals.

### Profile (T4)
- **Persona and goals:** change persona (2 options) and goals. **Save persona** opens "Change your persona to …?" with a preview of the new dashboard. Cancel changes nothing; Yes updates the dashboard and shows a green toast.
- **Dashboard metrics (pin in settings):** pinned metrics in order with ↑ / ↓ / **Unpin metric**; not-pinned metrics with **Pin metric**; Reset to recommended. Each change shows a toast.
- **Personal information** (name, age, weight, height): validation, then "Save your personal information?".
- **Daily goals** (steps, active minutes, calories, sleep hours).
- **Display:** "Show more data" switch.
- **Prototype tools**, **Log out**, **Delete account** ("Are you sure?").

## Feedback
Success messages are green toasts (icon and the word "Done"). Errors are red, next to the field, with a summary (icon and the word "Error") and a way to fix them.
