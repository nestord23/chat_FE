import { useState, useEffect, useRef, useCallback } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { chatService } from "../../services/chatService";
import { useAuthContext } from "../../contexts/AuthContext";
import { getSocket, initializeSocket } from "../../config/socket";
import type { Message } from "../../types/chat.types";
import type {
  NewMessagePayload,
  MessageSentPayload,
  MessageDeliveredPayload,
} from "../../types/socket.types";

interface ChatWindowProps {
  selectedChat: string | null;
  contactName?: string;
}

interface FormattedMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  status: string;
  error?: boolean;
}

const ChatWindow = ({
  selectedChat,
  contactName = "Usuario",
}: ChatWindowProps) => {
  const { user, getAccessTokenAsync } = useAuthContext();

  // ✅ CRÍTICO: Refs para prevenir duplicados
  const messageIdsRef = useRef<Set<string>>(new Set());
  const socketInitializedRef = useRef(false);
  const currentChatRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  // Estado de mensajes
  const [messages, setMessages] = useState<FormattedMessage[]>([]);

  // ✅ Función para verificar y agregar mensaje (previene duplicados)
  const addMessageSafely = useCallback((newMessage: FormattedMessage) => {
    // Verificar duplicado por ID
    if (messageIdsRef.current.has(newMessage.id)) {
      console.warn("⚠️ Mensaje duplicado ignorado:", newMessage.id);
      return false;
    }

    // Agregar ID al Set
    messageIdsRef.current.add(newMessage.id);

    setMessages((prev) => {
      // Doble verificación en el estado
      const exists = prev.some((msg) => msg.id === newMessage.id);
      if (exists) {
        console.warn("⚠️ Mensaje ya existe en estado:", newMessage.id);
        return prev;
      }

      const updated = [...prev, newMessage];
      console.log("✅ Mensaje agregado:", newMessage.id);
      return updated;
    });

    return true;
  }, []);

  // ✅ Función optimizada para guardar en localStorage
  const saveLocalMessages = useCallback(
    (chatId: string, msgs: FormattedMessage[]) => {
      try {
        localStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(msgs));
      } catch (err) {
        console.error("Error al guardar mensajes localmente:", err);
      }
    },
    []
  );

  // ✅ Función para cargar mensajes del localStorage
  const getLocalMessages = useCallback((chatId: string): FormattedMessage[] => {
    try {
      const cached = localStorage.getItem(`chat_messages_${chatId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }, []);

  //carga los mensajes desde el servidor
  useEffect(() => {
    if (!selectedChat || !user) return;

    const loadMessages = async () => {
      console.log("📥 Cargando mensajes para chat:", selectedChat);

      // Limpiar refs cuando cambia el chat
      messageIdsRef.current.clear();
      currentChatRef.current = selectedChat;

      try {
        // ✅ SIEMPRE cargar del servidor (es la fuente de verdad)
        const { messages: fetchedMessages } =
          await chatService.getMessages(selectedChat);

        const formattedMessages: FormattedMessage[] = fetchedMessages.map(
          (msg: Message) => ({
            id: msg.id,
            senderId: msg.user_id,
            text: msg.content,
            timestamp: msg.created_at,
            isMine: msg.user_id === user.id,
            status: msg.status,
          })
        );

        console.log("📡 Mensajes del servidor:", formattedMessages.length);

        // Actualizar refs con TODOS los IDs del servidor
        messageIdsRef.current.clear();
        formattedMessages.forEach((msg) => messageIdsRef.current.add(msg.id));

        // Actualizar estado y caché
        setMessages(formattedMessages);
        saveLocalMessages(selectedChat, formattedMessages);

        // Marcar como vistos
        await chatService.markMessagesAsSeen(selectedChat);
      } catch (err) {
        console.error("Error al cargar mensajes:", err);

        // ✅ SOLO si falla el servidor, intentar cargar del caché
        const cachedMessages = getLocalMessages(selectedChat);
        if (cachedMessages.length > 0) {
          console.log(
            "💾 Usando caché por error del servidor:",
            cachedMessages.length
          );
          setMessages(cachedMessages);
          cachedMessages.forEach((msg) => messageIdsRef.current.add(msg.id));
        } else {
          setMessages([]);
        }
      }
    };

    loadMessages();
  }, [selectedChat, user, getLocalMessages, saveLocalMessages]);

  // ✅ Guardar en localStorage cuando cambien los mensajes
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      saveLocalMessages(selectedChat, messages);
    }
  }, [messages, selectedChat, saveLocalMessages]);

  // ✅ WEBSOCKET SETUP (solo una vez por usuario)
  useEffect(() => {
    if (!user || socketInitializedRef.current) return;

    isMountedRef.current = true;

    const initSocket = async () => {
      try {
        console.log("🔌 Iniciando WebSocket...");

        let token = await getAccessTokenAsync();
        if (!token) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          token = await getAccessTokenAsync();
        }

        if (!token) {
          console.error("❌ No se encontró token");
          return;
        }

        const socket = initializeSocket(token);
        socketInitializedRef.current = true;

        // Eventos de conexión
        socket.on("connect", () => {
          console.log("✅ WebSocket conectado - Socket ID:", socket.id);
        });

        socket.on("connect_error", (error) => {
          console.error("❌ Error de conexión:", error.message);
        });

        socket.on("disconnect", (reason) => {
          console.warn("⚠️ WebSocket desconectado:", reason);
          socketInitializedRef.current = false;
        });

        // ✅ EVENTO: Nuevo mensaje recibido
        const handleNewMessage = (data: NewMessagePayload) => {
          console.log("📨 Evento new_message recibido:", data);

          // ✅ CRÍTICO: Verificar que sea del chat actual
          if (currentChatRef.current !== data.from) {
            console.log("⏭️ Mensaje ignorado - chat diferente");
            return;
          }

          const newMessage: FormattedMessage = {
            id: data.id.toString(),
            senderId: data.from,
            text: data.content,
            timestamp: data.created_at,
            isMine: false,
            status: "entregado",
          };

          // ✅ Usar función que previene duplicados
          const added = addMessageSafely(newMessage);

          if (added) {
            // Marcar como visto automáticamente
            const socket = getSocket();
            if (socket?.connected) {
              socket.emit("mark_seen", { messageId: data.id });
            }
          }
        };

        // ✅ EVENTO: Confirmación de envío
        const handleMessageSent = (data: MessageSentPayload) => {
          console.log("✅ Evento message_sent:", data);

          setMessages((prev) => {
            const updated = prev.map((msg) => {
              // Actualizar mensaje temporal
              if (msg.id.startsWith("temp-")) {
                const realId = data.id.toString();

                // Actualizar el Set con el ID real
                messageIdsRef.current.delete(msg.id);
                messageIdsRef.current.add(realId);

                return {
                  ...msg,
                  id: realId,
                  status: data.estado,
                  timestamp: data.created_at,
                };
              }
              return msg;
            });

            if (currentChatRef.current) {
              saveLocalMessages(currentChatRef.current, updated);
            }

            return updated;
          });
        };

        // ✅ EVENTO: Mensaje entregado
        const handleMessageDelivered = (data: MessageDeliveredPayload) => {
          console.log("📬 Evento message_delivered:", data);

          setMessages((prev) => {
            const updated = prev.map((msg) =>
              msg.id === data.messageId.toString()
                ? { ...msg, status: "entregado" }
                : msg
            );

            if (currentChatRef.current) {
              saveLocalMessages(currentChatRef.current, updated);
            }

            return updated;
          });
        };

        // ✅ EVENTO: Mensaje visto
        const handleMessageSeen = (data: {
          messageId: number;
          seenAt: string;
        }) => {
          console.log("👁️ Evento message_seen:", data);

          setMessages((prev) => {
            const updated = prev.map((msg) =>
              msg.id === data.messageId.toString()
                ? { ...msg, status: "visto" }
                : msg
            );

            if (currentChatRef.current) {
              saveLocalMessages(currentChatRef.current, updated);
            }

            return updated;
          });
        };

        // Registrar listeners
        socket.on("new_message", handleNewMessage);
        socket.on("message_sent", handleMessageSent);
        socket.on("message_delivered", handleMessageDelivered);
        socket.on("message_seen", handleMessageSeen);

        socket.connect();
        console.log("🔄 Conectando WebSocket...");

        // ✅ Cleanup al desmontar
        return () => {
          console.log("🧹 Limpiando WebSocket listeners");
          socket.off("new_message", handleNewMessage);
          socket.off("message_sent", handleMessageSent);
          socket.off("message_delivered", handleMessageDelivered);
          socket.off("message_seen", handleMessageSeen);
          socketInitializedRef.current = false;
          isMountedRef.current = false;
        };
      } catch (error) {
        console.error("❌ Error al inicializar WebSocket:", error);
        socketInitializedRef.current = false;
      }
    };

    initSocket();

    return () => {
      isMountedRef.current = false;
    };
  }, [user, getAccessTokenAsync, addMessageSafely, saveLocalMessages]);

  // ✅ Actualizar ref cuando cambia el chat seleccionado
  useEffect(() => {
    currentChatRef.current = selectedChat;
  }, [selectedChat]);

  // ✅ ENVIAR MENSAJE
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!selectedChat || !user) return;

      const socket = getSocket();

      if (!socket?.connected) {
        console.error("❌ Socket no conectado");
        alert("No hay conexión. Por favor, recarga la página.");
        return;
      }

      const trimmed = text.trim();
      if (!trimmed || trimmed.length > 5000) {
        console.error("❌ Mensaje inválido");
        return;
      }

      // Crear mensaje temporal con ID único
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempMessage: FormattedMessage = {
        id: tempId,
        senderId: user.id,
        text: trimmed,
        timestamp: new Date().toISOString(),
        isMine: true,
        status: "enviando",
      };

      // ✅ Agregar mensaje temporal (con verificación de duplicados)
      addMessageSafely(tempMessage);

      try {
        console.log("📤 Enviando mensaje via WebSocket");
        socket.emit("send_message", { to: selectedChat, content: trimmed });

        // El evento 'message_sent' actualizará el mensaje con el ID real
      } catch (err) {
        console.error("❌ Error al enviar mensaje:", err);

        // Marcar como error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, error: true, status: "error" } : msg
          )
        );
      }
    },
    [selectedChat, user, addMessageSafely]
  );

  // ✅ UI - Sin cambios necesarios
  if (!selectedChat) {
    return (
      <div
        style={{
          height: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            borderRadius: "1rem",
            border: "1px solid rgba(0, 255, 0, 0.3)",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        >
          <svg
            style={{
              width: "4rem",
              height: "4rem",
              color: "#4ade80",
              margin: "0 auto 1rem",
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
              fontFamily: "Orbitron, sans-serif",
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#4ade80",
              marginBottom: "0.5rem",
              textShadow: "0 0 10px rgba(0, 255, 0, 0.5)",
            }}
          >
            SELECCIONA UN CHAT
          </h2>
          <p
            style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "0.875rem",
              color: "rgba(0, 255, 0, 0.6)",
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
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          height: "4rem",
          borderBottom: "1px solid rgba(0, 255, 0, 0.3)",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          padding: "0 1.5rem",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "50%",
            backgroundColor: "rgba(0, 255, 0, 0.2)",
            border: "2px solid rgba(0, 255, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Orbitron, sans-serif",
            fontWeight: "bold",
            color: "#4ade80",
            fontSize: "1rem",
          }}
        >
          {contactName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "1rem",
              fontWeight: "600",
              color: "#4ade80",
              margin: 0,
            }}
          >
            {contactName}
          </h3>
          <p
            style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "0.75rem",
              color: "rgba(0, 255, 0, 0.6)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                display: "inline-block",
              }}
            />
            En línea
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <MessageList messages={messages} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
