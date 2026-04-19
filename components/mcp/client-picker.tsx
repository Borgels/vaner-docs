'use client';

import { useMemo, useState } from 'react';
import type { McpClient } from '@/lib/mcp-clients';
import { renderInstallSnippet } from '@/lib/mcp-clients';

type Props = {
  clients: McpClient[];
  initialClient?: string;
  lockClient?: boolean;
  compact?: boolean;
};

export function McpClientPicker({ clients, initialClient, lockClient, compact }: Props) {
  const ordered = useMemo(() => {
    if (!initialClient) return clients;
    const first = clients.find((c) => c.id === initialClient);
    if (!first) return clients;
    return [first, ...clients.filter((c) => c.id !== first.id)];
  }, [clients, initialClient]);

  const [clientId, setClientId] = useState(initialClient ?? ordered[0]?.id);
  const active = ordered.find((c) => c.id === clientId) ?? ordered[0];
  const [scopeId, setScopeId] = useState(active?.scopes[0]?.id ?? 'user');

  if (!active) return null;

  const currentScope = active.scopes.find((s) => s.id === scopeId) ?? active.scopes[0];
  const snippet = renderInstallSnippet(active, currentScope.id);
  const copyLabel = snippet.language === 'bash' ? 'Copy command' : 'Copy snippet';

  return (
    <div
      className={`my-6 grid gap-4 rounded-xl border border-border bg-card p-4 ${
        compact ? '' : 'md:grid-cols-[200px,1fr]'
      }`}
    >
      {!lockClient && !compact && (
        <nav aria-label="MCP clients" className="flex flex-col gap-1">
          {ordered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setClientId(c.id);
                const next = clients.find((x) => x.id === c.id);
                setScopeId(next?.scopes[0]?.id ?? 'user');
              }}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                c.id === active.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              aria-current={c.id === active.id}
            >
              <span>{c.name}</span>
              <span className="text-xs uppercase opacity-60">{c.category}</span>
            </button>
          ))}
        </nav>
      )}

      <div className="min-w-0">
        {compact && !lockClient && (
          <label className="mb-3 block text-xs text-muted-foreground">
            <span className="sr-only">Client</span>
            <select
              value={active.id}
              onChange={(e) => {
                setClientId(e.target.value);
                const next = clients.find((x) => x.id === e.target.value);
                setScopeId(next?.scopes[0]?.id ?? 'user');
              }}
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
            >
              {ordered.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {active.scopes.length > 1 && (
          <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Install scope">
            {active.scopes.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={s.id === currentScope.id}
                onClick={() => setScopeId(s.id)}
                className={`rounded-md border px-2 py-1 text-xs ${
                  s.id === currentScope.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {snippet.path && (
          <p className="mb-1 text-xs text-muted-foreground">
            <span className="font-medium">Path:</span> <code>{snippet.path}</code>
          </p>
        )}

        <div className="relative">
          <pre className="max-h-80 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
            <code>{snippet.content}</code>
          </pre>
          <CopyButton label={copyLabel} value={snippet.content} />
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Verify:</span> {active.verify}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Upstream docs:{' '}
          <a href={active.sourceUrl} className="underline underline-offset-2" rel="noreferrer noopener" target="_blank">
            {active.sourceUrl}
          </a>
        </p>
      </div>
    </div>
  );
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="absolute right-2 top-2 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
    >
      {copied ? 'Copied' : label}
    </button>
  );
}
