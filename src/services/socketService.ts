import { io, Socket } from 'socket.io-client';

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
}

export const socketService = new SocketService();
