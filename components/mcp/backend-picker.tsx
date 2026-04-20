'use client';

import { useMemo, useState } from 'react';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Tabs, TabsList, TabsTrigger } from 'fumadocs-ui/components/ui/tabs';
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
      <Tabs value={active.id} onValueChange={setBackendId} className="mb-3">
        <TabsList>
          {ordered.map((backend) => (
            <TabsTrigger key={backend.id} value={backend.id}>
              {backend.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <p className="mb-2 text-xs text-muted-foreground">{active.setupHint}</p>

      <div className="relative">
        <DynamicCodeBlock lang="toml" code={active.snippet} />
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

      <Cards className="mt-3">
        <Card title="Upstream" href={active.url} external>
          {active.url}
        </Card>
      </Cards>
    </div>
  );
}
