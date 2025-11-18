'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Building2, Check, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface UserTenant {
  id: string;
  tenantId: string;
  isPrimary: boolean;
  tenant: Tenant;
}

interface AssignTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  token: string;
  onSuccess: () => void;
}

export function AssignTenantModal({
  isOpen,
  onClose,
  userId,
  userName,
  token,
  onSuccess,
}: AssignTenantModalProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [userTenants, setUserTenants] = useState<UserTenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTenants();
      fetchUserTenants();
    }
  }, [isOpen, userId]);

  const fetchTenants = async () => {
    try {
      const response = await axios.get(`${API_URL}/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenants(response.data.filter((t: Tenant) => t.isActive));
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Error al cargar tenants');
    }
  };

  const fetchUserTenants = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/users/${userId}/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserTenants(response.data);
    } catch (error) {
      console.error('Error fetching user tenants:', error);
      toast.error('Error al cargar asignaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTenant = async (tenantId: string, isPrimary: boolean = false) => {
    try {
      setIsSubmitting(true);
      await axios.post(
        `${API_URL}/users/assign-tenant`,
        { userId, tenantId, isPrimary },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Tenant asignado correctamente');
      await fetchUserTenants();
      onSuccess();
    } catch (error: any) {
      console.error('Error assigning tenant:', error);
      const message = error.response?.data?.message || 'Error al asignar tenant';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassignTenant = async (tenantId: string) => {
    try {
      setIsSubmitting(true);
      await axios.post(
        `${API_URL}/users/unassign-tenant`,
        { userId, tenantId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Tenant desasignado correctamente');
      await fetchUserTenants();
      onSuccess();
    } catch (error: any) {
      console.error('Error unassigning tenant:', error);
      const message = error.response?.data?.message || 'Error al desasignar tenant';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPrimaryTenant = async (tenantId: string) => {
    try {
      setIsSubmitting(true);
      await axios.patch(
        `${API_URL}/users/${userId}/primary-tenant/${tenantId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Tenant principal actualizado');
      await fetchUserTenants();
      onSuccess();
    } catch (error: any) {
      console.error('Error setting primary tenant:', error);
      const message = error.response?.data?.message || 'Error al establecer tenant principal';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAssigned = (tenantId: string) => {
    return userTenants.some((ut) => ut.tenantId === tenantId);
  };

  const isPrimary = (tenantId: string) => {
    return userTenants.find((ut) => ut.tenantId === tenantId)?.isPrimary || false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-text-primary">
              Asignar Tenants
            </h3>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Usuario:</strong> {userName}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Puedes asignar al usuario a múltiples organizaciones. Una de ellas debe ser la principal.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-palette-purple"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tenants.map((tenant) => {
                  const assigned = isAssigned(tenant.id);
                  const primary = isPrimary(tenant.id);

                  return (
                    <div
                      key={tenant.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        assigned
                          ? 'bg-purple-50 border-purple-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2
                          className={`w-5 h-5 ${
                            assigned ? 'text-palette-purple' : 'text-gray-400'
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm">{tenant.name}</p>
                          <p className="text-xs text-gray-500">{tenant.slug}</p>
                        </div>
                        {primary && (
                          <span className="bg-palette-accent text-white text-xs px-2 py-1 rounded">
                            Principal
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {assigned ? (
                          <>
                            {!primary && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetPrimaryTenant(tenant.id)}
                                disabled={isSubmitting}
                              >
                                Marcar como principal
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUnassignTenant(tenant.id)}
                              disabled={isSubmitting}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAssignTenant(tenant.id, userTenants.length === 0)}
                            disabled={isSubmitting}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Asignar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {tenants.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No hay tenants disponibles
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-6 border-t border-border">
            <Button variant="ghost" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
