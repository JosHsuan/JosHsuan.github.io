import { PageFrame } from '@/components/ui/PageFrame';
import { EntryList } from '@/components/content/EntryList';
import { listPublishedResearch } from '@/content/read';
export const metadata = { title: '研究與開發' };
export default function ResearchPage() { return <PageFrame title="研究與開發" label="Research & Development"><EntryList entries={listPublishedResearch()} kind="research" /></PageFrame>; }
