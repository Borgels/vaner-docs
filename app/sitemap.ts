import type { MetadataRoute } from 'next';

import { source } from '@/lib/source';

const siteUrl = 'https://docs.vaner.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const docsPages = source.getPages().map((page) => ({
    url: `${siteUrl}${page.url}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: page.url === '/' ? 1 : 0.7,
  }));

  return [
    ...docsPages,
    {
      url: `${siteUrl}/llms.txt`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/llms-full.txt`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
  ];
}
