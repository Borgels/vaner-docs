import type { ReactNode } from 'react';
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
