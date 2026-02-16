import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginRequest, register as registerRequest } from '../services/authService'
import api from '../services/api'

const AuthContext = createContext(null)
const storageKey = 'mv.auth'

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(storageKey)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const persistAuth = (value) => {
  if (typeof window === 'undefined') {
    return
  }

  if (value) {
    window.localStorage.setItem(storageKey, JSON.stringify(value))
  } else {
    window.localStorage.removeItem(storageKey)
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => readStoredAuth())

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials)
    // backend returns username/role at top level along with access/refresh tokens
    const profileFromResponse =
      data.user ||
      data.profile ||
      // fall back to fields returned directly
      (data.username || data.role ? { username: data.username, role: data.role } : null)

    const nextState = {
      token: data.token || data.access || '',
      profile: profileFromResponse,
    }
    setAuthState(nextState)
    persistAuth(nextState)
    return nextState
  }, [])

  const register = useCallback(async (payload) => {
    const data = await registerRequest(payload)
    const profileFromResponse =
      data.user ||
      data.profile ||
      (data.username || data.role ? { username: data.username, role: data.role } : null)

    const nextState = {
      token: data.token || data.access || '',
      profile: profileFromResponse,
    }
    setAuthState(nextState)
    persistAuth(nextState)
    return nextState
  }, [])

  const logout = useCallback(() => {
    setAuthState(null)
    persistAuth(null)
  }, [])

  // keep axios default header in sync with current token
  useEffect(() => {
    if (authState?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${authState.token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [authState?.token])

  const value = useMemo(() => {
    return {
      authState,
      isAuthenticated: Boolean(authState?.token),
      login,
      register,
      logout,
    }
  }, [authState, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
