import './globals.css';
import review from '../release/story.json';

export const metadata = {
  title: `${review.shortTitle} — ${review.owner}`,
  description: review.summary,
  metadataBase: new URL('https://joshsuan.github.io'),
  alternates: { canonical: '/' },
  robots: { index: process.env.THESIS_PUBLIC_RELEASE === '1', follow: process.env.THESIS_PUBLIC_RELEASE === '1' },
};

export default function RootLayout({ children }) {
  return <html lang="en"><head><link rel="preload" href="/assets/fonts/ibm-plex-sans-variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body>{children}</body></html>;
}
