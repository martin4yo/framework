'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shield, Plus, Search, Edit, Trash2, Lock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/modals/ConfirmModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
  createdAt: string;
}

export default function RolesPage() {
  const { token, tenant } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[],
  });

  useEffect(() => {
    if (token) {
      fetchRoles();
      fetchPermissions();
    }
  }, [token]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = roles.filter((role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles(roles);
    }
  }, [searchTerm, roles]);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
        params: tenant?.id ? { tenantId: tenant.id } : {},
      });

      // Mapear rolePermissions a permissions
      const rolesWithPermissions = response.data.map((role: any) => ({
        ...role,
        permissions: role.rolePermissions?.map((rp: any) => rp.permission) || [],
      }));

      setRoles(rolesWithPermissions);
      setFilteredRoles(rolesWithPermissions);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar roles');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${API_URL}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: tenant?.id ? { tenantId: tenant.id } : {},
      });
      setPermissions(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar permisos');
    }
  };

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setSelectedRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissionIds: role.permissions.map((p) => p.id),
      });
    } else {
      setSelectedRole(null);
      setFormData({
        name: '',
        description: '',
        permissionIds: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
    setFormData({
      name: '',
      description: '',
      permissionIds: [],
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

      if (selectedRole) {
        // Update existing role
        await axios.patch(`${API_URL}/roles/${selectedRole.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Rol actualizado exitosamente');
      } else {
        // Create new role
        await axios.post(`${API_URL}/roles`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Rol creado exitosamente');
      }
      handleCloseModal();
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar rol');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (role: Role) => {
    if (role.isSystem) {
      toast.error('No se pueden eliminar roles del sistema');
      return;
    }
    setRoleToDelete(role);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    try {
      await axios.delete(`${API_URL}/roles/${roleToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Rol eliminado exitosamente');
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar rol');
    } finally {
      setIsConfirmModalOpen(false);
      setRoleToDelete(null);
    }
  };

  const togglePermission = (permissionId: string) => {
    if (formData.permissionIds.includes(permissionId)) {
      setFormData({
        ...formData,
        permissionIds: formData.permissionIds.filter((id) => id !== permissionId),
      });
    } else {
      setFormData({
        ...formData,
        permissionIds: [...formData.permissionIds, permissionId],
      });
    }
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
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
            <Shield className="w-8 h-8 text-blue-600" />
            Gestión de Roles
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los roles y sus permisos asociados
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Rol
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Cargando roles...</p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron roles</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                  </div>
                  {role.isSystem && (
                    <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-100 px-2 py-1 rounded-full text-xs">
                      <Lock className="w-3 h-3" />
                      Sistema
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {role.description && (
                  <p className="text-sm text-gray-600">{role.description}</p>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Permisos ({role.permissions.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <span
                        key={permission.id}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {permission.resource}:{permission.action}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        +{role.permissions.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(role)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(role)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={role.isSystem}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {selectedRole ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Administrador"
                  />
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
                    placeholder="Descripción del rol..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permisos
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {Object.keys(groupedPermissions).length === 0 ? (
                      <p className="text-sm text-gray-500">No hay permisos disponibles</p>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(groupedPermissions).map(([resource, perms]) => (
                          <div key={resource}>
                            <h4 className="font-medium text-gray-900 mb-2 capitalize">
                              {resource}
                            </h4>
                            <div className="space-y-1 pl-4">
                              {perms.map((permission) => (
                                <label
                                  key={permission.id}
                                  className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.permissionIds.includes(permission.id)}
                                    onChange={() => togglePermission(permission.id)}
                                    className="rounded border-gray-300"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {permission.action}
                                  </span>
                                  {permission.description && (
                                    <span className="text-xs text-gray-500">
                                      - {permission.description}
                                    </span>
                                  )}
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                      : selectedRole
                      ? 'Actualizar'
                      : 'Crear'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Rol"
        message={`¿Estás seguro que deseas eliminar el rol "${roleToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}
