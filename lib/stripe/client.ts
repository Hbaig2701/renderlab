import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
});

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
