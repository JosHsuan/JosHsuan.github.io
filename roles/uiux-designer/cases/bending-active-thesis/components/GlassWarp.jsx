'use client';
import {useId} from 'react';

/** React owns definitions. The existing presenter alone writes optical values. */
export default function GlassWarp(){
 const id='glass-field-'+useId().replaceAll(':','');
 return <svg data-glass-warp width="0" height="0" focusable="false" aria-hidden="true" style={{position:'absolute',pointerEvents:'none'}}>
  <defs><filter id={id} data-glass-warp-filter filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="-64" y="-64" width="128" height="128" colorInterpolationFilters="sRGB">
   <feImage data-glass-warp-map preserveAspectRatio="none" result="glass-field-map" colorInterpolationFilters="sRGB"/>
   <feDisplacementMap data-glass-warp-displacement in="SourceGraphic" in2="glass-field-map" scale="0" xChannelSelector="R" yChannelSelector="G" colorInterpolationFilters="sRGB"/>
  </filter></defs>
 </svg>;
}
