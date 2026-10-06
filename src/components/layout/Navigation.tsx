'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SiteShell.module.css';

const links = [['/', '首頁'], ['/projects/', '作品'], ['/research/', '研究與開發'], ['/about/', '關於'], ['/contact/', '聯絡']] as const;

export function Navigation() {
  const pathname = usePathname().replace(/\/$/, '') || '/';
  return <nav className={styles.nav} aria-label="主要導覽">{links.map(([href, label]) => {
    const path = href.replace(/\/$/, '') || '/';
    const active = path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
    return <Link key={href} href={href} prefetch={false} aria-current={active ? 'page' : undefined}>{label}</Link>;
  })}</nav>;
}
