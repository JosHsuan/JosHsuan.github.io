'use client';
import {Component, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import {useExperienceInput} from '../runtime/ExperienceProvider';
import {createInspectionState} from './inspection-state.mjs';
import ModelInspector from './ModelInspector';
import LiquidGlassSkin from './LiquidGlassSkin';
import styles from './cinematic.module.css';

const Scene = dynamic(() => import('./CinematicScene'), {ssr: false});
class SceneBoundary extends Component {
  state = {failed: false};
  static getDerivedStateFromError() {return {failed: true};}
  componentDidCatch() {this.props.onFailure();}
  render() {return this.state.failed ? null : this.props.children;}
}

export default function CinematicExperience() {
  const input = useExperienceInput();
  const inspection = useMemo(() => createInspectionState(), []);
  const [enabled, setEnabled] = useState(false), [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false), [hydrated, setHydrated] = useState(false);
  const activateStudy = useCallback(() => setEnabled(true), []);
  const lifecycle=useMemo(()=>input.features.create('lifecycle',{onSystemReduced:setSystemReduced,onHydrated:setHydrated,onAutomaticEnable:()=>setEnabled(true),onPolicy:value=>input.entry.scenePolicy(value)}),[input]);
  const stage = useRef(null), fieldCanvas=useRef(null), progress = useRef(null), status = useRef(null);
  const onReady = useCallback(() => setReady(true), []), onFailure = useCallback(() => {lifecycle.fail();setFailed(true); setReady(false); document.querySelectorAll('[data-layer-caption]').forEach(element => {element.textContent='Source geometry · static view';});}, [lifecycle]);
  useEffect(()=>input.features.connect('lifecycle.preferences',()=>lifecycle.initialize({window,document,navigator,readStorage:()=>sessionStorage})),[input,lifecycle]);
  useEffect(()=>input.features.connect('lifecycle.lease',()=>lifecycle.connectLease(window,{enabled,failed})),[input,lifecycle,enabled,failed]);
  useEffect(()=>input.entry.bindFailure(onFailure),[input,onFailure]);
  useEffect(() => {
    const reduce = systemReduced || !enabled || failed;
    input.commands.execute('preferences.apply',{systemReduced,sceneEnabled:enabled,sceneFailed:failed,sceneReady:ready});
    document.documentElement.toggleAttribute('data-cinematic-static', reduce);
    return () => {document.documentElement.removeAttribute('data-cinematic-static');};
  }, [input, systemReduced, enabled, failed, ready]);
  useEffect(() => {document.documentElement.toggleAttribute('data-canvas-available',ready&&!failed);return()=>document.documentElement.removeAttribute('data-canvas-available');},[ready,failed]);
  useEffect(()=>input.features.connect('director',()=>input.features.create('director',{inspection,lifecycle,stage,fieldCanvas,progress,status}).connect()),[input,inspection,lifecycle]);

  // Discrete preference changes also wake the DOM decoration controller once.
  useEffect(() => {input.invalidateLayout('preferences');}, [input,systemReduced,enabled,failed,ready,hydrated]);
  return <>
    <div className={styles.backdrop} aria-hidden="true" data-cinematic-background>
      {!ready&&<picture><source media="(max-width:780px)" srcSet="/assets/cinematic/model-poster-mobile.webp"/><img className={styles.poster} src="/assets/cinematic/model-poster.webp" alt=""/></picture>}
      <div className={styles.vignette} data-cinematic-vignette />
    </div>
    <div className={styles.stage} ref={stage} style={{visibility: ready ? 'visible' : 'hidden'}} aria-hidden="true" data-cinematic-stage>
      {enabled && !failed && <SceneBoundary onFailure={onFailure}><Scene input={input} onReady={onReady} onFailure={onFailure} /></SceneBoundary>}
    </div>
    <canvas className={styles.asciiField} ref={fieldCanvas} data-ascii-field aria-hidden="true"/>
    {hydrated && <div className={styles.readingTools} data-protect data-reading-tools data-liquid-glass="reading-controls">
      <span ref={status} aria-hidden="true" data-choreography="nav">01 / 07</span>
      {!enabled&&!failed&&<button type="button" onClick={activateStudy}><span data-choreography="nav">Enable 3D</span></button>}
      {failed&&<span role="status" data-scene-fallback>Source study available · 3D unavailable</span>}
      <LiquidGlassSkin id="reading-controls" />
    </div>}
    <ModelInspector input={input} inspection={inspection} activate={activateStudy} ready={ready} failed={failed}/>
    <div className={styles.progress} data-story-progress aria-hidden="true"><span ref={progress} /></div>
  </>;
}
