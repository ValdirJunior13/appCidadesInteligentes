import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Verifique o caminho
import Cookies from "js-cookie";
import Quadrado from "../components/Quadrado"; // Verifique o caminho

const PaginaLoginComponent = () => {
  const navigate = useNavigate();
  const { usuarioLogado, logout, loadingAuth } = useAuth();

  // Estados do componente
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
  const [loading, setLoading] = useState(false); // Loading geral
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Estados para Convites/Notificações
  const [invitations, setInvitations] = useState([]); // Será populado por getInvitations
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true); // Lógica para atualizar isso é necessária
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  
  const [addInvitation, setAddInvitation] = useState({ // Payload para responder ao convite
    user_name: Cookies.get("userName") || "",
    validation_hash: Cookies.get("validation_hash") || "",
    city_id: sessionStorage.getItem('currentCityId'),
    decision: true,
    role: "",
  });

  // --- FUNÇÕES ---

const prepararRespostaConvite = (conviteEspecifico, valorDecisao) => {
  const payload = {
    user_name: Cookies.get("userName") || "",
    validation_hash: Cookies.get("validation_hash") || "",
    city_id: conviteEspecifico.city_id, 
    decision: true,
    role: conviteEspecifico.role,
  };

  const submitInvitationAnswer = async () => {
    setAddInvitation(payload);
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
          body: JSON.stringify(payload), // ⚠️ aqui era `addInvitation`, agora corrigido para `payload`
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
        const data = await response.json();
        alert(`Resposta ao convite (${payload.decision ? 'Aceito' : 'Rejeitado'}) enviada com sucesso!`);
        getInvitations();
        setAddInvitation(prev => ({ ...prev, cidade_id: null, decision: null, papel_gerente: "" }));
        return data;
      } catch (error) {
        console.error("Erro ao enviar resposta de convite:", error);
        alert(`Erro ao enviar resposta de convite: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Dados do convite estão incompletos ou inválidos para enviar a resposta.");
      console.warn("Tentativa de submeter payload incompleto:", payload);
    }
  };

  submitInvitationAnswer(); // ✅ Agora sim ela será executada!
};


  const getInvitations = async () => {
    const username = Cookies.get("userName");
    const validation_hash = Cookies.get("validation_hash");

    if (!username || !validation_hash) { return; }
    setLoading(true);
    try {
      const response = await fetch(
        `http://56.125.35.215:8000/user/manager/get-invitations/<user_name>/<validation_token>?user_name=${username}&validation_token=${validation_hash}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) {
        let serverErrorMessage = "Erro ao buscar convites";
        try { const errorData = await response.json(); serverErrorMessage = errorData.message || errorData.detail || JSON.stringify(errorData);
        } catch (e) { serverErrorMessage = `Erro ${response.status}: ${response.statusText}`; }
        throw new Error(serverErrorMessage);
      }
      const data = await response.json();
      console.log("Dados brutos de convites/notificações da API:", data);
      
      const formattedInvitations = (Array.isArray(data) ? data : (data ? Object.values(data) : [])).map(inv => {
       console.log(">>>>>>>>>> ESTRUTURA DO OBJETO 'inv' INDIVIDUAL DA API:", JSON.stringify(inv, null, 2));
       return {
        id: inv.invitation_id || inv.id || `fallback-id-${Math.random()}`,
        text: inv.message || `Convite para ${inv.role_name || inv.papel_gerente || 'cargo desconhecido'} em ${inv.city_name || inv.cidade_id || 'cidade desconhecida'}`,
         type: 'invitation',
        city_id: inv.cidade_id,
        role: inv.role_name || inv.papel_gerente,
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
 console.log("Dados da notificação ao tentar aceitar:", notification);

 if (
notification.type === 'invitation' &&
(notification.city_id!== null && notification.city_id!== undefined)
) {
  console.log("passei do IF!")
 prepararRespostaConvite(
 { city_id: notification.city_id, role: notification.role || null }, 
 );

 } else {
  console.log(notification.cidade_id)
 console.error("Tentativa de aceitar notificação sem dados de convite válidos:", notification);
 let errorMessage = "Não é possível aceitar esta notificação: dados incompletos.";
    if (notification.type !== 'invitation') {
        errorMessage += " (Tipo inválido)";
    }
    if (!(notification.city_id !== null && notification.city_id !== undefined)) {
        errorMessage += " (ID da cidade ausente)";
    }
    if (!(notification.role && typeof notification.role === 'string' && notification.role.trim() !== "" )) {
        errorMessage += " (Cargo ausente ou inválido)";
    }
 alert(errorMessage);
 }
  setSelectedNotificationId(null);
 setShowNotificationsPanel(false);
};


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
      } else {
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_name: novoEndereco.user_name,
            name: novoEndereco.name,
            state: novoEndereco.state,
            city: novoEndereco.city,
            validation_hash: Cookies.get("validation_hash"),

          }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Erro ao criar cidade no servidor" }));
          throw new Error(errorData.message || "Erro desconhecido ao criar cidade");
        }
        const data = await response.json();
        localStorage.setItem(`ultimaCidadeCriada_${novoEndereco.user_name}`, data.id);
        
        const novaCidadeParaLista = {
          id: data.id, 
          city_name: novoEndereco.name, 
          city: novoEndereco.city,
          state: novoEndereco.state,
        };

        setCitys((prevCitys) => {
          const cidadesAtualizadas = [...prevCitys, novaCidadeParaLista];

          return cidadesAtualizadas;
        });


        setNovoEndereco({
          user_name: Cookies.get("userName"), name: "", state: "", city: "", coordenadas: null,
        });
        setMostrarFormulario(false);
        alert("Cidade adicionada com sucesso!");
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
    logout();
    Cookies.remove("userName");
    Cookies.remove("validation_hash"); 
    navigate("/login");
  };

  const buscarCidades = async () => {
    const currentUserName = Cookies.get("userName");
    const currentValidationHash = Cookies.get("validation_hash");

    if (!currentUserName || !currentValidationHash) {
      console.log("Usuário não autenticado, não buscando cidades.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://56.125.35.215:8000/user/get-cities/<user_name>/<validation_token>?user_name=${currentUserName}&vld_hashing=${currentValidationHash}`, {
        method: "GET", headers: { "Accept": "application/json" }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao buscar cidades do servidor" }));
        throw new Error(errorData.message || "Erro desconhecido ao buscar cidades");
      }
      const data = await response.json(); 
      const arrayDeCidades = data ? Object.values(data) : [];
      
      setCitys(arrayDeCidades);

    } catch (error) {
      console.error("Erro ao buscar cidades:", error);

      if (citys.length === 0) setCitys([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleCityClick = (city) => {
    sessionStorage.setItem('currentCityId', city.id);
    sessionStorage.setItem('currentCity', city.city_name); // ou city.name, dependendo da estrutura
    navigate("/gerenciamentocidades", { state: { city } }); // Envia o objeto cidade inteiro
  };

  // --- useEffect HOOKS ---
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
      setCitys([]); // Limpa cidades se deslogado
      setInvitations([]); // Limpa convites se deslogado
    }
  }, [usuarioLogado]); // Dependência apenas em usuarioLogado

  useEffect(() => {
    if (mostrarFormulario && (novoEndereco.city || novoEndereco.state)) {
      const timer = setTimeout(() => {
        if (novoEndereco.city && novoEndereco.state) { // Só busca se ambos estiverem preenchidos
            buscarCoordenadas();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [novoEndereco.city, novoEndereco.state, mostrarFormulario]);


  // --- JSX RETURN ---
  if (loadingAuth) {
    return <div className="flex justify-center items-center min-h-screen">Carregando autenticação...</div>;
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
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-800">Notificações</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {invitations.length > 0 ? (
                  invitations.map((notification) => (
                    <div key={notification.id} className={`border-b border-gray-50 last:border-b-0 ${selectedNotificationId === notification.id ? 'bg-indigo-50' : ''}`}>
                      <div
                        onClick={() => handleNotificationItemClick(notification.id)}
                        className="p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <p className={`text-sm ${selectedNotificationId === notification.id ? 'font-medium text-indigo-700' : 'text-gray-700'}`}>
                          {notification.text}
                        </p>
                      </div>
                      {selectedNotificationId === notification.id && notification.type === 'invitation' && (
                        <div className="p-3 bg-indigo-50 border-t border-gray-200">
                          <button
                            onClick={() => handleAcceptInvitationClick(notification)}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-colors"
                          >
                            Aceitar Convite
                          </button>
                        </div>
                      )}
                      {selectedNotificationId === notification.id && notification.type !== 'invitation' && (
                        <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                            Esta notificação é informativa ou requer outra ação.
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="p-6 text-sm text-gray-500 text-center">{loading && !invitations.length ? "Carregando convites..." : "Nenhuma notificação no momento."}</p>
                )}
              </div>
              {invitations.length > 0 && (
                <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                  <button className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium">
                    Ver todas
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(prev => !prev); if (showNotificationsPanel) setShowNotificationsPanel(false); }}
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
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 divide-y divide-gray-100 animate-fade-in-down">
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{userName || "Usuário"}</p>
              </div>
              <div className="py-1">
                <button onClick={() => handleAccountOption("dados")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span>Dados da Conta</span>
                </button>
                <button onClick={() => handleAccountOption("email")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span>Alterar E-mail</span>
                </button>
                <button onClick={() => handleAccountOption("senha")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span>Alterar Senha</span>
                </button>
              </div>
              <div className="py-1">
                <button onClick={handleLogoutClick} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  <span>Sair</span>
                </button>
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
              {citys.length > 0
                ? `Olá ${userName}, Você tem ${citys.length} ${citys.length === 1 ? 'cidade' : 'cidades'} cadastradas`
                : "Adicione sua primeira cidade para começar"}
            </p>
          </div>
          <button onClick={() => setMostrarFormulario(true)} className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-xl hover:from-amber-500 hover:to-yellow-600 transition-all flex items-center gap-2 shadow-md hover:shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            <span className="font-medium">Adicionar Cidade</span>
          </button>
        </div>
        {citys.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {citys.map((local) => (
              <div key={local.id} onClick={() => handleCityClick(local)} className="cursor-pointer transition transform hover:scale-[1.02] active:scale-95">
                <Quadrado imagem="../src/assets/images/city-buildings-svgrepo-com.svg" titulo={local.city_name || local.name} descricao={`${local.city}, ${local.state}`} />
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center border-2 border-dashed border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma cidade cadastrada</h3>
              <p className="mt-2 text-gray-600">Adicione sua primeira cidade para começar a gerenciar</p>
              <button onClick={() => setMostrarFormulario(true)} className="mt-6 px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors shadow">
                Adicionar Cidade
              </button>
            </div>
          )
        )}
        {loading && citys.length === 0 && invitations.length === 0 && ( // Condição de loading mais geral
           <div className="text-center py-10"><p className="text-gray-500">Carregando dados...</p></div>
        )}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Nova Cidade</h2>
                <button onClick={() => setMostrarFormulario(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100" aria-label="Fechar modal">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form className="space-y-4">
                <div>
                  <label htmlFor="form-name" className="block text-sm font-medium text-gray-700 mb-1">Nome da Localidade</label> {/* Alterado htmlFor e id */}
                  <input type="text" id="form-name" placeholder="Ex: Cohab" value={novoEndereco.name} onChange={(e) => setNovoEndereco({ ...novoEndereco, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="form-state" className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label> {/* Alterado htmlFor e id */}
                    <input type="text" id="form-state" placeholder="Ex: SP" value={novoEndereco.state} onChange={(e) => setNovoEndereco({ ...novoEndereco, state: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                  </div>
                  <div>
                    <label htmlFor="form-city" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label> {/* Alterado htmlFor e id */}
                    <input type="text" id="form-city" placeholder="Ex: São Paulo" value={novoEndereco.city} onChange={(e) => setNovoEndereco({ ...novoEndereco, city: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                  </div>
                </div>
                <div className="py-2">
                  {loading && novoEndereco.city && novoEndereco.state ? (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                      <span>Buscando localização...</span>
                    </div>
                  ) : novoEndereco.coordenadas ? (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center space-x-2 text-green-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span>Localização encontrada!</span>
                      </div>
                      <p className="mt-1 text-xs text-green-600 font-mono">{novoEndereco.coordenadas.join(", ")}</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-700 flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                      <span className="text-sm">Preencha cidade e estado para buscar coordenadas</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setMostrarFormulario(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                  <button type="button" onClick={adicionarEndereco} disabled={!novoEndereco.coordenadas || loading} className={`px-4 py-2 rounded-lg text-white transition-colors ${novoEndereco.coordenadas && !loading ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md" : "bg-gray-300 cursor-not-allowed"}`}>Confirmar</button>
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