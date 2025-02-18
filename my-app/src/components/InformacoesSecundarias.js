import React from 'react';
import styles from '../styles/MainContent.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const InformacoesSecundarias = ({ imagem, alt, titulo, listaItens }) => {
    return (
        <section className={styles.informacoesSecundarias}>
            <div className={styles.imagemAgua}>
                <img src={imagem} alt={alt} />
            </div>

            <div className={styles.nossoSistema}>
                <h2>{titulo}</h2>
                <ul>
                    {listaItens.map((item, index) => (
                        <li key={index}>
                            <FontAwesomeIcon icon={faCheck} /> {item}
                        </li>
                    ))}
                </ul>
                <p><a href="#">Saiba Mais</a></p>
            </div>
        </section>
    );
};

export default InformacoesSecundarias;
