'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import type { GeneratedSocialPostCopy } from '@/lib/growth/generateSocialPostCopy';
import {
  channelLabel,
  listTemplatesForChannel,
  SOCIAL_CHANNELS,
  type SocialChannel,
} from '@/lib/growth/socialPostTemplates';
import { formatScheduledTimeDisplay } from '@/lib/growth/socialPostSchedule';
import { safeCopyToClipboard } from '@/lib/safeClipboard';
import { cn } from '@/lib/utils';

interface SocialPostGeneratorProps {
  getIdToken: () => Promise<string>;
  initialChannel?: SocialChannel;
  initialTemplateId?: string;
  /** Called when channel changes (e.g. to sync weekly queue highlight). */
  onChannelChange?: (channel: SocialChannel) => void;
}

function CopyField({
  label,
  value,
  multiline,
  onCopied,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  onCopied: (label: string) => void;
}) {
  if (!value) return null;

  const handleCopy = async () => {
    const ok = await safeCopyToClipboard(value);
    onCopied(ok ? label : '');
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs uppercase tracking-wide text-slate-400">{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-amber-200/90 hover:bg-slate-800"
          onClick={() => void handleCopy()}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
      </div>
      {multiline ? (
        <pre className="whitespace-pre-wrap rounded-lg border border-slate-600/60 bg-slate-900/80 p-3 text-sm text-slate-100">
          {value}
        </pre>
      ) : (
        <p className="rounded-lg border border-slate-600/60 bg-slate-900/80 p-3 text-sm text-slate-100">
          {value}
        </p>
      )}
    </div>
  );
}

