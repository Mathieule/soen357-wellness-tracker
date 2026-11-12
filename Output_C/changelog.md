# Output C – Changelog

Output C starts from the archived Output B (`Archive/v1-task3-faithful/Output_B`, git tag `v1-task3-faithful`). Every change below lists the problem it addresses: the A-P*/B-P* IDs come from the archived `design-decisions.md` and `changelog.md`.

## Kept from Output B
- Back button top-left on section pages (C22).
- Settings as a top-right button, not in the nav bar.
- Pin, unpin and reorder on the dashboard.
- Keyboard focus rules (↑ to nav, focus kept on nav, ← / → on nav).
- Every Output A function: sign up and log in with all errors, questionnaire, widgets, add workout, workout detail, activity calendar, sleep graph, add/edit sleep, nutrition goals, simulated photo recognition with success and failure, meal detail, profile with confirmations, delete account with "Are you sure?".

## Changes

| # | Change | Why | Addresses |
|---|---|---|---|
| C-01 | New visual identity and design system (`packages/design-system`): surfaces, tinted heroes, type scale, pill buttons, bottom sheets, toasts, charts | v1 looked like a generic student dashboard; the brief asks for a premium, coherent product | Visual brief |
| C-02 | **Personalization engine** with three experiences (Casual / Training / Performance) driving dashboard, pages, tabs, detail and wording | In v1 the questionnaire barely changed the interface; frequency had no effect | Task 2 concept; user feedback on v1 |
| C-03 | Questionnaire: 6 steps (name, goal, level, **sessions per week 0–7**, data, preview of your experience) | Sessions per week now builds the weekly plan; the preview makes the result predictable | Task 2 T1 ("fitness goal"); team decision |
| C-04 | Weekly training plan (days, sessions, exercises), "Log this session" pre-fills the form, progress "n of m done" | Turns the routine (C13) into a real schedule | Task 3 C13; team request |
| C-05 | Unchosen categories move from the tab bar to a "More" sheet | Interface adapts to what matters to the user | B-P1 context, brief |
| C-06 | New accounts start **empty**, with a "Get started" checklist and designed empty states on every list | Lets testers see empty states; avoids fake history for new users | A-P9 |
| C-07 | Edit and delete for workouts, meals and nights (with confirmation) | Error recovery | A-P10 |
| C-08 | Nutrition: manual entry, **edit the prediction** before saving, "Enter it manually" after a failed recognition | A user whose photo fails can still log food | A-P6, brief |
| C-09 | History: previous days' meals, workout history grouped by day with type filters and "Show more", month calendar with workout days | Task 2 "browse previous history"; long lists were hard to scan | A-P5, AR7 |
| C-10 | Charts: steps, training minutes, rolling training load, 7/14-night sleep, calories, hypnogram, stage bar, macro rings, readiness | Task 2 "progress charts"; performance users want trends and comparisons | A-P5 |
| C-11 | Settings: experience editor with preview, training days, daily goals, **smart device (simulated)**, **rate the app 1–5**, prototype tools | Missing Task 2 main actions | A-P7 |
| C-12 | Simulated data-sync status with "Retry sync" on failure | Task 2 T2/T3 flows ("check synchronization → retry") | A-P11 |
| C-13 | Name asked in the questionnaire | Greeting was guessed from the email | A-P12 |
| C-14 | Sub-page header on two rows (Back / Settings, then title) | Title wrapped between buttons | B-P2 |
| C-15 | Dashboard modules full width (2 columns only on large screens) | Lonely half-width widget | B-P1 |
| C-16 | Disabled controls keep full-contrast text | Below 4.5:1 in v1 | A-P8 |
| C-17 | Quick actions on the dashboard (log workout / add meal / add night) | Fewer steps for frequent entries | Brief |
| C-18 | Responsive layout with side navigation from 1024 px | Brief: works on larger screens | Brief |

## C.1 (after testing)
See `Final_Testing/fixes-c1.md`. The original Output C is kept as the git tag `output-c`; the C.1 changes are on `main`.
