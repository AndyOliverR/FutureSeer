/**
 * Razorpay Checkout display name (bank SMS, modal title).
 * Override with NEXT_PUBLIC_CHECKOUT_DISPLAY_NAME for white-label or campaigns.
 */
export const CHECKOUT_DISPLAY_NAME =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CHECKOUT_DISPLAY_NAME?.trim()
    ? process.env.NEXT_PUBLIC_CHECKOUT_DISPLAY_NAME.trim()
    : 'FutureSeer';
