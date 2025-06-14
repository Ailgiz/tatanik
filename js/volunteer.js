// volunteer.js - Логика работы волонтёра

let currentUserId = null;
let currentUserType = 'volunteer';
let currentChatId = null;

// Функции работы с localStorage (если storage.js не подключен)
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    return false;
  }
}

function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    return null;
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  console.log('🤝 Инициализация волонтёра...');
  
  // Проверяем сохраненного пользователя
  checkSavedVolunteer();
  
  // Настраиваем обработчики
  setupVolunteerHandlers();
  
  // Инициализируем чаты
  if (typeof initializeChat === 'function') {
    initializeChat();
  }
});

// Проверка сохраненного волонтёра
function checkSavedVolunteer() {
  console.log('🔍 Проверка авторизации волонтёра...');
  
  const session = JSON.parse(localStorage.getItem('userSession') || '{}');
  
  if (!session.userId || session.userType !== 'volunteer') {
    console.log('❌ Пользователь не авторизован как волонтёр');
    alert('Вы не авторизованы как волонтёр. Войдите в систему.');
    window.location.href = 'login.html';
    return;
  }
  
  currentUserId = session.userId;
  currentUserType = 'volunteer';
  
  console.log('✅ Пользователь авторизован:', session.email);
  
  // Проверяем есть ли заполненная анкета
  const volunteerProfile = loadFromStorage('volunteerProfile_' + session.userId);
  
  console.log('📋 Профиль волонтёра:', volunteerProfile);
  
  if (volunteerProfile && volunteerProfile.name) {
    // Анкета заполнена - переходим в кабинет
    console.log('✅ Анкета найдена - переходим в кабинет');
    switchToScreen('screen-volunteer-cabinet');
    loadVolunteerTasks();
  } else {
    // Анкета не заполнена - остаемся на регистрации
    console.log('📝 Анкета не заполнена - показываем форму');
    switchToScreen('screen-volunteer-registration');
  }
}

// Настройка обработчиков событий
function setupVolunteerHandlers() {
  console.log('⚙️ Настройка обработчиков волонтёра...');
  
  // Кнопка регистрации волонтёра
  const submitBtn = document.getElementById('submitVolunteerBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', registerVolunteer);
    console.log('✅ Обработчик регистрации подключен');
  } else {
    console.error('❌ Кнопка submitVolunteerBtn не найдена!');
  }
  
  // Кнопка фильтрации задач
  const filterBtn = document.getElementById('filterTasksBtn');
  if (filterBtn) {
    filterBtn.addEventListener('click', applyTasksFilter);
  }
  
  // Кнопка "Назад в кабинет"
  const backToCabinetBtn = document.getElementById('back-to-cabinet');
  if (backToCabinetBtn) {
    backToCabinetBtn.addEventListener('click', function() {
      switchToScreen('screen-volunteer-cabinet');
    });
  }
  
  // Кнопка перерегистрации
  const reregisterBtn = document.getElementById('reregisterVolunteerBtn');
  if (reregisterBtn) {
    reregisterBtn.addEventListener('click', function() {
      if (confirm('Вы уверены, что хотите зарегистрироваться заново? Все данные будут удалены.')) {
        clearUserData();
        window.location.href = 'index.html';
      }
    });
  }
  
  // Enter в полях регистрации
  const inputs = ['volName', 'volPhone', 'volCity', 'volSkills', 'volGoal'];
  inputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
          registerVolunteer();
        }
      });
    }
  });
  
console.log('✅ Все обработчики волонтёра настроены');

// Принудительная инициализация чатов
console.log('🔄 Принудительная инициализация чатов...');

