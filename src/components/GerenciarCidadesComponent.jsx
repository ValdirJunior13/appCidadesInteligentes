import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from '../context/AuthContext';
import Cookies from "js-cookie";
import Sidebar from "./Sidebar";

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

const MapViewControl = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const GerenciarCidadesComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuarioLogado, logout } = useAuth();
  const [citySelecionada, setCitySelecionada] = useState(location.state?.city || null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [pontosFiltrados, setPontosFiltrados] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const mapRef = useRef(null);

const [tempFiltrosMapa, setTempFiltrosMapa] = useState({
  iluminacao: true, irrigacao: true, drenagem: true, lixo: true}); 
  const [filtrosMapa, setFiltrosMapa] = useState({ ...tempFiltrosMapa });
  useEffect(() => {
    if (!usuarioLogado) {
      navigate("/login");
    }
    if (!citySelecionada) {
      navigate("/");
    }
  }, [usuarioLogado, citySelecionada, navigate]);

  useEffect(() => {
    if (citySelecionada && categoriaSelecionada) {
      setPontosFiltrados(citySelecionada.pontos[categoriaSelecionada] || []);
    }
  }, [categoriaSelecionada, citySelecionada]);


  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

const handleTempFiltroChange = (categoria) => { setTempFiltrosMapa(prev => ({...prev, [categoria]: !prev[categoria] }));
};

  if (!usuarioLogado || !citySelecionada) {
    return null;
  }
  

  const confirmarFiltros = () => {
    setFiltrosMapa({ ...tempFiltrosMapa });
    console.log("Filtros aplicados:", tempFiltrosMapa);
  };

  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Conteúdo Principal */}

      <Sidebar activeItem={categoriaSelecionada} className={`${showSidebar ? "block" : "hidden md:block"}` }
/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleToggleSidebar}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{citySelecionada.name}</h1>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                {Cookies.get("userName")?.charAt(0).toUpperCase() || "U"}
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                <button
                  onClick={handleLogoutClick}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Sair da Conta
                </button>
              </div>
            )}
          </div>
        </header>
  
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Informações da cidade</h2>
              <div className="space-y-2">
                <p className="font-semibold">Cond. {citySelecionada.name}</p>
                <p>{citySelecionada.city}, {citySelecionada.state}</p>
              </div>
            </div>
  
            {/* Configurações do Mapa */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Configurações do mapa</h2>
              <p className="text-sm mb-2">Filtrar dispositivos:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(filtrosMapa).map(([categoria, ativo]) => (
                  <label key={categoria} className="flex items-center space-x-2">
                    <input 
                    type="checkbox"
                    checked={tempFiltrosMapa[categoria]}
                    onChange={() => handleTempFiltroChange(categoria)}
                    />
                    <span className="capitalize text-sm">{categoria}</span>
                  </label>
                ))}
              </div>
      {/* botão de aplicar filtros */}<button
              onClick={confirmarFiltros}
className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
> Confirmar filtros
          </button>
            </div>
          </div>
  
          {/* Mapa */}
          <section className="mb-8">
            <div className="h-96 w-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <MapContainer
                center={citySelecionada.coordenadas}
                zoom={15}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
                whenCreated={(map) => {
                  mapRef.current = map;
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
  
                <MapViewControl center={citySelecionada.coordenadas} zoom={15} />
  
                <Marker position={citySelecionada.coordenadas} icon={customIcon}>
                  <Popup>
                    {citySelecionada.name}, {citySelecionada.city}
                  </Popup>
                </Marker>
  
                {Object.entries(filtrosMapa).map(([categoria, ativo]) => (
                  ativo && citySelecionada.pontos[categoria].map((ponto, index) => (
                    <Marker key={`${categoria}-${index}`} position={ponto} icon={customIcon}>
                      <Popup>
                        {categoria} - Ponto {index + 1}
                      </Popup>
                    </Marker>
                  ))
                ))}
              </MapContainer>
            </div>
          </section>
  
          {/* Estatísticas */}
          <section className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Estatísticas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(filtrosMapa).map(([categoria, ativo]) => (
                ativo && (
                  <div 
                    key={categoria} 
                    className={`p-4 rounded-lg ${
                      categoria === "iluminacao" ? "bg-blue-50 text-blue-600" :
                      categoria === "drenagem" ? "bg-green-50 text-green-600" :
                      categoria === "lixo" ? "bg-yellow-50 text-yellow-600" :
                      "bg-purple-50 text-purple-600"
                    }`}
                  >
                    <p className="text-sm capitalize">{categoria}</p>
                    <p className="font-bold text-2xl">{citySelecionada.pontos[categoria].length}</p>
                  </div>
                )
              ))}
            </div>
          </section>
  
          {/* Lista de Pontos da Categoria Selecionada */}
          {categoriaSelecionada && (
            <section className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Pontos de {categoriaSelecionada} ({pontosFiltrados.length})
                </h2>
                {filtrosMapa[categoriaSelecionada] === false && (
                  <span className="text-sm text-red-500">(Filtro desativado)</span>
                )}
              </div>
              
              <div className="space-y-3">
                {pontosFiltrados.length > 0 ? (
                  pontosFiltrados.map((ponto, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <p className="font-medium">Ponto {index + 1}</p>
                      <p className="text-sm text-gray-500">Coordenadas: {ponto.join(", ")}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    {filtrosMapa[categoriaSelecionada] 
                      ? "Nenhum ponto cadastrado nesta categoria" 
                      : "Categoria filtrada - ative o filtro para visualizar"}
                  </p>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default GerenciarCidadesComponent;