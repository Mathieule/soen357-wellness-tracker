# Wellness Tracker – SOEN 357 prototyping project

> Sample prototype for learning and educational purposes only. Not for commercial use or commercial testing.

A mobile-first fitness and wellness app for casual users and athletes, built in three iterations (**Output A → B → C**) following the team's conceptual design (Task 2), concrete design (Task 3) and the Task 4 brief. All three versions share one design system and one personalization engine. Each version is a configuration (`packages/core/src/iteration.ts`) that turns its features on or off.

---

## 1. Install (once)

Requirements: **Node.js 20+** and npm (tested with Node 26 / npm 11).

```bash
git clone <this repository>
cd <repository folder>
npm install
```

## 2. Run each version

| Version | Command | Open | What it is |
|---|---|---|---|
| **Output A** | `npm run dev:a` | http://localhost:5171 | Initial design: 2 personas, calories and workouts, pin metrics in Profile |
| **Output B** | `npm run dev:b` | http://localhost:5172 | Revised: + sleep, 3 personas, pin on the dashboard, recommendations, rating |
| **Output C** | `npm run dev` (or `dev:c`) | http://localhost:5173 | Final: + smart device and sync, lifestyle editor, accessibility mode, edit / delete, empty accounts |

**View it as a phone:** open the URL in Chrome or Edge, press **F12**, then **Ctrl+Shift+M**, and choose a 390 × 844 device (e.g. iPhone 12/13/14). From 1024 px wide, the app uses a side navigation bar.

**Log in:** on the welcome screen, use **Try a demo profile**, or create an account (it goes through the questionnaire). Every demo account uses the password `Demo1234`.

| Demo account | Persona | In A | In B | In C |
|---|---|---|---|---|
| Sam Lee (sam@example.com) | Casual | yes | yes | yes |
| Alex Martin (alex@example.com) | Regular training | – | yes | yes |
| Jordan Rivera (jordan@example.com) | Performance | yes | yes | yes |

To reset everything: **Profile / Settings → Prototype tools → Reset the whole prototype**. Each version keeps its own data.

### Production build

```bash
npm run build                  # type check + build A, B and C
npm run preview:a              # serve the A build (http://localhost:4171)
npm run preview:b              # B (4172)
npm run preview                # C (4173)
```

The builds use relative paths and a hash router, so `dist/` folders can be served from any static host.

## 3. Look at the designs

Each version has the same structure:

```
Output_X/
  lo-fi/index.html     ← low-fidelity wireframes (open in a browser)
  lo-fi/flow.svg         navigation flow diagram
  lo-fi/screens/*.svg    one editable SVG per screen (source: lo-fi/spec.mjs)
  lo-fi/png/*.png        PNG exports
  hi-fi/index.html     ← high-fidelity screens gallery (open in a browser)
  hi-fi/screens/*.png    screens exported from the running app (390 × 844)
  interactions.md        interaction annotations
  design-decisions.md    (A, C) decisions and traceability to the documents
  changelog.md           (B, C) what changed from the previous version and why
```

| | Low-fidelity | High-fidelity | Docs |
|---|---|---|---|
| **A** | [Output_A/lo-fi/index.html](Output_A/lo-fi/index.html) (12 screens) | [Output_A/hi-fi/index.html](Output_A/hi-fi/index.html) (20 screens) | [interactions](Output_A/interactions.md) · [design decisions](Output_A/design-decisions.md) |
| **B** | [Output_B/lo-fi/index.html](Output_B/lo-fi/index.html) (9 screens, changes in red) | [Output_B/hi-fi/index.html](Output_B/hi-fi/index.html) (14 screens) | [interactions](Output_B/interactions.md) · [changelog](Output_B/changelog.md) |
| **C** | [Output_C/lo-fi/index.html](Output_C/lo-fi/index.html) (15 screens) | [Output_C/hi-fi/index.html](Output_C/hi-fi/index.html) (27 screens) | [README](Output_C/README.md) · [interactions](Output_C/interactions.md) · [design decisions](Output_C/design-decisions.md) · [changelog](Output_C/changelog.md) · [requirements check](Output_C/requirements-check.md) |

