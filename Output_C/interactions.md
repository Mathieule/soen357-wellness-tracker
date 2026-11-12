# Output C – Interaction annotations

Wireframes: [lo-fi/index.html](lo-fi/index.html) (C-L01 to C-L15 + flow). High-fidelity screens: [hi-fi/index.html](hi-fi/index.html) (C01–C25, exported from the running prototype).

## Navigation

| From | Control | To | Notes |
|---|---|---|---|
| Welcome | Log in (valid) / demo profile | Dashboard | Toast "You are logged in" |
| Welcome | Create account (valid) | Questionnaire | Toast "Account created" |
| Questionnaire | Continue / Back | next / previous step | Continue with no answer shows an inline error |
| Questionnaire (preview) | Create my dashboard | Dashboard (empty account) | Toast "Your profile is saved…" |
| Bottom bar / side rail | Home, the categories the user chose, More | Page / "More" sheet | ← / → move along the bar; Enter keeps focus on the bar |
| Any section page | Back (top-left) | Dashboard | Hidden on large screens, where the side rail is used |
| Any page | Settings (top-right) | Settings | |
| Dashboard | Module title (link) | Matching section | Focus goes to that page's main action |
| Dashboard | Quick action | Workout / photo / night sheet | |

Page changes slide in from the side of the new tab (240 ms), and the slide is removed under reduced motion.

## Screens

### Welcome (C1)
- A segmented control switches between **Log in** and **Create account**. Focus starts in Email.
- Validation runs on submit, with an error under each field and a summary at the top:
  - **Email:** required, and must look like name@example.com.
  - **Password:** required. For a new account it also needs 8 or more characters, with a letter and a number.
- Server-like errors: wrong credentials, and email already used.
- **Try a demo profile:** three cards, one per experience.

### Questionnaire (C2, T1)
- There are 6 steps, one question per page: name (+ "Use large text and bigger buttons"), persona, level, workouts per week, what to track, fitness goals.
- A tap on a single-choice answer (persona, level) moves to the next question automatically. With the keyboard, the user confirms with Continue.
- Continue with no answer shows a red error that says what to do.
- The **workouts per week** step has a − / + stepper (0–7) with a live week preview.
- On the **fitness goals** step, "Create my dashboard" only appears once a goal is chosen, and a live preview lists the dashboard modules.

### Dashboard (C4, T2, T3)
- **Top of the dashboard:** today's workout (or the next one) with the day's **calorie goal**, eaten and left.
- **"Do you want to see more data?"** is shown to casual users when the logged data justifies it, with the reason. **No, thanks** / **Yes, show more**; changeable later in Settings → Display.
- **Recommendations** module.
- **Header:** date, greeting and the sync status chip (syncing / up to date / no device / failed). If sync failed, an inline error offers **Retry sync**.
- **Quick actions:** one tile per chosen category.
- **Modules:** chosen by the experience, or by the user's pins.
  - The hero module is full width.
  - Module titles are links, and ↓ / ↑ move between them; ↓ on the last one goes to the nav bar.
- **Customize** (toggle, `aria-pressed`):
  - Each module gets **Up / Down / Unpin** (screen-reader name "Unpin metric: …"). Focus stays on the arrow button after a move.
  - **Metrics you can pin** lists the others with **Pin metric**, and **Reset to recommended** restores the defaults.
  - Every change is saved immediately, with a toast that states the new position.
- **Empty account:** a **Get started** checklist with 4 actions, each ticked when done.

### Fitness Metrics (C11–C14)
- Each page shows the same label as its widget ("Fitness Metrics", "Nutrition Metrics", "Sleep Metrics") and has a **Return** button.
- The main action is **Enter a new workout** (focus lands here when the page is opened from a module; ↑ goes to the nav bar).
- **Week plan:** a strip of day buttons (← / → move between days). The selected day shows its session and exercises, plus **Log this session**, which pre-fills the form.
- **Workout sheet:**
  - fields: name (required), type chips, date (not in the future), time, duration (1–600, required), intensity, optional calories (estimated if empty) and notes;
  - errors appear under each field plus a summary;
  - the success toast says "Workout saved / updated".
