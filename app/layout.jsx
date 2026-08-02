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
  title: 'MyKamra Media — Fast 4K & MP3 Extractor | media.mykamra.in',
  description:
    'Official media processing hub by MyKamra (mykamra.in). Download and convert YouTube videos, audio, and media signals in 4K, 1080p, 720p, and high-bitrate MP3 instantly.',
  keywords: [
    'MyKamra',
    'mykamra.in',
    'media.mykamra.in',
    'YouTube Downloader',
    'Video Extractor',
    '4K Video Downloader',
    'MP3 Converter',
    'Signal Deck',
  ],
  openGraph: {
    title: 'MyKamra Media — Fast 4K & MP3 Extractor | media.mykamra.in',
    description:
      'Official media extraction and signal processing tool by MyKamra.in. Convert and download YouTube videos in 4K, 1080p, and MP3 instantly.',
    url: 'https://media.mykamra.in',
    siteName: 'MyKamra Media',
    images: [{ url: '/saveTube.png', width: 512, height: 512, alt: 'SaveTube MyKamra Logo' }],
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/saveTube.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/saveTube.png',
    apple: '/saveTube.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
