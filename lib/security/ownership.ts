export function resolveOwnedUserId(
  requestedUserId: unknown,
  authUid: string,
): string | null {
  if (typeof requestedUserId !== 'string' || !requestedUserId.trim()) {
    return null;
  }
  return requestedUserId === authUid ? requestedUserId : null;
}

