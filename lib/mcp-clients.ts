import clientsData from '@/content/mcp/clients.json';
import backendsData from '@/content/mcp/backends.json';

export type McpScope = {
  id: string;
  label: string;
};

export type McpClientInstallCli = {
  kind: 'cli';
  command: string;
};

export type McpClientInstallFile = {
  kind: 'file';
  path: string;
  language: string;
  snippet: string;
  scopePaths?: Record<string, string>;
};

export type McpClientInstall = McpClientInstallCli | McpClientInstallFile;

export type McpClient = {
  id: string;
  name: string;
  category: 'cli' | 'ide' | 'desktop' | 'extension';
  scopes: McpScope[];
  install: McpClientInstall;
  verify: string;
  docsSlug: string;
  sourceUrl: string;
};

export type McpBackend = {
  id: string;
  name: string;
  requiresKey: boolean;
  apiKeyEnv?: string;
  snippet: string;
  setupHint: string;
  url: string;
};

const KNOWN_CATEGORIES = new Set(['cli', 'ide', 'desktop', 'extension']);

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`[mcp-clients] manifest invalid: ${msg}`);
}

function validateClient(raw: unknown, idx: number): McpClient {
  assert(raw && typeof raw === 'object', `clients[${idx}] is not an object`);
  const c = raw as Record<string, unknown>;
  assert(typeof c.id === 'string' && c.id.length > 0, `clients[${idx}].id missing`);
  assert(typeof c.name === 'string', `clients[${c.id}].name missing`);
  assert(typeof c.category === 'string' && KNOWN_CATEGORIES.has(c.category as string), `clients[${c.id}].category invalid`);
  assert(Array.isArray(c.scopes) && c.scopes.length > 0, `clients[${c.id}].scopes empty`);
  for (const [i, s] of (c.scopes as unknown[]).entries()) {
    assert(s && typeof s === 'object', `clients[${c.id}].scopes[${i}] not object`);
    const sc = s as Record<string, unknown>;
    assert(typeof sc.id === 'string', `clients[${c.id}].scopes[${i}].id missing`);
    assert(typeof sc.label === 'string', `clients[${c.id}].scopes[${i}].label missing`);
  }
  assert(c.install && typeof c.install === 'object', `clients[${c.id}].install missing`);
  const inst = c.install as Record<string, unknown>;
  if (inst.kind === 'cli') {
    assert(typeof inst.command === 'string', `clients[${c.id}].install.command missing`);
  } else if (inst.kind === 'file') {
    assert(typeof inst.path === 'string', `clients[${c.id}].install.path missing`);
    assert(typeof inst.language === 'string', `clients[${c.id}].install.language missing`);
    assert(typeof inst.snippet === 'string', `clients[${c.id}].install.snippet missing`);
  } else {
    throw new Error(`[mcp-clients] clients[${c.id}].install.kind must be 'cli' or 'file'`);
  }
  assert(typeof c.verify === 'string', `clients[${c.id}].verify missing`);
  assert(typeof c.docsSlug === 'string', `clients[${c.id}].docsSlug missing`);
  assert(typeof c.sourceUrl === 'string', `clients[${c.id}].sourceUrl missing`);
  return c as unknown as McpClient;
}

function validateBackend(raw: unknown, idx: number): McpBackend {
  assert(raw && typeof raw === 'object', `backends[${idx}] not object`);
  const b = raw as Record<string, unknown>;
  assert(typeof b.id === 'string', `backends[${idx}].id missing`);
  assert(typeof b.name === 'string', `backends[${b.id}].name missing`);
  assert(typeof b.requiresKey === 'boolean', `backends[${b.id}].requiresKey missing`);
  assert(typeof b.snippet === 'string', `backends[${b.id}].snippet missing`);
  assert(typeof b.setupHint === 'string', `backends[${b.id}].setupHint missing`);
  assert(typeof b.url === 'string', `backends[${b.id}].url missing`);
  return b as unknown as McpBackend;
}

let cachedClients: McpClient[] | null = null;
let cachedBackends: McpBackend[] | null = null;

export function getMcpClients(): McpClient[] {
  if (cachedClients) return cachedClients;
  const raw = clientsData as { clients?: unknown[] };
  assert(Array.isArray(raw.clients), 'clients manifest missing `clients` array');
  cachedClients = raw.clients.map(validateClient);
  return cachedClients;
}

export function getMcpClient(id: string): McpClient | undefined {
  return getMcpClients().find((c) => c.id === id);
}

export function getMcpBackends(): McpBackend[] {
  if (cachedBackends) return cachedBackends;
  const raw = backendsData as { backends?: unknown[] };
  assert(Array.isArray(raw.backends), 'backends manifest missing `backends` array');
  cachedBackends = raw.backends.map(validateBackend);
  return cachedBackends;
}

export function getMcpBackend(id: string): McpBackend | undefined {
  return getMcpBackends().find((b) => b.id === id);
}

export function renderInstallSnippet(client: McpClient, scope: string): { language: string; content: string; path?: string } {
  if (client.install.kind === 'cli') {
    return {
      language: 'bash',
      content: client.install.command.replace('{scope}', scope),
    };
  }
  const scopePath = client.install.scopePaths?.[scope];
  const path = (client.install.path || '').replace('{scopePath}', scopePath ?? client.install.path);
  return {
    language: client.install.language,
    content: client.install.snippet,
    path,
  };
}
