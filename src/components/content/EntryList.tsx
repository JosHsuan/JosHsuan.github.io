import Link from 'next/link';
import type { PublishedEntry } from '@/content/schema';
import { EmptyState } from '@/components/ui/PageFrame';
import styles from '@/components/ui/PageFrame.module.css';
export function EntryList({ entries, kind }: { entries: PublishedEntry[]; kind: 'projects' | 'research' }) {
  if (!entries.length) return <EmptyState />;
  return <ul className={styles.list}>{entries.map((entry) => <li key={entry.id}><h2><Link prefetch={false} href={`/${kind}/${entry.slug}/`}>{entry.title}</Link></h2><p>{entry.summary}</p><p>{entry.year} · {entry.role}</p></li>)}</ul>;
}
