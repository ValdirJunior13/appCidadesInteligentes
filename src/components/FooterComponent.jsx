const FooterComponent = () => {
    return (
        <footer className="bg-gray-900 text-white py-8 px-6">
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold">Serviço Eletrônico</h1>
                <p className="mt-2 text-gray-400">
                    Um sistema unificado de gerenciamento para cidades inteligentes, integrando diversas áreas do IoT.
                </p>
                <div className="flex flex-col md:flex-row justify-between mt-6">
                    <div>
                        <h2 className="text-lg font-semibold">Sobre Nós</h2>
                        <ul className="mt-2 space-y-2">
                            <li><a href="/politicas-de-privacidade" className="hover:underline">Políticas de Privacidade</a></li>
                            <li><a href="/nossa-missao" className="hover:underline">Nossa Missão</a></li>
                            <li><a href="/nosso-time" className="hover:underline">Nosso Time</a></li>
                        </ul>
                    </div>
                </div>
                <div className="text-center mt-6">
                    <p className="text-gray-500">© 2025 All Right Reserved</p>
                </div>
            </div>
        </footer>
    );
};

export default FooterComponent;
