'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const userSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  password: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  isLoading?: boolean;
}

export function UserModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading = false,
}: UserModalProps) {
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(
      isEditing
        ? userSchema
        : userSchema.extend({
            password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
          })
    ),
    defaultValues: user
      ? {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      : {},
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } else {
      reset({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
      });
    }
  }, [user, reset]);

  const handleFormSubmit = async (data: UserFormData) => {
    await onSubmit(data);
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-text-primary">
              {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="usuario@ejemplo.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Nombre"
              type="text"
              placeholder="Juan"
              error={errors.firstName?.message}
              {...register('firstName')}
            />

            <Input
              label="Apellido"
              type="text"
              placeholder="Pérez"
              error={errors.lastName?.message}
              {...register('lastName')}
            />

            {!isEditing && (
              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
            )}

            {isEditing && (
              <p className="text-sm text-text-secondary">
                Deja la contraseña en blanco para mantener la actual
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={isLoading}>
                {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
