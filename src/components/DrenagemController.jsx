import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from './Sidebar';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

// Corrige o carregamento dos ícones do Leaflet
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

const checkCoordinatesValidity = (coords) => {
  return coords && Array.isArray(coords) && coords.length === 2 &&
         !isNaN(parseFloat(coords[0])) && !isNaN(parseFloat(coords[1]));
};

const MapViewControl = ({ center, zoom, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length === 2 && bounds[0] && bounds[1] &&
        checkCoordinatesValidity(bounds[0]) && checkCoordinatesValidity(bounds[1])) {
      try { map.flyToBounds(bounds, { padding: [50, 50] }); }
      catch (e) {
        console.error("[MapViewControl] Erro map.flyToBounds:", e, bounds);
        if (center && checkCoordinatesValidity(center)) map.flyTo(center, zoom || 12);
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

const DrenagemController = ({ pontosDrenagem = [], cidadeSelecionada }) => {
  const centroMapa = cidadeSelecionada?.coordenadas || [-15.788, -47.879];
  
  const [dadosSistemaApi, setDadosSistemaApi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modoSelecionado, setModoSelecionado] = useState('automatico');
  const [valorAtivacao, setValorAtivacao] = useState('0.5');

  const [dispositivosMapa, setDispositivosMapa] = useState([]);

  useEffect(() => {
    setDispositivosMapa(
      pontosDrenagem.map((ponto, index) => ({
        id: ponto.id || index,
        posicao: ponto.coordenadas || ponto,
        nome: ponto.nome || `Bomba ${index + 1}`,
        status: ponto.status || false
      }))
    );
  }, [pontosDrenagem]);

  const getSistemaData = async () => {
    console.log("[DrenagemController getSistemaData] INICIANDO.");
    setLoading(true);
    try {
      const sessionCityId = sessionStorage.getItem('currentCityId');
      const usernameCookie = Cookies.get("userName");
      const validationHashCookie = Cookies.get('validation_hash');

      if (!sessionCityId || !usernameCookie || !validationHashCookie) {
        const missingItems = [];
        if (!sessionCityId) missingItems.push("ID da cidade");
        if (!usernameCookie) missingItems.push("Nome de usuário");
        if (!validationHashCookie) missingItems.push("Token de validação (validation_hash)");
        const missing = missingItems.join(', ');
        console.error("[DrenagemController getSistemaData] ERRO: Informações ausentes:", missing);
        throw new Error(`Informações ausentes: ${missing}`);
      }
      
      const apiUrl = `http://56.125.35.215:8000/city/get-system-data/<city_id>/<username>/<validation_token>/<system_name>?city_id=${sessionCityId}&user_name=${usernameCookie}&validation_token=${validationHashCookie}&system_name=drenagem`;
      console.log("[DrenagemController getSistemaData] URL:", apiUrl);

      const response = await fetch(apiUrl, { method: "GET", headers: { "Accept": "application/json" } });
      console.log("[DrenagemController getSistemaData] Resposta API - Status:", response.status, "Ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DrenagemController getSistemaData] ERRO HTTP: ${response.status} - ${response.statusText}. Resposta: ${errorText}`);
        throw new Error(`Erro HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log("[DrenagemController getSistemaData] Dados API (JSON):", JSON.stringify(data, null, 2));
      setDadosSistemaApi(data); // Linha que o erro indicava
      return data;
    } catch (error) {
      console.error("[DrenagemController getSistemaData] ERRO CAPTURADO:", error.message);
      setDadosSistemaApi(null);
    } finally {
      setLoading(false);
      console.log("[DrenagemController getSistemaData] FINALIZANDO.");
    }
  };
  
  useEffect(() => {
    console.log("[DrenagemController Mount] Chamando getSistemaData.");
    getSistemaData();
  }, []); // Array de dependências vazio, executa apenas na montagem

  useEffect(() => {
    if (dadosSistemaApi) {
      console.log("[DrenagemController Effect dadosSistemaApi] Processando dados recebidos:", dadosSistemaApi);
      const { modo: modoApi, valor_ativacao: valorApi } = dadosSistemaApi;
      
      let novoModoUi = 'automatico'; // Padrão
      if (modoApi === 'auto') {
        novoModoUi = 'automatico';
      } else if (modoApi === 'manual') {
        novoModoUi = 'manual';
      } else {
        console.warn(`[DrenagemController Effect dadosSistemaApi] Modo API ('${modoApi}') desconhecido. Usando '${novoModoUi}'.`);
      }

      // Apenas atualiza o estado se o novo valor for diferente do atual
      if (modoSelecionado !== novoModoUi) {
        console.log(`[DrenagemController Effect dadosSistemaApi] Alterando modoSelecionado de '${modoSelecionado}' para '${novoModoUi}'`);
        setModoSelecionado(novoModoUi);
      }

      const novoValorUi = valorApi !== null && valorApi !== undefined ? String(valorApi) : '0.5';
      if (valorAtivacao !== novoValorUi) {
         console.log(`[DrenagemController Effect dadosSistemaApi] Alterando valorAtivacao de '${valorAtivacao}' para '${novoValorUi}'`);
        setValorAtivacao(novoValorUi);
      }
      
    } else {
      console.log("[DrenagemController Effect dadosSistemaApi] dadosSistemaApi é null. Resetando formulário para padrões, se necessário.");
      if (modoSelecionado !== 'automatico') {
        setModoSelecionado('automatico');
      }
      if (valorAtivacao !== '0.5') {
        setValorAtivacao('0.5');
      }
    }
  }, [dadosSistemaApi]); // A dependência é APENAS dadosSistemaApi

  const handleModoChange = (novoModo) => {
    console.log(`[DrenagemController handleModoChange] Modo alterado para: ${novoModo}`);
    setModoSelecionado(novoModo); // Atualiza o modo selecionado
    
    // Se mudar para automático, preenche o valor de ativação com base nos dados da API ou um padrão
    if (novoModo === 'automatico') {
      const valorApiAuto = dadosSistemaApi?.modo === 'auto' && dadosSistemaApi.valor_ativacao !== null && dadosSistemaApi.valor_ativacao !== undefined 
                           ? String(dadosSistemaApi.valor_ativacao) 
                           : '0.5'; // Padrão se não houver dados ou se o modo na API não for auto
      setValorAtivacao(valorApiAuto);
    }
    // Para o modo manual, não há necessidade de alterar 'valorAtivacao' aqui,
    // pois ele não é usado diretamente pela UI do modo manual principal.
  };
  
  const handleConfirmar = async () => {
    console.log("[DrenagemController handleConfirmar] Iniciando.");
    let systemSpecificPayload = { additionalProp1: {} };

    if (modoSelecionado === 'automatico') {
      systemSpecificPayload = {
        ...systemSpecificPayload,
        modo: 'auto',
        valor_ativacao: valorAtivacao !== '' ? parseFloat(valorAtivacao) : null
      };
    } else if (modoSelecionado === 'manual') {
      systemSpecificPayload = {
        ...systemSpecificPayload,
        modo: 'manual',
        dispositivos: {} 
      };
    }
    
    const bodyPayload = {
      user_name: Cookies.get("userName"),
      validation_hash: Cookies.get('validation_hash'),
      city_id: sessionStorage.getItem('currentCityId') || "",
      system_name: "drenagem",
      payload: systemSpecificPayload 
    };

    const userNameForPath = bodyPayload.user_name;
    const validationHashForPath = bodyPayload.validation_hash;
    const systemNameForPath = bodyPayload.system_name;
    const payloadSegmentForPath = encodeURIComponent(JSON.stringify(bodyPayload.payload));

    if (!userNameForPath || !validationHashForPath || !systemNameForPath) {
        console.error("[DrenagemController handleConfirmar] ERRO: user_name, validation_hash ou system_name ausentes para URL.");
        alert("Erro: Informações de autenticação/sistema ausentes.");
        setLoading(false); return;
    }
    
    // URL CORRETA para o POST de UPDATE, conforme documentação da API (sem query params redundantes)
    const updateUrl = `http://56.125.35.215:8000/city/update/<username>/<validation_token>/<system_name>/<payload>?city_id=${bodyPayload.city_id}&user_name=${userNameForPath}&validation_hash=${validationHashForPath}&system_name=${systemNameForPath}&payload=${payloadSegmentForPath}`;

    console.log("[DrenagemController handleConfirmar] Payload para CORPO:", JSON.stringify(bodyPayload, null, 2));
    console.log("[DrenagemController handleConfirmar] URL de ATUALIZAÇÃO (POST):", updateUrl);
    
    setLoading(true);
    try {
      const response = await fetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      console.log("[DrenagemController handleConfirmar] Resposta API update - Status:", response.status, "Ok:", response.ok);
      if (!response.ok) {
        const errorData = await response.json().catch(async () => ({ detail: [{ msg: await response.text() || `Erro HTTP ${response.status}` }] }));
        console.error("[DrenagemController handleConfirmar] Erro ao salvar (dados API):", errorData);
        const errMsg = (errorData.detail && Array.isArray(errorData.detail) && errorData.detail.map(e => e.msg || JSON.stringify(e)).join('; ')) || `Erro ${response.statusText}`;
        throw new Error(errMsg);
      }
      
      const result = await response.json();
      console.log("[DrenagemController handleConfirmar] Resposta API update (sucesso):", result);
      alert('Configurações de drenagem salvas com sucesso!');
      await getSistemaData();
    } catch (error) {
      console.error("[DrenagemController handleConfirmar] ERRO CAPTURADO ao salvar:", error.message);
      alert(`Erro ao salvar configurações de drenagem: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleDispositivo = (id) => {
    if (modoSelecionado === 'manual') {
      setDispositivosMapa(prevDispositivos =>
        prevDispositivos.map(dispositivo =>
          dispositivo.id === id
            ? { ...dispositivo, status: !dispositivo.status }
            : dispositivo
        )
      );
    }
  };

  return (
    <div className="flex h-screen font-sans bg-gray-100"> {/* Fundo geral cinza claro */}
      <Sidebar activeItem="drenagem" />
      {/* Conteúdo Principal com fundo amarelo */}
      <main className="flex-1 bg-blue-50  p-4 md:p-6 lg:p-8 overflow-y-auto">
        {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                {/* Spinner com borda amarela */}
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
                <p className="ml-4 text-white text-xl">Processando...</p>
            </div>
        )}
        <div className="flex justify-between items-center mb-6">
          {/* Título com texto preto */}
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Controle de Drenagem</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna da Esquerda: Controles de Modo */}
          <div className="space-y-6">
            {/* Card Modo Automático */}
            <div className="bg-zinc-900 text-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center mb-3">
                <input type="radio" id="modoAutomaticoDrenagem" name="modoDrenagem" 
                       checked={modoSelecionado === 'automatico'} 
                       onChange={() => handleModoChange('automatico')} 
                       className="mr-3 h-5 w-5 text-yellow-400 focus:ring-yellow-500 border-gray-500 cursor-pointer"
                />
                <label htmlFor="modoAutomaticoDrenagem" className="text-xl font-semibold cursor-pointer">Modo Automático</label>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Define a ativação das bombas com base no valor de ativação.
              </p>
              <div className="space-y-4 ml-4">
                <div>
                  <label htmlFor="valorAtivacaoInputDrenagem" className="block text-sm font-medium text-gray-300 mb-1">
                    Valor de Ativação (0.0 - 1.0):
                  </label>
                  <input 
                    id="valorAtivacaoInputDrenagem" 
                    type="number" step="0.1" min="0" max="1" 
                    className="bg-gray-700 text-white rounded px-3 py-2 w-full border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50" 
                    value={valorAtivacao} 
                    onChange={(e) => setValorAtivacao(e.target.value)} 
                    disabled={modoSelecionado !== 'automatico'} 
                    placeholder="Ex: 0.8"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Modo Manual e Mapa */}
          <div className="bg-zinc-900 text-white rounded-lg p-6 shadow-lg flex flex-col h-full">
            <div className="flex items-center mb-3">
              <input 
                type="radio" id="modoManualDrenagem" name="modoDrenagem" 
                checked={modoSelecionado === 'manual'} 
                onChange={() => handleModoChange('manual')} 
                className="mr-3 h-5 w-5 text-yellow-400 focus:ring-yellow-500 border-gray-500 cursor-pointer"
              />
              <label htmlFor="modoManualDrenagem" className="text-xl font-semibold cursor-pointer">Modo Manual</label>
            </div>
            <p className="text-sm text-gray-300 mb-4">Controle individual das bombas de drenagem no mapa.</p>
            <div className="flex-1 mb-4 rounded-md overflow-hidden" style={{ minHeight: 'calc(100% - 80px)' }}>
              <MapContainer 
                center={centroMapa} zoom={15} className="w-full h-full"
                key={JSON.stringify(centroMapa) + '-' + (dispositivosMapa?.length || 0)}
              >
                <MapViewControl center={centroMapa} zoom={15} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                {dispositivosMapa && dispositivosMapa.map((dispositivo) => (
                  <Marker 
                    key={`drenagem-${dispositivo.id}`} 
                    position={dispositivo.posicao}
                    icon={customIcon}
                    eventHandlers={{
                      click: () => {
                        if (modoSelecionado === 'manual') {
                          toggleDispositivo(dispositivo.id);
                        }
                      }
                    }}
                  >
                    <Popup>
                      {dispositivo.nome || `Bomba ${dispositivo.id}`}<br />
                      Status: {dispositivo.status ? 'LIGADA' : 'DESLIGADA'} <br />
                      {modoSelecionado === 'manual' && 
                        <button 
                          onClick={() => toggleDispositivo(dispositivo.id)} 
                          className="mt-2 px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-black rounded font-semibold"
                        >
                          Alternar Estado
                        </button>}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end mt-8">
          <button 
            className="bg-zinc-900 text-yellow-400 font-bold py-3 px-10 rounded-lg hover:bg-black focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-colors disabled:opacity-70" 
            onClick={handleConfirmar} 
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Confirmar e Salvar'}
          </button>
        </div>
      </main>
    </div>
  );
};

DrenagemController.propTypes = {
  pontosDrenagem: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    coordenadas: PropTypes.arrayOf(PropTypes.number).isRequired,
    nome: PropTypes.string,
    status: PropTypes.bool,
  })),
  cidadeSelecionada: PropTypes.shape({
    coordenadas: PropTypes.arrayOf(PropTypes.number),
  }),
};

export default DrenagemController;