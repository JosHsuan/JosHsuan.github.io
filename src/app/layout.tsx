import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { MotionPreference } from '@/features/preferences/MotionPreference';
import styles from '@/components/layout/SiteShell.module.css';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'Portfolio', template: '%s · Portfolio' },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body><a href="#main" tabIndex={0} className={styles.skip}>跳至主要內容</a><div className={styles.shell}>
    <header className={styles.header}><Link className={styles.brand} href="/" prefetch={false}>PORTFOLIO</Link><Navigation /></header>
    <main id="main" tabIndex={-1} className={styles.main}>{children}</main>
    <footer className={styles.footer}><span>Portfolio</span><MotionPreference /></footer>
  </div></body></html>;
}
