import axios from "axios";

/*
Base API instance
Reads backend URL from Vite environment variable
Example:
VITE_API_URL=http://127.0.0.1:8000/api
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
Attach JWT access token automatically
This allows protected Django endpoints to work
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(import.meta.env.VITE_JWT_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
Optional: handle expired tokens or server errors
*/
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;