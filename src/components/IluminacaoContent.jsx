import Quadrado from '../components/Quadrado';
import InformacoesSecundarias from '../components/InformacoesSecundarias';

const IluminacaoContent = () => {
    return (
        <main className="w-full container mx-auto p-6">
            <section className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Gestão Inteligente das Iluminações Urbanas
                </h1>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Quadrado 
                    imagem="../src/assets/images/monitor.png"
                    alt="Monitoramento em Tempo Real"
                    titulo="Monitoramento em Tempo Real"
                    descricao="Acompanhe os níveis de iluminação e ajuste a intensidade conforme necessário, garantindo eficiência energética e segurança pública."
                />
                <Quadrado 
                    imagem="../src/assets/images/light-bulb.png"
                    alt="Controle Automatizado de Iluminação"
                    titulo="Controle Automatizado de Iluminação"
                    descricao="Sistemas inteligentes que ligam e desligam as luzes automaticamente, adaptando-se às condições ambientais e horários pré-definidos."
                />
                <Quadrado 
                    imagem="../src/assets/images/temperature-control.png"
                    alt="Sensores Inteligentes"
                    titulo="Sensores Inteligentes"
                    descricao="Detectam a luminosidade ambiente e ajustam a iluminação automaticamente, alertando sobre falhas ou necessidades de manutenção."
                />
                <Quadrado 
                    imagem="../src/assets/images/energy.png"
                    alt="Eficiência Energética"
                    titulo="Eficiência Energética"
                    descricao="Reduza o consumo de energia com sistemas que operam apenas quando necessário, diminuindo custos e impactos ambientais."
                />
            </section>

            <InformacoesSecundarias
                imagem="../src/assets/images/street-light.png"
                alt="Gestão de Iluminação Urbana"
                titulo="Por Que Escolher Nosso Sistema de Gestão de Iluminação?"
                listaItens={[
                    "Monitoramento em tempo real.",
                    "Controle automatizado de luzes em vias públicas.",
                    "Eficiência energética e redução de custos.",
                    "Integração com outros sistemas urbanos inteligentes."
                ]}
            />
        </main>
    );
};

export default IluminacaoContent;