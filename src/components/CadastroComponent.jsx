import { useState } from "react";

export default function CadastroComponent() {
const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    user_name: "",
});

const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Usuário cadastrado:", formData);
};

return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Cadastro</h2>
        <form onSubmit={handleSubmit}>
        {[
            { label: "Nome", name: "nome", type: "text" },
            { label: "E-mail", name: "email", type: "email" },
            { label: "CPF", name: "cpf", type: "text" },
            { label: "Telefone", name: "telefone", type: "tel" },
            { label: "Nome de Usuário", name: "user_name", type: "text" },].map(({ label, name, type }) => (
            <div className="mb-4" key={name}>
            <label className="block text-gray-700">{label}</label>
            <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            </div>
        ))}
        <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
            Cadastrar
        </button>
        </form>
    </div>
    </div>
);
}