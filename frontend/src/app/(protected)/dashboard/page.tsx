'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Shield, Database, Activity, Home, Settings, UserPlus, Lock } from 'lucide-react';

interface DashboardStats {
  totalUsuarios: number;
  usuariosActivos: number;
  totalTenants: number;
  totalRoles: number;
}

export default function DashboardPage() {
  const { user, tenant } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    usuariosActivos: 0,
    totalTenants: 0,
    totalRoles: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 19) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  useEffect(() => {
    // Simular carga de estadísticas
    // TODO: Implementar llamadas reales a la API
    const loadStats = async () => {
      try {
        setTimeout(() => {
          setStats({
            totalUsuarios: 24,
            usuariosActivos: 18,
            totalTenants: 3,
            totalRoles: 12,
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading stats:', error);
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats.totalUsuarios,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Usuarios Activos',
      value: stats.usuariosActivos,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Tenants',
      value: stats.totalTenants,
      icon: Database,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Roles',
      value: stats.totalRoles,
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-palette-yellow rounded-lg flex items-center justify-center">
            <Home className="w-6 h-6 text-palette-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {getGreeting()}, {user?.nombre}! 👋
            </h1>
            <p className="text-text-secondary mt-1">
              {tenant ? `${tenant.nombre} - ` : ''}Panel de administración de AxiomaCloud
            </p>
          </div>
        </div>
        <div className="text-sm text-text-light">
          {new Date().toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <Card key={index} hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">
                      {stat.title}
                    </p>
                    <div className="text-2xl font-bold text-text-primary mt-1">
                      {isLoading ? (
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        stat.value
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                // Skeleton loading
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        Nuevo usuario registrado
                      </p>
                      <p className="text-xs text-text-secondary">
                        María González se ha registrado en el sistema
                      </p>
                    </div>
                    <span className="text-xs text-text-light">Hace 2 horas</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        Rol actualizado
                      </p>
                      <p className="text-xs text-text-secondary">
                        Permisos modificados para el rol "Editor"
                      </p>
                    </div>
                    <span className="text-xs text-text-light">Hace 5 horas</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        Nuevo tenant creado
                      </p>
                      <p className="text-xs text-text-secondary">
                        Tenant "Empresa Demo" configurado
                      </p>
                    </div>
                    <span className="text-xs text-text-light">Hace 1 día</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acceso Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a
                href="/users"
                className="flex items-center p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Users className="w-8 h-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="font-medium text-text-primary">Gestionar Usuarios</h3>
                  <span className="text-sm text-text-secondary">
                    Ver y administrar usuarios del sistema
                  </span>
                </div>
              </a>

              <a
                href="/roles"
                className="flex items-center p-4 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Shield className="w-8 h-8 text-purple-600 mr-4" />
                <div>
                  <h3 className="font-medium text-text-primary">Roles y Permisos</h3>
                  <span className="text-sm text-text-secondary">
                    Configurar roles y asignar permisos
                  </span>
                </div>
              </a>

              <a
                href="/tenants"
                className="flex items-center p-4 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
              >
                <Database className="w-8 h-8 text-amber-600 mr-4" />
                <div>
                  <h3 className="font-medium text-text-primary">Tenants</h3>
                  <span className="text-sm text-text-secondary">
                    Administrar organizaciones
                  </span>
                </div>
              </a>

              <a
                href="/settings"
                className="flex items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-8 h-8 text-gray-600 mr-4" />
                <div>
                  <h3 className="font-medium text-text-primary">Configuración</h3>
                  <span className="text-sm text-text-secondary">
                    Ajustes generales del sistema
                  </span>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
