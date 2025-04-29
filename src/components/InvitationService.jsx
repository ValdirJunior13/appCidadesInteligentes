import Cookies from "js-cookie";

class InvitationService {
  constructor() {
    this.baseUrl = "/api"; 
  }

  /**
   * 
   * @param {Object} params 
   * @param {string} params.user_name 
   * @param {boolean} params.decision
   * @param {string} params.role 
   * @param {number} params.city_id 
   * @returns {Promise<Object>} 
   */
async submitInvitationAnswer({ user_name, decision, role, city_id }) {
    try {
      const response = await fetch(`${this.baseUrl}/user/manager/submit-invitation-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get("token")}` 
        },
        body: JSON.stringify({
          user_name,
          validation_hash: Cookies.get("validation_hash"),
          decision,
          role,
          city_id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao processar convite");
      }

      return await response.json();
    } catch (error) {
      console.error("InvitationService error:", error);
      throw error;
    }
  }

  /**
   * 
   * @param {string} userName 
   * @param {string} role 
   * @param {number} cityId 
   * @returns {Promise<Object>}
   */
  async acceptInvitation(userName, role, cityId) {
    return this.submitInvitationAnswer({
      user_name: userName,
      decision: true,
      role,
      city_id: cityId
    });
  }

  /**
   * Recusa um convite
   * @param {string} userName 
   * @param {string} role 
   * @param {number} cityId 
   * @returns {Promise<Object>}
   */
  async rejectInvitation(userName, role, cityId) {
    return this.submitInvitationAnswer({
      user_name: userName,
      decision: false,
      role,
      city_id: cityId
    });
  }
}

export default new InvitationService();