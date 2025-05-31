import api from "./api";
import { API_CONFIG } from '../config/api.config';

  // Login function that returns the response data with token and user info
export const login = async (credentials) => {
  const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
  const { token, user } = response.data;

  setToken(token);

  // Save user info
  if (user?.id) localStorage.setItem("userId", user.id);
  if (user?.name) {
    // Capitalize the first letter
    const capitalizedName =
      user.name.charAt(0).toUpperCase() + user.name.slice(1);
    localStorage.setItem("username", capitalizedName);
  }

  return response.data;
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
};

// Extract user role from JWT token stored in localStorage
// export const getUserRole = () => {
//   const token = getToken();
//   if (!token) return null;

//   try {
//     const payloadBase64 = token.split(".")[1];
//     const payloadJson = atob(payloadBase64);
//     const payload = JSON.parse(payloadJson);

//     // Handle role from standard JWT claim (ClaimTypes.Role in backend)
//     const roleClaim =
//       "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
//     return payload[roleClaim] || payload.role || null;
//   } catch (error) {
//     console.error("Error parsing token payload:", error);
//     return null;
//   }
// };
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    // 🔍 Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      clearToken(); // Remove expired token
      return null;
    }

    // 🧠 Use standard role claim or fallback
    const roleClaim =
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
    return payload[roleClaim] || payload.role || null;
  } catch (error) {
    console.error("Error parsing token payload:", error);
    return null;
  }
};
