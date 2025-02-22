
import Quadrado from './components/Quadrado';
import InformacoesSecundarias from './InformacoesSecundarias';

const lixoContent = () => {
    return (
        <main className="container mx-auto p-6">
            <section className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Nossos Recursos para Gerenciamento de Resíduos Sólidos
                </h1>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Quadrado 
                    imagem="../assets/images/monitor.png"
                    alt="Coleta Inteligente"
                    titulo="Coleta Inteligente"
                    descricao="Sensores detectam quando as lixeiras atingem a capacidade máxima, acionando a coleta automaticamente." 
                />
                <Quadrado 
                    imagem="../assets/images/controle.png" 
                    alt="Roteirização Otimizada"  
                    titulo="Roteirização Otimizada" 
                    descricao="Algoritmos ajustam rotas para reduzir custos e emissões de CO₂" 
                /> 
                <Quadrado 
                    imagem="../assets/images/...png" 
                    alt="Monitoramento em Tempo Real" 
                    titulo="Monitoramento em Tempo Real" 
                    descricao="Acompanhe o nível de resíduos e evite acúmulo e mau cheiro nos espaços urbanos." 
                />
                <Quadrado 
                    imagem="../assets/images/...png" 
                    alt="Reciclagem Automatizada" 
                    titulo="Reciclagem Automatizada" 
                    descricao="Classificação de resíduos para facilitar a reciclagem e reduzir o desperdício." 
                />
            </section>

            <InformacoesSecundarias
                imagem="../assets/images/water-management.png"
                alt="Gestão de Águas Urbanas"
                titulo="Por Que Escolher Nosso Sistema de Gestão de Águas?"
                listaItens={[
                    "Redução de custos operacionais na coleta de lixo.",
                    "Menos resíduos acumulados, evitando surtos de doenças.",
                    "Impacto ambiental reduzido com rotas otimizadas.",
                    "Facilidade de integração com outros serviços urbanos inteligentes.",
                    "Relatórios detalhados para análise e planejamento sustentável."
                ]}
            />
        </main>
    )
}

export default lixoContent;
