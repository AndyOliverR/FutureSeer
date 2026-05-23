import type { Metadata } from "next";
import { buildToolsIndexMetadata } from "@/lib/seo/buildPageMetadata";
import { ToolsLayoutShell } from "@/app/tools/ToolsLayoutShell";

export const metadata: Metadata = buildToolsIndexMetadata();

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <ToolsLayoutShell>{children}</ToolsLayoutShell>;
}
