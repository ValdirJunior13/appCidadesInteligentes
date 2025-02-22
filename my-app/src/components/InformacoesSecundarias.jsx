import React from 'react';



const InformacoesSecundarias = ({ imagem, alt, titulo, listaItens }) => {
    return (
        <section className="flex flex-col md:flex-row items-center gap-6 bg-gray-100 p-6 rounded-lg shadow-md">
            <div className="w-full md:w-1/2">
                <img src={imagem} alt={alt} className="w-full h-auto rounded-lg" />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-4">{titulo}</h2>
                <ul className="space-y-2">
                    {listaItens.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700">
        
                        </li>
                    ))}
                </ul>
                <p className="mt-4">
                    <a href="#" className="text-blue-600 hover:underline">Saiba Mais</a>
                </p>
            </div>
        </section>
    );
};

export default InformacoesSecundarias;
