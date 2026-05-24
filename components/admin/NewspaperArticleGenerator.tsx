'use client';

import { useCallback, useMemo, useState } from 'react';
import { Copy, ExternalLink, Loader2, Newspaper } from 'lucide-react';
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
import type { GeneratedNewspaperArticleCopy } from '@/lib/growth/generateNewspaperArticleCopy';
import { NEWSPAPER_OUTLETS, type NewspaperOutletId } from '@/lib/growth/newspaperOutlets';
import { safeCopyToClipboard } from '@/lib/safeClipboard';
import { cn } from '@/lib/utils';

interface NewspaperArticleGeneratorProps {
  getIdToken: () => Promise<string>;
}

type OutletMeta = {
  id: string;
  label: string;
  submissionUrl: string;
  submissionLabel: string;
  submissionNotes: string;
};

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
        <p className="rounded-lg border border-slate-600/60 bg-slate-900/80 p-3 text-sm text-slate-100">{value}</p>
      )}
    </div>
  );
}

export function NewspaperArticleGenerator({ getIdToken }: NewspaperArticleGeneratorProps) {
  const { toast } = useToast();
  const [outletId, setOutletId] = useState<NewspaperOutletId>(
    NEWSPAPER_OUTLETS[0]?.id ?? 'toi-citizen-reporter',
  );
  const [topicAngle, setTopicAngle] = useState('');
  const [locationHook, setLocationHook] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copy, setCopy] = useState<GeneratedNewspaperArticleCopy | null>(null);
  const [outletMeta, setOutletMeta] = useState<OutletMeta | null>(null);

  const selectedOutlet = useMemo(
    () => NEWSPAPER_OUTLETS.find((o) => o.id === outletId) ?? NEWSPAPER_OUTLETS[0],
    [outletId],
  );

  const handleGenerate = useCallback(async () => {
    if (!outletId) {
      toast({ title: 'Pick an outlet', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    setCopy(null);
    setOutletMeta(null);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/social/generate-newspaper-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          outletId,
          topicAngle: topicAngle || undefined,
          locationHook: locationHook || undefined,
          customNote: customNote || undefined,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        copy?: GeneratedNewspaperArticleCopy;
        outlet?: OutletMeta;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }
      if (data.copy) {
        setCopy(data.copy);
        setOutletMeta(data.outlet ?? null);
        toast({ title: 'Draft ready', description: 'Review before submitting to the outlet' });
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
  }, [customNote, getIdToken, locationHook, outletId, toast, topicAngle]);

  const handleCopyAll = useCallback(async () => {
    if (!copy) return;
    const parts = [
      copy.headline && `# ${copy.headline}`,
      copy.subhead,
      copy.body,
      copy.photoCaption && `Photo caption: ${copy.photoCaption}`,
      copy.submissionChecklist && `Submission checklist:\n${copy.submissionChecklist}`,
      copy.disclaimer && `Disclaimer: ${copy.disclaimer}`,
    ].filter(Boolean);
    const ok = await safeCopyToClipboard(parts.join('\n\n'));
    toast({
      title: ok ? 'Full draft copied' : 'Copy failed',
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
            <Newspaper className="h-4 w-4 text-amber-400" />
            Generate newspaper / outreach draft
          </CardTitle>
          <p className="text-sm text-slate-400">
            Copy-only — submit manually to TOI Citizen Reporter, TOI Blog, or editor pitches. Print ads are paid;
            this tool does not book classifieds.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Outlet</Label>
            <Select
              value={outletId}
              onValueChange={(v) => {
                const next = NEWSPAPER_OUTLETS.find((o) => o.id === v);
                if (!next) return;
                setOutletId(next.id);
                setCopy(null);
                setOutletMeta(null);
              }}
            >
              <SelectTrigger className="border-slate-600 bg-slate-900 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NEWSPAPER_OUTLETS.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOutlet ? (
            <p className="text-sm text-slate-400">{selectedOutlet.description}</p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="topic-angle">Topic / angle (optional)</Label>
            <Input
              id="topic-angle"
              className="border-slate-600 bg-slate-900 text-slate-100"
              placeholder="e.g. How AI helps people learn Jyotish without replacing astrologers"
              value={topicAngle}
              onChange={(e) => setTopicAngle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location-hook">Location / civic hook (optional)</Label>
            <Input
              id="location-hook"
              className="border-slate-600 bg-slate-900 text-slate-100"
              placeholder="e.g. Bengaluru tech community, NRI readers in the US"
              value={locationHook}
              onChange={(e) => setLocationHook(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newspaper-custom-note">Extra direction (optional)</Label>
            <Textarea
              id="newspaper-custom-note"
              className="min-h-[72px] border-slate-600 bg-slate-900 text-slate-100"
              placeholder="Tone, facts to include or avoid, etc."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>

          <Button
            type="button"
            className="gap-2 bg-amber-600 text-slate-950 hover:bg-amber-500"
            disabled={generating || !outletId}
            onClick={() => void handleGenerate()}
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Newspaper className="h-4 w-4" />}
            {generating ? 'Generating…' : 'Generate article draft'}
          </Button>
        </CardContent>
      </Card>

      {copy ? (
        <Card className={cn('admin-card border-amber-500/30 text-slate-200')}>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base text-slate-100">
                Draft — {outletMeta?.label ?? selectedOutlet?.label}
              </CardTitle>
              {outletMeta?.submissionNotes ? (
                <p className="mt-1 text-xs text-slate-500">{outletMeta.submissionNotes}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {outletMeta?.submissionUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-500 text-slate-200"
                  asChild
                >
                  <a href={outletMeta.submissionUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3.5 w-3.5" />
                    {outletMeta.submissionLabel}
                  </a>
                </Button>
              ) : null}
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
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CopyField label="Headline" value={copy.headline} onCopied={onFieldCopied} />
            <CopyField label="Subhead" value={copy.subhead} onCopied={onFieldCopied} />
            <CopyField label="Body" value={copy.body} multiline onCopied={onFieldCopied} />
            <CopyField label="Photo caption" value={copy.photoCaption} onCopied={onFieldCopied} />
            <CopyField label="Submission checklist" value={copy.submissionChecklist} multiline onCopied={onFieldCopied} />
            <CopyField label="Disclaimer" value={copy.disclaimer} multiline onCopied={onFieldCopied} />
            <CopyField label="Admin notes" value={copy.notes} multiline onCopied={onFieldCopied} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