export function SocialPostGenerator({
  getIdToken,
  initialChannel,
  initialTemplateId,
  onChannelChange,
}: SocialPostGeneratorProps) {
  const { toast } = useToast();
  const [channel, setChannel] = useState<SocialChannel>(initialChannel ?? 'facebook');
  const [templateId, setTemplateId] = useState<string>(initialTemplateId ?? '');
  const [capabilityBullet, setCapabilityBullet] = useState('');
  const [mythTopic, setMythTopic] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copy, setCopy] = useState<GeneratedSocialPostCopy | null>(null);

  const channelTemplates = useMemo(() => listTemplatesForChannel(channel), [channel]);

  const selectedTemplate = useMemo(
    () => channelTemplates.find((t) => t.id === templateId) ?? channelTemplates[0],
    [channelTemplates, templateId],
  );

  const effectiveTemplateId = selectedTemplate?.id ?? '';

  useEffect(() => {
    if (!initialChannel) return;
    setChannel(initialChannel);
    onChannelChange?.(initialChannel);
    const templates = listTemplatesForChannel(initialChannel);
    const nextTemplate =
      initialTemplateId && templates.some((t) => t.id === initialTemplateId)
        ? initialTemplateId
        : (templates[0]?.id ?? '');
    setTemplateId(nextTemplate);
    setCopy(null);
  }, [initialChannel, initialTemplateId, onChannelChange]);

  const handleChannelChange = (value: SocialChannel) => {
    setChannel(value);
    onChannelChange?.(value);
    const templates = listTemplatesForChannel(value);
    setTemplateId(templates[0]?.id ?? '');
    setCopy(null);
  };

  const handleGenerate = useCallback(async () => {
    if (!effectiveTemplateId) {
      toast({ title: 'Pick a template', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    setCopy(null);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/social/generate-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateId: effectiveTemplateId,
          capabilityBullet: capabilityBullet || undefined,
          mythTopic: mythTopic || undefined,
          customNote: customNote || undefined,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        copy?: GeneratedSocialPostCopy;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }
      if (data.copy) {
        setCopy(data.copy);
        toast({ title: 'Copy ready', description: 'Review and paste into your channel' });
      }
    } catch (err) {
      toast({
        title: 'Could not generate',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  }, [capabilityBullet, customNote, effectiveTemplateId, getIdToken, mythTopic, toast]);

  const handleCopyAll = useCallback(async () => {
    if (!copy) return;
    const parts = [
      copy.headline && `【${copy.headline}】`,
      copy.primary,
      copy.bullets.length ? copy.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n') : '',
      copy.hashtags,
      copy.cta,
    ].filter(Boolean);
    const ok = await safeCopyToClipboard(parts.join('\n\n'));
    toast({
      title: ok ? 'Full post copied' : 'Copy failed',
      variant: ok ? 'default' : 'destructive',
    });
  }, [copy, toast]);

  const onFieldCopied = useCallback(
    (label: string) => {
      if (label) {
        toast({ title: `${label} copied` });
      } else {
        toast({ title: 'Copy failed', variant: 'destructive' });
      }
    },
    [toast],
  );

  return (
    <div className="space-y-6">
      <Card className="admin-card border-slate-600/50 text-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-slate-100">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Generate post copy
          </CardTitle>
          <p className="text-sm text-slate-400">
            Copy-only — paste into Facebook, Instagram, WhatsApp Status, etc. No auto-posting.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={(v) => handleChannelChange(v as SocialChannel)}>
                <SelectTrigger className="border-slate-600 bg-slate-900 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_CHANNELS.map((c) => {
                    const times = formatScheduledTimeDisplay(c.postTime);
                    return (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label} ({c.calendarDay} · {times.ist} / {times.utc})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <Select
                value={effectiveTemplateId}
                onValueChange={(v) => {
                  setTemplateId(v);
                  setCopy(null);
                }}
              >
                <SelectTrigger className="border-slate-600 bg-slate-900 text-slate-100">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {channelTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTemplate ? (
            <p className="text-sm text-slate-400">{selectedTemplate.description}</p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="capability-bullet">Capability / feature (optional)</Label>
            <Input
              id="capability-bullet"
              className="border-slate-600 bg-slate-900 text-slate-100"
              placeholder="e.g. Vedic + Western charts from one birth profile"
              value={capabilityBullet}
              onChange={(e) => setCapabilityBullet(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="myth-topic">Myth to bust (optional)</Label>
            <Input
              id="myth-topic"
              className="border-slate-600 bg-slate-900 text-slate-100"
              placeholder="e.g. You need five different apps for tarot and astrology"
              value={mythTopic}
              onChange={(e) => setMythTopic(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-note">Extra direction (optional)</Label>
            <Textarea
              id="custom-note"
              className="min-h-[72px] border-slate-600 bg-slate-900 text-slate-100"
              placeholder="Tone tweak, campaign angle, etc."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>

          <Button
            type="button"
            className="gap-2 bg-amber-600 text-slate-950 hover:bg-amber-500"
            disabled={generating || !effectiveTemplateId}
            onClick={() => void handleGenerate()}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? 'Generating…' : 'Generate copy'}
          </Button>
        </CardContent>
      </Card>

      {copy ? (
        <Card className={cn('admin-card border-amber-500/30 text-slate-200')}>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base text-slate-100">Generated — {channelLabel(copy.channel)}</CardTitle>
              <p className="text-xs text-slate-500">Template: {copy.templateId}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-slate-500 text-slate-200"
              onClick={() => void handleCopyAll()}
            >
              <Copy className="mr-1 h-3.5 w-3.5" />
              Copy all
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <CopyField label="Headline / hook" value={copy.headline} onCopied={onFieldCopied} />
            <CopyField label="Primary" value={copy.primary} multiline onCopied={onFieldCopied} />
            {copy.bullets.length > 0 ? (
              <CopyField
                label="Bullets"
                value={copy.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}
                multiline
                onCopied={onFieldCopied}
              />
            ) : null}
            <CopyField label="Hashtags" value={copy.hashtags} onCopied={onFieldCopied} />
            <CopyField label="CTA" value={copy.cta} onCopied={onFieldCopied} />
            <CopyField label="Admin notes" value={copy.notes} multiline onCopied={onFieldCopied} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
