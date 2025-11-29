interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
}

const TypingIndicator = ({ isTyping, userName = 'Usuario' }: TypingIndicatorProps) => {
  if (!isTyping) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        animation: 'fadeIn 0.3s ease-in',
      }}
    >
      <span
        style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.75rem',
          color: 'rgba(0, 255, 0, 0.6)',
        }}
      >
        {userName} está escribiendo
      </span>
      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        <div
          style={{
            width: '0.375rem',
            height: '0.375rem',
            borderRadius: '50%',
            backgroundColor: '#4ade80',
            animation: 'bounce 1.4s infinite ease-in-out both',
          }}
        />
        <div
          style={{
            width: '0.375rem',
            height: '0.375rem',
            borderRadius: '50%',
            backgroundColor: '#4ade80',
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: '0.16s',
          }}
        />
        <div
          style={{
            width: '0.375rem',
            height: '0.375rem',
            borderRadius: '50%',
            backgroundColor: '#4ade80',
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: '0.32s',
          }}
        />
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
