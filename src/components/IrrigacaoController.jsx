import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from './Sidebar'; 
import Cookies from 'js-cookie'; 

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const secondsToHHMM = (totalSeconds) => {
  if (typeof totalSeconds !== 'number' || isNaN(totalSeconds)) return "00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const HHMMToSeconds = (hhmm) => {
  if (typeof hhmm !== 'string' || !hhmm.includes(':')) return 0;
  const [hours, minutes] = hhmm.split(':').map(Number);
  return (hours * 3600) + (minutes * 60);
};

const decimalToPercentageString = (decimal) => {
  if (typeof decimal !== 'number' || isNaN(decimal)) return '0';
  return String(Math.round(decimal * 100));
};

const percentageStringToDecimal = (percentageStr) => {
  if (typeof percentageStr !== 'string' && typeof percentageStr !== 'number') return 0;
  return parseFloat(percentageStr) / 100;
};

const secondsToMinutesString = (seconds) => {
  if (typeof seconds !== 'number' || isNaN(seconds)) return '0';
  return String(Math.round(seconds / 60));
};

const minutesStringToSeconds = (minutesStr) => {
   if (typeof minutesStr !== 'string' && typeof minutesStr !== 'number') return 0;
  return parseInt(minutesStr) * 60;
};


const IrrigacaoController = ({ pontosIrrigacao = [], cidadeSelecionada }) => {
  const centroMapa = cidadeSelecionada?.coordenadas || [-15.788, -47.879];

  const [modo, setModo] = useState('automatico');
  const [usarPadraoAutomatico, setUsarPadraoAutomatico] = useState(true);
  const [umidadeMinima, setUmidadeMinima] = useState('30');
  const [tempoFuncionamentoAutomatico, setTempoFuncionamentoAutomatico] = useState('10');

  const [horarioInicio, setHorarioInicio] = useState('08:00');
  const [tempoFuncionamentoHorario, setTempoFuncionamentoHorario] = useState('30');
  const [repetirHorario, setRepetirHorario] = useState('sim'); 

  const [loading, setLoading] = useState(false);
  const [dadosSistema, setDadosSistema] = useState(null);

  const getSistemaData = useCallback(async () => {
    console.log("[getSistemaData] INICIANDO.");
    setLoading(true);
    try {
      const sessionCityId = sessionStorage.getItem('currentCityId');
      const usernameCookie = Cookies.get("userName");
      const validationHashCookie = Cookies.get('validation_hash');

      if (!sessionCityId || !usernameCookie || !validationHashCookie) {
        const missing = [];
        if (!sessionCityId) missing.push("ID da cidade");
        if (!usernameCookie) missing.push("Nome de usuário");
        if (!validationHashCookie) missing.push("Token de validação");
        console.error("[getSistemaData] ERRO: Informações ausentes:", missing.join(', '));
        throw new Error(`Informações ausentes: ${missing.join(', ')}`);
      }
      
      const apiUrl = `http://56.125.35.215:8000/city/get-system-data/<city_id>/<username>/<validation_token>/<system_name>?city_id=${sessionCityId}&user_name=${usernameCookie}&validation_token=${validationHashCookie}&system_name=irrigacao`;
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

      if (data) {
        setModo(data.modo || 'automatico');
        
        if (data.modo === 'automatico') {
            setUsarPadraoAutomatico(false); 
            setUmidadeMinima(decimalToPercentageString(data.u_min));
            setTempoFuncionamentoAutomatico(secondsToMinutesString(data.t_funcionamento_a || data.t_funcionamento_h || 0));
        } else { 
            setUsarPadraoAutomatico(true);
            setUmidadeMinima('30');
            setTempoFuncionamentoAutomatico('10');
        }

        setHorarioInicio(secondsToHHMM(data.h_inicio));
        setTempoFuncionamentoHorario(secondsToMinutesString(data.t_funcionamento_h));
        
        if (data.repetir === 1) { 
            setRepetirHorario('sim');
        } else { 
            setRepetirHorario('nao');
        }
      }
      return data;
    } catch (error) {
      console.error("[getSistemaData] ERRO CAPTURADO:", error.message);
      alert(`Erro ao carregar dados do sistema: ${error.message}`);
      setDadosSistema(null);
    } finally {
      setLoading(false);
      console.log("[getSistemaData] FINALIZANDO.");
    }
  }, []);

  useEffect(() => {
    getSistemaData();
  }, [getSistemaData]);

  const postSystemData = async (systemSpecificPayload) => {
    const userName = Cookies.get("userName");
    const validationHash = Cookies.get('validation_hash');
    const cityId = sessionStorage.getItem('currentCityId');

    if (!userName || !validationHash || !cityId) {
        alert("Erro: Informações de autenticação ou ID da cidade ausentes. Não é possível salvar.");
        console.error("[postSystemData] ERRO: user_name, validation_hash ou city_id ausentes.");
        setLoading(false); 
        return;
    }

    const bodyPayload = {
      user_name: userName,
      validation_hash: validationHash,
      city_id: cityId,
      system_name: "irrigacao", 
      payload: systemSpecificPayload
    };

 
    const userNameForPath = encodeURIComponent(userName);
    const validationHashForPath = encodeURIComponent(validationHash); 
    const systemNameForPath = encodeURIComponent("irrigacao"); 


    let updateUrl = `http://56.125.35.215:8000/city/update/<username>/<validation_token>/<system_name>/<payload>?city_id=${bodyPayload.city_id}&user_name=${userNameForPath}&validation_hash=${validationHashForPath}&system_name=${systemNameForPath}&payload=${systemNameForPath}`;


    console.log("[postSystemData] Payload para CORPO:", JSON.stringify(bodyPayload, null, 2));
    console.log("[postSystemData] URL de ATUALIZAÇÃO:", updateUrl);
    
    setLoading(true);
    try {
      const response = await fetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Accept": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      console.log("[postSystemData] Resposta API update - Status:", response.status, "Ok:", response.ok);
      if (!response.ok) {
        let errorData;
        let errorTextDetail = `Erro HTTP ${response.status} (${response.statusText})`;
        try {
            errorData = await response.json();
            if (errorData && errorData.detail) {
                errorTextDetail = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
            } else if (typeof errorData === 'string') { 
                errorTextDetail = errorData;
            }
        } catch (e) {
            const rawErrorText = await response.text();
            errorTextDetail = rawErrorText || errorTextDetail; 
        }
        console.error("[postSystemData] Erro ao salvar (dados API):", errorData || errorTextDetail);
        throw new Error(errorTextDetail);
      }
      
      const result = await response.json();
      console.log("[postSystemData] Resposta API update (sucesso):", result);
      alert('Configurações salvas com sucesso!');
      await getSistemaData(); 
    } catch (error) {
      console.error("[postSystemData] ERRO CAPTURADO ao salvar:", error.message);
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setLoading(false);
    }
};
  
  const handleSalvarConfiguracoes = () => {
    let systemSpecificPayload = {};

    if (modo === 'automatico') {
      if (usarPadraoAutomatico) {
        systemSpecificPayload = {
          modo: "auto",
          u_min: percentageStringToDecimal('30'), 
          t_funcionamento_a: minutesStringToSeconds('10') 
        };
      } else {
        systemSpecificPayload = {
          modo: "automatico",
          u_min: percentageStringToDecimal(umidadeMinima),
          // u_max: ???
          t_funcionamento_a: minutesStringToSeconds(tempoFuncionamentoAutomatico)
        };
      }
    } else if (modo === 'horario') {
      systemSpecificPayload = {
        modo: "horario",
        h_inicio: HHMMToSeconds(horarioInicio),
        t_funcionamento_h: minutesStringToSeconds(tempoFuncionamentoHorario),
        repetir: repetirHorario === 'sim' ? 1 : 0,
        periodo: repetirHorario === 'sim' ? 24 : 0
      };
    } else if (modo === 'manual') {
      systemSpecificPayload = {
        modo: "manual",
        dispositivos: dadosSistema?.dispositivos || {} 
      };
    } else {
      alert("Modo de operação não selecionado ou inválido.");
      return;
    }
    postSystemData(systemSpecificPayload);
  };

  const togglePadraoAutomatico = () => {
    const novoUsarPadrao = !usarPadraoAutomatico;
    setUsarPadraoAutomatico(novoUsarPadrao);
    if (novoUsarPadrao) { 
      setUmidadeMinima('30'); 
      setTempoFuncionamentoAutomatico('10'); 
    }
  };

  const handleModoChange = (novoModo) => {
    setModo(novoModo);
    if (novoModo !== 'automatico' && !usarPadraoAutomatico) {

    }
  };

  if (loading && !dadosSistema) {
    return (
      <div className="flex h-screen font-sans">
        <Sidebar activeItem="irrigacao" />
        <main className="flex-1 bg-blue-50 p-6 flex justify-center items-center">
          <p className="text-xl text-black">Carregando dados do sistema...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans">
      <Sidebar activeItem="irrigacao" />
      
      <main className="flex-1 bg-blue-50 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Controle de irrigação</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna da Esquerda: Modo Automático e Modo Horário */}
          <div className="space-y-6">
            {/* Modo Automático */}
            <div className="bg-zinc-900 text-white rounded-lg p-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="modoAutomaticoCheck"
                  checked={modo === 'automatico'}
                  onChange={() => handleModoChange('automatico')}
                  className="mr-2 h-5 w-5 text-yellow-400 focus:ring-yellow-300 border-gray-300 rounded"
                />
                <label htmlFor="modoAutomaticoCheck" className="text-lg font-semibold cursor-pointer">Modo automático:</label>
              </div>
              <p className="text-sm mb-4 text-gray-300">
                Nesse modo você tem a opção de escolher a faixa de umidade para que o sistema fique ativo automaticamente.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="usarPadraoCheck"
                    checked={usarPadraoAutomatico}
                    onChange={togglePadraoAutomatico}
                    disabled={modo !== 'automatico'}
                    className="h-4 w-4 text-yellow-400 focus:ring-yellow-300 border-gray-300 rounded"
                  />
                  <label htmlFor="usarPadraoCheck" className="text-sm cursor-pointer">Padrão</label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="definirValoresCheck"
                    checked={!usarPadraoAutomatico}
                    onChange={() => setUsarPadraoAutomatico(false)}
                    disabled={modo !== 'automatico'}
                    className="h-4 w-4 text-yellow-400 focus:ring-yellow-300 border-gray-300 rounded"
                  />
                  <label htmlFor="definirValoresCheck" className="text-sm cursor-pointer">Definir valores</label>
                </div>
                
                {!usarPadraoAutomatico && (
                  <>
                    <div className="flex flex-col mt-2 space-y-1">
                      <label htmlFor="umidadeMinimaInput" className="text-sm">Umidade mínima (%):</label>
                      <input 
                        id="umidadeMinimaInput"
                        type="number"
                        className="bg-white text-black rounded px-3 py-2 w-full focus:ring-2 focus:ring-yellow-400 focus:border-transparent" 
                        placeholder="0-100" 
                        value={umidadeMinima}
                        onChange={(e) => setUmidadeMinima(e.target.value)}
                        disabled={modo !== 'automatico' || usarPadraoAutomatico}
                      />
                    </div>
                    <div className="flex flex-col mt-2 space-y-1">
                      <label htmlFor="tempoFuncAutoInput" className="text-sm">Tempo de funcionamento (minutos):</label>
                      <input 
                        id="tempoFuncAutoInput"
                        type="number"
                        className="bg-white text-black rounded px-3 py-2 w-full focus:ring-2 focus:ring-yellow-400 focus:border-transparent" 
                        placeholder="minutos" 
                        value={tempoFuncionamentoAutomatico}
                        onChange={(e) => setTempoFuncionamentoAutomatico(e.target.value)}
                        disabled={modo !== 'automatico' || usarPadraoAutomatico}
                      />
                    </div>
                  </>
                )}
                {/* Botão Confirmar removido daqui */}
              </div>
            </div>

            {/* Modo Horário */}
            <div className="bg-zinc-900 text-white rounded-lg p-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="modoHorarioCheck"
                  checked={modo === 'horario'}
                  onChange={() => handleModoChange('horario')}
                  className="mr-2 h-5 w-5 text-yellow-400 focus:ring-yellow-300 border-gray-300 rounded"
                />
                <label htmlFor="modoHorarioCheck" className="text-lg font-semibold cursor-pointer">Modo Horário:</label>
              </div>
              <p className="text-sm mb-4 text-gray-300">
                Nesse modo você tem a opção de escolher o horário para ligar e desligar o sistema de irrigação.
              </p>
              <div className="flex flex-col space-y-3">
                <div>
                    <label htmlFor="horarioInicioInput" className="text-sm">Horário de início:</label>
                    <input 
                        id="horarioInicioInput"
                        type="time" 
                        className="bg-white text-black rounded px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-yellow-400 focus:border-transparent" 
                        value={horarioInicio}
                        onChange={(e) => setHorarioInicio(e.target.value)}
                        disabled={modo !== 'horario'} 
                    />
                </div>
                <div>
                    <label htmlFor="tempoFuncHorarioInput" className="text-sm">Tempo de funcionamento (minutos):</label>
                    <input 
                        id="tempoFuncHorarioInput"
                        type="number"
                        className="bg-white text-black rounded px-3 py-2 mt-1 w-full focus:ring-2 focus:ring-yellow-400 focus:border-transparent" 
                        placeholder="minutos" 
                        value={tempoFuncionamentoHorario}
                        onChange={(e) => setTempoFuncionamentoHorario(e.target.value)}
                        disabled={modo !== 'horario'} 
                    />
                </div>
                <div className="mt-2">
                  <label className="text-sm">Repetir diariamente:</label>
                  <div className="flex flex-col ml-2 mt-1 space-y-1">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="repetirHorarioDiariamente" 
                        value="sim"
                        checked={repetirHorario === 'sim'}
                        onChange={() => setRepetirHorario('sim')}
                        disabled={modo !== 'horario'} 
                        className="mr-2 h-4 w-4 text-yellow-400 focus:ring-yellow-300 border-gray-300"
                      /> Sim
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="repetirHorarioDiariamente" 
                        value="nao"
                        checked={repetirHorario === 'nao'}
                        onChange={() => setRepetirHorario('nao')}
                        disabled={modo !== 'horario'} 
                        className="mr-2 h-4 w-4 text-yellow-400 focus:ring-yellow-300 border-gray-300"
                      /> Não
                    </label>
                  </div>
                </div>
                 {/* Botão Confirmar removido daqui */}
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Modo Manual */}
          <div className="bg-zinc-900 text-white rounded-lg p-4 flex flex-col h-full">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="modoManualCheck"
                checked={modo === 'manual'}
                onChange={() => handleModoChange('manual')}
                className="mr-2 h-5 w-5 text-yellow-400 focus:ring-yellow-300 border-gray-300 rounded"
              />
              <label htmlFor="modoManualCheck" className="text-lg font-semibold cursor-pointer">Modo manual:</label>
            </div>
            <p className="text-sm mb-4 text-gray-300">
              Nesse modo você controla os dispositivos individualmente, basta clicar no dispositivo e definir seu estado (ligado ou desligado).
            </p>
            <div className="flex-grow mb-4 min-h-[300px] lg:min-h-[400px]">
              <MapContainer
                center={centroMapa}
                zoom={15}
                className="w-full h-full rounded"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {pontosIrrigacao.map((ponto, index) => (
                  <Marker key={`irrigacao-${index}`} position={ponto.coordenadas || ponto}>
                    <Popup>
                      Ponto {ponto.nome || index + 1}<br />
                      Status: {ponto.status || "Desconhecido"}<br />
                      Última rega: {ponto.ultimaRega || "N/A"}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
             {/* Botão Confirmar removido daqui */}
          </div>
        </div>

        {/* Botão Global para Salvar Configurações */}
        <div className="mt-8 flex justify-end">
            <button
                onClick={handleSalvarConfiguracoes}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md disabled:opacity-50"
            >
                {loading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
        </div>
      </main>
    </div>
  );
};

export default IrrigacaoController;