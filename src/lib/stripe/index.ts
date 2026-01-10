/**
 * Stripe Utility Library
 *
 * Centralized Stripe client and helper functions for:
 * - One-time checkout sessions
 * - Subscription checkout sessions
 * - Customer management
 * - Subscription management
 * - Price retrieval
 */

import Stripe from 'stripe';
import { HMO_PRO_ENABLED } from '@/lib/feature-flags';

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

export { stripe };

/**
 * Product Price IDs (from environment)
 */
export const PRICE_IDS = {
  // One-time products
  NOTICE_ONLY: process.env.STRIPE_PRICE_ID_NOTICE_ONLY!,
  EVICTION_PACK: process.env.STRIPE_PRICE_ID_EVICTION_PACK!,
  MONEY_CLAIM: process.env.STRIPE_PRICE_ID_MONEY_CLAIM!,
  STANDARD_AST: process.env.STRIPE_PRICE_ID_STANDARD_AST!,
  PREMIUM_AST: process.env.STRIPE_PRICE_ID_PREMIUM_AST!,
} as const;

export const HMO_PRICE_IDS = HMO_PRO_ENABLED
  ? {
      HMO_PRO_1_5: process.env.STRIPE_PRICE_ID_HMO_PRO_1_5,
      HMO_PRO_6_10: process.env.STRIPE_PRICE_ID_HMO_PRO_6_10,
      HMO_PRO_11_15: process.env.STRIPE_PRICE_ID_HMO_PRO_11_15,
      HMO_PRO_16_20: process.env.STRIPE_PRICE_ID_HMO_PRO_16_20,
    }
  : {};

/**
 * Product metadata mapping
 */
export const PRODUCT_METADATA: Record<string, { name: string; type: string; category: string }> = {
  [PRICE_IDS.NOTICE_ONLY]: {
    name: 'Notice Only',
    type: 'one_time',
    category: 'eviction',
  },
  [PRICE_IDS.EVICTION_PACK]: {
    name: 'Complete Eviction Pack',
    type: 'one_time',
    category: 'eviction',
  },
  [PRICE_IDS.MONEY_CLAIM]: {
    name: 'Money Claim Pack',
    type: 'one_time',
    category: 'money_claim',
  },
  [PRICE_IDS.STANDARD_AST]: {
    name: 'Standard AST',
    type: 'one_time',
    category: 'tenancy_agreement',
  },
  [PRICE_IDS.PREMIUM_AST]: {
    name: 'Premium AST',
    type: 'one_time',
    category: 'tenancy_agreement',
  },
  ...(HMO_PRO_ENABLED
    ? {
        [HMO_PRICE_IDS.HMO_PRO_1_5!]: {
          name: 'HMO Pro Starter (1-5 properties)',
          type: 'subscription',
          category: 'hmo_pro',
        },
        [HMO_PRICE_IDS.HMO_PRO_6_10!]: {
          name: 'HMO Pro Growth (6-10 properties)',
          type: 'subscription',
          category: 'hmo_pro',
        },
        [HMO_PRICE_IDS.HMO_PRO_11_15!]: {
          name: 'HMO Pro Professional (11-15 properties)',
          type: 'subscription',
          category: 'hmo_pro',
        },
        [HMO_PRICE_IDS.HMO_PRO_16_20!]: {
          name: 'HMO Pro Enterprise (16-20 properties)',
          type: 'subscription',
          category: 'hmo_pro',
        },
      }
    : {}),
};

/**
 * Create Stripe checkout session for one-time purchase
 */
