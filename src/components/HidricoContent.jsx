import Quadrado from "./Quadrado";
import InformacoesSecundarias from "./InformacoesSecundarias";

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
