import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStripeConfig } from '@/constants/stripe';

export default function SuccessPage() {
  const { IS_TEST_MODE } = getStripeConfig();
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      {IS_TEST_MODE && (
        <div className="bg-yellow-200 text-yellow-800 p-2 text-center text-sm">
          Test Mode Active
        </div>
      )}
      <CardHeader>
        <CardTitle>Subscription Successful!</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Thank you for subscribing. You now have access to 1000 transforms per month.</p>
        {IS_TEST_MODE && (
          <p className="text-sm text-gray-500 mt-2">
            This was a test subscription. No actual charges were made.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
