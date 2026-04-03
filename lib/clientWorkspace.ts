/**
 * Consultant client workspace: God + Mary use /profile to enter a client's details,
 * generate mystical reports on their own uid, then clear for the next client.
 */

const DEFAULT_CLIENT_WORKSPACE_EMAILS = [
  'andyrozario@hotmail.com',
  'andyoliverrozario2@gmail.com',
] as const;

/** Server-side list (comma-separated env override). */
export function getClientWorkspaceEmails(): string[] {
  const raw = process.env.CLIENT_WORKSPACE_EMAILS;
  if (raw && typeof raw === 'string' && raw.trim()) {
    return raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }
  return [...DEFAULT_CLIENT_WORKSPACE_EMAILS];
}

/** Client-side list (public env override for UI gating). */
export function getClientWorkspaceEmailsClient(): string[] {
  const raw = process.env.NEXT_PUBLIC_CLIENT_WORKSPACE_EMAILS;
  if (raw && typeof raw === 'string' && raw.trim()) {
    return raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }
  return [...DEFAULT_CLIENT_WORKSPACE_EMAILS];
}

export function isClientWorkspaceEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  return getClientWorkspaceEmailsClient().includes(email.trim().toLowerCase());
}
