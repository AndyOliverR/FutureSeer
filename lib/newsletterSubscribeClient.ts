/**
 * Client-side newsletter signup; POSTs to /api/newsletter/subscribe.
 */

export type NewsletterSubscribeResult =
  | { ok: true; message: string; alreadySubscribed?: boolean }
  | { ok: false; error: string };

export async function subscribeNewsletterClient(
  email: string
): Promise<NewsletterSubscribeResult> {
  const trimmed = email.trim();
  if (!trimmed) {
    return { ok: false, error: 'Email is required' };
  }

  let res: Response;
  try {
    res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmed }),
    });
  } catch {
    return { ok: false, error: 'Network error. Please try again.' };
  }

  let data: { error?: string; message?: string; alreadySubscribed?: boolean } = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    const err =
      typeof data.error === 'string'
        ? data.error
        : res.status === 500
          ? 'Updates are temporarily unavailable. Please try again later.'
          : 'Something went wrong.';
    return { ok: false, error: err };
  }

  return {
    ok: true,
    message: typeof data.message === 'string' ? data.message : 'Successfully subscribed!',
    alreadySubscribed: data.alreadySubscribed === true,
  };
}
