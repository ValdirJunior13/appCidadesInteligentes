import React, { useState } from 'react';
import styles from '../styles/MainContent.module.css';

const MainContent = () => {
    const [cidade, setCidade] = useState('');
    const [bairro, setBairro] = useState('');

    const handleCidadeChange = (e) => {
        setCidade(e.target.value);
    };

    const handleBairroChange = (e) => {
        setBairro(e.target.value);
    };

    return (
        <main>
            <section className={styles.tituloSite}>
                <h1>A Revolução das Cidades Inteligentes Começa Aqui!</h1>
                <p>Gerencie iluminação, drenagem, hortas, irrigação e muito mais em um único sistema integrado.</p>
            </section>

            <section className={styles.barraBusca}>
                <div className={styles.buscaContainer}>
                    <h1>Busca de Cidades e Bairros</h1>
                    <div className={styles.caixaBusca}>
                        <label htmlFor="cidade">Cidade:</label>
                        <input
                            type="text"
                            id="cidade"
                            name="cidade"
                            placeholder="Digite o nome da cidade"
                            value={cidade}
                            onChange={handleCidadeChange}
                        />
                        <ul id="listaCidades" className={styles.dropdown}></ul>
                    </div>

                    <div className={styles.caixaBusca}>
                        <label htmlFor="bairro">Bairro:</label>
                        <input
                            type="text"
                            id="bairro"
                            name="bairro"
                            placeholder="Digite o nome do bairro"
                            value={bairro}
                            onChange={handleBairroChange}
                        />
                        <ul id="listaBairros" className={styles.dropdown}></ul>
                    </div>
                </div>
            </section>

            <section className={styles.infoSensores}>
                <div className={styles.primeiraInfo}>
                    <h2>24/7</h2>
                    <p>Monitoramento em Tempo Real</p>
                </div>
                <div className={styles.segundaInfo}>
                    <h2>100+</h2>
                    <p>Sensores de Lixeiras Inteligentes</p>
                </div>
                <div className={styles.terceiraInfo}>
                    <h2>1M+</h2>
                    <p>Dados Coletados para Drenagem</p>
                </div>
            </section>
        </main>
    );
};

export default MainContent;