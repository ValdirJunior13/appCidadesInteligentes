import { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    usuarioLogado: false,
    userData: null,
  });

  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userName = Cookies.get("userName");
      const validationHash = Cookies.get("validation_hash");

      if (userName && validationHash) {
        setAuthState({
          usuarioLogado: true,
          userData: { user_name: userName, validation_hash: validationHash },
        });
      }

      setLoadingAuth(false);
    };

    checkAuth();
  }, []);

  const login = async ({ user_name, validation_hash }) => {
    Cookies.set("userName", user_name, {
      expires: 1,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    Cookies.set("validation_hash", validation_hash, {
      expires: 1,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    setAuthState({
      usuarioLogado: true,
      userData: { user_name, validation_hash },
    });
  };

  const logout = () => {
    Cookies.remove("userName", { path: "/" });
    Cookies.remove("validation_hash", { path: "/" });

    setAuthState({
      usuarioLogado: false,
      userData: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        usuarioLogado: authState.usuarioLogado,
        userData: authState.userData,
        login,
        logout,
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
