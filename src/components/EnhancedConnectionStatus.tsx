import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

/**
 * Componente mejorado de estado de conexión
 * FASE 6: Muestra estado de conexión con más detalle
 */
export const EnhancedConnectionStatus: React.FC = () => {
  const { status } = useWebSocket();

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: '#00ff00',
          bgColor: 'rgba(0, 255, 0, 0.1)',
          icon: '✅',
          text: 'Conectado',
          pulse: false,
        };
      case 'connecting':
        return {
          color: '#ffaa00',
          bgColor: 'rgba(255, 170, 0, 0.1)',
          icon: '🔄',
          text: 'Conectando...',
          pulse: true,
        };
      case 'disconnected':
        return {
          color: '#888888',
          bgColor: 'rgba(136, 136, 136, 0.1)',
          icon: '⚪',
          text: 'Desconectado',
          pulse: false,
        };
      case 'error':
        return {
          color: '#ff0000',
          bgColor: 'rgba(255, 0, 0, 0.1)',
          icon: '❌',
          text: 'Error de conexión',
          pulse: true,
        };
      default:
        return {
          color: '#888888',
          bgColor: 'rgba(136, 136, 136, 0.1)',
          icon: '⚪',
          text: 'Desconocido',
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}`,
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.75rem',
        fontWeight: '500',
      }}
    >
      <span
        style={{
          fontSize: '1rem',
          animation: config.pulse ? 'pulse 2s infinite' : 'none',
        }}
      >
        {config.icon}
      </span>
      <span style={{ color: config.color }}>{config.text}</span>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedConnectionStatus;
