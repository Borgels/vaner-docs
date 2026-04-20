import { z } from 'zod';

const ClientsManifestSchema = z.object({
  version: z.number(),
  clients: z.array(z.object({ id: z.string().min(1) })).min(1),
});

const BackendsManifestSchema = z.object({
  version: z.number(),
  backends: z.array(z.object({ id: z.string().min(1) })).min(1),
});

const LaunchersManifestSchema = z.object({
  version: z.number(),
  launchers: z.array(
    z.object({
      id: z.enum(['uvx', 'path']),
      command: z.string().min(1),
      args: z.array(z.string()),
    }),
  ).min(1),
});

export function validateManifest(file, parsed) {
  if (file.endsWith('clients.json')) {
    return ClientsManifestSchema.parse(parsed);
  }
  if (file.endsWith('backends.json')) {
    return BackendsManifestSchema.parse(parsed);
  }
  return LaunchersManifestSchema.parse(parsed);
}
