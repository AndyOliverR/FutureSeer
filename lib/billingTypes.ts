/** Pay-as-you-go wallet vs recurring membership. */
export type BillingMode = 'payg' | 'subscription';

export type BillingAction = 'main_seer' | 'tool_seer' | 'profile_regen';

export type CreditPackId = 'starter' | 'regular' | 'power';

export type FreeUseConsumed = {
  mainSeer?: boolean;
  profileRegen?: boolean;
  toolSeer?: Record<string, boolean>;
};

export type BillingUserFields = {
  email?: string;
  billingMode?: BillingMode | null;
  creditBalance?: number;
  freeUseConsumed?: FreeUseConsumed;
  creditOrderIds?: string[];
  noChargeAccount?: boolean;
  mysticalProfileGenerated?: boolean;
  subscriptionStatus?: string;
  selectedPlan?: string;
  paymentMethodId?: string;
};

export type ConsumeBillingSuccess = {
  ok: true;
  charged: boolean;
  creditsCharged: number;
  creditBalance: number;
  usedFreeInstance: boolean;
};

export type ConsumeBillingFailure = {
  ok: false;
  code: 'insufficient_credits';
  creditBalance: number;
  creditsRequired: number;
};

export type ConsumeBillingResult = ConsumeBillingSuccess | ConsumeBillingFailure;
