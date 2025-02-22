import { useState } from "react";

export default function Login() {
const [loginData, setLoginData] = useState({
    email: "",
    senha: "",
});

const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
};

const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Usuário logado:", loginData);
};

return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
        <div className="mb-4">
            <label className="block text-gray-700">E-mail</label>
            <input
            type="email"
            name="email"
            value={loginData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            />
        </div>
        <div className="mb-4">
            <label className="block text-gray-700">Senha</label>
            <input
            type="password"
            name="senha"
            value={loginData.senha}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            />
        </div>
        <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
            Entrar
        </button>
        </form>
    </div>
    </div>
);
}
