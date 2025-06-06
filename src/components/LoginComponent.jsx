import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// Componente para a mensagem Flash/Toast
const FlashMessage = ({ message, type, onClear }) => {
  useEffect(() => {
    // Esconde a mensagem após 3 segundos
    const timer = setTimeout(() => {
      onClear();
    }, 3000);

    return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
  }, [onClear]);

  const baseClasses = "fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white transition-all duration-300";
  const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-600';

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {message}
    </div>
  );
};

const LoginComponent = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
  });
  
  // --- MUDANÇA 1: Estado 'error' foi mesclado no novo estado 'flash' ---
  const [flash, setFlash] = useState({ show: false, message: '', type: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFlash({ show: false, message: '', type: '' }); // Limpa mensagens antigas
    setIsLoggingIn(true);

    try {
      const response = await fetch("http://56.125.35.215:8000/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: formData.user_name,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        // Pega a mensagem de erro da API se existir, senão usa um padrão
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Usuário ou senha inválidos");
      }

      const data = await response.json();
      Cookies.set("userName", data.user_name, { expires: 1 });
      Cookies.set("validation_hash", data.hashing, { expires: 1 });
      await login({ user_name: data.user_name, validation_hash: data.hashing });

      console.log("Login bem-sucedido:", data);

      // --- MUDANÇA 2: Ativar a mensagem flash de SUCESSO ---
      setFlash({ show: true, message: 'Login efetuado com sucesso!', type: 'success' });

      // Atrasar o redirecionamento
      setTimeout(() => {
        navigate("/paginaLogin", { replace: true });
      }, 2000); // 2 segundos de atraso

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      
      // --- MUDANÇA 3: Ativar a mensagem flash de ERRO ---
      setFlash({ show: true, message: error.message, type: 'error' });
      setIsLoggingIn(false); // Libera o formulário para nova tentativa
    }
  };

  return (
    // A estrutura principal agora é uma só, sem o `if` que trocava a tela
    <div className="flex min-h-screen flex-col justify-center items-center bg-blue-50 px-4 py-8">
      
      {/* --- MUDANÇA 4: Renderizar o componente FlashMessage aqui --- */}
      {flash.show && (
        <FlashMessage 
          message={flash.message} 
          type={flash.type} 
          onClear={() => setFlash({ show: false, message: '', type: '' })} 
        />
      )}

      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-1">
              Usuário
            </label>
            <input
              id="user_name"
              name="user_name"
              type="text"
              required
              value={formData.user_name}
              onChange={handleChange}
              // --- MUDANÇA 5: Desabilitar o campo durante o login ---
              disabled={isLoggingIn}
              className="block w-full rounded-md border px-3 py-2 disabled:bg-gray-200"
              placeholder="Digite seu usuário"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              // --- MUDANÇA 5: Desabilitar o campo durante o login ---
              disabled={isLoggingIn}
              className="block w-full rounded-md border px-3 py-2 disabled:bg-gray-200"
              placeholder="Digite sua senha"
            />
          </div>
          <button
            type="submit"
            // --- MUDANÇA 5: Desabilitar o botão e mudar o texto ---
            disabled={isLoggingIn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md disabled:bg-blue-300 disabled:cursor-wait"
          >
            {isLoggingIn ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        {/* O erro agora é tratado pelo FlashMessage, esta linha não é mais necessária */}
        {/* {error && <p>...</p>} */}
      </div>
    </div>
  );
};

export default LoginComponent;