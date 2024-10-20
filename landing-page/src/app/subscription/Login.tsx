'use client';

import React, { useState } from 'react';
import { init } from '@instantdb/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const APP_ID = 'c0f5375a-23e1-45ca-ae1c-18a334d4e18a'
const db = init({ appId: APP_ID });

export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentEmail, setSentEmail] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await db.auth.sendMagicCode({ email });
      setSentEmail(true);
    } catch (error) {
      console.error('Error sending magic code:', error);
      setError('Error sending magic code. Please try again.');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      console.log("Verifying code:", code, "for email:", email);
      await db.auth.signInWithMagicCode({ email, code });
      console.log("Code verified successfully");
    } catch (error: any) {
      console.error('Error verifying code:', error);
      if (error.body?.type === 'record-not-found') {
        setError('Invalid or expired code. Please request a new code.');
      } else {
        setError('Error verifying code. Please try again.');
      }
    }
  };

  const handleResendCode = async () => {
    setError('');
    try {
      await db.auth.sendMagicCode({ email });
      setCode(''); // Clear the previous code
      setError('New code sent. Please check your email.');
    } catch (error) {
      console.error('Error resending magic code:', error);
      setError('Error resending code. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!sentEmail ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <Button type="submit" className="w-full">Send Code</Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter the code"
                required
              />
            </div>
            <Button type="submit" className="w-full">Verify Code</Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleResendCode}>
              Resend Code
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
