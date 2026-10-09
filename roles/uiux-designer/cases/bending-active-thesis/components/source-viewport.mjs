// The visible reading viewport can be shorter than a stable mobile Canvas.
// Clip in client CSS coordinates first, then normalize in the actual Canvas.
export function resolveSourceViewport(rect, visible, canvas) {
  const ease = value => {const t=Math.min(1,Math.max(0,value));return t*t*t*(10+t*(-15+6*t));};
  const top=Math.max(92,rect.top,canvas.top),left=Math.max(16,rect.left,canvas.left);
  const right=Math.min(visible.width-16,rect.right,canvas.left+canvas.width);
  const bottom=Math.min(visible.height-(visible.width<=780?86:28),rect.bottom,canvas.top+canvas.height);
  const height=bottom-top,width=right-left;
  let weight=0,viewport={left:.08,top:.2,width:.84,height:.55};
  if(height>visible.height*.16&&width>100&&canvas.width>0&&canvas.height>0){
    weight=ease((height/Math.max(1,rect.height)-.35)/.5)*ease((height/visible.height-.16)/.15);
    viewport={left:(left-canvas.left)/canvas.width,top:(top-canvas.top)/canvas.height,width:width/canvas.width,height:height/canvas.height};
  }
  return {viewport,weight};
}
