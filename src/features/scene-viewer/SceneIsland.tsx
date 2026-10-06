'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Component, useCallback, useEffect, useState, type ReactNode } from 'react';
import { getScene } from '@/scenes/registry';
import { publicAssetUrl } from '@/lib/paths';
import type { MotionMode } from '@/motion/contracts';
import { useReducedMotion } from '@/features/preferences/MotionPreference';
import { SceneFallback } from './SceneFallback';
import styles from './SceneViewer.module.css';

const SceneCanvas = dynamic(() => import('./SceneCanvas'), { ssr: false });
class ViewerBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? <SceneFallback /> : this.props.children; }
}

export function SceneIsland({ sceneId }: { sceneId: string }) {
  const scene = getScene(sceneId);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [requestedMode, setMode] = useState<MotionMode>('static');
  const mode = reduced && requestedMode === 'story' ? 'static' : requestedMode;
  const fail = useCallback(() => { setFailed(true); setActive(false); }, [setFailed, setActive]);
  const markReady = useCallback(() => setReady(true), [setReady]);
  useEffect(() => {
    const pause = () => { if (document.hidden) setMode('static'); };
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);
  if (!scene) return null;
  return <section className={styles.viewer} aria-label={scene.label}>
    <div className={styles.viewport}>
      {active && !failed && <ViewerBoundary key={attempt} onFailure={fail}><SceneCanvas sceneId={sceneId} mode={mode} onFailure={fail} onReady={markReady} /></ViewerBoundary>}
      {(!active || !ready || failed) && <Image src={publicAssetUrl(scene.poster.path)} alt={scene.poster.alt} width={scene.poster.width} height={scene.poster.height} />}
    </div>
    {failed && <SceneFallback />}
    <div className={styles.controls}>
      {!active && (!failed || attempt < 1) && <button onClick={() => { if (failed) setAttempt((value) => value + 1); setReady(false); setFailed(false); setActive(true); setMode('static'); }}>{failed ? '重試互動檢視' : '開啟互動檢視'}</button>}
      {active && <><button aria-pressed={mode === 'static'} onClick={() => setMode('static')}>靜態</button><button aria-pressed={mode === 'inspect'} onClick={() => setMode('inspect')}>檢視</button><button disabled={reduced} aria-pressed={mode === 'story'} onClick={() => setMode('story')}>故事</button><button onClick={() => setActive(false)}>顯示圖片</button></>}
    </div>
  </section>;
}
