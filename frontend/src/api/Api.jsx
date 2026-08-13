import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
});

export const fetchDashboardSummary    = () => api.get("/dashboard/summary").then(r => r.data);
export const fetchRecentSessions      = () => api.get("/dashboard/recent_sessions").then(r => r.data);
export const fetchWeeklyActivity      = () => api.get("/dashboard/weekly").then(r => r.data);

export default api;