import React from 'react';
import styles from '../styles/MainContent.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import Quadrado from './quadrado';
import InformacoesSecundarias from './InformacoesSecundarias';

const ControleLixoContent = () => {
    return(  
    <main>
    <section className = {styles.tituloLixo}>
        <div className = {styles.tituloLixo}>
            <h1>Nossos Recursos para Gerenciamento de Resíduos Solidos</h1>
        </div>
    </section>

    <section className = {styles.quadradosLixo}> 
        <div class = {styles.quadrados}>
            <Quadrado imagem = "../assets/images/monitor.png"
                        alt = "Coleta Inteligente"
                        titulo = "Coleta Inteligente"
                        descricao = "Sensores detectam quando as lixeiras atingem a capacidade máxima, acionando a coleta automaticamente."/>
            <Quadrado  imagem = "../assets/images/controle.png" alt = "Roteirização Otimizada"  titulo = "Roteirização Otimizada" descricao = "Algoritmos ajustam rotas para reduzir custos e emissões de CO₂"/> 
            <Quadrado imagem = "../assets/imagems/...png" alt = "Monitoramento em Tempo Real" titulo ="Monitoramento em Tempo Real" descricao = "Acompanhe o nível de resíduos e evite acúmulo e mau cheiro nos espaços urbanos."/>
            <Quadrado imagem = "../assets/imagens/...png" alt = "Reciclagem Automatizada" titulo = "Reciclagem Automatizada" descricao =" Classificação de resíduos para facilitar a reciclagem e reduzir o desperdício."/>
            </div>
            </section>
            <InformacoesSecundarias  imagem="../assets/images/water-management.png"
                alt="Gestão de Águas Urbanas"
                titulo="Por Que Escolher Nosso Sistema de Gestão de Águas?"
                listaItens={[
                    " Redução de custos operacionais na coleta de lixo.",
                    " Menos resíduos acumulados, evitando surtos de doenças.",
                    "Impacto ambiental reduzido com rotas otimizadas.",
                    "Facilidade de integração com outros serviços urbanos inteligentes.",
                    " Relatórios detalhados para análise e planejamento sustentável."
                ]}
            /> 
    </main>
    
)
}



export default ControleLixoContent;