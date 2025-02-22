import React from 'react';

const Quadrado = ({ imagem, alt, titulo, descricao, destaque }) => {
    return (
        <div className={`p-6 border rounded-lg shadow-md ${destaque ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'}`}>
            <img src={imagem} alt={alt} className="w-12 h-12 mx-auto" />
            <h2 className="text-xl font-bold mt-4 text-center">{titulo}</h2>
            <p className="mt-2 text-center">{descricao}</p>
        </div>
    );
};

const InformacoesSecundarias = ({ imagem, alt, titulo, listaItens }) => {
    return (
        <div className="flex flex-col md:flex-row items-center mt-10 gap-6">
            <img src={imagem} alt={alt} className="w-32 h-32" />
            <div>
                <h2 className="text-2xl font-bold text-gray-900">{titulo}</h2>
                <ul className="list-disc list-inside mt-4 text-gray-700">
                    {listaItens.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const HidricoContent = () => {
    return (
        <main className="p-6 max-w-5xl mx-auto">
            <section className="text-center">
                <h1 className="text-3xl font-bold text-blue-700">Gestão Inteligente das Águas Urbanas</h1>
            </section>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <Quadrado 
                    imagem="/assets/images/monitor.png" 
                    alt="Monitoramento em Tempo Real" 
                    titulo="Monitoramento em Tempo Real" 
                    descricao="Sensores detectam o nível da água e alertam sobre possíveis incidentes." 
                />
                <Quadrado 
                    imagem="/assets/images/settings.png" 
                    alt="Abertura e Fechamento Automatizado" 
                    titulo="Abertura e Fechamento Automatizado" 
                    descricao="Controle inteligente de comportas para evitar transbordamentos." 
                    destaque
                />
                <Quadrado 
                    imagem="/assets/images/analytics.png" 
                    alt="Análise de Dados Históricos" 
                    titulo="Análise de Dados Históricos" 
                    descricao="Uso de dados históricos para planejamento urbano mais eficiente." 
                />
            </section>
            <InformacoesSecundarias
                imagem="/assets/images/sewage.png"
                alt="Gestão de Águas Urbanas"
                titulo="Por Que Escolher Nosso Sistema?"
                listaItens={[
                    "Prevenção de inundações e alagamentos.",
                    "Uso eficiente da água para irrigação e consumo.",
                    "Monitoramento em tempo real da qualidade da água.",
                    "Redução de custos operacionais e desperdícios.",
                    "Integração com outros sistemas urbanos inteligentes."
                ]}
            />
        </main>
    );
};

export default HidricoContent;
