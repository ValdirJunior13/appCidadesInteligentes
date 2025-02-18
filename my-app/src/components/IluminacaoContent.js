import React from 'react';
import styles from '../styles/MainContent.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const IluminacaoContent =() => {
    <main>
        <section className = {styles.tituloIluminacao}>
            <h1>Gestão Inteligente das Iluminações Urbanas</h1>
        </section>

        <section className = {styles.quadradosIluminacao}>
            <div className = {styles.quadrados}>
                <div className={styles.quadrado1}>
                    <img src="../assets/images/monitor.png" alt="Monitoramento em Tempo Real" />
                    <h2>Monitoramento em Tempo Real</h2>
                    <p>Acompanhe os níveis de iluminação e ajuste a intensidade conforme necessário, garantindo eficiência energética e segurança pública.</p>
                </div>
                <div className = {styles.quadrado2}>
                    <img src="../assets/images/...png" alt="Controle Automatizado de Iluminação" />
                    <h2>Controle Automatizado de Iluminação</h2>
                    <p>Sistemas inteligentes que ligam e desligam as luzes automaticamente, adaptando-se às condições ambientais e horários pré-definidos, reduzindo o consumo de energia.</p>
                </div>
                <div className = {styles.quadrado3}>
                <img src="../assets/images/...png" alt ="Sensores Inteligentes" />
                <h2>Sensores Inteligentes</h2>
                <p>Detectam a luminosidade ambiente e ajustam a iluminação automaticamente, alertando sobre falhas ou necessidades de manutenção.</p>

                </div>

                <div className ={styles.quadrado4}>
                    <img src="../assets/images/...png" alt="Eficiência Energética" />
                    <h2>Eficiência Energética</h2>
                    <p>Reduza o consumo de energia com sistemas que operam apenas quando necessário, diminuindo custos e impactos ambientais.</p>
                </div>
            </div>        
        </section>

        <section className ={styles.informacoesSecundarias}>
            <div className ={styles.imagemIluminacao}>
                <img src="../assets/images/...png" alt="Gestão de Iluminação Urbana" />
            </div>

            <div className ={styles.nossoSistema}>
                <h2>Por Que Escolher Nosso Sistema de Gestão de Iluminação?</h2>
                <ul>
                    <li><FontAwesomeIcon icon={faCheck} /> Acompanhe os níveis de iluminacao e receba alertas sobre riscos de alagamentos, permitindo ações rápidas para proteger a cidade.</li>
                    <li><FontAwesomeIcon icon={faCheck} /> Controle automatizado de luzes em vias públicas.</li>
                    <li><FontAwesomeIcon icon={faCheck} /> Eficiência energética e redução de custos.</li>
                    <li><FontAwesomeIcon icon = {faCheck} /> Integração com outros sistemas urbanos inteligentes.</li>
                    <p><a href="#">Saiba Mais</a></p>
                </ul>
            </div>

        </section>
    </main>
}

export default IluminacaoContent;