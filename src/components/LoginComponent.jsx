import { useState } from "react";
import { useAuth } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";


const LoginComponent = () => {
  const { login } = useAuth();  
  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function salvarHashEmLista(userName, novoHash) {
  const chaveCookie = `hashes_${userName}`;
  const listaHashAtual = Cookies.get(chaveCookie);

  let hashes = [];
  try {
    hashes = listaHashAtual ? JSON.parse(listaHashAtual) : [];
  } catch (e) {
    console.warn("Erro ao parsear hashes salvos:", e);
  }

  if (!hashes.includes(novoHash)) {
    hashes.push(novoHash);
    Cookies.set(chaveCookie, JSON.stringify(hashes), { expires: 7 }); // expira em 7 dias
  }
}
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(""); // limpa erro anterior

  try {
    const response = await fetch("http://56.125.35.215:8000/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: formData.user_name,
        password: formData.password,
      }),
    });

    if (!response.ok) {
      throw new Error("Usuário ou senha inválidos");
    }

    const data = await response.json();

     salvarHashEmLista(formData.user_name, data.hashing);

    await login({
      user_name: data.user_name,
      validation_hash: data.hashing, 
    });

    console.log("Login bem-sucedido:", data);

    navigate("/paginaLogin", { replace: true });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    setError(error.message || "Erro desconhecido");
  }
};

  return (
    <div className="flex min-h-screen flex-col justify-center items-center bg-blue-50 px-4 py-8">
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
              className="block w-full rounded-md border px-3 py-2"
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
              className="block w-full rounded-md border px-3 py-2"
              placeholder="Digite sua senha"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
          >
            Entrar
          </button>
        </form>
        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export default LoginComponent;