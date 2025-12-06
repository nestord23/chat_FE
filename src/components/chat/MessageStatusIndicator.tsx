import React from 'react';
import type { MessageStatus } from '../../types/message';

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  isMine: boolean;
}

// SVG para un check individual - Definido fuera del componente
const CheckIcon: React.FC<{ color: string; style?: React.CSSProperties }> = ({ color, style }) => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={style}>
    <path
      d="M13.5 4L6 11.5L2.5 8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Componente que muestra los checks de estado del mensaje
 * Similar a WhatsApp:
 * - 1 check gris: enviado
 * - 2 checks grises: entregado
 * - 2 checks azules/verdes: visto
 */
export const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({
  status,
  isMine,
}) => {
  // Solo mostrar indicadores para mensajes propios
  if (!isMine) return null;

  const getCheckColor = () => {
    switch (status) {
      case 'visto':
        return '#00ff00'; // Verde brillante (tema Matrix)
      case 'entregado':
        return 'rgba(0, 255, 0, 0.5)'; // Verde semi-transparente
      case 'enviado':
      default:
        return 'rgba(0, 255, 0, 0.3)'; // Verde muy tenue
    }
  };

  const checkColor = getCheckColor();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '1px',
        marginLeft: '4px',
        position: 'relative',
      }}
      title={`Estado: ${status}`}
    >
      {status === 'enviado' && (
        // 1 check para "enviado"
        <CheckIcon color={checkColor} />
      )}

      {(status === 'entregado' || status === 'visto') && (
        // 2 checks para "entregado" y "visto"
        <>
          <CheckIcon color={checkColor} style={{ position: 'relative', left: '3px' }} />
          <CheckIcon color={checkColor} style={{ position: 'relative', left: '-3px' }} />
        </>
      )}
    </div>
  );
};

export default MessageStatusIndicator;
