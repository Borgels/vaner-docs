"use client";

import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";

type PageActionsProps = {
  pageUrl: string;
  pageTitle: string;
};

const DOCS_ORIGIN = "https://docs.vaner.ai";

export function PageActions({ pageUrl, pageTitle }: PageActionsProps) {
  const mdxUrl = `${pageUrl}.mdx`;

  const [copied, onCopyClick] = useCopyButton(async () => {
    try {
      const res = await fetch(mdxUrl);
      const text = res.ok ? await res.text() : `${DOCS_ORIGIN}${mdxUrl}`;
      await navigator.clipboard.writeText(text);
    } catch {
      await navigator.clipboard.writeText(`${DOCS_ORIGIN}${mdxUrl}`).catch(() => {});
    }
  });

  const sharedClass = buttonVariants({ variant: "ghost", size: "sm" });

  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(`Read ${DOCS_ORIGIN}${mdxUrl} and help me understand: ${pageTitle}`)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(`Read ${DOCS_ORIGIN}${mdxUrl} and help me understand: ${pageTitle}`)}`;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "8px",
        borderBottom: "1px solid var(--color-fd-border)",
        paddingBottom: "16px",
        marginBottom: "24px",
      }}
    >
      <button type="button" className={sharedClass} onClick={onCopyClick}>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          style={{ width: "12px", height: "12px", flexShrink: 0 }}
          aria-hidden
        >
          <rect x="4" y="4" width="9" height="9" rx="1.5" />
          <path d="M3 10 V3.5 A1.5 1.5 0 0 1 4.5 2 H10" />
        </svg>
        {copied ? "Copied" : "Copy as Markdown"}
      </button>

      <a
        href={chatGptUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClass}
      >
        Ask ChatGPT
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          style={{ width: "12px", height: "12px", flexShrink: 0 }}
          aria-hidden
        >
          <path d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3" />
          <path d="M10 2h4v4" />
          <path d="M14 2 8 8" />
        </svg>
      </a>

      <a
        href={claudeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClass}
      >
        Ask Claude
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          style={{ width: "12px", height: "12px", flexShrink: 0 }}
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
