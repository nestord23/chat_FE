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

// ========================================
// EVENTOS DE FASE 3: Confirmaciones
// ========================================

export interface MessageDeliveredEvent {
  messageId: string;
  deliveredAt: string;
}

export interface MessageSeenEvent {
  messageId: string;
  seenAt: string;
}

export interface MarkSeenPayload {
  messageId: string;
}

// ========================================
// EVENTOS DE FASE 4: Indicadores de Escritura
// ========================================

export interface TypingPayload {
  to: string; // userId del destinatario
}

export interface StopTypingPayload {
  to: string; // userId del destinatario
}

export interface UserTypingEvent {
  from: string; // userId del usuario que está escribiendo
}

export interface UserStopTypingEvent {
  from: string; // userId del usuario que dejó de escribir
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
