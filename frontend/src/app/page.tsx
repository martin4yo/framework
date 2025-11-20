'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, tenant } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Usuario autenticado - verificar si tiene tenant
        if (tenant) {
          router.replace('/dashboard');
        } else {
          router.replace('/pending-access');
        }
      } else {
        // Usuario no autenticado - redirigir a login
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, tenant, router]);

  // Mostrar spinner mientras carga o redirige
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palette-purple mx-auto"></div>
        <p className="text-gray-600 mt-4">Cargando...</p>
      </div>
    </div>
  );
}
