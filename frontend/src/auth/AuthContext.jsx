import { createContext, useContext } from "react";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;