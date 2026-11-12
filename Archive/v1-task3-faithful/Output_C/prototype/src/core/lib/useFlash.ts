/**
 * One-time status messages shown on the NEXT page (e.g. "Your account was
 * created", "Your account was deleted").
 *
 * Call queueFlash(...) right before navigating. The message is kept in a
 * module-level slot instead of router state because the route guards in
 * App.tsx also redirect when the session changes, and that redirect would
 * otherwise replace the router state and lose the message.
 */
import { useEffect, useState } from 'react';
import type { StatusKind } from '../ui/status';

export interface Flash {
  kind: StatusKind;
  text: string;
}

let pending: Flash | null = null;

export function queueFlash(f: Flash) {
  pending = f;
}

export function useFlash(): [Flash | null, (f: Flash | null) => void] {
  // Read without clearing during render (StrictMode may render twice)…
  const [flash, setFlash] = useState<Flash | null>(() => pending);
  // …and clear once the page has mounted.
  useEffect(() => {
    pending = null;
  }, []);
  return [flash, setFlash];
}
