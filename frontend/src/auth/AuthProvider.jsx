import { useEffect, useMemo, useState } from "react";
import AuthContext from "./AuthContext";
import authService from "../api/services/authService";
import { decodeJwt, isTokenExpired } from "../utils/jwt";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("token")
  );

  const [user, setUser] = useState(
    () => {
      const storedUser = sessionStorage.getItem("user");

      try {
        return storedUser ? JSON.parse(storedUser) : null;
      } catch {
        return null;
      }
    }
  );

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    if (isTokenExpired(token)) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      setToken(null);
      setUser(null);
      return;
    }

    const payload = decodeJwt(token);

    if (!payload) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      setToken(null);
      setUser(null);
      return;
    }

    const currentUser = {
      email: payload.sub,
      role: payload.role,
    };

    setUser(currentUser);
    sessionStorage.setItem(
      "user",
      JSON.stringify(currentUser)
    );
  }, [token]);

  const login = async (credentials) => {
    const jwt = await authService.login(credentials);

    const payload = decodeJwt(jwt);

    if (!payload) {
      throw new Error("Invalid login token received");
    }

    const currentUser = {
      email: payload.sub,
      role: payload.role,
    };

    sessionStorage.setItem("token", jwt);
    sessionStorage.setItem(
      "user",
      JSON.stringify(currentUser)
    );

    setToken(jwt);
    setUser(currentUser);

    return currentUser;
  };

  const register = async (userData) => {
    return authService.register(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [token, user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}