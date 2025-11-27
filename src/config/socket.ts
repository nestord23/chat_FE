import { io, Socket } from 'socket.io-client';
import type {
  SendMessagePayload,
  NewMessagePayload,
  MessageSentPayload,
  MessageDeliveredPayload,
  MessageSeenPayload,
  TypingPayload,
  UserTypingPayload,
  UserStatusPayload,
  SocketError,
} from '../types/socket.types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

interface ServerToClientEvents {
  new_message: (data: NewMessagePayload) => void;
  message_sent: (data: MessageSentPayload) => void;
  message_delivered: (data: MessageDeliveredPayload) => void;
  message_seen: (data: MessageSeenPayload) => void;
  user_typing: (data: UserTypingPayload) => void;
  user_stop_typing: (data: UserTypingPayload) => void;
  user_status: (data: UserStatusPayload) => void;
  error: (data: SocketError) => void;
}

interface ClientToServerEvents {
  send_message: (data: SendMessagePayload) => void;
  mark_seen: (data: { messageId: number }) => void;
  typing: (data: TypingPayload) => void;
  stop_typing: (data: TypingPayload) => void;
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

export const initializeSocket = (token: string): TypedSocket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(`${SOCKET_URL}/private`, {
    auth: { token },
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  return socket;
};

export const getSocket = (): TypedSocket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
