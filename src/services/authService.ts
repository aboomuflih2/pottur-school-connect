import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api';

interface LoginResponse {
  access: string;
  refresh: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  is_staff: boolean;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
        email,
        password
      });
      
      const { access, refresh } = response.data;
      
      // Store tokens
      this.accessToken = access;
      this.refreshToken = refresh;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      return response.data;
    } catch (error) {
      throw new Error('Login failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/accounts/users/me/`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      // Token might be expired, try to refresh
      if (await this.refreshAccessToken()) {
        const response = await axios.get(`${API_BASE_URL}/accounts/users/me/`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        });
        return response.data;
      }
      return null;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
        refresh: this.refreshToken
      });
      
      this.accessToken = response.data.access;
      localStorage.setItem('access_token', this.accessToken);
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const authService = new AuthService();
export default authService;