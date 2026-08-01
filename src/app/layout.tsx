import type { Metadata } from 'next';
import { Bebas_Neue, Inter } from 'next/font/google';
import './globals.css';

const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Pickleball Club',
  description: 'A modern club operations home for pickleball organizers and players.',
  applicationName: 'Pickle-lo',
  icons: {
    icon: [
      { url: '/brand-assets/favicon/favicon.ico', sizes: 'any' },
      { url: '/brand-assets/favicon/favicon-48x48.png', type: 'image/png', sizes: '48x48' },
      { url: '/brand-assets/favicon/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/brand-assets/favicon/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/brand-assets/favicon/favicon-256x256.png', type: 'image/png', sizes: '256x256' },
    ],
    shortcut: '/brand-assets/favicon/favicon.ico',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
