import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import {
  Instrument_Serif,
  JetBrains_Mono,
  Share_Tech_Mono,
  Space_Grotesk,
} from 'next/font/google';
import './globals.css';

// Mirror of vaner-web/app/layout.tsx — same four font families,
// same CSS variable names, so the design system reads identically
// on docs.vaner.ai and vaner.ai.

const spaceGrotesk = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-brand',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

const shareTechMono = Share_Tech_Mono({
  variable: '--font-term',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const siteUrl = 'https://docs.vaner.ai';
const ogImage = `${siteUrl}/brand/png/og-dark-1200x630.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Vaner Docs',
    template: '%s | Vaner Docs',
  },
  description:
    'Product documentation for Vaner, the local engine and desktop companion for AI agents.',
  applicationName: 'Vaner Docs',
  authors: [{ name: 'Borgels', url: 'https://vaner.ai' }],
  creator: 'Borgels',
  publisher: 'Borgels',
  category: 'developer tools',
  keywords: ['Vaner', 'MCP', 'AI agent context', 'Ollama', 'local AI'],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'Vaner Docs',
    description:
      'Product documentation for Vaner, the local engine and desktop companion for AI agents.',
    type: 'website',
    url: siteUrl,
    siteName: 'Vaner Docs',
    locale: 'en_US',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'Vaner documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vaner Docs',
    description:
      'Product documentation for Vaner, the local engine and desktop companion for AI agents.',
    images: [ogImage],
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/brand/favicon/favicon.ico', type: 'image/x-icon' },
      {
        url: '/brand/favicon/favicon-32.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        url: '/brand/favicon/favicon-192.png',
        type: 'image/png',
        sizes: '192x192',
      },
    ],
    apple: '/brand/favicon/favicon-180.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${spaceGrotesk.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${shareTechMono.variable}`}
    >
      <body>
        {/* Vaner is dark-only. Disable next-themes' light/dark toggle
            machinery and force the dark class on <html>. */}
        <RootProvider theme={{ enabled: false, defaultTheme: 'dark', forcedTheme: 'dark' }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
