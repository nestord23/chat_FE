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
  const { user, getAccessToken } = useAuthContext();
  const [messages, setMessages] = useState<FormattedMessage[]>([]);

  // Cargar mensajes cuando se selecciona un chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat || !user) return;

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

        // Marcar mensajes como vistos
        await chatService.markMessagesAsSeen(selectedChat);
      } catch (err) {
        console.error('Error al cargar mensajes:', err);
        setMessages([]);
      }
    };

    loadMessages();
  }, [selectedChat, user]);

  // Inicializar WebSocket y escuchar eventos
  useEffect(() => {
    if (!user) return;

    // Obtener el token del contexto de autenticación
    const token = getAccessToken();

    if (!token) {
      console.error('❌ No se encontró token para inicializar WebSocket');
      console.log('💡 Asegúrate de estar autenticado correctamente');
      return;
    }

    console.log('🔌 Inicializando WebSocket para usuario:', user.id);

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
          return updated;
        });

        // Marcar como visto automáticamente si el chat está abierto
        if (selectedChat === data.from) {
          chatService.markMessagesAsSeen(data.from).catch(console.error);
        }
      } else {
        console.log('⏭️ Mensaje ignorado - no es del chat actual');
      }
    };

    // Escuchar confirmación de mensaje enviado
    const handleMessageSent = (data: MessageSentPayload) => {
      console.log('✅ Mensaje enviado confirmado:', data);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === `temp-${data.id}` || msg.id === data.id.toString()
            ? { ...msg, id: data.id.toString(), status: data.estado }
            : msg
        )
      );
    };

    // Escuchar confirmación de mensaje entregado
    const handleMessageDelivered = (data: MessageDeliveredPayload) => {
      console.log('📬 Mensaje entregado:', data);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId.toString() ? { ...msg, status: 'entregado' } : msg
        )
      );
    };

    // Registrar event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('message_delivered', handleMessageDelivered);

    // Cleanup al desmontar
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('message_delivered', handleMessageDelivered);
    };
  }, [user, selectedChat, getAccessToken]);

  const handleSendMessage = async (text: string) => {
    if (!selectedChat || !user) return;

    // Agregar mensaje optimísticamente
    const tempId = `temp-${Date.now()}`;
    const tempMessage: FormattedMessage = {
      id: tempId,
      senderId: user.id,
      text,
      timestamp: new Date().toISOString(),
      isMine: true,
      status: 'enviando',
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const socket = getSocket();

      if (socket && socket.connected) {
        // Enviar via WebSocket (tiempo real)
        console.log('📤 Enviando mensaje via WebSocket:', { to: selectedChat, content: text });
        socket.emit('send_message', { to: selectedChat, content: text });

        // Actualizar estado a "enviado" optimísticamente
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? { ...msg, status: 'enviado' } : msg))
        );
      } else {
        // Fallback: Enviar via HTTP si WebSocket no está disponible
        console.log('📤 WebSocket no disponible, enviando via HTTP');
        const sentMessage = await chatService.sendMessage(selectedChat, text);

        // Actualizar con el mensaje real del backend
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  id: sentMessage.id,
                  senderId: sentMessage.user_id,
                  text: sentMessage.content,
                  timestamp: sentMessage.created_at,
                  isMine: true,
                  status: sentMessage.status,
                }
              : msg
          )
        );
      }
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
