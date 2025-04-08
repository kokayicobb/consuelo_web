// src/app/(site)/klaviyo/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KlaviyoSuccessPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Show success message and redirect back to dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  }, [router]);
  
  return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Klaviyo Connected Successfully!</h1>
      <p className="mb-4">Your Klaviyo account has been connected to Consuelo.</p>
      <p>Redirecting to dashboard...</p>
    </div>
  );
}