import axios from "axios";

// Read API base URL from Vite env variable or default to localhost
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatic JWT bearer token injection
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      // Clear token on unauthorized (expired session)
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export const fetchDashboardSummary = () => api.get("/dashboard/summary").then((r) => r.data);
export const fetchRecentSessions   = () => api.get("/dashboard/recent_sessions").then((r) => r.data);
export const fetchWeeklyActivity   = () => api.get("/dashboard/weekly").then((r) => r.data);
export const fetchProfile          = () => api.get("/profile").then((r) => r.data);
export const updateProfile         = (data) => api.put("/profile", data).then((r) => r.data);

export default api;