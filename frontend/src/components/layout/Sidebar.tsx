'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Home,
  Users,
  Shield,
  Settings,
  LogOut,
  User,
  ChevronRight,
  Globe,
  Building2,
  Lock,
  Key
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { useSidebar } from '@/contexts/SidebarContext';
import Image from 'next/image';
import axiomaLogoInvertido from '@/assets/axioma_logo_invertido.png';

interface SidebarProps {
  children: React.ReactNode;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuSection {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: MenuItem[];
}

// Menú estático para Axioma Core
const menuSections: MenuSection[] = [
  {
    name: 'Dashboard',
    icon: Home,
    href: '/dashboard'
  },
  {
    name: 'Usuarios',
    icon: Users,
    children: [
      { name: 'Lista de Usuarios', href: '/users', icon: Users },
      { name: 'Roles', href: '/roles', icon: Shield },
      { name: 'Permisos', href: '/permissions', icon: Key },
    ]
  },
  {
    name: 'Tenants',
    icon: Building2,
    href: '/tenants'
  },
  {
    name: 'Seguridad',
    icon: Lock,
    children: [
      { name: 'Audit Logs', href: '/audit-logs', icon: Shield },
      { name: 'Sesiones', href: '/sessions', icon: User },
    ]
  },
  {
    name: 'Configuración',
    icon: Settings,
    href: '/settings'
  },
];

export function Sidebar({ children }: SidebarProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSectionClick = useCallback((sectionName: string, sectionHref?: string) => {
    if (sectionHref && sectionHref !== '#') {
      setExpandedSection(null);
      router.push(sectionHref);
    } else {
      if (expandedSection === sectionName) {
        setExpandedSection(null);
      } else {
        setExpandedSection(sectionName);
      }
    }
  }, [expandedSection, router]);

  const isUrlMatch = useCallback((href: string) => {
    if (href === '#') return false;
    return pathname === href || pathname.startsWith(href + '/');
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar overflow-hidden">
      {/* Header */}
      <div className="flex h-16 items-center justify-center px-4 border-b border-sidebar-hover relative flex-shrink-0">
        {/* Logo y título cuando está expandido */}
        <div
          className={clsx(
            "flex items-center space-x-3 transition-opacity duration-200 absolute left-4",
            isCollapsed && "opacity-0 pointer-events-none"
          )}
        >
          <Globe className="w-8 h-8 text-palette-yellow" />
          <h1 className="text-text-white font-semibold text-lg">Core</h1>
        </div>

        {/* Solo logo cuando está colapsado */}
        <div
          className={clsx(
            "transition-opacity duration-200",
            !isCollapsed && "opacity-0 pointer-events-none"
          )}
        >
          <Globe className="w-8 h-8 text-palette-yellow" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={clsx(
            "text-text-white hover:bg-sidebar-hover hidden lg:flex flex-shrink-0 transition-all duration-200",
            isCollapsed ? "absolute" : "absolute right-4"
          )}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className={clsx(
        "flex-1 py-2 space-y-1 overflow-y-auto scrollbar-thin min-h-0",
        isCollapsed ? "px-2" : "px-4"
      )}>
        {menuSections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.name;
          const hasChildren = section.children && section.children.length > 0;
          const isActive = section.href ? isUrlMatch(section.href) : false;

          return (
            <div key={section.name} className="space-y-1">
              {/* Sección principal */}
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  if (isCollapsed && hasChildren) {
                    setIsCollapsed(false);
                    setExpandedSection(section.name);
                  } else {
                    handleSectionClick(section.name, section.href);
                  }
                }}
                className={clsx(
                  'flex items-center text-text-white rounded-lg cursor-pointer select-none w-full pointer-events-auto relative hover:bg-sidebar-hover transition-colors',
                  isActive && 'bg-sidebar-active',
                  isCollapsed ? 'justify-center h-12 p-2' : hasChildren ? 'justify-between px-4 py-3' : 'px-4 py-3'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={clsx(
                    'truncate whitespace-nowrap font-medium',
                    isCollapsed && 'opacity-0 pointer-events-none w-0 overflow-hidden'
                  )}>
                    {section.name}
                  </span>
                </div>
                {!isCollapsed && hasChildren && (
                  <div className="flex-shrink-0">
                    <ChevronRight className={clsx(
                      "w-4 h-4 transition-transform duration-300 ease-in-out",
                      isExpanded && "rotate-90"
                    )} />
                  </div>
                )}
              </button>

              {/* Elementos hijos */}
              {!isCollapsed && hasChildren && (
                <div className={clsx(
                  "ml-8 space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
                  isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                  {section.children!.map((child) => {
                    const isChildActive = isUrlMatch(child.href);
                    const ChildIcon = child.icon;

                    return (
                      <button
                        key={child.name}
                        onClick={() => {
                          setIsMobileOpen(false);
                          if (child.href !== '#') {
                            setExpandedSection(section.name);
                            router.push(child.href);
                          }
                        }}
                        className={clsx(
                          'flex items-center text-text-white rounded-lg cursor-pointer select-none px-4 py-2 w-full pointer-events-auto relative hover:bg-sidebar-hover transition-colors',
                          isChildActive && 'bg-sidebar-active',
                          child.href === '#' && 'opacity-60 cursor-not-allowed'
                        )}
                        disabled={child.href === '#'}
                      >
                        <div className="flex items-center space-x-3">
                          <ChildIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm truncate whitespace-nowrap">
                            {child.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User section */}
      <div className={clsx(
        "border-t border-sidebar-hover transition-all duration-200",
        isCollapsed ? "px-2 py-6" : "p-4"
      )}>
        <div className={clsx(
          'mb-4 transition-all duration-200',
          isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'flex items-center space-x-3 opacity-100'
        )}>
          <div className="w-8 h-8 bg-palette-yellow rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-palette-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-white truncate">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-xs text-text-light truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={clsx(
            'text-text-white flex items-center transition-all duration-200 rounded-lg cursor-pointer hover:bg-sidebar-hover',
            isCollapsed ? 'justify-center w-12 h-12 mx-auto px-0' : 'justify-start space-x-3 w-full py-3 px-4'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className={clsx(
            'transition-opacity duration-200 whitespace-nowrap',
            isCollapsed && 'opacity-0 pointer-events-none w-0 overflow-hidden'
          )}>
            Cerrar Sesión
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className={clsx(
        'hidden lg:flex flex-col transition-all duration-300 ease-in-out flex-shrink-0',
        isCollapsed ? 'w-20' : 'w-64'
      )}>
        {/* Logo Section */}
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-sidebar py-0 hover:opacity-80 transition-opacity cursor-pointer w-full"
          title="Ir a Dashboard"
        >
          <div className="relative h-16 w-full flex items-center justify-center">
            <Image
              src={axiomaLogoInvertido}
              alt="Axioma Logo"
              className="h-full w-auto object-contain p-3"
              priority
            />
          </div>
        </button>
        <div className="bg-sidebar border-b border-sidebar-hover" />
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-sidebar flex flex-col">
            {/* Logo Section for mobile */}
            <button
              onClick={() => {
                router.push('/dashboard');
                setIsMobileOpen(false);
              }}
              className="bg-sidebar py-2 hover:opacity-80 transition-opacity cursor-pointer w-full"
              title="Ir a Dashboard"
            >
              <div className="relative h-12 w-full flex items-center justify-center">
                <Image
                  src={axiomaLogoInvertido}
                  alt="Axioma Logo"
                  className="h-full w-auto object-contain p-2"
                  priority
                />
              </div>
            </button>
            <div className="bg-sidebar border-b border-sidebar-hover" />
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-white">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-3 hover:opacity-80"
            title="Ir a Dashboard"
          >
            <Globe className="w-8 h-8 text-palette-purple" />
            <h1 className="text-text-primary font-semibold text-lg">Core</h1>
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