export async function createOneTimeCheckoutSession({
  priceId,
  userId,
  caseId,
  successUrl,
  cancelUrl,
  customerEmail,
}: {
  priceId: string;
  userId: string;
  caseId?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}): Promise<Stripe.Checkout.Session> {
  const productInfo = PRODUCT_METADATA[priceId];

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    metadata: {
      user_id: userId,
      case_id: caseId || '',
      product_name: productInfo?.name || 'Unknown Product',
      product_type: productInfo?.type || 'one_time',
      product_category: productInfo?.category || 'general',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Create Stripe checkout session for subscription (HMO Pro)
 */
export async function createSubscriptionCheckoutSession({
  priceId,
  userId,
  successUrl,
  cancelUrl,
  customerEmail,
  trialDays = 7,
}: {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  trialDays?: number;
}): Promise<Stripe.Checkout.Session> {
  if (!HMO_PRO_ENABLED) {
    throw new Error('HMO Pro subscriptions are disabled for V1');
  }

  if (!Object.values(HMO_PRICE_IDS).includes(priceId)) {
    throw new Error('Unknown or disabled HMO Pro price ID');
  }

  const productInfo = PRODUCT_METADATA[priceId];

  // Determine subscription tier from price ID
  let tier = 'hmo_pro_1_5';
  if (priceId === HMO_PRICE_IDS.HMO_PRO_6_10) tier = 'hmo_pro_6_10';
  if (priceId === HMO_PRICE_IDS.HMO_PRO_11_15) tier = 'hmo_pro_11_15';
  if (priceId === HMO_PRICE_IDS.HMO_PRO_16_20) tier = 'hmo_pro_16_20';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    subscription_data: {
      trial_period_days: trialDays,
      metadata: {
        user_id: userId,
        tier,
      },
    },
    metadata: {
      user_id: userId,
      tier,
      product_name: productInfo?.name || 'HMO Pro',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Get or create Stripe customer
 */
export async function getOrCreateCustomer({
  email,
  userId,
  name,
}: {
  email: string;
  userId: string;
  name?: string;
}): Promise<Stripe.Customer> {
  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      user_id: userId,
    },
  });

  return customer;
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

/**
 * Resume a cancelled subscription (remove cancel_at_period_end)
 */
export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}

/**
 * Update subscription to new price (upgrade/downgrade)
 */
export async function updateSubscription({
  subscriptionId,
  newPriceId,
}: {
  subscriptionId: string;
  newPriceId: string;
}): Promise<Stripe.Subscription> {
  // Get current subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update with new price
  const updated = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });

  return updated;
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Get customer details
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer> {
  return await stripe.customers.retrieve(customerId) as Stripe.Customer;
}

/**
 * Get price details
 */
export async function getPrice(priceId: string): Promise<Stripe.Price> {
  return await stripe.prices.retrieve(priceId);
}

/**
 * Construct Stripe event from webhook (for signature verification)
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

/**
 * Format Stripe amount (cents to pounds)
 */
export function formatStripeAmount(amountInCents: number): string {
  return `£${(amountInCents / 100).toFixed(2)}`;
}

/**
 * Get tier from price ID
 */
export function getTierFromPriceId(priceId: string): string | null {
  if (!HMO_PRO_ENABLED) return null;
  if (priceId === HMO_PRICE_IDS.HMO_PRO_1_5) return 'hmo_pro_1_5';
  if (priceId === HMO_PRICE_IDS.HMO_PRO_6_10) return 'hmo_pro_6_10';
  if (priceId === HMO_PRICE_IDS.HMO_PRO_11_15) return 'hmo_pro_11_15';
  if (priceId === HMO_PRICE_IDS.HMO_PRO_16_20) return 'hmo_pro_16_20';
  return null;
}

/**
 * Get property limit from tier
 */
export function getPropertyLimitFromTier(tier: string): number {
  const limits: Record<string, number> = {
    'hmo_pro_1_5': 5,
    'hmo_pro_6_10': 10,
    'hmo_pro_11_15': 15,
    'hmo_pro_16_20': 20,
  };

  return limits[tier] || 0;
}

/**
 * Check if price ID is a subscription product
 */
export function isSubscriptionProduct(priceId: string): boolean {
  if (!HMO_PRO_ENABLED) return false;
  return [
    HMO_PRICE_IDS.HMO_PRO_1_5,
    HMO_PRICE_IDS.HMO_PRO_6_10,
    HMO_PRICE_IDS.HMO_PRO_11_15,
    HMO_PRICE_IDS.HMO_PRO_16_20,
  ].includes(priceId);
}

/**
 * Check if price ID is a one-time product
 */
