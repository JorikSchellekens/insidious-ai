'use client';

import React from 'react';
import { init } from '@instantdb/react';
import Login from './Login';
import SubscriptionContent from './SubscriptionContent';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import BackgroundCanvas from '@/components/BackgroundCanvas';

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
if (!APP_ID) {
  throw new Error('NEXT_PUBLIC_INSTANT_APP_ID must be set in environment variables');
}
const db = init({ appId: APP_ID });

export default function SubscriptionPage() {
  const { isLoading, user, error } = db.useAuth();

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      <BackgroundCanvas />
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        {isLoading ? (
          <Card className="w-full max-w-md mx-auto mt-8">
            <CardContent className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="w-full max-w-md mx-auto mt-8">
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error.message}</p>
            </CardContent>
          </Card>
        ) : !user ? (
          <Login />
        ) : (
          <SubscriptionContent user={user} />
        )}
      </div>
    </div>
  );
}
