import type { AuthResponse, RegisterData, LoginData, User } from '../types/auth.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const authService = {
  /**
   * Registrar nuevo usuario
   */
  async register({ email, password, username }: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ⚠️ IMPORTANTE: Enviar/recibir cookies
      body: JSON.stringify({ email, password, username }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en el registro');
    }

    return data;
  },

  /**
   * Iniciar sesión
   */
  async login({ email, password }: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ⚠️ IMPORTANTE: Recibir cookies
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en el login');
    }

    return data;
  },

  /**
   * Obtener token CSRF
   */
  async getCsrfToken(): Promise<string> {
    const response = await fetch(`${API_URL}/api/auth/csrf-token`, {
      credentials: 'include',
    });
    const data = await response.json();
    return data.csrfToken;
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<AuthResponse> {
    const csrfToken = await this.getCsrfToken();

    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al cerrar sesión');
    }

    return data;
  },

  /**
   * Verificar sesión activa
   */
  async getSession(): Promise<{ success: boolean; user: User }> {
    const response = await fetch(`${API_URL}/api/auth/session`, {
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No hay sesión activa');
    }

    return data;
  },
};
