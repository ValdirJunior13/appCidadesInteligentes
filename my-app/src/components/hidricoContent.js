import React from 'react';
import styles from '../styles/MainContent.module.css';
import Quadrado from './quadrado'; 
import InformacoesSecundarias from './InformacoesSecundarias';


const HidricoContent = () => {
    return (
        <main>
            <section className={styles.tituloIluminacao}>
                <h1>Gestão Inteligente das Iluminações Urbanas</h1>
            </section>

            <section className={styles.quadradosIluminacao}>
                <div className={styles.quadrados}>
                    <Quadrado 
                        imagem="../assets/images/monitor.png" 
                        alt="Monitoramento em Tempo Real" 
                        titulo="Monitoramento em Tempo Real" 
                        descricao="Acompanhe os níveis de iluminação e ajuste a intensidade conforme necessário, garantindo eficiência energética e segurança pública." 
                    />
                    <Quadrado 
                        imagem="../assets/images/controle.png" 
                        alt="Controle Automatizado de Iluminação" 
                        titulo="Controle Automatizado de Iluminação" 
                        descricao="Sistemas inteligentes que ligam e desligam as luzes automaticamente, adaptando-se às condições ambientais e horários pré-definidos, reduzindo o consumo de energia." 
                    />
                    <Quadrado 
                        imagem="../assets/images/sensores.png" 
                        alt="Sensores Inteligentes" 
                        titulo="Sensores Inteligentes" 
                        descricao="Detectam a luminosidade ambiente e ajustam a iluminação automaticamente, alertando sobre falhas ou necessidades de manutenção." 
                    />
                    <Quadrado 
                        imagem="../assets/images/eficiencia.png" 
                        alt="Eficiência Energética" 
                        titulo="Eficiência Energética" 
                        descricao="Reduza o consumo de energia com sistemas que operam apenas quando necessário, diminuindo custos e impactos ambientais." 
                    />
                </div>
            </section>
            
            <InformacoesSecundarias
                imagem="../assets/images/water-management.png"
                alt="Gestão de Águas Urbanas"
                titulo="Por Que Escolher Nosso Sistema de Gestão de Águas?"
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
