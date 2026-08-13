import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
});

export const fetchDashboardSummary = () => api.get("/dashboard/summary").then(res => res.data);
export const fetchRecentPatients = () => api.get("/dashboard/recent").then(res => res.data);

export default api;