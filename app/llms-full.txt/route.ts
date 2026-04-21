import { source } from '@/lib/source';
import { getLLMText } from '@/lib/get-llm-text';

export const revalidate = false;

export async function GET() {
  const scan = source.getPages().map(getLLMText);
  const scanned = await Promise.all(scan);

  const header = `# Vaner Documentation — Full Content

> All documentation pages concatenated for AI consumption.
> For a curated index see: https://docs.vaner.ai/llms.txt
> For AI install/operation prompts see: https://vaner.ai/prompts/install.md

---

`;

  return new Response(header + scanned.join('\n\n---\n\n'));
}
