'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import IconSelector from '../IconSelector';

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
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  application?: Application | null;
}

export default function ApplicationFormModal({
  isOpen,
  onClose,
  onSuccess,
  application,
}: Props) {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    url: '',
    icon: '',
    lucideIcon: '',
    color: '#3B82F6',
    order: 0,
    isActive: true,
    isMicrofrontend: true,
    remoteEntry: '',
  });

  useEffect(() => {
    if (application) {
      setFormData({
        name: application.name,
        slug: application.slug,
        description: application.description || '',
        url: application.url,
        icon: application.icon || '',
        lucideIcon: application.lucideIcon || '',
        color: application.color || '#3B82F6',
        order: application.order,
        isActive: application.isActive,
        isMicrofrontend: application.isMicrofrontend,
        remoteEntry: application.remoteEntry || '',
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        url: '',
        icon: '',
        lucideIcon: '',
        color: '#3B82F6',
        order: 0,
        isActive: true,
        isMicrofrontend: true,
        remoteEntry: '',
      });
    }
  }, [application, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        ...formData,
        order: Number(formData.order),
      };

      if (application) {
        await axios.patch(`${API_URL}/applications/${application.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Aplicación actualizada correctamente');
      } else {
        await axios.post(`${API_URL}/applications`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Aplicación creada correctamente');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar aplicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {application ? 'Editar Aplicación' : 'Nueva Aplicación'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mi Aplicación"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <Input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="mi-app"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción de la aplicación"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL *
            </label>
            <Input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="http://localhost:3001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icono Lucide
              </label>
              <IconSelector
                value={formData.lucideIcon}
                onChange={(iconName) => setFormData({ ...formData, lucideIcon: iconName })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Icono de Lucide React (recomendado)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icono (URL)
              </label>
              <Input
                type="url"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="/apps/icon.svg"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL alternativa si no usas Lucide
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden
              </label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Activa</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isMicrofrontend}
                onChange={(e) =>
                  setFormData({ ...formData, isMicrofrontend: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Micro-frontend</span>
            </label>
          </div>

          {formData.isMicrofrontend && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remote Entry URL
              </label>
              <Input
                type="url"
                value={formData.remoteEntry}
                onChange={(e) =>
                  setFormData({ ...formData, remoteEntry: e.target.value })
                }
                placeholder="http://localhost:3001/remoteEntry.js"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Guardando...'
                : application
                  ? 'Actualizar'
                  : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
