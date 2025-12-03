import { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { chatService } from '../../services/chatService';
import { useAuthContext } from '../../contexts/AuthContext';
import { getSocket, initializeSocket } from '../../config/socket';
import type { Message } from '../../types/chat.types';
import type {
  NewMessagePayload,
  MessageSentPayload,
  MessageDeliveredPayload,
} from '../../types/socket.types';

interface ChatWindowProps {
  selectedChat: string | null;
  contactName?: string;
}

// ✅ Interfaz para mensajes formateados
interface FormattedMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  status: string;
  error?: boolean;
}

const ChatWindow = ({ selectedChat, contactName = 'Usuario' }: ChatWindowProps) => {
  const { user, getAccessTokenAsync } = useAuthContext();

  // Función para obtener mensajes del localStorage
  const getLocalMessages = (chatId: string): FormattedMessage[] => {
    try {
      const cached = localStorage.getItem(`chat_messages_${chatId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  };

  // Función para guardar mensajes en localStorage
  const saveLocalMessages = (chatId: string, msgs: FormattedMessage[]) => {
    try {
      localStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(msgs));
    } catch (err) {
      console.error('Error al guardar mensajes localmente:', err);
    }
  };

  // Inicializar con mensajes del localStorage si existen
  const [messages, setMessages] = useState<FormattedMessage[]>(() => {
    return selectedChat ? getLocalMessages(selectedChat) : [];
  });

  // Cargar mensajes cuando se selecciona un chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat || !user) return;

      // Primero cargar del caché local
      const cachedMessages = getLocalMessages(selectedChat);
      if (cachedMessages.length > 0) {
        setMessages(cachedMessages);
      }

      try {
        const { messages: fetchedMessages } = await chatService.getMessages(selectedChat);

        // Convertir mensajes del backend al formato del componente
        const formattedMessages: FormattedMessage[] = fetchedMessages.map((msg: Message) => ({
          id: msg.id,
          senderId: msg.user_id,
          text: msg.content,
          timestamp: msg.created_at,
          isMine: msg.user_id === user.id,
          status: msg.status,
        }));

        setMessages(formattedMessages);
        saveLocalMessages(selectedChat, formattedMessages);

        // Marcar mensajes como vistos
        await chatService.markMessagesAsSeen(selectedChat);
      } catch (err) {
        console.error('Error al cargar mensajes:', err);
        // Si falla, mantener los mensajes del caché
        if (cachedMessages.length === 0) {
          setMessages([]);
        }
      }
    };

    loadMessages();
  }, [selectedChat, user]);

  // Sincronizar mensajes con localStorage cuando cambien
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      saveLocalMessages(selectedChat, messages);
    }
  }, [messages, selectedChat]);

  // Inicializar WebSocket y escuchar eventos
  useEffect(() => {
    if (!user) return;

    const initSocket = async () => {
      // Obtener el token de forma asíncrona
      const token = await getAccessTokenAsync();

      if (!token) {
        console.error('❌ No se encontró token para inicializar WebSocket');
        console.log('💡 Asegúrate de estar autenticado correctamente');
        return;
      }

      console.log('🔌 Inicializando WebSocket para usuario:', user.id);
      console.log('🔑 Token obtenido:', token.substring(0, 20) + '...');

      // Inicializar socket
      const socket = initializeSocket(token);

      // Eventos de conexión para debugging
      socket.on('connect', () => {
        console.log('✅ WebSocket CONECTADO exitosamente');
        console.log('🆔 Socket ID:', socket.id);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket:', error.message);
      });

      socket.on('disconnect', (reason) => {
        console.warn('⚠️ WebSocket desconectado. Razón:', reason);
      });

      // Conectar el socket
      socket.connect();
      console.log('🔄 Intentando conectar WebSocket...');

      // Escuchar mensajes nuevos de otros usuarios
      const handleNewMessage = (data: NewMessagePayload) => {
        console.log('📨 Nuevo mensaje recibido:', data);
        console.log('👤 De usuario:', data.from);
        console.log('💬 Chat actual seleccionado:', selectedChat);
        console.log('🔍 ¿Coincide?', data.from === selectedChat);

        // Solo agregar si el mensaje es del chat actual
        if (data.from === selectedChat) {
          console.log('✅ Agregando mensaje al chat actual');
          const newMessage: FormattedMessage = {
            id: data.id.toString(),
            senderId: data.from,
            text: data.content,
            timestamp: data.created_at,
            isMine: false,
            status: 'entregado',
          };

          setMessages((prev) => {
            console.log('📝 Mensajes antes:', prev.length);
            const updated = [...prev, newMessage];
            console.log('📝 Mensajes después:', updated.length);

            // Guardar en localStorage
            saveLocalMessages(selectedChat, updated);

            return updated;
          });

          // Marcar como visto automáticamente usando WebSocket
          const socket = getSocket();
          if (socket && socket.connected) {
            socket.emit('mark_seen', { messageId: data.id });
          }
        } else {
          console.log('⏭️ Mensaje ignorado - no es del chat actual');
        }
      };

      // Escuchar confirmación de mensaje enviado
      const handleMessageSent = (data: MessageSentPayload) => {
        console.log('✅ Mensaje enviado confirmado:', data);

        setMessages((prev) => {
          const updated = prev.map((msg) => {
            // Buscar mensaje temporal y actualizarlo con el ID real del servidor
            if (msg.id.startsWith('temp-')) {
              return {
                ...msg,
                id: data.id.toString(),
                status: data.estado,
                timestamp: data.created_at,
              };
            }
            return msg;
          });

          // Guardar en localStorage
          if (selectedChat) {
            saveLocalMessages(selectedChat, updated);
          }

          return updated;
        });
      };

      // Escuchar confirmación de mensaje entregado
      const handleMessageDelivered = (data: MessageDeliveredPayload) => {
        console.log('📬 Mensaje entregado:', data);

        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === data.messageId.toString() ? { ...msg, status: 'entregado' } : msg
          );

          if (selectedChat) {
            saveLocalMessages(selectedChat, updated);
          }

          return updated;
        });
      };

      // Escuchar confirmación de mensaje visto
      const handleMessageSeen = (data: { messageId: number; seenAt: string }) => {
        console.log('👁️ Mensaje visto:', data);

        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === data.messageId.toString() ? { ...msg, status: 'visto' } : msg
          );

          if (selectedChat) {
            saveLocalMessages(selectedChat, updated);
          }

          return updated;
        });
      };

      // Escuchar estado de usuario (online/offline)
      const handleUserStatus = (data: { userId: string; status: string }) => {
        console.log('🟢 Estado de usuario:', data);
        // Aquí puedes actualizar el estado de conexión del contacto en la UI
      };

      // Escuchar indicador de escritura
      const handleUserTyping = (data: { from: string }) => {
        console.log('⌨️ Usuario escribiendo:', data);
        if (data.from === selectedChat) {
          // Mostrar indicador de "escribiendo..."
        }
      };

      const handleUserStopTyping = (data: { from: string }) => {
        console.log('🛑 Usuario dejó de escribir:', data);
        if (data.from === selectedChat) {
          // Ocultar indicador de "escribiendo..."
        }
      };

      // Registrar event listeners
      socket.on('new_message', handleNewMessage);
      socket.on('message_sent', handleMessageSent);
      socket.on('message_delivered', handleMessageDelivered);
      socket.on('message_seen', handleMessageSeen);
      socket.on('user_status', handleUserStatus);
      socket.on('user_typing', handleUserTyping);
      socket.on('user_stop_typing', handleUserStopTyping);

      // Cleanup al desmontar
      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('message_sent', handleMessageSent);
        socket.off('message_delivered', handleMessageDelivered);
        socket.off('message_seen', handleMessageSeen);
        socket.off('user_status', handleUserStatus);
        socket.off('user_typing', handleUserTyping);
        socket.off('user_stop_typing', handleUserStopTyping);
      };
    };

    // Llamar a la función de inicialización
    initSocket();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedChat]);

  const handleSendMessage = async (text: string) => {
    if (!selectedChat || !user) return;

    const socket = getSocket();

    // Validar que el socket esté conectado
    if (!socket || !socket.connected) {
      console.error('❌ Socket no conectado. No se puede enviar el mensaje.');
      alert('No hay conexión con el servidor. Por favor, recarga la página.');
      return;
    }

    // Validar contenido del mensaje
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 5000) {
      console.error('❌ Mensaje inválido (vacío o muy largo)');
      return;
    }

    // Agregar mensaje optimísticamente con ID temporal
    const tempId = `temp-${Date.now()}`;
    const tempMessage: FormattedMessage = {
      id: tempId,
      senderId: user.id,
      text: trimmed,
      timestamp: new Date().toISOString(),
      isMine: true,
      status: 'enviando',
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      // Enviar via WebSocket (el backend /private SOLO acepta WebSocket)
      console.log('📤 Enviando mensaje via WebSocket:', { to: selectedChat, content: trimmed });
      socket.emit('send_message', { to: selectedChat, content: trimmed });

      // El evento 'message_sent' actualizará el mensaje temporal con el ID real
    } catch (err) {
      console.error('❌ Error al enviar mensaje:', err);

      // Marcar el mensaje como error
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...msg, error: true, status: 'error' } : msg))
      );
    }
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
          {contactName.charAt(0).toUpperCase()}
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
            {contactName}
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
