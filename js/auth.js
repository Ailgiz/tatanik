// auth.js - Система аутентификации

// Текущий пользователь
let currentUser = null;

// Инициализация системы авторизации
function initializeAuth() {
  console.log('Инициализация системы авторизации...');
  
  // Проверяем автоматический вход
  checkAutoLogin();
}

// Проверка автоматического входа
function checkAutoLogin() {
  const savedSession = loadFromStorage('userSession');
  const rememberMe = loadFromStorage('rememberMe');
  
  if (savedSession && rememberMe) {
    const user = loadUserByEmail(savedSession.email);
    if (user && user.isVerified) {
      currentUser = user;
      console.log('Автоматический вход выполнен для:', user.email);
      return true;
    }
  }
  
  return false;
}

// Простое хеширование пароля (в реальном проекте используйте bcrypt)
function hashPassword(password) {
  // Простой хеш для демонстрации - в продакшене используйте криптографически стойкие методы
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

// Генерация кода подтверждения
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Регистрация нового пользователя
async function registerUser(email, password, userType) {
  try {
    // Проверяем существует ли пользователь
    const existingUser = loadUserByEmail(email);
    if (existingUser) {
      return { success: false, message: 'Пользователь с таким email уже существует' };
    }
    
    // Валидация email
    if (!isValidEmail(email)) {
      return { success: false, message: 'Некорректный email адрес' };
    }
    
    // Валидация пароля
    if (password.length < 6) {
      return { success: false, message: 'Пароль должен содержать минимум 6 символов' };
    }
    
    // Создаем пользователя
    const verificationCode = generateVerificationCode();
    const hashedPassword = hashPassword(password);
    
    const newUser = {
      id: generateId(),
      email: email,
      password: hashedPassword,
      userType: userType,
      isVerified: false,
      verificationCode: verificationCode,
      registrationDate: new Date().toISOString(),
      profile: null
    };
    
    // Сохраняем пользователя
    saveUser(newUser);
    
    // Отправляем код подтверждения
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (emailSent.success) {
      return { 
        success: true, 
        message: 'Код подтверждения отправлен на email',
        userId: newUser.id,
        email: email
      };
    } else {
      return { 
        success: false, 
        message: 'Ошибка отправки email: ' + emailSent.message 
      };
    }
    
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return { success: false, message: 'Ошибка сервера' };
  }
}

// Отправка кода подтверждения на email
async function sendVerificationEmail(email, code) {
  try {
    console.log(`Отправляем код ${code} на email ${email}`);
    
    // Отправляем запрос на ваш вебхук для отправки email
    const response = await fetch('https://aikonver.ru/webhook/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Код подтверждения Tatani',
        code: code,
        type: 'verification'
      })
    });
    
    if (response.ok) {
      return { success: true, message: 'Email отправлен' };
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
    
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    
    // Fallback - показываем код в alert (только для разработки!)
    alert(`Код подтверждения: ${code}\n(В продакшене отправится на email)`);
    return { success: true, message: 'Код показан в alert' };
  }
}

// Подтверждение email кодом
function verifyEmail(email, inputCode) {
  const user = loadUserByEmail(email);
  
  if (!user) {
    return { success: false, message: 'Пользователь не найден' };
  }
  
  if (user.verificationCode !== inputCode) {
    return { success: false, message: 'Неверный код подтверждения' };
  }
  
  // Подтверждаем пользователя
  user.isVerified = true;
  user.verificationCode = null;
  saveUser(user);
  
  return { success: true, message: 'Email подтвержден успешно' };
}

// Вход пользователя
function loginUser(email, password, rememberMe = false) {
  const user = loadUserByEmail(email);
  
  if (!user) {
    return { success: false, message: 'Пользователь не найден' };
  }
  
  const hashedPassword = hashPassword(password);
  if (user.password !== hashedPassword) {
    return { success: false, message: 'Неверный пароль' };
  }
  
  if (!user.isVerified) {
    return { 
      success: false, 
      message: 'Email не подтвержден. Проверьте почту или запросите новый код.',
      needVerification: true,
      email: email
    };
  }
  
  // Создаем сессию
  currentUser = user;
  
  const session = {
    userId: user.id,
    email: user.email,
    loginTime: new Date().toISOString()
  };
  
  saveToStorage('userSession', session);
  
  if (rememberMe) {
    saveToStorage('rememberMe', true);
  }
  
  return { 
    success: true, 
    message: 'Вход выполнен успешно',
    user: {
      id: user.id,
      email: user.email,
      userType: user.userType,
      hasProfile: !!user.profile
    }
  };
}

// Выход пользователя
function logoutUser() {
  currentUser = null;
  removeFromStorage('userSession');
  removeFromStorage('rememberMe');
  
  console.log('Пользователь вышел из системы');
}

// Сброс пароля
async function resetPassword(email) {
  const user = loadUserByEmail(email);
  
  if (!user) {
    return { success: false, message: 'Пользователь с таким email не найден' };
  }
  
  const resetCode = generateVerificationCode();
  user.resetCode = resetCode;
  user.resetCodeExpires = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 минут
  
  saveUser(user);
  
  // Отправляем код сброса
  const emailSent = await sendResetEmail(email, resetCode);
  
  if (emailSent.success) {
    return { success: true, message: 'Код сброса отправлен на email' };
  } else {
    return { success: false, message: 'Ошибка отправки email' };
  }
}

// Отправка кода сброса пароля
async function sendResetEmail(email, code) {
  try {
    console.log(`Отправляем код сброса ${code} на email ${email}`);
    
    const response = await fetch('https://aikonver.ru/webhook/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Сброс пароля Tatani',
        code: code,
        type: 'reset'
      })
    });
    
    if (response.ok) {
      return { success: true, message: 'Email отправлен' };
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
    
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    
    // Fallback
    alert(`Код сброса пароля: ${code}\n(В продакшене отправится на email)`);
    return { success: true, message: 'Код показан в alert' };
  }
}

// Подтверждение сброса пароля
function confirmPasswordReset(email, resetCode, newPassword) {
  const user = loadUserByEmail(email);
  
  if (!user || !user.resetCode) {
    return { success: false, message: 'Код сброса не найден' };
  }
  
  if (user.resetCode !== resetCode) {
    return { success: false, message: 'Неверный код сброса' };
  }
  
  // Проверяем срок действия кода
  if (new Date() > new Date(user.resetCodeExpires)) {
    return { success: false, message: 'Код сброса истек' };
  }
  
  if (newPassword.length < 6) {
    return { success: false, message: 'Пароль должен содержать минимум 6 символов' };
  }
  
  // Устанавливаем новый пароль
  user.password = hashPassword(newPassword);
  user.resetCode = null;
  user.resetCodeExpires = null;
  
  saveUser(user);
  
  return { success: true, message: 'Пароль успешно изменен' };
}

// Функции работы с пользователями в localStorage
function saveUser(user) {
  let users = loadFromStorage('users') || [];
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  saveToStorage('users', users);
}

function loadUserByEmail(email) {
  const users = loadFromStorage('users') || [];
  return users.find(u => u.email === email);
}

function loadUserById(id) {
  const users = loadFromStorage('users') || [];
  return users.find(u => u.id === id);
}

// Валидация email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Получение текущего пользователя
function getCurrentUser() {
  return currentUser;
}

// Проверка авторизации
function isLoggedIn() {
  return !!currentUser;
}

// Универсальные функции
function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}