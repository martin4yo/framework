'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, tenant } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Evitar múltiples redirecciones
    if (!isLoading && !hasRedirected.current) {
      hasRedirected.current = true;

      if (isAuthenticated) {
        // Usuario autenticado - verificar si tiene tenant
        if (tenant) {
          router.replace('/dashboard');
        } else {
          router.replace('/pending-access');
        }
      } else {
        // Usuario no autenticado - redirigir a login inmediatamente
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, tenant, router]);

  // Solo mostrar LoadingScreen si está verificando autenticación inicial (isLoading)
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Mientras redirige, no mostrar nada (evita flash de contenido)
  return null;
}
