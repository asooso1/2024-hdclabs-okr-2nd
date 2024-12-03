'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCheck() {
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    console.log('Checking userId:', userId);
    
    if (!userId) {
      console.log('No userId found, redirecting to login');
      router.push('/');
    }
  }, [router]);

  return null;
} 