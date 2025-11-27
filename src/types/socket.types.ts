export interface SendMessagePayload {
  to: string;
  content: string;
}

export interface NewMessagePayload {
  id: number;
  from: string;
  content: string;
  created_at: string;
}

export interface MessageSentPayload {
  id: number;
  to: string;
  content: string;
  created_at: string;
  estado: 'enviado' | 'entregado';
}

export interface MessageDeliveredPayload {
  messageId: number;
  deliveredAt: string;
}

export interface MessageSeenPayload {
  messageId: number;
  seenAt: string;
}

export interface TypingPayload {
  to: string;
}

export interface UserTypingPayload {
  from: string;
}

export interface UserStatusPayload {
  userId: string;
  status: 'online' | 'offline';
}

export interface SocketError {
  message: string;
}
