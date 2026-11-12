/**
 * Domain model. Concepts from Task 2: fitness group (experience), workout
 * tracking, calorie tracking, sleep metrics, progression over time,
 * recommendations, lifestyle preferences, satisfaction rating, smart device.
 */

/** The three experiences (Task 2 "fitness levels", extended from two to three). */
export type ExperienceId = 'casual' | 'training' | 'performance';

/** Fitness level asked in the questionnaire: sets session length and difficulty. */
export type Level = 'sedentary' | 'beginner' | 'regular' | 'athlete';

/** Dashboard categories (Task 3 C8–C10). */
export type MetricId = 'fitness' | 'nutrition' | 'sleep';

export type ModuleId =
  | 'stepsHero'
  | 'sessionHero'
  | 'readinessHero'
  | 'weekPlan'
  | 'activity'
  | 'nutrition'
  | 'sleep'
  | 'volume'
  | 'load'
  | 'recovery';

export interface Goals {
  steps: number;
  activeMin: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sleepMin: number;
}

export interface Device {
  name: string;
  connectedAt: string; // ISO datetime
  lastSync: string; // ISO datetime
}

export interface Rating {
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  date: string;
}

export interface Profile {
  name: string;
  email: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  experience: ExperienceId;
  level: Level;
  /** Training sessions wanted per week, 0–7. Decides how many sessions are planned. */
  sessionsPerWeek: number;
  /** 0 = Monday … 6 = Sunday. */
  trainingDays: number[];
  /** "What data is important to you?" (Task 3 C2). Order = priority. */
  interests: MetricId[];
  /** Pinned dashboard modules in order; null = the experience's default. */
  dashboard: ModuleId[] | null;
  goals: Goals;
  device?: Device;
  ratings: Rating[];
}

export type WorkoutType = 'Strength' | 'Cardio' | 'Mobility' | 'Sport';
export type Intensity = 'easy' | 'moderate' | 'hard';

export interface Workout {
  id: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:MM
  name: string;
  type: WorkoutType;
  durationMin: number;
  caloriesKcal: number;
  intensity: Intensity;
  notes?: string;
  /** Logged from the weekly plan ("Log this session"). */
  fromPlan?: boolean;
}

export interface DayActivity {
  date: string;
  steps: number;
  activeMin: number;
  caloriesKcal: number;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';

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
  source: 'photo' | 'manual';
}

export type SleepStage = 'Awake' | 'REM' | 'Light' | 'Deep';

export interface SleepSession {
  id: string;
  date: string; // morning the user woke up
  bedtime: string;
  wakeTime: string;
  durationMin: number;
  stages: { minute: number; stage: SleepStage }[];
  /** Stages were generated (hand-entered sleep): shown as "estimated". */
  estimated?: boolean;
}

export interface UserData {
  profile: Profile;
  workouts: Workout[];
  activity: DayActivity[];
  meals: Meal[];
  sleep: SleepSession[];
}

export interface Account {
  email: string;
  password: string; // SIMULATED: plain text in localStorage, prototype only
}

/** Questionnaire answers (onboarding). */
export interface OnboardingAnswers {
  name: string;
  experience: ExperienceId;
  level: Level;
  sessionsPerWeek: number;
  interests: MetricId[];
}
