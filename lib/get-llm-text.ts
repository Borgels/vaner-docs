import { source } from '@/lib/source';

type Page = ReturnType<typeof source.getPages>[number];

export async function getLLMText(page: Page) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})\n\n${processed}`;
}
