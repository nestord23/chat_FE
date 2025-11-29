import { useState } from 'react';
import { X, UserPlus, Search } from 'lucide-react';

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (username: string) => void;
}

export default function ChatPopup({ isOpen, onClose, onStartChat }: ChatPopupProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!username.trim()) return;

    setLoading(true);
    // Simular búsqueda de usuario
    setTimeout(() => {
      if (onStartChat) {
        onStartChat(username);
      }
      setUsername('');
      setLoading(false);
      onClose();
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <>
      {/* Overlay y Popup */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <UserPlus className="text-indigo-600" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Nuevo Chat</h2>
              </div>
              <button
                onClick={() => onClose()}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-6">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Buscar por username..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Ingresa el username de la persona con quien deseas chatear
                </p>
              </div>

              {/* Footer */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!username.trim() || loading}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    'Iniciar Chat'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
