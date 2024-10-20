'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStripe } from '@/utils/stripe';
import { PRICE_ID, IS_TEST_MODE } from '@/constants/stripe';

interface User {
  email: string;
  // Add other user properties as needed
}

interface SubscriptionContentProps {
  user: User;
}

export default function SubscriptionContent({ user }: SubscriptionContentProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    try {
      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({
        lineItems: [
          {
            price: PRICE_ID,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/canceled`,
        customerEmail: user.email,
      });

      if (error) {
        setError('An error occurred. Please disable your ad-blocker and try again.');
        console.error('Error:', error);
      }
    } catch (err) {
      setError('An error occurred. Please disable your ad-blocker and try again.');
      console.error('Error:', err);
    }
  };

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
        <p>1000 transforms per month</p>
        <Button onClick={handleSubscribe} className="w-full">
          {IS_TEST_MODE ? 'Subscribe Now (Test Mode)' : 'Subscribe Now'}
        </Button>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
        {IS_TEST_MODE && (
          <p className="text-sm text-gray-500 mt-2">
            This is a test subscription. No real charges will be made.
          </p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Note: If you&apos;re using an ad-blocker, you may need to disable it for this page to complete the subscription process.
        </p>
      </CardContent>
    </Card>
  );
}
