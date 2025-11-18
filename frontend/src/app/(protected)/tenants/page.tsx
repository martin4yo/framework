'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/modals/ConfirmModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export default function TenantsPage() {
  const { token } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    isActive: true,
  });

  useEffect(() => {
    if (token) {
      fetchTenants();
    }
  }, [token]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = tenants.filter(
        (tenant) =>
          tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tenant.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTenants(filtered);
    } else {
      setFilteredTenants(tenants);
    }
  }, [searchTerm, tenants]);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenants(response.data);
      setFilteredTenants(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (tenant?: Tenant) => {
    if (tenant) {
      setSelectedTenant(tenant);
      setFormData({
        name: tenant.name,
        slug: tenant.slug,
        isActive: tenant.isActive,
      });
    } else {
      setSelectedTenant(null);
      setFormData({
        name: '',
        slug: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTenant(null);
    setFormData({
      name: '',
      slug: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedTenant) {
        // Update existing tenant
        await axios.patch(
          `${API_URL}/tenants/${selectedTenant.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Tenant actualizado exitosamente');
      } else {
        // Create new tenant
        await axios.post(`${API_URL}/tenants`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Tenant creado exitosamente');
      }
      handleCloseModal();
      fetchTenants();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;

    try {
      await axios.delete(`${API_URL}/tenants/${tenantToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Tenant eliminado exitosamente');
      fetchTenants();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar tenant');
    } finally {
      setIsConfirmModalOpen(false);
      setTenantToDelete(null);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            Gestión de Tenants
          </h1>
          <p className="text-gray-600 mt-1">
            Administra las organizaciones del sistema
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Tenant
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tenants List */}
      <Card>
        <CardHeader>
          <CardTitle>Tenants ({filteredTenants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Cargando tenants...</p>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron tenants</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Nombre
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Slug
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Estado
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
                  {filteredTenants.map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{tenant.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {tenant.slug}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        {tenant.isActive ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-sm">
                            <XCircle className="w-4 h-4" />
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(tenant)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(tenant)}
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
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedTenant ? 'Editar Tenant' : 'Nuevo Tenant'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  placeholder="Mi Organización"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <Input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  placeholder="mi-organizacion"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL única para el tenant (solo letras, números y guiones)
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Activo</span>
                </label>
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
                    : selectedTenant
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
        title="Eliminar Tenant"
        message={`¿Estás seguro que deseas eliminar el tenant "${tenantToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}
