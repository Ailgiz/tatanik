// client.js - Логика работы клиента

// Данные текущего клиента
let currentClientData = {
  name: '',
  phone: '',
  category: '',
  format: '',
  city: '',
  task: '',
  photo: null
};

let currentUserId = null;
let currentUserType = 'client';
let currentChatId = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  console.log('Инициализация клиента...');
  
  // Проверка сохраненного клиента
function checkSavedClient() {
  const savedUser = loadFromStorage('currentUser');
  
  if (savedUser && savedUser.type === 'client') {
    currentUserId = savedUser.id;
    currentUserType = savedUser.type;
    
    console.log('Загружен клиент:', savedUser);
    
    // Проверяем есть ли завершенная регистрация
    const savedRequests = loadFromStorage('clientRequests');
    const userRequests = savedRequests ? savedRequests.filter(req => req.clientId === currentUserId) : [];
    
    console.log('Заявки клиента:', userRequests);
    
    if (userRequests && userRequests.length > 0) {
      // Есть заявки - переходим в кабинет
      console.log('Переходим в кабинет клиента');
      switchToScreen('screen-client-cabinet');
      loadClientRequests();
    } else {
      // Заявок нет - проверяем есть ли данные регистрации
      const clientData = loadFromStorage('currentClientData');
      if (clientData && clientData.name && clientData.phone) {
        // Регистрация частично завершена - переходим к созданию задачи
        console.log('Продолжаем регистрацию - переходим к задаче');
        currentClientData = clientData;
        switchToScreen('screen-client-task');
      } else {
        // Начинаем регистрацию с начала
        console.log('Начинаем регистрацию клиента');
        switchToScreen('screen-client-name');
      }
    }
  } else {
    // Новый пользователь - генерируем ID
    console.log('Новый клиент');
    currentUserId = generateId();
    saveUserData();
    switchToScreen('screen-client-name');
  }
}  
  // Настраиваем обработчики
  setupClientHandlers();
  
  // Инициализируем чаты
  if (typeof initializeChat === 'function') {
    initializeChat();
  }
});

// Проверка сохраненного клиента
function checkSavedClient() {
  const savedUser = loadFromStorage('currentUser');
  const savedRequests = loadFromStorage('clientRequests');
  
  if (savedUser && savedUser.type === 'client') {
    currentUserId = savedUser.id;
    currentUserType = savedUser.type;
    
    // Если есть заявки, переходим в кабинет
    if (savedRequests && savedRequests.length > 0) {
      switchToScreen('screen-client-cabinet');
      loadClientRequests();
    }
    // Иначе продолжаем регистрацию с экрана имени
  } else {
    // Новый пользователь - генерируем ID
    currentUserId = generateId();
    saveUserData();
  }
}

// Настройка обработчиков событий
function setupClientHandlers() {
  // Кнопка "Продолжить" на экране имени
  const validateNameBtn = document.getElementById('validateClientNameBtn');
  if (validateNameBtn) {
    validateNameBtn.addEventListener('click', function() {
      const nameInput = document.getElementById('clientNameInput');
      const name = nameInput ? nameInput.value.trim() : '';
      
      if (name.length >= 2) {
        currentClientData.name = name;
        switchToScreen('screen-client-phone');
      } else {
        alert('Введите имя (минимум 2 символа)');
        if (nameInput) nameInput.focus();
      }
    });
  }
  
  // Enter в поле имени
  const nameInput = document.getElementById('clientNameInput');
  if (nameInput) {
    nameInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        validateNameBtn.click();
      }
    });
  }
  
  // Кнопка "Продолжить" на экране телефона
  const validatePhoneBtn = document.getElementById('validateClientPhoneBtn');
  if (validatePhoneBtn) {
    validatePhoneBtn.addEventListener('click', function() {
      const phoneInput = document.getElementById('clientPhoneInput');
      const phone = phoneInput ? phoneInput.value.trim() : '';
      
      if (phone.length >= 10) {
        currentClientData.phone = formatPhone(phone);
        switchToScreen('screen-client-task');
      } else {
        alert('Введите корректный номер телефона');
        if (phoneInput) phoneInput.focus();
      }
    });
  }
  
  // Enter в поле телефона
  const phoneInput = document.getElementById('clientPhoneInput');
  if (phoneInput) {
    phoneInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        validatePhoneBtn.click();
      }
    });
  }
  
  // Кнопка создания заявки
  const saveTaskBtn = document.getElementById('saveTaskAndNextBtn');
  if (saveTaskBtn) {
    saveTaskBtn.addEventListener('click', function() {
      createClientRequest();
    });
  }
  
  // Кнопка "Перейти в кабинет"
  const showCabinetBtn = document.getElementById('showChatBtn');
  if (showCabinetBtn) {
    showCabinetBtn.addEventListener('click', function() {
      switchToScreen('screen-client-cabinet');
      loadClientRequests();
    });
  }
  
  // Кнопки "Назад"
  const backButtons = document.querySelectorAll('#backBtn');
  backButtons.forEach(btn => {
    btn.addEventListener('click', handleBackButton);
  });
  
  // Кнопка "Назад в кабинет"
  const backToCabinetBtn = document.getElementById('back-to-cabinet');
  if (backToCabinetBtn) {
    backToCabinetBtn.addEventListener('click', function() {
      switchToScreen('screen-client-cabinet');
    });
  }
  
  // Кнопка перерегистрации
  const reregisterBtn = document.getElementById('reregisterClientBtn');
  if (reregisterBtn) {
    reregisterBtn.addEventListener('click', function() {
      if (confirm('Вы уверены, что хотите зарегистрироваться заново? Все данные будут удалены.')) {
        clearUserData();
        window.location.href = 'index.html';
      }
    });
  }
}

