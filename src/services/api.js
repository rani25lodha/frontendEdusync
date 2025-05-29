import axios from "axios";

const API = axios.create({
  baseURL: "https://localhost:7118/api",
});

// Optional: Add interceptor if needed
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
