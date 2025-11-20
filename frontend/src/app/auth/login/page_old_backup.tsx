'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff, Shield, Globe } from 'lucide-react';
import Image from 'next/image';
import axiomaLogo from '@/assets/axioma_logo_300x500.png';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import AlertModal from '@/components/modals/AlertModal';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const translations = {
  es: {
    title: 'Iniciar Sesión',
    email: 'Email',
    emailPlaceholder: 'tu@email.com',
    password: 'Contraseña',
    forgotPassword: 'Olvidé mi contraseña',
    loginButton: 'Iniciar Sesión',
    orContinueWith: 'o continuar con',
    noAccount: '¿No tienes cuenta?',
    registerHere: 'Regístrate aquí',
    welcome: '¡Bienvenido!',
    loading: 'Cargando...',
  },
  pt: {
    title: 'Iniciar Sessão',
    email: 'Email',
    emailPlaceholder: 'seu@email.com',
    password: 'Senha',
    forgotPassword: 'Esqueci minha senha',
    loginButton: 'Iniciar Sessão',
    orContinueWith: 'ou continuar com',
    noAccount: 'Não tem conta?',
    registerHere: 'Cadastre-se aqui',
    welcome: 'Bem-vindo!',
    loading: 'Carregando...',
  },
  en: {
    title: 'Sign In',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    password: 'Password',
    forgotPassword: 'Forgot password',
    loginButton: 'Sign In',
    orContinueWith: 'or continue with',
    noAccount: "Don't have an account?",
    registerHere: 'Register here',
    welcome: 'Welcome!',
    loading: 'Loading...',
  },
};

type Language = 'es' | 'pt' | 'en';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState<Language>('es');
  const [mounted, setMounted] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const router = useRouter();
  const { login, isLoading, tenant } = useAuth();

  const t = translations[language];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    setMounted(true);
    // Iniciar la animación de entrada después de un pequeño delay
    const timer = setTimeout(() => {
      setIsEntering(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data.email, data.password);
      toast.success(t.welcome);

      setShowSplash(true);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);

      setTimeout(() => {
        // Check if user has tenant - redirect accordingly
        if (result?.tenant) {
          router.push('/dashboard');
        } else {
          router.push('/pending-access');
        }
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error al iniciar sesión';

      if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        toast.error(errorMessage, { duration: 6000 });
        toast('Puedes reenviar el email de verificación desde tu email', {
          icon: '📧',
          duration: 8000,
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  if (!mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-8 relative"
        style={{
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative"
      style={{
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
      }}
    >
      <Toaster position="top-right" />

      {/* Language Selector */}
      {mounted && (
        <div className="absolute top-4 right-4 flex gap-3 z-10">
          {language === 'es' && (
            <>
              <button
                className="text-4xl hover:scale-110 transition-transform filter hover:brightness-110"
                onClick={() => setLanguage('pt')}
                title="Português"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                🇧🇷
              </button>
              <button
                className="text-4xl hover:scale-110 transition-transform filter hover:brightness-110"
                onClick={() => setLanguage('en')}
                title="English"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                🇺🇸
              </button>
            </>
          )}

          {language === 'pt' && (
            <>
              <button
                className="text-4xl hover:scale-110 transition-transform filter hover:brightness-110"
                onClick={() => setLanguage('es')}
                title="Español"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                🇪🇸
              </button>
              <button
                className="text-4xl hover:scale-110 transition-transform filter hover:brightness-110"
                onClick={() => setLanguage('en')}
                title="English"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                🇺🇸
              </button>
            </>
          )}

          {language === 'en' && (
            <>
              <button
                className="text-4xl hover:scale-110 transition-transform filter hover:brightness-110"
                onClick={() => setLanguage('es')}
                title="Español"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                🇪🇸
              </button>
              <button
                className="text-4xl hover:scale-110 transition-transform filter hover:brightness-110"
                onClick={() => setLanguage('pt')}
                title="Português"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                🇧🇷
              </button>
            </>
          )}
        </div>
      )}

      {showSplash && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
            animation: 'fadeIn 0.5s ease-in-out',
          }}
        >
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="relative w-96 h-96 animate-pulse">
              <Image
                src={axiomaLogo}
                alt="Axioma Logo"
                fill
                sizes="384px"
                className="object-contain"
                priority
              />
            </div>

            <div className="w-96">
              <div className="h-2 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white text-center mt-4 text-lg font-medium">
                {t.loading}
              </p>
            </div>
          </div>
        </div>
      )}

      <Card
        className="w-full max-w-4xl mx-auto"
        style={{
          transform: isEntering ? 'translateY(0)' : 'translateY(-100vh)',
          opacity: isEntering ? 1 : 0,
          transition: 'all 1.5s ease-in-out',
        }}
      >
        <CardContent className="p-0">
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
                  <h3 className="text-xl font-semibold text-gray-800">
                    {t.title}
                  </h3>
                </div>

                <div className="space-y-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                      label={t.email}
                      type="email"
                      placeholder={t.emailPlaceholder}
                      error={errors.email?.message}
                      {...register('email')}
                    />

                    <div className="relative">
                      <Input
                        label={t.password}
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

                    <div className="flex justify-end">
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        {t.forgotPassword}
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      loading={isLoading}
                    >
                      {t.loginButton}
                    </Button>
                  </form>

                  <div className="my-6 relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-600">{t.orContinueWith}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
                        window.location.href = `${backendUrl}/auth/google`;
                      }}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // Apple OAuth - implementar después
                        setIsAlertModalOpen(true);
                      }}
                    >
                      <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      Apple
                    </Button>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                      {t.noAccount}{' '}
                      <Link
                        href="/auth/register"
                        className="font-medium text-blue-600 hover:text-blue-700 underline"
                      >
                        {t.registerHere}
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Modal */}
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title="Próximamente"
        message="Apple Sign In estará disponible próximamente."
        variant="info"
      />
    </div>
  );
}
