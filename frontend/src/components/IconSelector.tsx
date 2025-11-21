'use client';

import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Input } from './ui/Input';
import { Search } from 'lucide-react';

// Lista de iconos populares de Lucide (puedes agregar más)
const POPULAR_ICONS = [
  'Home', 'Users', 'Settings', 'Package', 'ShoppingCart', 'Heart',
  'Star', 'Bell', 'Calendar', 'Clock', 'Mail', 'Phone',
  'Camera', 'Image', 'File', 'Folder', 'Download', 'Upload',
  'Trash2', 'Edit', 'Save', 'Share', 'Send', 'Printer',
  'Database', 'Server', 'Cloud', 'Wifi', 'Battery', 'Cpu',
  'Smartphone', 'Laptop', 'Monitor', 'Tablet', 'Watch', 'Headphones',
  'Music', 'Video', 'Play', 'Pause', 'SkipForward', 'SkipBack',
  'Volume2', 'Mic', 'MessageSquare', 'MessageCircle', 'AtSign', 'Hash',
  'DollarSign', 'CreditCard', 'ShoppingBag', 'Gift', 'Tag', 'Bookmark',
  'Map', 'MapPin', 'Navigation', 'Compass', 'Globe', 'Anchor',
  'Award', 'Trophy', 'Target', 'Flag', 'Zap', 'TrendingUp',
  'BarChart', 'PieChart', 'Activity', 'Briefcase', 'Clipboard', 'FileText',
  'Layout', 'Grid', 'List', 'Layers', 'Box', 'Archive',
  'Lock', 'Unlock', 'Key', 'Shield', 'Eye', 'EyeOff',
  'User', 'UserPlus', 'UserCheck', 'UserX', 'Users2', 'UserCircle',
  'Search', 'Filter', 'SlidersHorizontal', 'Menu', 'MoreHorizontal', 'MoreVertical',
  'ChevronRight', 'ChevronLeft', 'ChevronUp', 'ChevronDown', 'ArrowRight', 'ArrowLeft',
  'Plus', 'Minus', 'X', 'Check', 'CheckCircle', 'XCircle',
  'AlertCircle', 'AlertTriangle', 'Info', 'HelpCircle', 'Lightbulb', 'Sparkles',
];

interface IconSelectorProps {
  value?: string;
  onChange: (iconName: string) => void;
}

export default function IconSelector({ value, onChange }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = POPULAR_ICONS.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || null;
  };

  const SelectedIcon = value ? getIconComponent(value) : null;

  return (
    <div className="relative">
      {/* Botón para abrir el selector */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors flex items-center justify-between bg-white"
      >
        <div className="flex items-center gap-2">
          {SelectedIcon ? (
            <>
              <SelectedIcon className="w-5 h-5 text-gray-700" />
              <span className="text-sm text-gray-700">{value}</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">Seleccionar icono</span>
          )}
        </div>
        <LucideIcons.ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Modal del selector */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel del selector */}
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
            {/* Búsqueda */}
            <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar icono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            {/* Grid de iconos */}
            <div className="p-2 overflow-y-auto max-h-80 grid grid-cols-6 gap-1">
              {filteredIcons.map((iconName) => {
                const Icon = getIconComponent(iconName);
                if (!Icon) return null;

                const isSelected = value === iconName;

                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                    }}
                    className={`
                      p-3 rounded-md hover:bg-gray-100 transition-colors
                      flex flex-col items-center justify-center gap-1 group
                      ${isSelected ? 'bg-blue-50 hover:bg-blue-100 ring-2 ring-blue-500' : ''}
                    `}
                    title={iconName}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-700'}`} />
                    <span className="text-xs text-gray-600 truncate w-full text-center group-hover:text-gray-900">
                      {iconName}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sin resultados */}
            {filteredIcons.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <LucideIcons.Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No se encontraron iconos</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
