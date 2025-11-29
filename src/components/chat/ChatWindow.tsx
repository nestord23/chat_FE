import { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  selectedChat: string | null;
}

const ChatWindow = ({ selectedChat }: ChatWindowProps) => {
  const [messages, setMessages] = useState<any[]>([]);

  // Mock data para demostración
  useEffect(() => {
    if (selectedChat) {
      // Aquí cargarías los mensajes reales del backend
      setMessages([
        {
          id: '1',
          senderId: '1',
          text: 'Follow the white rabbit...',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isMine: false,
        },
        {
          id: '2',
          senderId: 'me',
          text: 'What do you mean?',
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          isMine: true,
        },
        {
          id: '3',
          senderId: '1',
          text: 'The Matrix has you...',
          timestamp: new Date(Date.now() - 2400000).toISOString(),
          isMine: false,
        },
        {
          id: '4',
          senderId: 'me',
          text: 'I need to know more',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          isMine: true,
        },
      ]);
    }
  }, [selectedChat]);

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text,
      timestamp: new Date().toISOString(),
      isMine: true,
    };
    setMessages([...messages, newMessage]);
    // Aquí enviarías el mensaje al backend
  };

  if (!selectedChat) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid rgba(0, 255, 0, 0.3)',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          <svg
            style={{
              width: '4rem',
              height: '4rem',
              color: '#4ade80',
              margin: '0 auto 1rem',
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h2
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#4ade80',
              marginBottom: '0.5rem',
              textShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
            }}
          >
            SELECCIONA UN CHAT
          </h2>
          <p
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.875rem',
              color: 'rgba(0, 255, 0, 0.6)',
            }}
          >
            Elige un contacto para comenzar a chatear
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          height: '4rem',
          borderBottom: '1px solid rgba(0, 255, 0, 0.3)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.5rem',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            border: '2px solid rgba(0, 255, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 'bold',
            color: '#4ade80',
            fontSize: '1rem',
          }}
        >
          N
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#4ade80',
              margin: 0,
            }}
          >
            Neo
          </h3>
          <p
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.75rem',
              color: 'rgba(0, 255, 0, 0.6)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'inline-block',
              }}
            />
            En línea
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            style={{
              background: 'transparent',
              border: '1px solid rgba(0, 255, 0, 0.3)',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              cursor: 'pointer',
              color: '#4ade80',
              transition: 'all 0.3s',
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
              style={{ width: '1.25rem', height: '1.25rem' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MessageList messages={messages} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
