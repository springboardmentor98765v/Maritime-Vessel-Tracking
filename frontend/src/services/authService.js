import api from "./api";

// LOGIN
export const login = async (payload) => {
  const response = await api.post("/auth/login/", payload);
  return response.data;
};

// REGISTER
export const register = async (payload) => {
  const response = await api.post("/auth/register/", payload);
  return response.data;
};

// GET PROFILE
export const fetchProfile = async () => {
  const response = await api.get("/auth/profile/me/");
  return response.data;
};

// UPDATE EXTRA PROFILE
export const updateExtraProfile = async (formData) => {
  // IMPORTANT: Do NOT set Content-Type manually when sending FormData.
  // Axios must auto-generate it with the correct multipart boundary.
  // Manually setting it breaks the boundary and causes Django 400 errors.
  const response = await api.put("/auth/profile/extra/", formData);
  return response.data;
};

// FETCH EXTRA PROFILE
export const fetchExtraProfile = async () => {
  const response = await api.get("/auth/profile/extra/");
  return response.data;
};

// CHANGE PASSWORD
export const changePassword = async (payload) => {
  const response = await api.post(
    "/auth/profile/change_password/",
    payload
  );
  return response.data;
};
