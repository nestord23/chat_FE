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

  configure(config: Partial<SocketServiceConfig>) {
    this.config = { ...this.config, ...config };
  }

  connect(token: string): Socket {
    if (this.socket?.connected) {
      console.log('Socket ya esta conectado');
      return this.socket;
    }

    if (this.socket) {
      console.log('Desconectando socket anterior...');
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('Conectando al servidor WebSocket...');
    this.updateStatus('connecting');

    const fullUrl = this.config.url + this.config.namespace;

    this.socket = io(fullUrl, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupBasicListeners();

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Desconectando socket...');
      this.socket.disconnect();
      this.socket = null;
      this.updateStatus('disconnected');
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

    this.socket.on('connect', () => {
      console.log('Socket conectado exitosamente');
      this.updateStatus('connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexion:', error.message);
      this.updateStatus('error');

      if (error.message.includes('Authentication') || error.message.includes('Token')) {
        console.error('Error de autenticacion, deteniendo reconexion');
        if (this.socket) {
          this.socket.disconnect();
        }
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket desconectado:', reason);
      this.updateStatus('disconnected');

      if (reason === 'io server disconnect') {
        console.log('Reconectando...');
      }
    });

    this.socket.on('error', (error) => {
      console.error('Error del socket:', error);
      this.updateStatus('error');
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
    }
  }
}

export const socketService = new SocketService();
