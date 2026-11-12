# Output B – Interaction annotations

- **Low-fidelity:** [lo-fi/index.html](lo-fi/index.html) (B-L01 to B-L09 and the flow; changes outlined in red)
- **High-fidelity:** [hi-fi/index.html](hi-fi/index.html) (B01–B14)
- **Run:** `npm run dev:b`, then open http://localhost:5172

Only the differences from [Output A](../Output_A/interactions.md) are detailed here.

## Navigation

| From | Control | To |
|---|---|---|
| Bottom bar | Home · Fitness · Nutrition · **Sleep** | That page |
| Dashboard / any page | **Settings** (top-right) | Settings |
| Dashboard | **Customize / Done** | Customize mode |
| Dashboard | Quick actions | Workout form / photo sheet / sleep log form |

## Dashboard
- **Three demo personas:** Sam (Casual), Alex (Regular training), Jordan (Performance).
- **Casual (Sam):** "Do you want to see more data?" appears with the reason ("You logged 4 workouts in the last 2 weeks."). Then today's workout with the calorie goal, steps, nutrition, sleep (duration only) and recommendations.
- **Training (Alex):** today's workout, this week, training volume, recovery, nutrition (macros), sleep (stage bar), recommendations.
- **Performance (Jordan):** today's workout, readiness estimate, training load, sleep hypnogram, nutrition, this week, fitness metrics, recommendations.
- **Customize** (`aria-pressed`):
  - each metric gets **Up / Down / Unpin**; the screen-reader name is "Unpin metric: …";
  - **Metrics you can pin** lists the others with **Pin metric**, plus Reset to recommended;
  - saved immediately, with a toast stating the new position; focus stays on the moved control.

## Sleep Metrics (new)
- **Enter a new sleep log** (main action): wake-up date, bedtime, wake-up time; the total is shown live; sleep must last 1–16 h; a note appears if the date already has a log (saving replaces it).
- **Last night:** duration and quality; the hypnogram for Training and Performance.
- **Sleep stages** and **Bedtime regularity** for Training and Performance.
- **Hours of sleep:** Week / Month / Year, with the goal line.
- **Previous sleep logs:** a tap opens the graph with **Edit**.

## Settings
- **Persona and goals:** 3 personas; confirmation with a preview of the new dashboard.
- **Rate the app:** 5 star radio buttons with words; an error if none is chosen; then "Thank you! You rated the app 4 out of 5."
- Personal information, daily goals, Display (show more data), tools, account: as in A. The Dashboard metrics section is removed (pinning is on the dashboard).

## Keyboard (new in B)

| Where | Keys | Result |
|---|---|---|
| Bottom bar | ← / → | Move between items |
| Bottom bar | Enter | Open the page; focus stays on the bar |
| Page opened from a widget | (on arrival) | Focus on the main action |
| Main action | ↑ | Current bottom-bar item |
