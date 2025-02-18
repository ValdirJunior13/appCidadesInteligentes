import React from 'react';
import styles from '../styles/MainContent.module.css';

const Quadrado = ({ imagem, alt = "Imagem", titulo = "Título", descricao = "Descrição" }) => {
    return (
        <div className={styles.quadrado}>
            <img src={imagem || '../assets/images/default.png'} alt={alt} />
            <div className={styles.textoQuadrado}>
                <h2>{titulo}</h2>
                <p>{descricao}</p>
            </div>
        </div>
    );
};

export default Quadrado;
