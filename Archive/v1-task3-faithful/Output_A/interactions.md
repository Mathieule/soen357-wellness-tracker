# Output A – Interaction annotations

Initial design, reproduced from **Task 3 Output A** (components C1–C21) and the **Task 2** screen hierarchy.

- **Low-fidelity:** [lo-fi/index.html](lo-fi/index.html). The source is [lo-fi/spec.mjs](lo-fi/spec.mjs). The board shows SVG screens A-L01 to A-L15 and a navigation map in [lo-fi/flow.svg](lo-fi/flow.svg). PNG copies are in `lo-fi/png/`.
- **High-fidelity:** a clickable React app in [hi-fi/app](hi-fi/app), with exported screens in `hi-fi/screens/` (A01–A24).

All data is sample data, and every "smart" feature is simulated (see the root README).

## Navigation model

| From | Control | Goes to | Notes |
|---|---|---|---|
| Sign up / log in | **Log in** (valid demo or created account) | Dashboard | Success message on the dashboard |
| Sign up / log in | **Create account** | Questionnaire Q1 | "Account created" message |
| Questionnaire | **Next** / **Back** | next / previous question | Next shows an error if nothing is selected |
| Questionnaire Q3 | **Create my dashboard** | Dashboard | Profile saved; "dashboard is ready" message |
| Dashboard | Fitness / Nutrition / Sleep widget | matching menu | Whole widget is one link |
| Any signed-in page | Bottom bar: Home, Nutrition, Fitness, Sleep, **Profile** | that menu | The current item is bold, underlined and has `aria-current="page"` |
| Profile | **Log out** | Sign up / log in | |
| Profile | **Delete account** → **Delete my account** | Sign up / log in | "Account deleted" message |

There is **no back button** in Output A. The navigation bar is the only way between menus (Task 3 AR12: "the app is united by the navigation bar").

Pages slide in from the left or right, depending on where the new menu sits in the bar compared with the old one (C5). The slide is 220 ms and is disabled when the system asks for reduced motion (AR8).

## Screen-by-screen interactions

### C1 Sign up / log in (A01–A04)
- There is one form with **Email** and **Password**, and two actions: **Log in** and **Create account**. Focus starts in Email, then goes to Password (C1).
- **Validation runs on submit.** The email must be filled and look like `name@example.com`. For a new account, the password needs 8+ characters with a letter and a number. Each error appears under its field (linked with `aria-describedby`, with `aria-invalid` set), and a summary error appears at the top (AR9, AR10).
- **Wrong login** shows "The email or password is incorrect…". **Existing email** on Create account shows "An account with this email already exists. Log in instead."
- **Simulated:** accounts are stored in localStorage, and the demo account is `demo@example.com` / `Demo1234`.

### C2 Questionnaire (A05–A07)
- There is one question per page, with a progress bar ("Question n of 3") and a horizontal bar between the question and its answers. Answers are 16 px apart.
- Q1 asks about exercise frequency (single choice). Q2 asks about needs, Casual or Performance (single choice, which sets the persona). Q3 asks what data is important (multiple choice: Fitness, Nutrition, Sleep).
- Focus moves to the first answer of each question. The native radio and checkbox inputs inside a `fieldset`/`legend` support Tab, the arrow keys and Space.
- Pressing **Next** or **Create my dashboard** with nothing chosen shows an error ("Choose … to continue") announced with `role="alert"`.

### C4 Dashboard with C6–C10 widgets (A08)
- The fitness widget is full width at the top: a gray upper half with today's routine and activity, and a red lower half labelled "Fitness Metrics". Nutrition (green) and Sleep (blue) sit side by side below it.
- **Only the metrics chosen in Q3 are shown**, in the order set in Profile.
- **Persona adaptation (Task 2):** Performance users also see calories burned, macros and deep/REM sleep. Casual users see a shorter routine and fewer numbers.
- **Keyboard:** focus starts on the first widget. **↓ / ↑** moves between widgets, and **↓** on the last widget moves to the navigation bar (C4).

