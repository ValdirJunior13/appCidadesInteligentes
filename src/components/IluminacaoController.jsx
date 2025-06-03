import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from './Sidebar';
import Cookies from 'js-cookie';

// Correção para o ícone padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Função helper para converter segundos para formato HH:mm
const convertSecondsToHHMM = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined || typeof totalSeconds !== 'number' || isNaN(totalSeconds)) {
    console.warn(`[convertSecondsToHHMM] Valor inválido ou nulo recebido: ${totalSeconds}. Retornando string vazia.`);
    return '';
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
};


const IluminacaoController = ({ pontosIluminacao = [], cidadeSelecionada }) => {
  const centroMapa = cidadeSelecionada?.coordenadas || [-15.788, -47.879];

  const [dadosSistema, setDadosSistema] = useState(null);
  const [loading, setLoading] = useState(false);

  const [modoSelecionado, setModoSelecionado] = useState('automatico');
  const [luminosidadeMin, setLuminosidadeMin] = useState('40');
  const [luminosidadeMax, setLuminosidadeMax] = useState('70');
  const [horarioInicio, setHorarioInicio] = useState(''); // Armazenará HH:mm
  const [horarioTermino, setHorarioTermino] = useState(''); // Armazenará HH:mm
  const [usarPadraoAuto, setUsarPadraoAuto] = useState(true);

  const getSistemaData = async () => {
    console.log("[getSistemaData] INICIANDO.");
    setLoading(true);
    try {
      const sessionCityId = sessionStorage.getItem('currentCityId');
      const usernameCookie = Cookies.get("userName"); 
      const validationHashCookie = Cookies.get('validation_hash'); 

      if (!sessionCityId || !usernameCookie || !validationHashCookie) {
        const missing = [];
        if (!sessionCityId) missing.push("ID da cidade");
        if (!usernameCookie) missing.push("Nome de usuário (cookie 'userName')");
        if (!validationHashCookie) missing.push("Token de validação (cookie 'validation_hash')");
        console.error("[getSistemaData] ERRO: Informações ausentes:", missing.join(', '));
        throw new Error(`Informações ausentes: ${missing.join(', ')}`);
      }
      
      const apiUrl = `http://56.125.35.215:8000/city/get-system-data/<city_id>/<username>/<validation_token>/<system_name>?city_id=${sessionCityId}&user_name=${usernameCookie}&validation_token=${validationHashCookie}&system_name=iluminacao`;
      console.log("[getSistemaData] URL:", apiUrl);

      const response = await fetch(apiUrl, { method: "GET", headers: { "Accept": "application/json" } });
      console.log("[getSistemaData] Resposta API - Status:", response.status, "Ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[getSistemaData] ERRO HTTP: ${response.status} - ${response.statusText}. Resposta: ${errorText}`);
        throw new Error(`Erro HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log("[getSistemaData] Dados recebidos API (JSON):", JSON.stringify(data, null, 2));
      setDadosSistema(data);
      return data;
    } catch (error) {
      console.error("[getSistemaData] ERRO CAPTURADO:", error.message);
      setDadosSistema(null);
    } finally {
      setLoading(false);
      console.log("[getSistemaData] FINALIZANDO.");
    }
  };
  
  useEffect(() => {
    console.log("[IluminacaoController Mount] Chamando getSistemaData.");
    getSistemaData();
  }, []);

  useEffect(() => {
    if (dadosSistema) {
      console.log("[Effect dadosSistema] Atualizando formulário com:", dadosSistema);
      const { modo, l_min, l_max, h_inicio, h_fim } = dadosSistema;

      // 1. Corrigir seleção do modo
      if (modo === 'auto') {
        setModoSelecionado('automatico');
        console.log("[Effect dadosSistema] Modo definido para: automatico");
      } else if (modo === 'horario') { // API retorna 'horario' diretamente
        setModoSelecionado('horario');
        console.log("[Effect dadosSistema] Modo definido para: horario");
      } else if (modo === 'manual') {
        setModoSelecionado('manual');
        console.log("[Effect dadosSistema] Modo definido para: manual");
      } else {
        console.warn(`[Effect dadosSistema] Modo da API ('${modo}') desconhecido. Usando 'automatico' como fallback.`);
        setModoSelecionado('automatico');
      }

      // Preencher campos de luminosidade
      const minVal = l_min !== null ? String(Math.round(l_min * 100)) : '40';
      const maxVal = l_max !== null ? String(Math.round(l_max * 100)) : '70';
      setLuminosidadeMin(minVal);
      setLuminosidadeMax(maxVal);
      setUsarPadraoAuto(parseFloat(minVal) === 40 && parseFloat(maxVal) === 70);
      console.log(`[Effect dadosSistema] Luminosidade: Min=${minVal}%, Max=${maxVal}%. UsarPadrão=${usarPadraoAuto}`);

      // 2. Converter segundos para HH:mm para os inputs de horário
      console.log(`[Effect dadosSistema] API h_inicio (segundos): ${h_inicio}, API h_fim (segundos): ${h_fim}`);
      const inicioHHMM = convertSecondsToHHMM(h_inicio);
      const fimHHMM = convertSecondsToHHMM(h_fim);
      setHorarioInicio(inicioHHMM);
      setHorarioTermino(fimHHMM);
      console.log(`[Effect dadosSistema] Inputs de Horário definidos para: Início=${inicioHHMM}, Fim=${fimHHMM}`);
      
    } else {
      console.log("[Effect dadosSistema] dadosSistema é null, resetando formulário para padrões.");
      setModoSelecionado('automatico');
      setLuminosidadeMin('40'); setLuminosidadeMax('70'); setUsarPadraoAuto(true);
      setHorarioInicio(''); setHorarioTermino('');
    }
  }, [dadosSistema]); // Dependência mantida

  const handleModoChange = (novoModo) => {
    console.log(`[handleModoChange] Modo alterado para: ${novoModo}`);
    setModoSelecionado(novoModo);
    
    if (novoModo === 'automatico') {
        const min = dadosSistema?.modo === 'auto' && dadosSistema.l_min !== null ? String(Math.round(dadosSistema.l_min * 100)) : '40';
        const max = dadosSistema?.modo === 'auto' && dadosSistema.l_max !== null ? String(Math.round(dadosSistema.l_max * 100)) : '70';
        setLuminosidadeMin(min); setLuminosidadeMax(max);
        setUsarPadraoAuto(parseFloat(min) === 40 && parseFloat(max) === 70);
    } else if (novoModo === 'horario') {
        // Usa os valores de h_inicio/h_fim de dadosSistema (convertidos) se o modo na API era 'horario'
        // Se não, usa string vazia.
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
    console.log("[handleConfirmar] Iniciando.");
    let systemSpecificPayload = {
      additionalProp1: {}
    };

    const formatTimeToHHMMSS_forAPI = (timeStr_HHMM) => {
      if (typeof timeStr_HHMM === 'string' && timeStr_HHMM.match(/^\d{2}:\d{2}$/)) {
        return `${timeStr_HHMM}:00`;
      }
      if (typeof timeStr_HHMM === 'string' && timeStr_HHMM.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return timeStr_HHMM; 
      }
      console.warn(`[handleConfirmar] Formato de tempo inválido para API: '${timeStr_HHMM}'. Enviando null.`);
      return null;
    };

    if (modoSelecionado === 'automatico') {
      systemSpecificPayload = {
        ...systemSpecificPayload,
        modo: 'auto',
        l_min: luminosidadeMin !== '' ? parseFloat(luminosidadeMin) / 100 : null,
        l_max: luminosidadeMax !== '' ? parseFloat(luminosidadeMax) / 100 : null,
        h_inicio: 0, 
        h_fim: 0     
      };
    } else if (modoSelecionado === 'horario') {
      console.warn("[handleConfirmar] Modo Horário: l_min e l_max estão sendo enviados conforme seu exemplo de payload. Verifique se a API os utiliza ou ignora neste modo.");
      systemSpecificPayload = {
        ...systemSpecificPayload,
        modo: 'horario', 
        l_min: 0.7,     
        l_max: 0.4,     
        h_inicio: formatTimeToHHMMSS_forAPI(horarioInicio),
        h_fim: formatTimeToHHMMSS_forAPI(horarioTermino)
      };
    } else if (modoSelecionado === 'manual') {
      systemSpecificPayload = {
        ...systemSpecificPayload,
        modo: 'manual',
        dispositivos: { "1": { "mac": "8D-4B-7D-5C", "value": true } } 
      };
    }
    
    const bodyPayload = {
      user_name: Cookies.get("userName"),
      validation_hash: Cookies.get('validation_hash'),
      city_id: sessionStorage.getItem('currentCityId') || "",
      system_name: "iluminacao",
      payload: systemSpecificPayload 
    };

    const userNameForPath = bodyPayload.user_name;
    const validationHashForPath = bodyPayload.validation_hash;
    const systemNameForPath = bodyPayload.system_name;
    const payloadSegmentForPath = encodeURIComponent(JSON.stringify(bodyPayload.payload));

    if (!userNameForPath || !validationHashForPath || !systemNameForPath) {
        console.error("[handleConfirmar] ERRO: user_name, validation_hash ou system_name ausentes para URL.");
        alert("Erro: Informações de autenticação/sistema ausentes.");
        setLoading(false); return;
    }
    
    let updateUrl = `http://56.125.35.215:8000/city/update/<username>/<validation_token>/<system_name>/<payload>?city_id=${bodyPayload.city_id}&user_name=${userNameForPath}&validation_hash=${validationHashForPath}&system_name=${systemNameForPath}&payload=${payloadSegmentForPath}`;
    const queryParams = new URLSearchParams({
      username: bodyPayload.user_name,
      validation_hash: bodyPayload.validation_hash, 
      system_name: bodyPayload.system_name,
      payload: JSON.stringify(bodyPayload.payload)
    });
    updateUrl += `?${queryParams.toString()}`;

    console.log("[handleConfirmar] Payload para CORPO:", JSON.stringify(bodyPayload, null, 2));
    console.log("[handleConfirmar] URL de ATUALIZAÇÃO:", updateUrl);
    
    setLoading(true);
    try {
      const response = await fetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      console.log("[handleConfirmar] Resposta API update - Status:", response.status, "Ok:", response.ok);
      if (!response.ok) {
        const errorData = await response.json().catch(async () => ({ detail: [{ msg: await response.text() || `Erro HTTP ${response.status}` }] }));
        console.error("[handleConfirmar] Erro ao salvar (dados API):", errorData);
        const errMsg = (errorData.detail && Array.isArray(errorData.detail) && errorData.detail.map(e => e.msg || JSON.stringify(e)).join('; ')) || `Erro ${response.statusText}`;
        throw new Error(errMsg);
      }
      
      const result = await response.json();
      console.log("[handleConfirmar] Resposta API update (sucesso):", result);
      alert('Configurações salvas com sucesso!');
      await getSistemaData();
    } catch (error) {
      console.error("[handleConfirmar] ERRO CAPTURADO ao salvar:", error.message);
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Restante do JSX (sem alterações visuais aqui, apenas lógicas acima)
  return (
    <div className="flex h-screen font-sans bg-gray-100">
      <Sidebar activeItem="iluminacao" />
      <main className="flex-1 bg-yellow-400 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
                <p className="ml-4 text-white text-xl">Processando...</p>
            </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Controle de Iluminação</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div className="flex-1 mb-4 rounded-md overflow-hidden" style={{ minHeight: 'calc(100% - 80px)' }}>
              <MapContainer center={centroMapa} zoom={15} className="w-full h-full" key={JSON.stringify(centroMapa) + '-' + (pontosIluminacao?.length || 0)}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                {pontosIluminacao && pontosIluminacao.map((ponto, index) => (
                  <Marker key={`iluminacao-${ponto.id || index}`} position={ponto.coordenadas || ponto}>
                    <Popup> {ponto.nome || `Ponto ${index + 1}`}<br /> Status: {ponto.status || 'Desconhecido'} </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end mt-8">
          <button className="bg-zinc-900 text-yellow-400 font-bold py-3 px-10 rounded-lg hover:bg-black focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-colors disabled:opacity-70" onClick={handleConfirmar} disabled={loading}>
            {loading ? 'Salvando...' : 'Confirmar e Salvar'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default IluminacaoController;