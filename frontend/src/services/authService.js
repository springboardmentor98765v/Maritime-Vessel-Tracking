import api from "./api";

// ========================
// LOGIN
// ========================
export const login = async (payload) => {
  const response = await api.post("/auth/login/", payload);
  return response.data;
};

// ========================
// REGISTER
// ========================
export const register = async (payload) => {
  const response = await api.post("/auth/register/", payload);
  return response.data;
};

// ========================
// GET PROFILE
// ========================
export const fetchProfile = async () => {
  const response = await api.get("/auth/profile/me/");
  return response.data;
};

// ========================
// UPDATE PROFILE (FormData)
// ========================
//import api from "./api";

// UPDATE EXTRA PROFILE (WITH FILE UPLOAD)
export const updateExtraProfile = async (formData) => {
  const response = await api.put(
    "/auth/profile/extra/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};


// ========================
// CHANGE PASSWORD
// ========================
export const changePassword = async (payload) => {
  const response = await api.post(
    "/auth/profile/change_password/",
    payload
  );
  return response.data;
};
