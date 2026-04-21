import { source } from '@/lib/source';
import { llms } from 'fumadocs-core/source';

export const revalidate = false;

export function GET() {
  const index = llms(source).index();

  const preamble = `# Vaner Documentation

> Vaner is a predictive context engine. It ponders your codebase in the background —
> exploring scenarios, pre-computing context, ranking what matters — so when you ask,
> the right evidence is already at the front of the queue.

## AI install & operation prompts

- [Install prompt](https://vaner.ai/prompts/install.md): install, wire MCP, pick backend, verify.
- [Upgrade prompt](https://vaner.ai/prompts/upgrade.md): upgrade in place, restart, verify.
- [Backend swap prompt](https://vaner.ai/prompts/backend-swap.md): switch model backend, verify.
- [Debug prompt](https://vaner.ai/prompts/debug.md): diagnose MCP not showing, silent ponder loop, stale context.

## Full documentation content

- [llms-full.txt](https://docs.vaner.ai/llms-full.txt): all documentation pages in a single file.

---

`;

  return new Response(preamble + index);
}
