import { io, Socket } from 'socket.io-client';
import type { MessageSentResponse, NewMessageEvent, MessageError } from '../types/message';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface SocketServiceConfig {
  url: string;
  namespace: string;
}

class SocketService {
  private socket: Socket | null = null;
  private config: SocketServiceConfig = {
    url: 'http://localhost:3001',
    namespace: '/private',
  };
  private connectionStatus: ConnectionStatus = 'disconnected';
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private currentToken: string | null = null; // FASE 6: Almacenar token para reconexión

  configure(config: Partial<SocketServiceConfig>) {
    this.config = { ...this.config, ...config };
  }

  connect(token: string): Socket {
    // FASE 6: Guardar token para reconexión
    this.currentToken = token;

    if (this.socket?.connected) {
      console.log('✅ Socket ya esta conectado');
      return this.socket;
    }

    if (this.socket) {
      console.log('🔄 Desconectando socket anterior...');
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('🔌 Conectando al servidor WebSocket...');
    this.updateStatus('connecting');

    const fullUrl = this.config.url + this.config.namespace;

    this.socket = io(fullUrl, {
      auth: {
        token,
      },
      transports: ['websocket'],
      // FASE 6: Configuración mejorada de reconexión
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000, // Aumentado a 10 segundos
      reconnectionAttempts: Infinity, // Intentos infinitos
      timeout: 20000, // Timeout de 20 segundos
    });

    this.setupBasicListeners();

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Desconectando socket...');
      this.socket.disconnect();
      this.socket = null;
      this.currentToken = null; // FASE 6: Limpiar token
      this.updateStatus('disconnected');
    }
  }

  // FASE 6: Actualizar token (útil cuando el token expira)
  updateToken(newToken: string) {
    console.log('🔑 Actualizando token...');
    this.currentToken = newToken;

    if (this.socket && this.socket.connected) {
      // Actualizar auth del socket existente
      this.socket.auth = { token: newToken };
      console.log('✅ Token actualizado en socket conectado');
    } else if (this.socket) {
      // Si no está conectado, reconectar con el nuevo token
      console.log('🔄 Reconectando con nuevo token...');
      this.socket.auth = { token: newToken };
      this.socket.connect();
    }
  }

