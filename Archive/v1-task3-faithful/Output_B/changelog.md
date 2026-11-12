# Output B – Changelog

Output B starts from Output A, which stays unchanged in `Output_A/`. The B app in `hi-fi/app` began as a copy of the A app, and the changes below were then applied to it. The B wireframes ([lo-fi/spec.mjs](lo-fi/spec.mjs)) import the A wireframes and patch them; every change is drawn with a **red dashed outline**.

Source: Task 3, "Output B – Changelog" (four items) and component **C22 Back button**.

| # | Change (Task 3 Output B) | Why it was introduced | Where in the code | Screens |
|---|---|---|---|---|
| B1 | **Back button** in the top-left corner of the Fitness, Sleep and Nutrition menus, going to the dashboard. It is a light gray arrow the same size as the nav bar buttons (64 × 64 px) and does not appear on the dashboard (C22) | Output A had no visible way back except the nav bar (A-P1). Task 2 says "there are return buttons until the user reaches the dashboard" | `src/components/TopBar.tsx` | B-L07, B-L10, B-L12 · B09, B14, B17 |
| B2 | **Pin, unpin and reorder widgets from the dashboard** instead of user settings: **Customize dashboard**, then each widget gets **Up / Down / Unpin**; unpinned metrics go to **More metrics** with a **Pin** button | In A, pinning was hidden in Profile (A-P2). This follows the Task 2 T3 flow ("View additional metrics → Sleep Metrics → Pin to home screen") | `src/pages/DashboardPage.tsx` | B-L05, B-L06 · B25–B27 |
| B3 | **Settings moved off the navigation bar**; a **Settings** button now sits in the top-right corner of the dashboard and the sub-menus. The "Dashboard widgets" section was removed from Settings and points to Customize instead | Frees a nav slot (A-P3); settings are used less often than the metric menus | `src/layout/NavBar.tsx`, `src/components/TopBar.tsx`, `src/pages/SettingsPage.tsx`, route `/settings` | B-L04, B-L15 · B08, B22 |
| B4 | **Keyboard focus between widgets, menus and the nav bar:** opening a menu **from a widget** focuses its main action (Add exercise / Add or edit sleep / Add food); opening it **from the nav bar** keeps focus on the bar; **↑** on the main action jumps to the current nav item; **← / →** move along the nav bar | Task 3 AR7 was only "Somewhat" met in A (long logs to Tab through) and A-P4 (the dashboard stole focus from the nav bar) | `src/lib/focus.ts`, `NavBar.tsx`, `Widgets.tsx` (`state: { via: 'widget' }`), all three menus | B28, B29 |

## Supporting adjustments (needed to make B1–B4 work)

| # | Adjustment | Reason |
|---|---|---|
| B5 | Settings also shows the Back button | Settings no longer has a nav item, so without it the only way out would be the nav bar. C22 limits the back button to sub-menus; we extended it to Settings for consistency (AR12) and note this as a deviation |
| B6 | After **Move up / Move down / Pin / Unpin**, focus is moved back to a sensible control (the same arrow button, or Customize) | Reordering moves DOM nodes, and the browser can drop focus; without this, keyboard users would be sent back to the top of the page |
| B7 | Customize mode shows one widget per row | Three controls under a half-width widget would not fit 44 px targets at 390 px |
| B8 | Each pin, unpin or move shows a success message ("Sleep Metrics moved up to position 2 of 3.") | AR10: every data change needs a status message; the position helps screen-reader users |
| B9 | Page-slide direction: Settings counts as "to the right" of all menus | Settings is no longer in the bar (C5 slide rule) |

## Unchanged from A (preserved functionality)
Sign up and log in with all their errors, the questionnaire, the persona-based widgets, Add exercise and its validation, workout detail, the activity calendar, the sleep graph, add/edit sleep, sleep detail, nutrition goals and details, simulated photo recognition (success and failure), meal detail, personal information and fitness profile with confirmation, log out, delete account with "Are you sure?", and the reset prototype data button. All B screens B01–B24 match A01–A24.

## Verification done
- `npm run build:b` passes, including the TypeScript check.
- `npm run screens:b` ran all 29 scripted scenarios in headless Chromium at 390 × 844 with no failures. Scenarios B25–B29 exercise the new features, including ↑ from **Add exercise** to the nav bar and ← along the bar.
- The screenshots were checked visually (B25 customize, B27 more metrics, B28 focus ring on the nav item).
- **Not done yet:** a manual screen-reader pass and tests with real users. These are planned for the Output C test phase.

## Still open after B (carried to C)
A-P5 to A-P12 from `Output_A/design-decisions.md`. In addition:
- **B-P1:** when only one square widget stays in a row (for example after unpinning Nutrition), it keeps half width and leaves an empty space.
- **B-P2:** in the sub-page headers, the title wraps to two lines between the 64 px Back and Settings buttons.
