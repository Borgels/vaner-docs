"use client";

import { useState } from "react";

type PageActionsProps = {
  /** The page URL path, e.g. "/getting-started". Used to build the .mdx URL and the handoff links. */
  pageUrl: string;
  /** The page title, used in the handoff prompt. */
  pageTitle: string;
};

const DOCS_ORIGIN = "https://docs.vaner.ai";

function handoffUrl(baseUrl: string, mdxUrl: string, title: string) {
  const msg = `Read ${DOCS_ORIGIN}${mdxUrl} and help me understand: ${title}`;
  return `${baseUrl}?q=${encodeURIComponent(msg)}`;
}

export function PageActions({ pageUrl, pageTitle }: PageActionsProps) {
  const [copied, setCopied] = useState(false);

  // /getting-started → /docs/getting-started.mdx  (Fumadocs *.mdx rewrite)
  const mdxUrl = `${pageUrl}.mdx`;

  const copyMarkdown = async () => {
    try {
      const res = await fetch(mdxUrl);
      const text = res.ok ? await res.text() : `${DOCS_ORIGIN}${mdxUrl}`;
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        await navigator.clipboard.writeText(`${DOCS_ORIGIN}${mdxUrl}`);
      } catch {}
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 border-b pb-4">
      <button
        type="button"
        onClick={copyMarkdown}
        title="Copy page as Markdown"
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-fd-border bg-fd-muted/30 px-2.5 text-xs text-fd-muted-foreground transition-colors hover:border-fd-foreground/30 hover:text-fd-foreground"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className="h-3 w-3 shrink-0"
          aria-hidden
        >
          <rect x="4" y="4" width="9" height="9" rx="1.5" />
          <path d="M3 10 V3.5 A1.5 1.5 0 0 1 4.5 2 H10" />
        </svg>
        {copied ? "Copied" : "Copy as Markdown"}
      </button>

      <a
        href={handoffUrl("https://chatgpt.com/", mdxUrl, pageTitle)}
        target="_blank"
        rel="noopener noreferrer"
        title="Open this page in ChatGPT"
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-fd-border bg-fd-muted/30 px-2.5 text-xs text-fd-muted-foreground transition-colors hover:border-fd-foreground/30 hover:text-fd-foreground"
      >
        Ask ChatGPT
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className="h-3 w-3 shrink-0"
          aria-hidden
        >
          <path d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3" />
          <path d="M10 2h4v4" />
          <path d="M14 2 8 8" />
        </svg>
      </a>

      <a
        href={handoffUrl("https://claude.ai/new", mdxUrl, pageTitle)}
        target="_blank"
        rel="noopener noreferrer"
        title="Open this page in Claude"
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-fd-border bg-fd-muted/30 px-2.5 text-xs text-fd-muted-foreground transition-colors hover:border-fd-foreground/30 hover:text-fd-foreground"
      >
        Ask Claude
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className="h-3 w-3 shrink-0"
          aria-hidden
        >
          <path d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3" />
          <path d="M10 2h4v4" />
          <path d="M14 2 8 8" />
        </svg>
      </a>
    </div>
  );
}
