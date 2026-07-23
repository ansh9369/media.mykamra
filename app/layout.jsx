import { JetBrains_Mono, Sora } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-display',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
});

export const metadata = {
  title: 'Signal Deck — paste a link, pull the tape',
  description:
    'Paste a video link, let the deck read the signal, then pull the format you want.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
