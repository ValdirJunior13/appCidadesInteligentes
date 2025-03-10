const FooterComponent = () => {
    return (
        <footer className="bg-blue-600 text-white py-8 px-6">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-start text-center md:text-left space-x-8">
                
                {/* Seção Serviço Eletrônico */}
                <div className="md:w-1/3 px-4">
                    <h1 className="text-2xl font-bold">Serviço Eletrônico</h1>
                    <p className="mt-2 text-gray-200 text-sm">
                        Um sistema unificado de gerenciamento para cidades inteligentes, integrando diversas áreas do IoT, como iluminação inteligente, lixeiras inteligentes, controle de drenagem e irrigação automática. A proposta inclui a criação de uma maquete de uma cidade ou condomínio para demonstrar o controle desses dispositivos por meio do sistema. Essa iniciativa pode trazer oportunidades na Virtus, já que ainda não existe um sistema desse tipo.
                    </p>
                    <div className="flex justify-center md:justify-start space-x-4 mt-4">
                        <a href="https://www.instagram.com/" className="text-gray-200 hover:text-white">
                            <img src="../src/assets/images/baixados.png" className="w-8 h-8" alt="Instagram" />
                        </a>
                        <a href="https://www.facebook.com/?locale=pt_BR" className="text-gray-200 hover:text-white">🔷</a>
                        <a href="https://x.com/home" className="text-gray-200 hover:text-white">📧</a>
                    </div>
                </div>
                
                {/* Seção Endereço */}
                <div className="md:w-1/3 px-4 flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Endereço</h1>
                    <div className="mt-2 w-64 h-32 bg-gray-300 rounded-md"></div> {/* Simulando um mapa */}
                </div>
                
                {/* Seção Sobre Nós */}
                <div className="md:w-1/3 px-4 flex flex-col items-center md:items-end text-center md:text-right">
                    <h1 className="text-2xl font-bold">Sobre Nós</h1>
                    <ul className="mt-2 space-y-1 text-sm md:text-base text-right">
                        <li><a href="/politicas-de-privacidade" className="hover:underline">Políticas de Privacidade</a></li>
                        <li><a href="/nossa-missao" className="hover:underline">Nossa Missão</a></li>
                        <li><a href="/nosso-time" className="hover:underline">Nosso Time</a></li>
                    </ul>
                </div>
            </div>
            
            {/* Direitos Autorais */}
            <div className="text-center mt-6 border-t border-gray-400 pt-4">
                <p className="text-gray-200">© 2025 All Right Reserved</p>
            </div>
        </footer>
    );
};

export default FooterComponent;
