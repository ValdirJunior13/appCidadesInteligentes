import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Cookies from "js-cookie";

const GerenciamentoCidadeComponent = () => {
  const navigate = useNavigate();
  const { usuarioLogado, logout } = useAuth();
  const [loadingCities, setLoadingCities] = useState(true);
  const [cityData, setCityData] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [managerEmail, setManagerEmail] = useState("");

  useEffect(() => {
    if (!usuarioLogado) {
      navigate("/login");
    }
  }, [usuarioLogado, navigate]);


  const apiCall = async (endpoint, method = "GET", data = null) => {
    try {
      const token = Cookies.get("authToken");
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      };
      
      if (data) options.body = JSON.stringify(data);
      
      const response = await fetch(`http://localhost:3000${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Erro na API:", error);
      throw error;
    }
  };

  // Carregar dados da cidade
  const loadCityData = async () => {
    try {
      const userName = Cookies.get("userName");
      const validationToken = "seu_token_de_validacao"; 
      const data = await apiCall(`/city/get-data/${cityId}/${userName}/${validationToken}`);
      setCityData(data);
    } catch (error) {
      console.error("Erro ao carregar dados da cidade:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  // Carregar convites
  const loadInvitations = async () => {
    try {
      const userName = Cookies.get("userName");
      const validationToken = "seu_token_de_validacao";
      const data = await apiCall(`/user/manager/get-invitations/${userName}/${validationToken}`);
      setInvitations(data);
    } catch (error) {
      console.error("Erro ao carregar convites:", error);
    }
  };

  // Responder a convite
  const handleInvitationResponse = async (inviteId, accept) => {
    try {
      await apiCall("/user/manager/submit-invitation-answer", "POST", {
        invitation_id: inviteId,
        accept
      });
      setInvitations(invitations.filter(inv => inv.id !== inviteId));
    } catch (error) {
      console.error("Erro ao responder convite:", error);
    }
  };

  // Adicionar gerente
  const handleAddManager = async () => {
    if (!managerEmail || !cityData) return;
    
    try {
      await apiCall("/city/add-manager", "POST", {
        city_id: cityData.id,
        manager_email: managerEmail
      });
      setManagerEmail("");
      await loadCityData(); // Recarregar dados da cidade
    } catch (error) {
      console.error("Erro ao adicionar gerente:", error);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (usuarioLogado) {
      loadCityData();
      loadInvitations();
    }
  }, [usuarioLogado]);

  // Tela de loading
  if (loadingCities) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-xl">Carregando cidades...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Gerenciamento de Cidade</h1>
        
        {/* Seção de Convites */}
        {invitations.length > 0 && (
          <div className="mb-6 p-4 border rounded bg-yellow-50">
            <h2 className="text-xl font-semibold mb-2">Convites Recebidos</h2>
            <ul className="space-y-2">
              {invitations.map((invite) => (
                <li key={invite.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <p>Convite para: <strong>{invite.city_name}</strong></p>
                    <p className="text-sm">Enviado por: {invite.sender_name}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleInvitationResponse(invite.id, true)}
                      className="px-3 py-1 bg-green-500 text-white rounded"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleInvitationResponse(invite.id, false)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Recusar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Seção de Dados da Cidade */}
        {cityData && (
          <div className="mb-6 p-4 border rounded bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">Dados da Cidade</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Nome:</strong> {cityData.name}</p>
                <p><strong>Cidade:</strong> {cityData.city}</p>
                <p><strong>Estado:</strong> {cityData.state}</p>
              </div>
              <div>
                <p><strong>Proprietário:</strong> {cityData.owner_user_name}</p>
                <p><strong>Gerentes:</strong> {cityData.managers?.join(", ") || "Nenhum"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulário para adicionar gerente */}
        <div className="p-4 border rounded bg-white">
          <h2 className="text-xl font-semibold mb-2">Adicionar Gerente</h2>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="email"
              placeholder="E-mail do gerente"
              value={managerEmail}
              onChange={(e) => setManagerEmail(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleAddManager}
              disabled={!managerEmail}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GerenciamentoCidadeComponent;