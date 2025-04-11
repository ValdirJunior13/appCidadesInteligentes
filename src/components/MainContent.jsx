import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const MainContent = () => {
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [showCities, setShowCities] = useState(false);
  const [showBairros, setShowBairros] = useState(false);
  const [center, setCenter] = useState(null);

  const fetchCoordenadas = async (endereco) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`,
        {
          headers: {
            "User-Agent": "SeuApp/1.0"
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        return [parseFloat(lat), parseFloat(lon)];
      } else {
        return null;
      }
    } catch (err) {
      console.error("Erro ao buscar coordenadas:", err);
      return null;
    }
  };

  const handlePesquisar = async () => {
    const termoBusca = rua ? `${rua}, ${bairro}, ${cidade}` : bairro ? `${bairro}, ${cidade}` : cidade;
    const coords = await fetchCoordenadas(termoBusca);
    if (coords) {
      setCenter(coords);
    } else {
      alert("Localização não encontrada. Tente novamente.");
    }
  };

  return (
    /* imagem principal da página*/ 
    <div className="min-h-screen bg-sky-50 flex flex-col relative overflow-hidden">
      <img
        src="../src/assets/images/smart-city.png"
        alt="Cidade Inteligente"
        className="absolute bottom-0 right-0 max-w-4xl lg:max-w-5xl h-auto object-contain"
        style={{ maxWidth: "1024px" }}
      />

      <section className="flex-grow flex flex-col items-center">
        <div className="w-full max-w-6xl py-16 px-6 text-left">
          <h1 className="text-7xl font-extrabold text-[#021526] mb-6">
            A Revolução das Cidades<br/>Inteligentes Começa Aqui
          </h1>
          <p className="text-2xl mt-4 text-gray-700 mb-8">
            Gerencie iluminação, drenagem, lixeiras, irrigação e muito mais em um único sistema integrado.
          </p>

          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-8 w-full relative pb-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 bg-white rounded-full p-2 shadow-lg w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="flex-1 p-3 rounded-full border-none focus:outline-none text-gray-700"
                />
                <button
                  className="absolute right-2 top-4 bg-transparent text-gray-500"
                  onClick={() => setShowCities(!showCities)}
                >
                  <img src="../src/assets/images/sinal-de-seta-para-baixo-para-navegar.png" alt="Seta para baixo" className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="flex-1 p-3 rounded-full border-none focus:outline-none text-gray-700"
                />
                <button
                  className="absolute right-2 top-4 bg-transparent text-gray-500"
                  onClick={() => setShowBairros(!showBairros)}
                >
                  <img src="../src/assets/images/sinal-de-seta-para-baixo-para-navegar.png" alt="Seta para baixo" className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Rua"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  className="flex-1 p-3 rounded-full border-none focus:outline-none text-gray-700"
                />
                <button className = "absolute right-2 top-4 bg-transparent text-gray-500">
                <img src="../src/assets/images/sinal-de-seta-para-baixo-para-navegar.png" alt="Seta para baixo" className="w-4 h-4" />
                </button>
              </div>

              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
                onClick={handlePesquisar}
              >
                <img src="../src/assets/images/lupa.png" alt="Pesquisar" className="w-6 h-6" />
              </button>
            </div>
          </div>

          {center && (
            <div className="mt-12 flex justify-center">
              <div className="w-full max-w-4xl rounded-lg overflow-hidden shadow-lg border border-gray-300">
                <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-[400px] w-full rounded-lg">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={center} icon={customIcon}>
                    <Popup>{rua ? `${rua}, ${bairro}, ${cidade}` : bairro ? `${bairro}, ${cidade}` : cidade}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MainContent;
