import Quadrado from "./Quadrado";
import InformacoesSecundarias from "./InformacoesSecundarias";

const HidricoContent = () => {
    return (
        <main className="w-full container mx-auto p-6">
            <section className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Nossos Recursos para Gerenciamento de Recursos Hídricos
                </h1>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Quadrado 
                    imagem="../src/assets/images/monitor.svg" 
                    alt="Monitoramento em Tempo Real" 
                    titulo="Monitoramento em Tempo Real" 
                    descricao="Sensores detectam o nível da água e alertam sobre possíveis incidentes." 
                />
                <Quadrado 
                    imagem="../src/assets/images/settings.svg" 
                    alt="Abertura e Fechamento Automatizado" 
                    titulo="Abertura e Fechamento Automatizado" 
                    descricao="Controle inteligente de comportas para evitar transbordamentos." 
                    destaque
                />
                <Quadrado 
                    imagem="../src/assets/images/irrigation.svg" 
                    alt="Direcionamento para Reservatórios" 
                    titulo="Direcionamento para Reservatórios" 
                    descricao="Reutilização da água para irrigação e limpeza urbana." 
                />
                <Quadrado 
                    imagem="../src/assets/images/analytics.svg" 
                    alt="Análise de Dados Históricos" 
                    titulo="Análise de Dados Históricos" 
                    descricao="Uso de dados históricos para planejamento urbano mais eficiente." 
                />
            </section>

            <section className="w-full mb-6">
                <InformacoesSecundarias
                    imagem="../src/assets/images/sewage.svg"
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
            </section>
        </main>
    );
};

export default HidricoContent;