import axios from "axios";
import useAuth from "../hooks/useAuth";

// Base URL from .env → safer for deployment
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api",
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto handle expired/invalid tokens
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token expired or unauthorized, logging out...");

      // Clear session
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Force redirect to login
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
