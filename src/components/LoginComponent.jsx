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
            window.location.href = "/dashboard";
        } catch (error) {
            console.error("Erro:", error);
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center px-4 py-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-xs">
                <img
                    alt="Nome do Site"
                    src="../src/assets/images/user.png"
                    className="mx-auto h-8 w-auto"
                />
                <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
                    Entrar na sua conta
                </h2>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xs">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                            Endereço de Email:
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md bg-white px-2 py-1 text-sm text-gray-900 border border-gray-300 outline-none focus:border-indigo-500 focus:shadow-md"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                            Senha:
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md bg-white px-2 py-1 text-sm text-gray-900 border border-gray-300 outline-none focus:border-indigo-500 focus:shadow-md"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Entrar na conta
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-xs text-gray-500">
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
