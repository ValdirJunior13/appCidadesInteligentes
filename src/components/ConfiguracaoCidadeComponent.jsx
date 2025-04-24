import React, { useState } from 'react';
import Sidebar from './Sidebar';

const ConfiguracaoCidade = () => {
  const [chave, setChave] = useState('');
  const [gerentes, setGerentes] = useState([
    { nome: '', cargo: '', id: '' },
    { nome: '', cargo: '', id: '' },
    { nome: '', cargo: '', id: '' }
  ]);

  const atualizarChave = () => {
    const novaChave = Math.random().toString(36).substr(2, 10).toUpperCase();
    setChave(novaChave);
  };

  const adicionarGerente = () => {
    if (gerentes.length < 5) { // Limite máximo de 5 linhas
      setGerentes([...gerentes, { nome: '', cargo: '', id: '' }]);
    }
  };

  const removerGerente = () => {
    if (gerentes.length > 1) { // Mantém pelo menos uma linha
      setGerentes(gerentes.slice(0, -1));
    }
  };

  const excluirCidade = () => {
    if (window.confirm('Tem certeza que deseja excluir esta cidade?')) {
      alert('Cidade excluída com sucesso!');
    }
  };

  return (
    <div className="flex h-screen bg-gray-300">
      <Sidebar activeItem="configuracoes" />
      <main className="flex-1 p-4 text-black">
        <h1 className="text-xl font-bold mb-2">Configurações da cidade</h1>
        <hr className="border border-black mb-4 w-full max-w-md" />

        {/* Chave de conexão */}
        <div className="mb-6">
          <label className="block font-medium mb-1">Chave de conexão:</label>
          <div className="flex items-center max-w-md">
            <input
              type="text"
              value={chave}
              readOnly
              className="flex-1 border border-black px-2 py-1 rounded-sm bg-gray-100"
            />
            <button
              onClick={atualizarChave}
              className="ml-2 px-2 border border-black rounded-sm bg-gray-200 hover:bg-gray-300"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Tabela de Gerentes - Versão simplificada como na imagem */}
        <div className="mb-6">
          <label className="block font-medium mb-2">Gerentes:</label>
          <table className="border border-black w-full max-w-2xl">
            <thead>
              <tr className="border-b border-black">
                <th className="px-4 py-2 text-left">Nome</th>
                <th className="px-4 py-2 text-left">Cargo</th>
                <th className="px-4 py-2 text-left">ID</th>
              </tr>
            </thead>
            <tbody>
              {gerentes.map((gerente, index) => (
                <tr key={index} className="border-b border-black">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={gerente.nome}
                      onChange={(e) => {
                        const novosGerentes = [...gerentes];
                        novosGerentes[index].nome = e.target.value;
                        setGerentes(novosGerentes);
                      }}
                      className="w-full bg-transparent border-none focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={gerente.cargo}
                      onChange={(e) => {
                        const novosGerentes = [...gerentes];
                        novosGerentes[index].cargo = e.target.value;
                        setGerentes(novosGerentes);
                      }}
                      className="w-full bg-transparent border-none focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={gerente.id}
                      onChange={(e) => {
                        const novosGerentes = [...gerentes];
                        novosGerentes[index].id = e.target.value;
                        setGerentes(novosGerentes);
                      }}
                      className="w-full bg-transparent border-none focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controles */}
        <div className="mb-6 space-x-2">
          <label className="block font-medium mb-2">Controle de gerentes:</label>
          <button
            onClick={adicionarGerente}
            className="px-4 py-1 bg-yellow-400 border border-black rounded hover:bg-yellow-300"
          >
            Adicionar Gerente
          </button>
          <button
            onClick={removerGerente}
            className="px-4 py-1 bg-yellow-400 border border-black rounded hover:bg-yellow-300"
          >
            Remover Gerente
          </button>
        </div>

        <div>
          <label className="block font-medium mb-2">Cidade:</label>
          <button
            onClick={excluirCidade}
            className="px-4 py-1 bg-yellow-400 border border-black rounded hover:bg-yellow-300"
          >
            Excluir Cidade
          </button>
        </div>
      </main>
    </div>
  );
};

export default ConfiguracaoCidade;