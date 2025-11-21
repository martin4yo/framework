'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Package, Plus, X, Settings as SettingsIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

interface Application {
  id: string;
  name: string;
  slug: string;
  description?: string;
  url: string;
  icon?: string;
  lucideIcon?: string;
  color?: string;
  order: number;
  isMicrofrontend: boolean;
}

interface TenantApplication extends Application {
  isEnabled?: boolean;
  settings?: any;
}

export default function TenantApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<any>(null);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [assignedApplications, setAssignedApplications] = useState<TenantApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (token && tenantId) {
      fetchData();
    }
  }, [token, tenantId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tenantRes, allAppsRes, assignedAppsRes] = await Promise.all([
        axios.get(`${API_URL}/tenants/${tenantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/applications/tenant/${tenantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTenant(tenantRes.data);
      setAllApplications(allAppsRes.data);
      setAssignedApplications(assignedAppsRes.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignApplication = async (applicationId: string) => {
    try {
      await axios.post(
        `${API_URL}/applications/assign-tenant`,
        {
          applicationId,
          tenantId,
          isEnabled: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Aplicación asignada correctamente');
      fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al asignar aplicación');
    }
  };

  const handleUnassignApplication = async (applicationId: string) => {
    try {
      await axios.delete(`${API_URL}/applications/${applicationId}/tenants/${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Aplicación removida correctamente');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al remover aplicación');
    }
  };

  const handleToggleEnabled = async (applicationId: string, currentStatus: boolean) => {
    try {
      await axios.post(
        `${API_URL}/applications/assign-tenant`,
        {
          applicationId,
          tenantId,
          isEnabled: !currentStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(
        !currentStatus ? 'Aplicación habilitada' : 'Aplicación deshabilitada'
      );
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar aplicación');
    }
  };

  const unassignedApplications = allApplications.filter(
    (app) => !assignedApplications.find((assigned) => assigned.id === app.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/tenants')}>
          ← Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Aplicaciones - {tenant?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las aplicaciones disponibles para este tenant
          </p>
        </div>
      </div>

      {/* Aplicaciones Asignadas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Aplicaciones Asignadas</CardTitle>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Asignar Aplicación
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assignedApplications.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay aplicaciones asignadas
              </h3>
              <p className="text-gray-600 mb-4">
                Asigna aplicaciones para que estén disponibles en este tenant
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Asignar Primera Aplicación
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedApplications.map((app) => {
                const LucideIcon = app.lucideIcon ? (LucideIcons as any)[app.lucideIcon] : null;

                return (
                  <Card key={app.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {app.lucideIcon && LucideIcon ? (
                            <div
                              className="w-10 h-10 rounded flex items-center justify-center"
                              style={{ backgroundColor: app.color || '#3B82F6' }}
                            >
                              <LucideIcon className="h-6 w-6 text-white" />
                            </div>
                          ) : app.icon ? (
                            <img src={app.icon} alt={app.name} className="w-10 h-10 rounded" />
                          ) : (
                            <div
                              className="w-10 h-10 rounded flex items-center justify-center"
                              style={{ backgroundColor: app.color || '#3B82F6' }}
                            >
                              <Package className="h-6 w-6 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{app.name}</h3>
                            <p className="text-sm text-gray-500">{app.slug}</p>
                          </div>
                        </div>
                      <button
                        onClick={() => handleUnassignApplication(app.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Remover aplicación"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {app.description && (
                      <p className="text-sm text-gray-600 mb-4">{app.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Estado:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={app.isEnabled !== false}
                          onChange={() =>
                            handleToggleEnabled(app.id, app.isEnabled !== false)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {app.isEnabled !== false ? 'Habilitada' : 'Deshabilitada'}
                        </span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para asignar aplicaciones */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Asignar Aplicación
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {unassignedApplications.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No hay aplicaciones disponibles para asignar
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unassignedApplications.map((app) => {
                    const LucideIcon = app.lucideIcon ? (LucideIcons as any)[app.lucideIcon] : null;

                    return (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {app.lucideIcon && LucideIcon ? (
                            <div
                              className="w-10 h-10 rounded flex items-center justify-center"
                              style={{ backgroundColor: app.color || '#3B82F6' }}
                            >
                              <LucideIcon className="h-6 w-6 text-white" />
                            </div>
                          ) : app.icon ? (
                            <img src={app.icon} alt={app.name} className="w-10 h-10 rounded" />
                          ) : (
                            <div
                              className="w-10 h-10 rounded flex items-center justify-center"
                              style={{ backgroundColor: app.color || '#3B82F6' }}
                            >
                              <Package className="h-6 w-6 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">{app.name}</h3>
                            <p className="text-sm text-gray-500">{app.description}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAssignApplication(app.id)}
                        >
                          Asignar
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
