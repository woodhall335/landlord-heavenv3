/**
 * Stripe Webhook Alias
 *
 * Alias endpoint: POST /api/stripe/webhook
 * Canonical endpoint: POST /api/webhooks/stripe
 */

export {
  POST,
  dynamic,
  revalidate,
} from '@/app/api/webhooks/stripe/route';
