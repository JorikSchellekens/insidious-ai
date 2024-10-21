import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import BackgroundCanvas from '@/components/BackgroundCanvas';

export default function SuccessPage() {
  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      <BackgroundCanvas />
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-5xl font-bold mb-6 text-emerald-300">Subscription Successful!</h1>
        <p className="text-xl mb-8 max-w-2xl text-center">
          Thank you for subscribing to Insidious.ai. You now have access to all premium features.
        </p>
        <p className="text-lg mb-8 max-w-2xl text-center">
          To start using Insidious.ai, please open your browser extension. If you haven&apos;t installed it yet, you can do so by clicking the button below.
        </p>
        <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-bold py-3 px-6 rounded-full text-lg transition-colors duration-300">
          <Link href="https://chromewebstore.google.com/detail/insidious/ggagkncjchhmgfoohllfgoohjalmngcf?authuser=0&hl=en-GB">
            Install Insidious Extension
          </Link>
        </Button>
      </div>
    </div>
  );
}
