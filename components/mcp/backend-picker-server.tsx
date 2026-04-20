import { getMcpBackends, type McpBackend } from '@/lib/mcp-clients';
import { BackendPresetPicker } from './backend-picker';

type Props = {
  initialBackend?: string;
  compact?: boolean;
  only?: string[];
};

export function BackendPresetPickerServer({ initialBackend, compact, only }: Props) {
  let backends: McpBackend[] = getMcpBackends();
  if (only && only.length > 0) {
    const set = new Set(only);
    backends = backends.filter((b) => set.has(b.id));
  }
  return (
    <BackendPresetPicker
      backends={backends}
      initialBackend={initialBackend}
      compact={compact}
    />
  );
}
