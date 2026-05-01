import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Display: Space Grotesk for headlines, matching the vaner.ai/developers
// bridge. Body: Inter — Space Grotesk reads heavy in paragraph text on
// dense doc pages, so we split the two roles.
const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
