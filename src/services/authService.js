const API_URL = import.meta.env.VITE_MAGENTO_API_URL;
// authService.js
const isDevelopment = import.meta.env.MODE === 'development';


export const isAuthenticated = isDevelopment 
    ? () => true : authService.isAuthenticated.bind(authService); // Conditional export

export const getToken = isDevelopment
    ? () => 'dev-token' : authService.getToken.bind(authService);   // Conditional export

class AuthService {
  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/integration/admin/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Login failed');
      }

      const token = await response.text();
      // Remove any quotes from the token if present
      const cleanToken = token.replace(/['"]+/g, '');
      this.setToken(cleanToken);
      return cleanToken;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  setToken(token) {
    if (!token) return;
    localStorage.setItem('adminToken', token);
  }

  getToken() {
    return localStorage.getItem('adminToken');
  }

  async validateToken() {
    try {
      const token = this.getToken();
      if (!token) return false;

      // Try to make a simple API call to validate the token
      const response = await fetch(`${API_URL}/store/storeConfigs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  async isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // Validate the token
    const isValid = await this.validateToken();
    if (!isValid) {
      this.logout();
      return false;
    }
    
    return true;
  }

  logout() {
    localStorage.removeItem('adminToken');
  }
}

export const authService = new AuthService();

 
 

export const login = authService.login.bind(authService);
export const logout = authService.logout.bind(authService);
