import type { Conversation, Message } from '../types/chat.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const chatService = {
  /**
   * Obtener todas las conversaciones del usuario
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_URL}/api/chat/conversations`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al obtener conversaciones');
    }

    const data = await response.json();
    return data.data || [];
  },

  /**
   * Obtener mensajes de una conversación específica
   */
  async getMessages(
    otherUserId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: Message[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await fetch(
      `${API_URL}/api/chat/messages/${otherUserId}?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al obtener mensajes');
    }

    const data = await response.json();
    return {
      messages: data.data || [],
      pagination: data.pagination || {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
      },
    };
  },

  /**
   * Enviar un mensaje (HTTP fallback)
   * Nota: En producción, esto debería hacerse principalmente via WebSocket
   */
  async sendMessage(to: string, content: string): Promise<Message> {
    const response = await fetch(`${API_URL}/api/chat/messages`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, content }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al enviar mensaje');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Marcar mensajes como vistos
   */
  async markMessagesAsSeen(otherUserId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/chat/messages/${otherUserId}/seen`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al marcar mensajes como vistos');
    }
  },

  /**
   * Crear o iniciar una nueva conversación
   */
  async createConversation(otherUserId: string): Promise<Conversation> {
    const response = await fetch(`${API_URL}/api/chat/conversations`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ other_user_id: otherUserId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al crear conversación');
    }

    const data = await response.json();
    return data.data;
  },
};
