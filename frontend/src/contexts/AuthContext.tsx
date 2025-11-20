'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  superuser?: boolean;
}

export interface Tenant {
  id: string;
  nombre: string;
  slug: string;
  plan: string;
  configuracion?: any;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchTenant: (tenantId: string) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperuser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;
  const isSuperuser = !!user?.superuser;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');

      if (savedToken) {
        verifyToken(savedToken);
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-token`, {
        token: tokenToVerify,
      });

      if (response.data) {
        setUser(response.data.user);
        setTenant(response.data.tenant);
        setToken(tokenToVerify);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', tokenToVerify);
        }
      }
    } catch (error: any) {
      console.error('Error verificando token:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setUser(null);
      setTenant(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, tenantId?: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        tenantId,
      });

      const data = response.data;

      setUser(data.user);
      setTenant(data.tenant);
      setToken(data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }

      // Return the data so the login page can decide where to redirect
      return data;
    } catch (error: any) {
      console.error('Error en login:', error);

      // Manejo de errores mejorado
      if (error.response) {
        // El servidor respondió con un código de error
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;

        if (status === 401) {
          throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
        } else if (status === 400) {
          throw new Error(message || 'Datos inválidos. Verifica tu información.');
        } else if (status === 403) {
          throw new Error('Acceso denegado. Tu cuenta puede estar desactivada.');
        } else {
          throw new Error(message || 'Error al iniciar sesión. Intenta nuevamente.');
        }
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        throw new Error('No se puede conectar al servidor. Verifica que el backend esté corriendo.');
      } else {
        // Error al configurar la petición
        throw new Error('Error inesperado: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchTenant = async (tenantId: string) => {
    if (!isSuperuser) {
      throw new Error('Solo los superusuarios pueden cambiar de tenant');
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/switch-tenant`,
        { tenantId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      setTenant(data.tenant);
      setToken(data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }
    } catch (error) {
      console.error('Error en switchTenant:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        token,
        login,
        logout,
        switchTenant,
        isLoading,
        isAuthenticated,
        isSuperuser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
