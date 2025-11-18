import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: {
    tenantSlug: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => api.post('/auth/register', data),

  login: (data: { tenantSlug: string; email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  getMe: () => api.get('/auth/me'),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// Tenants API
export const tenantsApi = {
  getAll: () => api.get('/tenants'),
  getOne: (id: string) => api.get(`/tenants/${id}`),
  create: (data: { name: string; slug: string; settings?: any }) =>
    api.post('/tenants', data),
  update: (id: string, data: Partial<{ name: string; slug: string; settings: any; isActive: boolean }>) =>
    api.patch(`/tenants/${id}`, data),
  delete: (id: string) => api.delete(`/tenants/${id}`),
};

// Users API
export const usersApi = {
  getAll: (tenantId?: string) =>
    api.get('/users', { params: { tenantId } }),
  getOne: (id: string) => api.get(`/users/${id}`),
  create: (data: {
    tenantId: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => api.post('/users', data),
  update: (id: string, data: Partial<{ firstName: string; lastName: string; isActive: boolean }>) =>
    api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Roles API
export const rolesApi = {
  getAll: (tenantId?: string) =>
    api.get('/roles', { params: { tenantId } }),
  getOne: (id: string) => api.get(`/roles/${id}`),
  create: (data: { tenantId?: string; name: string; description?: string }) =>
    api.post('/roles', data),
  update: (id: string, data: Partial<{ name: string; description: string }>) =>
    api.patch(`/roles/${id}`, data),
  delete: (id: string) => api.delete(`/roles/${id}`),
};

// Permissions API
export const permissionsApi = {
  getAll: (tenantId?: string) =>
    api.get('/permissions', { params: { tenantId } }),
  getOne: (id: string) => api.get(`/permissions/${id}`),
  create: (data: {
    tenantId?: string;
    resource: string;
    action: string;
    conditions?: any;
    description?: string;
  }) => api.post('/permissions', data),
  update: (id: string, data: Partial<{ conditions: any; description: string }>) =>
    api.patch(`/permissions/${id}`, data),
  delete: (id: string) => api.delete(`/permissions/${id}`),
};
