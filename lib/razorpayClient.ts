/**
 * Razorpay Client-Side Integration
 * Handles client-side Razorpay Checkout for payment method capture
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Load Razorpay Checkout script
 */
export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
}

/**
 * Initialize Razorpay Checkout for payment method capture
 */
export async function initializeRazorpayCheckout(params: {
  key: string;
  amount: number; // Amount in smallest currency unit (0 for trial)
  currency: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: any) => void;
  onError?: (error: any) => void;
}) {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error('Razorpay script not loaded');
  }

  const options = {
    key: params.key,
    amount: params.amount,
    currency: params.currency,
    name: params.name,
    description: params.description,
    prefill: params.prefill || {},
    handler: params.handler,
    modal: {
      ondismiss: () => {
        if (params.onError) {
          params.onError(new Error('Payment cancelled by user'));
        }
      },
    },
    theme: {
      color: '#f59e0b', // Amber color matching FutureSeer theme
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();

  return razorpay;
}

/**
 * Initialize Razorpay Checkout for one-time order (e.g. Tip Jar)
 * Uses order_id from Orders API; do not pass amount/currency.
 */
export async function initializeRazorpayOrderCheckout(params: {
  orderId: string;
  key: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (res: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onError?: (err: unknown) => void;
}) {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error('Razorpay script not loaded');
  }

  const options = {
    key: params.key,
    order_id: params.orderId,
    name: params.name,
    description: params.description,
    prefill: params.prefill || {},
    handler: params.handler,
    modal: {
      ondismiss: () => {
        if (params.onError) {
          params.onError(new Error('Payment cancelled by user'));
        }
      },
    },
    theme: {
      color: '#f59e0b',
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();

  return razorpay;
}

/**
 * Initialize Razorpay Checkout for subscription (with payment method capture)
 */
export async function initializeSubscriptionCheckout(params: {
  key: string;
  subscriptionId: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: any) => void;
  onError?: (error: any) => void;
}) {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error('Razorpay script not loaded');
  }

  const options = {
    key: params.key,
    subscription_id: params.subscriptionId,
    name: params.name,
    description: params.description,
    prefill: params.prefill || {},
    handler: params.handler,
    modal: {
      ondismiss: () => {
        if (params.onError) {
          params.onError(new Error('Subscription cancelled by user'));
        }
      },
    },
    theme: {
      color: '#f59e0b', // Amber color matching FutureSeer theme
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();

  return razorpay;
}
