
import { useState } from 'react';


const MainContent = () => {
    const [cidade, setCidade] = useState('');
    const [bairro, setBairro] = useState('');

    return (
        <main className="container mx-auto p-6">
            <section className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">A Revolução das Cidades Inteligentes Começa Aqui!</h1>
                <p className="text-gray-600">Gerencie iluminação, drenagem, hortas, irrigação e muito mais em um único sistema integrado.</p>
            </section>

            <section className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold">Busca de Cidades e Bairros</h1>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="cidade" className="block text-gray-700">Cidade:</label>
                        <input 
                            type="text" 
                            id="cidade" 
                            name="cidade" 
                            placeholder="Digite o nome da cidade"
                            value={cidade}
                            onChange={(e) => setCidade(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="bairro" className="block text-gray-700">Bairro:</label>
                        <input 
                            type="text" 
                            id="bairro" 
                            name="bairro" 
                            placeholder="Digite o nome do bairro"
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                        />
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 text-center">
                <div className="p-6 bg-gray-100 rounded-lg shadow">
                    <h2 className="text-2xl font-bold">24/7</h2>
                    <p className="text-gray-600">Monitoramento em Tempo Real</p>
                </div>
                <div className="p-6 bg-gray-100 rounded-lg shadow">
                    <h2 className="text-2xl font-bold">100+</h2>
                    <p className="text-gray-600">Sensores de Lixeiras Inteligentes</p>
                </div>
                <div className="p-6 bg-gray-100 rounded-lg shadow">
                    <h2 className="text-2xl font-bold">1M+</h2>
                    <p className="text-gray-600">Dados Coletados para Drenagem</p>
                </div>
            </section>
        </main>
    );
};

export default MainContent;
