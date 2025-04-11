import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Quadrado from "../components/Quadrado";

// Ícone personalizado para os marcadores
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const PaginaLoginComponent = () => {
  const [cidades, setCidades] = useState([
    {
      nome: "Santo Antônio",
      estado: "PE",
      cidade: "Belo Jardim",
      coordenadas: [-8.3330, -36.4200],
      pontos: {
        iluminacao: [[-8.3330, -36.4200], [-8.3332, -36.4202]],
        drenagem: [[-8.3328, -36.4198]],
        lixo: [[-8.3331, -36.4195]],
        irrigacao: [],
      },
    },
    {
      nome: "Rua do Rio",
      estado: "PE",
      cidade: "Belo Jardim",
      coordenadas: [-8.3365, -36.4250],
      pontos: {
        iluminacao: [[-8.3365, -36.4250]],
        drenagem: [[-8.3367, -36.4252]],
        lixo: [],
        irrigacao: [[-8.3368, -36.4253]],
      },
    },
    {
      nome: "Cohab I",
      estado: "PE",
      cidade: "Belo Jardim",
      coordenadas: [-8.3400, -36.4280],
      pontos: {
        iluminacao: [[-8.3400, -36.4280]],
        drenagem: [],
        lixo: [[-8.3402, -36.4281], [-8.3401, -36.4282]],
        irrigacao: [[-8.3403, -36.4283]],
      },
    },
  ]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState({
    nome: "",
    estado: "PE",
    cidade: "Belo Jardim",
  });

  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [pontosFiltrados, setPontosFiltrados] = useState([]);

  useEffect(() => {
    if (cidadeSelecionada && categoriaSelecionada) {
      const pontos = cidadeSelecionada.pontos[categoriaSelecionada] || [];
      setPontosFiltrados(pontos);
    } else {
      setPontosFiltrados([]);
    }
  }, [cidadeSelecionada, categoriaSelecionada]);

  const adicionarEndereco = () => {
    if (
      novoEndereco.nome.trim() &&
      novoEndereco.estado.trim() &&
      novoEndereco.cidade.trim()
    ) {
      const novaCidade = {
        ...novoEndereco,
        coordenadas: [-8.3356, -36.4242],
        pontos: {
          iluminacao: [],
          drenagem: [],
          lixo: [],
          irrigacao: [],
        },
      };
      setCidades([...cidades, novaCidade]);
      setNovoEndereco({ nome: "", estado: "PE", cidade: "Belo Jardim" });
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
        <h1 className="text-2xl font-bold mb-4 pb-6">
          Gerenciar Cidades de Belo Jardim
        </h1>

        <div className="flex flex-wrap gap-4">
          {cidades.map((local, index) => (
            <div key={index} className="relative">
              <div
                onClick={() => setCidadeSelecionada(local)}
                className={`cursor-pointer ${
                  cidadeSelecionada?.nome === local.nome
                    ? "ring-2 ring-blue-500 rounded-lg"
                    : ""
                }`}
              >
                <Quadrado
                  imagem="../src/assets/images/construcao-da-cidade.png"
                  titulo={local.nome}
                  descricao={`Estado: ${local.estado} • Cidade: ${local.cidade}`}
                />
              </div>

              {/* Botão de remover */}
              <button
                onClick={() => {
                  const novaLista = cidades.filter((_, i) => i !== index);
                  setCidades(novaLista);
                  if (cidadeSelecionada?.nome === local.nome) {
                    setCidadeSelecionada(null);
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
            onClick={() => setMostrarFormulario(true)}
            className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center text-3xl font-bold hover:bg-gray-100"
          >
            +
          </button>
        </div>

        {cidadeSelecionada && (
          <div className="mt-6">
            <div className="p-4 border rounded bg-gray-50 shadow mb-4">
              <h3 className="text-xl font-bold mb-2">
                Detalhes de {cidadeSelecionada.nome}
              </h3>
              <p>
                <strong>Estado:</strong> {cidadeSelecionada.estado}
              </p>
              <p>
                <strong>Cidade:</strong> {cidadeSelecionada.cidade}
              </p>
            </div>

            {/* Mapa */}
            <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300 shadow">
              <MapContainer
                center={cidadeSelecionada.coordenadas}
                zoom={15}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker
                  position={cidadeSelecionada.coordenadas}
                  icon={customIcon}
                >
                  <Popup>
                    {cidadeSelecionada.nome}, {cidadeSelecionada.cidade}
                  </Popup>
                </Marker>
                {pontosFiltrados.map((ponto, index) => (
                  <Marker key={index} position={ponto} icon={customIcon}>
                    <Popup>
                      {categoriaSelecionada} - Ponto {index + 1}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {categoriaSelecionada && (
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-800">
                  Mostrando {pontosFiltrados.length} pontos de{" "}
                  {categoriaSelecionada} em {cidadeSelecionada.nome}
                </h4>
              </div>
            )}
          </div>
        )}

        {mostrarFormulario && (
          <div className="mt-6 p-4 border border-gray-300 rounded w-full max-w-md bg-gray-50">
            <h3 className="text-lg font-bold mb-2">Novo Endereço</h3>
            <input
              type="text"
              placeholder="Nome"
              value={novoEndereco.nome}
              onChange={(e) =>
                setNovoEndereco({ ...novoEndereco, nome: e.target.value })
              }
              className="w-full mb-2 p-2 border rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={adicionarEndereco}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Adicionar
              </button>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginaLoginComponent;
