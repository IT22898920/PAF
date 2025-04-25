// AuthService.js
class AuthService {
  // Base API URL - adjust as needed
  baseUrl = "http://localhost:8081/api/auth";

  // Regular login with username and password
  async login(username, password) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Register a new user
  async register(username, password) {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  // Login with Google OAuth2
  loginWithGoogle() {
    // Save current page URL to return after authentication
    localStorage.setItem("redirectUrl", window.location.href);
    // Redirect to the backend OAuth2 authorization endpoint for Google
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  }

  // Login with GitHub OAuth2
  loginWithGithub() {
    // Save current page URL to return after authentication
    localStorage.setItem("redirectUrl", window.location.href);
    // Redirect to the backend OAuth2 authorization endpoint for GitHub
    window.location.href = "http://localhost:8081/oauth2/authorization/github";
  }

  // Fetch user info using token
  async fetchUserInfo(token) {
    try {
      const response = await fetch("http://localhost:8081/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user info:", error);
      return null;
    }
  }

  // Refresh access token using refresh token
  async refreshToken(refreshToken) {
    try {
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        return data.accessToken;
      }

      throw new Error("No access token received");
    } catch (error) {
      console.error("Token refresh error:", error);
      this.logout(); // Force logout on refresh failure
      throw error;
    }
  }

  // Logout the user
  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
  }

  // Check if the user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem("accessToken");
  }

  // Get the stored access token
  getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  // Get the stored user ID
  getUserId() {
    return localStorage.getItem("userId");
  }
}

export default new AuthService();
