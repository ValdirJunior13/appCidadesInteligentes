import { useState } from "react";

const LoginComponent = () => {
    const [formData, setFormData] = useState({
    email: "",
    password: "",
});

const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
};

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const response = await fetch("/api/login", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    if (!response.ok) {
        throw new Error("Erro ao fazer login");
    }

    const data = await response.json();
    console.log("Login bem-sucedido:", data);


    localStorage.setItem("token", data.token);

      // Redirecionar para outra página
    window.location.href = "/dashboard";
    } catch (error) {
        console.error("Erro:", error);
    }
};

return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
        alt="Nome do Site"
        src="../src/assets/images/user.png"
        className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
        Entrar na sua conta
        </h2>
    </div>

    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Endereço de Email:
            </label>
            <div className="mt-2">
            <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 outline-none focus:border-indigo-500 focus:shadow-md"
            />
            </div>
        </div>

        <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            Senha:
            </label>
            <div className="mt-2">
            <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 outline-none focus:border-indigo-500 focus:shadow-md"
            />
            </div>
        </div>

        <div>
            <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
            Sign in
            </button>
        </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
        Ainda não é um membro?{' '}
        <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Crie já sua conta!
        </a>
        </p>
    </div>
    </div>
);
};

export default LoginComponent;
