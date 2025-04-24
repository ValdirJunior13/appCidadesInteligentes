import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from './Sidebar';

delete L.Icon.Default.prototype._getIconUrl;  
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const IluminacaoController = ({ pontosIluminacao = [], cidadeSelecionada }) => {
  const centroMapa = cidadeSelecionada?.coordenadas || [-15.788, -47.879];
  const [modoSelecionado, setModoSelecionado] = useState('automatico');
  const [usarPadrao, setUsarPadrao] = useState(true);
  const [luminosidadeMin, setLuminosidadeMin] = useState('20');
  const [luminosidadeMax, setLuminosidadeMax] = useState('80');
  const [horarioInicio, setHorarioInicio] = useState('18:00');
  const [horarioTermino, setHorarioTermino] = useState('06:00');

  const handleConfirmar = () => {
    let mensagem = '';
    
    if (modoSelecionado === 'automatico') {
      mensagem = `Modo Automático configurado:\nLuminosidade mínima: ${luminosidadeMin}%\nLuminosidade máxima: ${luminosidadeMax}%`;
    } else if (modoSelecionado === 'horario') {
      mensagem = `Modo Horário configurado:\nInício: ${horarioInicio}\nTérmino: ${horarioTermino}`;
    } else {
      mensagem = 'Configurações manuais salvas';
    }
    
    alert(mensagem);
  };

  const togglePadrao = () => {
    const novoValor = !usarPadrao;
    setUsarPadrao(novoValor);
    

    if (novoValor) {
      setLuminosidadeMin('20');
      setLuminosidadeMax('80');
    }
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <Sidebar activeItem="iluminacao" />

      {/* Área principal */}
      <main className="flex-1 bg-yellow-400 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Controle de Iluminação</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna esquerda - Modos Automático e Horário */}
          <div className="space-y-6">
            {/* Modo Automático */}
            <div className="bg-zinc-900 text-white rounded-lg p-4">
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  name="modoIluminacao"
                  checked={modoSelecionado === 'automatico'}
                  onChange={() => setModoSelecionado('automatico')}
                  className="mr-2"
                />
                <h2 className="text-lg font-semibold">Modo automático:</h2>
              </div>
              <p className="text-sm mb-4">
                Nesse modo você tem a opção de escolher a falta de luminosidade para que o sistema fique ativo automaticamente.
              </p>
              
              <div className="space-y-2 ml-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={usarPadrao}
                    onChange={togglePadrao}
                    disabled={modoSelecionado !== 'automatico'}
                  />
                  <span>Padrão</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!usarPadrao}
                    onChange={() => setUsarPadrao(false)}
                    disabled={modoSelecionado !== 'automatico'}
                  />
                  <span>Definir valores</span>
                </div>
                
                {!usarPadrao && (
                  <div className="space-y-2 mt-2">
                    <div className="flex flex-col">
                      <label>Luminosidade mínima:</label>
                      <input
                        type="text"
                        className="text-black rounded px-2 py-1 w-full"
                        value={luminosidadeMin}
                        onChange={(e) => setLuminosidadeMin(e.target.value)}
                        disabled={modoSelecionado !== 'automatico'}
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <label>Luminosidade máxima:</label>
                      <input
                        type="text"
                        className="text-black rounded px-2 py-1 w-full"
                        value={luminosidadeMax}
                        onChange={(e) => setLuminosidadeMax(e.target.value)}
                        disabled={modoSelecionado !== 'automatico'}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modo Horário */}
            <div className="bg-zinc-900 text-white rounded-lg p-4">
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  name="modoIluminacao"
                  checked={modoSelecionado === 'horario'}
                  onChange={() => setModoSelecionado('horario')}
                  className="mr-2"
                />
                <h2 className="text-lg font-semibold">Modo Horário:</h2>
            </div>
            <p className="text-sm mb-4">
                Nesse modo você tem a opção de escolher o horário para ligar e desligar o sistema de iluminação.
            </p>
            
            <div className="space-y-2 ml-4">
                <div className="flex flex-col">
                <label>Horário de início:</label>
                <input
                    type="time"
                    className="text-black rounded px-2 py-1 w-full"
                    value={horarioInicio}
                    onChange={(e) => setHorarioInicio(e.target.value)}
                    disabled={modoSelecionado !== 'horario'}
                />
                </div>
                
                <div className="flex flex-col">
                <label>Horário de término:</label>
                <input
                    type="time"
                    className="text-black rounded px-2 py-1 w-full"
                    value={horarioTermino}
                    onChange={(e) => setHorarioTermino(e.target.value)}
                    disabled={modoSelecionado !== 'horario'}
                />
                </div>
            </div>
            </div>
        </div>

          {/* Coluna direita - Modo Manual e Mapa */}
        <div className="bg-zinc-900 text-white rounded-lg p-4 flex flex-col h-full">
            <div className="flex items-center mb-2">
            <input
                type="radio"
                name="modoIluminacao"
                checked={modoSelecionado === 'manual'}
                onChange={() => setModoSelecionado('manual')}
                className="mr-2"
            />
            <h2 className="text-lg font-semibold">Modo manual:</h2>
            </div>
            <p className="text-sm mb-4">
            Nesse modo você controla os dispositivos individualmente, basta clicar no dispositivo e definir seu estado (ligado ou desligado).
            </p>
            
            <div className="flex-1 mb-4">
            <MapContainer
                center={centroMapa}
                zoom={15}
                className="w-full h-80 rounded"
            >
                <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
                />
                {pontosIluminacao.map((ponto, index) => (
                <Marker key={`iluminacao-${index}`} position={ponto}>
                    <Popup>
                    Ponto de iluminação {index + 1}<br />
                    Status: {index % 2 === 0 ? 'Ligado' : 'Desligado'}<br />
                    Última atualização: 1h atrás
                    </Popup>
                </Marker>
                ))}
            </MapContainer>
            </div>
        </div>
        </div>

        {/* Botão Confirmar */}
        <div className="flex justify-end mt-4">
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

export default IluminacaoController;