# Output C – Design decisions

Sources: Task 2 (conceptual design), Task 3 Output A and B (concrete design, accessibility requirements AR1–AR15), the earlier faithful implementation (now in `Archive/v1-task3-faithful`), and the visual references chosen by the team.

## 1. Visual identity: "warm graphite, luminous data"

| Decision | Reason | Traceability |
|---|---|---|
| Keep background `#433D3D`, text `#F2F0EF` and Arial | These are required by Task 3. The premium feel comes from hierarchy, not new fonts | Task 3 universal design |
| Surfaces in 4 steps: ground, sunken `#2F2A2A`, surface `#4D4646`, surface-hi `#575050` | Depth without heavy shadows or borders; text stays at 6.9:1 or more on every surface | AR3 |
| Category colours for data only: activity `#FF9E94`, nutrition `#7FD98A`, sleep `#9CCBFF`. Deep versions (`#8E2B2B`, `#2E6B3A`, `#2B5288`) carry text | Pure red or blue fail contrast. Light accents are bright on dark but fail with off-white text, so they draw marks and icons only | Task 3 colour palette, AR1, AR3 |
| One tinted gradient "hero" per screen; other cards are flat | Gives each screen one focal point and avoids identical-card walls | Visual brief |
| Type scale 16 / 18 / 22 / 28 / 36 / 48, bold for numbers, tabular figures | Big numbers read at a glance (Apple Fitness and Oura style); nothing under 16 px | AR2 |
| Secondary text `#D9D4D2` only on neutral surfaces (5.36:1 or more) | Adds hierarchy. It is not used on tinted or coloured surfaces, where it would drop below 4.5:1 | AR3 |
| Pill buttons 48–56 px; filled primary is off-white with dark text (12.4:1) | Strong, consistent call to action; touch targets of 44 px or more | AR4 |
| Pop-ups are bottom sheets on phones and centred dialogs from 640 px | Thumb reach on 390 px screens; Base UI keeps the focus trap, Escape and focus return | AR7, AR14 |
| Motion: rings and bars fill, pages slide 240 ms, sheets rise. All removed under reduced motion | Feedback without flashing | AR8 |

**Influence of the references** (patterns only, no code copied):
- **Skulpt:** week-day strip with circled dates, and the month results calendar with filled days.
- **fitness-ui-mobile:** the 270° arc gauge with ticks, the smooth area line with a highlighted point, filter pills.
- **logpress:** the big central number with icon tiles.
- **shadcn dashboard:** the component approach (cva variants, Base UI dialog) and the `cn()` helper.

## 2. Personalization engine (the central feature)

`packages/core/src/experience.ts` turns the profile into one `Experience` object. The screens read it; no screen tests the profile itself.

| Answer (questionnaire / Settings) | Effect |
|---|---|
| Goal → experience (Casual / Training / Performance) | Dashboard modules and order, level of detail (simple, standard, advanced), page sections, daily goals, wording ("Activity" or "Training") |
| Level (sedentary → experienced) | Session length (20 / 30 / 45 / 60 min), sets and reps, intensity, active-minute goal |
| Sessions per week (0–7) | **Number of planned sessions** in the weekly plan; training days spread evenly and editable |
| Data that matters | Tabs in the bottom bar (others go under "More"), default modules, quick actions |
| Pins (Customize) | Override the default module list. "Reset to recommended" returns to the experience defaults |

| Screen | Casual | Training | Performance |
|---|---|---|---|
| Dashboard hero | Steps gauge | Today's session with "Log session" | Readiness estimate with 3 factors |
| Dashboard modules | Next session, nutrition, sleep (if chosen) | Week plan, volume, recovery, nutrition (macros), sleep (stages) | Key session, rolling load, hypnogram, macros, week, activity vs last week |
| Training page | Next session, activity, steps chart, recent workouts | Interactive week plan, activity, minutes per week, calendar, filtered history | Same + training load and intensity mix |
| Sleep page | Last night, 7 nights, log | + stages, bedtime regularity | + 14-night trend, typical stage ranges |
| Nutrition page | Calories, meals, previous days | + macro bars, 7-day calories | + macro rings with g/kg, fuel advice for today's session |

**Departure from Task 2:** Task 2 has two personas, and we use three. "Train regularly" and "improve performance" need different screens (schedule versus load and recovery). The Task 2 idea that "the fitness group determines the dashboard" is kept.

## 3. Interaction and accessibility decisions

| Decision | Reason | Requirement |
|---|---|---|
| Kept from Task 3 Output B: Back top-left, Settings top-right, pin/unpin/reorder on the dashboard, focus rules (↑ from main action → nav; nav focus kept; ← / → on nav) | Output B changelog | Task 3 B, AR7 |
| ↓ / ↑ moves between dashboard module titles; ↓ on the last one goes to the nav bar | Task 3 C4 keyboard behaviour, adapted to modules | AR7 |
| Errors stay inline next to the field, with a summary at the top; successes are short toasts (5 s, dismissible, `role=status`) | Errors need a fix nearby; confirmations should not block | AR9, AR10 |
| Every destructive or profile-changing action has a confirmation; the experience change shows a preview of the new dashboard | Task 2 "confirm a second time"; makes personalization predictable | AR3 understandable |
| Disabled controls keep full-contrast text (border instead of opacity) | The team's AR3 says "all text"; this fixes A-P8 from v1 | AR3 |
| Charts: one series, goal as a dashed line with a text caption, tooltip on hover or touch, ← / → keyboard reading with a live region, hidden data table | No colour-only legends; charts usable without a mouse or without sight | AR1, AR7, AR14 |
| Empty account starts empty with "Get started" and designed empty states | Decided by the team; shows what to do instead of zeros | Brief |
| Large screens: side navigation rail and 2-column grid from 1024 px | "Must also work on larger screens" | Brief |

## 4. Simulations
Authentication, food recognition, device connection, sync, estimated sleep stages and readiness are simulated and **labelled as such in the interface** ("Simulated", "Estimate", "(simulated)"). Details are in `README.md`.

## 5. Not done / open points
- No real usability test with participants (see `Final_Testing/test-plan.md`, section 5).
- New A and B iterations in the new design system: planned; the earlier faithful versions are in `Archive/`.
- No offline sync, export or notifications.
