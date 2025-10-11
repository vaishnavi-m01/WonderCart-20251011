import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config } from '../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with secure configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Security configurations
  withCredentials: false, // Don't send cookies with requests
  validateStatus: (status) => status >= 200 && status < 300, // Only accept 2xx status codes
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    
    // Add request timestamp for logging
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful requests in development
    if (config.enableLogging && __DEV__) {
      const duration = response.config.metadata?.startTime 
        ? Date.now() - response.config.metadata.startTime 
        : 'unknown';
      console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Log errors
    if (config.enableLogging) {
      const duration = originalRequest?.metadata?.startTime 
        ? Date.now() - originalRequest.metadata.startTime 
        : 'unknown';
      console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} (${duration}ms)`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Clear expired token
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('user');
        
        // You might want to redirect to login screen here
        // navigation.navigate('SignIn');
        
        return Promise.reject(error);
      } catch (storageError) {
        console.error('Failed to clear storage:', storageError);
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', {
        message: error.message,
        code: error.code,
        url: originalRequest?.url,
        method: originalRequest?.method
      });
      
      // You might want to show a network error message to the user
      // Toast.show('Network connection error. Please check your internet connection.', Toast.LONG);
    }
    
    // Handle specific HTTP status codes
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          console.error('Bad Request:', error.response.data);
          break;
        case 403:
          console.error('Forbidden:', error.response.data);
          break;
        case 404:
          console.error('Not Found:', error.response.data);
          break;
        case 500:
          console.error('Server Error:', error.response.data);
          break;
        default:
          console.error('HTTP Error:', {
            status: error.response.status,
            data: error.response.data,
            message: error.message
          });
      }
    } else {
      // Handle network errors or other non-HTTP errors
      console.error('Network/Connection Error:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
