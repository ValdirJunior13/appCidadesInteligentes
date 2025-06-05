import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from './Sidebar'; // Sua Sidebar autogerenciável
import Cookies from 'js-cookie';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// Correção para o ícone padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const convertSecondsToHHMM = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined || typeof totalSeconds !== 'number' || isNaN(totalSeconds)) {
    // console.warn(`[convertSecondsToHHMM] Valor inválido ou nulo recebido: ${totalSeconds}. Retornando string vazia.`);
    return '';
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
};


const IluminacaoController = ({ pontosIluminacao: propPontosIluminacao = [], cidadeSelecionada }) => {
  const centroMapa = cidadeSelecionada?.coordenadas || [-15.788, -47.879];
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const { logout, usuarioLogado } = useAuth(); // Pegando usuarioLogado se tiver o nome de usuário

  const [dadosSistema, setDadosSistema] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [showUserMenuDropdown, setShowUserMenuDropdown] = useState(false);
  
  // Estados para a função handleAccountOption
  const [userInfoData, setUserInfoData] = useState(null);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);

  // Seus outros estados específicos da página
  const [modoSelecionado, setModoSelecionado] = useState('automatico');
  const [luminosidadeMin, setLuminosidadeMin] = useState('40');
  const [luminosidadeMax, setLuminosidadeMax] = useState('70');
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioTermino, setHorarioTermino] = useState('');
  const [usarPadraoAuto, setUsarPadraoAuto] = useState(true);

  // Função para pegar o nome do usuário do cookie, para ser usado em handleAccountOption
  const currentUserNameFromCookie = Cookies.get("userName");

  const getSistemaData = async () => {
    setLoading(true);
    try {
      const sessionCityId = sessionStorage.getItem('currentCityId');
      const usernameCookie = Cookies.get("userName"); 
      const validationHashCookie = Cookies.get('validation_hash'); 

      if (!sessionCityId || !usernameCookie || !validationHashCookie) {
        throw new Error(`Informações ausentes para buscar dados do sistema.`);
      }
      
      const apiUrl = `http://56.125.35.215:8000/city/get-system-data/<city_id>/<username>/<validation_token>/<system_name>?city_id=${sessionCityId}&user_name=${usernameCookie}&validation_token=${validationHashCookie}&system_name=iluminacao`;
      const response = await fetch(apiUrl, { method: "GET", headers: { "Accept": "application/json" } });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText || response.statusText}`);
      }
      const data = await response.json();
      setDadosSistema(data);
      return data;
    } catch (error) {
      console.error("[getSistemaData] ERRO CAPTURADO:", error.message);
      setDadosSistema(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { getSistemaData(); }, []);

  useEffect(() => {
    if (dadosSistema) {
      const { modo, l_min, l_max, h_inicio, h_fim } = dadosSistema;
      if (modo === 'auto') setModoSelecionado('automatico');
      else if (modo === 'horario') setModoSelecionado('horario');
      else if (modo === 'manual') setModoSelecionado('manual');
      else setModoSelecionado('automatico');

      const minVal = l_min !== null ? String(Math.round(l_min * 100)) : '40';
      const maxVal = l_max !== null ? String(Math.round(l_max * 100)) : '70';
      setLuminosidadeMin(minVal);
      setLuminosidadeMax(maxVal);
      setUsarPadraoAuto(parseFloat(minVal) === 40 && parseFloat(maxVal) === 70);
      
      setHorarioInicio(convertSecondsToHHMM(h_inicio));
      setHorarioTermino(convertSecondsToHHMM(h_fim));
    } else {
      setModoSelecionado('automatico');
      setLuminosidadeMin('40'); setLuminosidadeMax('70'); setUsarPadraoAuto(true);
      setHorarioInicio(''); setHorarioTermino('');
    }
  }, [dadosSistema]); 

  const handleModoChange = (novoModo) => {
    setModoSelecionado(novoModo);
    if (novoModo === 'automatico') {
        const min = dadosSistema?.modo === 'auto' && dadosSistema.l_min !== null ? String(Math.round(dadosSistema.l_min * 100)) : '40';
        const max = dadosSistema?.modo === 'auto' && dadosSistema.l_max !== null ? String(Math.round(dadosSistema.l_max * 100)) : '70';
        setLuminosidadeMin(min); setLuminosidadeMax(max);
        setUsarPadraoAuto(parseFloat(min) === 40 && parseFloat(max) === 70);
    } else if (novoModo === 'horario') {
        setHorarioInicio(convertSecondsToHHMM(dadosSistema?.modo === 'horario' ? dadosSistema.h_inicio : null));
        setHorarioTermino(convertSecondsToHHMM(dadosSistema?.modo === 'horario' ? dadosSistema.h_fim : null));
    }
  };
  
  const handleUsarPadraoAutoChange = (e) => {
    const checked = e.target.checked;
    setUsarPadraoAuto(checked);
    if (checked) { setLuminosidadeMin('40'); setLuminosidadeMax('70'); }
  };

  const handleConfirmar = async () => {
    let systemSpecificPayload = { additionalProp1: {} };
    const formatTimeToHHMMSS_forAPI = (timeStr_HHMM) => {
        if (typeof timeStr_HHMM === 'string' && timeStr_HHMM.match(/^\d{2}:\d{2}$/)) return `${timeStr_HHMM}:00`;
        if (typeof timeStr_HHMM === 'string' && timeStr_HHMM.match(/^\d{2}:\d{2}:\d{2}$/)) return timeStr_HHMM; 
        return null;
    };

    if (modoSelecionado === 'automatico') {
        systemSpecificPayload = { ...systemSpecificPayload, modo: 'auto', l_min: luminosidadeMin !== '' ? parseFloat(luminosidadeMin) / 100 : null, l_max: luminosidadeMax !== '' ? parseFloat(luminosidadeMax) / 100 : null, h_inicio: 0, h_fim: 0 };
    } else if (modoSelecionado === 'horario') {
        systemSpecificPayload = { ...systemSpecificPayload, modo: 'horario', l_min: 0.7, l_max: 0.4, h_inicio: formatTimeToHHMMSS_forAPI(horarioInicio), h_fim: formatTimeToHHMMSS_forAPI(horarioTermino) };
    } else if (modoSelecionado === 'manual') {
        systemSpecificPayload = { ...systemSpecificPayload, modo: 'manual', dispositivos: { "1": { "mac": "8D-4B-7D-5C", "value": true } } }; // Exemplo
    }
    
    const bodyPayload = { user_name: Cookies.get("userName"), validation_hash: Cookies.get('validation_hash'), city_id: sessionStorage.getItem('currentCityId') || "", system_name: "iluminacao", payload: systemSpecificPayload };
    const { user_name: userNameForPath, validation_hash: validationHashForPath, system_name: systemNameForPath, city_id: cityIdForQuery } = bodyPayload;
    const payloadSegmentForPath = encodeURIComponent(JSON.stringify(bodyPayload.payload)); 

    if (!userNameForPath || !validationHashForPath || !systemNameForPath) {
        alert("Erro: Informações de autenticação/sistema ausentes.");
        setLoading(false); return;
    }
    
    let updateUrl = `http://56.125.35.215:8000/city/update/<username>/<validation_token>/<system_name>/<payload>?city_id=${encodeURIComponent(cityIdForQuery)}&user_name=${encodeURIComponent(userNameForPath)}&validation_hash=${encodeURIComponent(validationHashForPath)}&system_name=${encodeURIComponent(systemNameForPath)}&payload=${payloadSegmentForPath}`;

    setLoading(true);
    try {
        const response = await fetch(updateUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "Accept": "application/json" },
            body: JSON.stringify(bodyPayload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(async () => ({ detail: [{ msg: await response.text() || `Erro HTTP ${response.status}` }] }));
            const errMsg = (errorData.detail && Array.isArray(errorData.detail) && errorData.detail.map(e => e.msg || JSON.stringify(e)).join('; ')) || errorData.message || `Erro ${response.statusText}`;
            throw new Error(errMsg);
        }
        
        await response.json();
        alert('Configurações salvas com sucesso!');
        await getSistemaData(); 
    } catch (error) {
        alert(`Erro ao salvar: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };

  // Função de logout para o header
  const handleLogoutClick = () => {
    logout();
    // navigate('/login'); // Se o AuthContext ou ProtectedRoute não redirecionar
  };
  
  const pageTitle = "Controle de Iluminação";

  // ===== FUNÇÃO ADICIONADA AQUI =====
  const handleAccountOption = async (option) => {
    const userName = currentUserNameFromCookie; // Usando a variável definida no escopo do componente
    const currentValidationHash = Cookies.get("validation_hash"); 
    
    if (!userName || !currentValidationHash) {
      alert("Erro: Informações de autenticação não encontradas.");
      setLoading(false); // Certifique-se de parar o loading se houver erro aqui
      return;
    }

    // A URL já interpola os valores, não precisa dos placeholders < > no path se eles são query params
    // Se user_name e validation_token são PATH PARAMS e não query params, a URL seria diferente.
    // Assumindo que são query params conforme o ?user_name=...&vld_hashing=...
    // E que o path base é /user/info/
    // Se os placeholders <user_name>/<validation_token> são literais na sua API (incomum), mantenha.
    // Senão, remova-os do path se forem apenas query params.
    // A sua URL original era: /user/info/<user_name>/<validation_token>?user_name=${}&vld_hashing=${}
    // Se <user_name> e <validation_token> são placeholders para path params, então eles não deveriam estar na query.
    // Se são query params, o path não deveria ter os placeholders.
    // Vou manter sua estrutura original de URL por enquanto, mas ela é ambígua.
    const url = `http://56.125.35.215:8000/user/info/<user_name>/<validation_token>?user_name=${encodeURIComponent(userName)}&vld_hashing=${encodeURIComponent(currentValidationHash)}`;
    
    console.log("Chamando handleAccountOption com URL:", url);
    setLoading(true);
    try {
      const response = await fetch(url, { method: "GET", headers: { "Accept": "application/json" } });
      if (!response.ok) {
        let serverErrorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        try { 
          const errorData = await response.json(); 
          serverErrorMessage = errorData.message || errorData.detail || JSON.stringify(errorData);
        } catch (e) { 
          serverErrorMessage = await response.text() || serverErrorMessage; // Adicionado fallback para response.text()
          console.warn("Não foi possível parsear erro JSON, usando texto da resposta:", serverErrorMessage);
        }
        throw new Error(serverErrorMessage);
      }
      const dadosUsuario = await response.json();
      console.log("Dados do usuário recebidos:", dadosUsuario);
      if (option === "dados" || option === "email" || option === "senha") {
        setUserInfoData(dadosUsuario);   
        setShowUserInfoModal(true);     
        // Você precisará de um componente Modal para exibir userInfoData e setShowUserInfoModal(false) para fechá-lo
      }
    } catch (error) {
      console.error("Erro em handleAccountOption:", error);
      alert(`Falha ao buscar dados do usuário: ${error.message}`);
      setUserInfoData(null); 
      setShowUserInfoModal(false);
    } finally { 
      setLoading(false); 
    }
  };
  // ===== FIM DA FUNÇÃO ADICIONADA =====

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <Sidebar 
        activeItem="iluminacao"
        // cidadeAtual={cidadeSelecionada} // Passe se a Sidebar precisar
      />
      <div className="flex-1 flex flex-col">
        <header className="bg-white bg-opacity-90 shadow-sm py-3 px-6 flex justify-between items-center sticky top-0 z-30 backdrop-blur-sm shrink-0">
          <div className="flex items-center space-x-4 min-w-0">
            {/* Removido o botão de toggle da sidebar do header, já que a sidebar tem o seu */}
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate" title={pageTitle}>
              {pageTitle}
            </h1>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowUserMenuDropdown(!showUserMenuDropdown)} 
              className="flex items-center space-x-2 focus:outline-none group" 
              aria-label="Menu do usuário"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-medium shadow-md group-hover:shadow-lg transition-all">
                {Cookies.get("userName")?.charAt(0).toUpperCase() || "U"}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform ${showUserMenuDropdown ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {showUserMenuDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 divide-y divide-gray-100">
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{Cookies.get("userName") || "Usuário"}</p>
                </div>
                {/* Botões do menu dropdown atualizados */}
                <div className="py-1">
                  <button onClick={() => { handleAccountOption("dados"); setShowUserMenuDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span>Dados da Conta</span>
                  </button>
                </div>
                <div className="py-1">
                  <button onClick={() => { handleAccountOption("email"); setShowUserMenuDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span>Alterar E-mail</span>
                  </button>
                </div>
                <div className="py-1">
                  <button onClick={() => { handleAccountOption("senha"); setShowUserMenuDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2">
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
        </header>
        
        <main className="flex-1 bg-blue-50 p-4 md:p-6 lg:p-8 overflow-y-auto">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"> 
            <div className="space-y-6">
              {/* Card Modo Automático */}
              <div className="bg-zinc-900 text-white rounded-lg p-6 shadow-lg">
        
                <div className="flex items-center mb-3">
                  <input type="radio" id="modoAutomatico" name="modoIluminacao" checked={modoSelecionado === 'automatico'} onChange={() => handleModoChange('automatico')} className="mr-3 h-5 w-5 text-yellow-400 focus:ring-yellow-500 border-gray-500 cursor-pointer"/>
                  <label htmlFor="modoAutomatico" className="text-xl font-semibold cursor-pointer">Modo Automático</label>
                </div>
                <p className="text-sm text-gray-300 mb-4">Define a ativação do sistema com base na luminosidade ambiente.</p>
                <div className="space-y-4 ml-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="usarPadraoAutoCheck" checked={usarPadraoAuto} onChange={handleUsarPadraoAutoChange} disabled={modoSelecionado !== 'automatico'} className="h-5 w-5 text-yellow-400 focus:ring-yellow-500 border-gray-500 rounded cursor-pointer disabled:opacity-50"/>
                    <label htmlFor="usarPadraoAutoCheck" className="text-gray-200 cursor-pointer">Usar valores padrão (Min: 40%, Max: 70%)</label>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="luminosidadeMinInput" className="block text-sm font-medium text-gray-300 mb-1">Luminosidade Mínima (%):</label>
                      <input id="luminosidadeMinInput" type="number" min="0" max="100" className="bg-gray-700 text-white rounded px-3 py-2 w-full border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50" value={luminosidadeMin} onChange={(e) => { setLuminosidadeMin(e.target.value); if(modoSelecionado === 'automatico') setUsarPadraoAuto(false); }} disabled={modoSelecionado !== 'automatico'} placeholder="0-100"/>
                    </div>
                    <div>
                      <label htmlFor="luminosidadeMaxInput" className="block text-sm font-medium text-gray-300 mb-1">Luminosidade Máxima (%):</label>
                      <input id="luminosidadeMaxInput" type="number" min="0" max="100" className="bg-gray-700 text-white rounded px-3 py-2 w-full border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50" value={luminosidadeMax} onChange={(e) => { setLuminosidadeMax(e.target.value); if(modoSelecionado === 'automatico') setUsarPadraoAuto(false); }} disabled={modoSelecionado !== 'automatico'} placeholder="0-100"/>
                    </div>
                  </div>
                </div>
              </div>
              {/* Card Modo Horário */}
              <div className="bg-zinc-900 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center mb-3">
                    <input type="radio" id="modoHorario" name="modoIluminacao" checked={modoSelecionado === 'horario'} onChange={() => handleModoChange('horario')} className="mr-3 h-5 w-5 text-yellow-400 focus:ring-yellow-500 border-gray-500 cursor-pointer"/>
                    <label htmlFor="modoHorario" className="text-xl font-semibold cursor-pointer">Modo Horário</label>
                </div>
                <p className="text-sm text-gray-300 mb-4">Define horários específicos para ligar e desligar.</p>
                <div className="space-y-4 ml-4">
                    <div>
                        <label htmlFor="horarioInicioInput" className="block text-sm font-medium text-gray-300 mb-1">Horário de Início:</label>
                        <input id="horarioInicioInput" type="time" className="bg-gray-700 text-white rounded px-3 py-2 w-full border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50" value={horarioInicio} onChange={(e) => setHorarioInicio(e.target.value)} disabled={modoSelecionado !== 'horario'}/>
                    </div>
                    <div>
                        <label htmlFor="horarioTerminoInput" className="block text-sm font-medium text-gray-300 mb-1">Horário de Término:</label>
                        <input id="horarioTerminoInput" type="time" className="bg-gray-700 text-white rounded px-3 py-2 w-full border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50" value={horarioTermino} onChange={(e) => setHorarioTermino(e.target.value)} disabled={modoSelecionado !== 'horario'}/>
                    </div>
                </div>
              </div>
            </div>
            {/* Coluna da Direita: Modo Manual e Mapa */}
            <div className="bg-zinc-900 text-white rounded-lg p-6 shadow-lg flex flex-col h-full">
                <div className="flex items-center mb-3">
                    <input type="radio" id="modoManual" name="modoIluminacao" checked={modoSelecionado === 'manual'} onChange={() => handleModoChange('manual')} className="mr-3 h-5 w-5 text-yellow-400 focus:ring-yellow-500 border-gray-500 cursor-pointer"/>
                    <label htmlFor="modoManual" className="text-xl font-semibold cursor-pointer">Modo Manual</label>
                </div>
                <p className="text-sm text-gray-300 mb-4">Controle individual dos dispositivos no mapa.</p>
                <div className="flex-1 mb-4 rounded-md overflow-hidden" style={{ minHeight: '300px' }}>
                <div 

                className={`flex-1 mb-4 rounded-md overflow-hidden ${showUserInfoModal ? 'map-is-behind-modal' : ''}`}
                style={{ minHeight: '300px' }}
              >
         </div>
                <MapContainer 
                    center={centroMapa} 
                    zoom={15} 
                    className="w-full h-full" 
                    key={Date.now()}
                    whenCreated={mapInstance => { mapRef.current = mapInstance; }}
                >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                {propPontosIluminacao && propPontosIluminacao.map((ponto, index) => {
                    const position = ponto.coordenadas || (typeof ponto.lat === 'number' && typeof ponto.long === 'number' ? [ponto.lat, ponto.long] : null);
                    if (!position) return null;
                    return (
                        <Marker key={ponto.id || `ilum-ponto-${index}`} position={position}>
                            <Popup> {ponto.nome || `Ponto de Iluminação ${index + 1}`}<br /> Status: {ponto.status || 'Desconhecido'} </Popup>
                        </Marker>
                    );
                })}
                </MapContainer>
              </div>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end mt-8">
            <button
                className="bg-zinc-900 text-blue-200 font-bold py-3 px-10 rounded-lg hover:bg-black focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-colors disabled:opacity-70" 
                onClick={handleConfirmar} 
                disabled={loading}
            >
              {loading ? 'Salvando...' : 'Confirmar e Salvar'}
            </button>
          </div>
        </main>
      </div>

      {/* Modal para exibir informações do usuário - exemplo básico */}
      {showUserInfoModal && userInfoData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Dados do Usuário</h2>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(userInfoData, null, 2)}
            </pre>
            <button 
              onClick={() => {
                setShowUserInfoModal(false);
                setUserInfoData(null);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default IluminacaoController;