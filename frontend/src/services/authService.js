import axios from "axios"

const API = import.meta.env.VITE_API_BASE_URL

const getProfile = async () => {

  const token = localStorage.getItem("access_token")

  const response = await axios.get(`${API}/auth/profile/`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return response.data
}

export default {
  getProfile
}
