import { useState, useEffect } from 'react';
import ChatPopup from '../popup/Nuevo_chat';
import { chatService } from '../../services/chatService';
import { useAuthContext } from '../../contexts/AuthContext';
import type { Conversation } from '../../types/chat.types';
interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (chatId: string, contactName?: string) => void;
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
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar conversaciones del backend
  useEffect(() => {
    const loadConversations = async () => {
      console.log('🔄 Iniciando carga de conversaciones...');
      console.log('👤 Usuario actual:', user);

      try {
        setLoading(true);
        setError(null);

        console.log('📡 Llamando a chatService.getConversations()...');
        const conversations = await chatService.getConversations();
        console.log('✅ Conversaciones recibidas:', conversations);

        // Convertir conversaciones a formato Contact
        const contactsFromConversations: Contact[] = conversations.map((conv: Conversation) => ({
          id: conv.other_user_id,
          name: conv.username,
          email: '', // El backend no devuelve email en conversaciones
          status: 'online', // Por defecto, se puede actualizar con WebSocket
          lastMessage: conv.last_message,
          unreadCount: conv.unread_count,
          lastSeen: conv.last_message_time,
        }));

        console.log('👥 Contactos procesados:', contactsFromConversations);
        setContacts(contactsFromConversations);
      } catch (err: unknown) {
        console.error('❌ Error al cargar conversaciones:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar conversaciones';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadConversations();
    }
  }, [user]);

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
        {loading ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: 'rgba(0, 255, 0, 0.5)',
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>⏳</div>
            <div>Cargando conversaciones...</div>
          </div>
        ) : error ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: 'rgba(239, 68, 68, 0.7)',
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>⚠️</div>
            <div>{error}</div>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: 'rgba(0, 255, 0, 0.5)',
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.875rem',
            }}
          >
            {contacts.length === 0 ? (
              <>
                <div style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>💬</div>
                <div>No tienes contactos aún</div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    marginTop: '0.5rem',
                    color: 'rgba(0, 255, 0, 0.4)',
                  }}
                >
                  Haz clic en "NUEVO CHAT" para agregar
                </div>
              </>
            ) : (
              'No se encontraron contactos'
            )}
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectChat(contact.id, contact.name)}
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
        onStartChat={async (userId: string, username: string, email: string) => {
          console.log('Iniciar chat con:', username, 'ID:', userId, 'Email:', email);

          try {
            // Verificar si el contacto ya existe
            const existingContact = contacts.find((c) => c.id === userId);

            if (!existingContact) {
              // Crear conversación en el backend
              await chatService.createConversation(userId);

              // Crear nuevo contacto
              const newContact: Contact = {
                id: userId,
                name: username,
                email: email,
                status: 'online',
                lastMessage: undefined,
                unreadCount: 0,
                lastSeen: 'Ahora',
              };

              // Agregar el nuevo contacto a la lista
              setContacts((prev) => [newContact, ...prev]);
            }

            // Seleccionar el chat automáticamente
            onSelectChat(userId, username);

            // Cerrar el popup
            setIsPopupOpen(false);
          } catch (err: unknown) {
            console.error('Error al crear conversación:', err);
            // Aún así intentamos abrir el chat localmente
            const newContact: Contact = {
              id: userId,
              name: username,
              email: email,
              status: 'online',
              lastMessage: undefined,
              unreadCount: 0,
              lastSeen: 'Ahora',
            };
            setContacts((prev) => [newContact, ...prev]);
            onSelectChat(userId, username);
            setIsPopupOpen(false);
          }
        }}
      />
    </div>
  );
};

export default ChatSidebar;
