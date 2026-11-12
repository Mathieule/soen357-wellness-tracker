# Student revisions of AI output

> **To be completed by the team.** The AI must not write this section for you:
> it should describe what *you* checked, changed, accepted or rejected.

Suggested format:

| Date | File / screen | AI proposal | What we changed and why | Who |
|---|---|---|---|---|
| | | | | |

Points the AI flagged for your review:
- The app name "Wellness Tracker" is a placeholder (the design documents do not name the app).
- Interpretations in `Output_A/design-decisions.md` §4 (e.g. deep colour shades instead of light ones, nutrient-details button under the ring instead of beside it, Profile kept in the A nav bar).
- Output B extends the back button to Settings (`Output_B/changelog.md`, B5), which goes beyond C22.
- Questionnaire uses Task 3's three questions; Task 2's "fitness goal" step is not included.

Additional points to review for the redesign:
- Three experiences (Casual / Training / Performance) vs two personas in Task 2.
- The readiness estimate formula (45 % sleep, 35 % load balance, 20 % routine) and its wording.
- Default dashboard modules per experience (`packages/core/src/experience.ts`).
- The rule-based training sessions and fuel advice text (`program.ts`, `NutritionScreen.tsx`).
