import './globals.css';
import introduction from '../release/introduction.json';
import SiteExperience from '../components/SiteExperience';
import GlobalBackground from '../components/GlobalBackground';

export const metadata = {
  title: introduction.metadataTitle,
  description: introduction.metadataDescription,
  metadataBase: new URL('https://joshsuan.github.io'),
  alternates: { canonical: '/' },
  robots: { index: process.env.THESIS_PUBLIC_RELEASE === '1', follow: process.env.THESIS_PUBLIC_RELEASE === '1' },
};

export default function RootLayout({ children }) {
  return <html lang="en"><head><link rel="preload" href="/assets/fonts/portfolio-ocr-b.woff2" data-site-font-family="Portfolio OCR B" as="font" type="font/woff2" crossOrigin="anonymous" /><link rel="preload" href="/assets/fonts/space-grotesk-variable.woff2" data-site-font-family="Space Grotesk" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body><GlobalBackground><SiteExperience/>{children}</GlobalBackground></body></html>;
}
