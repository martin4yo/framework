'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import axiomaLogo from '@/assets/axioma_logo_300x500.png';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setError('No se proporcionó un token de reseteo');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        password: data.password,
      });
      setResetSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        'Error al resetear la contraseña. El token puede ser inválido o haber expirado.'
      );
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
                Resetear Contraseña
              </h1>
              <p className="text-gray-600 text-sm mt-2 text-center">
                Ingresa tu nueva contraseña
              </p>
            </div>

            {!resetSuccess && !error ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      {...register('password')}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      {...register('confirmPassword')}
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !token}
                >
                  {isLoading ? 'Reseteando...' : 'Resetear Contraseña'}
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Volver al inicio de sesión
                  </Link>
                </div>
              </form>
            ) : resetSuccess ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    ¡Contraseña Actualizada!
                  </h2>
                  <p className="text-gray-600">
                    Tu contraseña ha sido actualizada exitosamente.
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    Redirigiendo al inicio de sesión...
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <XCircle className="w-16 h-16 text-red-600 mx-auto" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Error
                  </h2>
                  <p className="text-gray-600">{error}</p>
                  <Button
                    onClick={() => router.push('/auth/forgot-password')}
                    className="w-full mt-6"
                  >
                    Solicitar Nuevo Enlace
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
