import Link from "next/link";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl sm:text-4xl",
} as const;

export type FutureSeerWordmarkSize = keyof typeof SIZE_CLASS;

type FutureSeerWordmarkProps = {
  className?: string;
  size?: FutureSeerWordmarkSize;
  href?: string;
  /** Use when the wordmark is a heading (footer, hero). Avoid on `h1` if page already has one. */
  as?: "span" | "p" | "h2" | "h3";
};

/**
 * Standard FutureSeer logotype — Inter semibold + gold vertical gradient (matches brand asset).
 */
export function FutureSeerWordmark({
  className,
  size = "md",
  href,
  as: Tag = "span",
}: FutureSeerWordmarkProps) {
  const classes = cn("futureseer-wordmark", SIZE_CLASS[size], className);

  if (href) {
    return (
      <Link href={href} className={cn(classes, "inline-flex items-center focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2 rounded")} aria-label="FutureSeer — Home">
        FutureSeer
      </Link>
    );
  }

  return <Tag className={classes}>FutureSeer</Tag>;
}
