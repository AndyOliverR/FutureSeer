"use client";

type ToolReportStatusChipsProps = {
  freshnessLabel?: string | null;
  reportUnchanged?: boolean;
  className?: string;
};

export function ToolReportStatusChips({
  freshnessLabel,
  reportUnchanged = false,
  className = "",
}: ToolReportStatusChipsProps) {
  if (!freshnessLabel && !reportUnchanged) return null;

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`.trim()}>
      {freshnessLabel && (
        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
          {freshnessLabel}
        </span>
      )}
      {reportUnchanged && (
        <span className="rounded-full border border-slate-500/40 bg-slate-500/15 px-3 py-1 text-xs text-slate-200">
          No new data yet
        </span>
      )}
    </div>
  );
}
