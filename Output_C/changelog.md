# Output C – Changelog (from Output B)

Output C uses the same code base as A and B with the `ITERATIONS.C` settings (`packages/core/src/iteration.ts`).
- The compliance check against the documents is in [requirements-check.md](requirements-check.md).
- The first, faithful-to-Task-3 versions are kept in `Archive/v1-task3-faithful`.

## Changes from B

| # | Change | Source | Why |
|---|---|---|---|
| C1 | **Pair a smart device (simulated)** in Settings: choose a device, connect (imports 14 days of steps), disconnect | Task 2 changelog B → C | "Smart devices assist the users in tracking their daily habits" |
| C2 | **Sync the device and show sync status**: chip on the dashboard (checking / up to date / no device / failed), **Retry sync** on failure, Sync now in Settings | Task 2 Output C; Task 2 T2/T3 flows | "Syncing smart device", "Sync device status" |
| C3 | **Update persona and lifestyle**: Settings editor for persona, level, workouts per week and training days, what to track, fitness goals, with a preview of the new dashboard before confirming | Task 2 changelog B → C | A casual user who now trains seriously can switch, and the app follows |
| C4 | **Full questionnaire** (lifestyle choices decide the persona): name (+ large text), persona, level, workouts per week (builds the weekly plan), what to track, fitness goals with a live dashboard preview | Task 2 Output C relationships | Persona from habits, not one question |
| C5 | **Accessibility mode**: large font and interface elements, bold labels (questionnaire step 1 and Settings → Display) | Task 2 Output C | Users with accessibility needs |
| C6 | Tabs follow "what you want to track"; other categories go under **More** | Task 2 Output C relationships | Interface shows what matters to the user |
| C7 | **Edit and delete** workouts, meals and sleep logs (with confirmation) | Evaluation of B | Error recovery |
| C8 | Food fallbacks: **edit the photo prediction** before saving; **enter it manually** after a failed recognition | Task 4 brief §5; evaluation of B | A failed photo no longer blocks logging |
| C9 | **New accounts start empty** with a "Get started" checklist and designed empty states | Team decision; brief (empty states) | Honest first use; empty states testable |
| C10 | Fitness Metrics: interactive **history calendar**; workout history filters and "Show more" | Brief (calendar / history interaction) | Long lists are easier to scan |
| C11 | Prototype tools: simulate a sync failure, load sample data, reset | Testing needs | Reviewers can test error paths |

## Kept from B
- Sleep metrics with more detail for performance.
- Three personas.
- Pin / unpin / order on the dashboard.
- Settings top-right and the keyboard rules.
- Recommendations, adaptive "more data?" question, 1–5 rating, quick actions.
- Everything from A: today's workout and calorie goal at the top, return buttons and labels, enter / view workouts and meals, meal quantity, simulated photo recognition, week / month / year charts, confirmations, green / red feedback.

## C.1 (after testing)
See `Final_Testing/fixes-c1.md`. Git tags: `output-c` (before), `output-c1` (after the first fixes), `main` (latest).
