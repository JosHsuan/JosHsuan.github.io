import type { SceneKind } from '../data/types'

export default function ProjectDiagram({ kind = 'subdivision', accent = '#c5b797', label = 'Method diagram' }: { kind?: SceneKind; accent?: string; label?: string }) {
  const curves = Array.from({ length: 22 }, (_, i) => i)
  return <svg viewBox="0 0 720 480" role="img" aria-label={label} className={`project-diagram diagram-${kind}`}>
    <rect width="720" height="480" fill="var(--diagram-bg, #d9d9cd)" />
    <g fill="none" stroke={accent} strokeWidth="1.6" strokeLinejoin="round">
      {kind === 'stacking' ? curves.slice(0, 16).map(i => <path key={i} d={`M ${190 + i * 7} ${385 - i * 17} l 156 -30 74 25 -156 30 z m 0 0 v 12 l 74 25 156 -30 v -12`} />) :
       kind === 'cutting' ? curves.map(i => <path key={i} d={`M${165 + i * 14} 350 C${210 + i * 6} 250,${470 - i * 5} 215,${510 - i * 10} 120`} />) :
       kind === 'garden' || kind === 'dots' || kind === 'toolpath' ? curves.map(i => <ellipse key={i} cx="360" cy={145 + i * 7} rx={Math.sin((i + 1) / 23 * Math.PI) * 157} ry={26 + Math.sin(i / 21 * Math.PI) * 18} transform={kind === 'garden' ? `rotate(${i * 14} 360 240)` : undefined} />) :
       kind === 'aggregation' ? curves.slice(0, 15).map(i => <path key={i} d={`M${180 + i % 5 * 62} ${165 + Math.floor(i / 5) * 67} l 53 -42 40 41 -53 42 -40 -41 53 1 40 -42 m -40 42 v 41`} />) :
       curves.map(i => <path key={i} d={`M${90 + i * 18} ${332 - Math.sin(i / 21 * Math.PI) * 80} Q${325 + i * 4} ${85 + i * 6} ${594 - i * 12} ${166 + i * 10}`} />)}
      {!['stacking', 'cutting', 'garden', 'dots', 'toolpath', 'aggregation'].includes(kind) && curves.map(i => <path key={`cross-${i}`} d={`M${105 + i * 22} ${317 - Math.sin(i / 21 * Math.PI) * 67} Q${276 + i * 5} ${270 - i * 7} ${592 - i * 12} ${190 + i * 9}`} opacity=".65" />)}
    </g>
    <g stroke="currentColor" opacity=".3"><path d="M36 34h24m-24 0v24M684 446h-24m24 0v-24" /></g>
    <text x="36" y="449" fill="currentColor" fontFamily="monospace" fontSize="11" letterSpacing="2">METHOD DIAGRAM / {kind.toUpperCase()}</text>
  </svg>
}
