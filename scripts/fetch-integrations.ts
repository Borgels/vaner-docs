import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const RAW_MANIFEST_URL =
  "https://raw.githubusercontent.com/Borgels/Vaner/main/docs/integrations/compatibility.json";

const DEFAULT_LOCAL_MANIFEST = "/home/abo/repos/Vaner/docs/integrations/compatibility.json";
const GENERATED_FALLBACK = resolve(process.cwd(), "content/docs/integrations/_generated.json");

function parseArgs(): { source?: string } {
  const args = process.argv.slice(2);
  const sourceArg = args.find((arg) => arg.startsWith("--source="));
  return { source: sourceArg ? sourceArg.slice("--source=".length) : undefined };
}

async function readManifestText(source?: string): Promise<string> {
  const localPath = source || process.env.VANER_COMPATIBILITY_PATH || DEFAULT_LOCAL_MANIFEST;

  try {
    return await readFile(localPath, "utf-8");
  } catch {
    const response = await fetch(RAW_MANIFEST_URL, { cache: "no-store" });
    if (response.ok) {
      return await response.text();
    }
  }

  try {
    const fallback = await readFile(GENERATED_FALLBACK, "utf-8");
    console.warn(`Using fallback manifest from ${GENERATED_FALLBACK}`);
    return fallback;
  } catch {
    throw new Error("Failed to load compatibility manifest from local path, remote URL, and generated fallback.");
  }
}

async function main(): Promise<void> {
  const { source } = parseArgs();
  const text = await readManifestText(source);
  const parsed = JSON.parse(text);

  const outPath = resolve(process.cwd(), "content/docs/integrations/_generated.json");
  await mkdir(resolve(process.cwd(), "content/docs/integrations"), { recursive: true });
  await writeFile(outPath, JSON.stringify(parsed, null, 2) + "\n", "utf-8");

  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
