import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { init, tx } from '@instantdb/admin';

// Error if STRIPE_SECRET_KEY is not set
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY must be set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const isTestMode = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === 'true';

// Error if INSTANT_APP_ID or INSTANT_ADMIN_TOKEN is not set
if (!process.env.INSTANT_APP_ID || !process.env.INSTANT_ADMIN_TOKEN) {
  throw new Error('INSTANT_APP_ID and INSTANT_ADMIN_TOKEN must be set');
}

const db = init({ appId: process.env.INSTANT_APP_ID, adminToken: process.env.INSTANT_ADMIN_TOKEN });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const buf = await getRawBody(req);
    const sig = req.headers['stripe-signature']!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;

  try {
    // Fetch customer email from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    // If it is a deleted customer, error
    if (customer.deleted) {
      throw new Error(`Stripe customer ${customerId} is deleted`);
    }

    const email = customer.email;

    if (!email) {
      console.error(`No email found for Stripe customer ID: ${customerId}`);
      return;
    }

    // Retrieve user from InstantDB using the correct method
    const user = await db.auth.getUser({ email: email });

    if (user) {
      const userId = user.id;
      
      // Update or create subscription data
      await db.transact([
        tx.subscriptionData[userId].update({
          stripeCustomerId: customerId,
          subscriptionStatus: status,
          updatedAt: Date.now(),
        }),
      ]);

      console.log(`Updated subscription status for user ${userId}: ${status}`);
      if (isTestMode) {
        console.log('Test mode is active. No real charges were made.');
      }
    } else {
      console.error(`No user found for email: ${email}`);
    }
  } catch (error) {
    console.error('Error updating user subscription status:', error);
  }
}

// Helper function to get raw body
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// ... rest of the file remains the same
