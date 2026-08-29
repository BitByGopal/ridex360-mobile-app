import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Api } from "../api/endpoints";
import { clearTokens, login as apiLogin } from "../api/client";
import { Me } from "../types";

interface AuthContextValue {
  me: Me | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On app start, if a token is already stored, try to restore the session.
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("ridex360_access_token");
        if (token) {
          const profile = await Api.me();
          setMe(profile);
        }
      } catch {
        // stale/invalid token -- just fall through to the login screen
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(username: string, password: string) {
    setError(null);
    try {
      await apiLogin(username, password);
      const profile = await Api.me();
      setMe(profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
      throw e;
    }
  }

  async function logout() {
    await clearTokens();
    setMe(null);
  }

  return (
    <AuthContext.Provider value={{ me, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
