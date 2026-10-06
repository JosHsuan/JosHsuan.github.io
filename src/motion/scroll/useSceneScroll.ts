'use client';

import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { SceneDirector } from '@/features/scene-viewer/SceneDirector';

export function useSceneScroll<Id extends string>(element: RefObject<HTMLElement | null>, director: SceneDirector<Id> | null, clip: Id, enabled: boolean) {
  useGSAP(() => {
    if (!enabled || !director || !element.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: element.current,
      start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => director.seekFromScroll(clip, self.progress),
      onRefresh: (self) => director.seekFromScroll(clip, self.progress),
    });
    director.seekFromScroll(clip, trigger.progress);
    const observer = new ResizeObserver(() => trigger.refresh());
    observer.observe(element.current);
    let active = true;
    void document.fonts.ready.then(() => { if (active) trigger.refresh(); });
    const pauseWhenHidden = () => { if (document.hidden) director.pause(); else trigger.refresh(); };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => { active = false; observer.disconnect(); trigger.kill(); document.removeEventListener('visibilitychange', pauseWhenHidden); director.pause(); };
  }, { scope: element, dependencies: [director, clip, enabled], revertOnUpdate: true });
}
