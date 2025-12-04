import { useWebSocket } from '../hooks/useWebSocket';

/**
 * 🔌 Componente para mostrar el estado de conexión WebSocket
 */
export const ConnectionStatus = () => {
  const { status } = useWebSocket();

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-green-500',
          text: 'Conectado',
          icon: '🟢',
        };
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          text: 'Conectando...',
          icon: '🟡',
        };
      case 'error':
        return {
          color: 'bg-red-500',
          text: 'Error de conexión',
          icon: '🔴',
        };
      case 'disconnected':
      default:
        return {
          color: 'bg-gray-500',
          text: 'Desconectado',
          icon: '⚪',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <span className="text-sm text-gray-300">{config.text}</span>
    </div>
  );
};
