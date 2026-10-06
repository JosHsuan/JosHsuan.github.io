import Link from 'next/link';
import { PageFrame } from '@/components/ui/PageFrame';
export default function NotFound() { return <PageFrame title="找不到此頁面" label="404"><Link href="/">回到首頁</Link></PageFrame>; }
