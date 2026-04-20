'use client';

import { useEffect, useMemo, useState } from 'react';
import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Tabs, TabsList, TabsTrigger } from 'fumadocs-ui/components/ui/tabs';
import type { McpClient, McpLauncher, McpLauncherId } from '@/lib/mcp-clients';
import { renderInstallSnippet } from '@/lib/mcp-clients';

type Props = {
  clients: McpClient[];
  launchers: McpLauncher[];
  initialClient?: string;
  lockClient?: boolean;
  compact?: boolean;
};

const CLIENT_KEY = 'vaner.mcp.client';
const SCOPE_KEY = 'vaner.mcp.scope';
const LAUNCHER_KEY = 'vaner.mcp.launcher';

export function McpClientPicker({ clients, launchers, initialClient, lockClient, compact }: Props) {
  const ordered = useMemo(() => {
    if (!initialClient) return clients;
    const first = clients.find((c) => c.id === initialClient);
    if (!first) return clients;
    return [first, ...clients.filter((c) => c.id !== first.id)];
  }, [clients, initialClient]);

  const [clientId, setClientId] = useState(initialClient ?? ordered[0]?.id);
  const active = ordered.find((c) => c.id === clientId) ?? ordered[0];
  const [scopeId, setScopeId] = useState(active?.scopes[0]?.id ?? 'user');
  const [launcherId, setLauncherId] = useState<McpLauncherId>('uvx');

  if (!active) return null;

  useEffect(() => {
    if (lockClient || typeof window === 'undefined') return;
    const storedClient = window.localStorage.getItem(CLIENT_KEY);
    const storedScope = window.localStorage.getItem(SCOPE_KEY);
    const storedLauncher = window.localStorage.getItem(LAUNCHER_KEY);
    if (storedClient && ordered.some((client) => client.id === storedClient)) {
      setClientId(storedClient);
    }
    if (storedScope) setScopeId(storedScope);
    if (storedLauncher === 'uvx' || storedLauncher === 'path') {
      setLauncherId(storedLauncher);
    }
  }, [lockClient, ordered]);

  useEffect(() => {
    const selectedClient = ordered.find((client) => client.id === clientId) ?? ordered[0];
    if (!selectedClient.scopes.some((scope) => scope.id === scopeId)) {
      setScopeId(selectedClient.scopes[0]?.id ?? 'user');
    }
  }, [clientId, ordered, scopeId]);

  useEffect(() => {
    if (lockClient || typeof window === 'undefined') return;
    window.localStorage.setItem(CLIENT_KEY, clientId ?? '');
    window.localStorage.setItem(SCOPE_KEY, scopeId);
    window.localStorage.setItem(LAUNCHER_KEY, launcherId);
  }, [clientId, scopeId, launcherId, lockClient]);

  const currentScope = active.scopes.find((s) => s.id === scopeId) ?? active.scopes[0];
  const snippet = renderInstallSnippet(active, currentScope.id, launcherId);
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
          <Tabs value={currentScope.id} onValueChange={setScopeId} className="mb-3">
            <TabsList>
              {active.scopes.map((scope) => (
                <TabsTrigger key={scope.id} value={scope.id}>
                  {scope.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {launchers.length > 0 && (
          <Tabs value={launcherId} onValueChange={(value) => setLauncherId(value as McpLauncherId)} className="mb-3">
            <TabsList>
              {launchers.map((launcher) => (
                <TabsTrigger key={launcher.id} value={launcher.id}>
                  {launcher.id === 'uvx' ? 'Run via uvx (recommended)' : 'Use installed vaner on PATH'}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {snippet.missingScopePath && (
          <Callout type="warning" className="mb-3" title="Scope path not defined for this client">
            This scope does not have a configured target path in the client manifest. Pick another scope or update
            `content/mcp/clients.json`.
          </Callout>
        )}

        {snippet.path && (
          <p className="mb-1 text-xs text-muted-foreground">
            <span className="font-medium">Path:</span> <code>{snippet.path}</code>
          </p>
        )}

        <div className="relative">
          <DynamicCodeBlock lang={snippet.language} code={snippet.content} />
          <CopyButton label={copyLabel} value={snippet.content} />
        </div>

        <Cards className="mt-3">
          <Card title="Verify">{active.verify}</Card>
          <Card title="Upstream docs" href={active.sourceUrl} external>
            {active.sourceUrl}
          </Card>
        </Cards>
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
