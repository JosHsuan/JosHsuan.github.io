import { lazy, Suspense, type ReactNode } from 'react'

// Vite replaces DEV at build time: this import is unreachable and removed
// from production output. A dev server alone does not enable remote control.
export const inspectionEnabled = import.meta.env.DEV && import.meta.env.VITE_R3F_INSPECT === 'true'
const Provider = inspectionEnabled
  ? lazy(() => import('r3f-mcp').then((module) => ({ default: module.MCPProvider })))
  : null

export default function DevMcp({ children }: { children: ReactNode }) {
  if (!Provider) return <>{children}</>
  return (
    <Suspense fallback={<>{children}</>}>
      <Provider port={3333} readOnly>{children}</Provider>
    </Suspense>
  )
}
