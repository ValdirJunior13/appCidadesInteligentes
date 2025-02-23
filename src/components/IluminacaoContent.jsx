import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const IluminacaoContent = () => {
    return (
        <main>
            <section className="text-center py-8 bg-gray-100">
                <h1 className="text-3xl font-bold">Gestão Inteligente das Iluminações Urbanas</h1>
            </section>

            <section className="flex flex-wrap justify-center gap-6 p-6">
                <div className="bg-white p-6 shadow-lg rounded-lg w-80 text-center">
                    <img src="../assets/images/monitor.png" alt="Monitoramento em Tempo Real" className="mx-auto" />
                    <h2 className="text-xl font-semibold mt-4">Monitoramento em Tempo Real</h2>
                    <p className="mt-2">Acompanhe os níveis de iluminação e ajuste a intensidade conforme necessário, garantindo eficiência energética e segurança pública.</p>
                </div>
                <div className="bg-white p-6 shadow-lg rounded-lg w-80 text-center">
                    <img src="../assets/images/...png" alt="Controle Automatizado de Iluminação" className="mx-auto" />
                    <h2 className="text-xl font-semibold mt-4">Controle Automatizado de Iluminação</h2>
                    <p className="mt-2">Sistemas inteligentes que ligam e desligam as luzes automaticamente, adaptando-se às condições ambientais e horários pré-definidos.</p>
                </div>
                <div className="bg-white p-6 shadow-lg rounded-lg w-80 text-center">
                    <img src="../assets/images/...png" alt="Sensores Inteligentes" className="mx-auto" />
                    <h2 className="text-xl font-semibold mt-4">Sensores Inteligentes</h2>
                    <p className="mt-2">Detectam a luminosidade ambiente e ajustam a iluminação automaticamente, alertando sobre falhas ou necessidades de manutenção.</p>
                </div>
                <div className="bg-white p-6 shadow-lg rounded-lg w-80 text-center">
                    <img src="../assets/images/...png" alt="Eficiência Energética" className="mx-auto" />
                    <h2 className="text-xl font-semibold mt-4">Eficiência Energética</h2>
                    <p className="mt-2">Reduza o consumo de energia com sistemas que operam apenas quando necessário, diminuindo custos e impactos ambientais.</p>
                </div>
            </section>

            <section className="flex flex-col md:flex-row items-center gap-6 p-6">
                <div className="w-full md:w-1/2">
                    <img src="../assets/images/...png" alt="Gestão de Iluminação Urbana" className="w-full rounded-lg" />
                </div>
                <div className="w-full md:w-1/2">
                    <h2 className="text-2xl font-bold mb-4">Por Que Escolher Nosso Sistema de Gestão de Iluminação?</h2>
                    <ul className="space-y-2">
                        <li className="flex items-center"><FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2" /> Monitoramento em tempo real.</li>
                        <li className="flex items-center"><FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2" /> Controle automatizado de luzes em vias públicas.</li>
                        <li className="flex items-center"><FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2" /> Eficiência energética e redução de custos.</li>
                        <li className="flex items-center"><FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2" /> Integração com outros sistemas urbanos inteligentes.</li>
                    </ul>
                    <p className="mt-4"><a href="#" className="text-blue-600 hover:underline">Saiba Mais</a></p>
                </div>
            </section>
        </main>
    );
};

export default IluminacaoContent;
