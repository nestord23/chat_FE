import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { socketService } from '../../services/socketService';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  receiverId?: string; // FASE 4: ID del usuario destinatario
}

const MessageInput = ({ onSendMessage, receiverId }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // FASE 4: Cleanup del timeout al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);

      // FASE 4: Emitir stop_typing al enviar
      if (receiverId && typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socketService.emitStopTyping(receiverId);
        typingTimeoutRef.current = null;
      }

      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    setIsTyping(newValue.length > 0);

    // FASE 4: Implementar debounce para typing
    if (receiverId && newValue.trim().length > 0) {
      // Emitir typing solo si no se ha emitido recientemente
      if (!typingTimeoutRef.current) {
        socketService.emitTyping(receiverId);
      }

      // Limpiar timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Configurar nuevo timeout para stop_typing (3 segundos)
      typingTimeoutRef.current = setTimeout(() => {
        socketService.emitStopTyping(receiverId);
        typingTimeoutRef.current = null;
      }, 3000);
    } else if (receiverId && newValue.trim().length === 0) {
      // Si se borra todo el texto, emitir stop_typing inmediatamente
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socketService.emitStopTyping(receiverId);
        typingTimeoutRef.current = null;
      }
    }
  };

  return (
    <div
      style={{
        borderTop: '1px solid rgba(0, 255, 0, 0.3)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '1rem 1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '1rem',
          position: 'relative',
        }}
      >
        {/* Emoji Button */}
        <button
          style={{
            background: 'transparent',
            border: '1px solid rgba(0, 255, 0, 0.3)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            cursor: 'pointer',
            color: '#4ade80',
            transition: 'all 0.3s',
            alignSelf: 'flex-end',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.3)';
          }}
        >
          <svg
            style={{ width: '1.5rem', height: '1.5rem' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {/* Text Input */}
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            style={{
              width: '97%',
              minHeight: '1rem',
              maxHeight: '8rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(0, 255, 0, 0.3)',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              color: '#4ade80',
              fontSize: '0.875rem',
              fontFamily: 'Orbitron, sans-serif',
              outline: 'none',
              resize: 'none',
              transition: 'all 0.3s',
              boxShadow: isTyping
                ? '0 0 15px rgba(0, 255, 0, 0.3)'
                : '0 0 5px rgba(0, 255, 0, 0.1)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4ade80';
              e.target.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.4)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 255, 0, 0.3)';
              e.target.style.boxShadow = isTyping
                ? '0 0 15px rgba(0, 255, 0, 0.3)'
                : '0 0 5px rgba(0, 255, 0, 0.1)';
            }}
          />
          {/* Character Counter */}
          {message.length > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: '0.5rem',
                right: '0.75rem',
                fontSize: '0.625rem',
                color: 'rgba(0, 255, 0, 0.5)',
                fontFamily: 'Orbitron, sans-serif',
              }}
            >
              {message.length}
            </div>
          )}
        </div>

        {/* Attachment Button */}
        <button
          style={{
            background: 'transparent',
            border: '1px solid rgba(0, 255, 0, 0.3)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            cursor: 'pointer',
            color: '#4ade80',
            transition: 'all 0.3s',
            alignSelf: 'flex-end',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.3)';
          }}
        >
          <svg
            style={{ width: '1.5rem', height: '1.5rem' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          style={{
            background: message.trim() ? 'rgba(0, 255, 0, 0.15)' : 'rgba(0, 255, 0, 0.05)',
            border: `1px solid ${message.trim() ? 'rgba(0, 255, 0, 0.5)' : 'rgba(0, 255, 0, 0.2)'}`,
            borderRadius: '0.5rem',
            padding: '0.75rem 1.5rem',
            cursor: message.trim() ? 'pointer' : 'not-allowed',
            color: message.trim() ? '#4ade80' : 'rgba(0, 255, 0, 0.4)',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            alignSelf: 'flex-end',
            boxShadow: message.trim() ? '0 0 15px rgba(0, 255, 0, 0.3)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (message.trim()) {
              e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.25)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 255, 0, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (message.trim()) {
              e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.15)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.3)';
            }
          }}
        >
          <svg
            style={{ width: '1.25rem', height: '1.25rem' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      {/* Hint Text */}
      <p
        style={{
          marginTop: '0.5rem',
          fontSize: '0.625rem',
          color: 'rgba(0, 255, 0, 0.4)',
          fontFamily: 'Orbitron, sans-serif',
          textAlign: 'center',
        }}
      >
        Presiona Enter para enviar • Shift + Enter para nueva línea
      </p>
    </div>
  );
};

export default MessageInput;
