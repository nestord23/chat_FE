export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at?: string;
}
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}
export interface RegisterData {
  email: string;
  password: string;
  username: string;
}
export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  session?: Session;
}
