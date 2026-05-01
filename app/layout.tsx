import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${mono.variable}`}>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
