import { useState } from "react";
import axios from "axios"; 
import { auth, googleProvider, appleProvider, signInWithPopup } from "../components/firebaseConfig";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { registerUser } from '../context/authApi';


const CadastroComponent = () => {
  const [formData, setFormData] = useState({
    name: "",
    cellphone: "",
    email: "",
    cpf_cnpj: "",
    user_name: "",
    password: "", 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState({
    google: false,
    apple: false,
    form: false
  });
  const [rememberMe, setRememberMe] = useState(false);  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateFields = () => {
    if (!formData.name || !formData.cellphone || !formData.email || 
        !formData.cpf_cnpj || !formData.user_name || !formData.password) {
      setError("Todos os campos devem ser preenchidos.");
      return false;
    }

    const cpfCnpjRegex = /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/;
    if (!cpfCnpjRegex.test(formData.cpf_cnpj)) {
      setError("CPF ou CNPJ inválido. Formatos aceitos: 000.000.000-00 ou 00.000.000/0000-00");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) {

    console.log("Dados sendo enviados:", formData); /

  try {
    const response = await registerUser(formData);
    console.log("Resposta da API:", response); 
  } catch (error) {
    console.error("Erro completo:", error);
    console.error("Detalhes da resposta:", error.response?.data);
  }
};

    setLoading({...loading, form: true});
    
    try {

    const response = await registerUser({
      user_name: formData.user_name,
      password: formData.password,
      name: formData.name,
      email: formData.email,
      cellphone: formData.cellphone,
      cpf_cnpj: formData.cpf_cnpj
      });

      const { token, user } = response;

      Cookies.set('auth_token', token, {
      expires: rememberMe ? 7 : 1,
      secure: true,
      sameSite: 'Strict'
        });

      Cookies.set('user_name', user.username, {
        expires: rememberMe ? 7 : 1,
        path: '/'
      });

      navigate("/paginaLogin", {
      state: { user }
      });

    } catch (error) {
      setError(
        error.response?.data?.message || 
        error.message || 
        "Erro no cadastro"
      );
    } finally {
      setLoading({...loading, form: false});
    }
  };

  const handleSocialLogin = async (provider, type) => {
    setLoading({...loading, [type]: true});
    
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
  
      const response = await axios.post(`${API_URL}/auth/social`, {
        token: idToken,
        provider: type
      });
      Cookies.set('auth_token', response.data.token);
      navigate("/dashboard");
      
    } catch (error) {
      setError(error.response?.data?.message || "Erro no login social");
    } finally {
      setLoading({...loading, [type]: false});
    }
  };

  return (
    <div className="w-full md:w-1/2 flex items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="flex w-full max-w-5xl bg-white shadow-md rounded-lg overflow-hidden">
        <div className="w-1/2 hidden md:block">
          <img src="../src/assets/images/smart-city (3).png" alt="Imagem de Registro" className="object-cover w-full h-full" />
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Crie sua Conta!</h2>
          
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

          <form onSubmit={handleSubmit}>
            {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cellphone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input 
                  type="tel" 
                  name="cellphone" 
                  id="cellphone" 
                  value={formData.cellphone} 
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
                <label htmlFor="cpf_cnpj" className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input 
                  type="text" 
                  name="cpf_cnpj" 
                  id="cpf_cnpj" 
                  value={formData.cpf_cnpj} 
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input 
                  type="password" 
                  name="password" 
                  id="password" 
                  value={formData.password} 
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