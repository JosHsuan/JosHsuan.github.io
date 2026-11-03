'use client';
import {useEffect,useRef} from 'react';
import {registerHomeResearchStage} from '../runtime/site/HomeResearchStageRegistry.mjs';

/** Registration only. The ordinary-page driver owns all showcase time. */
export default function HomeShowcaseStage({models}){
 const host=useRef(null);
 useEffect(()=>registerHomeResearchStage(document,{kind:'showcase',host:host.current,root:host.current.closest('[data-home-introduction]'),models}),[models]);
 return <div ref={host} data-home-showcase aria-hidden="true"><div data-home-showcase-surface/></div>;
}
