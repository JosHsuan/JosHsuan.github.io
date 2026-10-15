import './globals.css';
import introduction from '../release/introduction.json';
import SiteExperience from '../components/SiteExperience';

export const metadata = {
  title: introduction.metadataTitle,
  description: introduction.metadataDescription,
  metadataBase: new URL('https://joshsuan.github.io'),
  alternates: { canonical: '/' },
  robots: { index: process.env.THESIS_PUBLIC_RELEASE === '1', follow: process.env.THESIS_PUBLIC_RELEASE === '1' },
};

export default function RootLayout({ children }) {
  return <html lang="en"><head><link rel="preload" href="/assets/fonts/ibm-plex-sans-variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body><SiteExperience/>{children}</body></html>;
}
