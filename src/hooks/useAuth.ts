import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { authService } from '../services/authService';
import type { User, RegisterData, LoginData } from '../types/auth.types';
import type { Session as SupabaseSession } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();

    // Escuchar cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth event:', event);
      setSession(session);
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email!,
              username: session.user.user_metadata?.username || session.user.email!.split('@')[0],
            }
          : null
      );
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      // 🔧 Si hay error de refresh token, limpiar sesión local
      if (error) {
        console.warn('⚠️ Error al obtener sesión:', error.message);

        // Si es un error de refresh token, limpiar todo
        if (error.message.includes('refresh') || error.message.includes('token')) {
          console.log('🧹 Limpiando sesión corrupta...');
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          return;
        }
      }

      setSession(session);
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email!,
              username: session.user.user_metadata?.username || session.user.email!.split('@')[0],
            }
          : null
      );
    } catch (error) {
      console.error('❌ Error al verificar sesión:', error);
      // En caso de cualquier error, limpiar sesión por seguridad
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    const result = await authService.register(data);
    await checkSession();
    return result;
  };

  const login = async (data: LoginData) => {
    const result = await authService.login(data);
    await checkSession();
    return result;
  };

  const logout = async () => {
    await authService.logout();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const getAccessToken = (): string | undefined => {
    return session?.access_token;
  };

  return {
    user,
    session,
    loading,
    register,
    login,
    logout,
    getAccessToken,
  };
};
