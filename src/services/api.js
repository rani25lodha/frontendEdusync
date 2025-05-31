import axios from "axios";
import { API_CONFIG } from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to include token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear(); // Clear all auth data
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Login function that returns the response data with token and user info
export const login = async (credentials) => {
  try {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email: credentials.email,
      password: credentials.password
    });

    const { token, user } = response.data;

    if (!token) {
      throw new Error('No token received from server');
    }

    // Save auth data
    setToken(token);
    if (user?.id) localStorage.setItem("userId", user.id);
    if (user?.name) {
      const capitalizedName = user.name.charAt(0).toUpperCase() + user.name.slice(1);
      localStorage.setItem("username", capitalizedName);
    }
    if (user?.role) localStorage.setItem("role", user.role);

    return { token, user };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Get the JWT token from localStorage
export const getToken = () => {
  return localStorage.getItem("token");
};

// Save token to localStorage
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

// Remove token from localStorage (logout)
export const clearToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
};

// Get user role from localStorage or token
export const getUserRole = () => {
  // First try to get from localStorage
  const roleFromStorage = localStorage.getItem("role");
  if (roleFromStorage) return roleFromStorage;

  // If not in storage, try to get from token
  const token = getToken();
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      clearToken();
      return null;
    }

    // Use standard role claim or fallback
    const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
    const role = payload[roleClaim] || payload.role;
    if (role) localStorage.setItem("role", role); // Cache the role
    return role || null;
  } catch (error) {
    console.error("Error parsing token payload:", error);
    return null;
  }
};

export default api;
