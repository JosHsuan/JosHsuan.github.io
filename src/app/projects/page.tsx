import { PageFrame } from '@/components/ui/PageFrame';
import { EntryList } from '@/components/content/EntryList';
import { listPublishedProjects } from '@/content/read';
export const metadata = { title: '作品' };
export default function ProjectsPage() { return <PageFrame title="作品" label="Projects"><EntryList entries={listPublishedProjects()} kind="projects" /></PageFrame>; }
