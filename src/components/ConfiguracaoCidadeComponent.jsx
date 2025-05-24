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

  const [addInvitation, setAddInvitation] = useState({
    user_name: Cookies.get("userName"),
    validation_hash: Cookies.get("validation_hash"),
    city_id: cidadeAtual?.id || 0,
    decision: true,
    role: ""
    });


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

 const addGerente = async () => {
  if (addManager.owner_user_name && addManager.validation_hash && addManager.city_name && addManager.manager_user_name && addManager.system_type) {
    setLoading(true);
    try {
      const response = await fetch("http://56.125.35.215:8000/city/add-manager", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner_user_name: addManager.owner_user_name,
          city_name: addManager.city_name,
          manager_user_name: addManager.manager_user_name,
          system_type: addManager.system_type,
          validation_hash: addManager.validation_hash
        }),
      });

      if (!response.ok) {
        let serverErrorMessage = "Erro ao enviar convite no servidor";
        try {
          const errorData = await response.json();
          serverErrorMessage = errorData.message || errorData.detail || JSON.stringify(errorData);
        } catch (e) {
          serverErrorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(serverErrorMessage);
      }

      const data = await response.json();
      setGerentes(prev => [
        ...prev,
        {
          nome: addManager.manager_user_name,
          cargo: `Gerente de ${addManager.system_type}`,
          id: data.invitation_id || Date.now().toString()
        }
      ]);

      setAddManager(prev => ({
        ...prev,
        manager_user_name: ""
      }));

      alert(`Convite enviado com sucesso para ${addManager.manager_user_name} como Gerente de ${addManager.system_type}`);

      return data;
    } catch (error) {
      console.error("Erro ao adicionar gerente:", error);
      alert(`Erro ao adicionar gerente: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  } else {
    alert("Por favor, preencha todos os campos obrigatórios");
    throw new Error("Campos obrigatórios não preenchidos");
  }
};



  const submitInvitationAnswer = async () => {
  if (addInvitation.user_name && addInvitation.validation_hash && addInvitation.city_id && addInvitation.decision && addInvitation.role) {
    setLoading(true);
    try {
      const response = await fetch("http://56.125.35.215:8000/user/manager/submit-invitation-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: addInvitation.user_name,
          validation_hash: addInvitation.validation_hash,
          city_id: addInvitation.city_id,
          decision: addInvitation.decision,
          role: addInvitation.role
        }),
      });

      if (!response.ok) {
        let serverErrorMessage = "Erro ao enviar resposta de convite no servidor";
        try {
          const errorData = await response.json();
          serverErrorMessage = errorData.message || errorData.detail || JSON.stringify(errorData);
        } catch (e) {
          serverErrorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(serverErrorMessage);
      }

      const data = await response.json();
      
      // Atualiza a lista de gerentes após a resposta bem-sucedida
      setGerentes(prev => [
        ...prev,
        { 
          nome: addInvitation.user_name, 
          cargo: `Gerente (${addInvitation.role})`, 
          id: data.invitation_id || "novo-id" 
        }
      ]);
      
      // Limpa o formulário ou mostra mensagem de sucesso
      alert(`Convite aceito com sucesso para ${addInvitation.user_name} como ${addInvitation.role}`);
      
      return data;
    } catch (error) {
      console.error("Erro ao enviar resposta de convite:", error);
      alert(`Erro ao enviar resposta de convite: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  } else {
    alert("Por favor, preencha todos os campos necessários");
    throw new Error("Campos obrigatórios não preenchidos");
  }
};
  const [loading, setLoading] = useState(false);

const fetchCityManagers = async () => {
  try {
    setLoading(true);

    const cityData = JSON.parse(localStorage.getItem('cidadeAtual')); // Chave específica
    const cityId = cityData?.id;

    if (!cityId) {
      throw new Error("ID da cidade não encontrado no localStorage");
    }

    const username = Cookies.get("user_name");
    const validationToken = Cookies.get("validation_hash");

    if (!username || !validationToken) {
      throw new Error("Usuário não autenticado");
    }


    const url = `http://56.125.35.215:8000/city/get-managers/<city_id>/<username>/<validation_token>?city_id=${cityId}&username=${username}&validation_token=${validationToken}`;

    // 4. Fazer a requisição
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Erro ao buscar gerentes");
    }

    // 5. Atualizar estado dos gerentes
    const managers = await response.json();
    setGerentes(
      managers.map((manager) => ({
        nome: manager.user_name,
        cargo: manager.system_type,
        id: manager.id, // Usando o ID correto da resposta
      }))
    );

  } catch (error) {
    console.error("Erro ao buscar gerentes:", error);
    alert(`Erro: ${error.message}`);
  } finally {
    setLoading(false);
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