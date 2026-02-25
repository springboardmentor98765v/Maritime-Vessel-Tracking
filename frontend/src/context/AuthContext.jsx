/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  login as loginRequest,
  register as registerRequest,
} from "../services/authService";

const AuthContext = createContext(null);
const storageKey = "mv.auth";

const readStoredAuth = () => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const persistAuth = (value) => {
  if (value) {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } else {
    localStorage.removeItem(storageKey);
  }
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => readStoredAuth());

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials);

    const nextState = {
      token: data.token || data.access,
      profile:
        data.user ||
        data.profile ||
        (data.username || data.role
          ? { username: data.username, role: data.role }
          : null),
    };

    setAuthState(nextState);
    persistAuth(nextState);
    return nextState;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await registerRequest(payload);

    const nextState = {
      token: data.token || data.access,
      profile:
        data.user ||
        data.profile ||
        (data.username || data.role
          ? { username: data.username, role: data.role }
          : null),
    };

    setAuthState(nextState);
    persistAuth(nextState);
    return nextState;
  }, []);

  const logout = useCallback(() => {
    setAuthState(null);
    persistAuth(null);
  }, []);

  const value = useMemo(
    () => ({
      authState,
      isAuthenticated: Boolean(authState?.token),
      login,
      register,
      logout,
    }),
    [authState, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
