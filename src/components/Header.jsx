const Header = () => {
    return (
        <header className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center">
            <div className="text-2xl font-bold">
                <h1>Nome do Site</h1>
            </div>
            <nav>
                <ul className="flex space-x-6">
                    <li><a href="/home" className="hover:underline">Home</a></li>
                    <li><a href="/controle-de-lixo" className="hover:underline">Controle de Lixo</a></li>
                    <li><a href="/iluminacao" className="hover:underline">Iluminação</a></li>
                    <li><a href="/drenagem" className="hover:underline">Drenagem</a></li>
                    <li><a href="/dados" className="hover:underline">Dados</a></li>
                    <li><a href="/logar" className="bg-blue-800 px-4 py-2 rounded hover:bg-blue-700"><button >Logar</button></a></li>
                    <li><a href="/criar-conta" className="bg-blue-800 px-4 py-2 rounded hover:bg-blue-700"><button >Criar Conta</button></a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