  // FASE 6: Forzar reconexión manual
  reconnect() {
    if (!this.currentToken) {
      console.error('❌ No hay token disponible para reconectar');
      return;
    }

    console.log('🔄 Forzando reconexión...');

    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    } else {
      // Si no hay socket, crear uno nuevo
      this.connect(this.currentToken);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  getStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  onStatusChange(callback: (status: ConnectionStatus) => void) {
    this.statusListeners.add(callback);

    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private setupBasicListeners() {
    if (!this.socket) return;

    // FASE 6: Evento de conexión exitosa
    this.socket.on('connect', () => {
      console.log('✅ Socket conectado exitosamente');
      console.log('🆔 Socket ID:', this.socket?.id);
      this.updateStatus('connected');
    });

    // FASE 6: Evento de intento de reconexión
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Intento de reconexión #${attemptNumber}...`);
      this.updateStatus('connecting');
    });

    // FASE 6: Evento de reconexión exitosa
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconectado exitosamente después de ${attemptNumber} intentos`);
      this.updateStatus('connected');

      // Reautenticar si es necesario
      if (this.currentToken && this.socket) {
        console.log('🔑 Reautenticando con token almacenado...');
        this.socket.auth = { token: this.currentToken };
      }
    });

    // FASE 6: Evento de error de reconexión
    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Error al intentar reconectar:', error.message);
    });

    // FASE 6: Evento de fallo de reconexión
    this.socket.on('reconnect_failed', () => {
      console.error('❌ Falló la reconexión después de todos los intentos');
      this.updateStatus('error');
    });

    // FASE 6: Evento de error de conexión
    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error.message);
      this.updateStatus('error');

      // Manejar errores específicos
      if (error.message.includes('Authentication') || error.message.includes('Token')) {
        console.error('🔐 Error de autenticación detectado');
        console.log('💡 Puede ser necesario refrescar el token');
        // No desconectar para permitir que el usuario refresque el token
      } else if (error.message.includes('timeout')) {
        console.error('⏱️ Timeout de conexión');
      } else if (error.message.includes('Network')) {
        console.error('🌐 Error de red detectado');
      }
    });

    // FASE 6: Evento de desconexión
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket desconectado. Razón:', reason);
      this.updateStatus('disconnected');

      if (reason === 'io server disconnect') {
        console.log('🔄 Servidor cerró la conexión. Reconectando manualmente...');
        // El servidor cerró la conexión, reconectar manualmente
        if (this.socket && this.currentToken) {
          this.socket.connect();
        }
      } else if (reason === 'io client disconnect') {
        console.log('👤 Cliente cerró la conexión intencionalmente');
      } else if (reason === 'ping timeout') {
        console.log('⏱️ Timeout de ping. Reconectando automáticamente...');
      } else if (reason === 'transport close') {
        console.log('🚪 Transporte cerrado. Reconectando automáticamente...');
      } else if (reason === 'transport error') {
        console.log('❌ Error de transporte. Reconectando automáticamente...');
      }
    });

    // FASE 6: Evento de error general
    this.socket.on('error', (error) => {
      console.error('❌ Error del socket:', error);
      this.updateStatus('error');

      // Manejar rate limiting
      if (error && typeof error === 'object' && 'code' in error) {
        const errorObj = error as { code?: string; message?: string };
        if (errorObj.code === 'RATE_LIMIT') {
          console.error('⚠️ Rate limit alcanzado. Espera antes de enviar más mensajes');
        }
      }
    });
  }

  private updateStatus(status: ConnectionStatus) {
    this.connectionStatus = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  isConnected(): boolean {
    if (this.socket) {
      return this.socket.connected;
    }
    return false;
  }

  // ========================================
  // MÉTODOS DE MENSAJERÍA (FASE 2)
  // ========================================

  /**
   * Envía un mensaje a otro usuario
   * @param to - ID del usuario destinatario
   * @param content - Contenido del mensaje (1-5000 caracteres)
   * @returns Promise que se resuelve cuando el mensaje es enviado
   */
  sendMessage(to: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket no conectado'));
        return;
      }

      // Validación básica
      if (!to || !content) {
        reject(new Error('Destinatario y contenido son requeridos'));
        return;
      }

      if (content.length < 1 || content.length > 5000) {
        reject(new Error('El mensaje debe tener entre 1 y 5000 caracteres'));
        return;
      }

      console.log('📤 Enviando mensaje a:', to);

      this.socket.emit(
        'send_message',
        { to, content },
        (response: MessageSentResponse | MessageError) => {
          // Type guard: verificar si es un error
          if ('error' in response) {
            console.error('❌ Error al enviar mensaje:', response.error);
            reject(new Error(response.error));
          } else {
            console.log('✅ Mensaje enviado exitosamente');
            resolve();
          }
        }
      );
    });
  }

  /**
   * Escucha el evento de confirmación de mensaje enviado
   */
  onMessageSent(callback: (data: MessageSentResponse) => void) {
    if (!this.socket) {
      console.warn('Socket no inicializado');
      return () => {};
    }

    this.socket.on('message_sent', callback);

    return () => {
      if (this.socket) {
        this.socket.off('message_sent', callback);
      }
    };
  }

  /**
   * Escucha nuevos mensajes recibidos
   */
  onNewMessage(callback: (data: NewMessageEvent) => void) {
    if (!this.socket) {
      console.warn('Socket no inicializado');
      return () => {};
    }

    this.socket.on('new_message', callback);

    return () => {
      if (this.socket) {
        this.socket.off('new_message', callback);
      }
    };
  }

  /**
   * Escucha errores relacionados con mensajes
   */
  onMessageError(callback: (error: MessageError) => void) {
    if (!this.socket) {
      console.warn('Socket no inicializado');
      return () => {};
    }

    this.socket.on('error', callback);

    return () => {
      if (this.socket) {
        this.socket.off('error', callback);
      }
    };
  }

  /**
   * Remueve todos los listeners de mensajes
   */
  removeAllMessageListeners() {
    if (this.socket) {
      this.socket.off('message_sent');
      this.socket.off('new_message');
      this.socket.off('error');
      this.socket.off('message_delivered');
      this.socket.off('message_seen');
    }
  }

  // ========================================
  // MÉTODOS DE FASE 3: Confirmaciones
  // ========================================

  /**
   * Marca un mensaje como visto
   * @param messageId - ID del mensaje a marcar como visto
   */
  markMessageAsSeen(messageId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket no conectado, no se puede marcar como visto');
      return;
    }

    console.log('👁️ Marcando mensaje como visto:', messageId);
    this.socket.emit('mark_seen', { messageId });
  }

  /**
   * Escucha el evento de mensaje entregado
   */
  onMessageDelivered(callback: (data: { messageId: string; deliveredAt: string }) => void) {
    if (!this.socket) {
      console.warn('Socket no inicializado');
      return () => {};
    }

    this.socket.on('message_delivered', callback);

    return () => {
      if (this.socket) {
        this.socket.off('message_delivered', callback);
      }
    };
  }

  /**
   * Escucha el evento de mensaje visto
   */
  onMessageSeen(callback: (data: { messageId: string; seenAt: string }) => void) {
    if (!this.socket) {
      console.warn('Socket no inicializado');
      return () => {};
    }

    this.socket.on('message_seen', callback);

    return () => {
      if (this.socket) {
        this.socket.off('message_seen', callback);
      }
    };
  }

  // ========================================
  // MÉTODOS DE FASE 4: Indicadores de Escritura
  // ========================================

  /**
   * Emite evento de que el usuario está escribiendo
   * @param to - ID del usuario destinatario
   */
  emitTyping(to: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket no conectado, no se puede emitir typing');
      return;
    }

    console.log('⌨️ Emitiendo typing a:', to);
    this.socket.emit('typing', { to });
  }

  /**
   * Emite evento de que el usuario dejó de escribir
   * @param to - ID del usuario destinatario
   */
  emitStopTyping(to: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket no conectado, no se puede emitir stop_typing');
      return;
    }

    console.log('🛑 Emitiendo stop_typing a:', to);
    this.socket.emit('stop_typing', { to });
  }

  /**
   * Escucha el evento de usuario escribiendo
   */
  onUserTyping(callback: (data: { from: string }) => void) {
    if (!this.socket) {
      console.warn('Socket no inicializado');
      return () => {};
    }

    this.socket.on('user_typing', callback);

    return () => {
      if (this.socket) {
        this.socket.off('user_typing', callback);
      }
    };
  }

  /**
   * Escucha el evento de usuario que dejó de escribir
   */
  onUserStopTyping(callback: (data: { from: string }) => void) {
    if (!this.socket) {
      console.warn('Socket no inicializado');
      return () => {};
    }

    this.socket.on('user_stop_typing', callback);

    return () => {
      if (this.socket) {
        this.socket.off('user_stop_typing', callback);
      }
    };
  }

  /**
   * Remueve todos los listeners de typing
   */
  removeAllTypingListeners() {
    if (this.socket) {
      this.socket.off('user_typing');
      this.socket.off('user_stop_typing');
    }
  }
}

export const socketService = new SocketService();
