'use client';

import { useMemo, useState } from 'react';
import type { McpBackend } from '@/lib/mcp-clients';

type Props = {
  backends: McpBackend[];
  initialBackend?: string;
  compact?: boolean;
};

export function BackendPresetPicker({ backends, initialBackend, compact }: Props) {
  const ordered = useMemo(() => {
    if (!initialBackend) return backends;
    const first = backends.find((b) => b.id === initialBackend);
    if (!first) return backends;
    return [first, ...backends.filter((b) => b.id !== first.id)];
  }, [backends, initialBackend]);

  const [backendId, setBackendId] = useState(initialBackend ?? ordered[0]?.id);
  const active = ordered.find((b) => b.id === backendId) ?? ordered[0];
  const [copied, setCopied] = useState(false);

  if (!active) return null;

  return (
    <div className={`my-6 rounded-xl border border-border bg-card p-4 ${compact ? '' : ''}`}>
      <label className="mb-3 block text-xs text-muted-foreground">
        <span className="mb-1 block font-medium text-foreground">Backend</span>
        <select
          value={active.id}
          onChange={(e) => setBackendId(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
        >
          {ordered.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
              {b.requiresKey ? ' · needs API key' : ''}
            </option>
          ))}
        </select>
      </label>

      <p className="mb-2 text-xs text-muted-foreground">{active.setupHint}</p>

      <div className="relative">
        <pre className="max-h-60 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
          <code>{active.snippet}</code>
        </pre>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(active.snippet);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* ignore */
            }
          }}
          className="absolute right-2 top-2 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          {copied ? 'Copied' : 'Copy TOML'}
        </button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Upstream:{' '}
        <a href={active.url} className="underline underline-offset-2" rel="noreferrer noopener" target="_blank">
          {active.url}
        </a>
      </p>
    </div>
  );
}
