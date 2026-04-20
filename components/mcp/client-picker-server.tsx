import { getMcpClients, getMcpLaunchers, type McpClient, type McpLauncher } from '@/lib/mcp-clients';
import { McpClientPicker } from './client-picker';

type Props = {
  initialClient?: string;
  lockClient?: boolean;
  compact?: boolean;
  only?: string[];
};

export function McpClientPickerServer({ initialClient, lockClient, compact, only }: Props) {
  let clients: McpClient[] = getMcpClients();
  const launchers: McpLauncher[] = getMcpLaunchers();
  if (only && only.length > 0) {
    const set = new Set(only);
    clients = clients.filter((c) => set.has(c.id));
  }
  return (
    <McpClientPicker
      clients={clients}
      initialClient={initialClient}
      lockClient={lockClient}
      compact={compact}
      launchers={launchers}
    />
  );
}