On GitHub you can browse the PNG and SVG files directly. To see the HTML galleries, clone the repository and open the `index.html` files in a browser.

## 4. What changes between versions

| Feature | A | B | C |
|---|:-:|:-:|:-:|
| Questionnaire: persona → fitness goals (auto-advance; "Create" only after a goal) | ✓ | ✓ | ✓ (6 steps: + name, level, workouts per week, what to track) |
| Personas | Casual, Performance | + Regular training | same as B |
| Today's workout and calorie goal at the top; "Return" buttons; "Fitness Metrics" labels | ✓ | ✓ | ✓ |
| Workouts, meals (photo simulated + manual with quantity), charts week / month / year | ✓ | ✓ | ✓ |
| "Do you want to see more data?" | from the start | when your data justifies it | when your data justifies it |
| Pin / unpin / order metrics | in Profile | on the dashboard | on the dashboard |
| Settings | "Profile" tab | top-right button | top-right button |
| Sleep metrics (more detail for performance) | – | ✓ | ✓ |
| Recommendations, rating 1–5, quick actions, keyboard rules | – | ✓ | ✓ |
| Smart device pairing + sync status | – | – | ✓ (simulated) |
| Update persona and lifestyle (habits changed) | persona only | persona only | full editor |
| Accessibility mode (large text, bold labels) | – | – | ✓ |
| Edit / delete entries; edit a photo prediction; manual entry after a failed photo | – | – | ✓ |
| New accounts | sample history | sample history | empty + "Get started" |

## 5. Testing (Output C)

```bash
npm run build
npm run test:c        # writes Final_Testing/test-results.md
```

- [Final_Testing/test-plan.md](Final_Testing/test-plan.md) · [test-results.md](Final_Testing/test-results.md) · [fixes-c1.md](Final_Testing/fixes-c1.md)
- These are scripted checks (Playwright + axe-core). No tests with participants were run.

The test and screenshot tools need Chromium. They use `~/.cache/ms-playwright/chromium-1140` or `CHROMIUM_PATH`; you can install it with `npx playwright-core install chromium`. On Ubuntu/WSL you may also need `sudo apt install libnss3 libasound2t64 fonts-liberation`.

Regenerate the design files:

```bash
npm run lofi          # wireframes (SVG + boards) for A, B, C
npm run lofi:png      # wireframe PNGs
npm run screens       # hi-fi screenshots for A, B, C (needs a build)
```

## 6. What is simulated

- Accounts and login (browser storage).
- Food recognition from a photo (file-name / hash lookup; "blurry" photos fail).
- Smart device and sync (generated steps; a forced-failure switch exists).
- Sleep stages for hand-entered nights.
- The readiness estimate.

Nothing uses real people, devices, biometrics or AI. Details are in [Output_C/README.md](Output_C/README.md).

## 7. Repository structure

```
packages/design-system/   tokens, components, charts                  (@ds)
packages/core/            data model, sample data, personalization
                          engine, iteration settings, metrics,
                          simulations, store                          (@core)
packages/screens/         all screens                                 (@screens)
Output_A/  Output_B/  Output_C/   app entry + lo-fi + hi-fi + docs per version
Final_Testing/            test plan, results, C.1 fixes, screenshots
Archive/v1-task3-faithful/  first A/B built literally from Task 3 (npm run archive:a / archive:b)
tools/                    wireframe generator, screenshot exporter, test runner
AI_Documentation/         prompts, AI outputs, student revisions, verification
```

## Credits
- The component approach was adapted from [shadcndashboard](https://github.com/shadcndashboard/shadcndashboard) (MIT).
- Visual inspiration came from Skulpt, fitness-ui-mobile and logpress-public (patterns only, no code copied). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
