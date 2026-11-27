import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any legacy shared localStorage token to avoid cross-tab conflicts
    localStorage.removeItem("eventsphere_token");

    const checkLoggedIn = async () => {
      const token = sessionStorage.getItem("eventsphere_token");
      if (token) {
        try {
          const { data } = await api.get("/auth/me");
          setUser(data.user);
        } catch {
          sessionStorage.removeItem("eventsphere_token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (userOrEmail, tokenOrPassword) => {
    if (typeof userOrEmail === "object" && userOrEmail !== null) {
      sessionStorage.setItem("eventsphere_token", tokenOrPassword);
      setUser(userOrEmail);
      return { user: userOrEmail, token: tokenOrPassword };
    }

    const { data } = await api.post("/auth/login", {
      email: userOrEmail,
      password: tokenOrPassword,
    });
    sessionStorage.setItem("eventsphere_token", data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    sessionStorage.setItem("eventsphere_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    sessionStorage.removeItem("eventsphere_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
