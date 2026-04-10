import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const workspaceRoot = process.cwd();
const sourcePath = path.join(workspaceRoot, "docs", "marketing", "aso", "locale-packs.json");
const outputDir = path.join(workspaceRoot, "docs", "marketing", "aso", "generated");
const outputPath = path.join(outputDir, "store-copy.md");

function renderLocale(locale, entry) {
  const keywords = Array.isArray(entry.keywords) ? entry.keywords.join(", ") : "";
  const markets = Array.isArray(entry.markets) ? entry.markets.join(", ") : "";
  return [
    `## ${locale}`,
    ``,
    `- Markets: ${markets}`,
    `- Title: ${entry.title ?? ""}`,
    `- Subtitle: ${entry.subtitle ?? ""}`,
    `- Short Description: ${entry.shortDescription ?? ""}`,
    `- Long Description: ${entry.longDescription ?? ""}`,
    `- Keywords: ${keywords}`,
    ``,
  ].join("\n");
}

async function main() {
  const raw = await readFile(sourcePath, "utf8");
  const parsed = JSON.parse(raw);
  const locales = parsed?.locales ?? {};
  const localeKeys = Object.keys(locales);

  const sections = [
    "# Generated Store Copy",
    "",
    `Generated from \`docs/marketing/aso/locale-packs.json\` on ${new Date().toISOString()}.`,
    "",
  ];

  for (const locale of localeKeys) {
    sections.push(renderLocale(locale, locales[locale]));
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, sections.join("\n"), "utf8");
  process.stdout.write(`Generated ${outputPath}\n`);
}

main().catch((error) => {
  process.stderr.write(`Failed to generate ASO copy: ${error.message}\n`);
  process.exit(1);
});
