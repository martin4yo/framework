'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Mail, Shield, LogOut, CheckCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Image from 'next/image';
import axiomaLogo from '@/assets/axioma_logo_300x500.png';

export default function PendingAccessPage() {
  const { user, tenant, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user has a tenant, redirect to dashboard
    if (tenant) {
      router.push('/dashboard');
    }
  }, [tenant, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-palette-purple to-palette-dark">

      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-0">
          <div className="flex">
            {/* Sección Izquierda - Logo */}
            <div className="flex-1 p-8 bg-white flex items-center justify-center">
              <div className="text-center -mt-24">
                <div className="mx-auto h-80 w-80 relative -mb-16">
                  <Image
                    src={axiomaLogo}
                    alt="Axioma Logo"
                    fill
                    sizes="320px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Globe className="w-12 h-12 text-palette-purple" />
                  <h2 className="text-4xl font-bold text-palette-dark">
                    Core
                  </h2>
                </div>
              </div>
            </div>

            {/* Sección Derecha - Contenido */}
            <div className="flex-1 bg-white p-8">
              <div className="w-full max-w-md mx-auto">
                <div className="space-y-6">
                  {/* Title */}
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Acceso Pendiente
                    </h1>
                    <p className="text-sm text-gray-600">
                      Tu cuenta está siendo configurada
                    </p>
                  </div>

                  {/* User Info */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-palette-purple" />
                      <p className="font-semibold text-sm text-gray-900">{user?.email}</p>
                    </div>
                    <p className="text-xs text-gray-600 text-center">
                      Tu cuenta de usuario ha sido verificada exitosamente
                    </p>
                  </div>

                  {/* Status */}
                  <div className="space-y-3 text-left bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-palette-purple" />
                      ¿Qué sigue?
                    </h3>
                    <ol className="space-y-2 text-xs text-gray-600">
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3" />
                        </span>
                        <span>
                          <strong>Email verificado:</strong> Tu dirección de correo ha sido confirmada
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-palette-accent/20 text-palette-accent rounded-full flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                        <span>
                          <strong>Pendiente:</strong> Un administrador debe asignarte a una organización (tenant)
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </span>
                        <span>
                          <strong>Acceso completo:</strong> Podrás acceder al sistema una vez que seas asignado
                        </span>
                      </li>
                    </ol>
                  </div>

                  {/* Info Box */}
                  <div className="bg-palette-dark text-palette-yellow rounded-lg p-4">
                    <h3 className="font-semibold text-sm mb-2">¿Necesitas ayuda?</h3>
                    <p className="text-xs">
                      Si este proceso está tomando demasiado tiempo, contacta al administrador
                      del sistema o al responsable de tu organización.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 space-y-2">
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="w-full"
                    >
                      Verificar Estado
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full text-gray-600 hover:text-gray-900"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
