/**
 * Servicio de caché para mensajes
 * FASE 7: Optimización con localStorage/IndexedDB
 */

import type { Message } from '../types/message';

const CACHE_PREFIX = 'chat_messages_';
const CACHE_VERSION = 'v1';
const MAX_MESSAGES_PER_CONVERSATION = 500; // Límite para evitar localStorage lleno

interface CachedConversation {
  messages: Message[];
  lastUpdated: string;
  version: string;
}

class MessageCacheService {
  private memoryCache: Map<string, Message[]> = new Map();

  /**
   * Obtiene la clave de caché para una conversación
   */
  private getCacheKey(conversationId: string): string {
    return `${CACHE_PREFIX}${conversationId}`;
  }

  /**
   * Guarda mensajes en caché (memoria + localStorage)
   * FASE 7: Optimizado con límite de mensajes
   */
  saveMessages(conversationId: string, messages: Message[]): void {
    try {
      // Limitar cantidad de mensajes para evitar llenar localStorage
      const limitedMessages = messages.slice(-MAX_MESSAGES_PER_CONVERSATION);

      // Guardar en memoria (rápido)
      this.memoryCache.set(conversationId, limitedMessages);

      // Guardar en localStorage (persistente)
      const cached: CachedConversation = {
        messages: limitedMessages,
        lastUpdated: new Date().toISOString(),
        version: CACHE_VERSION,
      };

      localStorage.setItem(this.getCacheKey(conversationId), JSON.stringify(cached));

      console.log(
        `💾 Guardados ${limitedMessages.length} mensajes en caché para ${conversationId}`
      );
    } catch (error) {
      console.error('❌ Error al guardar en caché:', error);

      // Si localStorage está lleno, limpiar cachés antiguos
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearOldCaches();
        // Intentar de nuevo
        try {
          const cached: CachedConversation = {
            messages: messages.slice(-MAX_MESSAGES_PER_CONVERSATION),
            lastUpdated: new Date().toISOString(),
            version: CACHE_VERSION,
          };
          localStorage.setItem(this.getCacheKey(conversationId), JSON.stringify(cached));
        } catch (retryError) {
          console.error('❌ Error al reintentar guardar en caché:', retryError);
        }
      }
    }
  }

  /**
   * Obtiene mensajes del caché
   * FASE 7: Intenta memoria primero, luego localStorage
   */
  getMessages(conversationId: string): Message[] | null {
    // Intentar obtener de memoria primero (más rápido)
    const memoryMessages = this.memoryCache.get(conversationId);
    if (memoryMessages) {
      console.log(`⚡ Mensajes obtenidos de memoria para ${conversationId}`);
      return memoryMessages;
    }

    // Si no está en memoria, intentar localStorage
    try {
      const cacheKey = this.getCacheKey(conversationId);
      const cached = localStorage.getItem(cacheKey);

      if (!cached) {
        return null;
      }

      const parsed: CachedConversation = JSON.parse(cached);

      // Verificar versión del caché
      if (parsed.version !== CACHE_VERSION) {
        console.warn('⚠️ Versión de caché obsoleta, limpiando...');
        localStorage.removeItem(cacheKey);
        return null;
      }

      // Guardar en memoria para próximos accesos
      this.memoryCache.set(conversationId, parsed.messages);

      console.log(`💾 Mensajes obtenidos de localStorage para ${conversationId}`);
      return parsed.messages;
    } catch (error) {
      console.error('❌ Error al leer del caché:', error);
      return null;
    }
  }

  /**
   * Agrega un mensaje al caché existente
   * FASE 7: Optimizado para evitar reescribir todo
   */
  addMessage(conversationId: string, message: Message): void {
    const existing = this.getMessages(conversationId) || [];

    // Evitar duplicados
    const isDuplicate = existing.some((m) => m.id === message.id);
    if (isDuplicate) {
      console.log(`⚠️ Mensaje duplicado ignorado: ${message.id}`);
      return;
    }

    const updated = [...existing, message];
    this.saveMessages(conversationId, updated);
  }

  /**
   * Actualiza un mensaje en el caché
   * FASE 7: Útil para actualizar estados de mensajes
   */
  updateMessage(conversationId: string, messageId: string, updates: Partial<Message>): void {
    const existing = this.getMessages(conversationId);
    if (!existing) return;

    const updated = existing.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg));

    this.saveMessages(conversationId, updated);
  }

  /**
   * Limpia el caché de una conversación
   */
  clearConversation(conversationId: string): void {
    this.memoryCache.delete(conversationId);
    localStorage.removeItem(this.getCacheKey(conversationId));
    console.log(`🧹 Caché limpiado para ${conversationId}`);
  }

  /**
   * Limpia todo el caché
   */
  clearAll(): void {
    this.memoryCache.clear();

    // Limpiar solo las claves de mensajes
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });

    console.log('🧹 Todo el caché limpiado');
  }

  /**
   * Limpia cachés antiguos (más de 7 días)
   * FASE 7: Previene que localStorage se llene
   */
  clearOldCaches(): void {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const keys = Object.keys(localStorage);
    let clearedCount = 0;

    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed: CachedConversation = JSON.parse(cached);
            const lastUpdated = new Date(parsed.lastUpdated);

            if (lastUpdated < sevenDaysAgo) {
              localStorage.removeItem(key);
              clearedCount++;
            }
          }
        } catch {
          // Si hay error al parsear, eliminar
          localStorage.removeItem(key);
          clearedCount++;
        }
      }
    });

    console.log(`🧹 Limpiados ${clearedCount} cachés antiguos`);
  }

  /**
   * Obtiene el tamaño del caché en bytes
   * FASE 7: Útil para monitorear uso de localStorage
   */
  getCacheSize(): number {
    let totalSize = 0;
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    });

    return totalSize;
  }

  /**
   * Obtiene el tamaño del caché en formato legible
   */
  getCacheSizeFormatted(): string {
    const bytes = this.getCacheSize();
    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    } else if (kb >= 1) {
      return `${kb.toFixed(2)} KB`;
    } else {
      return `${bytes} bytes`;
    }
  }
}

export const messageCacheService = new MessageCacheService();
