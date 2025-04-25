import axios from "axios";
import { BASE_URL } from "../constants";

const UserService = {
  // Existing methods
  async checkIfUserExists(username) {
    try {
      const response = await axios.get(`${BASE_URL}/users/exists/${username}`);
      return response.data;
    } catch (error) {
      throw new Error("An error occurred while checking if the user exists");
    }
  },

  async createProfile(body) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.post(
        `${BASE_URL}/userProfiles`,
        body,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error("An error occurred while checking if the user exists");
    }
  },

  async getProfileById(id) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.get(
        `${BASE_URL}/userProfiles/${id}`,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error("An error occurred while checking if the user exists");
    }
  },

  async getProfiles() {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.get(`${BASE_URL}/userProfiles`, config);
      return response.data;
    } catch (error) {
      throw new Error("An error occurred while checking if the user exists");
    }
  },

  async getProfile() {
    const uid = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("accessToken");
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    const response = await axios.get(`${BASE_URL}/users/${uid}`, config);
    const reponse2 = await axios.get(
      `${BASE_URL}/userProfiles/user/${uid}`,
      config
    );
    return {
      ...response.data,
      ...reponse2.data[0],
      uid: reponse2.data[0].id,
    };
  },

  async updateUserPrifile(data) {
    const accessToken = localStorage.getItem("accessToken");
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      await axios.put(`${BASE_URL}/userProfiles/${data.uid}`, data, config);
    } catch (error) {
      throw new Error("An error occurred while updating user profile");
    }
  },

  // New OAuth-related methods

  // Check if a user exists with the given OAuth provider and ID
  async checkIfOAuthUserExists(provider, providerId) {
    try {
      const response = await axios.get(`${BASE_URL}/users/oauth`, {
        params: { provider, providerId },
      });
      return response.data.exists;
    } catch (error) {
      console.error('Error checking OAuth user existence:', error);
      return false;
    }
  },

  // Get user profile by OAuth provider and ID
  async getOAuthUserProfile(provider, providerId) {
    try {
      const response = await axios.get(`${BASE_URL}/users/oauth/profile`, {
        params: { provider, providerId },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting OAuth user profile:', error);
      throw error;
    }
  },

  // Register a new OAuth user
  async registerOAuthUser(userData) {
    try {
      const response = await axios.post(`${BASE_URL}/users/oauth/register`, userData);
      return {
        success: true,
        userId: response.data.userId,
      };
    } catch (error) {
      console.error('Error registering OAuth user:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to register user',
      };
    }
  },
};

export default UserService;
