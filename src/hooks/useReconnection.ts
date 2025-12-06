import { useEffect, useRef, useCallback } from 'react';
import { socketService } from '../services/socketService';
import type { ConnectionStatus } from '../services/socketService';

interface UseReconnectionOptions {
  enabled?: boolean;
  onReconnect?: () => void | Promise<void>;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

/**
 * Hook para manejar reconexión y sincronización
 * FASE 6: Manejo robusto de reconexión
 */
export const useReconnection = (options: UseReconnectionOptions = {}) => {
  const { enabled = true, onReconnect, onDisconnect, onError } = options;

  const previousStatusRef = useRef<ConnectionStatus>('disconnected');
  const reconnectCallbackRef = useRef(onReconnect);
  const disconnectCallbackRef = useRef(onDisconnect);
  const errorCallbackRef = useRef(onError);

  // Actualizar refs cuando cambien los callbacks
  useEffect(() => {
    reconnectCallbackRef.current = onReconnect;
    disconnectCallbackRef.current = onDisconnect;
    errorCallbackRef.current = onError;
  }, [onReconnect, onDisconnect, onError]);

  // Forzar reconexión manual
  const forceReconnect = useCallback(() => {
    console.log('🔄 Forzando reconexión manual...');
    socketService.reconnect();
  }, []);

  // Actualizar token
  const updateToken = useCallback((newToken: string) => {
    console.log('🔑 Actualizando token desde hook...');
    socketService.updateToken(newToken);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    console.log('📡 Configurando listener de reconexión...');

    const unsubscribe = socketService.onStatusChange((status) => {
      const previousStatus = previousStatusRef.current;
      previousStatusRef.current = status;

      // Detectar reconexión exitosa
      if (previousStatus !== 'connected' && status === 'connected') {
        console.log('✅ Reconexión detectada, ejecutando callback...');

        if (reconnectCallbackRef.current) {
          const result = reconnectCallbackRef.current();

          // Si el callback retorna una Promise, manejarla
          if (result instanceof Promise) {
            result.catch((error) => {
              console.error('❌ Error en callback de reconexión:', error);
              if (errorCallbackRef.current) {
                errorCallbackRef.current(error.message || 'Error desconocido');
              }
            });
          }
        }
      }

      // Detectar desconexión
      if (previousStatus === 'connected' && status === 'disconnected') {
        console.log('🔌 Desconexión detectada, ejecutando callback...');

        if (disconnectCallbackRef.current) {
          disconnectCallbackRef.current();
        }
      }

      // Detectar error
      if (status === 'error') {
        console.log('❌ Error de conexión detectado');

        if (errorCallbackRef.current) {
          errorCallbackRef.current('Error de conexión');
        }
      }
    });

    return () => {
      console.log('🧹 Limpiando listener de reconexión...');
      unsubscribe();
    };
  }, [enabled]);

  return {
    forceReconnect,
    updateToken,
  };
};
