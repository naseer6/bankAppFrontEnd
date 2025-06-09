import axios from "axios";
import { API_BASE_URL } from "@/config";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Optionally, add an interceptor to include the token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
