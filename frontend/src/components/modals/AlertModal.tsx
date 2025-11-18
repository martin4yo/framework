'use client';

import { Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'Aceptar',
  variant = 'info',
}: AlertModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    },
    error: {
      icon: XCircle,
      iconColor: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
  };

  const styles = variantStyles[variant];
  const IconComponent = styles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-start mb-4">
            <div className={`flex-shrink-0 ${styles.iconColor}`}>
              <IconComponent className="w-8 h-8" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className={`w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${styles.button}`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
