'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff, Globe, Mail, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import axiomaLogo from '@/assets/axioma_logo_300x500.png';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import axios from 'axios';

const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es muy larga'),
  confirmPassword: z
    .string()
    .min(8, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

      const response = await axios.post(`${backendUrl}/auth/register`, registerData);

      setUserEmail(data.email);
      setRegistrationSuccess(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear la cuenta';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
      }}
    >
      <Toaster position="top-right" />

      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-0">
          {registrationSuccess ? (
            // Success View
            <div className="p-12 text-center">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Registro Exitoso!
              </h2>
              <div className="space-y-4 text-gray-600 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <p>Te hemos enviado un email a:</p>
                </div>
                <p className="font-semibold text-blue-600 text-lg">{userEmail}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-900">
                    <strong>Próximos pasos:</strong>
                  </p>
                  <ol className="text-sm text-blue-800 mt-2 space-y-1 text-left list-decimal list-inside">
                    <li>Revisa tu bandeja de entrada</li>
                    <li>Haz clic en el enlace de verificación</li>
                    <li>Un administrador te asignará un tenant</li>
                    <li>¡Podrás acceder al sistema!</li>
                  </ol>
                </div>
                <p className="text-sm mt-6">
                  No recibiste el email?{' '}
                  <button
                    onClick={() => setRegistrationSuccess(false)}
                    className="text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    Intentar nuevamente
                  </button>
                </p>
              </div>
              <Button
                onClick={() => router.push('/auth/login')}
                className="mt-8"
              >
                Ir al Inicio de Sesión
              </Button>
            </div>
          ) : (
            // Registration Form
            <div className="flex">
              {/* Sección Izquierda - Logo y Texto */}
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

            {/* Sección Derecha - Formulario */}
            <div className="flex-1 bg-white p-8">
              <div className="w-full max-w-sm mx-auto px-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Registro de Usuario
                  </h3>
                  <p className="text-sm text-gray-600">
                    Completa los datos para registrarte
                  </p>
                </div>

                <div className="space-y-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Nombre"
                        placeholder="Juan"
                        error={errors.firstName?.message}
                        {...register('firstName')}
                      />
                      <Input
                        label="Apellido"
                        placeholder="Pérez"
                        error={errors.lastName?.message}
                        {...register('lastName')}
                      />
                    </div>

                    <Input
                      label="Email"
                      type="email"
                      placeholder="juan.perez@email.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />

                    <div className="relative">
                      <Input
                        label="Contraseña"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register('password')}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        label="Confirmar Contraseña"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      loading={isLoading}
                    >
                      Crear Cuenta
                    </Button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                      ¿Ya tienes cuenta?{' '}
                      <Link
                        href="/auth/login"
                        className="font-medium text-blue-600 hover:text-blue-700 underline"
                      >
                        Inicia sesión aquí
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