// Задержка для полной загрузки DOM
setTimeout(() => {
  if (typeof initializeChat === 'function') {
    initializeChat();
  } else {
    console.error('❌ Функция initializeChat не найдена');
    
    // Резервная инициализация
    const sendBtn = document.getElementById('sendVolunteerChatBtn');
    const input = document.getElementById('chat-vol-input');
    
    if (sendBtn && input) {
      console.log('🔄 Резервная инициализация чата...');
      
      sendBtn.addEventListener('click', function() {
        console.log('📤 Клик по кнопке отправки');
        const text = input.value.trim();
        if (text) {
          console.log('📝 Отправляем сообщение:', text);
          // Добавляем сообщение в чат
          let aiChatMessages = JSON.parse(localStorage.getItem('aiChatMessages') || '[]');
          aiChatMessages.push({
            text: text,
            isUser: true,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('aiChatMessages', JSON.stringify(aiChatMessages));
          
          input.value = '';
          
          // Обновляем отображение чата
          if (typeof loadAiChat === 'function') {
            loadAiChat();
          }
          
          // Простой ответ ИИ
          setTimeout(() => {
            aiChatMessages.push({
              text: 'Спасибо за сообщение! Я обработаю ваш запрос.',
              isUser: false,
              timestamp: new Date().toISOString()
            });
            localStorage.setItem('aiChatMessages', JSON.stringify(aiChatMessages));
            if (typeof loadAiChat === 'function') {
              loadAiChat();
            }
          }, 1000);
        }
      });
      
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendBtn.click();
        }
      });
      
      console.log('✅ Резервная инициализация завершена');
    }
  }
}, 500);

}

// Переключение экранов
function switchToScreen(screenId) {
  console.log('🔄 Переключение на экран:', screenId);
  
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
  } else {
    console.error('❌ Экран не найден:', screenId);
  }
  
  // Загружаем данные для специальных экранов
  if (screenId === 'screen-volunteer-cabinet') {
    loadVolunteerTasks();
    
    // Инициализируем чат с ИИ если есть функция
    if (typeof loadAiChat === 'function') {
      loadAiChat();
    }
  }
}

// Регистрация волонтёра
function registerVolunteer() {
  console.log('🤝 Начинаем регистрацию профиля волонтёра...');
  
  const nameInput = document.getElementById('volName');
  const phoneInput = document.getElementById('volPhone');
  const cityInput = document.getElementById('volCity');
  const formatSelect = document.getElementById('volFormat');
  const skillsTextarea = document.getElementById('volSkills');
  const goalTextarea = document.getElementById('volGoal');
  
  console.log('🔍 Поиск элементов формы:', {
    nameInput: !!nameInput,
    phoneInput: !!phoneInput,
    cityInput: !!cityInput,
    formatSelect: !!formatSelect,
    skillsTextarea: !!skillsTextarea,
    goalTextarea: !!goalTextarea
  });
  
  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const city = cityInput ? cityInput.value.trim() : '';
  const format = formatSelect ? formatSelect.value : '';
  const skills = skillsTextarea ? skillsTextarea.value.trim() : '';
  const goal = goalTextarea ? goalTextarea.value.trim() : '';
  
  console.log('📝 Данные анкеты:', { 
    name, 
    phone, 
    city, 
    format, 
    skillsLength: skills.length, 
    goalLength: goal.length 
  });
  
  // Валидация
  const validation = validateVolunteerData({ name, phone, city, format, skills, goal });
  if (!validation.isValid) {
    console.log('❌ Валидация не пройдена:', validation.message);
    alert(validation.message);
    return;
  }
  
  console.log('✅ Валидация пройдена');
  
  // Получаем данные пользователя из сессии
  const session = JSON.parse(localStorage.getItem('userSession') || '{}');
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.id === session.userId);
  
  if (!user) {
    console.error('❌ Пользователь не найден в базе');
    alert('Ошибка: пользователь не найден. Войдите заново.');
    window.location.href = 'login.html';
    return;
  }
  
  console.log('👤 Пользователь найден:', user.email);
  
  // Создаем профиль волонтёра
  const volunteerProfile = {
    userId: user.id,
    email: user.email,
    name: name,
    phone: phone,
    city: city,
    format: format,
    skills: skills,
    goal: goal,
    registrationDate: new Date().toISOString(),
    isActive: true,
    completedTasks: 0,
    rating: 5.0
  };
  
  // Сохраняем профиль
  const profileSaved = saveToStorage('volunteerProfile_' + user.id, volunteerProfile);
  
  if (!profileSaved) {
    console.error('❌ Ошибка сохранения профиля');
    alert('Ошибка сохранения данных. Попробуйте еще раз.');
    return;
  }
  
  // Обновляем пользователя - помечаем что профиль создан
  user.hasProfile = true;
  user.profileType = 'volunteer';
  
  // Сохраняем обновленного пользователя
  const userIndex = users.findIndex(u => u.id === user.id);
  if (userIndex >= 0) {
    users[userIndex] = user;
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  currentUserId = user.id;
  console.log('✅ Профиль волонтёра создан:', volunteerProfile);
  
  alert('Анкета заполнена! Добро пожаловать в команду волонтёров! 🎉');
  switchToScreen('screen-volunteer-cabinet');
}

