import axios from 'axios';
import { normalizeApiBaseUrl } from './config';

const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: apiBaseUrl,
});

export const AUTH_CLEARED_EVENT = 'auth:cleared';

let refreshTokenRequest = null;

function persistAccessToken(accessToken) {
  localStorage.setItem('access_token', accessToken);

  const savedUser = localStorage.getItem('user_info');
  if (!savedUser) {
    return;
  }

  try {
    const userInfo = JSON.parse(savedUser);
    localStorage.setItem('user_info', JSON.stringify({ ...userInfo, token: accessToken }));
  } catch {
    localStorage.removeItem('user_info');
  }
}

function clearAuthData() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_info');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CLEARED_EVENT));
  }
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  if (!refreshTokenRequest) {
    refreshTokenRequest = axios
      .post(`${api.defaults.baseURL}login/refresh/`, { refresh: refreshToken })
      .then((response) => {
        const nextAccessToken = response.data?.access;
        if (!nextAccessToken) {
          throw new Error('Refresh response did not include an access token');
        }

        persistAccessToken(nextAccessToken);
        return nextAccessToken;
      })
      .finally(() => {
        refreshTokenRequest = null;
      });
  }

  return refreshTokenRequest;
}

// Thêm token vào header của mọi request gửi đi
api.interceptors.request.use(
  (config) => {
    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
    if (isFormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isRefreshRequest = originalRequest?.url?.includes('login/refresh/');

    if (status !== 401 || !originalRequest || originalRequest._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearAuthData();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
