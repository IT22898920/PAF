// OAuthService.js - Complete OAuth 2.0 Implementation for Google and GitHub

import axios from 'axios';

class OAuthService {
  // Your OAuth application credentials
  // These should be stored securely in environment variables in production
  constructor() {
    // Google OAuth credentials
    this.googleClientId = 'YOUR_GOOGLE_CLIENT_ID';
    this.googleClientSecret = 'YOUR_GOOGLE_CLIENT_SECRET';
    this.googleRedirectUri = `${window.location.origin}/auth/google/callback`;
    
    // GitHub OAuth credentials
    this.githubClientId = 'YOUR_GITHUB_CLIENT_ID';
    this.githubClientSecret = 'YOUR_GITHUB_CLIENT_SECRET';
    this.githubRedirectUri = `${window.location.origin}/auth/github/callback`;
    
    // Your backend API endpoint for OAuth processing
    this.apiBaseUrl = 'https://your-api-backend.com/api';
  }

  // Initialize Google OAuth login flow
  initiateGoogleLogin() {
    const scopes = ['email', 'profile'].join(' ');
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    
    const params = new URLSearchParams({
      client_id: this.googleClientId,
      redirect_uri: this.googleRedirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
    });
    
    window.location.href = `${googleAuthUrl}?${params.toString()}`;
  }
  
  // Initialize GitHub OAuth login flow
  initiateGithubLogin() {
    const scopes = ['read:user', 'user:email'].join(' ');
    const githubAuthUrl = 'https://github.com/login/oauth/authorize';
    
    const params = new URLSearchParams({
      client_id: this.githubClientId,
      redirect_uri: this.githubRedirectUri,
      scope: scopes,
      state: this.generateRandomState(),
    });
    
    // Store state in localStorage to verify when the user returns
    localStorage.setItem('oauth_state', params.get('state'));
    
    window.location.href = `${githubAuthUrl}?${params.toString()}`;
  }
  
  // Generate a random state parameter to prevent CSRF attacks
  generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  // Verify that the returned state matches what we generated
  verifyState(returnedState) {
    const originalState = localStorage.getItem('oauth_state');
    localStorage.removeItem('oauth_state'); // Clear it immediately after checking
    return originalState === returnedState;
  }
  
  // Handle the Google OAuth callback
  async handleGoogleCallback(code) {
    try {
      // Exchange the authorization code for tokens
      // Note: This token exchange should ideally happen on your backend
      // for security, but this example shows a frontend approach
      const response = await axios.post(`${this.apiBaseUrl}/auth/google/callback`, {
        code,
        client_id: this.googleClientId,
        client_secret: this.googleClientSecret,
        redirect_uri: this.googleRedirectUri,
        grant_type: 'authorization_code',
      });
      
      if (response.data && response.data.access_token) {
        // Store the tokens
        this.storeTokens(response.data, 'google');
        
        // Get user information
        await this.fetchAndStoreGoogleUserInfo(response.data.access_token);
        
        return {
          success: true,
          provider: 'google',
          userData: localStorage.getItem('user_data') 
            ? JSON.parse(localStorage.getItem('user_data')) 
            : null
        };
      }
      
      return { success: false, error: 'Failed to get access token' };
    } catch (error) {
      console.error('Google OAuth error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error during Google authentication' 
      };
    }
  }
  
  // Handle the GitHub OAuth callback
  async handleGithubCallback(code, state) {
    // Verify state parameter to prevent CSRF attacks
    if (!this.verifyState(state)) {
      return { success: false, error: 'Invalid state parameter' };
    }
    
    try {
      // Exchange the authorization code for an access token
      // Again, this should ideally happen on your backend
      const response = await axios.post(`${this.apiBaseUrl}/auth/github/callback`, {
        code,
        client_id: this.githubClientId,
        client_secret: this.githubClientSecret,
        redirect_uri: this.githubRedirectUri,
      });
      
      if (response.data && response.data.access_token) {
        // Store tokens
        this.storeTokens(response.data, 'github');
        
        // Get user information
        await this.fetchAndStoreGithubUserInfo(response.data.access_token);
        
        return {
          success: true,
          provider: 'github',
          userData: localStorage.getItem('user_data') 
            ? JSON.parse(localStorage.getItem('user_data')) 
            : null
        };
      }
      
      return { success: false, error: 'Failed to get access token' };
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error during GitHub authentication' 
      };
    }
  }
  
  // Store OAuth tokens
  storeTokens(tokenData, provider) {
    localStorage.setItem('access_token', tokenData.access_token);
    localStorage.setItem('token_type', tokenData.token_type || 'Bearer');
    localStorage.setItem('auth_provider', provider);
    
    if (tokenData.refresh_token) {
      localStorage.setItem('refresh_token', tokenData.refresh_token);
    }
    
    if (tokenData.expires_in) {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
      localStorage.setItem('expires_at', expiresAt.toISOString());
    }
  }
  
  // Fetch and store Google user information
  async fetchAndStoreGoogleUserInfo(accessToken) {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const userData = {
        id: response.data.sub,
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture,
        provider: 'google'
      };
      
      localStorage.setItem('user_data', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error fetching Google user info:', error);
      return null;
    }
  }
  
  // Fetch and store GitHub user information
  async fetchAndStoreGithubUserInfo(accessToken) {
    try {
      // Get basic user info
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${accessToken}` }
      });
      
      // GitHub doesn't always return email in the user endpoint, so we fetch it separately
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${accessToken}` }
      });
      
      // Find primary email
      const primaryEmail = emailResponse.data.find(email => email.primary)?.email || 
                          emailResponse.data[0]?.email;
      
      const userData = {
        id: userResponse.data.id,
        email: primaryEmail,
        name: userResponse.data.name || userResponse.data.login,
        picture: userResponse.data.avatar_url,
        username: userResponse.data.login,
        provider: 'github'
      };
      
      localStorage.setItem('user_data', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error fetching GitHub user info:', error);
      return null;
    }
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    const accessToken = localStorage.getItem('access_token');
    const expiresAt = localStorage.getItem('expires_at');
    
    if (!accessToken) return false;
    
    // Check if token is expired
    if (expiresAt) {
      const now = new Date();
      const expiration = new Date(expiresAt);
      if (now >= expiration) {
        // Token is expired
        return false;
      }
    }
    
    return true;
  }
  
  // Get user data if available
  getUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
  
  // Refresh token if possible
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    const provider = localStorage.getItem('auth_provider');
    
    if (!refreshToken || !provider) {
      return { success: false, error: 'No refresh token available' };
    }
    
    try {
      const response = await axios.post(`${this.apiBaseUrl}/auth/refresh-token`, {
        refresh_token: refreshToken,
        provider,
        client_id: provider === 'google' ? this.googleClientId : this.githubClientId,
        client_secret: provider === 'google' ? this.googleClientSecret : this.githubClientSecret,
      });
      
      if (response.data && response.data.access_token) {
        this.storeTokens(response.data, provider);
        return { success: true };
      }
      
      return { success: false, error: 'Failed to refresh token' };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error refreshing token' 
      };
    }
  }
  
  // Log out user by clearing stored tokens and data
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('auth_provider');
    localStorage.removeItem('user_data');
    localStorage.removeItem('oauth_state');
  }
}

export default new OAuthService();