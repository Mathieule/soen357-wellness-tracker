# Output B – Changelog (from Output A)

Output B uses the same code base as A with the `ITERATIONS.B` settings (`packages/core/src/iteration.ts`). Each row says which document asks for it and why it improves A.

| # | Change | Source | Why |
|---|---|---|---|
| B1 | **Pin, unpin and order metrics directly on the dashboard** ("Customize": Up / Down / Unpin, "Metrics you can pin", Reset). The Profile section is removed | Task 2 changelog A → B; Task 3 Output B | In A, pinning was three taps away in settings |
| B2 | **Sleep metrics:** Sleep tab, "Enter a new sleep log", last night, previous sleep logs with detail and edit, hours of sleep for week / month / year, sleep module on the dashboard | Task 2 Output B (concept, content group, "Completing a sleep log") | Sleep was missing from the concept |
| B3 | **More detail for performance users:** hypnogram, stage percentages with typical ranges, bedtime regularity, readiness estimate. Casual users see the duration only | Task 2 changelog A → B ("sleep metrics for performance users") | The fitness group decides how much is shown |
| B4 | **Third persona "Regular training":** week plan, training volume, recovery first | Team redesign brief (user-dependent experiences) | Training and peak performance need different screens |
| B5 | **Recommendations** module (sleep timing, protein, workouts left, load) | Task 2 Output B concepts | "Recommendation" concept |
| B6 | **Adaptive "Do you want to see more data?"**: asked to casual users when their logged data shows more activity (≥ 4 workouts in 14 days or ≥ 10 meals in 7 days), with the reason shown | Task 2 Output B: "the information the user enters is used to later adapt the dashboard" | The app adjusts over time instead of asking at once |
| B7 | **Rate the app 1–5** in Settings, with an optional comment | Task 2 Output B (Responding) | Satisfaction feedback |
| B8 | **Settings moved off the bottom bar** to a top-right button; the bar becomes Home · Fitness · Nutrition · Sleep | Task 3 Output B changelog | Frees a slot for Sleep; settings are used less often |
| B9 | **Keyboard rules:** a page opened from a widget focuses its main action; one opened from the bar keeps focus on the bar; ↑ on the main action goes to the bar; ← / → move along the bar | Task 3 Output B changelog | Shorter keyboard paths (AR7) |
| B10 | **Quick actions** on the dashboard (Log workout / Add meal / Add sleep log) | Redesign brief | Fewer steps for daily entries |
| B11 | "Sleep better" fitness goal | Follows B2 | Goal related to the new metric |

## Unchanged from A
- Questionnaire (persona → goals, auto-advance, Create button rule).
- Today's workout and calorie goal at the top.
- Return buttons and labels ("Fitness Metrics", "Pin metric", "Unpin metric").
- Enter / view workouts and meals, simulated photo recognition with failure, meal quantity.
- Week / month / year charts.
- Profile edits with confirmation, delete account, green / red feedback.

## Still open after B (addressed in C)
- No smart device or sync status (Task 2 Output C).
- The persona editor only changes persona and goals, not habits such as workouts per week or what to track (Task 2 Output C: update persona when habits change).
- No accessibility mode with large text (Task 2 Output C).
- Mistakes in workouts and meals cannot be fixed (no edit / delete); a failed photo has no manual fallback (found during C evaluation).
- New accounts are pre-filled with sample history, so empty states are never seen.
