/**
 * Shared admin/superadmin email list for server-side API routes.
 * Prefer Firebase custom claims (`admin` / `superadmin`). Email allowlist is optional via ADMIN_EMAILS.
 * Do not hardcode personal emails — public repos must keep PII in env only.
 */

/** Comma-separated list; set ADMIN_EMAILS in Vercel / .env.local. */
function parseAdminEmailsEnv(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Returns the list of emails that are treated as admin/superadmin (lowercase). Empty if unset. */
export function getAdminEmails(): string[] {
  return parseAdminEmailsEnv();
}

/** Decoded Firebase ID token (minimal shape). */
type DecodedToken = { admin?: boolean; superadmin?: boolean; email?: string };

/** Returns true if the decoded token has admin/superadmin claim or email is in getAdminEmails(). */
export function isAdminDecoded(decoded: DecodedToken): boolean {
  if (decoded.admin === true || decoded.superadmin === true) return true;
  const email = decoded.email?.trim().toLowerCase();
  if (!email) return false;
  return getAdminEmails().includes(email);
}
