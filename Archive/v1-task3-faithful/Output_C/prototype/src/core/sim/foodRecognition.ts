/**
 * SIMULATED food recognition. There is no AI model and no image analysis.
 *
 * The "prediction" is picked from FOOD_LIBRARY: a file name containing a known
 * food word wins, otherwise a hash of the file name and size is used, so the
 * same photo always gives the same answer.
 * Recognition FAILS on purpose when:
 *   - the file name contains "blur", "dark" or "fail", or
 *   - the user picks the "Blurry photo" sample.
 * This lets reviewers test the error path in a predictable way.
 */
import { FOOD_LIBRARY } from '../data/sample';

export type FoodPrediction = (typeof FOOD_LIBRARY)[number];

export interface PhotoInput {
  name: string;
  size: number;
}

export class RecognitionError extends Error {}

const DELAY_MS = 1200;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function recognizeFood(photo: PhotoInput): Promise<FoodPrediction> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (/blur|dark|fail/i.test(photo.name)) {
        reject(new RecognitionError('We could not recognize the food in this photo.'));
        return;
      }
      // A file name that names a known food ("banana.jpg") gives that food;
      // otherwise a stable pseudo-random food is returned.
      const lower = photo.name.toLowerCase();
      const named = FOOD_LIBRARY.find((f) => lower.includes(f.name.split(/[ ,]/)[0].toLowerCase()));
      resolve(named ?? FOOD_LIBRARY[hash(`${photo.name}:${photo.size}`) % FOOD_LIBRARY.length]);
    }, DELAY_MS);
  });
}

/** Built-in sample "photos" so the flow can be tested without a camera. */
export const SAMPLE_PHOTOS: { id: string; label: string; alt: string; file: PhotoInput }[] = [
  {
    id: 'salmon',
    label: 'Salmon dinner',
    alt: 'Plate with a salmon fillet, white rice and broccoli',
    file: { name: 'salmon-plate.jpg', size: 3 },
  },
  {
    id: 'oatmeal',
    label: 'Oatmeal bowl',
    alt: 'Bowl of oatmeal topped with blueberries and raspberries',
    file: { name: 'oatmeal.jpg', size: 1 },
  },
  {
    id: 'blurry',
    label: 'Blurry photo',
    alt: 'Very blurry photo where no food can be seen (tests the error message)',
    file: { name: 'blurry.jpg', size: 0 },
  },
];
