import api from "./api"

const getProfile = async () => {
  const response = await api.get("/auth/profile/")
  return response.data
}

export default {
  getProfile
}
