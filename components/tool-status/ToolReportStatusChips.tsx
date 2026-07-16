"use client";

type ToolReportStatusChipsProps = {
  freshnessLabel?: string | null;
  /** @deprecated Unused — kept optional so existing call sites compile. */
  reportUnchanged?: boolean;
  className?: string;
};

export function ToolReportStatusChips({
  freshnessLabel,
  className = "",
}: ToolReportStatusChipsProps) {
  if (!freshnessLabel) return null;

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`.trim()}>
      <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
        {freshnessLabel}
      </span>
    </div>
  );
}
