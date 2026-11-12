/**
 * SIMULATED smart-device connection and data sync (Task 2: "Connect a smart
 * device"; T2/T3 flows: "Check data synchronization status → retry").
 * No Bluetooth, HealthKit or Health Connect is used. Connecting waits a moment
 * and then generates plausible steps for the last 14 days; syncing waits and
 * succeeds, unless the user turned on "Simulate a sync failure" in Settings.
 */
import { addDays, today } from '../dates';
import { rng } from '../sample';
import type { DayActivity } from '../types';

export const DEVICES = ['Fitness band (simulated)', 'Smartwatch (simulated)', 'Phone motion sensor (simulated)'];

export class SyncError extends Error {}

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

export async function connectDevice(name: string): Promise<{ name: string; activity: DayActivity[] }> {
  await wait(1400);
  const r = rng(name.length * 97);
  const activity = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(today(), -i);
    const f = i === 0 ? 0.5 : 1;
    const steps = Math.round((4000 + r() * 7000) * f);
    return { date, steps, activeMin: Math.round((15 + r() * 50) * f), caloriesKcal: Math.round((1650 + steps * 0.045) * f) };
  });
  return { name, activity };
}

export async function syncNow(shouldFail: boolean): Promise<void> {
  await wait(1100);
  if (shouldFail) throw new SyncError('We could not reach your device. Check that it is nearby and try again.');
}
