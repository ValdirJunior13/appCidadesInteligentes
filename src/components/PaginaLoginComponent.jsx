import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Cookies from "js-cookie";
import Quadrado from "../components/Quadrado";
// Importando o contexto de autenticação

const PaginaLoginComponent = () => {
  const navigate = useNavigate();
  const { usuarioLogado, logout, loadingAuth  } = useAuth();
  const [citys, setCitys] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState({
    user_name: Cookies.get("userName"),
    name: "",
    state: "",
    city: "",
    coordenadas: null,
  });

  const userName = Cookies.get("userName") || "Usuário";
  const [loading, setLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);


  const buscarCoordenadas = async () => {
    if (!novoEndereco.city || !novoEndereco.state) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          `${novoEndereco.city}, ${novoEndereco.state}, Brasil`
        )}&countrycodes=br&addressdetails=1`
      );

      const data = await response.json();
      if (data?.length > 0) {
        const match =
          data.find((item) => {
            const address = item.address;
            return (
              (address.city?.toLowerCase() === novoEndereco.city.toLowerCase() ||
                address.town?.toLowerCase() === novoEndereco.city.toLowerCase() ||
                address.municipality?.toLowerCase() === novoEndereco.city.toLowerCase()) &&
              address.state?.toLowerCase().includes(novoEndereco.state.toLowerCase())
            );
          }) || data[0];
        const { lat, lon } = match;
        setNovoEndereco((prev) => ({
          ...prev,
          coordenadas: [parseFloat(lat), parseFloat(lon)],
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mostrarFormulario && (novoEndereco.city || novoEndereco.state)) {
      const timer = setTimeout(() => buscarCoordenadas(), 1000);
      return () => clearTimeout(timer);
    }
  }, [novoEndereco.city, novoEndereco.state, mostrarFormulario]);

  const adicionarEndereco = async () => {
  if (
    novoEndereco.name &&
    novoEndereco.state &&
    novoEndereco.city &&
    novoEndereco.coordenadas
  ) {
    try {
      setLoading(true);

      const response = await fetch("http://56.125.35.215:8000/user/create-city", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: novoEndereco.user_name,
          name: novoEndereco.name,
          state: novoEndereco.state,
          city: novoEndereco.city,
          validation_hash: Cookies.get("validation_hash"),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar cidade no servidor");
      }

      const data = await response.json();

      const novaCidade = {
        ...novoEndereco,
      };

      setCitys((prevCitys) => {
        const cidadesAtualizadas = [...prevCitys, novaCidade];
        const chaveCidadesUsuario = `cidades_${novoEndereco.user_name}`;
        localStorage.setItem(chaveCidadesUsuario, JSON.stringify(cidadesAtualizadas));
        return cidadesAtualizadas;
      });

      setNovoEndereco({
        user_name: novoEndereco.user_name,
        name: "",
        state: "",
        city: "",
        coordenadas: null,
      });

      setMostrarFormulario(false);
    } catch (error) {
      console.error("Erro ao adicionar cidade:", error);
      alert("Erro ao criar cidade. Tente novamente.");
    } finally {
      setLoading(false);
    }
  } else {
    alert("Preencha todos os campos e aguarde a localização ser buscada.");
  }
};
  const handleAccountOption = (option) => {
    alert(`Funcionalidade '${option}' ainda não implementada.`);
  };

  const handleLogoutClick = () => {
    logout();
    Cookies.remove("userName");
    navigate("/login");
  };



const buscarCidades = async () => {
  try {
    setLoading(true);
    const userName = Cookies.get("userName");
    const validationHash = Cookies.get("validation_hash");

    // Primeiro tente do cache
    const cached = localStorage.getItem(`cidades_${userName}`);
    if (cached) {
      setCitys(JSON.parse(cached));
    }

    const response = await fetch(`http://56.125.35.215:8000/user/get-cities?user_name=${userName}&validation_hash=${validationHash}`);
    
    if (!response.ok) {
      throw new Error("Erro ao buscar cidades");
    }

    const data = await response.json();
    setCitys(data);
    localStorage.setItem(`cidades_${userName}`, JSON.stringify(data));
  } catch (error) {
    console.error("Erro ao buscar:", error);

    if (!citys.length) {
      alert("Erro ao buscar cidades. Usando dados locais.");
    }
  } finally {
    setLoading(false);
  }
};
const handleCityClick = (city) => {
  sessionStorage.setItem('currentCityId', city.id);
  navigate("/gerenciamentocidades", { state: { city } });
};

