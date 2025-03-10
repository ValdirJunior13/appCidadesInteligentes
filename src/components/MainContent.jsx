import { useState } from "react";

const MainContent = () => {
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col">
      {/* Hero Section */}
      <section className="flex-grow flex items-center">
        {/* Conteúdo centralizado */}
        <div className="flex-1 py-16 px-6 text-center">
          <h1 className="text-6xl font-extrabold text-[#021526]">
            A Revolução das Cidades Inteligentes Começa Aqui
          </h1>
          <p className="text-xl mt-4 text-gray-700">
            Gerencie iluminação, drenagem, lixeiras, irrigação e muito mais em um único sistema integrado.
          </p>

          {/* Barra de Pesquisa com Imagem */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 bg-white rounded-full p-2 shadow-lg">
              <input
                type="text"
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="flex-1 p-3 rounded-full border-none focus:outline-none text-gray-700"
              />
              <span className="text-gray-400">
                <img src="../src/assets/images/location.png" alt="Cidade" className="w-6 h-6" />
              </span>
              <input
                type="text"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="flex-1 p-3 rounded-full border-none focus:outline-none text-gray-700"
              />
              <button className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition">
                <img src="../src/assets/images/lupa.png" alt="Pesquisar" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Imagem à direita */}
        <div className="hidden md:block flex-1 p-8">
          <img
            src="../src/assets/images/smart-city.png"
            alt="Cidade Inteligente"
            className="w-full max-w-md mx-auto"
          />
        </div>
      </section>

      {/* Estatísticas - Layout contínuo */}
      <section className="py-12 px-6 text-center bg-sky-50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="p-6 rounded-lg shadow-lg bg-white">
            <h2 className="text-3xl font-bold text-blue-600">24/7</h2>
            <p className="text-gray-600">Monitoramento em Tempo Real</p>
          </div>
          <div className="p-6 rounded-lg shadow-lg bg-white">
            <h2 className="text-3xl font-bold text-blue-600">100+</h2>
            <p className="text-gray-600">Sensores de Lixeiras Inteligentes</p>
          </div>
          <div className="p-6 rounded-lg shadow-lg bg-white">
            <h2 className="text-3xl font-bold text-blue-600">1M+</h2>
            <p className="text-gray-600">Dados Coletados para Drenagem</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainContent;