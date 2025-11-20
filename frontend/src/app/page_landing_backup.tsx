import { Building2, Lock, Users, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-palette-dark via-palette-purple to-palette-pink">
      <div className="card p-12 max-w-2xl mx-auto text-center space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-palette-dark mb-2">
            Axioma Core
          </h1>
          <p className="text-2xl text-palette-purple font-medium">
            Multi-tenant Authentication System
          </p>
        </div>

        <div className="h-px bg-border my-6"></div>

        <div className="space-y-4 text-text-secondary">
          <p className="text-lg">
            Sistema completo de autenticación y autorización multi-tenant con permisos granulares
          </p>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="card-hover p-6">
              <div className="flex justify-center mb-2">
                <Building2 className="w-8 h-8 text-palette-purple" />
              </div>
              <h3 className="font-semibold text-palette-dark mb-1">Multi-tenancy</h3>
              <p className="text-sm text-text-secondary">Gestión de múltiples organizaciones</p>
            </div>

            <div className="card-hover p-6">
              <div className="flex justify-center mb-2">
                <Lock className="w-8 h-8 text-palette-purple" />
              </div>
              <h3 className="font-semibold text-palette-dark mb-1">JWT Auth</h3>
              <p className="text-sm text-text-secondary">Access y refresh tokens</p>
            </div>

            <div className="card-hover p-6">
              <div className="flex justify-center mb-2">
                <Users className="w-8 h-8 text-palette-purple" />
              </div>
              <h3 className="font-semibold text-palette-dark mb-1">Usuarios</h3>
              <p className="text-sm text-text-secondary">Gestión completa de usuarios</p>
            </div>

            <div className="card-hover p-6">
              <div className="flex justify-center mb-2">
                <Shield className="w-8 h-8 text-palette-purple" />
              </div>
              <h3 className="font-semibold text-palette-dark mb-1">Permisos</h3>
              <p className="text-sm text-text-secondary">RBAC con CASL</p>
            </div>
          </div>
        </div>

        <div className="pt-6 space-y-3">
          <a
            href="/login"
            className="btn-primary w-full block text-center"
          >
            Iniciar Sesión
          </a>

          <a
            href="/register"
            className="btn-outline w-full block text-center"
          >
            Registrarse
          </a>
        </div>

        <div className="pt-4 text-sm text-text-light">
          <p>Backend NestJS + Frontend Next.js + PostgreSQL</p>
        </div>
      </div>
    </div>
  );
}
