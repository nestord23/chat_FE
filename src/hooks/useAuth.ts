import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import { authService } from "../services/authService";
import type { User, RegisterData, LoginData } from "../types/auth.types";
import type { Session as SupabaseSession } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();

    // Escuchar cambios de autenticación de Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔐 Supabase Auth event:", event);
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);

      // ✅ Primero verificar si hay sesión en Supabase
      const { data: supabaseData } = await supabase.auth.getSession();

      if (supabaseData.session) {
        console.log("🔑 Sesión de Supabase encontrada");
        setSession(supabaseData.session);
      }

      // ✅ Luego verificar con el backend
      const response = await authService.getSession();

      if (response.success && response.user) {
        console.log("✅ Sesión activa encontrada:", response.user);
        setUser(response.user);
      } else {
        console.log("⚠️ No hay sesión activa en el backend");
        setUser(null);
        setSession(null);
      }
    } catch (error: unknown) {
      console.log("ℹ️ No hay sesión activa:", error);
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
        console.log("✅ Registro exitoso:", result.user);
        setUser(result.user);

        // Si el backend devuelve tokens de Supabase
        if (result.session) {
          const { data: supabaseData, error } = await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          });

          if (error) {
            console.error("❌ Error al establecer sesión en Supabase:", error);
          } else if (supabaseData.session) {
            console.log("✅ Sesión establecida correctamente");
            setSession(supabaseData.session);
          }
        } else {
          // Si el backend NO devuelve tokens, hacer signup directo con Supabase
          console.log("🔑 Registrando en Supabase...");
          const { data: supabaseData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                username: data.username,
              },
            },
          });

          if (error) {
            console.error("❌ Error al registrar en Supabase:", error);
          } else if (supabaseData.session) {
            console.log("✅ Sesión de Supabase creada");
            setSession(supabaseData.session);
          }
        }
      }

      return result;
    } catch (error: unknown) {
      console.error("❌ Error en registro:", error);
      throw error;
    }
  };

  const login = async (data: LoginData) => {
    try {
      console.log("🔐 Intentando login...");

      // Paso 1: Login con el backend
      const result = await authService.login(data);

      if (result.success && result.user) {
        console.log("✅ Login exitoso en backend:", result.user);
        setUser(result.user);

        // Paso 2: Verificar si el backend devolvió tokens
        if (result.session) {
          console.log("🔑 Backend devolvió tokens, estableciendo sesión...");

          const { data: supabaseData, error } = await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          });

          if (error) {
            console.error("❌ Error al establecer sesión en Supabase:", error);
          } else if (supabaseData.session) {
            console.log("✅ Sesión establecida desde backend");
            setSession(supabaseData.session);
          }
        } else {
          // Paso 3: Si el backend NO devolvió tokens, login directo con Supabase
          console.log(
            "⚠️ Backend no devolvió tokens, iniciando sesión en Supabase..."
          );

          const { data: supabaseData, error } =
            await supabase.auth.signInWithPassword({
              email: data.email,
              password: data.password,
            });

          if (error) {
            console.error("❌ Error al iniciar sesión en Supabase:", error);
            throw error;
          }

          if (supabaseData.session) {
            console.log("✅ Sesión de Supabase obtenida:", {
              hasAccessToken: !!supabaseData.session.access_token,
              expiresAt: supabaseData.session.expires_at,
            });

            // ✅ CRÍTICO: Actualizar el estado local
            setSession(supabaseData.session);
            console.log("✅ Estado de sesión actualizado correctamente");
          }
        }
      } else {
        throw new Error(result.message || "Error en el login");
      }

      return result;
    } catch (error: unknown) {
      console.error("❌ Error en login:", error);
      setUser(null);
      setSession(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      console.log("✅ Logout exitoso");
    } catch (error) {
      console.error("❌ Error en logout:", error);
      // Limpiar de todas formas
      setUser(null);
      setSession(null);
    }
  };

  const getAccessToken = (): string | undefined => {
    if (session?.access_token) {
      return session.access_token;
    }
    console.warn("⚠️ No hay sesión en memoria");
    return undefined;
  };

  const getAccessTokenAsync = async (): Promise<string | undefined> => {
    console.log("🔍 getAccessTokenAsync - Buscando token...");
    console.log("📊 Estado actual:", {
      hasSession: !!session,
      hasSessionToken: !!session?.access_token,
      hasUser: !!user,
    });

    // Primero intentar desde la sesión en memoria
    if (session?.access_token) {
      console.log("✅ Token encontrado en sesión de memoria");
      return session.access_token;
    }

    console.log("⚠️ No hay sesión en memoria, consultando Supabase...");

    // Si no hay sesión, obtener de Supabase
    try {
      const { data, error } = await supabase.auth.getSession();

      console.log("📊 Respuesta de Supabase:", {
        hasData: !!data,
        hasSession: !!data?.session,
        hasToken: !!data?.session?.access_token,
        error: error?.message,
      });

      if (error) {
        console.error("❌ Error al obtener sesión de Supabase:", error);
        return undefined;
      }

      if (data.session?.access_token) {
        console.log("✅ Token obtenido de Supabase");
        setSession(data.session);
        return data.session.access_token;
      } else {
        console.warn("⚠️ No hay sesión activa en Supabase");
      }
    } catch (error) {
      console.error("❌ Error inesperado obteniendo token:", error);
    }

    console.error("❌ No se pudo obtener token de ninguna fuente");
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
