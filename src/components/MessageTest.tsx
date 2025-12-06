import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMessages } from '../hooks/useMessages';
import { useAuthContext } from '../hooks/useAuthContext';
import { ConnectionStatus } from './ConnectionStatus';

export const MessageTest: React.FC = () => {
  const { user } = useAuthContext();
  const { status, isConnected } = useWebSocket();
  const { sendMessage, getConversationMessages, error, isSending } = useMessages({
    userId: user?.id,
    enabled: true,
  });

  const [receiverId, setReceiverId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [viewingUserId, setViewingUserId] = useState('');
  const [lastError, setLastError] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiverId || !messageContent) {
      setLastError('Debes ingresar un destinatario y un mensaje');
      return;
    }

    try {
      setLastError(null);
      await sendMessage(receiverId, messageContent);
      setMessageContent(''); // Limpiar input después de enviar
      console.log('✅ Mensaje enviado exitosamente');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setLastError(errorMsg);
      console.error('❌ Error:', err);
    }
  };

  const handleViewConversation = () => {
    if (!viewingUserId) {
      setLastError('Ingresa un ID de usuario para ver la conversación');
      return;
    }
    setLastError(null);
  };

  const conversationMessages = viewingUserId ? getConversationMessages(viewingUserId) : [];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧪 Test de Mensajería - Fases 2 y 3</h2>

      {/* Estado de conexión */}
      <div style={styles.section}>
        <ConnectionStatus />
        <p style={styles.info}>
          Usuario actual: <strong>{user?.id || 'No autenticado'}</strong>
        </p>
        <p style={styles.info}>
          Estado: <strong>{status}</strong> | Conectado:{' '}
          <strong>{isConnected() ? '✅ Sí' : '❌ No'}</strong>
        </p>
      </div>

      {/* Formulario de envío */}
      <div style={styles.section}>
        <h3 style={styles.subtitle}>📤 Enviar Mensaje</h3>
        <form onSubmit={handleSendMessage} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>ID del Destinatario:</label>
            <input
              type="text"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              placeholder="UUID del usuario destinatario"
              style={styles.input}
              disabled={!isConnected()}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mensaje:</label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Escribe tu mensaje aquí (1-5000 caracteres)"
              style={styles.textarea}
              disabled={!isConnected()}
              maxLength={5000}
            />
            <small style={styles.charCount}>{messageContent.length} / 5000 caracteres</small>
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(!isConnected() || isSending ? styles.buttonDisabled : {}),
            }}
            disabled={!isConnected() || isSending}
          >
            {isSending ? '⏳ Enviando...' : '📨 Enviar Mensaje'}
          </button>
        </form>
      </div>

      {/* Errores */}
      {(error || lastError) && (
        <div style={styles.errorBox}>
          <strong>❌ Error:</strong> {error || lastError}
        </div>
      )}

      {/* Visualizar conversación */}
      <div style={styles.section}>
        <h3 style={styles.subtitle}>💬 Ver Conversación</h3>
        <div style={styles.inputGroup}>
          <label style={styles.label}>ID del Usuario:</label>
          <div style={styles.viewRow}>
            <input
              type="text"
              value={viewingUserId}
              onChange={(e) => setViewingUserId(e.target.value)}
              placeholder="UUID del usuario"
              style={styles.input}
            />
            <button onClick={handleViewConversation} style={styles.buttonSmall}>
              🔍 Ver
            </button>
          </div>
        </div>

        {viewingUserId && (
          <div style={styles.messagesContainer}>
            <p style={styles.info}>
              Mensajes con <strong>{viewingUserId}</strong>: {conversationMessages.length}
            </p>

            {conversationMessages.length === 0 ? (
              <p style={styles.emptyState}>No hay mensajes en esta conversación</p>
            ) : (
              <div style={styles.messagesList}>
                {conversationMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      ...styles.messageItem,
                      ...(msg.from === user?.id
                        ? styles.messageItemSent
                        : styles.messageItemReceived),
                    }}
                  >
                    <div style={styles.messageHeader}>
                      <span style={styles.messageFrom}>
                        {msg.from === user?.id ? '👤 Tú' : `👥 ${msg.from.substring(0, 8)}...`}
                      </span>
                      <span style={styles.messageStatus}>{msg.estado}</span>
                    </div>
                    <div style={styles.messageContent}>{msg.content}</div>
                    <div style={styles.messageTime}>
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div style={styles.instructions}>
        <h4 style={styles.subtitle}>📋 Instrucciones de Prueba:</h4>
        <ol style={styles.list}>
          <li>Asegúrate de estar autenticado y conectado al WebSocket</li>
          <li>Ingresa el UUID de un usuario destinatario</li>
          <li>Escribe un mensaje (1-5000 caracteres)</li>
          <li>Haz clic en "Enviar Mensaje"</li>
          <li>Verifica en la consola los logs de envío</li>
          <li>Ingresa el UUID del destinatario en "Ver Conversación" para ver los mensajes</li>
          <li>Abre otra sesión con otro usuario para probar mensajes bidireccionales</li>
        </ol>
      </div>
    </div>
  );
};

// Estilos inline para el componente de prueba
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    color: '#e0e0e0',
    fontFamily: 'monospace',
  },
  title: {
    color: '#00ff00',
    textAlign: 'center',
    marginBottom: '20px',
  },
  subtitle: {
    color: '#00ccff',
    marginBottom: '10px',
  },
  section: {
    marginBottom: '30px',
    padding: '15px',
    backgroundColor: '#2a2a2a',
    borderRadius: '6px',
    border: '1px solid #333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    color: '#00ff00',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    backgroundColor: '#333',
    border: '1px solid #555',
    borderRadius: '4px',
    color: '#e0e0e0',
    fontSize: '14px',
  },
  textarea: {
    padding: '10px',
    backgroundColor: '#333',
    border: '1px solid #555',
    borderRadius: '4px',
    color: '#e0e0e0',
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'monospace',
  },
  charCount: {
    color: '#888',
    fontSize: '12px',
    textAlign: 'right',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#00ff00',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#555',
    color: '#888',
    cursor: 'not-allowed',
  },
  buttonSmall: {
    padding: '8px 16px',
    backgroundColor: '#00ccff',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  viewRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  info: {
    margin: '5px 0',
    color: '#ccc',
  },
  errorBox: {
    padding: '15px',
    backgroundColor: '#ff000020',
    border: '1px solid #ff0000',
    borderRadius: '4px',
    color: '#ff6666',
    marginBottom: '20px',
  },
  messagesContainer: {
    marginTop: '15px',
  },
  messagesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '10px',
    backgroundColor: '#1a1a1a',
    borderRadius: '4px',
  },
  messageItem: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #444',
  },
  messageItemSent: {
    backgroundColor: '#003300',
    borderLeft: '3px solid #00ff00',
  },
  messageItemReceived: {
    backgroundColor: '#000033',
    borderLeft: '3px solid #00ccff',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
    fontSize: '12px',
  },
  messageFrom: {
    color: '#00ff00',
    fontWeight: 'bold',
  },
  messageStatus: {
    color: '#888',
    fontSize: '11px',
  },
  messageContent: {
    color: '#e0e0e0',
    marginBottom: '5px',
    wordBreak: 'break-word',
  },
  messageTime: {
    color: '#666',
    fontSize: '11px',
    textAlign: 'right',
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    padding: '20px',
    fontStyle: 'italic',
  },
  instructions: {
    padding: '15px',
    backgroundColor: '#2a2a2a',
    borderRadius: '6px',
    border: '1px solid #00ff00',
  },
  list: {
    color: '#ccc',
    paddingLeft: '20px',
    lineHeight: '1.8',
  },
};
