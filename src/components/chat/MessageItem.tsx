interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMine: boolean;
}

interface MessageItemProps {
  message: Message;
}

const MessageItem = ({ message }: MessageItemProps) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: message.isMine ? 'flex-end' : 'flex-start',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: message.isMine ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
            backgroundColor: message.isMine ? 'rgba(0, 255, 0, 0.15)' : 'rgba(0, 0, 0, 0.6)',
            border: `1px solid ${message.isMine ? 'rgba(0, 255, 0, 0.4)' : 'rgba(0, 255, 0, 0.2)'}`,
            boxShadow: message.isMine
              ? '0 0 15px rgba(0, 255, 0, 0.2)'
              : '0 0 10px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = message.isMine
              ? '0 0 20px rgba(0, 255, 0, 0.4)'
              : '0 0 15px rgba(0, 255, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = message.isMine
              ? '0 0 15px rgba(0, 255, 0, 0.2)'
              : '0 0 10px rgba(0, 0, 0, 0.3)';
          }}
        >
          <p
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.875rem',
              color: '#4ade80',
              margin: 0,
              wordWrap: 'break-word',
              lineHeight: '1.5',
            }}
          >
            {message.text}
          </p>
        </div>
        <span
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.625rem',
            color: 'rgba(0, 255, 0, 0.5)',
            alignSelf: message.isMine ? 'flex-end' : 'flex-start',
            paddingLeft: message.isMine ? 0 : '0.5rem',
            paddingRight: message.isMine ? '0.5rem' : 0,
          }}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MessageItem;