useEffect(() => {
  if (!loadingAuth && !usuarioLogado) {
    navigate("/login");
  }
}, [usuarioLogado, navigate, loadingAuth]);


useEffect(() => {
  if (usuarioLogado) {
    buscarCidades();
  }
}, [usuarioLogado]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      <div className="bg-white bg-opacity-90 shadow-sm py-3 px-6 flex justify-end items-center sticky top-0 z-30 backdrop-blur-sm">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 focus:outline-none group"
            aria-label="Menu do usuário"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-medium shadow-md group-hover:shadow-lg transition-all">
              {Cookies.get("userName")?.charAt(0).toUpperCase() || "U"}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform ${showUserMenu ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 divide-y divide-gray-100">
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{Cookies.get("userName") || "Usuário"}</p>
                <p className="text-xs text-gray-500 truncate">{Cookies.get("validation_hash") || "Hash de validacao "}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => handleAccountOption("dados")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Dados da Conta</span>
                </button>
                <button
                  onClick={() => handleAccountOption("email")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Alterar E-mail</span>
                </button>
                <button
                  onClick={() => handleAccountOption("senha")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Alterar Senha</span>
                </button>
              </div>
              <div className="py-1">
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="p-6 max-w-7xl mx-auto pt-16">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Minhas Cidades</h1>
            <p className="text-gray-600">
              {citys.length > 0 
                ? `Olá ${userName}, Você tem ${citys.length} ${citys.length === 1 ? 'cidade' : 'cidades'} cadastradas`
                : "Adicione sua primeira cidade para começar"}
            </p>
          </div>
          
          <button
            onClick={() => setMostrarFormulario(true)}
            className="px-6 py-3 bg-gradient-to-r bg-amber-400 text-white rounded-xl hover: bg-[#f6d76b] transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium ">Adicionar Cidade</span>
          </button>
        </div>

        {/* Grid de Cidades */}
        {citys.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {citys.map((local, index) => (
              <div
                key={index}
                onClick={() =>
               handleCityClick(local)}
                                
                className="cursor-pointer transition transform hover:scale-[1.02] active:scale-95"
              >
                <Quadrado
                  imagem="../src/assets/images/city-buildings-svgrepo-com.svg"
                  titulo={local.name}
                  descricao={`${local.city}, ${local.state}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border-2 border-dashed border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma cidade cadastrada</h3>
            <p className="mt-2 text-gray-600">Adicione sua primeira cidade para começar a gerenciar</p>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="mt-6 px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors shadow"
            >
              Adicionar Cidade
            </button>
          </div>
        )}

        {/* Modal de Adição de Cidade */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Nova Cidade</h2>
                <button 
                  onClick={() => setMostrarFormulario(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  aria-label="Fechar modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome da Localidade</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Ex: Cohab"
                    value={novoEndereco.name}
                    onChange={(e) => setNovoEndereco({ ...novoEndereco, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
                    <input
                      type="text"
                      id="state"
                      placeholder="Ex: SP"
                      value={novoEndereco.state}
                      onChange={(e) => setNovoEndereco({ ...novoEndereco, state: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      id="city"
                      placeholder="Ex: São Paulo"
                      value={novoEndereco.city}
                      onChange={(e) => setNovoEndereco({ ...novoEndereco, city: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="py-2">
                  {loading ? (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      <span>Buscando localização...</span>
                    </div>
                  ) : novoEndereco.coordenadas ? (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center space-x-2 text-green-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Localização encontrada!</span>
                      </div>
                      <p className="mt-1 text-xs text-green-600 font-mono">
                        {novoEndereco.coordenadas.join(", ")}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-700 flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Preencha cidade e estado para buscar coordenadas</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={adicionarEndereco}
                    disabled={!novoEndereco.coordenadas || loading}
                    className={`px-4 py-2 rounded-lg text-white transition-colors ${
                      novoEndereco.coordenadas && !loading
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PaginaLoginComponent;