import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import Cookies from "js-cookie";
import Quadrado from "../components/Quadrado"; 

const PaginaLoginComponent = () => {
  const navigate = useNavigate();
  const { usuarioLogado, logout, loadingAuth } = useAuth();


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
  const [invitations, setInvitations] = useState([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true); 
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [citySearchTerm, setCitySearchTerm] = useState("");

  const [userInfoData, setUserInfoData] = useState(null);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [allAvailableStates, setAllAvailableStates] = useState([]); 
  const [citiesForSelectedState, setCitiesForSelectedState] = useState([]); 
  const [loadingStates, setLoadingStates] = useState(false); 
  const [loadingCities, setLoadingCities] = useState(false); 
  
  const [addInvitation, setAddInvitation] = useState({
    user_name: Cookies.get("userName") || "",
    validation_hash: Cookies.get("validation_hash") || "",
    city_id: sessionStorage.getItem('currentCityId'),
    decision: true,
    role: "",
  });

const prepararRespostaConvite = (conviteEspecifico, valorDecisao) => {
  const payload = {
    user_name: Cookies.get("userName") || "",
    validation_hash: Cookies.get("validation_hash") || "",
    city_id: conviteEspecifico.city_id, 
    decision: valorDecisao, 
    role: conviteEspecifico.role,
  };

  const submitInvitationAnswer = async () => {
    if (
      payload.user_name &&
      payload.validation_hash &&
      (payload.city_id !== null && payload.city_id !== undefined) &&
      typeof payload.decision === 'boolean' &&
      payload.role
    ) {
      setLoading(true); 
      try {
        const response = await fetch("http://56.125.35.215:8000/user/manager/submit-invitation-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          let serverErrorMessage = "Erro ao enviar resposta de convite no servidor";
          try {
            const errorData = await response.json();
            serverErrorMessage = errorData.message || errorData.detail || JSON.stringify(errorData);
          } catch (e) {
            serverErrorMessage = `Erro ${response.status}: ${response.statusText}`;
          }
          throw new Error(serverErrorMessage);
        }

        alert(`Resposta ao convite (${payload.decision ? 'Aceito' : 'Rejeitado'}) enviada com sucesso!`);
        getInvitations(); 
      } catch (error) {
        console.error("Erro ao enviar resposta de convite:", error);
        alert(`Erro ao enviar resposta de convite: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Dados do convite estão incompletos ou inválidos para enviar a resposta.");
      console.warn("Tentativa de submeter payload incompleto para convite:", payload);
    }
  };
  submitInvitationAnswer();
};

  const getInvitations = async () => {
    const currentUserName = Cookies.get("userName");
    const currentValidationHash = Cookies.get("validation_hash");

    if (!currentUserName || !currentValidationHash) { return; }
    setLoading(true);
    try {
      const response = await fetch(
        `http://56.125.35.215:8000/user/manager/get-invitations/<user_name>/<validation_token>?user_name=${currentUserName}&validation_token=${currentValidationHash}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) {
        let serverErrorMessage = "Erro ao buscar convites";
        try { const errorData = await response.json(); serverErrorMessage = errorData.message || errorData.detail || JSON.stringify(errorData);
        } catch (e) { serverErrorMessage = `Erro ${response.status}: ${response.statusText}`; }
        throw new Error(serverErrorMessage);
      }
      const data = await response.json();
      const formattedInvitations = (Array.isArray(data) ? data : (data ? Object.values(data) : [])).map(inv => {

    const cargo = inv.papel_gerente || 'cargo desconhecido';
    const nomeCidade = inv.nome_cidade || 'cidade desconhecida';
    const nomeRemetente = currentUserName || 'um administrador';


    return {
        id: inv.invitation_id || inv.id,
        text: `Você recebeu um convite para atuar como gerente de ${cargo} na localidade ${nomeCidade}, enviado por ${nomeRemetente}.`,
        type: 'invitation',
        city_id: inv.cidade_id,
        role: cargo,
    };
});
      setInvitations(formattedInvitations);
      setHasNewNotifications(formattedInvitations.length > 0); 
    } catch (error) {
      console.error("Erro ao buscar convites:", error);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    setShowNotificationsPanel(prev => !prev);
    if (showUserMenu) setShowUserMenu(false);
  };

  const handleNotificationItemClick = (notificationId) => {
    setSelectedNotificationId(prevId => (prevId === notificationId ? null : notificationId));
  };

  const handleAcceptInvitationClick = (notification) => {
    if ( notification.type === 'invitation' &&
        (notification.city_id !== null && notification.city_id !== undefined) &&
        (notification.role && typeof notification.role === 'string' && notification.role.trim() !== "")) {
      prepararRespostaConvite({ city_id: notification.city_id, role: notification.role }, true);
    } else {
      let errorMessage = "Não é possível aceitar esta notificação: dados incompletos.";

      alert(errorMessage);
    }
    setSelectedNotificationId(null);
    setShowNotificationsPanel(false);
  };


 const fetchAllGeoStates = async () => {
    setLoadingStates(true);
    console.log("fetchAllGeoStates: Iniciando busca de estados...");
    try {
      const response = await fetch(`http://56.125.35.215:8000/local/geodata/states`);
      
      console.log("fetchAllGeoStates: Status da resposta:", response.status);
      console.log("fetchAllGeoStates: Resposta OK?", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("fetchAllGeoStates: Erro na resposta da API. Status:", response.status, "Texto do Erro:", errorText);
        throw new Error(`Erro ao buscar estados: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log("fetchAllGeoStates: Resposta bruta da API (texto):", responseText);

      try {
        const data = JSON.parse(responseText); 
        console.log("fetchAllGeoStates: Dados parseados da API (JSON):", data);

   
        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {   
          const ufsArray = Object.values(data); 
          ufsArray.sort(); 
          setAllAvailableStates(ufsArray);
          console.log("fetchAllGeoStates: UFs extraídas, ordenadas e definidas no estado:", ufsArray);
        } else {
   
          console.warn("fetchAllGeoStates: Os dados recebidos não são um objeto (chave-valor) esperado ou são um array. Dados recebidos:", data);
          setAllAvailableStates([]);
        }
      } catch (jsonError) {
        console.error("fetchAllGeoStates: Erro ao parsear JSON da resposta:", jsonError, "Resposta original (texto):", responseText);
        setAllAvailableStates([]);
        alert(`Erro ao processar dados dos estados: Formato inválido recebido da API.`);
      }

    } catch (error) {
      console.error("Erro CRÍTICO em fetchAllGeoStates:", error.message, error);
      setAllAvailableStates([]);
      alert(`Não foi possível carregar a lista de estados. Verifique o console para detalhes. Erro: ${error.message}`);
    } finally {
      setLoadingStates(false);
      console.log("fetchAllGeoStates: Busca de estados finalizada.");
    }
  };

  const fetchCitiesByUF = async (uf) => {
  if (!uf) {
    setCitiesForSelectedState([]);
    return;
  }
  setLoadingCities(true);
  console.log(`fetchCitiesByUF: Buscando cidades para UF: ${uf}`);
  try {
    const url = `http://56.125.35.215:8000/local/geodata/city/<UF>?UF=${encodeURIComponent(uf)}`;
    const response = await fetch(url);
    
    console.log(`fetchCitiesByUF: URL da requisição: ${url}`);
    console.log(`fetchCitiesByUF: Status para ${uf}:`, response.status, "OK?", response.ok);

    if (!response.ok) {
      let errorBodyMessage = `Erro ${response.status}`;
      try {
        const errorText = await response.text();
        errorBodyMessage = errorText || errorBodyMessage; 
      } catch (e) {
        console.warn("fetchCitiesByUF: Não foi possível ler o corpo do erro como texto.");
      }
      console.error(`fetchCitiesByUF: Erro na API para ${uf}. Status: ${response.status}`, errorBodyMessage);
      throw new Error(`Erro ao buscar cidades para ${uf}: ${response.status} - ${errorBodyMessage}`);
    }

    const data = await response.json();
    console.log(`fetchCitiesByUF: Dados de cidades para ${uf} (JSON parseado):`, data);

    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const cityNamesArray = Object.values(data); 
      cityNamesArray.sort();
      setCitiesForSelectedState(cityNamesArray);
      console.log(`fetchCitiesByUF: Nomes das cidades extraídos e definidos no estado:`, cityNamesArray);
    } else if (Array.isArray(data)) {
      data.sort();
      setCitiesForSelectedState(data);
      console.log(`fetchCitiesByUF: Dados recebidos já eram um array e foram definidos no estado:`, data);
    } else {
      console.warn(`fetchCitiesByUF: Os dados recebidos da API para cidades não são um objeto esperado nem um array. Dados recebidos:`, data);
      setCitiesForSelectedState([]);
    }

  } catch (error) {
    console.error("Erro em fetchCitiesByUF:", error.message, error);
    setCitiesForSelectedState([]);

  } finally {
    setLoadingCities(false);
    console.log(`fetchCitiesByUF: Busca para ${uf} finalizada.`);
  }
};
  
  const buscarCoordenadas = async () => {
    if (!novoEndereco.city || !novoEndereco.state) {

      return;
    }
    setLoading(true); 
    console.log(`buscarCoordenadas: Buscando para Cidade: ${novoEndereco.city}, Estado: ${novoEndereco.state}`);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          `${novoEndereco.city}, ${novoEndereco.state}, Brasil`
        )}&countrycodes=br&addressdetails=1&limit=5`
      );
      const data = await response.json();
      if (data?.length > 0) {
        const match = data.find(item => {
            const address = item.address;
            const cityNameLower = novoEndereco.city.toLowerCase();

            return (
                (address.city?.toLowerCase() === cityNameLower ||
                 address.town?.toLowerCase() === cityNameLower ||
                 address.village?.toLowerCase() === cityNameLower ||
                 address.municipality?.toLowerCase() === cityNameLower)

            );
        }) || data[0]; 

        const { lat, lon } = match;
        console.log(`buscarCoordenadas: Coordenadas encontradas: Lat ${lat}, Lon ${lon}`);
        setNovoEndereco((prev) => ({
          ...prev,
          coordenadas: [parseFloat(lat), parseFloat(lon)],
        }));
      } else {
        console.log("buscarCoordenadas: Nenhuma coordenada encontrada.");
        alert("Coordenadas não encontradas para o endereço fornecido.");
        setNovoEndereco((prev) => ({ ...prev, coordenadas: null }));
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
      alert("Falha ao buscar coordenadas.");
      setNovoEndereco((prev) => ({ ...prev, coordenadas: null }));
    } finally {
      setLoading(false);
    }
  };

  const adicionarEndereco = async () => {
    if ( novoEndereco.name && novoEndereco.state && novoEndereco.city && novoEndereco.coordenadas ) {
      setLoading(true); 
      try {
        const response = await fetch("http://56.125.35.215:8000/user/create-city", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_name: novoEndereco.user_name,
            name: novoEndereco.name,
            state: novoEndereco.state,
            city: novoEndereco.city,
            validation_hash: Cookies.get("validation_hash"),
            }),
        });
        console.log("testando se é estado ou uf", novoEndereco.state);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Erro ao criar cidade no servidor" }));
          throw new Error(errorData.message || errorData.detail || "Erro desconhecido ao criar cidade");
        }
        const data = await response.json();
        localStorage.setItem(`ultimaCidadeCriada_${novoEndereco.user_name}`, data.id);
        
        setNovoEndereco({ user_name: Cookies.get("userName"), name: "", state: "", city: "", coordenadas: null });
        setCitiesForSelectedState([]);
        setAllAvailableStates([]); 
        setMostrarFormulario(false);
        alert("Cidade adicionada com sucesso!");
        buscarCidades(); 
      } catch (error) {
        console.error("Erro ao adicionar cidade:", error);
        alert(`Erro ao criar cidade: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      let missingFields = [];
      if (!novoEndereco.name) missingFields.push("Nome da Localidade");
      if (!novoEndereco.state) missingFields.push("Estado");
      if (!novoEndereco.city) missingFields.push("Cidade");
      if (!novoEndereco.coordenadas) missingFields.push("Coordenadas (aguarde a busca após preencher cidade e estado)");
      alert(`Preencha todos os campos obrigatórios: ${missingFields.join(", ")}.`);
    }
  };

  const handleAccountOption = async (option) => {
    const currentValidationHash = Cookies.get("validation_hash"); 
    if (!userName || !currentValidationHash) {
      alert("Erro: Informações de autenticação não encontradas.");
      return;
    }
    const url = `http://56.125.35.215:8000/user/info/<user_name>/<validation_token>?user_name=${encodeURIComponent(userName)}&vld_hashing=${encodeURIComponent(currentValidationHash)}`;
    setLoading(true);
    try {
      const response = await fetch(url, { method: "GET", headers: { "Accept": "application/json" } });
      if (!response.ok) {
        let serverErrorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        try { const errorData = await response.json(); serverErrorMessage = errorData.message || errorData.detail || JSON.stringify(errorData);
        } catch (e) { console.warn("Não foi possível parsear erro JSON."); }
        throw new Error(serverErrorMessage);
      }
      const dadosUsuario = await response.json();
      if (option === "dados" || option === "email" || option === "senha") {
        setUserInfoData(dadosUsuario);   
        setShowUserInfoModal(true);     
      }
    } catch (error) {
      console.error("Erro em handleAccountOption:", error);
      alert(`Falha ao buscar dados do usuário: ${error.message}`);
      setUserInfoData(null); setShowUserInfoModal(false);
    } finally { setLoading(false); }
  };

  const handleLogoutClick = () => {
    logout();
    Cookies.remove("userName");
    Cookies.remove("validation_hash"); 
    navigate("/login");
  };

  const buscarCidades = async () => {
    const currentUserName = Cookies.get("userName");
    const currentValidationHash = Cookies.get("validation_hash");
    if (!currentUserName || !currentValidationHash) return;
    setLoading(true);
    try {
      const response = await fetch(`http://56.125.35.215:8000/user/get-cities/<user_name>/<validation_token>?user_name=${currentUserName}&vld_hashing=${currentValidationHash}`, {
        method: "GET", headers: { "Accept": "application/json" }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro servidor cidades" }));
        throw new Error(errorData.message || errorData.detail || "Erro buscar cidades");
      }
      const data = await response.json(); 
      setCitys(data ? Object.values(data) : []);
    } catch (error) {
      console.error("Erro ao buscar cidades:", error); setCitys([]); 
    } finally { setLoading(false); }
  };

  const handleCityClick = (city) => {
    sessionStorage.setItem('currentCityId', city.id);
    sessionStorage.setItem('currentCity', city.city_name); 
    navigate("/gerenciamentocidades", { state: { city } }); 
  };


  useEffect(() => {
    if (!loadingAuth && !usuarioLogado) {
      navigate("/login");
    }
  }, [usuarioLogado, loadingAuth, navigate]);

  useEffect(() => {
    if (usuarioLogado) {
      buscarCidades();
      getInvitations();
    } else {
      setCitys([]); 
      setInvitations([]); 
    }
  }, [usuarioLogado]);

  useEffect(() => {
    if (mostrarFormulario && novoEndereco.city && novoEndereco.state) {
      const timer = setTimeout(() => {
        buscarCoordenadas();
      }, 1200); 
      return () => clearTimeout(timer);
    }
  }, [novoEndereco.city, novoEndereco.state, mostrarFormulario]);

  useEffect(() => {
    if (mostrarFormulario) {
      console.log("useEffect[mostrarFormulario]: Abrindo formulário, chamando fetchAllGeoStates.");
      fetchAllGeoStates();

      setCitiesForSelectedState([]);
    } else {

    }
  }, [mostrarFormulario]);


  if (loadingAuth) {
    return <div className="flex justify-center items-center min-h-screen">Carregando autenticação...</div>;
  }

  const imagensDisponiveisParaCidades = [
  "../src/assets/images/cidade_1.png", 
  "../src/assets/images/cidade_2.png",      
  "../src/assets/images/cidade_3.png",
  "../src/assets/images/cidade_4.png",
  "../src/assets/images/cidade_5.png",
  "../src/assets/images/cidade_6.png",
  "../src/assets/images/cidade_7.png",
  "../src/assets/images/cidade_8.png"
];

const getImagemParaCidade = (cityId) => {
  if (!cityId) {
    return "../src/assets/images/city-buildings-svgrepo-com.svg";
  }
  
  let hash = 0;
  if (typeof cityId === 'string') {
    for (let i = 0; i < cityId.length; i++) {
      hash += cityId.charCodeAt(i);
    }
  } else if (typeof cityId === 'number') {
    hash = cityId;
  }

  const indice = hash % imagensDisponiveisParaCidades.length;
  return imagensDisponiveisParaCidades[indice];
}

return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      <div className="bg-white bg-opacity-90 shadow-sm py-3 px-6 flex justify-end items-center sticky top-0 z-30 backdrop-blur-sm">

        <div className="relative mr-4">
            <button
                onClick={handleBellClick}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                aria-label="Notificações"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {hasNewNotifications && invitations.length > 0 && (
                <span className="absolute top-1 right-1 block h-2.5 w-2.5 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ring-1 ring-white" />
                )}
            </button>
            {showNotificationsPanel && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden animate-fade-in-down">
                <div className="p-3 border-b border-gray-100"> <h3 className="text-base font-semibold text-gray-800">Notificações</h3> </div>
                <div className="max-h-80 overflow-y-auto"> 
                {invitations.length > 0 ? (
                    invitations.map((notification) => (
                    <div key={notification.id} className={`border-b border-gray-50 last:border-b-0 ${selectedNotificationId === notification.id ? 'bg-indigo-50' : ''}`}>
                        <div onClick={() => handleNotificationItemClick(notification.id)} className="p-3 hover:bg-gray-100 cursor-pointer transition-colors">
                           <p className={`text-sm ${selectedNotificationId === notification.id ? 'font-medium text-indigo-700' : 'text-gray-700'}`}>{notification.text}</p>
                        </div>
                        {selectedNotificationId === notification.id && notification.type === 'invitation' && (
                        <div className="p-3 bg-indigo-50 border-t border-gray-200">
                            <button onClick={() => handleAcceptInvitationClick(notification)} className="w-full px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-colors">Aceitar Convite</button>
                        </div>
                        )}
                    </div>
                    ))
                ) : ( <p className="p-6 text-sm text-gray-500 text-center">{(loading && !invitations.length) ? "Carregando convites..." : "Nenhuma notificação no momento."}</p> )}
                </div>
                {invitations.length > 0 && (<div className="p-2 bg-gray-50 border-t border-gray-100 text-center"><button className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium">Ver todas</button></div>)}
            </div>
            )}
        </div>


        <div className="relative">
            <button onClick={() => { setShowUserMenu(prev => !prev); if (showNotificationsPanel) setShowNotificationsPanel(false); }} className="flex items-center space-x-2 focus:outline-none group" aria-label="Menu do usuário" >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-medium shadow-md group-hover:shadow-lg transition-all">
                    {userName?.charAt(0).toUpperCase() || "U"}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform ${showUserMenu ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 divide-y divide-gray-100 animate-fade-in-down">
                <div className="px-4 py-3"><p className="text-sm font-medium text-gray-900">{userName || "Usuário"}</p></div>
                <div className="py-1">
                    <button onClick={() => handleAccountOption("dados")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> <span>Dados da Conta</span></button>
                    <button onClick={() => handleAccountOption("email")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> <span>Alterar E-mail</span></button>
                    <button onClick={() => handleAccountOption("senha")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> <span>Alterar Senha</span></button>
                </div>
                <div className="py-1"><button onClick={handleLogoutClick} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> <span>Sair</span></button></div>
            </div>
            )}
            {showUserInfoModal && userInfoData && (
            <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-8 z-[100] transition-opacity duration-300 ease-in-out">
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-xl transform transition-all duration-300 ease-in-out animate-fade-in-down border border-gray-200 overflow-hidden">
                    <div className="flex justify-between items-start pb-4 mb-6 border-b border-gray-200">
                        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 leading-tight">Dados da Conta</h3>
                        <button onClick={() => setShowUserInfoModal(false)} className="p-1 -mr-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors" aria-label="Fechar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="space-y-3 text-sm max-h-[60vh] overflow-y-auto pr-3"> 
                        { console.log("Dados efetivamente no MODAL UserInfo:", userInfoData) }
                        {userInfoData && Object.entries(userInfoData).map(([key, value]) => (
                            <div key={key} className="flex flex-col sm:flex-row sm:items-center py-2.5 border-b border-gray-100 last:border-b-0">
                                <strong className="w-full sm:w-1/3 capitalize font-medium text-gray-600 mb-1 sm:mb-0">{key.replace(/_/g, " ")}:</strong>
                                <span className="w-full sm:w-2/3 text-gray-800 break-words leading-relaxed">
                                    {typeof value === 'object' && value !== null ? <pre className="bg-gray-50 p-2 rounded-md text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre> : String(value !== null && value !== undefined && value !== '' ? value : 'N/A')}
                                </span>
                            </div>
                        ))}
                        {userInfoData && Object.keys(userInfoData).length === 0 && (<p className="text-gray-500 text-center py-4">Nenhum dado para exibir.</p>)}
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                        <button onClick={() => setShowUserInfoModal(false)} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-150 ease-in-out shadow-sm hover:shadow active:shadow-inner">Fechar</button>
                    </div>
                </div>
            </div>
            )}
        </div>
    </div>


      <main className="p-6 max-w-7xl mx-auto pt-10 sm:pt-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Minhas Cidades</h1>
            <p className="text-gray-600">
              {citys.length > 0
                ? `Olá ${userName}, você tem ${citys.length} ${citys.length === 1 ? 'cidade cadastrada' : 'cidades cadastradas'}.`
                : "Você ainda não cadastrou cidades. Adicione sua primeira cidade para começar!"}
            </p>
          </div>
          <button 
            onClick={() => {
              setMostrarFormulario(true);
              setNovoEndereco({ user_name: Cookies.get("userName"), name: "", state: "", city: "", coordenadas: null });
              setCitySearchTerm(""); 
            }} 
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-xl hover:from-amber-500 hover:to-yellow-600 transition-all flex items-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            <span className="font-medium">Adicionar Cidade</span>
          </button>
        </div>

        {loading && citys.length === 0 && !mostrarFormulario ? (
          <div className="text-center py-10"><p className="text-gray-500 text-lg">Carregando suas cidades...</p></div>
        ) : citys.length > 0 ? (
 
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {citys.map((local) => (
    <div key={local.id} onClick={() => handleCityClick(local)} className="cursor-pointer transition transform hover:scale-[1.02] active:scale-95">
      <Quadrado imagem={getImagemParaCidade(local.id)} titulo={local.city_name || local.name} descricao={`${local.city}, ${local.state}`} />
    </div>
  ))}
</div>
        ) : (
          !mostrarFormulario && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center border-2 border-dashed border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma cidade cadastrada</h3>
              <p className="mt-2 text-gray-600">Adicione sua primeira cidade para começar a gerenciar.</p>
              <button onClick={() => {
                setMostrarFormulario(true);
                setNovoEndereco({ user_name: Cookies.get("userName"), name: "", state: "", city: "", coordenadas: null });
                setCitySearchTerm("");
              }} className="mt-6 px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Adicionar Cidade
              </button>
            </div>
          )
        )}
        
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-fade-in">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Nova Cidade</h2>
                <button onClick={() => setMostrarFormulario(false)} className="p-1 -mr-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400" aria-label="Fechar modal">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); adicionarEndereco(); }}>
                <div>
                  <label htmlFor="form-localidade-name" className="block text-sm font-medium text-gray-700 mb-1">Nome da Localidade <span className="text-red-500">*</span></label>
                  <input type="text" id="form-localidade-name" placeholder="Ex: Centro, Vila Aurora" value={novoEndereco.name} onChange={(e) => setNovoEndereco({ ...novoEndereco, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="form-state-select" className="block text-sm font-medium text-gray-700 mb-1">Estado (UF) <span className="text-red-500">*</span></label>
                    <select
                      id="form-state-select"
                      value={novoEndereco.state}
                      onChange={(e) => {
                        const selectedUf = e.target.value;
                        setNovoEndereco(prev => ({ ...prev, state: selectedUf, city: "", coordenadas: null }));
                        setCitiesForSelectedState([]); 
                        setCitySearchTerm(""); 
                        if (selectedUf) fetchCitiesByUF(selectedUf);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white appearance-none"
                      required
                      disabled={loadingStates}
                    >
                      <option value="" disabled className="text-gray-500">{loadingStates ? "Carregando estados..." : "Selecione um Estado"}</option>
                      {allAvailableStates.map(uf_string => ( <option key={uf_string} value={uf_string}>{uf_string}</option> ))}
                    </select>
                    {loadingStates && <p className="text-xs text-blue-600 mt-1 animate-pulse">Carregando estados...</p>}
                  </div>

  
                  <div className="flex flex-col">
                    <label htmlFor="form-city-search" className="block text-sm font-medium text-gray-700 mb-1">Cidade <span className="text-red-500">*</span></label>
                    
                    <input
                      type="text"
                      id="form-city-search"
                      placeholder="Filtrar cidades..."
                      className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                      value={citySearchTerm}
                      onChange={(e) => setCitySearchTerm(e.target.value)}
                      disabled={!novoEndereco.state || loadingCities || citiesForSelectedState.length === 0}
                    />

                    <select
                      id="form-city-select"
                      value={novoEndereco.city}
                      onChange={(e) => setNovoEndereco(prev => ({ ...prev, city: e.target.value, coordenadas: null }))}
                      className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white appearance-none"
                      required
                      disabled={!novoEndereco.state || loadingCities || 
                        (!loadingCities && novoEndereco.state && citiesForSelectedState.filter(c => c.toLowerCase().startsWith(citySearchTerm.toLowerCase())).length === 0)
                      }

                      size={
                        (() => {
                          const filteredCount = citiesForSelectedState.filter(c => c.toLowerCase().startsWith(citySearchTerm.toLowerCase())).length;
                          if (filteredCount === 0) return undefined; 
                          if (filteredCount === 1) return undefined; 
                          return Math.min(8, filteredCount);
                        })()
                      }
                    >
                      <option value="" disabled className="text-gray-400 italic">
                        {loadingCities ? "Carregando cidades..." :
                          (!novoEndereco.state ? "Selecione um estado" :
                            (citiesForSelectedState.length === 0 ? "Nenhuma cidade para este estado" :
                              (citiesForSelectedState.filter(c => c.toLowerCase().startsWith(citySearchTerm.toLowerCase())).length === 0 ? "Nenhuma cidade corresponde ao filtro" :
                                "Selecione uma Cidade")
                            )
                          )
                        }
                      </option>
                      
                      {citiesForSelectedState
                        .filter(cityName => cityName.toLowerCase().startsWith(citySearchTerm.toLowerCase()))
                        .map(cityName => (
                          <option key={cityName} value={cityName} className="p-2 text-gray-800"> 
                            {cityName}
                          </option>
                      ))}
                    </select>
                    {loadingCities && <p className="text-xs text-blue-600 mt-1 animate-pulse">Carregando cidades...</p>}
                    {!loadingCities && novoEndereco.state && citiesForSelectedState.length === 0 && <p className="text-xs text-gray-500 mt-1">Nenhuma cidade encontrada para este estado.</p>}
                  </div>
                </div>

                <div className="py-2 min-h-[60px]">
                    {(loading && novoEndereco.city && novoEndereco.state && !novoEndereco.coordenadas) ? (
                    <div className="flex items-center space-x-2 text-blue-600 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        <span>Buscando localização geográfica...</span>
                    </div>
                    ) : novoEndereco.coordenadas ? (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-green-700">
                        <div className="flex items-center space-x-2 "><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> <span>Localização encontrada!</span></div>
                        <p className="mt-1 text-xs font-mono">[{novoEndereco.coordenadas.join(", ")}]</p>
                    </div>
                    ) : (novoEndereco.city && novoEndereco.state) ? (
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-700 flex items-center space-x-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg> <span className="text-sm">Aguardando busca de coordenadas...</span></div>
                    ) : (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-700 flex items-center space-x-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg> <span className="text-sm">Preencha estado e cidade para buscar coordenadas.</span></div>
                    )}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setMostrarFormulario(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors">Cancelar</button>
                  <button type="submit" disabled={!novoEndereco.coordenadas || loading || loadingStates || loadingCities} className={`px-5 py-2.5 rounded-lg text-white font-semibold transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${(!novoEndereco.coordenadas || loading || loadingStates || loadingCities) ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500"}`}>Confirmar</button>
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