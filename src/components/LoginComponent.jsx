import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginComponent = () => {
  const [formData, setFormData] = useState({
    username: "",  // Atenção: no backend usamos "username" (não "email" se você estiver verificando este campo)
    password: "",
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao fazer login");
      }
      
      const data = await response.json();
      
      // Atualize o seu AuthContext com as informações do usuário
      login({
        token: data.token, 
        nome: data.user.username, // ou adapte conforme o objeto retornado
        email: formData.username,  // se for o email, ajuste os nomes conforme sua API
      });
      
      // Redireciona para a rota desejada após login (ex: dashboard)
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro:", error);
      setError(error.message || "Ocorreu um erro durante o login");
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center items-center bg-blue-50 px-4 py-8">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Bem-vindo de volta</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nome de Usuário
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Digite seu nome de usuário"
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
              className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Digite sua senha"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-medium text-sm"
          >
            Entrar na minha conta
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginComponent;
