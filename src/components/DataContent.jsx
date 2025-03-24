

const SmartCityPage = () => {
return (
    <div className="min-h-screen bg-blue-50 p-6 flex flex-col justify-center items-center">
    <div className="max-w-6xl w-full grid grid-cols-2 gap-12 items-center">
        {/* Text Section */}
        <div>
        <h1 className="text-3xl font-bold text-blue-700 mb-4">
            O Futuro da Gestão Inteligente de Dados
        </h1>
        <p className="text-gray-700 text-base mb-6 leading-relaxed">
            No mundo das cidades inteligentes, a análise de dados desempenha um papel crucial na otimização do consumo de recursos essenciais, como energia, água e gestão de resíduos. Ao integrar sensores IoT e inteligência artificial, os gestores urbanos podem tomar decisões mais precisas, reduzir desperdícios e melhorar a qualidade de vida da população.
            A análise de dados nas cidades inteligentes otimiza o consumo de recursos essenciais. Na energia, a iluminação inteligente reduz desperdícios e custos. Na água, sensores monitoram vazamentos e ajustam a irrigação conforme o clima. A gestão de resíduos melhora a coleta com rotas otimizadas e separação automatizada. No transporte, semáforos dinâmicos e rotas inteligentes reduzem congestionamentos e emissões. Essas soluções tornam as cidades mais eficientes, sustentáveis e econômicas.
        </p>
        <a href="#" className="text-blue-600 font-semibold underline">
            Receba insights e tendências sobre cidades inteligentes diretamente no seu e-mail.
        </a>
        </div>

      {/* Image Section */}
        <div>
        <img src="../src/assets/images/data.png" alt="Dados" className="w-full" />
        </div>
    </div>

      {/* Newsletter Subscription */}
    <div className="max-w-5xl mx-auto mt-20 bg-blue-600 text-white p-8 rounded-lg text-center shadow-lg w-full">
        <h2 className="text-lg font-semibold mb-4">Assine Nossa Newsletter</h2>
        <div className="bg-white p-2 rounded-full flex items-center w-full max-w-2xl mx-auto">
        <input
            type="email"
            placeholder="Digite seu e-mail"
            className="p-4 flex-1 rounded-full text-gray-700 focus:outline-none"
        />
        <button className="bg-blue-600 text-white p-4 rounded-full ml-2 hover:bg-blue-700">
            →
        </button>
        </div>
    </div>
    </div>
);
};

export default SmartCityPage;
