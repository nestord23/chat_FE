export type MessageStatus = 'enviado' | 'entregado' | 'visto';

export interface Message {
  id: string;
  content: string;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
  conversation_id: string;
}

export interface Conversation {
  other_user_id: string;
  username: string;
  avatar_url?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface ChatUser {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
}
