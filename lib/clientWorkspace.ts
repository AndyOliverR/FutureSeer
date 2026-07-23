/**
 * Consultant client workspace: God + Mary use /profile to enter a client's details,
 * generate mystical reports on their own uid, then clear for the next client.
 * Allowlist emails come from env only (no hardcoded PII).
 */

function parseEmailList(raw: string | undefined): string[] {
  if (!raw || typeof raw !== 'string' || !raw.trim()) return [];
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Server-side list (comma-separated CLIENT_WORKSPACE_EMAILS). */
export function getClientWorkspaceEmails(): string[] {
  return parseEmailList(process.env.CLIENT_WORKSPACE_EMAILS);
}

/** Client-side list (NEXT_PUBLIC_CLIENT_WORKSPACE_EMAILS for UI gating). */
export function getClientWorkspaceEmailsClient(): string[] {
  return parseEmailList(process.env.NEXT_PUBLIC_CLIENT_WORKSPACE_EMAILS);
}

export function isClientWorkspaceEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  return getClientWorkspaceEmailsClient().includes(email.trim().toLowerCase());
}
