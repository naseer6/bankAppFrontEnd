import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // Change this if your API URL changes
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
