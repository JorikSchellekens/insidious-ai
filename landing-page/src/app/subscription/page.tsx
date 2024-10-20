'use client';

import React from 'react';
import { init } from '@instantdb/react';
import Login from './Login';
import SubscriptionContent from './SubscriptionContent';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const APP_ID = 'c0f5375a-23e1-45ca-ae1c-18a334d4e18a';
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