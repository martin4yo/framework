'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Session {
  id: string;
  userId: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
  revokedAt: string | null;
  isExpired: boolean;
  isActive: boolean;
}

export default function SessionsPage() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchSessions();
    }
  }, [token]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/auth/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Error al cargar las sesiones');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('¿Estás seguro de que deseas cerrar esta sesión?')) {
      return;
    }

    try {
      setRevoking(sessionId);
      await axios.post(
        `${API_URL}/auth/sessions/${sessionId}/revoke`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Sesión cerrada exitosamente');
      await fetchSessions();
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error('Error al cerrar la sesión');
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('¿Estás seguro de que deseas cerrar todas las otras sesiones?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/auth/sessions/revoke-all`,
        { exceptCurrent: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Todas las otras sesiones han sido cerradas');
      await fetchSessions();
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      toast.error('Error al cerrar las sesiones');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Monitor className="w-5 h-5" />;

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-5 h-5" />;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const getDeviceInfo = (userAgent: string | null): string => {
    if (!userAgent) return 'Desconocido';

    // Extract browser
    let browser = 'Navegador Desconocido';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Extract OS
    let os = '';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return os ? `${browser} en ${os}` : browser;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSessionStatus = (session: Session) => {
    if (session.revoked) {
      return {
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        label: 'Revocada',
        color: 'text-red-600 bg-red-50',
      };
    } else if (new Date(session.expiresAt) < new Date()) {
      return {
        icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
        label: 'Expirada',
        color: 'text-yellow-600 bg-yellow-50',
      };
    } else {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        label: 'Activa',
        color: 'text-green-600 bg-green-50',
      };
    }
  };

  const activeSessions = sessions.filter(s => !s.revoked && new Date(s.expiresAt) >= new Date());

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-palette-purple" />
            <div>
              <h1 className="text-2xl font-bold text-palette-dark">
                Sesiones Activas
              </h1>
              <p className="text-sm text-gray-500">
                Gestiona tus sesiones activas y dispositivos conectados
              </p>
            </div>
          </div>
          {activeSessions.length > 1 && (
            <button
              onClick={handleRevokeAllSessions}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Cerrar todas las otras sesiones
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-palette-dark">
                {activeSessions.length}
              </div>
              <div className="text-sm text-gray-500">Sesiones Activas</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-palette-dark">
                {sessions.filter(s => s.revoked).length}
              </div>
              <div className="text-sm text-gray-500">Sesiones Cerradas</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-palette-purple" />
            </div>
            <div>
              <div className="text-2xl font-bold text-palette-dark">
                {sessions.length}
              </div>
              <div className="text-sm text-gray-500">Total de Sesiones</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-palette-purple"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay sesiones disponibles</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sessions.map((session) => {
              const status = getSessionStatus(session);
              const isActive = !session.revoked && new Date(session.expiresAt) >= new Date();

              return (
                <div
                  key={session.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !isActive ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Device Icon */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        {getDeviceIcon(session.userAgent)}
                      </div>

                      {/* Session Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-palette-dark">
                            {getDeviceInfo(session.userAgent)}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          {session.ipAddress && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{session.ipAddress}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Iniciada: {formatDate(session.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Expira: {formatDate(session.expiresAt)}</span>
                          </div>
                          {session.revoked && session.revokedAt && (
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span>Cerrada: {formatDate(session.revokedAt)}</span>
                            </div>
                          )}
                        </div>

                        {session.userAgent && (
                          <div className="mt-3 text-xs text-gray-400 font-mono bg-gray-50 p-2 rounded">
                            {session.userAgent}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {isActive && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={revoking === session.id}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Cerrar sesión"
                      >
                        {revoking === session.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
