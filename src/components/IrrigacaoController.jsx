import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from './Sidebar'; 

// Ícones dos marcadores Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const IrrigacaoController = ({ pontosIrrigacao = [], cidadeSelecionada }) => {
  const centroMapa = cidadeSelecionada?.coordenadas || [-15.788, -47.879];
  const [modo, setModo] = useState('automatico');
  const [usarPadrao, setUsarPadrao] = useState(true);
  const [umidadeMinima, setUmidadeMinima] = useState('30');
  const [tempoFuncionamento, setTempoFuncionamento] = useState('10');
  const [horarioInicio, setHorarioInicio] = useState('08:00');
  const [tempoFuncionamentoHorario, setTempoFuncionamentoHorario] = useState('30');
  const [repetir, setRepetir] = useState('sim');

  const handleConfirmarAutomatico = () => {
    alert(`Configurações salvas:\nUmidade mínima: ${umidadeMinima}%\nTempo: ${tempoFuncionamento} min`);
  };

  const handleConfirmarHorario = () => {
    alert(`Configurações salvas:\nHorário: ${horarioInicio}\nTempo: ${tempoFuncionamentoHorario} min\nRepetir: ${repetir}`);
  };

  const handleConfirmarManual = () => {
    alert('Configurações manuais salvas');
  };

  const togglePadrao = () => {
    setUsarPadrao(!usarPadrao);
    if (!usarPadrao) {
      setUmidadeMinima('30');
      setTempoFuncionamento('10');
    }
  };

  return (
    <div className="flex h-screen font-sans">
    <Sidebar activeItem="irrigacao" />
    

      {/* Área principal */}
      <main className="flex-1 bg-yellow-400 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Controle de irrigação</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Modo Automático */}
            <div className="bg-zinc-900 text-white rounded-lg p-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={modo === 'automatico'}
                  onChange={() => setModo('automatico')}
                  className="mr-2"
                />
                <h2 className="text-lg font-semibold">Modo automático:</h2>
              </div>
              <p className="text-sm mb-4">
                Nesse modo você tem a opção de escolher a faixa de umidade para que o sistema fique ativo automaticamente.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={usarPadrao}
                    onChange={togglePadrao}
                    disabled={modo !== 'automatico'} 
                  />
                  <span>Padrão</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={!usarPadrao}
                    onChange={() => setUsarPadrao(false)}
                    disabled={modo !== 'automatico'} 
                  />
                  <span>Definir valores</span>
                </div>
                
                {!usarPadrao && (
                  <>
                    <div className="flex flex-col mt-2 space-y-1">
                      <label>Umidade mínima:</label>
                      <input 
                        className="text-black rounded px-2 py-1" 
                        placeholder="0-100%" 
                        value={umidadeMinima}
                        onChange={(e) => setUmidadeMinima(e.target.value)}
                        disabled={modo !== 'automatico' || usarPadrao}
                      />
                    </div>
                    <div className="flex flex-col mt-2 space-y-1">
                      <label>Tempo de funcionamento:</label>
                      <input 
                        className="text-black rounded px-2 py-1" 
                        placeholder="minutos" 
                        value={tempoFuncionamento}
                        onChange={(e) => setTempoFuncionamento(e.target.value)}
                        disabled={modo !== 'automatico' || usarPadrao}
                      />
                    </div>
                  </>
                )}
                
                <button 
                  className="bg-yellow-400 text-black font-bold py-1 px-4 mt-2 rounded" 
                  onClick={handleConfirmarAutomatico}
                  disabled={modo !== 'automatico'}
                >
                  Confirmar
                </button>
              </div>
            </div>

            {/* Modo Horário */}
            <div className="bg-zinc-900 text-white rounded-lg p-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={modo === 'horario'}
                  onChange={() => setModo('horario')}
                  className="mr-2"
                />
                <h2 className="text-lg font-semibold">Modo Horário:</h2>
              </div>
              <p className="text-sm mb-4">
                Nesse modo você tem a opção de escolher o horário para ligar e desligar o sistema de irrigação.
              </p>
              <div className="flex flex-col space-y-2">
                <label>Horário de início:</label>
                <input 
                  type="time" 
                  className="text-black rounded px-2 py-1" 
                  value={horarioInicio}
                  onChange={(e) => setHorarioInicio(e.target.value)}
                  disabled={modo !== 'horario'} 
                />
                <label>Tempo de funcionamento:</label>
                <input 
                  className="text-black rounded px-2 py-1" 
                  placeholder="minutos" 
                  value={tempoFuncionamentoHorario}
                  onChange={(e) => setTempoFuncionamentoHorario(e.target.value)}
                  disabled={modo !== 'horario'} 
                />
                <div className="mt-2">
                  <label>Repetir:</label>
                  <div className="flex flex-col ml-2">
                    <label>
                      <input 
                        type="radio" 
                        name="repetir" 
                        checked={repetir === 'sim'}
                        onChange={() => setRepetir('sim')}
                        disabled={modo !== 'horario'} 
                      /> Sim
                    </label>
                    <label>
                      <input 
                        type="radio" 
                        name="repetir" 
                        checked={repetir === 'nao'}
                        onChange={() => setRepetir('nao')}
                        disabled={modo !== 'horario'} 
                      /> Não
                    </label>
                    <label>
                      <input 
                        type="radio" 
                        name="repetir" 
                        checked={repetir === 'personalizado'}
                        onChange={() => setRepetir('personalizado')}
                        disabled={modo !== 'horario'} 
                      /> Personalizado em horas
                    </label>
                  </div>
                </div>
                <button 
                  className="bg-yellow-400 text-black font-bold py-1 px-4 mt-2 rounded" 
                  onClick={handleConfirmarHorario}
                  disabled={modo !== 'horario'}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>

          {/* Modo Manual */}
          <div className="bg-zinc-900 text-white rounded-lg p-4 flex flex-col h-full">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={modo === 'manual'}
                onChange={() => setModo('manual')}
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
                {pontosIrrigacao.map((ponto, index) => (
                  <Marker key={`irrigacao-${index}`} position={ponto}>
                    <Popup>
                      Ponto {index + 1}<br />
                      Status: Ativo<br />
                      Última rega: 2h atrás
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <button 
              className="bg-yellow-400 text-black font-bold py-2 px-4 rounded self-end" 
              onClick={handleConfirmarManual}
              disabled={modo !== 'manual'}
            >
              Confirmar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IrrigacaoController;