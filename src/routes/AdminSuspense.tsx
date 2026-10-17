import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/Feedback';

export function AdminSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Spinner label="Loading admin" />}>{children}</Suspense>;
}


