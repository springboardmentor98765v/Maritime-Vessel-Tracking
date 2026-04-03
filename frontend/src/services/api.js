/*import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Automatically attach access token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");  // ✅ changed

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getVessels = (filters = {}) =>
  api.get("/vessels/", { params: filters });

export const getVesselDetails = (id) =>
  api.get(`/vessels/${id}/`);

export default api; */