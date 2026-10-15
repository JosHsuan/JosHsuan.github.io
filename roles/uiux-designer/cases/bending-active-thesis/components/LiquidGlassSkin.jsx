/** One decorative optical owner. Labels and hit areas remain outside the lens. */
export default function LiquidGlassSkin({id}){
  return <span data-liquid-skin aria-hidden="true">
    <svg width="0" height="0" focusable="false" aria-hidden="true">
      <defs>
        <filter id={`liquid-${id}`} filterUnits="objectBoundingBox" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feImage data-liquid-map preserveAspectRatio="none" x="0" y="0" result="glass-map" />
          <feDisplacementMap data-liquid-displacement in="SourceGraphic" in2="glass-map" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  </span>;
}
