import { useUserStore } from '@/stores/useUserStore';
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from 'axios';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});


// Simple flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedRequestsQueue: ((token: string | null) => void)[] = [];

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip refresh logic for auth endpoints
    if (
      !originalRequest ||
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/auth/logout') ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    // Only attempt refresh on 401 and if not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = useUserStore.getState().refreshToken; // Get refresh token from state

      if (!refreshToken) {
        console.warn("No refresh token found. Logging out user.");
        useUserStore.getState().logout(); // Logout if no refresh token
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If a refresh is in progress, queue the request and wait
        return new Promise((resolve) => {
          failedRequestsQueue.push((token) => {
            if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axiosInstance.post('/auth/refresh-token');

        const newToken = response.data.accessToken;
        
        // Update all queued requests with the new token
        failedRequestsQueue.forEach((callback) => callback(newToken));
        failedRequestsQueue = []; // Clear queue
        isRefreshing = false;

        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        console.log('Token refresh failed:', refreshError.response?.data);
        isRefreshing = false;
        failedRequestsQueue = []; // Clear queue

        // Clear user state and redirect to login
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance