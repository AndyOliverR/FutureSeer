"use client";

import { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";

type Item = { title: string; url: string; source: string };

export function NewsHeadlinesStrip({ country }: { country: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/integrations/news/headlines?country=${encodeURIComponent(country)}&pageSize=5`
        );
        const json = await res.json();
        if (cancelled) return;
        if (!json.enabled) {
          setItems([]);
          return;
        }
        setItems(Array.isArray(json.items) ? json.items : []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [country]);

  if (!loading && items.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-500/20 bg-slate-900/50 p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-4 h-4 text-amber-400" aria-hidden />
        <h3 className="text-sm font-semibold text-amber-200">World snapshot</h3>
      </div>
      {loading && <p className="text-slate-400 text-sm">Loading headlines…</p>}
      {!loading && (
        <ul className="space-y-2 text-sm text-slate-300">
          {items.map((it, i) => (
            <li key={i}>
              <a
                href={it.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 hover:underline line-clamp-2"
              >
                {it.title}
              </a>
              <span className="text-slate-500 text-xs ml-1">— {it.source}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-slate-500 text-xs mt-2">Headlines for mundane context; not astrological predictions.</p>
    </div>
  );
}
