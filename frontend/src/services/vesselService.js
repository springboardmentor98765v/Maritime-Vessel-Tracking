import api from "./api";

export const getVessels = async () => {
  const response = await api.get("/vessels/");
  return response.data;
};