'use client';
import {createContext, useContext, useEffect, useMemo} from 'react';
import {createRuntimeRoot} from './RuntimeRoot.mjs';

const ExperienceContext = createContext(null);

/** No DOM wrapper or import-time browser work; each presentation owns its input. */
export function ExperienceProvider({children}) {
  const input = useMemo(() => createRuntimeRoot(), []);
  useEffect(()=>()=>input.stop(),[input]);
  return <ExperienceContext.Provider value={input}>{children}</ExperienceContext.Provider>;
}

export function useExperienceInput() {
  const input = useContext(ExperienceContext);
  if (!input) throw Error('A presentation runtime provider is required');
  return input;
}
