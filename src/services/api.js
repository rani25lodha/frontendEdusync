import axios from "axios";

const API = axios.create({
baseURL: "webappedusync-b6d0axeqeeg0gsfg.centralindia-01.azurewebsites.net",
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
