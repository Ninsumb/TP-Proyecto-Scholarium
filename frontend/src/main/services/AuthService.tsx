import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001/api';

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
  nombre: string;
  email: string;
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

  // Métodos para manejar el token y la sesión
  saveSession(loginResponse: LoginResponse): void {
    localStorage.setItem('token', loginResponse.token);
    localStorage.setItem('userEmail', loginResponse.email);
    localStorage.setItem('userName', loginResponse.nombre);
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null;
  }

  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  getUserName(): string | null {
    return localStorage.getItem('userName');
  }
}

export const authService = new AuthService();