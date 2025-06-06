import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from './Sidebar';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

// Configuração do ícone do Leaflet
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

// Componente auxiliar para controle do mapa (mantido do seu original)
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

// Componente principal DrenagemController
const DrenagemController = ({ pontosDrenagem = [], cidadeSelecionada }) => {
  const centroMapa = useMemo(() => cidadeSelecionada?.coordenadas || [-15.788, -47.879], [cidadeSelecionada]);
  
  const [loading, setLoading] = useState(false);
  const [modoSelecionado, setModoSelecionado] = useState('automatico');
  const [valorAtivacao, setValorAtivacao] = useState('0.5');

  // O estado `dispositivosMapa` foi restaurado para permitir a interatividade no mapa
  const [dispositivosMapa, setDispositivosMapa] = useState([]);

  // =================================================================================
  // PONTO CRÍTICO: Este useEffect foi restaurado.
  // Ele é NECESSÁRIO para criar uma cópia dos pontos que pode ser modificada (ligar/desligar).
  //
  // ATENÇÃO: Para que ele NÃO cause um loop infinito, a prop `pontosDrenagem` que
  // vem do componente PAI deve ser estabilizada com `useMemo`, como explicado anteriormente.
  // =================================================================================
const pontosDrenagemString = JSON.stringify(pontosDrenagem);

useEffect(() => {
  console.log("Atualizando dispositivos do mapa porque o conteúdo de pontosDrenagem mudou.");
  
  // A lógica interna continua a mesma, mas agora usamos a prop original.
  setDispositivosMapa(
    pontosDrenagem.map((ponto, index) => ({
      id: ponto.id || index,
      posicao: ponto.coordenadas || [0, 0], // Usar um fallback seguro
      nome: ponto.nome || `Bomba ${index + 1}`,
      status: ponto.status || false
    }))
  );
// A MÁGICA: A dependência agora é a string, que só muda se o CONTEÚDO mudar.
}, [pontosDrenagemString]);
  const getSistemaData = useCallback(async () => {
    setLoading(true);
    try {
      const sessionCityId = sessionStorage.getItem('currentCityId');
      const usernameCookie = Cookies.get("userName");
      const validationHashCookie = Cookies.get('validation_hash');

      if (!sessionCityId || !usernameCookie || !validationHashCookie) {
        throw new Error("Informações de autenticação ausentes.");
      }
      
      const apiUrl = `http://56.125.35.215:8000/city/get-system-data/<city_id>/<username>/<validation_token>/<system_name>?city_id=${sessionCityId}&user_name=${usernameCookie}&validation_token=${validationHashCookie}&system_name=drenagem`;
      
      const response = await fetch(apiUrl, { method: "GET", headers: { "Accept": "application/json" } });
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data) {
        setModoSelecionado(data.modo === 'manual' ? 'manual' : 'automatico');
        const valorDaApi = data.valor_ativacao;
        setValorAtivacao((valorDaApi != null) ? String(valorDaApi) : '0.5');
      }
    } catch (error) {
      console.error("[Drenagem getSistemaData] ERRO:", error.message);
      setModoSelecionado('automatico');
      setValorAtivacao('0.5');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getSistemaData();
  }, [getSistemaData]);

  const postSystemData = async (systemSpecificPayload) => {
    setLoading(true);
    try {
        const userName = Cookies.get("userName");
        const validationHash = Cookies.get('validation_hash');
        const cityId = sessionStorage.getItem('currentCityId');

        if (!userName || !validationHash || !cityId) {
            throw new Error("Informações de autenticação ou ID da cidade ausentes.");
        }

        const bodyPayload = {
            user_name: userName,
            validation_hash: validationHash,
            city_id: cityId,
            system_name: "drenagem",
            payload: systemSpecificPayload
        };

        const updateUrl = `http://56.125.35.215:8000/city/update/<username>/<validation_token>/<system_name>/<payload>?city_id=${cityId}&user_name=${encodeURIComponent(userName)}&validation_hash=${encodeURIComponent(validationHash)}&system_name=drenagem&payload=${encodeURIComponent(JSON.stringify(systemSpecificPayload))}`;

        const response = await fetch(updateUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "Accept": "application/json" },
            body: JSON.stringify(bodyPayload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Erro desconhecido." }));
            throw new Error(errorData.detail || `Erro HTTP ${response.status}`);
        }

        await response.json();
        alert('Configurações de drenagem salvas com sucesso!');
        await getSistemaData();

    } catch (error) {
        console.error("[Drenagem postSystemData] ERRO AO SALVAR:", error.message);
        alert(`Erro ao salvar: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };

  const handleConfirmar = () => {
    let payload;
    if (modoSelecionado === 'automatico') {
      payload = {
        modo: 'auto',
        valor_ativacao: valorAtivacao !== '' ? parseFloat(valorAtivacao) : null
      };
    } else { // modo 'manual'
      payload = {
        modo: 'manual',
        // Envia o estado atual dos dispositivos que estão no mapa
        dispositivos: dispositivosMapa.reduce((acc, dev) => {
          acc[dev.id] = dev.status;
          return acc;
        }, {})
      };
    }
    postSystemData(payload);
  };
  
  // Função para alterar o status do dispositivo no mapa (restaurada)
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
    <div className="flex h-screen font-sans bg-gray-100">
      <Sidebar activeItem="drenagem" />
      <main className="flex-1 bg-blue-50 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
                <p className="ml-4 text-white text-xl">Processando...</p>
            </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6">Controle de Drenagem</h1>
        
        {/* Layout original de duas colunas restaurado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna da Esquerda: Controles de Modo */}
          <div className="space-y-6">
            <div className="bg-zinc-900 text-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center mb-3">
                <input type="radio" id="modoAutomaticoDrenagem" name="modoDrenagem" 
                       checked={modoSelecionado === 'automatico'} 
                       onChange={() => setModoSelecionado('automatico')} 
                       className="mr-3 h-5 w-5 text-yellow-400 focus:ring-yellow-500 cursor-pointer"/>
                <label htmlFor="modoAutomaticoDrenagem" className="text-xl font-semibold cursor-pointer">Modo Automático</label>
              </div>
              <p className="text-sm text-gray-300 mb-4">Define a ativação das bombas com base no valor de ativação.</p>
              <div className="space-y-4 ml-8">
                <label htmlFor="valorAtivacaoInputDrenagem" className="block text-sm font-medium text-gray-300 mb-1">
                    Valor de Ativação (0.0 - 1.0):
                </label>
                <input id="valorAtivacaoInputDrenagem" type="number" step="0.1" min="0" max="1" 
                       className="bg-gray-700 text-white rounded px-3 py-2 w-full disabled:opacity-50" 
                       value={valorAtivacao} 
                       onChange={(e) => setValorAtivacao(e.target.value)} 
                       disabled={modoSelecionado !== 'automatico'} 
                       placeholder="Ex: 0.8"/>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Modo Manual e Mapa */}
          <div className="bg-zinc-900 text-white rounded-lg p-6 shadow-lg flex flex-col h-full">
            <div className="flex items-center mb-3">
              <input type="radio" id="modoManualDrenagem" name="modoDrenagem" 
                     checked={modoSelecionado === 'manual'} 
                     onChange={() => setModoSelecionado('manual')} 
                     className="mr-3 h-5 w-5 text-yellow-400 focus:ring-yellow-500 cursor-pointer"/>
              <label htmlFor="modoManualDrenagem" className="text-xl font-semibold cursor-pointer">Modo Manual</label>
            </div>
            <p className="text-sm text-gray-300 mb-4">Controle individual das bombas de drenagem no mapa.</p>
            <div className="flex-1 rounded-md overflow-hidden" style={{ minHeight: '350px' }}>
              <MapContainer center={centroMapa} zoom={15} className="w-full h-full">
                <MapViewControl center={centroMapa} zoom={15} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {dispositivosMapa.map((dispositivo) => (
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
                    }}>
                    <Popup>
                      {dispositivo.nome}<br />
                      Status: {dispositivo.status ? 'LIGADA' : 'DESLIGADA'} <br />
                      {modoSelecionado === 'manual' && 
                        <button onClick={() => toggleDispositivo(dispositivo.id)} 
                                className="mt-2 px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-black rounded font-semibold">
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
            <button className="bg-zinc-900 text-yellow-400 font-bold py-3 px-10 rounded-lg hover:bg-black transition-colors duration-300 disabled:opacity-70" 
                    onClick={handleConfirmar} 
                    disabled={loading}>
                {loading ? 'Salvando...' : 'Confirmar e Salvar'}
            </button>
        </div>
      </main>
    </div>
  );
};

DrenagemController.propTypes = {
  pontosDrenagem: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    coordenadas: PropTypes.arrayOf(PropTypes.number).isRequired,
    nome: PropTypes.string,
    status: PropTypes.bool,
  })),
  cidadeSelecionada: PropTypes.shape({
    coordenadas: PropTypes.arrayOf(PropTypes.number),
  }),
};

export default DrenagemController;