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

// Ícone personalizado
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Validação de coordenadas
const checkCoordinatesValidity = (coords) => {
  return coords &&
    Array.isArray(coords) &&
    coords.length === 2 &&
    !isNaN(parseFloat(coords[0])) &&
    !isNaN(parseFloat(coords[1]));
};

// Componente para ajustar a visão do mapa
const MapViewControl = ({ center, zoom, bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length === 2 && bounds[0] && bounds[1] &&
        checkCoordinatesValidity(bounds[0]) && checkCoordinatesValidity(bounds[1])) {
      try {
        map.flyToBounds(bounds, { padding: [50, 50] });
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

const DrenagemController = ({ pontosDrenagem = [], cidadeSelecionada }) => {
  const centroMapa = cidadeSelecionada?.coordenadas || [-15.788, -47.879];
  const [modoSelecionado, setModoSelecionado] = useState('automatico');
  const [aguaAcumulada, setAguaAcumulada] = useState('50');
  const [loading, setLoading] = useState(false);

  const [systemData, setSystemData] = useState({
    user_name: Cookies.get("userName"),
    city_name: sessionStorage.getItem('currentCity'),
    validation_hash: Cookies.get("validation_hash"),
    system_name: "",
    payload: "",
  });

  const [dispositivos, setDispositivos] = useState(
    pontosDrenagem.map((ponto, index) => ({
      id: index,
      posicao: ponto,
      status: false
    }))
  );

  const handleConfirmar = () => {
    let mensagem = '';

    if (modoSelecionado === 'automatico') {
      mensagem = `Modo Automático configurado:\nQuantidade de água acumulada em %: ${aguaAcumulada}%`;
    } else {
      const dispositivosAtivos = dispositivos.filter(d => d.status).length;
      mensagem = `Modo Manual:\n${dispositivosAtivos} bombas de drenagem ativadas`;
    }

    alert(mensagem);
  };

  const toggleDispositivo = (id) => {
    if (modoSelecionado === 'manual') {
      setDispositivos(dispositivos.map(dispositivo =>
        dispositivo.id === id
          ? { ...dispositivo, status: !dispositivo.status }
          : dispositivo
      ));
    }
  };

  const sistemaData = async () => {
    if (
      systemData.user_name &&
      systemData.city_id &&
      systemData.validation_hash &&
      systemData.system_name &&
      systemData.payload
    ) {
      setLoading(true);
      try {
        const response = await fetch(
          `http://city/update/${systemData.user_name}/${systemData.validation_hash}/${systemData.system_name}/${systemData.payload}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: systemData.user_name,
              validation_token: systemData.validation_hash,
              system_name: systemData.system_name,
              payload: systemData.payload,
              city_id: systemData.city_id,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Erro: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Resposta da API:", data);
      } catch (error) {
        console.error("Erro ao atualizar os dados do sistema:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getSistemaData = async () => {
    try {
      setLoading(true);

      const sessionCityId = sessionStorage.getItem('currentCityId');
      if (!sessionCityId) throw new Error("ID da cidade não encontrado no sessionStorage");

      const usernameCookie = Cookies.get("userName");
      if (!usernameCookie) throw new Error("Nome de usuário não encontrado nos cookies");

      const validationToken = Cookies.get('validationToken');
      if (!validationToken) throw new Error("Token de validação ausente");

      const apiUrl = `http://56.125.35.215:8000/city/get-system-data/<city_id>/<username>/<validation_token>/<system_name>?city_id=${sessionCityId}&user_name=${usernameCookie}&validation_token=${validationToken}&system_name=drenagem`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Dados do sistema:", data);
      return data;

    } catch (error) {
      console.error("Erro ao obter dados do sistema:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-sans">
      <Sidebar activeItem="drenagem" />
      <main className="flex-1 bg-yellow-400 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Controle de Drenagem</h1>
        </div>

        <div className="flex flex-col space-y-6">
          <div className="bg-zinc-900 text-white rounded-lg p-4">
            <div className="flex items-center mb-2">
              <input
                type="radio"
                name="modoDrenagem"
                checked={modoSelecionado === 'automatico'}
                onChange={() => setModoSelecionado('automatico')}
                className="mr-2"
              />
              <h2 className="text-lg font-semibold">Modo automático:</h2>
            </div>
            <p className="text-sm mb-4">
              Nesse modo você indica a quantidade de coluna d'água para que as bombas de drenagem comecem a operar (em %). 
              Elas funcionarão até que toda a coluna d'água seja esvaziada.
            </p>

            <div className="flex flex-col space-y-2 ml-4">
              <label>Quantidade de água acumulada em %:</label>
              <input
                type="number"
                min="0"
                max="100"
                className="text-black rounded px-2 py-1 w-24"
                value={aguaAcumulada}
                onChange={(e) => setAguaAcumulada(e.target.value)}
                disabled={modoSelecionado !== 'automatico'}
              />
            </div>
          </div>

          <div className="bg-zinc-900 text-white rounded-lg p-4">
            <div className="flex items-center mb-2">
              <input
                type="radio"
                name="modoDrenagem"
                checked={modoSelecionado === 'manual'}
                onChange={() => setModoSelecionado('manual')}
                className="mr-2"
              />
              <h2 className="text-lg font-semibold">Modo manual:</h2>
            </div>
            <p className="text-sm mb-4">
              Nesse modo você controla os dispositivos individualmente, basta clicar no dispositivo e definir seu estado (ligado ou desligado).
            </p>

            <div className="h-80 w-full rounded overflow-hidden">
              <MapContainer center={centroMapa} zoom={15} className="w-full h-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {dispositivos.map((dispositivo) => (
                  <Marker 
                    key={`drenagem-${dispositivo.id}`} 
                    position={dispositivo.posicao}
                    eventHandlers={{
                      click: () => toggleDispositivo(dispositivo.id)
                    }}
                    icon={customIcon}
                  >
                    <Popup>
                      Bomba de drenagem {dispositivo.id + 1}<br />
                      Status: {dispositivo.status ? 'LIGADA' : 'DESLIGADA'}<br />
                      Última ativação: 2h atrás
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            className="bg-zinc-900 text-yellow-400 font-bold py-2 px-6 rounded-lg hover:bg-black transition-colors"
            onClick={handleConfirmar}
          >
            Confirmar
          </button>
        </div>
      </main>
    </div>
  );
};

export default DrenagemController;
