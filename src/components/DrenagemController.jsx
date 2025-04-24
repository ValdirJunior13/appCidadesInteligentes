import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from './Sidebar';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const DrenagemController = ({ pontosDrenagem = [], cidadeSelecionada }) => {
  const centroMapa = cidadeSelecionada?.coordenadas || [-15.788, -47.879];
  const [modoSelecionado, setModoSelecionado] = useState('automatico');
  const [aguaAcumulada, setAguaAcumulada] = useState('50');
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

  return (
    <div className="flex h-screen font-sans">
      <Sidebar activeItem="drenagem" />
      
      {/* Área principal - Layout de coluna única */}
      <main className="flex-1 bg-yellow-400 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Controle de Drenagem</h1>
        </div>

        {/* Container principal com coluna única */}
        <div className="flex flex-col space-y-6">
          {/* Modo Automático */}
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

          {/* Modo Manual */}
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
              <MapContainer
                center={centroMapa}
                zoom={15}
                className="w-full h-full"
              >
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

        {/* Botão Confirmar */}
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