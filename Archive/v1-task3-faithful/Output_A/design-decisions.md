# Output A – Design decisions

Output A reproduces the initial concrete design (Task 3 Output A). This file records how each specification was turned into wireframes and screens, where an interpretation was needed, and which problems were found. Those problems feed Output B and Output C.

## 1. Sources and scope
- **Concept (Task 2):** personas (casual and performance), questionnaire, an adaptive dashboard, the T1–T4 flows, labels, and confirmation and status messages.
- **Concrete design (Task 3 Output A):** components C1–C21 and accessibility requirements AR1–AR15.
- **Starting code:** [shadcndashboard/shadcndashboard](https://github.com/shadcndashboard/shadcndashboard) (MIT). We kept its stack (React 19, Vite 8, Tailwind 4, shadcn on Base UI, Recharts, Lucide) and adapted its `Button`, `Dialog`, `Input`/`Label` primitives and its `cn()` helper. We did **not** reuse its desktop sidebar layout, MSW mocks, tiptap or tables: they are desktop-admin features, and the primitives' defaults (14 px text, 32 px buttons) break AR2 and AR4. See `THIRD_PARTY_NOTICES.md`.

## 2. Colour (AR1, AR3)

All ratios use the WCAG 2.x formula and were computed during this task; they are recorded in `shared/src/theme.css`.

| Token | Hex | Use | Contrast |
|---|---|---|---|
| Background | `#433D3D` | App background (given) | — |
| Text | `#F2F0EF` | All text (given) | 9.37:1 on the background |
| Raised gray | `#5A5353` | Cards, "light gray" fitness top half | text 6.61:1 |
| Nav gray | `#625A5A` | "Light gray" navigation bar (C5) | text 5.91:1 |
| Red surface | `#8E2B2B` | Fitness / activity, errors | text 7.30:1 |
| Green surface | `#2E6B3A` | Nutrition, success, "light green" Add food button | text 5.64:1 |
| Blue surface | `#2B5288` | Sleep, primary buttons | text 6.94:1 |
| Accents | `#FF9E94` `#7FD98A` `#9CCBFF` `#C9E2FF` `#7FB3F0` | Chart lines, rings, dots | 4.87–8.01:1 on the background |
| Field border | `#BDB5B3` | Inputs, outline buttons | 5.28:1 (non-text ≥ 3:1) |

**Decision:** the spec describes "light gray", "light green" and "blue" widgets, but also says all text is `#F2F0EF`. Pure or light shades fail with off-white text: pure red #FF0000 gives 3.52:1, light green with off-white about 1.5:1, and pure blue #0000FF against the background gives 1.24:1. We kept the rule "all text is #F2F0EF" and used **deep shades** for any surface that carries text. Light shades are used only for graphics (chart lines, progress, dots).

**Never colour alone:**
- Every widget has its name written on it.
- Status messages have an icon and the word "Success", "Error" or "Note".
- The active navigation item is bold and underlined.
- Selected answers have a check mark.
- Days with data in the calendar are described in words to screen readers.

## 3. Typography and targets (AR2, AR4)
- **Text:** Arial (Liberation Sans is the metric-compatible fallback on Linux), regular weight for body text and bold for headings. Tailwind's `text-xs` and `text-sm` are clamped to 16 px, so nothing can render smaller.
- **Touch targets:** buttons are at least 48 px tall, navigation items 64 px, list rows 56 px and calendar days 44 × 44 px.

## 4. Interpretations of the specification

| Spec | Interpretation | Why |
|---|---|---|
| C1 "two text fields" | One form with two buttons (Log in, Create account) | Matches C1 exactly; no separate tabs needed |
| C2 three questions | Frequency, persona, important data (multi-select) | C2 lists these three. Task 2 T1 mentions "fitness goals"; we followed the Task 3 concrete design and noted the difference for C |
| C2 "error pops up" | An inline error announced with `role="alert"`, under the answers | Task 2 says users cannot continue without an answer; inline is less disruptive than a modal |
| C4 "modified in user settings" | A "Dashboard widgets" section in Profile (show / hide + order) | In Output A, pin and order are only possible in settings (this is what Output B changes) |
| C5 nav items | Home, Nutrition, Fitness, Sleep, **Profile** | C5 lists four menus; Output B's changelog ("settings are moved off the navigation bar") shows that A also had settings in the bar |
| C5 "large simple image with alt text" | Lucide house, bowl and dumbbell icons, plus a custom "Zzz" icon; the visible label is the accessible name and the icon is `aria-hidden` | Announcing "house image, Home" repeats the information; the label gives a text alternative (AR6 intent) |
| C7 "rounded square" | Fitness spans the full width; nutrition and sleep are squares | C4 asks for fitness first and widgets in the top 80 % |
| C8 "top half light gray, bottom half red" | Gray `#5A5353` top, red `#8E2B2B` bottom labelled "Fitness Metrics" | Contrast (section 2) |
| C14 "button that opens a calendar" | A month-grid pop-up with arrow-key navigation | No calendar existed in the template that met 44 px targets; a small custom grid was simpler |
| C17 "line graph in shades of blue" | A Recharts step-line hypnogram plus a text list of stage minutes | A step line is the usual sleep-stage chart; the text list avoids colour-only legends |
| C18 "button to the side" (nutrient details) | Button **under** the ring and the numbers | At 390 px there is no room beside the ring and numbers without shrinking text below 16 px |
| C21 "take a photo" | `<input type=file accept=image/* capture>` plus three sample photos | The camera opens on phones; samples let reviewers test the success and failure paths |
| Profile picture (C3) | An initials avatar with `role="img"` and alt text | There is no photo upload in the prototype |

## 5. Simulations (stated clearly in the interface)
- **Authentication** is in localStorage only, with a demo account. A banner on the login page says so.
- **Food recognition** is a keyword/hash lookup in a 10-food table after a 1.2 s delay, with forced failure for "blurry" photos. The pop-up says "Prototype: food recognition is simulated".
- **Activity, sleep and meals** are seeded sample data (deterministic and relative to today). Sleep stages for hand-entered sleep are generated and labelled "estimated (simulated)".
- **New accounts** get the same sample history, so every screen can be explored.

## 6. Problems found in Output A (input for B and C)
These are design observations made while building A. They are **not** user-test results.

| ID | Problem | Effect | Addressed in |
|---|---|---|---|
| A-P1 | No back button; leaving a sub-page needs the nav bar | Unclear way back; long keyboard path (AR7 "Somewhat") | **B** |
| A-P2 | Pinning and ordering only in Profile | Task 2 T3 expects pinning from the metric / dashboard | **B** |
| A-P3 | Settings take one of five nav slots | Crowded bar, less room per label | **B** |
| A-P4 | The dashboard always pulls focus to the first widget, even after the user chose a nav item | Keyboard users lose their place | **B** |
| A-P5 | The food log shows today only; no meal history or calorie graph by week, month or year | Task 2 "browse previous nutrition history" and T3 unsupported | C |
| A-P6 | No manual food entry when recognition fails | A user with a bad camera cannot log food | C |
| A-P7 | No satisfaction rating (1–5) and no smart-device connection | Task 2 main actions missing | C |
| A-P8 | Disabled buttons and future calendar days are dimmed below 4.5:1 | Conflicts with the team's AR3 wording ("all text") even though WCAG exempts disabled controls | C |
| A-P9 | New accounts are pre-filled with sample history, so empty states are rarely seen | Hard to test empty states | C |
| A-P10 | Workouts and meals cannot be edited or deleted; only sleep can be edited | Error recovery | C |
| A-P11 | No data-sync status or retry (Task 2 T2 / T3 flows) | Flow step missing | C (simulated) |
| A-P12 | The sign-up form has no name; the name is guessed from the email | The greeting can be wrong until the user edits their profile | C |
