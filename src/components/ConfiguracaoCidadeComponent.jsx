import { useState } from 'react';
import Sidebar from './Sidebar';
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";


const ConfiguracaoCidade = () => {
  const [chave, setChave] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const cidadeAtual = location.state;
  const [gerentes, setGerentes] = useState([
    { nome: '', cargo: '', id: '' },
    { nome: '', cargo: '', id: '' },
    { nome: '', cargo: '', id: '' }
  ]);

  const [addManager, setAddManager] = useState({
    owner_user_name: Cookies.get("userName"),
    validation_hash: Cookies.get("validation_hash"),
    city_name: "",
    manager_user_name: "",
    system_type: "",
  });
  
    const [submitInvitation, setSubmitInvitation] = useState({
      validation_hash: Cookies.get("validation_hash"),
      user_name: Cookies.get("userName"), 
      decision: true, 
      role: "", 
      city_id: 0,
    });
  const atualizarChave = () => {
    const novaChave = Math.random().toString(36).substr(2, 10).toUpperCase();
    setChave(novaChave);
  };

  const adicionarGerente = () => {
    if (gerentes.length < 5) { 
      setGerentes([...gerentes, { nome: '', cargo: '', id: '' }]);
    }
  };

  const removerGerente = () => {
    if (gerentes.length > 1) { 
      setGerentes(gerentes.slice(0, -1));
    }
  };

  const excluirCidade = () => {
    if (window.confirm('Tem certeza que deseja excluir esta cidade?')) {
      try {
        const cidadesSalvas = JSON.parse(localStorage.getItem("cidades")) || [];
      
        const index = cidadesSalvas.findIndex(cidade => 
          cidade.name === cidadeAtual.name &&
          cidade.city === cidadeAtual.city &&
          cidade.state === cidadeAtual.state
        );
        
        if (index === -1) {
          throw new Error("Cidade não encontrada na lista");
        }
        
        const novasCidades = [
          ...cidadesSalvas.slice(0, index),
          ...cidadesSalvas.slice(index + 1)
        ];
        
        localStorage.setItem("cidades", JSON.stringify(novasCidades));
        
        alert('Cidade excluída com sucesso!');
        navigate("/paginalogin", { replace: true });
      } catch (error) {
        console.error("Erro ao excluir cidade:", error);
        alert("Não foi possível excluir a cidade. Ela não foi encontrada na lista.");
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-300">
      <Sidebar activeItem="configuracoes" />
      <main className="flex-1 p-4 text-black">
        <h1 className="text-xl font-bold mb-2">Configurações da cidade</h1>
        <hr className="border border-black mb-4 w-full max-w-md" />
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