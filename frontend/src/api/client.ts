import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 60000, // 60 seconds (build generation can take time)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 (unauthorized) - try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const token = localStorage.getItem('auth_token');
                if (token) {
                    const response = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const newToken = response.data.token;
                    localStorage.setItem('auth_token', newToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle 403 (forbidden)
        if (error.response?.status === 403) {
            console.error('Forbidden:', error.response.data);
        }

        // Handle 500 (server error)
        if (error.response?.status === 500) {
            console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        apiClient.post('/api/auth/login', { email, password }).then(res => res.data),

    register: (email: string, username: string, password: string) =>
        apiClient.post('/api/auth/register', { email, username, password }).then(res => res.data),

    logout: () =>
        apiClient.post('/api/auth/logout').then(res => res.data),

    getProfile: () =>
        apiClient.get('/api/auth/me').then(res => res.data),

    refreshToken: () =>
        apiClient.post('/api/auth/refresh').then(res => res.data),
};

// Build API
export const buildApi = {
    generateBuild: (request: any) =>
        apiClient.post('/api/builds/generate', request).then(res => res.data),

    getBuild: (id: number) =>
        apiClient.get(`/api/builds/${id}`).then(res => res.data),

    getUserBuilds: (userId: number) =>
        apiClient.get(`/api/builds/user/${userId}`).then(res => res.data),

    getPublicBuilds: (page: number = 1, limit: number = 20) =>
        apiClient.get(`/api/builds/public?page=${page}&limit=${limit}`).then(res => res.data),

    updateBuild: (id: number, updates: any) =>
        apiClient.put(`/api/builds/${id}`, updates).then(res => res.data),

    deleteBuild: (id: number) =>
        apiClient.delete(`/api/builds/${id}`).then(res => res.data),

    publishBuild: (id: number) =>
        apiClient.post(`/api/builds/${id}/publish`).then(res => res.data),
};

// Preferences API
export const preferencesApi = {
    getPreferences: () =>
        apiClient.get('/api/preferences').then(res => res.data),

    updatePreferences: (preferences: any) =>
        apiClient.put('/api/preferences', preferences).then(res => res.data),
};

// Health check
export const healthCheck = () =>
    apiClient.get('/health').then(res => res.data);

export default apiClient;
