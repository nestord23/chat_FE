import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Terminal, Search, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { useUserSearch } from '../../hooks/useUserSearch';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (userId: string, username: string, email: string) => void;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
}

export default function ChatPopup({ isOpen, onClose, onStartChat }: ChatPopupProps) {
  const [username, setUsername] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Custom hooks
  const debouncedUsername = useDebounce(username, 500);
  const { Loading: loading, result: searchResults, error } = useUserSearch(debouncedUsername);
  useBodyScrollLock(isOpen);

  // Handlers
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setUsername(user.username);
  };

  const handleSubmit = () => {
    if (!selectedUser) return;

    if (onStartChat) {
      onStartChat(selectedUser.id, selectedUser.username, selectedUser.email);
    }

    // Reset
    setUsername('');
    setSelectedUser(null);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && selectedUser) {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const popupContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-[9999]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 animate-in fade-in duration-300"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000000',
          opacity: 0.97,
          backgroundImage: `
            linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Popup Container */}
      <div
        className="relative w-full max-w-lg transform transition-all animate-in zoom-in-95 duration-300"
        style={{
          position: 'relative',
          zIndex: 10000,
          maxWidth: '32rem',
        }}
      >
        {/* Glow Effect */}
        <div
          className="absolute -inset-1 rounded-xl opacity-75 blur-xl animate-pulse"
          style={{
            background: 'linear-gradient(45deg, #22c55e, #4ade80, #22c55e)',
          }}
        />

        {/* Main Popup */}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            backgroundColor: '#000000',
            border: '2px solid rgba(34, 197, 94, 0.5)',
            boxShadow: '0 0 40px rgba(34, 197, 94, 0.3)',
          }}
        >
          {/* Header Section */}
          <div
            className="relative border-b"
            style={{
              background:
                'linear-gradient(180deg, rgba(0, 26, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
              borderColor: 'rgba(34, 197, 94, 0.3)',
            }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className="relative p-3 rounded-lg"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(74, 222, 128, 0.1))',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                    }}
                  >
                    <Terminal className="text-green-400" size={24} />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-bold tracking-wider mb-1"
                      style={{
                        fontFamily: 'Orbitron, sans-serif',
                        color: '#4ade80',
                        textShadow: '0 0 20px rgba(74, 222, 128, 0.5)',
                      }}
                    >
                      NUEVO CHAT
                    </h2>
                    <p
                      className="text-xs tracking-wide"
                      style={{
                        color: 'rgba(74, 222, 128, 0.6)',
                        fontFamily: 'Orbitron, sans-serif',
                      }}
                    >
                      &gt; Buscar y conectar
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-lg transition-all duration-200"
                  style={{
                    color: '#4ade80',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Body Section */}
          <div className="p-8" style={{ backgroundColor: '#000000' }}>
            {/* Search Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-5 rounded-full"
                  style={{
                    background: 'linear-gradient(180deg, #4ade80, #22c55e)',
                    boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)',
                  }}
                />
                <label
                  htmlFor="username"
                  className="text-sm font-bold tracking-widest"
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    color: '#4ade80',
                  }}
                >
                  BUSCAR USUARIO
                </label>
              </div>

              {/* Input Container */}
              <div className="relative group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-green-500/50" size={18} />
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Escribe para buscar..."
                    className="relative w-full pl-11 pr-12 py-4 rounded-lg outline-none transition-all duration-300 font-mono text-sm"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      border: '2px solid rgba(34, 197, 94, 0.3)',
                      color: '#4ade80',
                      fontFamily: 'Orbitron, sans-serif',
                    }}
                    autoFocus
                  />
                  {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="text-green-400 animate-spin" size={20} />
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontFamily: 'Orbitron, sans-serif',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && !selectedUser && (
                <div
                  className="max-h-64 overflow-y-auto rounded-lg"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}
                >
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="p-3 cursor-pointer transition-all duration-200 flex items-center gap-3"
                      style={{
                        borderBottom: '1px solid rgba(34, 197, 94, 0.1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          border: '2px solid rgba(34, 197, 94, 0.5)',
                          fontFamily: 'Orbitron, sans-serif',
                          color: '#4ade80',
                        }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p
                          className="font-bold text-sm"
                          style={{
                            color: '#4ade80',
                            fontFamily: 'Orbitron, sans-serif',
                          }}
                        >
                          {user.username}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            color: 'rgba(74, 222, 128, 0.6)',
                            fontFamily: 'Orbitron, sans-serif',
                          }}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected User */}
              {selectedUser && (
                <div
                  className="p-4 rounded-lg flex items-center gap-3"
                  style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    border: '2px solid rgba(34, 197, 94, 0.4)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.3)',
                      border: '2px solid #4ade80',
                      fontFamily: 'Orbitron, sans-serif',
                      color: '#4ade80',
                      fontSize: '18px',
                    }}
                  >
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p
                      className="font-bold"
                      style={{
                        color: '#4ade80',
                        fontFamily: 'Orbitron, sans-serif',
                      }}
                    >
                      {selectedUser.username}
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: 'rgba(74, 222, 128, 0.7)',
                        fontFamily: 'Orbitron, sans-serif',
                      }}
                    >
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div
                className="flex items-start gap-3 p-4 rounded-lg"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(0, 0, 0, 0.3))',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                }}
              >
                <div className="text-green-500 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{
                    color: 'rgba(74, 222, 128, 0.7)',
                    fontFamily: 'Orbitron, sans-serif',
                  }}
                >
                  Escribe mínimo 2 caracteres para buscar. Selecciona un usuario de la lista.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3.5 rounded-lg font-bold tracking-widest text-sm transition-all duration-200"
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  border: '2px solid rgba(34, 197, 94, 0.3)',
                  color: '#4ade80',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedUser || loading}
                className="flex-1 px-6 py-3.5 rounded-lg font-bold tracking-widest text-sm transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  backgroundColor: selectedUser && !loading ? '#22c55e' : 'rgba(34, 197, 94, 0.2)',
                  color: selectedUser && !loading ? '#000000' : 'rgba(74, 222, 128, 0.4)',
                  border: '2px solid',
                  borderColor: selectedUser && !loading ? '#4ade80' : 'rgba(34, 197, 94, 0.3)',
                  boxShadow: selectedUser && !loading ? '0 0 30px rgba(34, 197, 94, 0.4)' : 'none',
                  cursor: selectedUser && !loading ? 'pointer' : 'not-allowed',
                }}
              >
                <UserPlus size={18} />
                <span>INICIAR CHAT</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div
            className="border-t px-6 py-4"
            style={{
              background:
                'linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 26, 0, 0.4) 100%)',
              borderColor: 'rgba(34, 197, 94, 0.2)',
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 10px #22c55e',
                }}
              />
              <p
                className="text-xs font-mono tracking-wider"
                style={{
                  color: 'rgba(74, 222, 128, 0.5)',
                  fontFamily: 'Orbitron, sans-serif',
                }}
              >
                BÚSQUEDA EN TIEMPO REAL • CONEXIÓN SEGURA
              </p>
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 10px #22c55e',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(popupContent, document.body);
}
