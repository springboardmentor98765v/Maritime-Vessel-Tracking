import API from "./api";

export const loginUser = async (email, password) => {
  const response = await API.post("/login/", {
    email: email,
    password: password,
  });

  localStorage.setItem("token", response.data.access);

  return response.data;
};

export const registerUser = async (username, email, password) => {
  const response = await API.post("/register/", {
    username: username,
    email: email,
    password: password,
  });

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};