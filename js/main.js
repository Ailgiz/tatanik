// main.js - Главный файл инициализации приложения

// Глобальные переменные
let currentScreen = 'screen-welcome';
let isVoiceRecognitionSupported = false;
let recognition = null;

// Проверка поддержки браузера
function checkBrowserSupport() {
    // Проверка поддержки localStorage
    if (typeof Storage === "undefined") {
        alert("Ваш браузер не поддерживает localStorage. Некоторые функции могут не работать.");
    }
    
    // Проверка поддержки речевого ввода
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        isVoiceRecognitionSupported = true;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'ru-RU';
        recognition.continuous = false;
        recognition.interimResults = false;
    } else {
        console.log('Речевой ввод не поддерживается в этом браузере');
        // Скрываем кнопки с микрофоном
        hideVoiceButtons();
    }
}

// Скрыть кнопки голосового ввода если не поддерживается
function hideVoiceButtons() {
    const voiceButtons = document.querySelectorAll('[id*="Recognition"], [id*="Voice"], [id*="Listening"]');
    voiceButtons.forEach(button => {
        if (button) {
            button.style.display = 'none';
        }
    });
}

// Функция переключения экранов
function switchScreen(fromScreenId, toScreenId) {
    const fromScreen = document.getElementById(fromScreenId);
    const toScreen = document.getElementById(toScreenId);
    
    if (fromScreen) {
        fromScreen.classList.remove('active');
    }
    
    if (toScreen) {
        toScreen.classList.add('active');
        currentScreen = toScreenId;
        
        // Фокус на первый input, если есть
        const firstInput = toScreen.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    } else {
        console.error(`Экран ${toScreenId} не найден`);
    }
}

// Универсальная функция для кнопок "Назад"
function setupBackButtons() {
    const backButtons = document.querySelectorAll('#backBtn');
    
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentScreenEl = document.querySelector('.screen.active');
            const currentScreenId = currentScreenEl ? currentScreenEl.id : null;
            
            // Определяем куда возвращаться
            let targetScreen = 'screen-welcome';
            
            switch (currentScreenId) {
                case 'screen-client-name':
                case 'screen-volunteer-registration':
                    targetScreen = 'screen-welcome';
                    break;
                case 'screen-client-phone':
                    targetScreen = 'screen-client-name';
                    break;
                case 'screen-client-task':
                    targetScreen = 'screen-client-phone';
                    break;
                case 'screen-client-type':
                    targetScreen = 'screen-client-task';
                    break;
                case 'screen-client-done':
                    targetScreen = 'screen-client-type';
                    break;
                case 'screen-chat':
                    targetScreen = 'screen-client-done';
                    break;
                case 'screen-volunteer-tasks':
                    targetScreen = 'screen-volunteer-registration';
                    break;
                default:
                    targetScreen = 'screen-welcome';
            }
            
            switchScreen(currentScreenId, targetScreen);
        });
    });
}

