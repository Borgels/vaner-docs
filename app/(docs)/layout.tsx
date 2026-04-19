import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: 'Vaner',
        url: 'https://vaner.ai',
      }}
      links={[
        {
          text: 'vaner.ai',
          url: 'https://vaner.ai',
        },
        {
          text: 'GitHub',
          url: 'https://github.com/Borgels/Vaner',
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
