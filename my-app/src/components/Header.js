import React from 'react';
import styles from '../styles/Header.module.css';

const Header = () => {
    return (
        <header className={styles.cabecalho}>
            <nav className={styles.nav}>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/sobre">Sobre</a></li>
                    <li><a href="/servicos">Serviços</a></li>
                    <li><a href="/contato">Contato</a></li>
                    <li><a href="/blog">Blog</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;