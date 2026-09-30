// The background has a separate boundary so a future scene can be mounted
// without taking ownership of navigation, content, or the reading timeline.
export default function WorkspaceBackdrop() {
  return <div className="workspace-backdrop" aria-hidden="true">
    <div className="ambient-light" /><div className="backdrop-grid" />
    <span className="backdrop-coordinate">PORTFOLIO / 01</span>
  </div>
}
