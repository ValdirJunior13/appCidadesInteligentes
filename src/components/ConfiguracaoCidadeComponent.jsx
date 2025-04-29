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
    city_name: cidadeAtual?.name || "",
    manager_user_name: "",
    system_type: "",
    validation_hash: Cookies.get("validation_hash")
  });

  const [submitInvitation, setSubmitInvitation] = useState({
    user_name: "",
    validation_hash: Cookies.get("validation_hash"),
    decision: true,
    role: "manager",
    city_id: cidadeAtual?.id || 0
  });

  const atualizarChave = () => {
    const novaChave = Math.random().toString(36).substr(2, 10).toUpperCase();
    setChave(novaChave);
  };

  const removerGerente = () => {
    if (gerentes.length > 1) {
      setGerentes(prev => prev.slice(0, -1));
    }
  };

  const excluirCidade = () => {
    if (!window.confirm('Tem certeza que deseja excluir esta cidade?')) return;
    try {
      const cidadesSalvas = JSON.parse(localStorage.getItem("cidades")) || [];
      const index = cidadesSalvas.findIndex(c =>
        c.name === cidadeAtual.name &&
        c.city === cidadeAtual.city &&
        c.state === cidadeAtual.state
      );
      if (index === -1) throw new Error("Cidade não encontrada");
      const novas = [
        ...cidadesSalvas.slice(0, index),
        ...cidadesSalvas.slice(index + 1)
      ];
      localStorage.setItem("cidades", JSON.stringify(novas));
      alert('Cidade excluída com sucesso!');
      navigate("/paginalogin", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir, cidade não encontrada.");
    }
  };

  const sendManagerInvite = async () => {
    try {
      const nome = addManager.manager_user_name.trim();
      if (!nome || !addManager.system_type) {
        alert("Informe usuário e função antes de enviar.");
        return;
      }
      const resp1 = await fetch("/city/add-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addManager),
      });
      if (!resp1.ok) throw new Error("Falha ao enviar convite");
      const { invitation_id } = await resp1.json();
  
      const answerPayload = {
        ...submitInvitation,
        user_name: nome,
        city_id: cidadeAtual.id,
      };
      setSubmitInvitation(answerPayload);
      const resp2 = await fetch(
        "/user/manager/submit-invitation-answer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(answerPayload), 
        }
      );
      if (!resp2.ok) throw new Error("Falha ao confirmar convite");

      setGerentes(prev => [
        ...prev,
        { nome, cargo: `Gerente confirmado (${addManager.system_type})`, id: invitation_id }
      ]);
      setAddManager(prev => ({ ...prev, manager_user_name: "" }));
      alert(`Convite enviado e confirmado para ${nome}`);
    } catch (err) {
      console.error(err);
      alert(`Erro: ${err.message}`);
    }
  };

  const testAdicionarGerente = async () => {
    try {
      console.log("Iniciando teste de adição de gerente...");
      const testManager = {
        owner_user_name: "dono_cidade",
        city_name: "Cidade Teste",
        manager_user_name: "novo_gerente",
        system_type: "irrigation",
        validation_hash: "hash_teste_123"
      };
      
      console.log("Dados de teste:", testManager);
      
      console.log("Simulando chamada à API /city/add-manager...");
      const mockInviteResponse = {
        invitation_id: "inv123",
        status: "success"
      };
      
      console.log("Simulando resposta do convite...");
      const mockAnswer = {
        user_name: "novo_gerente",
        validation_hash: "hash_teste_123",
        decision: true,
        role: "manager",
        city_id: 1
      };
      
      const mockAnswerResponse = {
        status: "accepted",
        manager_id: "mgr123"
      };
      
      console.log("Verificando atualização de estado...");
      setAddManager(prev => ({ ...prev, manager_user_name: "" }));
      setGerentes(prev => [
        ...prev,
        { 
          nome: "novo_gerente", 
          cargo: `Gerente confirmado (irrigation)`, 
          id: "inv123" 
        }
      ]);
      
      console.log("✅ Teste concluído com sucesso!");
      console.log("Estado esperado após teste:");
      console.log("- Campo manager_user_name deve estar vazio");
      console.log("- Novo gerente deve aparecer na lista");
      
      alert("Teste de adição de gerente concluído!\nVerifique o console para detalhes.");
      
      return {
        success: true,
        inviteData: testManager,
        inviteResponse: mockInviteResponse,
        answerData: mockAnswer,
        answerResponse: mockAnswerResponse
      };
      
    } catch (error) {
      console.error("❌ Erro no teste:", error);
      alert("Falha no teste: " + error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };

  return (
    <div className="flex h-screen bg-gray-300">
      <Sidebar activeItem="configuracoes" />
      <main className="flex-1 p-4 text-black">
        <h1 className="text-xl font-bold mb-2">Configurações da cidade</h1>
        <hr className="border border-black mb-4 w-full max-w-md" />

        {/* Seção de Testes */}
        <div className="mt-4 p-4 border border-dashed border-gray-400 rounded">
          <h3 className="font-medium mb-2">Testes</h3>
          <button
            onClick={testAdicionarGerente}
            className="px-4 py-1 bg-blue-400 text-white rounded hover:bg-blue-500"
          >
            Testar Adição de Gerente
          </button>
          <p className="text-xs text-gray-600 mt-1">
            Verifique o console do navegador para os resultados
          </p>
        </div>

        {/* Chave de Conexão */}
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

        {/* Tabela de Gerentes */}
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
                      readOnly
                      className="w-full bg-transparent border-none focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={gerente.cargo}
                      readOnly
                      className="w-full bg-transparent border-none focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={gerente.id}
                      readOnly
                      className="w-full bg-transparent border-none focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controle de Gerentes */}
        <div className="mb-6 space-y-2">
          <label className="block font-medium mb-2">Adicionar novo gerente:</label>
          <div className="flex space-x-2 max-w-md">
            <input
              type="text"
              placeholder="Nome de usuário do gerente"
              value={addManager.manager_user_name}
              onChange={e => setAddManager(prev => ({
                ...prev,
                manager_user_name: e.target.value
              }))}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={sendManagerInvite}
              className="px-4 py-2 bg-yellow-400 border border-black rounded hover:bg-yellow-300"
            >
              Adicionar
            </button>
          </div>

          <button
            onClick={removerGerente}
            className="px-4 py-2 bg-yellow-400 border border-black rounded hover:bg-yellow-300"
          >
            Remover último gerente
          </button>
        </div>

        {/* Controle de Cidade */}
        <div className="mt-6">
          <label className="block font-medium mb-2">Cidade:</label>
          <button
            onClick={excluirCidade}
            className="px-4 py-2 bg-yellow-400 border border-black rounded hover:bg-yellow-300"
          >
            Excluir Cidade
          </button>
        </div>
      </main>
    </div>
  );
};

export default ConfiguracaoCidade;