import { useState } from 'react';
import Sidebar from './Sidebar';
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import Cookies from "js-cookie";

const ConfiguracaoCidade = () => {
  const [chave, setChave] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const cidadeAtual = location.state;
  const [invitations, setInvitations] = useState([]);
  const [dadosSistema, setDadosSistema] = useState(null); // Estado para armazenar os dados do sistema

  const [gerentes, setGerentes] = useState([
    { nome: '', cargo: '', id: '' },
    { nome: '', cargo: '', id: '' },
    { nome: '', cargo: '', id: '' }
  ]);

  const [systemData, setSystemData] = useState({
    user_name: Cookies.get("userName"),
    city_name: sessionStorage.getItem('currentCity'),
    validation_hash: Cookies.get("validation_hash"),
    system_name: "",
    payload: "",
  });

  const [addManager, setAddManager] = useState({
    owner_user_name: Cookies.get("userName"),
    city_name: sessionStorage.getItem('currentCity'),
    manager_user_name: "",
    system_type: "",
    validation_hash: Cookies.get("validation_hash")
  });

  const [loading, setLoading] = useState(false);

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

  const sistemaData = async () => {
    if (
      systemData.user_name &&
      systemData.city_id && // Presumo que city_id será adicionado a systemData em algum momento se necessário
      systemData.validation_hash &&
      systemData.system_name &&
      systemData.payload
    ) {
      setLoading(true);
      try {
        const response = await fetch(
          `http://city/update/${systemData.user_name}/${systemData.validation_hash}/${systemData.system_name}/${systemData.payload}`, // URL placeholder, ajuste conforme necessário
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: systemData.user_name,
              validation_token: systemData.validation_hash,
              system_name: systemData.system_name,
              payload: systemData.payload,
              city_id: systemData.city_id,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Erro: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Resposta da API (sistemaData):", data);
      } catch (error) {
        console.error("Erro ao atualizar os dados do sistema (sistemaData):", error);
      } finally {
        setLoading(false);
      }
    }
  };

const getSistemaData = async () => {
  console.log("[getSistemaData] INICIANDO execução da função."); // LOG A (este você já tem)
  try {
    setLoading(true);

    const sessionCityId = sessionStorage.getItem('currentCityId');
    console.log("[getSistemaData] Valor bruto de sessionCityId:", sessionCityId); // LOG B
    if (!sessionCityId) {
      console.error("[getSistemaData] ERRO: ID da cidade não encontrado no sessionStorage.");
      throw new Error("ID da cidade não encontrado no sessionStorage");
    }
    console.log("[getSistemaData] ID da Cidade (após verificação):", sessionCityId); // Este você já tem

    const usernameCookie = Cookies.get("userName");
    console.log("[getSistemaData] Valor bruto de usernameCookie:", usernameCookie); // LOG C
    if (!usernameCookie) {
      console.error("[getSistemaData] ERRO: Nome de usuário não encontrado nos cookies.");
      throw new Error("Nome de usuário não encontrado nos cookies");
    }
    console.log("[getSistemaData] Usuário (após verificação):", usernameCookie); // Este você já tem

    const validationToken = Cookies.get('validationToken');
    console.log("[getSistemaData] Valor bruto de validationToken:", validationToken); // LOG D
    if (!validationToken) {
      console.error("[getSistemaData] ERRO: Token de validação ('validationToken') não encontrado nos cookies.");
      throw new Error("Token de validação ('validationToken') ausente");
    }
    console.log("[getSistemaData] Token de Validação (após verificação):", validationToken); // Este você já tem

    const apiUrl = `http://56.125.35.215:8000/city/get-system-data/<city_id>/<username>/<validation_token>/<system_name>?city_id=${sessionCityId}&user_name=${usernameCookie}&validation_token=${validationToken}&system_name=drenagem`;
    console.log("[getSistemaData] URL da API a ser chamada:", apiUrl); // LOG E (este você já tem)

    console.log("[getSistemaData] PREPARANDO para fazer a chamada fetch..."); // LOG F
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });
    console.log("[getSistemaData] CHAMADA fetch REALIZADA."); // LOG G
    console.log("[getSistemaData] Resposta da API - Status:", response.status, "Ok:", response.ok); // LOG H (Adicionado na sugestão anterior)

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getSistemaData] ERRO na requisição: ${response.status} - ${response.statusText}. Resposta do servidor: ${errorText}`);
      throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}. Detalhes: ${errorText}`);
    }

    console.log("[getSistemaData] PREPARANDO para converter resposta para JSON..."); // LOG I
    const data = await response.json();
    console.log("[getSistemaData] RESPOSTA CONVERTIDA para JSON."); // LOG J
    console.log("[getSistemaData] Dados brutos recebidos da API (JSON):", JSON.stringify(data, null, 2)); // LOG K (este você já tem e é crucial)
    
    setDadosSistema(data);
    console.log("[getSistemaData] Estado 'dadosSistema' atualizado com:", JSON.stringify(data, null, 2)); // LOG L (este você já tem)
    
    return data;

  } catch (error) {
    console.error("[getSistemaData] ERRO CAPTURADO no bloco catch:", error.message); // LOG M
    setDadosSistema(null);
  } finally {
    setLoading(false);
    console.log("[getSistemaData] FINALIZANDO execução da função (bloco finally)."); // LOG N (este você já tem)
  }
};

  const fetchCityManagers = async () => {
    console.log("Iniciando fetchCityManagers...");
    try {
      setLoading(true);
      const sessionCityId = sessionStorage.getItem('currentCityId');
      if (!sessionCityId) throw new Error("ID da cidade não encontrado no sessionStorage");
      console.log("ID da Cidade (fetchCityManagers):", sessionCityId);

      const usernameCookie = Cookies.get("userName");
      const validationHash = Cookies.get("validation_hash"); // Corrigido para validation_hash se for o caso
      if (!usernameCookie || !validationHash) throw new Error("Usuário não autenticado (fetchCityManagers)");
      console.log("Usuário (fetchCityManagers):", usernameCookie);
      console.log("Validation Hash (fetchCityManagers):", validationHash);

      const url = `http://56.125.35.215:8000/city/get-managers/<city_id>/<username>/<validation_token>?city_id=${sessionCityId}&username=${usernameCookie}&validation_token=${validationHash}`;
      console.log("Chamando API em (fetchCityManagers):", url);

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao buscar gerentes, resposta não JSON." }));
        console.error("Erro ao buscar gerentes (fetchCityManagers):", errorData);
        throw new Error(errorData?.message || "Erro ao buscar gerentes");
      }

      const managersDataFromApi = await response.json();
      console.log("Dados brutos dos gerentes (API - fetchCityManagers):", managersDataFromApi);

      const mappedManagers = Object.entries(managersDataFromApi).map(([id, managerDetails]) => ({
        id: id,
        nome: managerDetails.username,
        cargo: managerDetails.sistema, // Ou `Gerente de ${managerDetails.sistema}`
      }));

      console.log("Gerentes mapeados para o estado (fetchCityManagers):", mappedManagers);
      setGerentes(mappedManagers);

    } catch (error) {
      console.error("Erro em fetchCityManagers:", error.message);
      alert(`Erro ao buscar gerentes: ${error.message}`);
      setGerentes([]); 
    } finally {
      setLoading(false);
      console.log("Finalizando fetchCityManagers.");
    }
  };

  const getConectionKey = async () => {
    console.log("Iniciando getConectionKey...");
    try {
      setLoading(true);
      const sessionCityId = sessionStorage.getItem('currentCityId');
      if (!sessionCityId) throw new Error("ID da cidade não encontrado no sessionStorage (getConectionKey)"); // corrigido para sessionStorage
      console.log("ID da Cidade (getConectionKey):", sessionCityId);

      const owner = Cookies.get("userName");
      const validation_token = Cookies.get("validation_hash");
      if (!owner || !validation_token) throw new Error("Usuário não autenticado (getConectionKey)");
      console.log("Owner (getConectionKey):", owner);
      console.log("Validation Token (getConectionKey):", validation_token);

      const url = `http://56.125.35.215:8000/city/get-connection-key/<city_id>/<owner_username>/<validation_token>?city_id=${sessionCityId}&owner=${owner}&validation_token=${validation_token}`;
      console.log("Chamando API em (getConectionKey):", url);

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao buscar chave, resposta não JSON."}));
        console.error("Erro ao buscar chave de conexão (getConectionKey):", errorData);
        throw new Error(errorData?.message || "Erro ao buscar chave de conexão");
      }

      const data = await response.json();
      console.log("Chave de conexão recebida (getConectionKey):", data);
      setChave(data.key);
    } catch (error) {
      console.error("Erro em getConectionKey:", error.message);
      alert(`Erro ao buscar chave de conexão: ${error.message}`);
    } finally {
      setLoading(false);
      console.log("Finalizando getConectionKey.");
    }
  };

  useEffect(() => {
    console.log("Primeiro useEffect (montagem): Chamando fetchCityManagers, getConectionKey, getSistemaData.");
    fetchCityManagers();
    getConectionKey();
    getSistemaData();
  }, []); // Array de dependências vazio para executar apenas na montagem

  // Removidos os useEffects duplicados, já que as chamadas foram agrupadas no useEffect acima.

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
              value={chave} readOnly className="flex-grow p-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:outline-none cursor-not-allowed"/>
            <button
              onClick={() => {
                if (chave) {
                  navigator.clipboard.writeText(chave)
                    .then(() => alert('Chave copiada!'))
                    .catch(err => console.error('Erro ao copiar chave:', err));
                }
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

        {/* Seção para exibir Dados do Sistema */}
        {dadosSistema && (
          <section className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Dados do Sistema (Drenagem) 
            </h2>
            {/* Verifica se está carregando E se dadosSistema ainda é null. Se já houver dados, não mostra "Carregando..." aqui. */}
            {loading && !Object.keys(dadosSistema).length ? ( 
              <p className="text-gray-500">Carregando dados do sistema...</p>
            ) : Object.keys(dadosSistema).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(dadosSistema).map(([key, value]) => (
                  <div 
                    key={key} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-gray-800 break-all text-left sm:text-right">
                      {typeof value === 'object' && value !== null 
                        ? JSON.stringify(value) 
                        : String(value !== null && value !== undefined ? value : 'N/A')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum dado de sistema para exibir ou os dados estão vazios.</p>
            )}
          </section>
        )}

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
                {gerentes.length > 0 && gerentes.some(g => g.nome) ? gerentes.map((gerente, index) => (
                  gerente.nome && ( // Renderiza apenas se o gerente tiver um nome (para evitar linhas vazias iniciais)
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
                  )
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
                onClick={() => console.log('Função "Remover Gerente" não implementada')}
                className="py-2 px-5 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50 transition duration-150 ease-in-out border border-yellow-500"
              >
                Remover Gerente (UI)
              </button>
            </div>
          </div>
        </section>

        {/* Convites Pendentes Section */}
        <section className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Convites Pendentes</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            {invitations.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invitation.city_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invitation.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => console.log('submitInvitationAnswer Aceitar não implementado', invitation)} // Ajustar para sua função real
                            className="py-1 px-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50 transition duration-150 ease-in-out"
                            disabled={loading}
                          >
                            Aceitar
                          </button>
                          <button
                            onClick={() => console.log('submitInvitationAnswer Rejeitar não implementado', invitation)} // Ajustar para sua função real
                            className="py-1 px-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-opacity-50 transition duration-150 ease-in-out"
                            disabled={loading}
                          >
                            Rejeitar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-center text-gray-500">
                {loading ? 'Buscando convites...' : 'Nenhum convite pendente.'}
              </p>
            )}
          </div>
        </section>

        {/* Cidade Section */}
        <section className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Gerenciamento da Cidade</h2>
          <button
            onClick={() => console.log('Função "Excluir Cidade" não implementada')}
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