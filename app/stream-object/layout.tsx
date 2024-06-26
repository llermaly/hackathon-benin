import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { GenerateItineraryAI } from './generate-itinerary';
import '../globals.css';

const meta = {
  title: 'FongBot 🇧🇯',
  description:
    'Demo of an interactive financial assistant built using Next.js and Vercel AI SDK.',
};
export const metadata: Metadata = {
  ...meta,
  title: {
    default: 'FongBot 🇧🇯',
    template: `%s - FongBot 🇧🇯`,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  twitter: {
    ...meta,
    card: 'summary_large_image',
    site: '@vercel',
  },
  openGraph: {
    ...meta,
    locale: 'en-US',
    type: 'website',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <GenerateItineraryAI>{children}</GenerateItineraryAI>
    </div>
  );
}
