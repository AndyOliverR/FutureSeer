'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export type BillingBalanceSnapshot = {
  creditBalance: number;
  billingMode: 'payg' | 'subscription';
  unlimited: boolean;
  freeUseConsumed: {
    mainSeer?: boolean;
    profileRegen?: boolean;
    toolSeer?: Record<string, boolean>;
  };
};

export function useBillingCredits() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<BillingBalanceSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.uid) {
      setSnapshot(null);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/billing/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setSnapshot(null);
        return;
      }
      const data = (await res.json()) as BillingBalanceSnapshot & { success?: boolean };
      setSnapshot({
        creditBalance: data.creditBalance ?? 0,
        billingMode: data.billingMode ?? 'payg',
        unlimited: data.unlimited === true,
        freeUseConsumed: data.freeUseConsumed ?? {},
      });
    } catch {
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { snapshot, loading, refresh };
}