// Валидация телефона
function isValidPhone(phone) {
    // Простая проверка российского номера
    const phoneRegex = /^(\+7|8)[\s\-]?\(?[489]\d{2}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Валидация имени
function isValidName(name) {
    return name && name.trim().length >= 2 && /^[а-яА-ЯёЁa-zA-Z\s]+$/.test(name.trim());
}

// Форматирование телефона
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

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 300px;
        word-wrap: break-word;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Цвета для разных типов
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            notification.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ff9800';
            break;
        default:
            notification.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Обработка ошибок
function handleError(error, userMessage = 'Произошла ошибка') {
    console.error('Ошибка:', error);
    showNotification(userMessage, 'error');
}

// Загрузка и отображение статистики (для отладки)
function loadAppStatistics() {
    if (window.location.hash === '#debug') {
        const stats = getAppStatistics();
        console.log('Статистика приложения:', stats);
        
        // Добавляем кнопку очистки данных
        const debugPanel = document.createElement('div');
        debugPanel.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1000;
        `;
        debugPanel.innerHTML = `
            <div>Заявок: ${stats.totalRequests}</div>
            <div>Активных: ${stats.activeRequests}</div>
            <div>Волонтёр: ${stats.hasVolunteerProfile ? 'Да' : 'Нет'}</div>
            <button id="clearDataBtn" style="margin-top: 5px; padding: 2px 5px;">Очистить данные</button>
        `;
        document.body.appendChild(debugPanel);
        
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            if (confirm('Удалить все данные приложения?')) {
                clearAllData();
                location.reload();
            }
        });
    }
}

// Обработка нажатия Enter в input полях
function setupEnterKeyHandlers() {
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const activeScreen = document.querySelector('.screen.active');
            if (!activeScreen) return;
            
            const target = e.target;
            
            // Если фокус в textarea, Enter не должен отправлять форму
            if (target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Находим кнопку "Продолжить" или аналогичную на текущем экране
            const continueBtn = activeScreen.querySelector(
                '#validateClientNameBtn, #validateClientPhoneBtn, #saveTaskAndNextBtn, #submitVolunteerBtn, #sendBtn, #sendVolunteerChatBtn'
            );
            
            if (continueBtn && !continueBtn.disabled) {
                e.preventDefault();
                continueBtn.click();
            }
        }
    });
}

// Инициализация приложения
function initializeApp() {
    console.log('Инициализация приложения Tatani...');
    
    try {
        // Проверка поддержки браузера
        checkBrowserSupport();
        
        // Настройка кнопок "Назад"
        setupBackButtons();
        
        // Настройка обработчиков Enter
        setupEnterKeyHandlers();
        
        // Загрузка статистики для отладки
        loadAppStatistics();
        
        // Показ начального экрана
        switchScreen(null, 'screen-welcome');
        
        console.log('Приложение инициализировано успешно');
        
    } catch (error) {
        handleError(error, 'Ошибка инициализации приложения');
    }
}

// Универсальная функция речевого ввода
function startVoiceRecognition(inputElement, callback) {
    if (!isVoiceRecognitionSupported || !recognition) {
        showNotification('Речевой ввод не поддерживается', 'warning');
        return;
    }
    
    // Находим кнопку микрофона для визуального feedback
    const micButton = document.querySelector(`button[onclick*="${inputElement.id}"], button[data-input="${inputElement.id}"]`);
    
    recognition.onstart = function() {
        console.log('Начат речевой ввод');
        if (micButton) {
            micButton.style.backgroundColor = '#ff4444';
            micButton.textContent = '🔴 Говорите...';
        }
        showNotification('Говорите...', 'info');
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        console.log('Распознано:', transcript);
        
        if (inputElement) {
            inputElement.value = transcript;
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (callback) {
            callback(transcript);
        }
        
        showNotification('Текст распознан!', 'success');
    };
    
    recognition.onerror = function(event) {
        console.error('Ошибка речевого ввода:', event.error);
        let errorMessage = 'Ошибка речевого ввода';
        
        switch (event.error) {
            case 'no-speech':
                errorMessage = 'Речь не обнаружена';
                break;
            case 'audio-capture':
                errorMessage = 'Нет доступа к микрофону';
                break;
            case 'not-allowed':
                errorMessage = 'Доступ к микрофону запрещен';
                break;
        }
        
        showNotification(errorMessage, 'error');
    };
    
    recognition.onend = function() {
        console.log('Речевой ввод завершён');
        if (micButton) {
            micButton.style.backgroundColor = '';
            micButton.textContent = '🎤 Сказать';
        }
    };
    
    try {
        recognition.start();
    } catch (error) {
        console.error('Ошибка запуска речевого ввода:', error);
        showNotification('Не удалось запустить речевой ввод', 'error');
    }
}

// Экспорт функций для использования в других модулях
window.TataniApp = {
    switchScreen,
    showNotification,
    handleError,
    isValidPhone,
    isValidName,
    formatPhone,
    startVoiceRecognition,
    isVoiceRecognitionSupported
};

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Инициализируем все модули
    if (typeof initializeOnboarding === 'function') {
        initializeOnboarding();
    }
    if (typeof initializeVolunteer === 'function') {
        initializeVolunteer();
    }
    if (typeof initializeChat === 'function') {
        initializeChat();
    }
});