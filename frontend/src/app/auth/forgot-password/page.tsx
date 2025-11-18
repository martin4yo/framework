'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import axiomaLogo from '@/assets/axioma_logo_300x500.png';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/auth/forgot-password`, data);
      setEmailSent(true);
    } catch (error: any) {
      // Even on error, show success message to prevent email enumeration
      setEmailSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
      }}
    >
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 mb-4 relative">
                <Image
                  src={axiomaLogo}
                  alt="AxiomaCloud Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Recuperar Contraseña
              </h1>
              <p className="text-gray-600 text-sm mt-2 text-center">
                Ingresa tu email y te enviaremos un enlace para resetear tu contraseña
              </p>
            </div>

            {!emailSent ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      {...register('email')}
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio de sesión
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    ¡Email Enviado!
                  </h2>
                  <p className="text-gray-600">
                    Si el email existe en nuestro sistema, recibirás un enlace para resetear tu contraseña.
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    Revisa tu bandeja de entrada y sigue las instrucciones.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="w-full mt-6"
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
