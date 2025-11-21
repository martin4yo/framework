'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Package, Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/modals/ConfirmModal';
import ApplicationFormModal from '@/components/modals/ApplicationFormModal';

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
  isActive: boolean;
  isMicrofrontend: boolean;
  remoteEntry?: string;
  createdAt: string;
}

export default function ApplicationsPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);

  useEffect(() => {
    if (token) {
      fetchApplications();
    }
  }, [token]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = applications.filter((app) =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApplications(filtered);
    } else {
      setFilteredApplications(applications);
    }
  }, [searchTerm, applications]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(response.data);
      setFilteredApplications(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar aplicaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = () => {
    fetchApplications();
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const handleEdit = (app: Application) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (app: Application) => {
    setAppToDelete(app);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appToDelete) return;

    try {
      await axios.delete(`${API_URL}/applications/${appToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Aplicación eliminada correctamente');
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar aplicación');
    } finally {
      setIsConfirmModalOpen(false);
      setAppToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aplicaciones</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las aplicaciones del ecosistema
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Aplicación
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar aplicaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay aplicaciones
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza creando tu primera aplicación
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Aplicación
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApplications.map((app) => {
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(app)}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(app)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {app.description && (
                      <p className="text-sm text-gray-600 mb-4">{app.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Tipo:</span>
                        <span className="font-medium">
                          {app.isMicrofrontend ? 'Micro-frontend' : 'Externa'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Orden:</span>
                        <span className="font-medium">{app.order}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {app.url}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ApplicationFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApplication(null);
        }}
        onSuccess={handleCreateOrUpdate}
        application={selectedApplication}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setAppToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Aplicación"
        message={`¿Estás seguro de que deseas eliminar la aplicación "${appToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}
