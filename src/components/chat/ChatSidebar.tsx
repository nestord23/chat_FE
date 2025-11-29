import { useState } from 'react';
import ChatPopup from '../popup/Nuevo_chat';
interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'offline' | 'away';
  lastMessage?: string;
  unreadCount?: number;
  lastSeen?: string;
}

const ChatSidebar = ({ selectedChat, onSelectChat }: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Mock data - esto se reemplazará con datos reales del backend
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Neo',
      email: 'neo@matrix.sys',
      status: 'online',
      lastMessage: 'Follow the white rabbit...',
      unreadCount: 3,
      lastSeen: 'Ahora',
    },
    {
      id: '2',
      name: 'Trinity',
      email: 'trinity@matrix.sys',
      status: 'online',
      lastMessage: 'The Matrix has you...',
      unreadCount: 0,
      lastSeen: 'Hace 5 min',
    },
    {
      id: '3',
      name: 'Morpheus',
      email: 'morpheus@matrix.sys',
      status: 'away',
      lastMessage: 'What is real?',
      unreadCount: 1,
      lastSeen: 'Hace 1 hora',
    },
    {
      id: '4',
      name: 'Agent Smith',
      email: 'smith@matrix.sys',
      status: 'offline',
      lastMessage: 'Mr. Anderson...',
      unreadCount: 0,
      lastSeen: 'Hace 2 días',
    },
  ];

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'online':
        return '#22c55e';
      case 'away':
        return '#eab308';
      case 'offline':
        return '#6b7280';
    }
  };

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Search Bar */}
      <div style={{ padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Buscar contactos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '80%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(0, 255, 0, 0.3)',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              color: '#4ade80',
              fontSize: '0.875rem',
              fontFamily: 'Orbitron, sans-serif',
              outline: 'none',
              transition: 'all 0.3s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4ade80';
              e.target.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 255, 0, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <svg
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1rem',
              height: '1rem',
              color: '#4ade80',
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Contacts List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 0.5rem',
        }}
      >
        {filteredContacts.length === 0 ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: 'rgba(0, 255, 0, 0.5)',
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.875rem',
            }}
          >
            No se encontraron contactos
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectChat(contact.id)}
              style={{
                padding: '1rem',
                margin: '0.25rem',
                borderRadius: '0.5rem',
                border: `1px solid ${
                  selectedChat === contact.id ? 'rgba(0, 255, 0, 0.5)' : 'rgba(0, 255, 0, 0.2)'
                }`,
                backgroundColor:
                  selectedChat === contact.id ? 'rgba(0, 255, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (selectedChat !== contact.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedChat !== contact.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.2)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Avatar */}
                <div style={{ position: 'relative' }}>
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
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Status Indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '0.75rem',
                      height: '0.75rem',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(contact.status),
                      border: '2px solid #000',
                    }}
                  />
                </div>

                {/* Contact Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#4ade80',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {contact.name}
                    </h3>
                    {contact.unreadCount && contact.unreadCount > 0 ? (
                      <div
                        style={{
                          minWidth: '1.25rem',
                          height: '1.25rem',
                          borderRadius: '50%',
                          backgroundColor: '#22c55e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.625rem',
                          fontFamily: 'Orbitron, sans-serif',
                          fontWeight: 'bold',
                          color: '#000',
                        }}
                      >
                        {contact.unreadCount}
                      </div>
                    ) : null}
                  </div>
                  <p
                    style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '0.75rem',
                      color: 'rgba(0, 255, 0, 0.6)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {contact.lastMessage || contact.email}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '0.625rem',
                      color: 'rgba(0, 255, 0, 0.4)',
                      margin: '0.25rem 0 0 0',
                    }}
                  >
                    {contact.lastSeen}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Chat Button */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(0, 255, 0, 0.3)' }}>
        <button
          onClick={() => setIsPopupOpen(true)} // ✅ AGREGA ESTO
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(0, 255, 0, 0.5)',
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            color: '#4ade80',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <svg
            style={{ width: '1.25rem', height: '1.25rem' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          NUEVO CHAT
        </button>
      </div>
      <ChatPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onStartChat={(username) => {
          console.log('Iniciar chat con:', username);
          // Aquí puedes agregar la lógica para crear el chat
        }}
      />
    </div>
  );
};

export default ChatSidebar;
