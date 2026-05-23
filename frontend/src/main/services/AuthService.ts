import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001/api';

interface JwtPayload {
  sub: string;
  userId: number;
  nombre: string;
  exp: number;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  nombre: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
}

class AuthService {
  private api = axios.create({
    baseURL: `${API_URL}/auth`,
    headers: { 'Content-Type': 'application/json' },
  });

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.api.post<RegisterResponse>('/register', request);
    return response.data;
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/login', request);
    return response.data;
  }

  saveSession(loginResponse: LoginResponse): void {
    localStorage.setItem('token', loginResponse.token);
    localStorage.setItem('refreshToken', loginResponse.refreshToken);
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const { exp } = jwtDecode<JwtPayload>(token);
      if (!exp) return true;
      return Date.now() < exp * 1000;
    } catch {
      return false;
    }
  }

  private getPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  getUserEmail(): string | null {
    return this.getPayload()?.sub ?? null;
  }

  getUserName(): string | null {
    return this.getPayload()?.nombre ?? null;
  }

  getUserId(): number | null {
    return this.getPayload()?.userId ?? null;
  }

  async tryRefresh(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const response = await this.api.post<LoginResponse>('/refresh', { refreshToken });
      this.saveSession(response.data);
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }
}

export const authService = new AuthService();