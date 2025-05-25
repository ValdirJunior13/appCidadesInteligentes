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
      

      setGerentes(prev => [
        ...prev,
        { 
          nome: addInvitation.user_name, 
          cargo: `Gerente (${addInvitation.role})`, 
          id: data.invitation_id || "novo-id" 
        }
      ]);
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



const getInvitations = async (username, validation_hash) => {
  if (!username || !validation_hash) {
    alert("Nome de usuário e token de validação são obrigatórios");
    throw new Error("Campos obrigatórios não preenchidos");
  }

  setLoading(true);
  try {
    const response = await fetch(
      `http://56.125.35.215:8000/user/manager/get-invitations/<user_name>/<validation_token>?user_name=${username}&validation_token=${validation_hash}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      let serverErrorMessage = "Erro ao buscar convites no servidor";
      try {
        const errorData = await response.json();
        serverErrorMessage = errorData.message || errorData.detail || JSON.stringify(errorData);
      } catch (e) {
        serverErrorMessage = `Erro ${response.status}: ${response.statusText}`;
      }
      throw new Error(serverErrorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar convites:", error);
    alert(`Erro ao buscar convites: ${error.message}`);
    throw error;
  } finally {
    setLoading(false);
  }
};

const fetchCityManagers = async () => {
  try {
    setLoading(true);

    const cityData = JSON.parse(localStorage.getItem('cidadeAtual')); 
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

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Erro ao buscar gerentes");
    }
    const managers = await response.json();
    setGerentes(
      managers.map((manager) => ({
        nome: manager.user_name,
        cargo: manager.system_type,
        id: manager.id, 
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
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar activeItem="configuracoes" />

      <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
        {loading && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
            <p className="ml-3 text-white text-lg">Carregando...</p>
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Configurações da cidade</h1>
          <p className="text-sm text-gray-600 mb-6">Gerencie as configurações e administradores da sua cidade.</p>
          <hr className="border-gray-300" />
        </div>

        {/* Chave de Conexão Section */}
        <section className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Chave de conexão</h2>
          <div className="flex items-center space-x-3">
            <input
              id="chaveConexao"
              type="text"
              value={chaveConexao}
              readOnly
              className="flex-grow p-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:outline-none cursor-not-allowed"
            />
            <button
              onClick={() => {
                // Lógica para copiar para clipboard ou atualizar
                navigator.clipboard.writeText(chaveConexao)
                  .then(() => console.log('Chave copiada!')) // Substituir por feedback visual
                  .catch(err => console.error('Erro ao copiar chave:', err));
              }}
              title="Copiar chave"
              className="p-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </section>

        {/* Tabela de Gerentes */}
        <section className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Gerentes Atuais</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gerentes.length > 0 ? gerentes.map((gerente, index) => (
                  <tr key={gerente.id || index} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="text" value={gerente.nome} readOnly className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-1 text-sm text-gray-700" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="text" value={gerente.cargo} readOnly className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-1 text-sm text-gray-700" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="text" value={gerente.id} readOnly className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-1 text-sm text-gray-700" />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      {loading ? 'Carregando gerentes...' : 'Nenhum gerente encontrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Controle de Gerentes */}
        <section className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Controle de Gerentes</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="manager_username" className="block text-sm font-medium text-gray-700 mb-1">
                Adicionar novo gerente:
              </label>
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                <input
                  id="manager_username"
                  type="text"
                  placeholder="Nome de usuário do gerente"
                  value={addManager.manager_user_name}
                  onChange={e => setAddManager(prev => ({ ...prev, manager_user_name: e.target.value }))}
                  className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                />
                 <input 
                  id="manager_system_type"
                  type="text"
                  placeholder="Tipo de Sistema (ex: Irrigação)"
                  value={addManager.system_type}
                  onChange={e => setAddManager(prev => ({ ...prev, system_type: e.target.value }))}
                  className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                />
                <button
                  onClick={addGerente}
                  disabled={loading}
                  className="py-3 px-5 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50 transition duration-150 ease-in-out border border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </div>
            <div>
              <button
                onClick={() => console.log('Função "Remover Gerente" não implementada')} // Substituir alert
                className="py-2 px-5 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50 transition duration-150 ease-in-out border border-yellow-500"
              >
                Remover Gerente (UI)
              </button>
            </div>
          </div>
        </section>

        {/* Cidade Section */}
        <section className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Gerenciamento da Cidade</h2>
          <button
            onClick={() => console.log('Função "Excluir Cidade" não implementada')} // Substituir alert
            className="py-2 px-5 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-opacity-50 transition duration-150 ease-in-out border border-red-600"
          >
            Excluir Cidade (UI)
          </button>
        </section>

      </main>
    </div>
  );
};


export default ConfiguracaoCidade;