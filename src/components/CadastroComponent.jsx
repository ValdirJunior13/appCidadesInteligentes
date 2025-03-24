import { useState } from "react";
import { auth, googleProvider, appleProvider, signInWithPopup } from "../components/firebaseConfig";
import { useNavigate } from "react-router-dom";

const CadastroComponent = () => {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    cpf: "",
    user_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState({
    google: false,
    apple: false,
    form: false
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateFields = () => {
    if (!formData.nome || !formData.telefone || !formData.email || !formData.cpf || !formData.user_name) {
      setError("Todos os campos devem ser preenchidos.");
      return false;
    }
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(formData.cpf)) {
      setError("CPF inválido. Formato correto: 000.000.000-00");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    
    setLoading({...loading, form: true});
    
    try {
      const response = await fetch("/api/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate("/home");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Erro no cadastro");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading({...loading, form: false});
    }
  };

  const handleSocialLogin = async (provider, type) => {
    setLoading({...loading, [type]: true});
    setError("");
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Preenche automaticamente os campos
      setFormData({
        ...formData,
        nome: user.displayName || "",
        email: user.email || "",
        user_name: user.email?.split('@')[0] || `user_${Math.random().toString(36).substr(2, 8)}`
      });

      // Tenta cadastro automático
      try {
        const response = await fetch(`/api/cadastro/${type}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: user.displayName,
            email: user.email,
            uid: user.uid
          }),
        });

        if (response.ok) {
          navigate("/home");
        } else {
          setError("Complete os campos restantes e clique em Registrar Conta");
        }
      } catch (apiError) {
        console.error("API Error:", apiError);
        setError("Complete os campos restantes para finalizar");
      }

    } catch (error) {
      console.error(`${type} Error:`, error);
      
      let errorMessage = `Erro ao autenticar com ${type === 'google' ? 'Google' : 'Apple'}`;
      
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = "O popup foi fechado antes de completar";
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = "Este email já está cadastrado com outro método";
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading({...loading, [type]: false});
    }
  };

  return (
    <div className="w-full md:w-1/2 flex items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="flex w-full max-w-5xl bg-white shadow-md rounded-lg overflow-hidden">
        <div className="w-1/2 hidden md:block">
          <img src="../src/assets/images/Max.jpg" alt="Imagem de Registro" className="object-cover w-full h-full" />
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Crie sua Conta!</h2>
          
          {/* Botões de Login Social */}
          <div className="flex flex-col space-y-3 mb-5">
            <button
              onClick={() => handleSocialLogin(googleProvider, 'google')}
              disabled={loading.google}
              className={`w-full bg-white border border-gray-300 py-3 px-6 flex items-center justify-center text-gray-700 rounded-md hover:bg-gray-50 transition-colors ${
                loading.google ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading.google ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
                  Continue com Google
                </>
              )}
            </button>

            <button
              onClick={() => handleSocialLogin(appleProvider, 'apple')}
              disabled={loading.apple}
              className={`w-full bg-black text-white py-3 px-6 flex items-center justify-center rounded-md hover:bg-gray-800 transition-colors ${
                loading.apple ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading.apple ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.85 1.82-3.18 1.97-1.13.15-2.21-.3-3.04-.87-.81-.56-1.52-1.47-2.48-1.42-.96.05-1.54.93-2.49 1.43-1.03.59-2.12 1.07-3.5.92-1.36-.15-2.48-1.09-3.26-2.12C.93 17.58.5 15.8 1 13.88c.52-1.96 2.07-3.48 3.99-3.52 1.05-.02 2.03.69 2.67.69.63 0 1.65-.76 2.78-.65.47.04 1.8.19 2.65 1.38-.07.04-1.36.8-1.35 2.38 0 1.52 1.33 2.06 1.37 2.08-.03.1-.43 1.47-.14 2.94M13.5 5.5c.72-.82 1.19-1.98 1.04-3.13-.99.04-2.19.66-2.91 1.49-.64.71-1.19 1.86-1.04 2.96 1.1.08 2.22-.53 2.91-1.32"/>
                  </svg>
                  Continue com Apple
                </>
              )}
            </button>
          </div>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">ou</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  name="nome" 
                  id="nome" 
                  value={formData.nome} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
              
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input 
                  type="tel" 
                  name="telefone" 
                  id="telefone" 
                  value={formData.telefone} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input 
                  type="text" 
                  name="cpf" 
                  id="cpf" 
                  value={formData.cpf} 
                  onChange={handleChange} 
                  placeholder="000.000.000-00" 
                  className="w-full border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
              
              <div>
                <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-1">Nome de Usuário</label>
                <input 
                  type="text" 
                  name="user_name" 
                  id="user_name" 
                  value={formData.user_name} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
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
                <a href="/recuperar-senha" className="text-blue-600 hover:text-blue-800">
                  Esqueceu a senha?
                </a>
              </div>
              
              <button 
                type="submit" 
                disabled={loading.form}
                className={`w-full bg-blue-600 text-white py-2.5 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium ${
                  loading.form ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading.form ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cadastrando...
                  </span>
                ) : (
                  "Registrar Conta"
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-5 text-center text-sm">
            <span className="text-gray-600">Já tem uma conta? </span>
            <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Faça Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroComponent;