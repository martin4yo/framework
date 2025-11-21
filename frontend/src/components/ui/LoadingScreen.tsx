'use client';

import Image from 'next/image';
import axiomaLogo from '@/assets/axioma_logo_300x500.png';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Cargando...' }: LoadingScreenProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, #FCE5B7 0%, #FCE5B7 25%, #F1ABB5 50%, #8E6AAA 75%, #352151 100%)`,
      }}
    >
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Logo de Axioma con animación */}
        <div className="relative w-96 h-96">
          <div className="absolute inset-0 animate-pulse">
            <Image
              src={axiomaLogo}
              alt="Axioma Logo"
              fill
              sizes="384px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Mensaje de Carga */}
        {message && (
          <div className="w-96">
            <p className="text-white text-center text-lg font-medium animate-pulse">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
