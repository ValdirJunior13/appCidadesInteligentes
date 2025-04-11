import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [userData, setUserData] = useState(null);

  const login = ({ token, nome, email }) => {
    setUsuarioLogado(true);
    setUserData({ token, nome, email });
  };
  
  const logout = () => {
    setUsuarioLogado(false);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuarioLogado,
        userData,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};