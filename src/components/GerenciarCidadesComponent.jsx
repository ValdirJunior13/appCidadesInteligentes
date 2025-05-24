import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Removi imports do Leaflet e MapContainer para focar na lógica,
// mas você os manterá se for usar o mapa.
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
import { useAuth } from '../context/AuthContext';
import Cookies from "js-cookie";
// import Sidebar from "./Sidebar"; // Mantenha se estiver usando

// Se você não estiver usando o mapa nesta parte específica do código, pode comentar
// as configurações do ícone do Leaflet e o MapViewControl.

const GerenciarCidadesComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuarioLogado, logout, loadingAuth } = useAuth();
  
  const cityIdFromRouteOrSession = location.state?.city?.id || location.state?.cityId || sessionStorage.getItem('currentCityId');

  const [citySelecionada, setCitySelecionada] = useState(null); // Começa como null até carregar
  const [cargoUsuario, setCargoUsuario] = useState(null);
  const [userRole, setUserRole] = useState(null); // Pode ser o mesmo que cargoUsuario
  const [loading, setLoading] = useState(true); // Começa carregando
  
  // Seus outros estados (categoriaSelecionada, pontosFiltrados, etc. são mantidos)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [pontosFiltrados, setPontosFiltrados] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const mapRef = useRef(null); // Para o mapa
  const [tempFiltrosMapa, setTempFiltrosMapa] = useState({
    iluminacao: true, irrigacao: true, drenagem: true, lixo: true
  });
  const [filtrosMapa, setFiltrosMapa] = useState({ ...tempFiltrosMapa });


  const buscarDetalhesCidade = async (idDaCidade) => {
    if (!idDaCidade) {
      console.error("buscarDetalhesCidade: ID da cidade é nulo ou indefinido.");
      return null;
    }

    // setLoading(true); // O loading já é controlado pelo useEffect que chama esta função
    const userNameActual = Cookies.get("userName");
    const validationHashActual = Cookies.get("validation_hash");

    console.log("--- Iniciando buscarDetalhesCidade ---");
    console.log("ID da Cidade para buscar:", idDaCidade);
    console.log("Cookie 'userName':", userNameActual);
    console.log("Cookie 'validation_hash' (para validation_token):", validationHashActual);

    if (!userNameActual || !validationHashActual) {
      alert("Erro: Credenciais de usuário não encontradas. Faça login novamente.");
      return null;
    }

    const fixedPathWithPlaceholders = `http://56.125.35.215:8000/city/get-data/{city_id}/{owner_or_manager_user_name}/{validation_token}`;
    const apiUrlObject = new URL(fixedPathWithPlaceholders);
    apiUrlObject.searchParams.append('city_id', idDaCidade.toString());
    apiUrlObject.searchParams.append('user_name', userNameActual);
    apiUrlObject.searchParams.append('validation_token', validationHashActual);
    const apiUrlString = apiUrlObject.toString();

    console.log("URL da API (buscarDetalhesCidade):", apiUrlString);

    try {
      const response = await fetch(apiUrlString, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      console.log("Status API (buscarDetalhesCidade):", response.status, response.statusText);

      if (!response.ok) {
        let errorDetailMessage = `Erro HTTP ${response.status} (${response.statusText})`;
        try {
          const errorData = await response.json();
          errorDetailMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          try {
            const textError = await response.text();
            if (textError) errorDetailMessage += ` - ${textError}`;
          } catch (textE) { /* ignora */ }
        }
        console.error("Erro API (buscarDetalhesCidade):", errorDetailMessage);
        throw new Error(errorDetailMessage);
      }

      const dadosRecebidos = await response.json();
      console.log("Dados brutos API (buscarDetalhesCidade):", JSON.stringify(dadosRecebidos, null, 2));

      // CORREÇÃO DA EXTRAÇÃO: Espera-se {"cidade": { id: ..., name: ..., estado: ..., cidade: ... }}
      const detalhesDaCidadeExtraidos = dadosRecebidos?.cidade; 

      if (detalhesDaCidadeExtraidos && typeof detalhesDaCidadeExtraidos.id !== 'undefined') {
        console.log("Detalhes da cidade extraídos com sucesso:", detalhesDaCidadeExtraidos);

        const idParaArmazenar = detalhesDaCidadeExtraidos.id.toString();
        const cargoParaArmazenar = detalhesDaCidadeExtraidos.cargo || null;

        // Armazenar na sessionStorage com nomes claros
        sessionStorage.setItem('currentCityId', idParaArmazenar);
        console.log(`ID da cidade (${idParaArmazenar}) armazenado na sessionStorage como 'currentCityId'.`);
        
        if (cargoParaArmazenar) {
          sessionStorage.setItem('currentCityCargo', cargoParaArmazenar);
          console.log(`Cargo (${cargoParaArmazenar}) armazenado na sessionStorage como 'currentCityCargo'.`);
        } else {
          sessionStorage.removeItem('currentCityCargo');
          console.log("Nenhum cargo encontrado nos detalhes da cidade para armazenar.");
        }
        
        // Mapear campos do backend para o formato esperado pelo estado 'citySelecionada'
        const cidadeMapeada = {
          id: detalhesDaCidadeExtraidos.id,
          name: detalhesDaCidadeExtraidos.name,     // Backend 'name' -> Frontend 'name'
          city: detalhesDaCidadeExtraidos.cidade,  // Backend 'cidade' -> Frontend 'city'
          state: detalhesDaCidadeExtraidos.estado, // Backend 'estado' -> Frontend 'state'
          cargo: detalhesDaCidadeExtraidos.cargo,  // Se 'cargo' existir
          coordenadas: location.state?.city?.coordenadas || [0,0], // Mantém coordenadas do estado anterior ou padrão
          pontos: location.state?.city?.pontos || { iluminacao: [], irrigacao: [], drenagem: [], lixo: [] } // Mantém pontos do estado anterior ou padrão
        };
        return cidadeMapeada; 
      } else {
        console.warn("Resposta da API não continha 'cidade.id' válido. Resposta:", dadosRecebidos);
        sessionStorage.removeItem('currentCityId');
        sessionStorage.removeItem('currentCityCargo');
        return null;
      }
    } catch (error) {
      console.error("ERRO em buscarDetalhesCidade:", error.message, error);
      alert(`Erro ao buscar detalhes da cidade: ${error.message}`);
      sessionStorage.removeItem('currentCityId');
      sessionStorage.removeItem('currentCityCargo');
      return null;
    } 
    // finally {
    //   setLoading(false); // O loading é controlado pelo useEffect que chama esta função
    // }
  };

  // Função para verificar cargo (você já a tinha, pode ser chamada se necessário)
  const verificarCargo = async (currentCityId) => {
    if (!currentCityId) {
        console.warn("verificarCargo: currentCityId não disponível para verificar cargo.");
        setCargoUsuario(null); // Limpa o cargo se não houver ID
        setUserRole(null);
        return;
    }
    const userName = Cookies.get("userName");
    const validationToken = Cookies.get("validation_hash");

    if (!userName || !validationToken) {
        console.warn("verificarCargo: Credenciais não encontradas para verificar cargo.");
        setCargoUsuario(null);
        setUserRole(null);
        return;
    }
    
    console.log("Verificando cargo para cityId:", currentCityId, "User:", userName);
    try {
      const response = await fetch(
        `http://56.125.35.215:8000/user/check-ownership?city_id=${currentCityId}&user_name=${userName}&validation_token=${validationToken}`
      );
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({detail: `HTTP error ${response.status}`}));
          throw new Error(errorData.detail || `Erro ao verificar cargo: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Cargo retornado por verificarCargo:", data.cargo);
      setCargoUsuario(data.cargo); 
      setUserRole(data.cargo);
    } catch (error) {
      console.error("Erro ao verificar cargo:", error);
      setCargoUsuario(null);
      setUserRole(null);
      // alert(`Não foi possível verificar seu cargo na cidade: ${error.message}`); // Pode ser muito intrusivo
    }
  };


  useEffect(() => {
    if (loadingAuth) { // Se autenticação ainda está carregando, não faz nada
      return;
    }
    if (!usuarioLogado) { // Se não estiver logado (após auth carregar)
      navigate("/login");
      return;
    }

    // Se logado, tenta obter o cityId
    const currentCityId = cityIdFromRouteOrSession; // Usando a variável definida no topo
    console.log("useEffect principal - currentCityId:", currentCityId, "Usuário Logado:", usuarioLogado);

    if (currentCityId) {
      setLoading(true);
      (async () => {
        const detalhesDaCidade = await buscarDetalhesCidade(currentCityId);
        if (detalhesDaCidade) {
          setCitySelecionada(prev => ({
            ...(prev || {}), // Mantém dados anteriores se existirem (como 'pontos')
            ...detalhesDaCidade, // Sobrescreve com os novos detalhes mapeados
            // Garante que 'pontos' e 'coordenadas' tenham uma estrutura válida se não vierem da API
            pontos: detalhesDaCidade.pontos || prev?.pontos || { iluminacao: [], irrigacao: [], drenagem: [], lixo: [] },
            coordenadas: detalhesDaCidade.coordenadas || prev?.coordenadas || [0,0]
          }));
          // O cargo já deve ter sido setado dentro de buscarDetalhesCidade ou será setado por verificarCargo
          if (detalhesDaCidade.cargo) {
            setCargoUsuario(detalhesDaCidade.cargo);
            setUserRole(detalhesDaCidade.cargo);
          } else {
            // Se a API de detalhes não retorna o cargo, ou se você quer uma verificação separada/adicional:
            console.log("Cargo não veio em buscarDetalhesCidade, chamando verificarCargo.");
            await verificarCargo(currentCityId);
          }
        } else {
          console.error("useEffect: Falha ao obter detalhes da cidade. ID da cidade pode ser inválido ou API falhou.");
          alert("Não foi possível carregar os dados da cidade selecionada.");
          // Considere limpar citySelecionada ou navegar para uma página de erro/seleção
           setCitySelecionada(null); // Limpa se não conseguir carregar
           navigate("/"); // Exemplo: volta para a home se não conseguir carregar a cidade
        }
        setLoading(false);
      })();
    } else if (!loadingAuth && usuarioLogado) { // Só navega se auth carregou, está logado mas não tem cityId
      console.warn("Usuário logado, mas sem cityId definido. Navegando para a página inicial.");
      navigate("/"); 
    }
  }, [cityIdFromRouteOrSession, usuarioLogado, loadingAuth, navigate]);


  // Seu useEffect para pontosFiltrados (mantido)
  useEffect(() => {
    if (citySelecionada && categoriaSelecionada) {
      setPontosFiltrados(citySelecionada.pontos?.[categoriaSelecionada] || []);
    } else {
      setPontosFiltrados([]);
    }
  }, [categoriaSelecionada, citySelecionada]);

  // Seus outros manipuladores (handleLogoutClick, etc.) permanecem aqui...
  const handleLogoutClick = () => {
    logout();
    sessionStorage.removeItem('currentCityId');
    sessionStorage.removeItem('currentCityCargo');
    navigate("/login");
  };

  const handleToggleSidebar = () => setShowSidebar(!showSidebar);

  const handleTempFiltroChange = (categoria) => { 
    setTempFiltrosMapa(prev => ({ ...prev, [categoria]: !prev[categoria] }));
  };

  const confirmarFiltros = () => setFiltrosMapa({ ...tempFiltrosMapa });
  

  // Lógica de renderização condicional antes do return JSX
  if (loadingAuth || loading) { // Mostra carregando se auth ou dados da cidade estiverem carregando
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  if (!usuarioLogado) {
    // O useEffect já deve ter redirecionado, mas como uma defesa extra
    return null;
  }

  return (

    
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeItem={categoriaSelecionada} 
        className={`${showSidebar ? "block" : "hidden md:block"}`}
      />

      
      
      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleToggleSidebar}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{citySelecionada.name}</h1>
          </div>
          
          {/* Menu do Usuário */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                {Cookies.get("userName")?.charAt(0).toUpperCase() || "U"}
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                <button
                  onClick={handleLogoutClick}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Sair da Conta
                </button>
              </div>
            )}
          </div>
        </header>
  
        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Seção Superior - Informações e Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Informações da Cidade */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Informações da cidade</h2>
              <div className="space-y-2">
                <p className="font-semibold">Cond. {citySelecionada.name}</p>
                <p>{citySelecionada.city}, {citySelecionada.state}</p>
              </div>
            </div>
  
            {/* Configurações do Mapa */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Configurações do mapa</h2>
              <p className="text-sm mb-2">Filtrar dispositivos:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(tempFiltrosMapa).map(([categoria, ativo]) => (
                  <label key={categoria} className="flex items-center space-x-2">
                    <input 
                      type="checkbox"
                      checked={ativo}
                      onChange={() => handleTempFiltroChange(categoria)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="capitalize text-sm">{categoria}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={confirmarFiltros}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Confirmar filtros
              </button>
            </div>
          </div>
  
          {/* Mapa */}
          <section className="mb-8">
            <div className="h-96 w-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <MapContainer
                center={citySelecionada.coordenadas}
                zoom={15}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
                whenCreated={(map) => {
                  mapRef.current = map;
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
  
                <MapViewControl center={citySelecionada.coordenadas} zoom={15} />
  
                <Marker position={citySelecionada.coordenadas} icon={customIcon}>
                  <Popup>
                    {citySelecionada.name}, {citySelecionada.city}
                  </Popup>
                </Marker>
  
                {Object.entries(filtrosMapa).map(([categoria, ativo]) => (
                  ativo && citySelecionada.pontos?.[categoria]?.map((ponto, index) => (
                    <Marker key={`${categoria}-${index}`} position={ponto} icon={customIcon}>
                      <Popup>
                        {categoria} - Ponto {index + 1}
                      </Popup>
                    </Marker>
                  ))
                ))}
              </MapContainer>
            </div>
          </section>
  
          {/* Estatísticas */}
          <section className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Estatísticas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(filtrosMapa).map(([categoria, ativo]) => (
                ativo && (
                  <div 
                    key={categoria} 
                    className={`p-4 rounded-lg ${
                      categoria === "iluminacao" ? "bg-blue-50 text-blue-600" :
                      categoria === "drenagem" ? "bg-green-50 text-green-600" :
                      categoria === "lixo" ? "bg-yellow-50 text-yellow-600" :
                      "bg-purple-50 text-purple-600"
                    }`}
                  >
                    <p className="text-sm capitalize">{categoria}</p>
                    <p className="font-bold text-2xl">
                      {citySelecionada.pontos?.[categoria]?.length || 0}
                    </p>
                  </div>
                )
              ))}
            </div>
          </section>
  
          {/* Lista de Pontos da Categoria Selecionada */}
          {categoriaSelecionada && (
            <section className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Pontos de {categoriaSelecionada} ({pontosFiltrados.length})
                </h2>
                {filtrosMapa[categoriaSelecionada] === false && (
                  <span className="text-sm text-red-500">(Filtro desativado)</span>
                )}
              </div>
              
              <div className="space-y-3">
                {pontosFiltrados.length > 0 ? (
                  pontosFiltrados.map((ponto, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <p className="font-medium">Ponto {index + 1}</p>
                      <p className="text-sm text-gray-500">Coordenadas: {ponto.join(", ")}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    {filtrosMapa[categoriaSelecionada] 
                      ? "Nenhum ponto cadastrado nesta categoria" 
                      : "Categoria filtrada - ative o filtro para visualizar"}
                  </p>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default GerenciarCidadesComponent;