import axios from "axios";

const API_URL = "http://localhost:8081/api/SkillShares";

const SkillShareService = {
  // Get all Skill Shares
  getAllSkillShares: async () => {
    const accessToken = localStorage.getItem("accessToken");
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const response = await axios.get(API_URL, config);
      return response.data;
    } catch (error) {
      console.error("Error fetching Skill Shares:", error);
      throw error; // Throw the error to handle it in the component
    }
  },

  // Get Skill Shares by user ID
  getSkillSharesByUserId: async (userId) => {
    const accessToken = localStorage.getItem("accessToken");
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const response = await axios.get(`${API_URL}/${userId}`, config);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Skill Shares for user ${userId}:`, error);
      throw error; // Throw the error to handle it in the component
    }
  },

  // Create a new Skill Share
  createSkillShare: async (SkillShareData) => {
    const accessToken = localStorage.getItem("accessToken");
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const response = await axios.post(API_URL, SkillShareData, config);
      return response.data;
    } catch (error) {
      console.error("Error creating Skill Share:", error);
      throw error; // Throw the error to handle it in the component
    }
  },

  // Update an existing Skill Share
  updateSkillShare: async (SkillShareId, updatedSkillShareData) => {
    const accessToken = localStorage.getItem("accessToken");
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const response = await axios.put(
        `${API_URL}/${SkillShareId}`,
        updatedSkillShareData,
        config
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating Skill Share ${SkillShareId}:`, error);
      throw error; // Throw the error to handle it in the component
    }
  },

  // Delete a Skill Share by ID
  deleteSkillShare: async (SkillShareId) => {
    const accessToken = localStorage.getItem("accessToken");
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      await axios.delete(`${API_URL}/${SkillShareId}`, config);
      return; // No need to return anything for delete operation
    } catch (error) {
      console.error(`Error deleting Skill Share ${SkillShareId}:`, error);
      throw error; // Throw the error to handle it in the component
    }
  },
};

export default SkillShareService;
