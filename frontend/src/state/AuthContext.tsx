import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("pulsewatch_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch {
        localStorage.removeItem("pulsewatch_token");
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, [token]);

  const persistSession = (nextToken: string, nextUser: User) => {
    localStorage.setItem("pulsewatch_token", nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    persistSession(response.data.token, response.data.user);
  };

  const register = async (input: { name: string; email: string; password: string }) => {
    const response = await api.post("/auth/register", input);
    persistSession(response.data.token, response.data.user);
  };

  const logout = () => {
    localStorage.removeItem("pulsewatch_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
