/**
 * Shared admin/superadmin email list for server-side API routes.
 * Single source of truth: change here or via ADMIN_EMAILS env to add/remove admins.
 */

const DEFAULT_ADMIN_EMAILS = [
  'andyrozario@hotmail.com',
  'andyoliverrozario2@gmail.com',
];

/** Comma-separated list; override via env ADMIN_EMAILS. */
function parseAdminEmailsEnv(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Returns the list of emails that are treated as admin/superadmin (lowercase). */
export function getAdminEmails(): string[] {
  const fromEnv = parseAdminEmailsEnv();
  if (fromEnv.length > 0) return fromEnv;
  return DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase());
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
