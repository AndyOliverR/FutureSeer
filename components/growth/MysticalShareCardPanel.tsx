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
  payload: MysticalSharePayload;
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

export function MysticalShareCardPanel({ payload, variant }: MysticalShareCardPanelProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [busy, setBusy] = useState<'download' | 'share' | null>(null);
  const [previewScale, setPreviewScale] = useState(PREVIEW_MAX_WIDTH / MYSTICAL_SHARE_CARD_EXPORT_WIDTH);
  const viewedRef = useRef(false);

  const isM3 = variant === 'm3';

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
  }, []);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    analytics.trackMysticalShareCard('view', {
      archetype: payload.archetypeTitle,
      tool: payload.highlightToolName,
    });
  }, [payload.archetypeTitle, payload.highlightToolName]);

  const shareText = `${payload.displayName}'s cosmic profile: ${payload.archetypeTitle} — ${payload.hookLine.slice(0, 120)}…`;
  const previewHeight = MYSTICAL_SHARE_CARD_EXPORT_HEIGHT * previewScale;

  const handleCopyLink = useCallback(async () => {
    const ok = await safeCopyToClipboard(payload.shareUrl);
    analytics.trackMysticalShareCard('copy_link', {
      archetype: payload.archetypeTitle,
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
      link.download = `futureseer-${payload.archetypeTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      analytics.trackMysticalShareCard('download', {
        archetype: payload.archetypeTitle,
      });
      toast({ title: 'Image saved', description: 'Post it to your story or feed' });
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
      const file = new File([blob], 'futureseer-profile.png', { type: 'image/png' });

      if (typeof navigator !== 'undefined' && navigator.share) {
        const withFiles =
          typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
        if (withFiles) {
          await navigator.share({
            files: [file],
            title: 'My FutureSeer profile',
            text: `${shareText}\n${payload.shareUrl}`,
          });
        } else {
          await navigator.share({
            title: 'My FutureSeer profile',
            text: `${shareText}\n${payload.shareUrl}`,
            url: payload.shareUrl,
          });
        }
        analytics.trackMysticalShareCard('native_share', {
          archetype: payload.archetypeTitle,
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
          <div>
            <h2 id="mystical-share-heading" className={titleClass}>
              Share your cosmic card
            </h2>
            <p className={cn('mt-1', subClass)}>
              Download or share your highlight — friends see your archetype and find you on{' '}
              <span className="font-medium text-amber-400/90">futureseer.app</span>.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div
            className={cn(
              'mx-auto w-full max-w-[440px] rounded-[26px] p-2.5 shadow-2xl',
              isM3 ? 'bg-surface-container-lowest' : 'bg-slate-950/80 ring-1 ring-amber-500/20',
            )}
          >
            <div
              ref={frameRef}
              className="relative w-full overflow-hidden rounded-[18px]"
              style={{ height: previewHeight }}
            >
              <div
                style={{
                  width: MYSTICAL_SHARE_CARD_EXPORT_WIDTH,
                  height: MYSTICAL_SHARE_CARD_EXPORT_HEIGHT,
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                }}
              >
                <MysticalShareCardVisual ref={cardRef} payload={payload} />
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
