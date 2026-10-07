import './globals.css';
import review from '../content/review.json';

export const metadata = {
  title: `${review.shortTitle} — ${review.owner}`,
  description: review.summary,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
