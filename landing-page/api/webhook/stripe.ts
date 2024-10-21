import { NextApiRequest, NextApiResponse } from 'next';
import { init, tx } from '@instantdb/admin';
import Stripe from 'stripe';

// Error if environment variables are not set
if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY must be set');
if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error('STRIPE_WEBHOOK_SECRET must be set');
if (!process.env.NEXT_PUBLIC_INSTANT_APP_ID) throw new Error('NEXT_PUBLIC_INSTANT_APP_ID must be set');
if (!process.env.INSTANT_ADMIN_TOKEN) throw new Error('INSTANT_ADMIN_TOKEN must be set');

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const isTestMode = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === 'true';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const db = init({ appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID, adminToken: process.env.INSTANT_ADMIN_TOKEN });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeletion(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;
  const cancelAt = subscription.cancel_at;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      throw new Error(`Customer ${customerId} has been deleted`);
    }

    const email = customer.email;
    if (!email) {
      throw new Error(`No email found for Stripe customer ID: ${customerId}`);
    }

    const user = await db.auth.getUser({ email: email });
    if (!user) {
      throw new Error(`No user found for email: ${email}`);
    }

    await db.transact([
      tx.subscriptionData[user.id].update({
        stripeCustomerId: customerId,
        subscriptionStatus: status,
        cancelAt: cancelAt ? new Date(cancelAt * 1000).toISOString() : null,
        updatedAt: Date.now(),
      }),
    ]);

    console.log(`Updated subscription status for user ${user.id}: ${status}`);
    if (cancelAt) {
      console.log(`Subscription will be canceled at: ${new Date(cancelAt * 1000).toISOString()}`);
    }
    if (isTestMode) {
      console.log('Test mode is active. No real charges were made.');
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error; // Re-throw to be caught by the main handler
  }
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const data = await db.query({
      subscriptionData: { $: { where: { stripeCustomerId: customerId } } },
    });

    const subscriptionData = data.subscriptionData[0];
    if (!subscriptionData) {
      throw new Error(`No subscription data found for Stripe customer ID: ${customerId}`);
    }

    await db.transact([
      tx.subscriptionData[subscriptionData.id].update({
        subscriptionStatus: 'canceled',
        updatedAt: Date.now(),
      }),
    ]);

    console.log(`Canceled subscription for user ${subscriptionData.id}`);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
    throw error; // Re-throw to be caught by the main handler
  }
}

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
