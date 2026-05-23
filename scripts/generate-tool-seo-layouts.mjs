import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const toolsDir = path.join(root, "app", "tools");
const skip = new Set([
  "feng-shui",
  "iching",
  "numerology",
  "tarot",
  "vastu",
  "vedic",
  "western-astrology",
  "[slug]",
]);

function template(segment) {
  return `import type { Metadata } from "next"
import { buildToolPageMetadata } from "@/lib/seo/buildToolPageMetadata"

export const metadata: Metadata = buildToolPageMetadata("${segment}")

export default function ToolSeoLayout({ children }: { children: React.ReactNode }) {
  return children
}
`;
}

for (const name of fs.readdirSync(toolsDir)) {
  const dir = path.join(toolsDir, name);
  if (!fs.statSync(dir).isDirectory() || skip.has(name)) continue;
  const pagePath = path.join(dir, "page.tsx");
  const layoutPath = path.join(dir, "layout.tsx");
  if (!fs.existsSync(pagePath) || fs.existsSync(layoutPath)) continue;
  fs.writeFileSync(layoutPath, template(name));
  console.log("wrote", layoutPath);
}
