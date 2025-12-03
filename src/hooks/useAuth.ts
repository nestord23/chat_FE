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

    // Escuchar cambios de autenticación de Supabase (opcional, por si usas Supabase también)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Supabase Auth event:', event);
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);

      // ✅ Intentar obtener la sesión del backend
      const response = await authService.getSession();

      if (response.success && response.user) {
        console.log('✅ Sesión activa encontrada:', response.user);
        setUser(response.user);

        // ✅ Recuperar también la sesión de Supabase para tener el token
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('🔑 Sesión de Supabase recuperada');
          setSession(data.session);
        }
      } else {
        console.log('⚠️ No hay sesión activa');
        setUser(null);
        setSession(null);
      }
    } catch (error: unknown) {
      console.log('ℹ️ No hay sesión activa:', error);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const result = await authService.register(data);

      if (result.success && result.user) {
        console.log('✅ Registro exitoso:', result.user);
        setUser(result.user);

        // Si el backend también devuelve tokens de Supabase, los guardamos
        if (result.session) {
          await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          });
        }
      }

      return result;
    } catch (error: unknown) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  };

  const login = async (data: LoginData) => {
    try {
      console.log('🔐 Intentando login...');
      const result = await authService.login(data);

      if (result.success && result.user) {
        console.log('✅ Login exitoso:', result.user);
        setUser(result.user);

        // Si el backend también devuelve tokens de Supabase, los guardamos
        if (result.session) {
          console.log('🔑 Guardando sesión de Supabase...');
          await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          });
        }
      } else {
        throw new Error(result.message || 'Error en el login');
      }

      return result;
    } catch (error: unknown) {
      console.error('❌ Error en login:', error);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Limpiar de todas formas
      setUser(null);
      setSession(null);
    }
  };

  const getAccessToken = (): string | undefined => {
    // Primero intentar desde la sesión en memoria
    if (session?.access_token) {
      return session.access_token;
    }

    // Si no hay sesión en memoria, intentar obtener de Supabase
    // Nota: Esto es síncrono y puede no funcionar si la sesión no está cargada
    console.warn('⚠️ No hay sesión en memoria, intenta recargar la página');
    return undefined;
  };

  // Nueva función asíncrona para obtener el token de forma confiable
  const getAccessTokenAsync = async (): Promise<string | undefined> => {
    // Primero intentar desde la sesión en memoria
    if (session?.access_token) {
      return session.access_token;
    }

    // Si no hay sesión, obtener de Supabase
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        console.log('🔑 Token obtenido de Supabase');
        setSession(data.session);
        return data.session.access_token;
      }
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
    }

    return undefined;
  };

  return {
    user,
    session,
    loading,
    register,
    login,
    logout,
    getAccessToken,
    getAccessTokenAsync,
  };
};
