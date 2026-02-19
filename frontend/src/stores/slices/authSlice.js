import { createSlice } from "@reduxjs/toolkit"

const TOKEN_KEY = "access_token"

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem(TOKEN_KEY) || null,
    isLoading: false,
    isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
    error: null
  },

  reducers: {

    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },

    loginSuccess: (state, action) => {

      state.isLoading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true

      // save to localStorage
      localStorage.setItem(TOKEN_KEY, action.payload.token)
      localStorage.setItem("user", JSON.stringify(action.payload.user))
    },

    loginFailure: (state, action) => {

      state.isLoading = false
      state.isAuthenticated = false
      state.error = action.payload
    },

    logout: (state) => {

      state.user = null
      state.token = null
      state.isAuthenticated = false

      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem("user")
    }

  }
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout
} = authSlice.actions

export default authSlice.reducer
