
import { useCallback, useEffect, useMemo, useState } from "react";
import AuthContext from "./AuthContext";
import authService from "../api/services/authService";
import { decodeJwt, isTokenExpired } from "../utils/jwt";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");

    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

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
      role: String(payload.role || "").replace(/^ROLE_/, ""),
    };

    setUser(currentUser);
    sessionStorage.setItem("user", JSON.stringify(currentUser));
  }, [token]);

  const loginWithToken = useCallback((jwt, currentUser) => {
    const payload = decodeJwt(jwt);

    if (!payload || isTokenExpired(jwt)) {
      throw new Error("Invalid or expired authentication token");
    }

    const normalizedUser = {
      email: payload.sub || currentUser?.email,
      role: String(
        payload.role || currentUser?.role || ""
      ).replace(/^ROLE_/, ""),
    };

    if (!normalizedUser.email || !normalizedUser.role) {
      throw new Error("Authentication token is missing user information");
    }

    sessionStorage.setItem("token", jwt);
    sessionStorage.setItem("user", JSON.stringify(normalizedUser));

    setToken(jwt);
    setUser(normalizedUser);

    return normalizedUser;
  }, []);

  const login = useCallback(async (credentials) => {
    const jwt = await authService.login(credentials);

    return loginWithToken(jwt, {});
  }, [loginWithToken]);

  const register = useCallback(async (userData) => {
    return authService.register(userData);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(token && user),
      login,
      loginWithToken,
      register,
      logout,
    }),
    [token, user, login, loginWithToken, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