// Валидация данных волонтёра
function validateVolunteerData(data) {
  if (!data.name || data.name.length < 2) {
    return { isValid: false, message: 'Введите имя (минимум 2 символа)' };
  }
  
  if (!data.phone || data.phone.length < 10) {
    return { isValid: false, message: 'Введите корректный номер телефона (минимум 10 цифр)' };
  }
  
  if (!data.city || data.city.length < 2) {
    return { isValid: false, message: 'Введите город (минимум 2 символа)' };
  }
  
  if (!data.format) {
    return { isValid: false, message: 'Выберите формат помощи' };
  }
  
  if (!data.skills || data.skills.length < 10) {
    return { isValid: false, message: 'Опишите ваши навыки (минимум 10 символов)' };
  }
  
  if (!data.goal || data.goal.length < 10) {
    return { isValid: false, message: 'Расскажите о ваших целях (минимум 10 символов)' };
  }
  
  return { isValid: true, message: 'Данные корректны' };
}

// Загрузка доступных задач
function loadVolunteerTasks() {
  console.log('📋 Загрузка задач для волонтёра...');
  
  const container = document.getElementById('volTasksList');
  if (!container) {
    console.error('❌ Контейнер volTasksList не найден');
    return;
  }
  
  const requests = loadFromStorage('clientRequests') || [];
  const activeTasks = requests.filter(task => task.status === 'active');
  
  console.log('📊 Статистика задач:', {
    всего_заявок: requests.length,
    активных_задач: activeTasks.length
  });
  
  if (activeTasks.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #666;">
        <p>🔍 Пока нет доступных задач</p>
        <p>Новые заявки появятся здесь автоматически</p>
      </div>
    `;
    return;
  }
  
  const tasksHTML = activeTasks.map(task => {
    const hasViewed = task.viewedBy && task.viewedBy.includes(currentUserId);
    const hasResponded = task.responses && task.responses.some(r => r.volunteerId === currentUserId);
    const responseCount = task.responses ? task.responses.length : 0;
    
    return `
      <div class="taskcard">
        <div class="taskcat">${task.category}</div>
        <div class="taskcity">📍 ${task.city} • ${task.format}</div>
        <p>${task.task}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
          <span style="font-size: 0.9em; color: #666;">✋ Откликнулись: ${responseCount}</span>
          <small>${getTimeAgo(task.timestamp)}</small>
        </div>
        <div class="taskbtn">
          <button onclick="viewTask('${task.id}')" 
                  style="background: ${hasViewed ? '#ccc' : '#2196F3'}; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-right: 5px;">
            ${hasViewed ? '👁️ Просмотрено' : '👀 Посмотреть'}
          </button>
          <button onclick="respondToTask('${task.id}')" 
                  style="background: ${hasResponded ? '#4CAF50' : '#ff9800'}; color: white; border: none; padding: 5px 10px; border-radius: 5px;"
                  ${hasResponded ? 'disabled' : ''}>
            ${hasResponded ? '✅ Откликнулись' : '✋ Откликнуться'}
          </button>
          ${hasResponded ? `<button onclick="openVolunteerChat('${task.id}')" style="background: #9C27B0; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-left: 5px;">💬 Чат</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = tasksHTML;
  console.log('✅ Задачи загружены в интерфейс');
}

// Просмотр задачи
window.viewTask = function(taskId) {
  console.log('👁️ Просмотр задачи:', taskId);
  
  const requests = loadFromStorage('clientRequests') || [];
  const task = requests.find(t => t.id === taskId);
  if (!task) {
    console.error('❌ Задача не найдена:', taskId);
    return;
  }
  
  if (!task.viewedBy) task.viewedBy = [];
  if (!task.viewedBy.includes(currentUserId)) {
    task.viewedBy.push(currentUserId);
    saveToStorage('clientRequests', requests);
    console.log('✅ Просмотр отмечен для пользователя:', currentUserId);
  }
  
  alert(`Подробности задачи:\n\n📋 ${task.task}\n\n📍 Город: ${task.city}\n🏷️ Категория: ${task.category}\n💼 Формат: ${task.format}\n\n⏰ Создана: ${getTimeAgo(task.timestamp)}`);
  loadVolunteerTasks();
};

// Отклик на задачу
window.respondToTask = function(taskId) {
  console.log('✋ Отклик на задачу:', taskId);
  
  const requests = loadFromStorage('clientRequests') || [];
  const task = requests.find(t => t.id === taskId);
  if (!task) {
    console.error('❌ Задача не найдена:', taskId);
    return;
  }
  
  if (!task.responses) task.responses = [];
  
  const alreadyResponded = task.responses.some(r => r.volunteerId === currentUserId);
  if (alreadyResponded) {
    alert('Вы уже откликнулись на эту задачу');
    return;
  }
  
  // Добавляем отклик
  task.responses.push({
    volunteerId: currentUserId,
    timestamp: new Date().toISOString(),
    status: 'pending'
  });
  
  saveToStorage('clientRequests', requests);
  console.log('✅ Отклик добавлен');
  
  // Создаем чат
  const chatId = `${task.clientId}_${currentUserId}`;
  let chats = loadFromStorage('directChats') || {};
  if (!chats[chatId]) {
    chats[chatId] = {
      id: chatId,
      taskId: taskId,
      clientId: task.clientId,
      volunteerId: currentUserId,
      messages: [{
        id: generateId(),
        senderId: currentUserId,
        text: 'Здравствуйте! Я готов помочь с вашей задачей.',
        timestamp: new Date().toISOString()
      }]
    };
    saveToStorage('directChats', chats);
    console.log('✅ Чат создан:', chatId);
  }
  
  alert('Ваш отклик отправлен! 🎉\nТеперь вы можете общаться с клиентом в чате.');
  loadVolunteerTasks();
};

// Открыть чат с клиентом
window.openVolunteerChat = function(taskId) {
  console.log('💬 Открытие чата для задачи:', taskId);
  
  const requests = loadFromStorage('clientRequests') || [];
  const task = requests.find(t => t.id === taskId);
  if (!task) {
    console.error('❌ Задача не найдена:', taskId);
    return;
  }
  
  const chatId = `${task.clientId}_${currentUserId}`;
  const chats = loadFromStorage('directChats') || {};
  const chat = chats[chatId];
  
  if (!chat) {
    alert('Чат не найден. Возможно, произошла ошибка.');
    return;
  }
  
  currentChatId = chatId;
  openDirectChat(chatId, `Чат с клиентом (${task.category})`);
};

// Применение фильтров
function applyTasksFilter() {
  console.log('🔍 Применение фильтров...');
  
  const categoryFilter = document.getElementById('filter-category');
  const formatFilter = document.getElementById('filter-format');
  const cityFilter = document.getElementById('filter-city');
  
  // Пока что просто перезагружаем все задачи
  // TODO: Добавить реальную фильтрацию
  loadVolunteerTasks();
}

// Открытие прямого чата
function openDirectChat(chatId, title) {
  console.log('💬 Открытие прямого чата:', chatId);
  
  const titleElement = document.getElementById('direct-chat-title');
  if (titleElement) {
    titleElement.textContent = title;
  }
  
  switchToScreen('screen-direct-chat');
  loadDirectChatMessages(chatId);
}

// Загрузка сообщений прямого чата
function loadDirectChatMessages(chatId) {
  console.log('📨 Загрузка сообщений чата:', chatId);
  
  const container = document.getElementById('direct-chat-messages');
  if (!container) {
    console.error('❌ Контейнер сообщений не найден');
    return;
  }
  
  const chats = loadFromStorage('directChats') || {};
  const chat = chats[chatId];
  
  if (!chat || !chat.messages || chat.messages.length === 0) {
    container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Чат пуст. Напишите первое сообщение! 💬</p>';
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
          word-wrap: break-word;
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
  
  console.log('✅ Сообщения загружены:', chat.messages.length);
}

// Универсальные функции
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

function saveUserData() {
  if (currentUserId && currentUserType) {
    saveToStorage('currentUser', {
      id: currentUserId,
      type: currentUserType
    });
  }
}

function clearUserData() {
  // Очищаем данные текущего пользователя
  const session = JSON.parse(localStorage.getItem('userSession') || '{}');
  if (session.userId) {
    localStorage.removeItem('volunteerProfile_' + session.userId);
  }
  
  localStorage.removeItem('userSession');
  localStorage.removeItem('rememberMe');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('clientRequests');
  localStorage.removeItem('directChats');
  localStorage.removeItem('aiChatMessages');
  
  console.log('🗑️ Данные пользователя очищены');
}