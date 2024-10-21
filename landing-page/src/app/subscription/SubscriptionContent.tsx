'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStripe } from '@/utils/stripe';
import { getStripeConfig } from '@/constants/stripe';
import { init } from '@instantdb/react';

// Load APP_ID from environment variables
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;

if (!APP_ID) {
  throw new Error('NEXT_PUBLIC_INSTANT_APP_ID must be set in environment variables');
}

const db = init({ appId: APP_ID });

interface User {
  id: string;
  email: string;
  refresh_token: string;
}

interface SubscriptionContentProps {
  user: User;
}

export default function SubscriptionContent({ user }: SubscriptionContentProps) {
  const [error, setError] = useState<string | null>(null);
  const { PRICE_ID, IS_TEST_MODE } = getStripeConfig();
  const { isLoading, data } = db.useQuery({
    subscriptionData: { $: { where: { id: user.id } } },
  });

  const handleSubscribe = async () => {
    try {
      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: PRICE_ID, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/canceled`,
        customerEmail: user.email,
      });

      if (error) {
        setError('An error occurred. Please try again.');
        console.error('Error:', error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error:', err);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: user.refresh_token }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Failed to cancel subscription. Please try again.');
    }
  };

  if (isLoading) {
    return <div>Loading subscription status...</div>;
  }

  const subscriptionData = data?.subscriptionData[0];
  const isSubscribed = subscriptionData?.subscriptionStatus === 'active';
  const isCanceling = subscriptionData?.subscriptionStatus === 'active' && subscriptionData?.cancelAt;

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      {IS_TEST_MODE && (
        <div className="bg-yellow-200 text-yellow-800 p-2 text-center text-sm">
          Test Mode Active
        </div>
      )}
      <CardHeader>
        <CardTitle>Welcome, {user.email}!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSubscribed ? (
          <>
            <p>You are currently subscribed. Enjoy 1000 transforms per month!</p>
            {isCanceling ? (
              <p className="text-yellow-500">
                Your subscription will be canceled on {new Date(subscriptionData.cancelAt).toLocaleDateString()}.
                You will continue to have access until then.
              </p>
            ) : (
              <Button onClick={handleCancelSubscription} className="w-full" variant="destructive">
                Cancel Subscription
              </Button>
            )}
          </>
        ) : (
          <>
            <p>Subscribe now to get 1000 transforms per month!</p>
            <Button onClick={handleSubscribe} className="w-full">
              {IS_TEST_MODE ? 'Subscribe Now (Test Mode)' : 'Subscribe Now'}
            </Button>
          </>
        )}
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
        {IS_TEST_MODE && (
          <p className="text-sm text-gray-500 mt-2">
            This is a test subscription. No real charges will be made.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
