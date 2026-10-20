'use client';
import {createContext, useContext, useEffect, useMemo} from 'react';
import {createRuntimeRoot} from './RuntimeRoot.mjs';
import {connectRuntimeDocumentLifetime} from './features/DocumentLifetime.mjs';

const ExperienceContext = createContext(null);

/** No DOM wrapper or import-time browser work; each presentation owns its input. */
export function ExperienceProvider({children}) {
  const input = useMemo(() => createRuntimeRoot(), []);
  useEffect(()=>{
    const release=input.features.connect('document-lifetime',()=>connectRuntimeDocumentLifetime({input,window}));
    return()=>{release();input.stop();};
  },[input]);
  return <ExperienceContext.Provider value={input}>{children}</ExperienceContext.Provider>;
}

export function useExperienceInput() {
  const input = useContext(ExperienceContext);
  if (!input) throw Error('A presentation runtime provider is required');
  return input;
}
