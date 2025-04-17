import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const LoginComponent = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
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

    if (formData.email === "admin@teste.com" && formData.password === "admin123") {
    const fakeToken = "admin-token-123456";
    const userName = "Admin";

    sessionStorage.setItem("userRole", "admin");
    sessionStorage.setItem("lastLogin", new Date().toISOString());

    Cookies.set("authToken", fakeToken, {
        expires: 1,
        secure: true,
        sameSite: "strict",
    });

    Cookies.set("userName", userName, {
        expires: 1,
    });

      login({
        token: fakeToken,
        nome: userName,
        email: formData.email,
      });

      navigate("/paginaLogin", { replace: true });
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao fazer login");
      }

      const data = await response.json();

      sessionStorage.setItem("userRole", data.user.role);
      sessionStorage.setItem("lastLogin", new Date().toISOString());

      Cookies.set("authToken", data.token, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });

      Cookies.set("userName", data.user.user_name, {
        expires: 1,
      });

    login({
        token: data.token,
        nome: data.user.user_name,
        email: formData.email,
    });

    navigate("/paginaLogin", { replace: true });
    } catch (error) {
    console.error("Erro:", error);
    setError(error.message || "Ocorreu um erro durante o login");
    }
};

return (
    <div className="flex min-h-screen flex-col justify-center items-center bg-blue-50 px-4 py-8">
    <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Bem-vindo de volta</h2>

        <div className="flex flex-col space-y-3 mb-6">
        <button className="flex items-center justify-center w-full py-2.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="h-5 w-5 mr-2"
            />
            Entrar com Google
        </button>
        <button className="flex items-center justify-center w-full py-2.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <img
            src="https://www.apple.com/favicon.ico"
            alt="Apple"
            className="h-5 w-5 mr-2"
            />
            Entrar com Apple
        </button>
        </div>

        <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="text-gray-500 px-3 text-sm">ou</span>
        <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
            </label>
            <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Digite seu e-mail"
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
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Digite sua senha"
            />
        </div>

        <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600">
            <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
            />
            Lembrar de mim
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-500">
            Esqueceu a senha?
            </a>
        </div>

        <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-medium text-sm"
        >
            Entrar na minha conta
        </button>
        </form>

        {error && (
        <p className="mt-4 text-center text-sm text-red-600">
            {error}
        </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
        Ainda não tem uma conta?{" "}
        <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
            Cadastre-se aqui
        </a>
        </p>
    </div>
    </div>
);
};

export default LoginComponent;
