// Инициализация чатов
function initializeChat() {
  console.log('💬 Инициализация чатов...');
  
  // Чат с ИИ для волонтёров
  const sendVolunteerChatBtn = document.getElementById('sendVolunteerChatBtn');
  const chatVolInput = document.getElementById('chat-vol-input');
  const volunteerVoiceBtn = document.getElementById('startVolunteerVoiceBtn');
  
  console.log('🔍 Элементы чата волонтёра:', {
    sendBtn: !!sendVolunteerChatBtn,
    input: !!chatVolInput,
    voiceBtn: !!volunteerVoiceBtn
  });
  
  if (sendVolunteerChatBtn) {
    // Убираем старые обработчики
    sendVolunteerChatBtn.removeEventListener('click', sendAiMessage);
    sendVolunteerChatBtn.addEventListener('click', sendAiMessage);
    console.log('✅ Кнопка отправки волонтёра подключена');
  } else {
    console.error('❌ Кнопка sendVolunteerChatBtn не найдена');
  }
  
  if (chatVolInput) {
    // Убираем старые обработчики
    chatVolInput.removeEventListener('keypress', handleVolunteerEnter);
    chatVolInput.addEventListener('keypress', handleVolunteerEnter);
    console.log('✅ Enter для волонтёра подключен');
  } else {
    console.error('❌ Input chat-vol-input не найден');
  }
  
  if (volunteerVoiceBtn) {
    volunteerVoiceBtn.removeEventListener('click', handleVolunteerVoice);
    volunteerVoiceBtn.addEventListener('click', handleVolunteerVoice);
    console.log('✅ Голосовая кнопка волонтёра подключена');
  } else {
    console.error('❌ Кнопка startVolunteerVoiceBtn не найдена');
  }
  
  // Чат с ИИ для клиентов
  const sendClientBtn = document.getElementById('sendBtn');
  const clientInput = document.getElementById('input');
  const clientVoiceBtn = document.getElementById('clientVoiceBtn');
  
  console.log('🔍 Элементы чата клиента:', {
    sendBtn: !!sendClientBtn,
    input: !!clientInput,
    voiceBtn: !!clientVoiceBtn
  });
  
  if (sendClientBtn) {
    sendClientBtn.removeEventListener('click', sendClientMessage);
    sendClientBtn.addEventListener('click', sendClientMessage);
    console.log('✅ Кнопка отправки клиента подключена');
  }
  
  if (clientInput) {
    clientInput.removeEventListener('keypress', handleClientEnter);
    clientInput.addEventListener('keypress', handleClientEnter);
    console.log('✅ Enter для клиента подключен');
  }
  
  if (clientVoiceBtn) {
    clientVoiceBtn.removeEventListener('click', handleClientVoice);
    clientVoiceBtn.addEventListener('click', handleClientVoice);
    console.log('✅ Голосовая кнопка клиента подключена');
  }
  
  // Прямые чаты
  const directChatSendBtn = document.getElementById('direct-chat-send');
  const directChatInput = document.getElementById('direct-chat-input');
  
  if (directChatSendBtn) {
    directChatSendBtn.removeEventListener('click', sendDirectMessage);
    directChatSendBtn.addEventListener('click', sendDirectMessage);
    console.log('✅ Прямой чат подключен');
  }
  
  if (directChatInput) {
    directChatInput.removeEventListener('keypress', handleDirectChatEnter);
    directChatInput.addEventListener('keypress', handleDirectChatEnter);
  }
  
  console.log('✅ Инициализация чатов завершена');
}

// Обработчики Enter для разных чатов
function handleVolunteerEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendAiMessage();
  }
}

function handleClientEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendClientMessage();
  }
}

function handleDirectChatEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendDirectMessage();
  }
}

// Обработчики голосовых кнопок
function handleVolunteerVoice() {
  startVoiceRecording(false); // false = не клиентский чат
}

function handleClientVoice() {
  startVoiceRecording(true); // true = клиентский чат
}
// Обработчики Enter для разных чатов
function handleVolunteerEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendAiMessage();
  }
}

function handleClientEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendClientMessage();
  }
}

function handleDirectChatEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendDirectMessage();
  }
}

// Обработчики голосовых кнопок
function handleVolunteerVoice() {
  startVoiceRecording(false); // false = не клиентский чат
}

function handleClientVoice() {
  startVoiceRecording(true); // true = клиентский чат
}