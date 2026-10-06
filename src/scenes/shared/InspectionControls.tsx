'use client';

import { OrbitControls } from '@react-three/drei';
import type { Vector3Value } from '@/motion/contracts';

/** Mount after releasing story camera ownership. Pass its last target to avoid snapping. */
export function InspectionControls({ target }: { target: Vector3Value }) {
  return <OrbitControls target={[target.x, target.y, target.z]} enablePan={false} enableDamping={false} />;
}