- **Workout detail:** **Edit** opens the same form, and **Delete** asks for confirmation before showing a toast.
- **Workout minutes:** Week / Month / Year.
- **History calendar:** month grid; arrow keys move by a day or a week; days with workouts are filled. The selected day shows steps and its workouts.
- **History:**
  - grouped by day ("Today", "Yesterday", …);
  - type filter chips (`aria-pressed`) and **Show more**;
  - an empty state with an "Add your first workout" button.

### Sleep Metrics (C15–C17)
- **Hours of sleep:** Week / Month / Year.
- **Enter a new sleep log:**
  - fields: date (not in the future, locked when editing), bedtime and wake-up time, with the total shown live;
  - an info message appears if a night already exists for that date (saving replaces it);
  - validation: the sleep must last between 1 and 16 hours.
- **Hypnogram:** four labelled rows (Awake, REM, Light, Deep) in shades of blue. The stage bar shows the percentage of each stage as text.
- **Night detail:** graph, stages, **Edit** and **Delete** (with confirmation).

### Nutrition Metrics (C18–C21)
- **Calorie intake:** Week / Month / Year (Year shows the daily average per month).
- **Scan photo** (simulated):
  1. Take or choose a photo, or pick one of three samples.
  2. "Looking at your photo… (simulated)" is shown while it works.
  3. The prediction shows the food and its nutrients, with meal chips, then **Confirm and save / Edit / Retake**.
  4. On failure, an error offers **Take another photo** and **Enter it manually**.
- **Type it in** opens manual entry: item, meal, **quantity (servings)**, calories (required), protein, carbs and fat (optional), all validated.
- **Edit** on a prediction opens the same form pre-filled ("Check the values").
- **Today's meals** are grouped by meal. An empty meal shows "Nothing yet" with an **Add** button. A meal's detail sheet has **Edit** and **Delete**.
- **Previous days** open a sheet with that day's meals and totals.

### Settings (C3, T4)
- **Display:** "Show more data" and **"Large text and buttons"** (accessibility mode: everything 25 % larger, bold labels).
- **Persona and lifestyle:**
  - goal cards, level chips, sessions stepper and training-day chips (exactly as many days as sessions), and the data that matters;
  - **Save** is disabled until something changes;
  - the confirmation lists the new dashboard modules.
- **Personal information:** validated, then a confirmation dialog, then a toast.
- **Daily goals:** validated ranges.
- **Smart device (simulated):** pick a device and connect (with a loading state); then **Sync now** and **Disconnect** (with confirmation).
- **Rate the app:** 5 star radio buttons with words ("Good"), an optional comment, and an error if no star is chosen.
- **Prototype tools:**
  - a "Simulate a sync failure" switch (60 × 44, showing "On" or "Off");
  - load sample data (with confirmation);
  - reset the prototype.
- **Account:** **Log out**, and **Delete account** with "Are you sure?".

## Pop-ups (all sheets)
- Focus is trapped inside, **Escape** closes the sheet, and focus returns to the control that opened it.
- The 48 px close button is labelled "Close". Confirmation dialogs start on **Cancel**.

## Keyboard summary

| Where | Keys | Result |
|---|---|---|
| Everywhere | Tab / Shift+Tab | Next / previous control; 3 px off-white focus ring |
| Nav bar / side rail | ← → (↑ ↓) | Move between items |
| Dashboard | ↓ / ↑ on module titles | Next / previous module; last ↓ → nav |
| Section pages | ↑ on the main action | Current nav item |
| Week strip, charts | ← / → | Change day / read values (announced) |
| Month calendar | ← → ↑ ↓ | Day / week |
| Sheets | Esc | Close without saving |
