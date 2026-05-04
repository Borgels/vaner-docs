import { source } from '@/lib/source';
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { useMDXComponents } from '@/mdx-components';
import { PageActions } from '@/components/page-actions';

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const filePath = `content/docs/${slug && slug.length > 0 ? slug.join('/') : 'index'}.mdx`;
  const mdxComponents = useMDXComponents({});

  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      editOnGithub={{
        owner: 'Borgels',
        repo: 'vaner-docs',
        sha: 'main',
        path: filePath,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <PageActions pageUrl={page.url} pageTitle={page.data.title} />
        <MDX components={mdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const title = `${page.data.title} | Vaner Docs`;
  const canonical = `https://docs.vaner.ai${page.url}`;
  const ogImage = 'https://docs.vaner.ai/brand/png/og-dark-1200x630.png';

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: page.data.description,
      type: 'article',
      url: canonical,
      siteName: 'Vaner Docs',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${page.data.title} - Vaner Docs`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: page.data.description,
      images: [ogImage],
    },
  };
}
