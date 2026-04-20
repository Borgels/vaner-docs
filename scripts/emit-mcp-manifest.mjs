#!/usr/bin/env node
// Copies content/mcp/*.json into public/ so docs.vaner.ai can serve the
// manifest as a JSON endpoint for vaner-web (and other consumers).

import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateManifest } from './mcp-schema.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const sources = [
  ['content/mcp/clients.json', 'public/mcp-clients.json'],
  ['content/mcp/backends.json', 'public/mcp-backends.json'],
  ['content/mcp/launchers.json', 'public/mcp-launchers.json'],
];

function validate(file) {
  const raw = readFileSync(file, 'utf8');
  const parsed = JSON.parse(raw);
  try {
    validateManifest(file, parsed);
  } catch (error) {
    throw new Error(
      `[emit-mcp-manifest] ${file} failed schema validation: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

for (const [src, dst] of sources) {
  const srcPath = resolve(repoRoot, src);
  const dstPath = resolve(repoRoot, dst);
  if (!existsSync(srcPath)) {
    throw new Error(`[emit-mcp-manifest] missing source ${src}`);
  }
  validate(srcPath);
  mkdirSync(dirname(dstPath), { recursive: true });
  copyFileSync(srcPath, dstPath);
  console.log(`[emit-mcp-manifest] ${src} -> ${dst}`);
}
