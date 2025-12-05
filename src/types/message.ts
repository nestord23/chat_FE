export type MessageStatus = 'enviado' | 'entregado' | 'visto';

export interface Message {
  id: string;
  from: string; // userId del remitente
  to: string; // userId del destinatario
  content: string;
  created_at: string;
  estado: MessageStatus;
}

export interface SendMessagePayload {
  to: string;
  content: string;
}

export interface MessageSentResponse {
  messageId: string;
  message: Message;
}

export interface NewMessageEvent {
  message: Message;
}

export interface MessageError {
  error: string;
  code?: string;
  details?: unknown;
}

// Validación de contenido de mensaje
export const validateMessageContent = (content: string): { valid: boolean; error?: string } => {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'El mensaje no puede estar vacío' };
  }

  if (content.length < 1) {
    return { valid: false, error: 'El mensaje debe tener al menos 1 carácter' };
  }

  if (content.length > 5000) {
    return { valid: false, error: 'El mensaje no puede exceder 5000 caracteres' };
  }

  return { valid: true };
};
