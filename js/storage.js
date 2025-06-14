// storage.js - Функции для работы с localStorage

// Сохранение данных
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения в localStorage:', error);
    return false;
  }
}

// Загрузка данных
function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Ошибка загрузки из localStorage:', error);
    return null;
  }
}

// Удаление данных
function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Ошибка удаления из localStorage:', error);
    return false;
  }
}

// Очистка всех данных приложения
function clearAllStorage() {
  try {
    const keys = [
      'currentUser',
      'clientRequests', 
      'volunteerProfile',
      'directChats',
      'aiChatMessages'
    ];
    
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Все данные приложения очищены');
    return true;
  } catch (error) {
    console.error('Ошибка очистки данных:', error);
    return false;
  }
}

// Получение статистики
function getStorageStatistics() {
  try {
    const stats = {
      currentUser: !!loadFromStorage('currentUser'),
      clientRequestsCount: (loadFromStorage('clientRequests') || []).length,
      hasVolunteerProfile: !!loadFromStorage('volunteerProfile'),
      directChatsCount: Object.keys(loadFromStorage('directChats') || {}).length,
      aiMessagesCount: (loadFromStorage('aiChatMessages') || []).length
    };
    
    return stats;
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    return {};
  }
}