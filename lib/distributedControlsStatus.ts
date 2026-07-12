/**
 * Runtime status for optional Firestore-backed rate limits and AI circuit breaker.
 * Used by admin diagnose and local env verification scripts.
 */

import 'server-only';

import { isAdminAvailable } from '@/lib/firebase-admin';
import { isDistributedCircuitBreakerEnabled } from '@/lib/aiCircuitBreakerStore';

export type DistributedControlsStatus = {
  rateLimitStore: {
    envValue: string;
    active: boolean;
    collection: '_apiRateLimits';
  };
  circuitBreakerStore: {
    envValue: string;
    active: boolean;
    collection: '_aiCircuitBreaker';
  };
  firebaseAdminAvailable: boolean;
  capacitorBuild: boolean;
  /** Both stores using Firestore across instances */
  mode: 'firestore' | 'memory' | 'partial';
  recommendations: string[];
};

export function getDistributedControlsStatus(): DistributedControlsStatus {
  const rateEnv = process.env.RATE_LIMIT_STORE?.trim() || '';
  const circuitEnv = process.env.AI_CIRCUIT_STORE?.trim() || '';
  const admin = isAdminAvailable();
  const capacitorBuild = process.env.CAPACITOR_BUILD === '1';

  const rateActive =
    rateEnv === 'firestore' && admin && !capacitorBuild;
  const circuitActive = isDistributedCircuitBreakerEnabled();

  let mode: DistributedControlsStatus['mode'] = 'memory';
  if (rateActive && circuitActive) mode = 'firestore';
  else if (rateActive || circuitActive) mode = 'partial';

  const recommendations: string[] = [];
  if (rateEnv !== 'firestore') {
    recommendations.push('Set RATE_LIMIT_STORE=firestore in Vercel Production (then redeploy).');
  }
  if (circuitEnv !== 'firestore') {
    recommendations.push('Set AI_CIRCUIT_STORE=firestore in Vercel Production (then redeploy).');
  }
  if (!admin) {
    recommendations.push('Configure FIREBASE_ADMIN_* so Firestore-backed limits and breaker can run.');
  }
  if (capacitorBuild) {
    recommendations.push('CAPACITOR_BUILD=1 disables distributed stores (static export).');
  }
  if (mode === 'firestore' && recommendations.length === 0) {
    recommendations.push('Distributed controls active. After traffic, confirm _apiRateLimits and _aiCircuitBreaker in Firestore.');
  }

  return {
    rateLimitStore: {
      envValue: rateEnv || '(unset)',
      active: rateActive,
      collection: '_apiRateLimits',
    },
    circuitBreakerStore: {
      envValue: circuitEnv || '(unset)',
      active: circuitActive,
      collection: '_aiCircuitBreaker',
    },
    firebaseAdminAvailable: admin,
    capacitorBuild,
    mode,
    recommendations,
  };
}
