import React from 'react';
import styles from '../styles/Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.primeiraInfoFooter}>
                <h3>Serviço Eletrônico</h3>
                <p>
                    Um sistema unificado de gerenciamento para cidades inteligentes, integrando diversas áreas do IoT, como iluminação inteligente, lixeiras inteligentes, controle de drenagem e irrigação automática. A proposta inclui a criação de uma maquete de uma cidade ou condomínio para demonstrar o controle desses dispositivos por meio do sistema. Essa iniciativa pode trazer oportunidades na Virtus, já que ainda não existe um sistema desse tipo.
                </p>
            </div>

            <div className={styles.segundaInfoFooter}>
                <h3>Links Úteis</h3>
                <ul>
                    <li><a href="#">Sobre Nós</a></li>
                    <li><a href="#">Políticas de Privacidade</a></li>
                    <li><a href="#">Termos de Uso</a></li>
                    <li><a href="#">Nosso Time</a></li>
                </ul>
            </div>

            <div className={styles.terceiraInfoFooter}>
                <h3>Contato</h3>
                <ul>
                    <li>
                        <img src="https://img.icons8.com/ios/50/000000/email.png" alt="Email" /> @gmail.com
                    </li>
                    <li>
                        <img src="https://img.icons8.com/ios/50/000000/phone.png" alt="Telefone" /> (11) 99999-9999
                    </li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;