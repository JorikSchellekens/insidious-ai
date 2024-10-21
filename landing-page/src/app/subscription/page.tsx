'use client';

import React from 'react';
import { init } from '@instantdb/react';
import Login from './Login';
import SubscriptionContent from './SubscriptionContent';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
if (!APP_ID) {
  throw new Error('NEXT_PUBLIC_INSTANT_APP_ID must be set in environment variables');
}
const db = init({ appId: APP_ID });

export default function SubscriptionPage() {
  const { isLoading, user, error } = db.useAuth();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return <Login />;
  }

  console.log("User:", user);
  return <SubscriptionContent user={user} />;
}
