/**
 * Admin audit logging. Writes to Firestore auditLogs collection.
 * Used by set-claims, bulk-actions, refund, cancel-user-subscription.
 */

import { adminDb } from '@/lib/firebase-admin';

const COLLECTION = 'auditLogs';

export interface AuditEntry {
  actorUid: string;
  actorEmail?: string;
  action: string;
  targetUid?: string;
  targetUserIds?: string[];
  details?: Record<string, unknown>;
  timestamp: number;
}

export async function writeAuditLog(entry: Omit<AuditEntry, 'timestamp'>): Promise<void> {
  if (!adminDb) return;
  const doc: AuditEntry = {
    ...entry,
    timestamp: Date.now(),
  };
  await adminDb.collection(COLLECTION).add(doc);
}
