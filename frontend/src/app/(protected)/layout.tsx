'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, tenant, user } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setIsRedirecting(true);
      router.replace('/auth/login');
    } else if (!isLoading && isAuthenticated && !tenant && pathname !== '/pending-access') {
      // Redirect to pending access page if user has no tenant
      setIsRedirecting(true);
      router.replace('/pending-access');
    } else {
      setIsRedirecting(false);
    }
  }, [isAuthenticated, isLoading, tenant, router, pathname]);

  // Show loading during hydration, auth check, or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // Don't show sidebar if user has no tenant (pending access)
  if (!tenant) {
    return (
      <>
        <Toaster position="top-right" />
        {children}
      </>
    );
  }

  return (
    <SidebarProvider>
      <Toaster position="top-right" />
      <Sidebar>{children}</Sidebar>
    </SidebarProvider>
  );
}
