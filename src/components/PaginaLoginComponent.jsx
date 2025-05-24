import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Ajuste o caminho se necessário
import Cookies from "js-cookie";
import Quadrado from "../components/Quadrado"; // Ajuste o caminho se necessário

const PaginaLoginComponent = () => {
  const navigate = useNavigate();
  const { usuarioLogado, logout, loadingAuth } = useAuth();
  const [citys, setCitys] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState({
    user_name: Cookies.get("userName") || "",
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

      if (!response.ok) {
        let errorMsg = `Erro Nominatim: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error?.message || JSON.stringify(errorData);
        } catch (e) {
          errorMsg = `Erro Nominatim: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

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
      } else {
        throw new Error("Nenhuma coordenada encontrada para o endereço fornecido.");
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
      alert(`Erro ao buscar coordenadas: ${error.message}`);
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
      setLoading(true);
      try {
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
          let serverErrorMessage = "Erro ao criar cidade no servidor";
          try {
            const errorData = await response.json();
            serverErrorMessage = errorData.message || errorData.detail || JSON.stringify(errorData);
          } catch (e) {
            serverErrorMessage = `Erro ${response.status}: ${response.statusText}`;
          }
          throw new Error(serverErrorMessage);
        }

        const data = await response.json();
        localStorage.setItem(`ultimaCidadeCriada_${novoEndereco.user_name}`, data.id.toString());
        
        const novaCidadeDoServidor = {
            id: data.id,
            city_name: novoEndereco.name,
            city: novoEndereco.city,
            state: novoEndereco.state,
            cargo: "dono",
        };
        
        setCitys((prevCitys) => {
          const cidadesAnteriores = Array.isArray(prevCitys) ? prevCitys : [];
          const cidadesAtualizadas = [...cidadesAnteriores, novaCidadeDoServidor];
          const chaveCidadesUsuario = `cidades_${novoEndereco.user_name}`;
          localStorage.setItem(chaveCidadesUsuario, JSON.stringify(cidadesAtualizadas));
          return cidadesAtualizadas;
        });

        setNovoEndereco({
          user_name: Cookies.get("userName") || "", name: "", state: "", city: "", coordenadas: null,
        });
        setMostrarFormulario(false);
      } catch (error) {
        console.error("Erro ao adicionar cidade:", error);
        alert(`Erro ao criar cidade: ${error.message}`);
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
    const currentUserName = Cookies.get("userName");
    logout();
    Cookies.remove("userName");
    Cookies.remove("validation_hash");
    if (currentUserName) {
      localStorage.removeItem(`cidades_${currentUserName}`);
      localStorage.removeItem(`ultimaCidadeCriada_${currentUserName}`);
    }
    // sessionStorage.clear(); // Ou limpar itens específicos se necessário
    navigate("/login");
  };

  const buscarCidades = async () => {
    setLoading(true);
    try {
      const currentUserName = Cookies.get("userName");
      const validationHash = Cookies.get("validation_hash");

      if (!currentUserName || !validationHash) {
        console.warn("Usuário ou hash de validação não encontrados nos cookies.");
        setCitys([]);
        if (currentUserName) {
            localStorage.removeItem(`cidades_${currentUserName}`);
        }
        return; 
      }
      
      const cachedCities = localStorage.getItem(`cidades_${currentUserName}`);
      if (cachedCities) {
        try {
          const parsedCities = JSON.parse(cachedCities);
          if (Array.isArray(parsedCities)) {
             setCitys(parsedCities);
          } else {
            localStorage.removeItem(`cidades_${currentUserName}`);
          }
        } catch (e) {
            localStorage.removeItem(`cidades_${currentUserName}`);
        }
      }

      // Os placeholders no path são para clareza, a API parece usar os query params
      const apiUrlListaCidades = `http://56.125.35.215:8000/user/get-cities/place_user/place_token?user_name=${currentUserName}&vld_hashing=${validationHash}`;
      
      const response = await fetch(apiUrlListaCidades, {
        method: "GET", headers: { "Accept": "application/json" }
      });

      if (!response.ok) {
        let errorBody = await response.text();
        try { 
          const errorJson = JSON.parse(errorBody); 
          errorBody = errorJson.message || errorJson.detail || JSON.stringify(errorJson); 
        } catch (e) { 
          errorBody = `HTTP ${response.status}: ${response.statusText}. Detalhes: ${errorBody}`; 
        }
        throw new Error(errorBody);
      }

      const data = await response.json();
      const arrayDeCidades = Object.values(data);

      setCitys(arrayDeCidades);
      localStorage.setItem(`cidades_${currentUserName}`, JSON.stringify(arrayDeCidades));

    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
      const currentCitiesState = Array.isArray(citys) ? citys : [];
      if (!currentCitiesState.length) { 
          alert(`Erro ao buscar cidades do servidor: ${error.message}. Verifique sua conexão ou tente mais tarde.`);
      } else {
        console.warn("Falha ao atualizar cidades do servidor, usando dados em cache (se disponíveis). Erro:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCityClick = async (citySummary) => {
    setLoading(true);
    try {
      const cityId = citySummary.id;
      const currentUserName = Cookies.get("userName");
      const validationHash = Cookies.get("validation_hash");

      if (!currentUserName || !validationHash) {
        alert("Erro de autenticação: dados do usuário não encontrados. Por favor, faça login novamente.");
        setLoading(false);
        navigate("/login");
        return;
      }

      // Os placeholders no path são para clareza, a API parece usar os query params
      const apiUrlDetalhesCidade = `http://56.125.35.215:8000/city/get-data/place_cityid/place_user/place_token?city_id=${cityId}&user_name=${currentUserName}&validation_token=${validationHash}`;

      const response = await fetch(apiUrlDetalhesCidade, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (!response.ok) {
        let errorBody = await response.text();
        try {
          const errorJson = JSON.parse(errorBody);
          errorBody = errorJson.message || errorJson.detail || JSON.stringify(errorJson);
        } catch (e) {
          errorBody = `HTTP ${response.status}: ${response.statusText}. Detalhes: ${errorBody}`;
        }
        throw new Error(errorBody);
      }

      const detailedCityData = await response.json();

      sessionStorage.setItem('currentCityId', cityId.toString());

      navigate("/gerenciamentocidades", { 
        state: { 
          detailedData: detailedCityData,
          citySummary: citySummary // Passando o resumo também, pode ser útil
        } 
      });

    } catch (error) {
      console.error("Erro ao buscar dados detalhados da cidade:", error);
      alert(`Não foi possível carregar os detalhes da cidade: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioLogado]); // buscarCidades será chamada apenas quando usuarioLogado mudar

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
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform ${showUserMenu ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 divide-y divide-gray-100">
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{Cookies.get("validation_hash") || "Hash de validação"}</p>
              </div>
              <div className="py-1">
                <button onClick={() => handleAccountOption("dados")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> </svg> <span>Dados da Conta</span> </button>
                <button onClick={() => handleAccountOption("email")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> </svg> <span>Alterar E-mail</span> </button>
                <button onClick={() => handleAccountOption("senha")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /> </svg> <span>Alterar Senha</span> </button>
              </div>
              <div className="py-1">
                <button onClick={handleLogoutClick} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /> </svg> <span>Sair</span> </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="p-6 max-w-7xl mx-auto pt-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Minhas Cidades</h1>
            <p className="text-gray-600">
              {Array.isArray(citys) && citys.length > 0
                ? `Olá ${userName}, Você tem ${citys.length} ${citys.length === 1 ? 'cidade cadastrada' : 'cidades cadastradas'}.`
                : "Adicione sua primeira cidade para começar."}
            </p>
          </div>
          
          <button
            onClick={() => setMostrarFormulario(true)}
            className="px-6 py-3 bg-gradient-to-r bg-amber-400 text-white rounded-xl hover:bg-[#f6d76b] transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /> </svg>
            <span className="font-medium ">Adicionar Cidade</span>
          </button>
        </div>

        {Array.isArray(citys) && citys.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {citys.map((citySummary) => (
              <div
                key={citySummary.id}
                onClick={() => handleCityClick(citySummary)}
                className="cursor-pointer transition transform hover:scale-[1.02] active:scale-95"
              >
                <Quadrado
                  imagem="../src/assets/images/city-buildings-svgrepo-com.svg" // Verifique este caminho
                  titulo={citySummary.city_name}
                  descricao={`${citySummary.city}, ${citySummary.state}`}
                />
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center border-2 border-dashed border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /> </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma cidade cadastrada</h3>
              <p className="mt-2 text-gray-600">Adicione sua primeira cidade para começar a gerenciar.</p>
              <button onClick={() => setMostrarFormulario(true)} className="mt-6 px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors shadow" > Adicionar Cidade </button>
            </div>
          )
        )}
        {loading && (!Array.isArray(citys) || citys.length === 0) && <p className="text-center text-gray-500 mt-8">Carregando cidades...</p>}


        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Nova Cidade</h2>
                <button onClick={() => setMostrarFormulario(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100" aria-label="Fechar modal" > <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> </svg> </button>
              </div>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); adicionarEndereco(); }}>
                <div>
                  <label htmlFor="form-name" className="block text-sm font-medium text-gray-700 mb-1">Nome da Localidade</label>
                  <input type="text" id="form-name" placeholder="Ex: Cohab" value={novoEndereco.name} onChange={(e) => setNovoEndereco({ ...novoEndereco, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="form-state" className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
                    <input type="text" id="form-state" placeholder="Ex: SP" value={novoEndereco.state} onChange={(e) => setNovoEndereco({ ...novoEndereco, state: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                  </div>
                  <div>
                    <label htmlFor="form-city" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input type="text" id="form-city" placeholder="Ex: São Paulo" value={novoEndereco.city} onChange={(e) => setNovoEndereco({ ...novoEndereco, city: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                  </div>
                </div>
                <div className="py-2">
                  {loading && novoEndereco.state && novoEndereco.city && !novoEndereco.coordenadas ? (
                    <div className="flex items-center space-x-2 text-blue-600"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /> </svg> <span>Buscando localização...</span> </div>
                  ) : novoEndereco.coordenadas ? (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100"> <div className="flex items-center space-x-2 text-green-700"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> </svg> <span>Localização encontrada!</span> </div> <p className="mt-1 text-xs text-green-600 font-mono"> {novoEndereco.coordenadas.join(", ")} </p> </div>
                  ) : (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-700 flex items-center space-x-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /> </svg> <span className="text-sm">Preencha cidade e estado para buscar coordenadas.</span> </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setMostrarFormulario(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" > Cancelar </button>
                  <button type="submit"
                    disabled={!novoEndereco.coordenadas || (loading && !!novoEndereco.name)} // Permite clicar se coordenadas estiverem ok, mesmo se houver loading de outra coisa
                    className={`px-4 py-2 rounded-lg text-white transition-colors ${ novoEndereco.coordenadas ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md" : "bg-gray-300 cursor-not-allowed" }`} > 
                    {(loading && novoEndereco.coordenadas && !!novoEndereco.name) ? "Salvando..." : "Confirmar"}
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