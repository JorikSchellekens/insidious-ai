import { loadStripe } from '@stripe/stripe-js';
import { getStripeConfig } from '@/constants/stripe';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(getStripeConfig().STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
