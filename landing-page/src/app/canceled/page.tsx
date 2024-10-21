import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import BackgroundCanvas from '@/components/BackgroundCanvas';

export default function CanceledPage() {
  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      <BackgroundCanvas />
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-5xl font-bold mb-6 text-yellow-300">Subscription Canceled</h1>
        <p className="text-xl mb-8 max-w-2xl text-center">
          Your subscription process was canceled. No charges were made to your account.
        </p>
        <p className="text-lg mb-8 max-w-2xl text-center">
          If you changed your mind or encountered any issues, you can try subscribing again or contact our support team for assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-bold py-3 px-6 rounded-full text-lg transition-colors duration-300">
            <Link href="/subscription">
              Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" className="text-white border-white hover:bg-gray-800">
            <Link href="https://t.me/insidiousai">
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
