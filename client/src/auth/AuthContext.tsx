import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import { getToken, setToken as persistToken } from "../api/client";

interface AuthState {
  token: string | null;
  email: string | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
}

const EMAIL_STORAGE_KEY = "hikeschecklist.email";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    token: getToken(),
    email: localStorage.getItem(EMAIL_STORAGE_KEY),
  }));

  const login = useCallback((token: string, email: string) => {
    persistToken(token);
    localStorage.setItem(EMAIL_STORAGE_KEY, email);
    setState({ token, email });
  }, []);

  const logout = useCallback(() => {
    persistToken(null);
    localStorage.removeItem(EMAIL_STORAGE_KEY);
    setState({ token: null, email: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, isAuthenticated: state.token !== null, login, logout }),
    [state, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
