# What the AI produced

All outputs are files in this repository. Nothing was submitted or published by the AI.

## Response to P1 (plan only, no files)
- Inspected the empty project folder and reported that the starter dashboard and the Task 2/3 documents were missing.
- Computed WCAG contrast for the required colours and found that pure red (#FF0000, 2.66:1) and pure blue (#0000FF, 1.24:1) fail on #433D3D; proposed lighter accent shades.
- Proposed a step-by-step plan and asked for the documents.

## Response to P2 (Output A and Output B)

| Area | Files | Notes |
|---|---|---|
| Workspace | `package.json`, `.gitignore`, `README.md`, `THIRD_PARTY_NOTICES.md` | npm workspaces for the A and B apps |
| Shared code | `shared/src/**` | types, seeded sample data, localStorage wrapper, simulated food recognition, theme tokens with contrast notes, adapted shadcn primitives (button, dialog, field), status message, choice list, avatar, food illustrations, sleep stage chart, calorie ring / macro bars, activity calendar |
| Output A hi-fi | `Output_A/hi-fi/app/**` | routes, nav bar, sign up/log in, questionnaire, dashboard + widgets, fitness / sleep / nutrition menus with pop-ups, profile with confirmations |
| Output B hi-fi | `Output_B/hi-fi/app/**` | copy of A + changelog items B1–B4 (back button, pin/unpin/reorder on dashboard, settings button top-right, keyboard focus rules) |
| Lo-fi tooling | `tools/lofi/*.mjs` | wireframe DSL, SVG generator, PNG export |
| Lo-fi specs | `Output_A/lo-fi/spec.mjs`, `Output_B/lo-fi/spec.mjs` | 15 + 16 screens and two flow diagrams; B patches A |
| Screenshots | `tools/screenshots/capture.mjs`, `Output_*/hi-fi/screens.mjs` | 24 + 29 scripted screens at 390 × 844 |
| Docs | `Output_A/interactions.md`, `Output_A/design-decisions.md`, `Output_B/interactions.md`, `Output_B/changelog.md` | |

Design choices made by the AI that the team should review are listed in `Output_A/design-decisions.md` §4 ("Interpretations") and in `Output_B/changelog.md` ("Supporting adjustments").
