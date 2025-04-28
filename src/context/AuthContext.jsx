import { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    usuarioLogado: false,
    userData: null
  });

  useEffect(() => {
    const token = Cookies.get("authToken");
    const userName = Cookies.get("userName");
    
    if (token && userName) {
      setAuthState({
        usuarioLogado: true,
        userData: {
          token,
          nome: userName,
          email: sessionStorage.getItem("userEmail") || ""
        }
      });
    }
  }, []);

  const login = ({ token, nome, email }) => {
    Cookies.set("authToken", token, { expires: 1, path: "/" });
    Cookies.set("userName", nome, { expires: 1, path: "/" });
    sessionStorage.setItem("userEmail", email);
    
    setAuthState({
      usuarioLogado: true,
      userData: { token, nome, email }
    });
  };
  
  const logout = () => {
    Cookies.remove("authToken", { path: "/" });
    Cookies.remove("userName", { path: "/" });
    sessionStorage.clear();
    setAuthState({ usuarioLogado: false, userData: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};