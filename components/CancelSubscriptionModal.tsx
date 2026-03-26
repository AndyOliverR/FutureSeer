"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { devLog } from '@/lib/devLogger';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
}: CancelSubscriptionModalProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleConfirm = async () => {
    setIsCancelling(true);
    try {
      await onConfirm();
    } catch (error) {
      devLog.error('Error cancelling', error, 'CancelSubscriptionModal');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-amber-500/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl font-serif flex items-center gap-2">
            <span className="shrink-0"><Heart className="w-6 h-6 text-amber-400" /></span>
            We're Sorry to See You Go
          </DialogTitle>
          <DialogDescription className="text-slate-300 font-serif">
            You can always come back and resubscribe anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-slate-300">
            Cancellation takes effect when our payment provider confirms it: recurring billing stops and your
            membership access ends at that point (not at the end of a grace period unless your bank shows otherwise).
          </p>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-slate-300">
              Optional: Help us improve (What could we do better?)
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Your feedback helps us improve..."
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              disabled={isCancelling}
            >
              Keep My Contribution
            </Button>
            <Button
              onClick={handleConfirm}
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel Contribution
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-slate-400 pt-2">
            Remember: You can rejoin anytime and continue supporting the innovation experiment!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
