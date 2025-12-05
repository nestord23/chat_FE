import { useState, useCallback, useEffect, useRef } from 'react';
import { socketService } from '../services/socketService';
import type { Message, MessageSentResponse, NewMessageEvent, MessageError } from '../types/message';
import { validateMessageContent as validate } from '../types/message';

interface UseMessagesOptions {
  userId?: string; // ID del usuario actual
  enabled?: boolean; // Si está habilitado el hook
}

interface ConversationMessages {
  [conversationId: string]: Message[];
}

export const useMessages = (options: UseMessagesOptions = {}) => {
  const { userId, enabled = true } = options;

  // Estado de mensajes organizados por conversación
  const [messages, setMessages] = useState<ConversationMessages>({});

  // Estado de errores
  const [error, setError] = useState<string | null>(null);

  // Estado de envío
  const [isSending, setIsSending] = useState(false);

  // Ref para evitar duplicados
  const processedMessageIds = useRef<Set<string>>(new Set());

  /**
   * Obtiene el ID de conversación entre dos usuarios
   * Siempre ordena los IDs para mantener consistencia
   */
  const getConversationId = useCallback((user1: string, user2: string): string => {
    return [user1, user2].sort().join('_');
  }, []);

  /**
   * Agrega un mensaje al estado (optimistic UI)
   */
  const addMessage = useCallback(
    (message: Message) => {
      // Evitar duplicados
      if (processedMessageIds.current.has(message.id)) {
        console.log('⚠️ Mensaje duplicado ignorado:', message.id);
        return;
      }

      processedMessageIds.current.add(message.id);

      const conversationId = getConversationId(message.from, message.to);

      setMessages((prev) => {
        const conversationMessages = prev[conversationId] || [];

        // Verificar si el mensaje ya existe
        const exists = conversationMessages.some((m) => m.id === message.id);
        if (exists) {
          return prev;
        }

        return {
          ...prev,
          [conversationId]: [...conversationMessages, message].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          ),
        };
      });
    },
    [getConversationId]
  );

  /**
   * Envía un mensaje a otro usuario
   */
  const sendMessage = useCallback(
    async (to: string, content: string): Promise<void> => {
      if (!userId) {
        const errorMsg = 'No hay usuario autenticado';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Validar contenido
      const validation = validate(content);
      if (!validation.valid) {
        setError(validation.error || 'Mensaje inválido');
        throw new Error(validation.error);
      }

      setIsSending(true);
      setError(null);

      try {
        // Crear mensaje optimista (se mostrará inmediatamente en la UI)
        const optimisticMessage: Message = {
          id: `temp_${Date.now()}`, // ID temporal
          from: userId,
          to,
          content,
          created_at: new Date().toISOString(),
          estado: 'enviado',
        };

        // Agregar mensaje optimista al estado
        addMessage(optimisticMessage);

        // Enviar mensaje al servidor
        await socketService.sendMessage(to, content);

        console.log('✅ Mensaje enviado correctamente');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al enviar mensaje';
        setError(errorMessage);
        console.error('❌ Error al enviar mensaje:', err);
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [userId, addMessage]
  );

  /**
   * Obtiene mensajes de una conversación específica
   */
  const getConversationMessages = useCallback(
    (otherUserId: string): Message[] => {
      if (!userId) return [];
      const conversationId = getConversationId(userId, otherUserId);
      return messages[conversationId] || [];
    },
    [userId, messages, getConversationId]
  );

  /**
   * Limpia los mensajes de una conversación
   */
  const clearConversation = useCallback(
    (otherUserId: string) => {
      if (!userId) return;
      const conversationId = getConversationId(userId, otherUserId);

      setMessages((prev) => {
        const newMessages = { ...prev };
        delete newMessages[conversationId];
        return newMessages;
      });

      // Limpiar IDs procesados de esta conversación
      const conversationMessages = messages[conversationId] || [];
      conversationMessages.forEach((msg) => {
        processedMessageIds.current.delete(msg.id);
      });
    },
    [userId, messages, getConversationId]
  );

  /**
   * Limpia todos los mensajes
   */
  const clearAllMessages = useCallback(() => {
    setMessages({});
    processedMessageIds.current.clear();
  }, []);

  // Configurar listeners de eventos de socket
  useEffect(() => {
    if (!enabled) return;

    console.log('📡 Configurando listeners de mensajes...');

    // Listener: Mensaje enviado confirmado por el servidor
    const unsubscribeSent = socketService.onMessageSent((data: MessageSentResponse) => {
      console.log('✅ Confirmación de mensaje enviado:', data);

      // Reemplazar mensaje temporal con el mensaje real del servidor
      if (data.message) {
        addMessage(data.message);
      }
    });

    // Listener: Nuevo mensaje recibido
    const unsubscribeNew = socketService.onNewMessage((data: NewMessageEvent) => {
      console.log('📨 Nuevo mensaje recibido:', data);

      if (data.message) {
        addMessage(data.message);
      }
    });

    // Listener: Error de mensaje
    const unsubscribeError = socketService.onMessageError((errorData: MessageError) => {
      console.error('❌ Error de mensaje:', errorData);
      setError(errorData.error);
    });

    // Cleanup
    return () => {
      console.log('🧹 Limpiando listeners de mensajes...');
      unsubscribeSent();
      unsubscribeNew();
      unsubscribeError();
    };
  }, [enabled, addMessage]);

  return {
    // Estado
    messages,
    error,
    isSending,

    // Métodos
    sendMessage,
    getConversationMessages,
    clearConversation,
    clearAllMessages,
  };
};
