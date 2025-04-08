// src/app/(site)/klaviyo/error/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function KlaviyoErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  
  useEffect(() => {
    setError(searchParams.get('error') || 'Unknown error');
    setDescription(searchParams.get('description') || 'An error occurred while connecting to Klaviyo');
  }, [searchParams]);
  
  return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Klaviyo Connection Error</h1>
      <p className="text-red-500 mb-2">{error}</p>
      <p className="mb-6">{description}</p>
      <div className="flex justify-center gap-4">
        <Button onClick={() => router.push('/klaviyo')}>
          Try Again
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}