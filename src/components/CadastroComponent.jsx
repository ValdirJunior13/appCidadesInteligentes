import { useState } from "react";

const CadastroComponent = () => {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    cpf: "",
    user_name: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex w-full max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
        <div className="w-1/2 hidden md:block">
          <img
            src=""
            alt="Imagem de Registro"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Crie sua Conta!
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="nome"
                className="block text-base font-medium text-gray-700"
              >
                Nome Completo
              </label>
              <input
                type="text"
                name="nome"
                id="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome Completo"
                className="w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base text-gray-700 outline-none focus:border-blue-500 focus:shadow-md"
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="telefone"
                className="block text-base font-medium text-gray-700"
              >
                Telefone
              </label>
              <input
                type="text"
                name="telefone"
                id="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="Insira seu telefone"
                className="w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base text-gray-700 outline-none focus:border-blue-500 focus:shadow-md"
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700"
              >
                Endereço de E-mail
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Insira seu e-mail"
                className="w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base text-gray-700 outline-none focus:border-blue-500 focus:shadow-md"
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="cpf"
                className="block text-base font-medium text-gray-700"
              >
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                id="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="Insira seu CPF"
                className="w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base text-gray-700 outline-none focus:border-blue-500 focus:shadow-md"
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="user_name"
                className="block text-base font-medium text-gray-700"
              >
                Nome de Usuário
              </label>
              <input
                type="text"
                name="user_name"
                id="user_name"
                value={formData.user_name}
                onChange={handleChange}
                placeholder="Insira seu nome de usuário"
                className="w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base text-gray-700 outline-none focus:border-blue-500 focus:shadow-md"
              />
            </div>
            <div>
              <button
                className="hover:shadow-form w-full rounded-md bg-blue-500 py-3 px-8 text-center text-base font-semibold text-white outline-none"
                type="submit"
              >
                Registrar Conta
              </button>
            </div>
            <div className="mt-5">
              <p className="text-red-500">Mensagem de erro</p>
            </div>
            <div className="mt-5">
              <a href="/forgot-password" className="text-blue-500">
                Esqueceu a Senha?
              </a>
            </div>
            <div className="mt-2">
              <a href="/login" className="text-blue-500">
                Já tem uma Conta? Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CadastroComponent;