// Обработка кнопки "Назад"
function handleBackButton() {
  const currentScreen = document.querySelector('.screen.active');
  if (!currentScreen) return;
  
  const currentId = currentScreen.id;
  
  switch (currentId) {
    case 'screen-client-phone':
      switchToScreen('screen-client-name');
      break;
    case 'screen-client-task':
      switchToScreen('screen-client-phone');
      break;
    case 'screen-client-done':
      switchToScreen('screen-client-task');
      break;
    default:
      // Возврат на главную для первого экрана
      window.location.href = 'index.html';
  }
}

// Переключение экранов
function switchToScreen(screenId) {
  const currentScreen = document.querySelector('.screen.active');
  const targetScreen = document.getElementById(screenId);
  
  if (currentScreen) {
    currentScreen.classList.remove('active');
  }
  
  if (targetScreen) {
    targetScreen.classList.add('active');
    
    // Фокус на первый input
    const firstInput = targetScreen.querySelector('input, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
}

// Создание заявки клиента
function createClientRequest() {
  const taskInput = document.getElementById('taskInput');
  const cityInput = document.getElementById('clientCity');
  const categorySelect = document.getElementById('clientCategory');
  const formatSelect = document.getElementById('clientFormat');
  const photoInput = document.getElementById('taskPhoto');
  
  const task = taskInput ? taskInput.value.trim() : '';
  const city = cityInput ? cityInput.value.trim() : '';
  const category = categorySelect ? categorySelect.value : '';
  const format = formatSelect ? formatSelect.value : '';
  
  // Валидация
  if (!task || task.length < 10) {
    alert('Опишите задачу подробнее (минимум 10 символов)');
    if (taskInput) taskInput.focus();
    return;
  }
  
  if (!city || city.length < 2) {
    alert('Введите город');
    if (cityInput) cityInput.focus();
    return;
  }
  
  if (!category) {
    alert('Выберите категорию');
    return;
  }
  
  if (!format) {
    alert('Выберите формат');
    return;
  }
  
  // Сохраняем данные задачи
  currentClientData.task = task;
  currentClientData.city = city;
  currentClientData.category = category;
  currentClientData.format = format;
  
  // Обработка фото
  if (photoInput && photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      currentClientData.photo = e.target.result;
      saveClientRequest();
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    saveClientRequest();
  }
}

// Сохранение заявки
function saveClientRequest() {
  const newRequest = {
    id: generateId(),
    clientId: currentUserId,
    name: currentClientData.name,
    phone: currentClientData.phone,
    task: currentClientData.task,
    city: currentClientData.city,
    category: currentClientData.category,
    format: currentClientData.format,
    photo: currentClientData.photo,
    timestamp: new Date().toISOString(),
    status: 'active',
    viewedBy: [],
    responses: []
  };
  
  // Сохраняем в localStorage
  let requests = loadFromStorage('clientRequests') || [];
  requests.push(newRequest);
  saveToStorage('clientRequests', requests);
  
  console.log('Заявка создана:', newRequest);
  
  switchToScreen('screen-client-done');
}

// Загрузка заявок клиента
function loadClientRequests() {
  const container = document.getElementById('client-requests-list');
  if (!container) return;
  
  const requests = loadFromStorage('clientRequests') || [];
  const userRequests = requests.filter(req => req.clientId === currentUserId);
  
  if (userRequests.length === 0) {
    container.innerHTML = '<p>У вас пока нет заявок</p>';
    return;
  }
  
  const requestsHTML = userRequests.map(request => {
    const viewCount = request.viewedBy ? request.viewedBy.length : 0;
    const responseCount = request.responses ? request.responses.length : 0;
    
    return `
      <div class="taskcard" onclick="openClientRequestChat('${request.id}')">
        <div class="taskcat">${request.category}</div>
        <div class="taskcity">📍 ${request.city} • ${request.format}</div>
        <p>${request.task}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9em; color: #666;">
          <span>👀 Просмотрели: ${viewCount}</span>
          <span>✋ Откликнулись: ${responseCount}</span>
        </div>
        <small>${getTimeAgo(request.timestamp)}</small>
      </div>
    `;
  }).join('');
  
  container.innerHTML = requestsHTML;
}

// Открытие чата с волонтёром
window.openClientRequestChat = function(requestId) {
  const requests = loadFromStorage('clientRequests') || [];
  const request = requests.find(r => r.id === requestId);
  
  if (!request || !request.responses || request.responses.length === 0) {
    alert('Пока никто не откликнулся на эту заявку');
    return;
  }
  
  // Показываем список волонтёров
  let volunteersList = 'Волонтёры, которые откликнулись:\n\n';
  request.responses.forEach((response, index) => {
    volunteersList += `${index + 1}. Волонтёр #${response.volunteerId.substr(-4)} (${getTimeAgo(response.timestamp)})\n`;
  });
  
  const choice = prompt(volunteersList + '\nВведите номер волонтёра для начала чата:');
  const volunteerIndex = parseInt(choice) - 1;
  
  if (volunteerIndex >= 0 && volunteerIndex < request.responses.length) {
    const volunteerId = request.responses[volunteerIndex].volunteerId;
    const chatId = `${currentUserId}_${volunteerId}`;
    
    // Создаем или получаем чат
    let chats = loadFromStorage('directChats') || {};
    if (!chats[chatId]) {
      chats[chatId] = {
        id: chatId,
        taskId: requestId,
        clientId: currentUserId,
        volunteerId: volunteerId,
        messages: []
      };
      saveToStorage('directChats', chats);
    }
    
    currentChatId = chatId;
    openDirectChat(chatId, `Чат с волонтёром #${volunteerId.substr(-4)}`);
  }
};

// Открытие экрана прямого чата
function openDirectChat(chatId, title) {
  document.getElementById('direct-chat-title').textContent = title;
  switchToScreen('screen-direct-chat');
  loadDirectChatMessages(chatId);
}

// Загрузка сообщений прямого чата
function loadDirectChatMessages(chatId) {
  const container = document.getElementById('direct-chat-messages');
  const chats = loadFromStorage('directChats') || {};
  const chat = chats[chatId];
  
  if (!chat || !chat.messages || chat.messages.length === 0) {
    container.innerHTML = '<p style="color: #666;">Чат пуст. Напишите первое сообщение!</p>';
    return;
  }
  
  const messagesHTML = chat.messages.map(message => {
    const isMyMessage = message.senderId === currentUserId;
    return `
      <div style="margin: 10px 0; text-align: ${isMyMessage ? 'right' : 'left'};">
        <div style="
          display: inline-block;
          max-width: 70%;
          padding: 8px 12px;
          border-radius: 18px;
          background: ${isMyMessage ? '#4CAF50' : '#e3f2fd'};
          color: ${isMyMessage ? 'white' : '#333'};
        ">
          ${message.text}
        </div>
        <div style="font-size: 0.8em; color: #666; margin-top: 2px;">
          ${getTimeAgo(message.timestamp)}
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = messagesHTML;
  container.scrollTop = container.scrollHeight;
}

// Универсальные функции (если не подключены из других файлов)
function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now - time) / 1000 / 60);
  
  if (diff < 1) return 'только что';
  if (diff < 60) return `${diff} мин. назад`;
  if (diff < 1440) return `${Math.floor(diff / 60)} ч. назад`;
  return `${Math.floor(diff / 1440)} дн. назад`;
}

function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11 && cleaned.startsWith('8')) {
    return '+7' + cleaned.substring(1);
  } else if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return '+' + cleaned;
  } else if (cleaned.length === 10) {
    return '+7' + cleaned;
  }
  
  return phone;
}

function saveUserData() {
  if (currentUserId && currentUserType) {
    saveToStorage('currentUser', {
      id: currentUserId,
      type: currentUserType
    });
  }
}

function clearUserData() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('clientRequests');
  localStorage.removeItem('directChats');
  localStorage.removeItem('aiChatMessages');
}