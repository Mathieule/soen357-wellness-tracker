/**
 * Iteration settings. Output A, B and C are the SAME code base with different
 * settings, so each version has exactly the features of its specification
 * (Task 2 Outputs A/B/C + Task 3 Output B changelog) without copied code.
 */
import type { ExperienceId } from './types';

export interface Iteration {
  id: 'A' | 'B' | 'C';
  name: string;
  storagePrefix: string;
  /** Personas offered in the questionnaire and in Settings. */
  experiences: ExperienceId[];
  /** Sleep metrics exist (Task 2 Output B adds them). */
  sleep: boolean;
  /** A: "Profile" tab in the bottom bar. B/C: Settings button top-right (Task 3 Output B). */
  settingsInNav: boolean;
  /** A: pin metrics in Settings. B/C: pin / unpin / reorder on the dashboard. */
  pinning: 'settings' | 'dashboard';
  /** Task 3 Output B keyboard rules (↑ to nav, focus kept on nav, ← / → on nav). */
  keyboardRules: boolean;
  /** "Do you want to see more data?": A asks from the start; B/C ask when the logged data justifies it. */
  moreDataPrompt: 'start' | 'adaptive';
  /** Recommendations module (Task 2 Output B concept). */
  recommendations: boolean;
  /** Rate the app 1–5 (Task 2 Output B). */
  rating: boolean;
  /** Smart device pairing + sync status (Task 2 Output C). */
  device: boolean;
  /** Questionnaire: short (persona → fitness goals) or full (name, persona, level, sessions, data, goals). */
  questionnaire: 'short' | 'full';
  /** Settings: change persona only, or the full lifestyle / persona editor (Task 2 Output C). */
  personaEditor: 'persona' | 'full';
  /** Accessibility mode with large font and interface elements (Task 2 Output C). */
  largeTextMode: boolean;
  /** Dashboard quick actions. */
  quickActions: boolean;
  /** Edit / delete past entries and food fallbacks (edit prediction, manual after failure). Output C evaluation fixes. */
  editDelete: boolean;
  /** New accounts start empty with designed empty states and "Get started" (Output C). A/B get sample history. */
  emptyAccounts: boolean;
}

export const ITERATIONS: Record<'A' | 'B' | 'C', Iteration> = {
  A: {
    id: 'A',
    name: 'Output A',
    storagePrefix: 'wellness-output-a2',
    experiences: ['casual', 'performance'],
    sleep: false,
    settingsInNav: true,
    pinning: 'settings',
    keyboardRules: false,
    moreDataPrompt: 'start',
    recommendations: false,
    rating: false,
    device: false,
    questionnaire: 'short',
    personaEditor: 'persona',
    largeTextMode: false,
    quickActions: false,
    editDelete: false,
    emptyAccounts: false,
  },
  B: {
    id: 'B',
    name: 'Output B',
    storagePrefix: 'wellness-output-b2',
    experiences: ['casual', 'training', 'performance'],
    sleep: true,
    settingsInNav: false,
    pinning: 'dashboard',
    keyboardRules: true,
    moreDataPrompt: 'adaptive',
    recommendations: true,
    rating: true,
    device: false,
    questionnaire: 'short',
    personaEditor: 'persona',
    largeTextMode: false,
    quickActions: true,
    editDelete: false,
    emptyAccounts: false,
  },
  C: {
    id: 'C',
    name: 'Output C',
    storagePrefix: 'wellness-output-c',
    experiences: ['casual', 'training', 'performance'],
    sleep: true,
    settingsInNav: false,
    pinning: 'dashboard',
    keyboardRules: true,
    moreDataPrompt: 'adaptive',
    recommendations: true,
    rating: true,
    device: true,
    questionnaire: 'full',
    personaEditor: 'full',
    largeTextMode: true,
    quickActions: true,
    editDelete: true,
    emptyAccounts: true,
  },
};
