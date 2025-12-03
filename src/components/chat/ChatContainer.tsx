import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

const ChatContainer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<string | null>(() => {
    return localStorage.getItem('selectedChat');
  });
  const [selectedContactName, setSelectedContactName] = useState<string>(() => {
    return localStorage.getItem('selectedContactName') || '';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSelectChat = (chatId: string, contactName?: string) => {
    setSelectedChat(chatId);
    localStorage.setItem('selectedChat', chatId);
    if (contactName) {
      setSelectedContactName(contactName);
      localStorage.setItem('selectedContactName', contactName);
    }
  };

  // Matrix rain effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const matrix = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}';
    const matrixChars = matrix.split('');

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f0';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);
    window.addEventListener('resize', setCanvasSize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      {/* Matrix Rain Background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      />

      {/* Main Chat Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            height: '4rem',
            borderBottom: '1px solid rgba(0, 255, 0, 0.3)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            boxShadow: '0 4px 20px rgba(0, 255, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(0, 255, 0, 0.5)',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                cursor: 'pointer',
                color: '#4ade80',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#4ade80',
                textShadow: '0 0 10px rgba(0, 255, 0, 0.8)',
                letterSpacing: '0.1em',
              }}
            >
              HACK CHAT
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.875rem',
                color: '#4ade80',
                textShadow: '0 0 5px rgba(0, 255, 0, 0.5)',
                letterSpacing: '0.05em',
              }}
            >
              {user?.username || 'USER'}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                color: '#ef4444',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Sidebar */}
          <div
            style={{
              width: isSidebarOpen ? '20rem' : '0',
              transition: 'width 0.3s ease',
              overflow: 'hidden',
              borderRight: isSidebarOpen ? '1px solid rgba(0, 255, 0, 0.3)' : 'none',
            }}
          >
            <ChatSidebar selectedChat={selectedChat} onSelectChat={handleSelectChat} />
          </div>

          {/* Main Chat Window */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ChatWindow selectedChat={selectedChat} contactName={selectedContactName} />
          </div>
        </div>
      </div>

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

export default ChatContainer;
