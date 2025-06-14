// onboarding.js - Логика регистрации клиента и создания заявки

// Данные текущей заявки клиента
let currentClientData = {
    name: '',
    phone: '',
    category: '',
    format: '',
    city: '',
    task: '',
    photo: null
};

// Инициализация обработчиков событий для онбординга
function initializeOnboarding() {
    console.log('Инициализация онбординга клиента...');
    
    try {
        // Выбор роли на главном экране
        setupRoleSelection();
        
        // Ввод имени клиента
        setupClientNameScreen();
        
        // Ввод телефона клиента
        setupClientPhoneScreen();
        
        // Описание задачи
        setupClientTaskScreen();
        
        // Выбор типа задачи
        setupClientTypeScreen();
        
        // Экран завершения
        setupClientDoneScreen();
        
        console.log('Онбординг клиента инициализирован');
        
    } catch (error) {
        console.error('Ошибка инициализации онбординга:', error);
        if (window.TataniApp) {
            TataniApp.handleError(error, 'Ошибка инициализации');
        }
    }
}

// Настройка выбора роли
function setupRoleSelection() {
    const clientBtn = document.getElementById('clientBtn');
    const volunteerBtn = document.getElementById('volunteerBtn');
    
    console.log('Настройка кнопок роли...', { clientBtn: !!clientBtn, volunteerBtn: !!volunteerBtn });
    
    if (clientBtn) {
        clientBtn.addEventListener('click', function() {
            console.log('Клик по кнопке "Мне нужна помощь"');
            if (window.TataniApp) {
                TataniApp.switchScreen('screen-welcome', 'screen-client-name');
            }
        });
    } else {
        console.error('Кнопка clientBtn не найдена!');
    }
    
    if (volunteerBtn) {
        volunteerBtn.addEventListener('click', function() {
            console.log('Клик по кнопке "Я хочу помогать"');
            if (window.TataniApp) {
                TataniApp.switchScreen('screen-welcome', 'screen-volunteer-registration');
            }
        });
    } else {
        console.error('Кнопка volunteerBtn не найдена!');
    }
}

// Настройка экрана ввода имени
function setupClientNameScreen() {
    const nameInput = document.getElementById('clientNameInput');
    const validateBtn = document.getElementById('validateClientNameBtn');
    const voiceBtn = document.getElementById('startNameRecognitionBtn');
    
    if (validateBtn) {
        validateBtn.addEventListener('click', function() {
            const name = nameInput ? nameInput.value.trim() : '';
            
            if (!window.TataniApp || !TataniApp.isValidName(name)) {
                if (window.TataniApp) {
                    TataniApp.showNotification('Пожалуйста, введите корректное имя (минимум 2 символа, только буквы)', 'error');
                }
                if (nameInput) nameInput.focus();
                return;
            }
            
            currentClientData.name = name;
            console.log('Имя клиента сохранено:', name);
            TataniApp.switchScreen('screen-client-name', 'screen-client-phone');
        });
    }
    
    // Настройка голосового ввода для имени
    if (voiceBtn && nameInput) {
        voiceBtn.addEventListener('click', function() {
            if (window.TataniApp) {
                TataniApp.startVoiceRecognition(nameInput, function(transcript) {
                    // Дополнительная обработка для имени
                    const cleanName = transcript.replace(/[^а-яА-ЯёЁa-zA-Z\s]/g, '').trim();
                    nameInput.value = cleanName;
                });
            }
        });
    }
    
    // Валидация в реальном времени
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            const isValid = window.TataniApp ? TataniApp.isValidName(this.value) : this.value.trim().length >= 2;
            this.style.borderColor = isValid ? '#4CAF50' : '#f44336';
            
            if (validateBtn) {
                validateBtn.disabled = !isValid;
            }
        });
    }
}

// Настройка экрана ввода телефона
function setupClientPhoneScreen() {
    const phoneInput = document.getElementById('clientPhoneInput');
    const validateBtn = document.getElementById('validateClientPhoneBtn');
    const voiceBtn = document.getElementById('startPhoneRecognitionBtn');
    
    if (validateBtn) {
        validateBtn.addEventListener('click', function() {
            const phone = phoneInput ? phoneInput.value.trim() : '';
            
            if (!window.TataniApp || !TataniApp.isValidPhone(phone)) {
                if (window.TataniApp) {
                    TataniApp.showNotification('Пожалуйста, введите корректный номер телефона', 'error');
                }
                if (phoneInput) phoneInput.focus();
                return;
            }
            
            currentClientData.phone = window.TataniApp ? TataniApp.formatPhone(phone) : phone;
            console.log('Телефон клиента сохранён:', currentClientData.phone);
            TataniApp.switchScreen('screen-client-phone', 'screen-client-task');
        });
    }
    
    // Настройка голосового ввода для телефона
    if (voiceBtn && phoneInput) {
        voiceBtn.addEventListener('click', function() {
            if (window.TataniApp) {
                TataniApp.startVoiceRecognition(phoneInput, function(transcript) {
                    // Обработка числовой речи для телефона
                    const cleanPhone = transcript.replace(/[^\d\+\(\)\-\s]/g, '');
                    phoneInput.value = cleanPhone;
                });
            }
        });
    }
    
    // Форматирование телефона в реальном времени
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            const isValid = window.TataniApp ? TataniApp.isValidPhone(this.value) : this.value.length >= 10;
            this.style.borderColor = isValid ? '#4CAF50' : '#f44336';
            
            if (validateBtn) {
                validateBtn.disabled = !isValid;
            }
        });
    }
}

