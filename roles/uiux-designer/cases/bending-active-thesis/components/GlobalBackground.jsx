'use client';
import {createContext,useContext,useEffect,useMemo,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {createBackgroundRuntime} from '../runtime/background/BackgroundRuntime.mjs';
import {createSiteBackgroundDriver} from '../runtime/background/SiteBackgroundDriver.mjs';
import styles from './cinematic.module.css';

const BackgroundContext=createContext(null);

/** The existing class rules and sibling placement are intentional. In Bending,
 * its project stage remains between these two surfaces at the original z-index.
 * Project posters belong to their project and enter only through this slot.
 */
export function BackgroundBackdrop({elementRef,children}) {
 return <div ref={elementRef} className={styles.backdrop} aria-hidden="true" data-cinematic-background data-global-background>
  {children}<div className={styles.vignette} data-cinematic-vignette />
 </div>;
}
export function BackgroundField({elementRef}) {
 return <canvas ref={elementRef} className={styles.asciiField} data-ascii-field data-global-background-field aria-hidden="true"/>;
}

export function useGlobalBackground() {
 const context=useContext(BackgroundContext);
 if(!context)throw Error('Global background provider is required');
 return context;
}

function SiteBackground({runtime,driverRef}) {
 const backdrop=useRef(null),canvas=useRef(null);
 useEffect(()=>{
  const driver=createSiteBackgroundDriver({window,document,runtime,backdrop:backdrop.current,canvas:canvas.current});
  driverRef.current=driver;
  return()=>{driver.dispose();if(driverRef.current===driver)driverRef.current=null;};
 },[runtime,driverRef]);
 return <><BackgroundBackdrop elementRef={backdrop}/><BackgroundField elementRef={canvas}/></>;
}

/** One service lifetime in the selected public root layout. Real native page
 * navigation replaces the document and this lifetime, rather than retaining a
 * hidden context across documents. Bending delegates the exact same service to
 * its existing Director, never mounting the ordinary-page frame driver.
 */
export default function GlobalBackground({children}) {
 const pathname=usePathname(),runtime=useMemo(()=>createBackgroundRuntime(),[]),driverRef=useRef(null);
 const delegated=pathname?.replace(/\/$/,'')==='/projects/bending-active';
 useEffect(()=>{
  const port={inspect:()=>({...runtime.inspect(),delegated,driver:driverRef.current?.inspect()??null})};
  window.__globalBackground=port;
  return()=>{if(window.__globalBackground===port)delete window.__globalBackground;};
 },[runtime,delegated]);
 return <BackgroundContext.Provider value={runtime}>
  {!delegated&&<SiteBackground runtime={runtime} driverRef={driverRef}/>}{children}
 </BackgroundContext.Provider>;
}
