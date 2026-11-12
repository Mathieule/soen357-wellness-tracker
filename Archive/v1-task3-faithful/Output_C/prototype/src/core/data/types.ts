/**
 * Domain types of the Output C prototype (copied from the A/B shared code,
 * then extended for C: fitness level, sessions per week, training days, goals).
 * They mirror the concepts of the Task 2 conceptual design:
 * fitness level (persona), workout tracking, calorie tracking, sleep metrics,
 * progression over time and lifestyle preferences.
 */

/** Fitness group the questionnaire places the user in (Task 2: "fitness levels"). */
export type Persona = 'casual' | 'performance';

/** Answer to "How often do you exercise?" (Task 3, C2). Kept for compatibility. */
export type Frequency = 'rarely' | '1-2' | '3-4' | '5+';

/** C: fitness level (questionnaire). Sets the length and difficulty of sessions. */
export type Level = 'sedentary' | 'beginner' | 'regular' | 'athlete';

/** The three dashboard categories / widgets (Task 3, C8–C10). */
export type MetricId = 'fitness' | 'nutrition' | 'sleep';

/** A simulated account. Passwords are stored in plain text in localStorage: prototype only. */
export interface Account {
  email: string;
  password: string;
}

export interface Profile {
  name: string;
  email: string;
  /** Optional body data entered from the profile page (Task 2: "instructing"). */
  age?: number;
  weightKg?: number;
  heightCm?: number;
  frequency: Frequency;
  persona: Persona;
  /** C: level and weekly plan. Optional so older stored profiles still load. */
  level?: Level;
  /** C: number of training sessions wanted per week (0–7). */
  sessionsPerWeek?: number;
  /** C: training days, 0 = Monday … 6 = Sunday. */
  trainingDays?: number[];
  /** Metrics shown on the dashboard, in display order. */
  metrics: MetricId[];
}

export type WorkoutType = 'Strength' | 'Cardio' | 'Flexibility' | 'Sport';

export interface Workout {
  id: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  /** 24 h time, HH:MM */
  time: string;
  name: string;
  type: WorkoutType;
  durationMin: number;
  caloriesKcal: number;
  notes?: string;
}

export interface DayActivity {
  date: string;
  steps: number;
  activeMin: number;
  caloriesKcal: number;
}

export interface RoutineItem {
  name: string;
  detail: string;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface Meal {
  id: string;
  date: string;
  time: string;
  name: string;
  mealType: MealType;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** How the meal was entered. "photo" means the simulated recognition was used. */
  source: 'photo' | 'manual';
}

export interface NutritionGoals {
  calories: number;
  /** C: daily activity and sleep goals used by the progress rings. */
  steps?: number;
  activeMin?: number;
  sleepMin?: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export type SleepStage = 'Awake' | 'REM' | 'Light' | 'Deep';

export interface SleepStagePoint {
  /** Minutes since bedtime. */
  minute: number;
  stage: SleepStage;
}

export interface SleepSession {
  id: string;
  /** Date of the morning the user woke up (yyyy-mm-dd). */
  date: string;
  bedtime: string;
  wakeTime: string;
  durationMin: number;
  stages: SleepStagePoint[];
}

/** Everything the prototype keeps for one signed-in user. */
export interface UserData {
  profile: Profile;
  workouts: Workout[];
  activity: DayActivity[];
  meals: Meal[];
  sleep: SleepSession[];
  goals: NutritionGoals;
}
