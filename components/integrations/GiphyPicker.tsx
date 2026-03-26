"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GiphyItem = {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
};

export function GiphyPicker({
  onInsert,
  disabled,
}: {
  onInsert: (markdown: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<GiphyItem[]>([]);
  const [attribution, setAttribution] = useState("");
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/integrations/giphy/search?q=${encodeURIComponent(q.trim())}&limit=12`);
      const json = await res.json();
      if (!json.enabled) {
        setItems([]);
        setError("GIF search is not configured.");
        return;
      }
      setAttribution(json.attribution || "");
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch {
      setError("Could not search GIFs.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePick = (g: GiphyItem) => {
    onInsert(`\n\n${g.url}\n`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled} className="border-amber-500/40 text-amber-200">
          GIF
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,380px)] bg-slate-900 border-amber-500/30 p-3" align="start">
        <div className="flex gap-2 mb-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
            placeholder="Search GIPHY…"
            className="bg-slate-800/80 border-slate-600 text-gray-200"
          />
          <Button type="button" size="sm" onClick={search} disabled={loading || !q.trim()}>
            {loading ? "…" : "Go"}
          </Button>
        </div>
        {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
        <div className="grid grid-cols-3 gap-1 max-h-56 overflow-y-auto">
          {items.map((g) => (
            <button
              key={g.id}
              type="button"
              className="relative rounded overflow-hidden border border-transparent hover:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              onClick={() => handlePick(g)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.previewUrl} alt={g.title || ""} className="w-full h-20 object-cover" />
            </button>
          ))}
        </div>
        {attribution && <p className="text-[10px] text-slate-500 mt-2 leading-snug">{attribution}</p>}
      </PopoverContent>
    </Popover>
  );
}
