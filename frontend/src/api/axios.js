// frontend/src/api/axios.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const AUTH_REFRESH_URL = `${API_BASE}/api/token/refresh/`;

const API = axios.create({
  baseURL: API_BASE,
});

console.log("API URL:", API_BASE);


// Attach access token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh token when access expires
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet, try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");
      if (!refresh) {
        // No refresh token -> force logout
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(AUTH_REFRESH_URL, { refresh });
        const newAccess = res.data.access;

        localStorage.setItem("access", newAccess);

        // retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return API(originalRequest);
      } catch (refreshErr) {
        // refresh failed -> force logout
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

// ======= API helpers =======
export const getVessels = (filters = {}) => API.get("/api/vessels/", { params: filters });

//export const subscribeVessel = (id) => API.post(`/vessels/${id}/subscribe/`);

//export const unsubscribeVessel = (id) => API.delete(`/vessels/${id}/unsubscribe/`);
export const subscribeVessel = (id) =>
  API.post(`/api/vessels/${id}/subscribe/`);

export const unsubscribeVessel = (id) =>
  API.delete(`/api/vessels/${id}/unsubscribe/`);

export const getNotifications = () => API.get("/api/notifications/notification-list/");
export const markNotificationRead = (id) =>
  API.patch(`/api/notifications/notification-list/${id}/mark_read/`);// ======= Alerts =======
export const getAlerts = (imo) =>
  API.get(`/api/safety/alerts/?imo=${imo}`);
// ======= Risk Zones =======
export const getRiskZones = () =>
  API.get("/api/safety/zones/");
// ======= Port Analytics =======
export const getPorts = () => API.get("/api/ports/");
export const getPortAnalytics = () => API.get("/api/ports/analytics");
export const markAllNotificationsRead = () =>
  API.post(`/api/notifications/notification-list/mark_all_as_read/`);
export const getVoyageHistory = (vesselId) =>
  API.get(`/api/voyage/${vesselId}/history/`);

export const getCompanyDashboard = () =>
  API.get("/api/dashboard/company/");

export const getPortDashboard = () =>
  API.get("/api/dashboard/port/");

// ======= ADMIN PANEL =======


// ===== ADMIN PANEL =====

export const getApiStatus = () =>
  API.get("/api/admin/api-status/");

export const getLogs = () =>
  API.get("/api/admin/logs/");

// For file downloads
export const exportVoyages = async () => {
  const res = await API.get("/api/admin/export/voyages/", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "voyages.csv");
  document.body.appendChild(link);
  link.click();
};

export const exportEvents = async () => {
  const res = await API.get("/api/admin/export/events/", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "events.csv");
  document.body.appendChild(link);
  link.click();
};

export default API;