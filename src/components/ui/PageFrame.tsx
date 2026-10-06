import type { ReactNode } from 'react';
import styles from './PageFrame.module.css';

export function PageFrame({ title, label, children }: { title: string; label: string; children?: ReactNode }) {
  return <><p className={styles.eyebrow}>{label}</p><h1 className={styles.heading}>{title}</h1>{children ?? <EmptyState />}</>;
}
export function EmptyState() {
  return <div className={styles.empty}><p>尚未新增內容。</p></div>;
}
