import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from '../context/AuthContext'; 
import Cookies from "js-cookie";
import Sidebar from "./Sidebar"; 
import PropTypes from 'prop-types';

// Correção para o ícone padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const MapViewControl = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

MapViewControl.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number), 
  zoom: PropTypes.number.isRequired,
};

const GerenciarCidadesComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuarioLogado, logout, loadingAuth } = useAuth();

  const [cityDetails, setCityDetails] = useState(null);
  const [userCargo, setUserCargo] = useState(null);
  const [cityDevices, setCityDevices] = useState({});
  
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const initialLoadAttemptedRef = useRef(false); // Ref para controlar a tentativa de carregamento

  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [pontosFiltrados, setPontosFiltrados] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const mapRef = useRef(null);

  const [tempFiltrosMapa, setTempFiltrosMapa] = useState({
    iluminacao: true, irrigacao: true, drenagem: true, lixo: true
  }); 
  const [filtrosMapa, setFiltrosMapa] = useState({ ...tempFiltrosMapa });

  const fetchCityDataById = async (cityId) => {
    // Não precisa setar isLoadingPageData(true) aqui, pois o useEffect já o faz ou o estado inicial é true
    try {
      const currentUserName = Cookies.get("userName");
      const validationHash = Cookies.get("validation_hash");
  
      if (!currentUserName || !validationHash) {
        alert("Sessão inválida ou dados de autenticação não encontrados. Faça login novamente.");
        navigate("/login");
        return; // Retorna para não continuar e não ir ao finally ainda sem o setIsLoadingPageData(false)
      }

      const apiUrl = `http://56.125.35.215:8000/city/get-data/<city_id>/<owner_or_manager_user_name>/<validation_token>?city_id=${cityId}&user_name=${currentUserName}&validation_token=${validationHash}`;
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (!response.ok) {
        let errorBody = await response.text();
        try {
          const errorJson = JSON.parse(errorBody);
          errorBody = errorJson.message || errorJson.detail || JSON.stringify(errorJson);
        } catch (e) {
          errorBody = `HTTP ${response.status}: ${response.statusText}. (Detalhes: ${errorBody})`;
        }
        throw new Error(`Falha ao buscar dados da cidade: ${errorBody}`);
      }

      const data = await response.json();
      
      if (data && data.cidade) {
        setCityDetails(data.cidade);
        setUserCargo(data.cargo);
        setCityDevices(data.dispositivos || {});
      } else {
        throw new Error("Formato de dados da cidade inválido recebido da API.");
      }
    } catch (error) {
      console.error("Erro em fetchCityDataById:", error);
      alert(error.message);
      navigate("/paginaLogin");
    } finally {
      setIsLoadingPageData(false);
      // initialLoadAttemptedRef.current já terá sido true para entrar aqui (se chamado pelo useEffect)
      // ou será setado pelo useEffect após esta função completar.
    }
  };

  useEffect(() => {
    if (loadingAuth) {
        setIsLoadingPageData(true); // Mantém o loading visível
        return; 
    }

    if (!usuarioLogado) {
      navigate("/login");
      setIsLoadingPageData(false); // Para o loading se for redirecionar
      return;
    }

    // Se já tentamos carregar os dados (via state ou fetch), não fazemos mais nada neste efeito
    // a menos que location.state mude (nova navegação).
    // O ref controla a lógica de "buscar após refresh" apenas uma vez.
    if (initialLoadAttemptedRef.current && !location.state?.detailedData) {
        // Se já tentou e não há NOVO location.state, apenas garante que o loading parou se os dados existem.
        if (cityDetails && isLoadingPageData) {
            setIsLoadingPageData(false);
        }
        return;
    }
    
    const initialDetailedDataFromLocation = location.state?.detailedData;

    if (initialDetailedDataFromLocation && initialDetailedDataFromLocation.cidade) {
      // console.log("Dados da cidade recebidos via location.state:", initialDetailedDataFromLocation);
      setCityDetails(initialDetailedDataFromLocation.cidade);
      setUserCargo(initialDetailedDataFromLocation.cargo);
      setCityDevices(initialDetailedDataFromLocation.dispositivos || {});
      setIsLoadingPageData(false);
      initialLoadAttemptedRef.current = true; // Dados carregados do state, tentativa concluída
    } else {
      // Não vieram pelo estado da navegação (ex: refresh) OU o estado não tinha .cidade
      // E ainda não tentamos buscar (controlado pelo !initialLoadAttemptedRef.current que agora está implícito)
      const cityIdFromSession = sessionStorage.getItem('currentCityId');
      if (cityIdFromSession) {
        // console.log(`Dados não encontrados no location.state. Buscando para cityId: ${cityIdFromSession}`);
        // Marcamos que a tentativa de carregamento vai começar
        initialLoadAttemptedRef.current = true; 
        setIsLoadingPageData(true); // Garante que está carregando ANTES da chamada async
        fetchCityDataById(cityIdFromSession); // Esta função setará isLoadingPageData(false) no finally
      } else {
        console.error("ID da cidade para carregamento não encontrado (nem via estado, nem via sessionStorage).");
        alert("Não foi possível carregar os dados da cidade. Selecione uma cidade novamente.");
        navigate("/"); 
        setIsLoadingPageData(false);
        initialLoadAttemptedRef.current = true; // Tentativa concluída (falhou em encontrar ID)
      }
    }
  // location.state: Se o usuário navegar para esta rota com NOVOS dados no estado (ex: outra cidade), queremos reprocessar.
  // loadingAuth, usuarioLogado, navigate: dependências padrão para auth e navegação.
  }, [loadingAuth, usuarioLogado, navigate, location.state, cityDetails, isLoadingPageData]); // Adicionado cityDetails e isLoadingPageData para consistência da condição de saída com ref


  const buscarPontosFiltradosDaAPI = async () => {
  // Garante que temos os detalhes da cidade (especialmente o ID) e os filtros
  if (!cityDetails || !cityDetails.id) {
    console.warn("buscarPontosFiltradosDaAPI: ID da cidade não disponível em cityDetails.");
    // setPontosFiltrados([]); // Opcional: limpar os pontos se não puder buscar
    return; // Não pode prosseguir sem o ID da cidade
  }

  // setLoading(true); // Se você tiver um estado de loading específico para esta operação
  // Ou pode usar o 'isLoadingPageData' se fizer sentido no fluxo
  setIsLoadingPageData(true); // Reutilizando o estado de loading existente

  const sessionCityId = sessionStorage.getItem('currentCityId');
  const currentUserName = Cookies.get("userName");
  const currentValidationHash = Cookies.get("validation_hash"); // Valor para o query param 'validation_token'

  console.log("--- Iniciando buscarPontosFiltradosDaAPI ---");
  console.log("City ID (query):", sessionCityId);
  console.log("User Name (query):", currentUserName);
  console.log("Validation Token (query):", currentValidationHash);
  console.log("Filtros Mapa (para query 'list_filter'):", filtrosMapa);

  if (!currentUserName || !currentValidationHash) {
    alert("Sessão inválida ou dados de autenticação não encontrados. Faça login novamente.");
    setIsLoadingPageData(false);
    navigate("/login"); // Redireciona se não houver autenticação
    return;
  }

  const literalPath = `http://http://56.125.35.215:8000/city/get-data/<city_id>/<owner_or_manager_user_name>/<validation_token>?city_id=${sessionCityId}&user_name=${currentUserName}&validation_token=n${currentValidationHash}`;
  
  const apiUrlObject = new URL(literalPath);
  apiUrlObject.searchParams.append('city_id', String(sessionCityId));
  apiUrlObject.searchParams.append('user_name', currentUserName);
  apiUrlObject.searchParams.append('validation_token', currentValidationHash);
  apiUrlObject.searchParams.append('list_filter', JSON.stringify(filtrosMapa)); 

  const apiUrlString = apiUrlObject.toString();
  console.log("URL API (buscarPontosFiltradosDaAPI):", apiUrlString);

  try {
    const response = await fetch(apiUrlString, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    console.log("Status API (buscarPontosFiltradosDaAPI):", response.status, response.statusText);

    if (!response.ok) {
  // Tratar erros de CORS ou outros erros de rede/servidor
  let errorBody = `Erro HTTP ${response.status} (${response.statusText})`;
  
  try { 
    const errorJson = await response.json(); 
    errorBody = errorJson.detail || errorJson.message || JSON.stringify(errorJson); 
  } catch (e) { 
    // Se o corpo do erro não for JSON, tenta ler como texto
    try { 
      errorBody = await response.text() || errorBody; 
    } catch (textErr) {}
  }

  throw new Error(`Falha ao buscar pontos filtrados: ${errorBody}`);
}


    const dadosFiltrados = await response.json();
    console.log("Dados brutos dos pontos filtrados recebidos:", JSON.stringify(dadosFiltrados, null, 2));

    if (Array.isArray(dadosFiltrados)) {
      setPontosFiltrados(dadosFiltrados);
      console.log("Estado 'pontosFiltrados' atualizado com dados da API:", dadosFiltrados);
    } 
    else {
      console.warn("Formato inesperado para os pontos filtrados recebidos da API:", dadosFiltrados);
      setPontosFiltrados([]); // Define como vazio se o formato for incorreto
    }

  } catch (error) {
    console.error("Erro em buscarPontosFiltradosDaAPI:", error.message);
    alert(error.message); // Mostra o erro para o usuário
    setPontosFiltrados([]); // Limpa os pontos em caso de erro
  } finally {
    setIsLoadingPageData(false); // Termina o loading
    console.log("--- buscarPontosFiltradosDaAPI finalizado ---");
  }
};

  useEffect(() => {
    if (cityDetails && cityDetails.pontos && categoriaSelecionada) {
      setPontosFiltrados(cityDetails.pontos[categoriaSelecionada] || []);
    } else if (cityDetails && !cityDetails.pontos && categoriaSelecionada) {
      setPontosFiltrados([]);
    } else {
      setPontosFiltrados([]);
    }
  }, [categoriaSelecionada, cityDetails]);

  const handleLogoutClick = () => { /* ... (sem alterações) ... */ 
    logout();
    Cookies.remove("userName");
    Cookies.remove("validation_hash");
    navigate("/login");
  };
  const handleToggleSidebar = () => { /* ... (sem alterações) ... */ 
    setShowSidebar(!showSidebar);
    setTimeout(() => { if (mapRef.current) { mapRef.current.invalidateSize(); }}, 300);
  };
  const handleTempFiltroChange = (categoria) => { /* ... (sem alterações) ... */ 
    setTempFiltrosMapa(prev => ({...prev, [categoria]: !prev[categoria] }));
  };
  const confirmarFiltros = () => { /* ... (sem alterações) ... */ 
    setFiltrosMapa({ ...tempFiltrosMapa });
  };

  if (loadingAuth || isLoadingPageData) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-700">Carregando dados da cidade...</p>
        </div>
    );
  }
  
  if (!cityDetails) {
      return (
          <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
              <h2 className="text-xl text-red-600 mb-4">Erro ao Carregar Dados</h2>
              <p className="text-gray-700 mb-4">Não foi possível carregar os detalhes da cidade. Por favor, tente novamente.</p>
              <button 
                  onClick={() => navigate("/")}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                  Voltar para a Página Inicial
              </button>
          </div>
      );
  }

  const isValidCoordinates = cityDetails.coordenadas && 
                           Array.isArray(cityDetails.coordenadas) && 
                           cityDetails.coordenadas.length === 2 &&
                          !isNaN(parseFloat(cityDetails.coordenadas[0])) &&
                        !isNaN(parseFloat(cityDetails.coordenadas[1]));

  return (

    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar 
        activeItem={categoriaSelecionada} 
        setActiveItem={setCategoriaSelecionada}
        className={`${showSidebar ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static z-40`}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${showSidebar && window.innerWidth < 768 ? "ml-64" : "ml-0"} md:ml-0`}>
        <header className="bg-white bg-opacity-90 shadow-sm py-3 px-6 flex justify-between items-center sticky top-0 z-30 backdrop-blur-sm">
          <div className="flex items-center space-x-4 min-w-0">
            <button 
              onClick={handleToggleSidebar}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate" title={cityDetails.name}>
                {cityDetails.name || "Gerenciar Cidade"}
            </h1>
          </div>
          
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
                  <p className="text-xs text-gray-500 truncate">{Cookies.get("validation_hash") || "Hash de validação"}</p>
                </div>
                <div className="py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Dados da Conta</span>
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
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-700 mb-3">Informações</h2>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium text-gray-700">Nome:</span> {cityDetails.name}</p>
                    <p><span className="font-medium text-gray-700">Cidade:</span> {cityDetails.city}</p>
                    <p><span className="font-medium text-gray-700">Estado:</span> {cityDetails.state}</p>
                    <p><span className="font-medium text-gray-700">ID:</span> {cityDetails.id}</p>
                    {userCargo && Object.values(userCargo).length > 0 && (
                        <p><span className="font-medium text-gray-700">Cargo:</span> {Object.values(userCargo).join(", ")}</p>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-700 mb-3">Filtros do Mapa</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mb-3">
                    {Object.entries(tempFiltrosMapa).map(([categoria, ativo]) => (
                      <label key={categoria} className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={ativo}
                          onChange={() => handleTempFiltroChange(categoria)}
                          className="form-checkbox h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="capitalize text-sm text-gray-700">{categoria.replace("_", " ")}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={confirmarFiltros}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow hover:shadow-md text-sm font-medium"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
              
              <section className="mb-6">
                <div className="h-96 md:h-[500px] w-full rounded-xl overflow-hidden shadow-xl border-gray-200">
                  {isValidCoordinates ? (
                    <MapContainer
                      center={cityDetails.coordenadas}
                      zoom={15}
                      scrollWheelZoom={true}
                      style={{ height: "100%", width: "100%" }}
                      whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <MapViewControl center={cityDetails.coordenadas} zoom={15} />
                      <Marker position={cityDetails.coordenadas} icon={customIcon}>
                        <Popup>{cityDetails.name}, {cityDetails.city}</Popup>
                      </Marker>

                      {Object.entries(filtrosMapa).map(([categoria, ativo]) =>
                        ativo && cityDetails.pontos?.[categoria]?.map((ponto, index) => (
                          (Array.isArray(ponto) && ponto.length === 2 && !isNaN(ponto[0]) && !isNaN(ponto[1])) && 
                            <Marker key={`${categoria}-${ponto[0]}-${ponto[1]}-${index}`} position={ponto} icon={customIcon}>
                              <Popup>{categoria.replace("_", " ")} - Ponto {index + 1}</Popup>
                            </Marker>
                        ))
                      )}
                    </MapContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <p className="text-gray-600">Coordenadas da cidade não disponíveis ou inválidas para exibir o mapa.</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Estatísticas Gerais</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(filtrosMapa).map(([categoria, ativo]) => (
                    ativo && (
                      <div 
                        key={categoria} 
                        className={`p-4 rounded-lg shadow ${
                          categoria === "iluminacao" ? "bg-yellow-100 text-yellow-700" :
                          categoria === "drenagem" ? "bg-blue-100 text-blue-700" :
                          categoria === "lixo" ? "bg-green-100 text-green-700" :
                          "bg-purple-100 text-purple-700"
                        }`}
                      >
                        <p className="text-sm capitalize font-medium">{categoria.replace("_", " ")}</p>
                        <p className="font-bold text-2xl">{cityDetails.pontos?.[categoria]?.length || 0}</p>
                      </div>
                    )
                  ))}
                </div>
              </section>

              {categoriaSelecionada && (
                <section className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">
                      Pontos de {categoriaSelecionada.replace("_", " ")} ({pontosFiltrados.length})
                    </h2>
                    {filtrosMapa[categoriaSelecionada] === false && (
                      <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">(Filtro desativado)</span>
                    )}
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pontosFiltrados.length > 0 ? (
                      pontosFiltrados.map((ponto, index) => (
                        (Array.isArray(ponto) && ponto.length === 2 && !isNaN(ponto[0]) && !isNaN(ponto[1])) && 
                          <div key={`${categoriaSelecionada}-ponto-${ponto[0]}-${ponto[1]}-${index}`} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <p className="font-medium text-gray-800">Ponto {index + 1}</p>
                            <p className="text-sm text-gray-600">Coordenadas: {ponto.join(", ")}</p>
                          </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        {filtrosMapa[categoriaSelecionada] 
                          ? "Nenhum ponto cadastrado nesta categoria." 
                          : "Categoria filtrada - ative o filtro para visualizar os pontos."}
                      </p>
                    )}
                  </div>
                </section>
              )}
            </>
        </main>
      </div>
    </div>
  );
};

export default GerenciarCidadesComponent;