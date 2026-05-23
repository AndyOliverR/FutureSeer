'use client';

import { useCallback, useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface WeeklyDigestActionsProps {
  getIdToken: () => Promise<string>;
}

export function WeeklyDigestActions({ getIdToken }: WeeklyDigestActionsProps) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSendDigest = useCallback(async () => {
    setSending(true);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/social/send-weekly-digest', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { success?: boolean; sentTo?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Send failed');
      }
      toast({
        title: 'Weekly digest sent',
        description: data.sentTo ? `Check ${data.sentTo}` : 'Check your inbox',
      });
    } catch (err) {
      toast({
        title: 'Could not send digest',
        description: err instanceof Error ? err.message : 'Check env vars',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  }, [getIdToken, toast]);

  return (
    <Card className="admin-card border-slate-600/50 text-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-slate-100">
          <Mail className="h-4 w-4 text-amber-400" />
          Monday email digest
        </CardTitle>
        <p className="text-sm text-slate-400">
          Optional checklist email every Monday (Vercel Cron). Set{' '}
          <code className="text-xs text-amber-200/80">SOCIAL_WEEKLY_DIGEST_EMAIL</code> in production.
        </p>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="outline"
          className="border-slate-500 text-slate-200"
          disabled={sending}
          onClick={() => void handleSendDigest()}
        >
          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
          Send weekly digest now
        </Button>
      </CardContent>
    </Card>
  );
}
