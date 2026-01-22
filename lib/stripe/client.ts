import Stripe from 'stripe';

// Stripe is optional - app works without it, billing features just won't be available
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

export const isStripeConfigured = !!stripe;

// Price IDs for each tier (set these in your environment variables)
export const PRICE_IDS = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || '',
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  agency: process.env.STRIPE_AGENCY_PRICE_ID || '',
} as const;

// Tier from price ID lookup
export function getTierFromPriceId(priceId: string): 'starter' | 'pro' | 'agency' | null {
  if (priceId === PRICE_IDS.starter) return 'starter';
  if (priceId === PRICE_IDS.pro) return 'pro';
  if (priceId === PRICE_IDS.agency) return 'agency';
  return null;
}
