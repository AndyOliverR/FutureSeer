/**
 * Client-bundle replacement for lib/firebase-admin.ts.
 * Firebase Admin runs only on the server; this stub satisfies webpack when lib/firebase.ts is imported from client code.
 */

export const adminDb = null;

export function getAuth(): Record<string, unknown> {
  return {};
}

export function isAdminAvailable(): boolean {
  return false;
}

export async function getDocument(): Promise<null> {
  return null;
}

export async function setDocument(): Promise<boolean> {
  return false;
}

export async function batchSetDocuments(): Promise<boolean> {
  return false;
}

export async function deleteDocument(): Promise<boolean> {
  return false;
}
