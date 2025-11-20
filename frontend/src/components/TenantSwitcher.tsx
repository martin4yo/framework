'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Check, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  isPrimary: boolean;
  isActive: boolean;
}

interface TenantSwitcherProps {
  className?: string;
}

export function TenantSwitcher({ className = '' }: TenantSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, tenant, token, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.email && token) {
      fetchUserTenants();
    }
  }, [user?.email, token]);

  const fetchUserTenants = async () => {
    if (!user?.email || !token) return;

    try {
      const response = await axios.post(
        `${API_URL}/auth/user-tenants`,
        { email: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableTenants(response.data || []);
    } catch (error) {
      console.error('Error fetching user tenants:', error);
    }
  };

  const handleTenantSwitch = async (tenantId: string) => {
    if (!user?.email) return;

    setLoading(true);
    try {
      // Get user password from a prompt (not ideal, but simple for now)
      // In production, you might want to use refresh tokens or a different approach
      const password = prompt('Por favor ingresa tu contraseña para cambiar de organización:');

      if (!password) {
        setLoading(false);
        return;
      }

      // Login with the selected tenant
      await login(user.email, password, tenantId);

      toast.success('Organización cambiada exitosamente');
      setIsOpen(false);

      // Refresh the page to load data for the new tenant
      router.refresh();
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error switching tenant:', error);
      toast.error(error.message || 'Error al cambiar de organización');
    } finally {
      setLoading(false);
    }
  };

  // Don't show if user has only one tenant
  if (availableTenants.length <= 1) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        disabled={loading}
      >
        <Building2 className="w-4 h-4 text-palette-purple" />
        <span className="text-sm font-medium text-gray-700">
          {tenant?.nombre || 'Seleccionar organización'}
        </span>
        <RefreshCw className={`w-3 h-3 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                Cambiar Organización
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Selecciona una organización para cambiar
              </p>
            </div>

            <div className="p-2">
              {availableTenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTenantSwitch(t.id)}
                  disabled={loading || t.id === tenant?.id}
                  className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    t.id === tenant?.id ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      t.id === tenant?.id ? 'bg-palette-purple/20' : 'bg-gray-100'
                    }`}>
                      <Building2 className={`w-5 h-5 ${
                        t.id === tenant?.id ? 'text-palette-purple' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {t.name}
                        {t.isPrimary && (
                          <span className="px-2 py-0.5 bg-palette-yellow text-palette-dark text-xs rounded-full">
                            Principal
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{t.slug}</div>
                    </div>
                  </div>
                  {t.id === tenant?.id && (
                    <Check className="w-4 h-4 text-palette-purple" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
