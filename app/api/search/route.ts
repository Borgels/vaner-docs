import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

const handler = createFromSource(source);

export async function GET(request: Request) {
  try {
    return await handler.GET(request);
  } catch {
    return Response.json({ error: 'Search unavailable' }, { status: 500 });
  }
}
