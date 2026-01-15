import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401, it means the token is likely invalid or session expired
    if (error.response?.status === 401) {
      // Supabase handles refresh automatically, but if we get a 401 here,
      // it might mean the user needs to re-authenticate or the session is trashed.
      console.warn('API 401 Unauthorized - Session may be expired');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
