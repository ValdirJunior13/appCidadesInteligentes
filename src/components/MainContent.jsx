import { useState } from "react";

const MainContent = () => {
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [showCities, setShowCities] = useState(false); 
  const [showBairros, setShowBairros] = useState(false); 

  const cidades = ["São Paulo", "Rio de Janeiro", "Brasília", "Recife"];
  const bairros = ["Centro", "Zona Sul", "Zona Norte", "Zona Leste"];

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col relative overflow-hidden">

      <img
        src="../src/assets/images/smart-city.png"
        alt="Cidade Inteligente"
        className="absolute bottom-0 right-0 max-w-4xl lg:max-w-5xl h-auto object-contain"
        style={{ maxWidth: "1024px" }}
      />

      <section className="flex-grow flex items-center">

        <div className="flex-1 py-16 px-50 text-left">
          <h1 className="text-8xl font-extrabold text-[#021526] mb-6">
            A Revolução das Cidades<br />Inteligentes Começa Aqui
          </h1>
          <p className="text-2xl mt-4 text-gray-700 mb-8">
            Gerencie iluminação, drenagem, lixeiras, irrigação e muito mais em um único sistema integrado.
          </p>

          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-8 max-w-6xl relative pb-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 bg-white rounded-full p-2 shadow-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="flex-1 p-3 rounded-full border-none focus:outline-none text-gray-700"
                />
                <button
                  className="absolute right-2 top-2 bg-transparent text-gray-500"
                  onClick={() => setShowCities(!showCities)}
                >
                  <img src="../src/assets/images/sinal-de-seta-para-baixo-para-navegar.png" alt="Seta para baixo" className="w-6 h-6" />
                </button>
                {showCities && (
                  <ul className="absolute top-12 left-0 bg-white border rounded-lg shadow-md w-full z-10">
                    {cidades.map((c) => (
                      <li
                        key={c}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => {
                          setCidade(c);
                          setShowCities(false);
                        }}
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Campo Bairro */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="flex-1 p-3 rounded-full border-none focus:outline-none text-gray-700"
                />
                <button
                  className="absolute right-2 top-2 bg-transparent text-gray-500"
                  onClick={() => setShowBairros(!showBairros)}
                >
                  <img src="../src/assets/images/sinal-de-seta-para-baixo-para-navegar.png" alt="Seta para baixo" className="w-4 h-4" />
                </button>
                {showBairros && (
                  <ul className="absolute top-12 left-0 bg-white border rounded-lg shadow-md w-full z-10">
                    {bairros.map((b) => (
                      <li
                        key={b}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => {
                          setBairro(b);
                          setShowBairros(false);
                        }}
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Botão de Pesquisa */}
              <button className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition">
                <img src="../src/assets/images/lupa.png" alt="Pesquisar" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainContent;
