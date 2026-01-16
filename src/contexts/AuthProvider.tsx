import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { authData } from "../types/authType";

export const AuthContext = createContext<{
  auth: authData | null;
  setAuth: React.Dispatch<React.SetStateAction<authData | null>>;
}>({
  auth: null,
  setAuth: () => {},
});

function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<authData | null>(() => {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : null;
  });

  // Persist auth state to localStorage
  useEffect(() => {
    if (auth) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth");
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
