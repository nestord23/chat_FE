import { useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { Socket } from "socket.io-client";
import { socketService } from "../services/socketService";
import type { ConnectionStatus } from "../services/socketService";
import { useAuthContext } from "./useAuthContext";

export const useWebSocket = () => {
  const { session, user } = useAuthContext();
  const socketRef = useRef<Socket | null>(null);

  // Usar useSyncExternalStore para el status (patrón recomendado por React)
  const status = useSyncExternalStore(
    (callback) => socketService.onStatusChange(callback),
    () => socketService.getStatus(),
    () => "disconnected" as ConnectionStatus
  );

  // Efecto principal para manejar la conexión/desconexión automática
  useEffect(() => {
    if (!session?.access_token || !user?.id) {
      console.log("No hay session, desconectando websocket...");
      socketService.disconnect();
      socketRef.current = null;
      return;
    }

    console.log("Session detectada, conectando websocket...");
    try {
      const socketInstance = socketService.connect(session.access_token);
      socketRef.current = socketInstance;
    } catch (error) {
      console.error("Error al conectar websocket:", error);
    }

    return () => {
      console.log("Limpiando la conexion websocket...");
      socketService.disconnect();
      socketRef.current = null;
    };
  }, [session?.access_token, user?.id]);

  const connect = useCallback(() => {
    if (!session?.access_token) {
      console.warn("No hay token disponible para conectar");
      return;
    }

    if (!user?.id) {
      console.warn("No hay usuario autenticado");
      return;
    }

    try {
      console.log("Iniciando conexion WebSocket manualmente...");
      const socketInstance = socketService.connect(session.access_token);
      socketRef.current = socketInstance;
    } catch (error) {
      console.error("Error al conectar WebSocket:", error);
    }
  }, [session, user]);

  const disconnect = useCallback(() => {
    console.log("Desconectando WebSocket manualmente...");
    socketService.disconnect();
    socketRef.current = null;
  }, []);

  const isConnected = useCallback(() => {
    return socketService.isConnected();
  }, []);

  // Función para obtener el socket - NO acceder a ref durante render
  const getSocket = useCallback(() => {
    return socketRef.current;
  }, []);

  return {
    getSocket, // Solo retornar la función getter
    status,
    connect,
    disconnect,
    isConnected,
  };
};
