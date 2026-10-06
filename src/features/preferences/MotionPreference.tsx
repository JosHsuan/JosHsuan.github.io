'use client';

import { useSyncExternalStore } from 'react';
import { create } from 'zustand';

type Preference = 'system' | 'reduce';
const usePreferences = create<{ motion: Preference; setMotion: (motion: Preference) => void }>((set) => ({ motion: 'system', setMotion: (motion) => set({ motion }) }));
const query = '(prefers-reduced-motion: reduce)';
function subscribe(callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

export function useReducedMotion() {
  const system = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => true);
  return usePreferences((state) => state.motion) === 'reduce' || system;
}

export function MotionPreference() {
  const { motion, setMotion } = usePreferences();
  return <label>動態效果 <select aria-label="動態效果" value={motion} onChange={(event) => setMotion(event.target.value as Preference)}>
    <option value="system">依系統設定</option><option value="reduce">減少動態</option>
  </select></label>;
}
