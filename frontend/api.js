import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept":       "application/json",
  },
  timeout: 10000,
});

// ── Do NOT send token for public endpoints ──
api.interceptors.request.use(
  (config) => {
    const publicEndpoints = [
      "/dashboard/",
      "/admin/",
      "/safety/",
      "/ports/",
      "/voyages/",
      "/vessels/",
    ];
    const isPublic = publicEndpoints.some(
      (endpoint) => config.url.includes(endpoint)
    );
    if (!isPublic) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Do NOT redirect on 401 ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("401 received — ignoring");
    }
    return Promise.reject(error);
  }
);

export const getVoyageHistory     = async (id)  => (await api.get(`/voyages/${id}/history/`)).data;
export const getVoyageAudit       = async (id)  => (await api.get(`/voyages/${id}/audit/`)).data;
export const getCompanyDashboard  = async ()    => (await api.get("/dashboard/company/")).data;
export const getPortDashboard     = async ()    => (await api.get("/dashboard/port/")).data;
export const getAPIStatus         = async ()    => (await api.get("/admin/api-status/")).data;
export const getLogs              = async ()    => (await api.get("/admin/logs/")).data;
export const exportVoyagesCSV     = async ()    => (await api.get("/admin/export/voyages/?export_format=csv", { responseType: "blob" })).data;
export const exportVoyagesJSON    = async ()    => (await api.get("/admin/export/voyages/")).data;
export const exportVesselsCSV     = async ()    => (await api.get("/admin/export/vessels/", { responseType: "blob" })).data;
export const getSafetyZones       = async ()    => (await api.get("/safety/zones/")).data;
export const getSafetyAlerts      = async ()    => (await api.get("/safety/events/alerts/")).data;
export const getPortsAnalytics    = async ()    => (await api.get("/ports/analytics/")).data;
export const getVessels           = async ()    => (await api.get("/vessels/")).data;

export default api;