import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "docs", "marketing", "aso", "locale-packs.json");
const outputDir = path.join(root, "docs", "marketing", "aso", "generated");
const outputPath = path.join(outputDir, "app-store-keywords.csv");

function csvEscape(value) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

async function main() {
  const raw = await readFile(sourcePath, "utf8");
  const parsed = JSON.parse(raw);
  const locales = parsed?.locales ?? {};

  const rows = [["locale", "markets", "title", "subtitle", "keywords"]];
  for (const locale of Object.keys(locales)) {
    const entry = locales[locale] ?? {};
    rows.push([
      locale,
      Array.isArray(entry.markets) ? entry.markets.join("|") : "",
      entry.title ?? "",
      entry.subtitle ?? "",
      Array.isArray(entry.keywords) ? entry.keywords.join(",") : "",
    ]);
  }

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, csv, "utf8");
  process.stdout.write(`Generated ${outputPath}\n`);
}

main().catch((error) => {
  process.stderr.write(`Failed to export keyword CSV: ${error.message}\n`);
  process.exit(1);
});
