/** Core: data model, sample data, personalization engine, metrics, simulations, store. */
export * from './types';
export * from './dates';
export * from './program';
export * from './experience';
export * from './metrics';
export { DEMO_ACCOUNTS, FOOD_LIBRARY, buildStages, defaultGoals, uid } from './sample';
export { recognizeFood, SAMPLE_PHOTOS, RecognitionError, type FoodPrediction, type PhotoInput } from './sim/foodRecognition';
export { DEVICES } from './sim/device';
export { StoreProvider, useStore, useUser, type Result, type SyncState } from './store';
