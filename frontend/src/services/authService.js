import api from './api'

export const login = async (payload) => {
  const response = await api.post('/auth/login/', payload)
  return response.data
}

export const register = async (payload) => {
  const response = await api.post('/auth/register/', payload)
  return response.data
}

export const fetchProfile = async () => {
  const token = localStorage.getItem("accessToken");

  const response = await axios.get(
    "http://127.0.0.1:8000/profile/",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log(response.data);
};