### C11–C14 Fitness Metrics (A09–A13)
- The page shows today's routine (left), today's activity (right, with a **Calendar** button), the red **Add exercise** button, and the exercise log (newest first).
- **Focus starts on Add exercise** (C11).
- **Add exercise pop-up:** name (required), type, date (not in the future), start time, duration (1–600 min, required), and optional calories (estimated if left empty) and notes. Errors show per field plus a summary. **Save** closes the pop-up and shows "Exercise saved: …". **Cancel**, ✕ or Escape closes it without saving.
- **Log row:** opens the workout detail pop-up (type, duration, calories, time, notes).
- **Calendar pop-up:** a month grid with previous/next month buttons (next is disabled for future months). Days with data show a dot and say "4,730 steps" in their accessible name. **Arrow keys** move by a day or a week, and the selected day's steps, active minutes and calories are shown below.

### C15–C17 Sleep Metrics (A14–A16)
- The page shows last night's sleep: the duration, then a stepped **line graph of sleep stages in shades of blue** (stage names on the y-axis, clock times on the x-axis, with a hover/touch tooltip). Below the graph is a text list of the minutes per stage, and a text summary is given to screen readers.
- **Add or edit sleep** (focus starts here) opens a form with the wake-up date, bedtime and wake-up time. The total updates live. If the date already has sleep, an info message says that saving will replace it. Validation: the date cannot be in the future, and sleep must last between 1 and 16 hours.
- **Sleep log row** opens "Sleep on <date>" with its graph and an **Edit sleep** button, which opens the same form pre-filled (the date is locked).
- The success message says either "Sleep added…" or "Sleep updated…".
- **Simulated:** stages for hand-entered sleep are estimated by the sample generator.

### C18–C21 Nutrition Metrics (A17–A21)
- **Today's goals** show a calorie ring with the numbers beside it, plus a **Nutrient details** button. The details pop-up has labelled progress bars for calories, protein, carbohydrates and fat.
- **Add food** (light green bar; focus starts here) opens a photo flow:
  1. **Take or choose a photo** (file input, which opens the camera on phones), or pick one of three sample photos.
  2. "Looking at your photo… (simulated)" shows for about 1.2 s.
  3. **The prediction** shows the food name, kcal and macros, plus a meal select. The user chooses **Confirm and save** or **Retake photo**.
  4. **If recognition fails** (the "Blurry photo" sample, or a file name containing *blur*, *dark* or *fail*), an error appears with **Take another photo**.
- After saving, the meal appears in today's log and the message "Food saved: … added to lunch." is shown.
- **Log row** opens the meal detail pop-up (kcal, macros, how it was added).

### C3 Profile and settings (A22–A24)
- The page shows an avatar (initials, `role="img"` with alt text), the name and the email, then a horizontal bar and the sections below.
- **Personal information** (name, age, weight, height) is validated, then **confirmed a second time** (Task 2), then a success message is shown.
- **Fitness profile** (persona, frequency) asks to confirm "Change your fitness profile?". On confirmation, the dashboard and the calorie and macro goals change.
- **Dashboard widgets (A only):** a checkbox shows or hides each metric, and **Move up / Move down** buttons reorder them. **Save** shows a success message; hiding every widget shows an error.
- **Log out**, then a bar, then **Delete account**, which asks **"Are you sure?"** (focus starts on Cancel).
- **Reset prototype data** is a testing aid that clears this iteration's localStorage.

## Pop-up behaviour (all dialogs)
- Pop-ups use the Base UI Dialog adapted from the shadcn template. Focus is trapped inside, **Escape** closes the dialog, focus returns to the button that opened it, and the title and description are announced.
- The close button is 48 × 48 px and labelled "Close".

## Keyboard summary (Output A)

| Where | Keys | Result |
|---|---|---|
| Everywhere | Tab / Shift+Tab | Next / previous control; a 3 px off-white focus ring is always visible |
| Dashboard | ↓ / ↑ | Next / previous widget; ↓ on the last widget → nav bar |
| Questionnaire | Arrows / Space | Choose an answer |
| Calendar | ← → ↑ ↓ | Previous/next day, previous/next week |
| Pop-ups | Esc | Close without saving |

**Known limitation (Task 3 AR7, "Somewhat"):** to reach the navigation bar from a menu, a keyboard user must Tab through the whole log. Output B addresses this.
