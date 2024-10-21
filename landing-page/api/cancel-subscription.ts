import { NextApiRequest, NextApiResponse } from 'next';
import { init, tx } from '@instantdb/admin';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY must be set');
if (!process.env.NEXT_PUBLIC_INSTANT_APP_ID) throw new Error('NEXT_PUBLIC_INSTANT_APP_ID must be set');
if (!process.env.INSTANT_ADMIN_TOKEN) throw new Error('INSTANT_ADMIN_TOKEN must be set');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const db = init({ appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID, adminToken: process.env.INSTANT_ADMIN_TOKEN });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    // Verify the user's token
    const user = await db.auth.verifyToken(refresh_token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = user.id;

    // Fetch subscription data from InstantDB
    const data = await db.query({
      subscriptionData: { $: { where: { id: userId } } },
    });

    const subscriptionData = data.subscriptionData[0];
    if (!subscriptionData || !subscriptionData.stripeCustomerId) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Fetch Stripe subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: subscriptionData.stripeCustomerId,
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: 'No active subscriptions found' });
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.update(subscriptions.data[0].id, { cancel_at_period_end: true });

    // Update subscription status in InstantDB
    await db.transact([
      tx.subscriptionData[userId].update({
        subscriptionStatus: 'canceling',
        updatedAt: Date.now(),
      }),
    ]);

    res.status(200).json({ message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
