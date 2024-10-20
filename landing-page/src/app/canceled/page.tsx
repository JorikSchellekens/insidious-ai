import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IS_TEST_MODE } from '@/constants/stripe';

export default function CanceledPage() {
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      {IS_TEST_MODE && (
        <div className="bg-yellow-200 text-yellow-800 p-2 text-center text-sm">
          Test Mode Active
        </div>
      )}
      <CardHeader>
        <CardTitle>Subscription Canceled</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Your subscription process was canceled. If you have any questions, please contact support.</p>
        {IS_TEST_MODE && (
          <p className="text-sm text-gray-500 mt-2">
            This was a test cancellation. No actual charges were made or canceled.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
