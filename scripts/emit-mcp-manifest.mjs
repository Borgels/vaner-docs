#!/usr/bin/env node
// Copies content/mcp/*.json into public/ so docs.vaner.ai can serve the
// manifest as a JSON endpoint for vaner-web (and other consumers).

import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const sources = [
  ['content/mcp/clients.json', 'public/mcp-clients.json'],
  ['content/mcp/backends.json', 'public/mcp-backends.json'],
];

function validate(file, key) {
  const raw = readFileSync(file, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed[key])) {
    throw new Error(`[emit-mcp-manifest] ${file} missing '${key}' array`);
  }
  if (parsed[key].length === 0) {
    throw new Error(`[emit-mcp-manifest] ${file} has empty '${key}' array`);
  }
}

for (const [src, dst] of sources) {
  const srcPath = resolve(repoRoot, src);
  const dstPath = resolve(repoRoot, dst);
  if (!existsSync(srcPath)) {
    throw new Error(`[emit-mcp-manifest] missing source ${src}`);
  }
  const key = src.endsWith('clients.json') ? 'clients' : 'backends';
  validate(srcPath, key);
  mkdirSync(dirname(dstPath), { recursive: true });
  copyFileSync(srcPath, dstPath);
  console.log(`[emit-mcp-manifest] ${src} -> ${dst}`);
}
