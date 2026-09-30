// The background has a separate boundary so a future scene can be mounted
// without taking ownership of navigation, content, or the reading timeline.
export default function WorkspaceBackdrop() {
  return <div className="workspace-backdrop" aria-hidden="true">
    <div className="ambient-light" /><div className="backdrop-grid" />
    <div className="backdrop-note"><span>CHIA-HSUAN CHAO / JOSHSUAN</span><p>From digital<br />to physical<span>.</span></p><span>COMPUTATION · INTERACTION · FABRICATION</span></div>
    <span className="backdrop-coordinate">PORTFOLIO / 01</span>
  </div>
}
