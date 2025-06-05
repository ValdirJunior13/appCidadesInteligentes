import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from '../context/AuthContext';
import Cookies from "js-cookie";
import Sidebar from "./Sidebar";
import PropTypes from 'prop-types';

// Correção do ícone padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Ícone personalizado (opcional, pode usar o Default após a correção acima)
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Componente para controlar a visão do mapa (centro, zoom, limites)
const MapViewControl = ({ center, zoom, bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length === 2 && bounds[0] && bounds[1] &&
        checkCoordinatesValidity(bounds[0]) && checkCoordinatesValidity(bounds[1])) { // Validação dos bounds
      try {
        map.flyToBounds(bounds, { padding: [50, 50] }); // Adiciona padding
      } catch (e) {
        console.error("Erro ao tentar map.flyToBounds:", e, bounds);
        if (center && checkCoordinatesValidity(center)) {
          map.flyTo(center, zoom || 12);
        }
      }
    } else if (center && checkCoordinatesValidity(center)) {
      map.flyTo(center, zoom || 12);
    }
  }, [center, zoom, bounds, map]);

  return null;
};

MapViewControl.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
  bounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
};

// Função auxiliar para verificar coordenadas (movida para fora para ser usada por MapViewControl também)
const checkCoordinatesValidity = (coords) => {
  return coords &&
    Array.isArray(coords) &&
    coords.length === 2 &&
    !isNaN(parseFloat(coords[0])) &&
    !isNaN(parseFloat(coords[1]));
};

const GerenciarCidadesComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuarioLogado, logout, loadingAuth } = useAuth();

  const [cityDetails, setCityDetails] = useState(null);
  const [userCargo, setUserCargo] = useState(null);
  const [cityDevices, setCityDevices] = useState({});
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const initialLoadAttemptedRef = useRef(false);

  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [pontosFiltrados, setPontosFiltrados] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const mapRef = useRef(null);

  const [tempFiltrosMapa, setTempFiltrosMapa] = useState({
    iluminacao: true, irrigacao: true, drenagem: true, lixo: true
  });

  const [filtrosMapa, setFiltrosMapa] = useState({ ...tempFiltrosMapa });

  const [mapViewSettings, setMapViewSettings] = useState({
    key: Date.now(),
    center: null, 
    zoom: 4,      
    bounds: null,
  });

  const fetchCityDataById = async (cityId) => {
    // setIsLoadingPageData(true) é chamado antes desta função
    try {
      const currentUserName = Cookies.get("userName");
      const validationHash = Cookies.get("validation_hash");

      if (!currentUserName || !validationHash) {
        alert("Sessão inválida. Faça login novamente.");
        navigate("/login");
        return;
      }

      // ATENÇÃO: Verifique se os placeholders na URL devem ser substituídos ou se é apenas parte da query
      // Exemplo: /city/get-data/${cityId}/${currentUserName}/${validationHash} OU /city/get-data/?city_id=...
      const apiUrl = `http://56.125.35.215:8000/city/get-data/<city_id>/<owner_or_manager_user_name>/<validation_token>?city_id=${cityId}&user_name=${currentUserName}&validation_token=${validationHash}`;
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (!response.ok) {
        let errorBodyText = await response.text();
        try {
          const errorJson = JSON.parse(errorBodyText);
          errorBodyText = errorJson.message || errorJson.detail || JSON.stringify(errorJson);
        } catch (e) { /* Mantém errorBodyText como texto se não for JSON */ }
        throw new Error(`Falha ao buscar dados da cidade: ${errorBodyText} (Status: ${response.status})`);
      }
      
      const data = await response.json();
      console.log("Dados COMPLETOS da API (fetchCityDataById):", JSON.stringify(data, null, 2));

      if (data && data.cidade) {
        setCityDetails(data.cidade);
        setUserCargo(data.cargo);
        setCityDevices(data.dispositivos || {}); // Popula cityDevices
      } else {
        throw new Error("Formato de dados da cidade inválido recebido da API.");
      }
    } catch (error) {
      console.error("Erro em fetchCityDataById:", error);
      alert(error.message || "Erro ao buscar dados da cidade.");
      navigate("/paginaLogin"); // Ou para a página de seleção de cidades
    } finally {
      setIsLoadingPageData(false);
    }
  };

  // useEffect principal para carregar dados da cidade
  useEffect(() => {
    if (loadingAuth) {
      setIsLoadingPageData(true);
      return;
    }
    if (!usuarioLogado) {
      navigate("/login");
      setIsLoadingPageData(false);
      return;
    }

    if (initialLoadAttemptedRef.current && !location.state?.detailedData) {
      if (cityDetails && isLoadingPageData) {
        setIsLoadingPageData(false);
      }
      return;
    }
    
    const initialDetailedDataFromLocation = location.state?.detailedData;

    if (initialDetailedDataFromLocation && initialDetailedDataFromLocation.cidade) {
      console.log("Dados da cidade recebidos via location.state:", initialDetailedDataFromLocation);
      setCityDetails(initialDetailedDataFromLocation.cidade);
      setUserCargo(initialDetailedDataFromLocation.cargo);
      setCityDevices(initialDetailedDataFromLocation.dispositivos || {});
      setIsLoadingPageData(false);
      initialLoadAttemptedRef.current = true;
    } else {
      const cityIdFromSession = sessionStorage.getItem('currentCityId');
      if (cityIdFromSession) {
        initialLoadAttemptedRef.current = true;
        setIsLoadingPageData(true);
        fetchCityDataById(cityIdFromSession);
      } else {
        console.error("ID da cidade não encontrado para carregamento.");
        alert("Selecione uma cidade novamente.");
        navigate("/");
        setIsLoadingPageData(false);
        initialLoadAttemptedRef.current = true;
      }
    }
  }, [loadingAuth, usuarioLogado, navigate, location.state]);


  // useEffect para geocodificar a cidade/estado para o mapa
  useEffect(() => {
    // Define um mapViewSettings inicial baseado nas coordenadas da localidade, se disponíveis
    if (cityDetails && checkCoordinatesValidity(cityDetails.coordenadas) && !mapViewSettings.bounds) {
        if(!mapViewSettings.center || (mapViewSettings.center[0] !== parseFloat(cityDetails.coordenadas[0]))){ // Evita re-setar desnecessariamente
            setMapViewSettings(prev => ({
                ...prev,
                key: Date.now(),
                center: cityDetails.coordenadas.map(c => parseFloat(c)),
                zoom: 15, // Zoom padrão para localidade específica
            }));
        }
    }

    if (cityDetails && cityDetails.cidade && cityDetails.estado) {
      const geocodeCityAndSetView = async () => {
        console.log(`Iniciando geocodificação para: ${cityDetails.cidade}, ${cityDetails.estado}`);
        setIsLoadingPageData(true); // Indica que estamos processando algo para o mapa
        try {
          const query = `${cityDetails.cidade}, ${cityDetails.estado}, Brasil`;
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=br`;
          const response = await fetch(nominatimUrl);

          if (!response.ok) throw new Error(`Falha na API Nominatim: ${response.status}`);
          
          const geoDataArray = await response.json();

          if (geoDataArray && geoDataArray.length > 0) {
            const geoData = geoDataArray[0];
            const newCenter = [parseFloat(geoData.lat), parseFloat(geoData.lon)];
            let newBounds = null;

            if (geoData.boundingbox) {
              newBounds = [
                [parseFloat(geoData.boundingbox[0]), parseFloat(geoData.boundingbox[2])],
                [parseFloat(geoData.boundingbox[1]), parseFloat(geoData.boundingbox[3])]
              ];
            }
            console.log("Geocodificado! Centro:", newCenter, "Bounds:", newBounds);
            setMapViewSettings({
              key: Date.now(),
              center: newCenter,
              zoom: newBounds ? null : 10,
              bounds: newBounds,
            });
          } else {
            console.warn("Geocodificação não encontrou resultados para:", query, ". Usando coordenadas da localidade se disponíveis.");
            if (checkCoordinatesValidity(cityDetails.coordenadas)) {
              setMapViewSettings({
                key: Date.now(),
                center: cityDetails.coordenadas.map(c => parseFloat(c)),
                zoom: 13,
                bounds: null,
              });
            } else {
              // Se nem as coordenadas da localidade existirem, centraliza no Brasil
               setMapViewSettings({ key: Date.now(), center: [-14.2350, -51.9253], zoom: 4, bounds: null });
            }
          }
        } catch (error) {
          console.error("Erro durante a geocodificação:", error);
          if (checkCoordinatesValidity(cityDetails.coordenadas)) {
            setMapViewSettings({
              key: Date.now(),
              center: cityDetails.coordenadas.map(c => parseFloat(c)),
              zoom: 13,
              bounds: null,
            });
          } else {
             setMapViewSettings({ key: Date.now(), center: [-14.2350, -51.9253], zoom: 4, bounds: null });
          }
        } finally {
            setIsLoadingPageData(false); // Termina o loading após geocodificação
        }
      };
      geocodeCityAndSetView();
    } else if (cityDetails && checkCoordinatesValidity(cityDetails.coordenadas) && isLoadingPageData) {
        // Se não tem cidade/estado para geocodificar, mas tem coordenadas da localidade e está carregando, para o loading.
        setIsLoadingPageData(false);
    } else if (!cityDetails && isLoadingPageData) {
        // Se não tem cityDetails e está carregando, para o loading (ex: falha ao buscar cityDetails)
        // Isso é coberto pelo finally do fetchCityDataById, mas como defesa.
        setIsLoadingPageData(false);
    }
  }, [cityDetails]); // Re-executa se cityDetails mudar

  // useEffect para buscar pontos filtrados (já existente, com URL corrigida)
const buscarPontosFiltradosDaAPI = async (filtrosParaUsarNaAPI) => { // Novo parâmetro
  // Validação inicial para cityDetails e obtenção do cityIdValue
  let cityIdValue = cityDetails?.id;
  if (!cityIdValue) {
    const cityIdFromSession = sessionStorage.getItem('currentCityId');
    if (cityIdFromSession) {
      cityIdValue = cityIdFromSession;
    } else {
      console.warn("buscarPontosFiltradosDaAPI: ID da cidade não disponível.");
      alert("ID da cidade não encontrado. Não é possível buscar pontos.");
      setIsLoadingPageData(false);
      return;
    }
  }
  
  setIsLoadingPageData(true);

  const currentUserNameValue = Cookies.get("userName");
  const currentValidationHashValue = Cookies.get("validation_hash");

  if (!currentUserNameValue || !currentValidationHashValue) {
    alert("Sessão inválida. Faça login novamente.");
    setIsLoadingPageData(false);
    navigate("/login");
    return;
  }

  // Usa o argumento 'filtrosParaUsarNaAPI' se fornecido, senão usa o estado 'filtrosMapa'
  const listFilterObject = filtrosParaUsarNaAPI || filtrosMapa; 
  const listFilterStringValue = JSON.stringify(listFilterObject);

  if (listFilterStringValue === undefined) {
    console.error("Erro: Objeto de filtros resultou em listFilterStringValue indefinido. Objeto:", listFilterObject);
    alert("Erro ao preparar requisição de filtros: objeto de filtros inválido.");
    setIsLoadingPageData(false);
    return;
  }

  let apiUrlString;

  try {
    const encodedCityId = encodeURIComponent(cityIdValue);
    const encodedCurrentUserName = encodeURIComponent(currentUserNameValue);
    const encodedCurrentValidationHash = encodeURIComponent(currentValidationHashValue);
    const encodedListFilterString = encodeURIComponent(listFilterStringValue);

    apiUrlString = `http://56.125.35.215:8000/city/get-data/<city_id>/<owner_or_manager_user_name>/<validation_token>/<list-filter>?city_id=${encodeURIComponent(encodedCityId)}&user_name=${encodeURIComponent(encodedCurrentUserName)}&validation_token=${encodeURIComponent(encodedCurrentValidationHash)}&list_filter=${encodeURIComponent(encodedListFilterString)}`;

  } catch (error) {
    console.error("Erro ao construir URL para buscarPontosFiltrados:", error);
    alert("Erro ao preparar requisição de filtros. Verifique os dados de entrada.");
    setIsLoadingPageData(false);
    return;
  }

  // Adicionado log para ver o objeto de filtros que está sendo stringificado
  console.log("Objeto de filtros usado para a API:", listFilterObject);
  console.log("URL API (buscarPontosFiltradosDaAPI):", apiUrlString);

  try {
    const response = await fetch(apiUrlString, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      let errorBody = `Erro HTTP ${response.status} (${response.statusText})`;
      let errorDetail = null;
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
        errorBody = `Falha ao buscar pontos filtrados: ${errorDetail}`;
      } catch (e) {
        try {
          const rawText = await response.text();
          errorDetail = rawText || `Resposta não-JSON: ${response.statusText}`;
          errorBody = `Falha ao buscar pontos filtrados: ${errorDetail}`;
        } catch (textErr) { /* Mantém o errorBody original se tudo falhar */ }
      }
      console.error("Detalhe do erro da API:", errorDetail || "Não foi possível obter detalhes do erro da API.");
      throw new Error(errorBody);
    }

    const dadosFiltrados = await response.json();
    console.log("Dados brutos dos pontos filtrados recebidos:", JSON.stringify(dadosFiltrados, null, 2));
    setPontosFiltrados(Array.isArray(dadosFiltrados) ? dadosFiltrados : []);

  } catch (error) {
    console.error("Erro em buscarPontosFiltradosDaAPI:", error.message);
    alert(`Erro na comunicação com o servidor: ${error.message}`);
    setPontosFiltrados([]);
  } finally {
    setIsLoadingPageData(false);
  }
};

  
  // useEffect para filtrar pontos localmente (já existente)
  useEffect(() => {
    if (cityDetails && cityDetails.pontos && categoriaSelecionada) {
      setPontosFiltrados(cityDetails.pontos[categoriaSelecionada] || []);
    } else if (cityDetails && !cityDetails.pontos && categoriaSelecionada) {
      setPontosFiltrados([]);
    }
  }, [categoriaSelecionada, cityDetails]);

  const handleLogoutClick = () => {
    logout(); Cookies.remove("userName"); Cookies.remove("validation_hash"); navigate("/login");
  };
  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
    setTimeout(() => { if (mapRef.current) { mapRef.current.invalidateSize(); }}, 300);
  };
  const handleTempFiltroChange = (categoria) => {
    setTempFiltrosMapa(prev => ({...prev, [categoria]: !prev[categoria] }));
  };
const confirmarFiltros = () => {
  const filtrosAtuais = { ...tempFiltrosMapa }; // Captura o estado atual de tempFiltrosMapa
  setFiltrosMapa(filtrosAtuais); // Atualiza o estado principal 'filtrosMapa' (para UI e consistência)
  buscarPontosFiltradosDaAPI(filtrosAtuais); // Passa os filtros atuais diretamente para a função da API
};

  // Lógica de Renderização Condicional
  if (loadingAuth) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div><p className="ml-3">Carregando autenticação...</p></div>;
  }
  if (isLoadingPageData && !cityDetails) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div><p className="ml-3">Carregando dados da cidade...</p></div>;
  }
  if (!cityDetails && !isLoadingPageData) {
    return <div className="flex flex-col justify-center items-center min-h-screen"><h2 className="text-xl text-red-600">Erro ao Carregar Dados</h2><p>Não foi possível carregar os detalhes. Tente novamente.</p><button onClick={() => navigate("/")} className="px-4 py-2 bg-blue-500 text-white rounded">Voltar</button></div>;
  }
  if (cityDetails && isLoadingPageData) {
     return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div><p className="ml-3">Ajustando visualização do mapa...</p></div>;
  }


  const initialMapCenter = mapViewSettings.center || (cityDetails?.coordenadas && checkCoordinatesValidity(cityDetails.coordenadas) ? cityDetails.coordenadas.map(c=>parseFloat(c)) : [-14.2350, -51.9253]);
  const initialMapZoom = mapViewSettings.zoom || (cityDetails?.coordenadas && checkCoordinatesValidity(cityDetails.coordenadas) ? 15 : 4);
  const cityCoordinatesAreValid = checkCoordinatesValidity(cityDetails?.coordenadas);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar 
        activeItem={categoriaSelecionada} 
        setActiveItem={setCategoriaSelecionada}
        className={`${showSidebar ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static z-40`}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${showSidebar && typeof window !== 'undefined' && window.innerWidth < 768 ? "ml-64" : "ml-0"} md:ml-0`}>
        <header className="bg-white bg-opacity-90 shadow-sm py-3 px-6 flex justify-between items-center sticky top-0 z-30 backdrop-blur-sm">
          <div className="flex items-center space-x-4 min-w-0">
            <button onClick={handleToggleSidebar} className="text-gray-600 hover:text-gray-800 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate" title={cityDetails?.name}>
              {cityDetails?.name || "Gerenciar Cidade"}
            </h1>
          </div>
          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 focus:outline-none group" aria-label="Menu do usuário">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-medium shadow-md group-hover:shadow-lg transition-all">
                {Cookies.get("userName")?.charAt(0).toUpperCase() || "U"}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform ${showUserMenu ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 divide-y divide-gray-100">
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{Cookies.get("userName") || "Usuário"}</p>
                </div>
                <div className="py-1"><button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span>Dados da Conta</span></button></div>
                <div className="py-1"><button onClick={handleLogoutClick} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg><span>Sair</span></button></div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-blue-50">
          {cityDetails && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-700 mb-3">Informações</h2>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium text-gray-700">Nome:</span> {cityDetails.name}</p>
                    <p><span className="font-medium text-gray-700">Cidade:</span> {cityDetails.cidade}</p>
                    <p><span className="font-medium text-gray-700">Estado:</span> {cityDetails.estado}</p>
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
                        <input type="checkbox" checked={ativo} onChange={() => handleTempFiltroChange(categoria)} className="form-checkbox h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"/>
                        <span className="capitalize text-sm text-gray-700">{categoria.replace("_", " ")}</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={confirmarFiltros} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow hover:shadow-md text-sm font-medium">
                    Aplicar Filtros
                  </button>
                </div>
              </div>
              
              <section className="mb-6">
                <div className="h-96 md:h-[500px] w-full rounded-xl overflow-hidden shadow-xl border-gray-200">
                  {mapViewSettings.center ? (
                    <MapContainer
                      key={mapViewSettings.key}
                      center={initialMapCenter}
                      zoom={initialMapZoom}
                      scrollWheelZoom={true}
                      style={{ height: "100%", width: "100%" }}
                      whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'/>
                      <MapViewControl center={mapViewSettings.center} zoom={mapViewSettings.zoom} bounds={mapViewSettings.bounds}/>
                      
                      {cityCoordinatesAreValid && (
                        <Marker 
                        position={cityDetails.coordenadas.map(c => parseFloat(c))} 
                        icon={customIcon}
                        >
                        <Popup>{cityDetails.name} ({cityDetails.cidade}, {cityDetails.estado})</Popup>
                        </Marker>
                      )}

                      {Object.entries(filtrosMapa).map(([categoria, ativo]) =>
                        ativo && pontosFiltrados?.map((ponto, index) => (
                          checkCoordinatesValidity(ponto) && 
                            <Marker key={`${categoria}-${ponto[0]}-${ponto[1]}-${index}`} position={ponto} icon={customIcon}>
                              <Popup>{categoria.replace("_", " ")} - Ponto {index + 1}</Popup>
                            </Marker>
                        ))
                      )}

                      {/* NOVO: Marcadores para cityDevices */}
                      {cityDevices && Object.entries(cityDevices).map(([deviceName, deviceData]) => {
                        if (deviceData && typeof deviceData.lat === 'number' && typeof deviceData.long === 'number' &&
                            checkCoordinatesValidity([deviceData.lat, deviceData.long])) {
                          return (
                            <Marker
                              key={deviceData.mac_adress || deviceName} // Usar mac_adress como chave prioritária
                              position={[deviceData.lat, deviceData.long]}
                              icon={customIcon} 
                            >
                              <Popup>
                                <b>Dispositivo:</b> {deviceName.replace("dipositivo", "Dispositivo ")}<br /> 
                                <b>MAC Address:</b> {deviceData.mac_adress}<br />
                                <b>Latitude:</b> {deviceData.lat}<br />
                                <b>Longitude:</b> {deviceData.long}<br />
                                {deviceData.tipo_sistema && <><b>Tipo:</b> {deviceData.tipo_sistema}<br /></>}
                                {deviceData.bairro && <><b>Bairro:</b> {deviceData.bairro}<br /></>}
                                {deviceData.rua && <><b>Rua:</b> {deviceData.rua}</>}
                              </Popup>
                            </Marker>
                          );
                        }
                        return null;
                      })}
                    </MapContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200"><p className="text-gray-600">Coordenadas da cidade não disponíveis para exibir o mapa.</p></div>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Estatísticas Gerais</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(filtrosMapa).map(([categoria, ativo]) => (
                    ativo && (
                      <div key={categoria} className={`p-4 rounded-lg shadow ${categoria === "iluminacao" ? "bg-yellow-100 text-yellow-700" : categoria === "drenagem" ? "bg-blue-100 text-blue-700" : categoria === "lixo" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                        <p className="text-sm capitalize font-medium">{categoria.replace("_", " ")}</p>
                        <p className="font-bold text-2xl">{pontosFiltrados?.filter(p => checkCoordinatesValidity(p))?.length || 0}</p>
                      </div>
                    )
                  ))}
                </div>
              </section>

              {categoriaSelecionada && (
                <section className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Pontos de {categoriaSelecionada.replace("_", " ")} ({pontosFiltrados?.filter(p => checkCoordinatesValidity(p))?.length || 0})</h2>
                    {filtrosMapa[categoriaSelecionada] === false && (<span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">(Filtro desativado)</span>)}
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pontosFiltrados?.filter(p => checkCoordinatesValidity(p)).length > 0 ? (
                      pontosFiltrados.filter(p => checkCoordinatesValidity(p)).map((ponto, index) => (
                        <div key={`${categoriaSelecionada}-ponto-${ponto[0]}-${ponto[1]}-${index}`} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-gray-800">Ponto {index + 1}</p>
                          <p className="text-sm text-gray-600">Coordenadas: {ponto.join(", ")}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">{filtrosMapa[categoriaSelecionada] ? "Nenhum ponto cadastrado ou visível nesta categoria." : "Categoria filtrada."}</p>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default GerenciarCidadesComponent;