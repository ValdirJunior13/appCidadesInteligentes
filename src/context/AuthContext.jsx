import { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    usuarioLogado: false,
    userData: null,
  });

  useEffect(() => {
    const userName = Cookies.get("userName");
    const password = Cookies.get("userPassword"); 

    if (userName && password) {
      setAuthState({
        usuarioLogado: true,
        userData: {
          user_name: userName,
          password: password,
        },
      });
    }
  }, []);

  const login = ({ user_name, password }) => {
    Cookies.set("userName", user_name, { expires: 1, path: "/" });
    Cookies.set("userPassword", password, { expires: 1, path: "/" });

    setAuthState({
      usuarioLogado: true,
      userData: {
        user_name,
        password,
      },
    });
  };

  const logout = () => {
    Cookies.remove("userName", { path: "/" });
    Cookies.remove("userPassword", { path: "/" });
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
