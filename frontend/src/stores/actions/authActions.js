import axios from "axios"
import {
  loginStart,
  loginSuccess,
  loginFailure
} from "../slices/authSlice"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const TOKEN_KEY = import.meta.env.VITE_JWT_TOKEN_KEY


// ================= LOGIN =================
export const loginUser = (username, password) => async (dispatch) => {

  try {

    dispatch(loginStart())

    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      { username, password }
    )

    const data = response.data

    localStorage.setItem(TOKEN_KEY, data.access_token)

    dispatch(loginSuccess(data.user))

    return data

  } catch (error) {

    dispatch(
      loginFailure(
        error.response?.data?.detail ||
        "Login failed"
      )
    )

    throw error
  }
}


// ================= REGISTER =================
export const registerUser = (username, password) => async (dispatch) => {

  try {

    dispatch(loginStart())

    const response = await axios.post(
      `${API_BASE_URL}/auth/register`,
      { username, password }
    )

    return response.data

  } catch (error) {

    dispatch(
      loginFailure(
        error.response?.data?.detail ||
        "Registration failed"
      )
    )

    throw error
  }
}
