// 🧪 SCRIPT DE PRUEBA RÁPIDA PARA WEBSOCKET
// Copia y pega este código en la consola del navegador para verificar el estado

console.log('🔍 === DIAGNÓSTICO DE WEBSOCKET ===\n');

// 1. Verificar autenticación
const checkAuth = () => {
  const cookies = document.cookie;
  const hasSupabaseCookie = cookies.includes('sb-');
  console.log('1️⃣ Autenticación:');
  console.log('   Cookies de Supabase:', hasSupabaseCookie ? '✅ Presentes' : '❌ No encontradas');

  // Verificar localStorage de Supabase
  const supabaseKeys = Object.keys(localStorage).filter((k) => k.includes('supabase'));
  console.log(
    '   Keys de Supabase en localStorage:',
    supabaseKeys.length > 0 ? '✅ ' + supabaseKeys.length : '❌ 0'
  );

  return hasSupabaseCookie || supabaseKeys.length > 0;
};

// 2. Verificar socket
const checkSocket = () => {
  console.log('\n2️⃣ Estado del Socket:');

  // Intentar acceder al socket global (si existe)
  try {
    // El socket debería estar en el módulo, pero podemos verificar si hay conexión
    const wsConnections = performance
      .getEntriesByType('resource')
      .filter(
        (r) => r.name.includes('socket.io') || r.name.includes('ws://') || r.name.includes('wss://')
      );

    console.log(
      '   Conexiones WebSocket detectadas:',
      wsConnections.length > 0 ? '✅ ' + wsConnections.length : '❌ 0'
    );

    if (wsConnections.length > 0) {
      wsConnections.forEach((ws) => {
        console.log('   └─ URL:', ws.name);
      });
    }
  } catch (e) {
    console.log('   ⚠️ No se pudo verificar conexiones WebSocket');
  }
};

// 3. Verificar mensajes en localStorage
const checkMessages = () => {
  console.log('\n3️⃣ Mensajes en localStorage:');

  const messageKeys = Object.keys(localStorage).filter((k) => k.startsWith('chat_messages_'));

  if (messageKeys.length === 0) {
    console.log('   ❌ No hay mensajes guardados');
    return;
  }

  console.log('   ✅ Conversaciones guardadas:', messageKeys.length);

  messageKeys.forEach((key) => {
    try {
      const messages = JSON.parse(localStorage.getItem(key));
      const chatId = key.replace('chat_messages_', '');
      console.log(`   └─ Chat ${chatId.substring(0, 8)}...: ${messages.length} mensajes`);
    } catch (e) {
      console.log(`   └─ ${key}: ⚠️ Error al parsear`);
    }
  });
};

// 4. Verificar configuración
const checkConfig = () => {
  console.log('\n4️⃣ Configuración:');

  // Verificar variables de entorno (si están disponibles)
  try {
    console.log('   URL actual:', window.location.origin);
    console.log('   Puerto frontend:', window.location.port || '(default)');
  } catch (e) {
    console.log('   ⚠️ No se pudo obtener configuración');
  }
};

// 5. Verificar errores en consola
const checkErrors = () => {
  console.log('\n5️⃣ Errores recientes:');
  console.log('   ⚠️ Revisa la consola arriba para errores en rojo');
  console.log('   Busca especialmente:');
  console.log('   - "Socket no conectado"');
  console.log('   - "Token inválido"');
  console.log('   - "connect_error"');
};

// Ejecutar todas las verificaciones
const runDiagnostics = () => {
  const isAuthenticated = checkAuth();
  checkSocket();
  checkMessages();
  checkConfig();
  checkErrors();

  console.log('\n📊 === RESUMEN ===');
  if (isAuthenticated) {
    console.log('✅ Usuario autenticado');
    console.log('📝 Siguiente paso: Intenta enviar un mensaje y observa los logs');
  } else {
    console.log('❌ No hay autenticación detectada');
    console.log('📝 Siguiente paso: Inicia sesión primero');
  }

  console.log('\n💡 TIPS:');
  console.log('- Busca logs que empiecen con 🔌, 📤, 📨, ✅, ❌');
  console.log('- Si ves "Socket no conectado", verifica que el backend esté corriendo');
  console.log('- Si no ves logs de WebSocket, recarga la página (F5)');
  console.log('\n=================================\n');
};

// Ejecutar
runDiagnostics();

// Función helper para limpiar localStorage (usar con cuidado)
window.clearChatHistory = () => {
  const messageKeys = Object.keys(localStorage).filter((k) => k.startsWith('chat_messages_'));
  messageKeys.forEach((key) => localStorage.removeItem(key));
  console.log('🗑️ Historial de chat limpiado:', messageKeys.length, 'conversaciones eliminadas');
};

console.log('💡 Tip: Ejecuta clearChatHistory() para limpiar el historial de chat');
