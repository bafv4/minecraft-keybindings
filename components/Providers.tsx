'use client';

import { type ReactNode } from 'react';
import { LoginModalProvider } from '@/contexts/LoginModalContext';
import { LoginModal } from './LoginModal';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LoginModalProvider>
      {children}
      <LoginModal />
    </LoginModalProvider>
  );
}
