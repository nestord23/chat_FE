import { useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { ConnectionStatus } from './ConnectionStatus';

/**
 * 🧪 Componente de prueba para WebSocket - FASE 1
 * Muestra el estado de conexión y logs útiles
 */
export const WebSocketTest = () => {
  const { status, isConnected } = useWebSocket();

  useEffect(() => {
    console.log('🧪 [WebSocketTest] Estado actual:', status);
    console.log('🧪 [WebSocketTest] ¿Conectado?:', isConnected());
    console.log('🧪 [WebSocketTest] Socket instance:');
  }, [status, isConnected]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl">
        <h3 className="text-white font-semibold mb-3">🧪 WebSocket Test</h3>

        <ConnectionStatus />

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400">Estado:</span>
            <span className="text-white font-mono">{status}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400">Conectado:</span>
            <span className={`font-mono ${isConnected() ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected() ? 'Sí' : 'No'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400">Socket ID:</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500">Revisa la consola para ver logs detallados</p>
        </div>
      </div>
    </div>
  );
};
