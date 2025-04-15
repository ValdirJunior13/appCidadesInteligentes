import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Quadrado from "../components/Quadrado";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom"; 

const MapViewControl = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

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

const PaginaLoginComponent = () => {
  const navigate = useNavigate(); 
  const [citys, setCitys] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState({
    user_name: "",
    name: "",
    state: "",
    city: "",
    validation_hash: "",
    coordenadas: null
  });
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [citySelecionada, setCitySelecionada] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [pontosFiltrados, setPontosFiltrados] = useState([]);

  useEffect(() => {
    const hash = Cookies.get("authHash");
    const userName = Cookies.get("userName");

    if (!hash || !userName) {
      navigate("/login");
    }

    const userRole = sessionStorage.getItem("userRole");
    console.log("Usuário com perfil:", userRole);
  }, [navigate]);

  useEffect(() => {
    if (mostrarFormulario && (novoEndereco.city || novoEndereco.state)) {
      const timer = setTimeout(() => {
        buscarCoordenadas();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [novoEndereco.city, novoEndereco.state, mostrarFormulario]);

  const buscarCoordenadas = async () => {
    if (!novoEndereco.city || !novoEndereco.state) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          `${novoEndereco.city}, ${novoEndereco.state}, Brasil`
        )}&countrycodes=br&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const resultadoPreciso =
          data.find((item) => {
            const address = item.address;
            return (
              (address.city?.toLowerCase() === novoEndereco.city.toLowerCase() ||
                address.town?.toLowerCase() === novoEndereco.city.toLowerCase() ||
                address.municipality?.toLowerCase() === novoEndereco.city.toLowerCase()) &&
              address.state?.toLowerCase().includes(novoEndereco.state.toLowerCase())
            );
          }) || data[0];

        const { lat, lon } = resultadoPreciso;
        const novasCoordenadas = [parseFloat(lat), parseFloat(lon)];

        setNovoEndereco((prev) => ({ ...prev, coordenadas: novasCoordenadas }));

        if (mapRef.current) {
          mapRef.current.flyTo(novasCoordenadas, 15);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (citySelecionada && categoriaSelecionada) {
      const pontos = citySelecionada.pontos?.[categoriaSelecionada] || [];
      setPontosFiltrados(pontos);
    } else {
      setPontosFiltrados([]);
    }
  }, [citySelecionada, categoriaSelecionada]);

  const adicionarEndereco = () => {
    if (
      novoEndereco.name.trim() &&
      novoEndereco.state.trim() &&
      novoEndereco.city.trim() &&
      novoEndereco.coordenadas
    ) {
      const novaCidade = {
        ...novoEndereco,
        pontos: {
          iluminacao: [],
          drenagem: [],
          lixo: [],
          irrigacao: [],
        },
      };

      setCitys([...citys, novaCidade]);
      setNovoEndereco({ name: "", state: "", city: "", coordenadas: null });
      setMostrarFormulario(false);
    }
  };

  const handleCategoriaClick = (categoria) => {
    setCategoriaSelecionada(categoria);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r border-gray-300">
        <h2 className="text-lg font-bold mb-4">Menu</h2>
        <ul className="space-y-2 text-sm">
          {["iluminacao", "drenagem", "lixo", "irrigacao"].map((cat) => (
            <li key={cat}>
              <button
                onClick={() => handleCategoriaClick(cat)}
                className={`w-full text-left hover:bg-gray-200 p-2 rounded ${
                  categoriaSelecionada === cat ? "bg-gray-300" : ""
                }`}
              >
                Gerenciamento de {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Gerenciador de Localidades</h1>

        <div className="flex flex-wrap gap-4">
          {citys.map((local, index) => (
            <div key={index} className="relative">
              <div
                onClick={() => setCitySelecionada(local)}
                className={`cursor-pointer ${
                  citySelecionada?.name === local.name ? "ring-2 ring-blue-500 rounded-lg" : ""
                }`}
              >
                <Quadrado
                  imagem="../src/assets/images/construcao-da-city.png"
                  titulo={local.name}
                  descricao={`${local.city}, ${local.state}`}
                />
              </div>

              <button
                onClick={() => {
                  const novaLista = citys.filter((_, i) => i !== index);
                  setCitys(novaLista);
                  if (citySelecionada?.name === local.name) {
                    setCitySelecionada(null);
                  }
                }}
                className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 text-xs font-bold"
                title="Remover"
              >
                ×
              </button>
            </div>
          ))}

          <button
            onClick={() => {
              setMostrarFormulario(true);
              setNovoEndereco({ name: "", state: "", city: "", coordenadas: null });
            }}
            className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center text-3xl font-bold hover:bg-gray-100"
          >
            +
          </button>
        </div>

        {/* Mapa principal */}
        <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300 shadow mt-4">
          <MapContainer
            center={[-8.3356, -36.4242]}
            zoom={13}
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

            <MapViewControl
              center={citySelecionada?.coordenadas || novoEndereco.coordenadas || [-8.3356, -36.4242]}
              zoom={15}
            />

            {citys.map((city, index) => (
              <Marker key={index} position={city.coordenadas} icon={customIcon}>
                <Popup>
                  {city.name}, {city.city}
                </Popup>
              </Marker>
            ))}

            {mostrarFormulario && novoEndereco.coordenadas && (
              <Marker position={novoEndereco.coordenadas} icon={customIcon}>
                <Popup>Nova localização</Popup>
              </Marker>
            )}

            {citySelecionada &&
              pontosFiltrados.map((ponto, index) => (
                <Marker key={`ponto-${index}`} position={ponto} icon={customIcon}>
                  <Popup>
                    {categoriaSelecionada} - Ponto {index + 1}
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>

        {/* Formulário e Detalhes */}
        {citySelecionada && (
          <div className="mt-6">
            <div className="p-4 border rounded bg-gray-50 shadow mb-4">
              <h3 className="text-xl font-bold mb-2">Detalhes de {citySelecionada.name}</h3>
              <p>
                <strong>Estado:</strong> {citySelecionada.state}
              </p>
              <p>
                <strong>Cidade:</strong> {citySelecionada.city}
              </p>
              <p>
                <strong>Coordenadas:</strong> {citySelecionada.coordenadas.join(", ")}
              </p>
            </div>

            {categoriaSelecionada && (
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-800">
                  Mostrando {pontosFiltrados.length} pontos de {categoriaSelecionada} em{" "}
                  {citySelecionada.name}
                </h4>
              </div>
            )}
          </div>
        )}

        {mostrarFormulario && (
          <div className="mt-6 p-4 border border-gray-300 rounded w-full max-w-md bg-gray-50">
            <h3 className="text-lg font-bold mb-2">Nova Localidade</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome"
                value={novoEndereco.name}
                onChange={(e) => setNovoEndereco({ ...novoEndereco, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Estado (UF)"
                value={novoEndereco.state}
                onChange={(e) => setNovoEndereco({ ...novoEndereco, state: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Cidade"
                value={novoEndereco.city}
                onChange={(e) => setNovoEndereco({ ...novoEndereco, city: e.target.value })}
                className="w-full p-2 border rounded"
              />
              {loading && <p className="text-sm text-blue-600">Buscando localização...</p>}
              {novoEndereco.coordenadas && !loading && (
                <p className="text-sm text-green-600">
                  Coordenadas: {novoEndereco.coordenadas.join(", ")}
                </p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={adicionarEndereco}
                  disabled={!novoEndereco.coordenadas || loading}
                  className={`px-4 py-2 rounded ${
                    novoEndereco.coordenadas && !loading
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginaLoginComponent;