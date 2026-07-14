import { redirect } from "next/navigation";

/**
 * Mystical Profile UX retired — reports live in each Occult / Divination tool.
 * Old bookmarks and post-generate links land on /tools.
 */
export default async function MysticalProfileRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ generating?: string }>;
}) {
  const params = await searchParams;
  const generating = params?.generating === "1";
  redirect(generating ? "/tools?generating=1" : "/tools");
}