// Настройка экрана описания задачи
function setupClientTaskScreen() {
    const categorySelect = document.getElementById('clientCategory');
    const formatSelect = document.getElementById('clientFormat');
    const cityInput = document.getElementById('clientCity');
    const taskInput = document.getElementById('taskInput');
    const photoInput = document.getElementById('taskPhoto');
    const voiceBtn = document.getElementById('startTaskListeningBtn');
    const saveBtn = document.getElementById('saveTaskAndNextBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            // Валидация всех полей
            const category = categorySelect ? categorySelect.value : '';
            const format = formatSelect ? formatSelect.value : '';
            const city = cityInput ? cityInput.value.trim() : '';
            const task = taskInput ? taskInput.value.trim() : '';
            
            if (!category || !format || !city || !task) {
                if (window.TataniApp) {
                    TataniApp.showNotification('Пожалуйста, заполните все поля', 'error');
                }
                return;
            }
            
            if (task.length < 10) {
                if (window.TataniApp) {
                    TataniApp.showNotification('Опишите задачу более подробно (минимум 10 символов)', 'error');
                }
                if (taskInput) taskInput.focus();
                return;
            }
            
            // Сохранение данных
            currentClientData.category = category;
            currentClientData.format = format;
            currentClientData.city = city;
            currentClientData.task = task;
            
            // Обработка фото (если есть)
            if (photoInput && photoInput.files && photoInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentClientData.photo = e.target.result;
                    proceedToNextStep();
                };
                reader.readAsDataURL(photoInput.files[0]);
            } else {
                proceedToNextStep();
            }
            
            function proceedToNextStep() {
                console.log('Данные задачи сохранены:', currentClientData);
                
                // Сохраняем заявку в localStorage
                if (typeof saveClientRequest === 'function') {
                    const savedRequest = saveClientRequest(currentClientData);
                    if (savedRequest) {
                        console.log('Заявка сохранена в localStorage:', savedRequest);
                    }
                }
                
                if (window.TataniApp) {
                    TataniApp.switchScreen('screen-client-task', 'screen-client-done');
                }
            }
        });
    }
    
    // Голосовой ввод для описания задачи
    if (voiceBtn && taskInput) {
        voiceBtn.addEventListener('click', function() {
            if (window.TataniApp) {
                TataniApp.startVoiceRecognition(taskInput);
            }
        });
    }
    
    // Валидация в реальном времени
    if (taskInput) {
        taskInput.addEventListener('input', function() {
            const isValid = this.value.trim().length >= 10;
            this.style.borderColor = isValid ? '#4CAF50' : '#f44336';
            
            if (saveBtn) {
                const allValid = isValid && 
                    (categorySelect ? categorySelect.value : true) &&
                    (formatSelect ? formatSelect.value : true) &&
                    (cityInput ? cityInput.value.trim() : true);
                saveBtn.disabled = !allValid;
            }
        });
    }
}

// Настройка экрана выбора типа задачи (если нужен)
function setupClientTypeScreen() {
    const onlineBtn = document.getElementById('selectTaskTypeOnlineBtn');
    const offlineBtn = document.getElementById('selectTaskTypeOfflineBtn');
    
    if (onlineBtn) {
        onlineBtn.addEventListener('click', function() {
            currentClientData.selectedType = 'online';
            console.log('Выбран тип: онлайн');
            if (window.TataniApp) {
                TataniApp.switchScreen('screen-client-type', 'screen-client-done');
            }
        });
    }
    
    if (offlineBtn) {
        offlineBtn.addEventListener('click', function() {
            currentClientData.selectedType = 'offline';
            console.log('Выбран тип: оффлайн');
            if (window.TataniApp) {
                TataniApp.switchScreen('screen-client-type', 'screen-client-done');
            }
        });
    }
}

// Настройка экрана завершения
function setupClientDoneScreen() {
    const chatBtn = document.getElementById('showChatBtn');
    
    if (chatBtn) {
        chatBtn.addEventListener('click', function() {
            console.log('Переход к чату');
            if (window.TataniApp) {
                TataniApp.switchScreen('screen-client-done', 'screen-chat');
            }
        });
    }
}

// Получить текущие данные клиента
function getCurrentClientData() {
    return { ...currentClientData };
}

// Очистить данные клиента
function clearCurrentClientData() {
    currentClientData = {
        name: '',
        phone: '',
        category: '',
        format: '',
        city: '',
        task: '',
        photo: null
    };
}

// Экспорт функций
window.OnboardingModule = {
    getCurrentClientData,
    clearCurrentClientData
};