export function isOneTimeProduct(priceId: string): boolean {
  return [
    PRICE_IDS.NOTICE_ONLY,
    PRICE_IDS.EVICTION_PACK,
    PRICE_IDS.MONEY_CLAIM,
    PRICE_IDS.STANDARD_AST,
    PRICE_IDS.PREMIUM_AST,
  ].includes(priceId);
}

// ============================================================================
// STRIPE ID VALIDATION GUARDRAILS
// ============================================================================

/**
 * Stripe ID prefix patterns
 */
const STRIPE_ID_PATTERNS = {
  PRICE: 'price_',
  PRODUCT: 'prod_',
  CUSTOMER: 'cus_',
  SUBSCRIPTION: 'sub_',
  SESSION: 'cs_',
  PAYMENT_INTENT: 'pi_',
} as const;

/**
 * Error thrown when invalid Stripe ID is used
 */
export class StripePriceIdError extends Error {
  code: string;
  invalidId: string;
  expectedPrefix: string;
  context?: string;

  constructor(
    invalidId: string,
    expectedPrefix: string,
    context?: string
  ) {
    const message = context
      ? `Invalid Stripe ID in ${context}: Expected ${expectedPrefix}xxx, got ${invalidId}. Check your STRIPE_PRICE_ID_* env variables.`
      : `Invalid Stripe ID: Expected ${expectedPrefix}xxx, got ${invalidId}`;
    super(message);
    this.name = 'StripePriceIdError';
    this.code = 'INVALID_STRIPE_ID';
    this.invalidId = invalidId;
    this.expectedPrefix = expectedPrefix;
    this.context = context;
  }
}

/**
 * Validate that an ID is a valid Stripe Price ID (starts with price_)
 *
 * @param priceId - The ID to validate
 * @param context - Optional context for error message (e.g., "NOTICE_ONLY product")
 * @throws StripePriceIdError if the ID is not a valid price ID
 */
export function assertValidPriceId(priceId: string, context?: string): void {
  if (!priceId) {
    throw new StripePriceIdError('(empty)', STRIPE_ID_PATTERNS.PRICE, context);
  }

  // Check if it's a product ID (common mistake)
  if (priceId.startsWith(STRIPE_ID_PATTERNS.PRODUCT)) {
    throw new StripePriceIdError(priceId, STRIPE_ID_PATTERNS.PRICE, context);
  }

  // Check if it starts with price_
  if (!priceId.startsWith(STRIPE_ID_PATTERNS.PRICE)) {
    throw new StripePriceIdError(priceId, STRIPE_ID_PATTERNS.PRICE, context);
  }
}

/**
 * Check if a string looks like a Stripe Price ID
 */
export function isValidPriceIdFormat(id: string): boolean {
  return typeof id === 'string' && id.startsWith(STRIPE_ID_PATTERNS.PRICE);
}

/**
 * Check if a string looks like a Stripe Product ID
 */
export function isProductId(id: string): boolean {
  return typeof id === 'string' && id.startsWith(STRIPE_ID_PATTERNS.PRODUCT);
}

/**
 * Validate all configured price IDs at startup (dev mode)
 * Logs warnings for any misconfigured price IDs
 */
export function validateAllPriceIds(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const priceIdChecks = [
    { key: 'NOTICE_ONLY', value: PRICE_IDS.NOTICE_ONLY },
    { key: 'EVICTION_PACK', value: PRICE_IDS.EVICTION_PACK },
    { key: 'MONEY_CLAIM', value: PRICE_IDS.MONEY_CLAIM },
    { key: 'STANDARD_AST', value: PRICE_IDS.STANDARD_AST },
    { key: 'PREMIUM_AST', value: PRICE_IDS.PREMIUM_AST },
  ];

  for (const { key, value } of priceIdChecks) {
    if (!value || value === 'undefined') {
      errors.push(`STRIPE_PRICE_ID_${key} is not set`);
    } else if (isProductId(value)) {
      errors.push(
        `STRIPE_PRICE_ID_${key} contains a Product ID (${value}), expected Price ID (price_xxx)`
      );
    } else if (!isValidPriceIdFormat(value)) {
      errors.push(
        `STRIPE_PRICE_ID_${key} has invalid format (${value}), expected Price ID (price_xxx)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default stripe;
