'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Copy, Download, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { analytics } from '@/lib/analytics';
import type { MysticalSharePayload } from '@/lib/growth/mysticalShareCard';
import { safeCopyToClipboard } from '@/lib/safeClipboard';
import {
  MysticalShareCardVisual,
  MYSTICAL_SHARE_CARD_EXPORT_HEIGHT,
  MYSTICAL_SHARE_CARD_EXPORT_WIDTH,
} from '@/components/growth/MysticalShareCardVisual';
import { cn } from '@/lib/utils';

interface MysticalShareCardPanelProps {
  payloads: MysticalSharePayload[];
  /** Matches mystical profile layout branch. */
  variant: 'm3' | 'web';
}

/** On-screen preview width — larger = more readable before download. */
const PREVIEW_MAX_WIDTH = 440;

async function exportCardPng(cardEl: HTMLElement): Promise<string> {
  return toPng(cardEl, {
    width: MYSTICAL_SHARE_CARD_EXPORT_WIDTH,
    height: MYSTICAL_SHARE_CARD_EXPORT_HEIGHT,
    pixelRatio: 2,
    cacheBust: true,
  });
}

export function MysticalShareCardPanel({ payloads, variant }: MysticalShareCardPanelProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [busy, setBusy] = useState<'download' | 'share' | null>(null);
  const [previewScale, setPreviewScale] = useState(PREVIEW_MAX_WIDTH / MYSTICAL_SHARE_CARD_EXPORT_WIDTH);
  const viewedSlugsRef = useRef<Set<string>>(new Set());

  const safeIndex = payloads.length === 0 ? 0 : Math.min(selectedIndex, payloads.length - 1);
  const payload = payloads[safeIndex];

  const isM3 = variant === 'm3';

  useEffect(() => {
    if (selectedIndex >= payloads.length) {
      setSelectedIndex(Math.max(0, payloads.length - 1));
    }
  }, [payloads.length, selectedIndex]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === 'undefined') return;

    const updateScale = () => {
      const width = frame.clientWidth;
      if (width <= 0) return;
      setPreviewScale(width / MYSTICAL_SHARE_CARD_EXPORT_WIDTH);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [safeIndex]);

  useEffect(() => {
    if (!payload) return;
    if (viewedSlugsRef.current.has(payload.highlightToolSlug)) return;
    viewedSlugsRef.current.add(payload.highlightToolSlug);
    analytics.trackMysticalShareCard('view', {
      archetype: payload.archetypeTitle,
      tool: payload.highlightToolName,
      toolSlug: payload.highlightToolSlug,
      cardCount: payloads.length,
    });
  }, [payload, payloads.length]);

  if (!payload) return null;

  const shareText = `${payload.displayName}'s cosmic profile (${payload.highlightToolName}): ${payload.archetypeTitle} — ${payload.hookLine.slice(0, 120)}…`;
  const previewHeight = MYSTICAL_SHARE_CARD_EXPORT_HEIGHT * previewScale;

  const handleCopyLink = useCallback(async () => {
    const ok = await safeCopyToClipboard(payload.shareUrl);
    analytics.trackMysticalShareCard('copy_link', {
      archetype: payload.archetypeTitle,
      toolSlug: payload.highlightToolSlug,
    });
    toast({
      title: ok ? 'Link copied' : 'Could not copy',
      description: ok ? 'Share your link anywhere' : 'Copy the link manually below',
      variant: ok ? 'default' : 'destructive',
    });
  }, [payload, toast]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setBusy('download');
    try {
      const dataUrl = await exportCardPng(cardRef.current);
      const link = document.createElement('a');
      link.download = `futureseer-${payload.highlightToolSlug}-${payload.archetypeTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      analytics.trackMysticalShareCard('download', {
        archetype: payload.archetypeTitle,
        toolSlug: payload.highlightToolSlug,
      });
      toast({ title: 'Image saved', description: `${payload.highlightToolName} card saved as PNG` });
    } catch {
      toast({
        title: 'Download failed',
        description: 'Try again or use Share instead',
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  }, [payload, toast]);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    setBusy('share');
    try {
      const dataUrl = await exportCardPng(cardRef.current);
      const blob = await fetch(dataUrl).then((r) => r.blob());
      const file = new File(
        [blob],
        `futureseer-${payload.highlightToolSlug}.png`,
        { type: 'image/png' },
      );

      if (typeof navigator !== 'undefined' && navigator.share) {
        const withFiles =
          typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
        if (withFiles) {
          await navigator.share({
            files: [file],
            title: `My ${payload.highlightToolName} — FutureSeer`,
            text: `${shareText}\n${payload.shareUrl}`,
          });
        } else {
          await navigator.share({
            title: `My ${payload.highlightToolName} — FutureSeer`,
            text: `${shareText}\n${payload.shareUrl}`,
            url: payload.shareUrl,
          });
        }
        analytics.trackMysticalShareCard('native_share', {
          archetype: payload.archetypeTitle,
          toolSlug: payload.highlightToolSlug,
        });
      } else {
        await handleCopyLink();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      toast({
        title: 'Share unavailable',
        description: 'Use Download or Copy link',
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  }, [payload, shareText, toast, handleCopyLink]);

  const shellClass = isM3
    ? 'rounded-3xl border border-outline-variant bg-surface-container-high p-4'
    : 'rounded-2xl border border-amber-500/25 bg-slate-900/50 backdrop-blur-sm p-6';

  const titleClass = isM3
    ? 'text-lg font-heading font-bold text-primary uppercase tracking-tight'
    : 'text-xl font-heading font-light shiny-gold-text tracking-widest uppercase';

  const subClass = isM3 ? 'text-sm text-surface-on-variant' : 'text-sm text-slate-400';

  const chipActive = isM3
    ? 'border-primary bg-primary-container text-on-surface'
    : 'border-amber-500/60 bg-amber-500/15 text-amber-100';

  const chipIdle = isM3
    ? 'border-outline-variant bg-surface-container-low text-surface-on-variant hover:border-outline'
    : 'border-amber-500/20 bg-slate-900/40 text-slate-400 hover:border-amber-500/40 hover:text-amber-200';

  return (
    <section className={cn('mb-8', isM3 ? 'px-0' : '')} aria-labelledby="mystical-share-heading">
      <div className={shellClass}>
        <div className="mb-4 flex items-start gap-3">
          <div
            className={cn(
              'shrink-0 rounded-full p-2',
              isM3 ? 'bg-primary-container text-primary-on-container' : 'bg-amber-500/15 text-amber-400',
            )}
          >
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="mystical-share-heading" className={titleClass}>
              Share your cosmic cards
            </h2>
            <p className={cn('mt-1', subClass)}>
              {payloads.length === 1
                ? 'Download or share your highlight — friends see your archetype and find you on '
                : `${payloads.length} traditions ready — pick a card, then share or download. Friends find you on `}
              <span className="font-medium text-amber-400/90">futureseer.app</span>.
            </p>
          </div>
        </div>

        {payloads.length > 1 ? (
          <div
            className="mb-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar"
            role="tablist"
            aria-label="Share card by tradition"
          >
            {payloads.map((p, index) => {
              const selected = index === safeIndex;
              return (
                <button
                  key={p.highlightToolSlug}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="mystical-share-card-preview"
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    'shrink-0 rounded-xl border px-3 py-2 text-left transition-colors min-w-[9.5rem] max-w-[11rem]',
                    selected ? chipActive : chipIdle,
                  )}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wide opacity-80">
                    {p.highlightToolName}
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold leading-tight line-clamp-2">
                    {p.archetypeTitle}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="flex flex-col items-center gap-5">
          <div
            className={cn(
              'mx-auto w-full max-w-[440px] rounded-[26px] p-2.5 shadow-2xl',
              isM3 ? 'bg-surface-container-lowest' : 'bg-slate-950/80 ring-1 ring-amber-500/20',
            )}
          >
            <div
              id="mystical-share-card-preview"
              ref={frameRef}
              className="relative w-full overflow-hidden rounded-[18px]"
              style={{ height: previewHeight }}
              role="tabpanel"
            >
              <div
                style={{
                  width: MYSTICAL_SHARE_CARD_EXPORT_WIDTH,
                  height: MYSTICAL_SHARE_CARD_EXPORT_HEIGHT,
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                }}
              >
                <MysticalShareCardVisual
                  key={payload.highlightToolSlug}
                  ref={cardRef}
                  payload={payload}
                />
              </div>
            </div>
          </div>

          <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
            <Button
              type="button"
              size="sm"
              disabled={busy !== null}
              onClick={() => void handleShare()}
              className={
                isM3
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              }
            >
              <Share2 className="mr-2 h-4 w-4" />
              {busy === 'share' ? 'Preparing…' : 'Share'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy !== null}
              onClick={() => void handleDownload()}
              className={
                isM3
                  ? 'border-outline-variant text-on-surface'
                  : 'border-amber-500/40 text-amber-100'
              }
            >
              <Download className="mr-2 h-4 w-4" />
              {busy === 'download' ? 'Saving…' : 'Download PNG'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy !== null}
              onClick={() => void handleCopyLink()}
              className={
                isM3
                  ? 'border-outline-variant text-on-surface'
                  : 'border-amber-500/40 text-amber-100'
              }
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy link
            </Button>
          </div>
          <p className={cn('w-full max-w-md truncate text-center text-xs', subClass)}>
            {payload.shareUrl}
          </p>
        </div>
      </div>
    </section>
  );
}
