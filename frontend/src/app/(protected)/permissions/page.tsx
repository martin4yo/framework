'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Key, Plus, Search, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/modals/ConfirmModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
}

export default function PermissionsPage() {
  const { token, tenant } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    resource: '',
    action: '',
    description: '',
  });

  useEffect(() => {
    if (token) {
      fetchPermissions();
    }
  }, [token]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = permissions.filter(
        (permission) =>
          permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
          permission.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPermissions(filtered);
    } else {
      setFilteredPermissions(permissions);
    }
  }, [searchTerm, permissions]);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: tenant?.id ? { tenantId: tenant.id } : {},
      });
      setPermissions(response.data);
      setFilteredPermissions(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar permisos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (permission?: Permission) => {
    if (permission) {
      setSelectedPermission(permission);
      setFormData({
        resource: permission.resource,
        action: permission.action,
        description: permission.description || '',
      });
    } else {
      setSelectedPermission(null);
      setFormData({
        resource: '',
        action: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPermission(null);
    setFormData({
      resource: '',
      action: '',
      description: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        tenantId: tenant?.id,
      };

      if (selectedPermission) {
        // Update existing permission
        await axios.patch(`${API_URL}/permissions/${selectedPermission.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Permiso actualizado exitosamente');
      } else {
        // Create new permission
        await axios.post(`${API_URL}/permissions`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Permiso creado exitosamente');
      }
      handleCloseModal();
      fetchPermissions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar permiso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (permission: Permission) => {
    setPermissionToDelete(permission);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!permissionToDelete) return;

    try {
      await axios.delete(`${API_URL}/permissions/${permissionToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Permiso eliminado exitosamente');
      fetchPermissions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar permiso');
    } finally {
      setIsConfirmModalOpen(false);
      setPermissionToDelete(null);
    }
  };

  // Group permissions by resource
  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Key className="w-8 h-8 text-blue-600" />
            Gestión de Permisos
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los permisos del sistema (recurso:acción)
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Permiso
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar permisos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Permissions List Grouped by Resource */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Cargando permisos...</p>
        </div>
      ) : Object.keys(groupedPermissions).length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron permisos</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([resource, perms]) => (
            <Card key={resource}>
              <CardHeader>
                <CardTitle className="capitalize flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  {resource} ({perms.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Acción
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Descripción
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Creado
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {perms.map((permission) => (
                        <tr
                          key={permission.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <code className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {permission.action}
                            </code>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {permission.description || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(permission.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenModal(permission)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(permission)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedPermission ? 'Editar Permiso' : 'Nuevo Permiso'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recurso
                </label>
                <Input
                  type="text"
                  value={formData.resource}
                  onChange={(e) =>
                    setFormData({ ...formData, resource: e.target.value })
                  }
                  required
                  placeholder="users"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nombre del recurso (ej: users, posts, tenants)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acción
                </label>
                <Input
                  type="text"
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  required
                  placeholder="create"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Acción permitida (ej: create, read, update, delete)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descripción del permiso..."
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Guardando...'
                    : selectedPermission
                    ? 'Actualizar'
                    : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Permiso"
        message={`¿Estás seguro que deseas eliminar el permiso "${permissionToDelete?.resource}:${permissionToDelete?.action}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}
