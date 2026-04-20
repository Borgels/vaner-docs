import clientsData from '@/content/mcp/clients.json';
import backendsData from '@/content/mcp/backends.json';
import launchersData from '@/content/mcp/launchers.json';
import { z } from 'zod';

export type McpScope = {
  id: string;
  label: string;
};

export type McpLauncherId = 'uvx' | 'path';

export type McpLauncherCommand = {
  command: string;
  args: string[];
};

const ScopeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

const LauncherCommandSchema = z.object({
  command: z.string().min(1),
  args: z.array(z.string()),
});

const ClientInstallCliSchema = z.object({
  kind: z.literal('cli'),
  command: z.string().min(1),
});

const ClientInstallFileSchema = z.object({
  kind: z.literal('file'),
  path: z.string().min(1),
  language: z.string().min(1),
  snippet: z.string().min(1),
  scopePaths: z.record(z.string(), z.string()).optional(),
});

const ClientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['cli', 'ide', 'desktop', 'extension']),
  scopes: z.array(ScopeSchema).min(1),
  install: z.union([ClientInstallCliSchema, ClientInstallFileSchema]),
  launchers: z.object({
    uvx: LauncherCommandSchema,
    path: LauncherCommandSchema,
  }),
  verify: z.string().min(1),
  docsSlug: z.string().min(1),
  sourceUrl: z.string().url(),
});

const BackendSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  requiresKey: z.boolean(),
  apiKeyEnv: z.string().optional(),
  snippet: z.string().min(1),
  setupHint: z.string().min(1),
  url: z.string().url(),
});

const LauncherSchema = z.object({
  id: z.enum(['uvx', 'path']),
  label: z.string().min(1),
  description: z.string().min(1),
  command: z.string().min(1),
  args: z.array(z.string()),
});

const ClientsManifestSchema = z.object({
  version: z.number(),
  clients: z.array(ClientSchema).min(1),
});

const BackendsManifestSchema = z.object({
  version: z.number(),
  backends: z.array(BackendSchema).min(1),
});

const LaunchersManifestSchema = z.object({
  version: z.number(),
  launchers: z.array(LauncherSchema).min(1),
});

export type McpLauncher = z.infer<typeof LauncherSchema>;
export type McpClientInstallCli = z.infer<typeof ClientInstallCliSchema>;
export type McpClientInstallFile = z.infer<typeof ClientInstallFileSchema>;
export type McpClientInstall = z.infer<typeof ClientSchema>['install'];
export type McpClient = z.infer<typeof ClientSchema>;
export type McpBackend = z.infer<typeof BackendSchema>;

function shellEscape(value: string): string {
  if (/^[A-Za-z0-9_./:-]+$/.test(value)) return value;
  return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}

function renderLauncherArgsYaml(args: string[]): string {
  return args.map((arg) => `  - ${JSON.stringify(arg)}`).join('\n');
}

function buildLauncherContext(launcher: McpLauncherCommand): Record<string, string> {
  const dotPathArgs = [...launcher.args, '--path', '.'];
  const workspaceArgs = [...launcher.args, '--path', '${workspaceFolder}'];
  return {
    '{launcherCommand}': launcher.command,
    '{launcherShell}': [launcher.command, ...launcher.args].map(shellEscape).join(' '),
    '{launcherShellWithDotPath}': [launcher.command, ...dotPathArgs].map(shellEscape).join(' '),
    '{launcherArgsJson}': JSON.stringify(launcher.args),
    '{launcherArgsJsonWithDotPath}': JSON.stringify(dotPathArgs),
    '{launcherArgsJsonWithWorkspacePath}': JSON.stringify(workspaceArgs),
    '{launcherArgsYaml}': renderLauncherArgsYaml(launcher.args),
    '{launcherArgsYamlWithDotPath}': renderLauncherArgsYaml(dotPathArgs),
  };
}

function applyLauncherTemplate(template: string, launcher: McpLauncherCommand): string {
  let result = template;
  const context = buildLauncherContext(launcher);
  for (const [token, value] of Object.entries(context)) {
    result = result.replaceAll(token, value);
  }
  return result;
}

let cachedClients: McpClient[] | null = null;
let cachedBackends: McpBackend[] | null = null;
let cachedLaunchers: McpLauncher[] | null = null;

export function getMcpClients(): McpClient[] {
  if (cachedClients) return cachedClients;
  const parsed = ClientsManifestSchema.parse(clientsData);
  cachedClients = parsed.clients;
  return cachedClients;
}

export function getMcpClient(id: string): McpClient | undefined {
  return getMcpClients().find((c) => c.id === id);
}

export function getMcpBackends(): McpBackend[] {
  if (cachedBackends) return cachedBackends;
  const parsed = BackendsManifestSchema.parse(backendsData);
  cachedBackends = parsed.backends;
  return cachedBackends;
}

export function getMcpBackend(id: string): McpBackend | undefined {
  return getMcpBackends().find((b) => b.id === id);
}

export function getMcpLaunchers(): McpLauncher[] {
  if (cachedLaunchers) return cachedLaunchers;
  const parsed = LaunchersManifestSchema.parse(launchersData);
  cachedLaunchers = parsed.launchers;
  return cachedLaunchers;
}

export function renderInstallSnippet(
  client: McpClient,
  scope: string,
  launcherId: McpLauncherId = 'uvx',
): { language: string; content: string; path?: string; missingScopePath?: boolean } {
  const launcher = client.launchers[launcherId] ?? client.launchers.uvx ?? client.launchers.path;
  if (client.install.kind === 'cli') {
    return {
      language: 'bash',
      content: applyLauncherTemplate(client.install.command.replace('{scope}', scope), launcher),
    };
  }
  const scopePath = client.install.scopePaths?.[scope];
  const requiresScopePath = client.install.path.includes('{scopePath}');
  if (requiresScopePath && !scopePath) {
    return {
      language: client.install.language,
      content: applyLauncherTemplate(client.install.snippet, launcher),
      missingScopePath: true,
    };
  }
  const path = client.install.path.replace('{scopePath}', scopePath ?? '');
  return {
    language: client.install.language,
    content: applyLauncherTemplate(client.install.snippet, launcher),
    path,
  };
}
