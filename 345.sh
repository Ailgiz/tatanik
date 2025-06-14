# Проверка текущего состояния и тестирование

echo "🔍 ПРОВЕРКА НАСТРОЕК"
echo "==================="

# 1. Проверяем Git статус
echo "📂 Git статус в проекте:"
cd /var/www/tatanik-chat
git status

echo ""
echo "🔗 Git remote:"
git remote -v

echo ""
echo "📝 Последние коммиты:"
git log --oneline -3

echo ""
echo "⏰ Задачи cron:"
crontab -l

echo ""
echo "🔧 Проверяем скрипт синхронизации:"
ls -la /usr/local/bin/tatanik-sync.sh

echo ""
echo "🧪 ТЕСТИРУЕМ СИНХРОНИЗАЦИЮ"
echo "=========================="

# Создаем лог файл если его нет
touch /var/log/tatanik-sync.log
chmod 644 /var/log/tatanik-sync.log

# Запускаем тест синхронизации
echo "🚀 Запускаем тест синхронизации..."
/usr/local/bin/tatanik-sync.sh

echo ""
echo "📝 Содержимое лога:"
cat /var/log/tatanik-sync.log

echo ""
echo "✅ ПРОВЕРКА ЗАВЕРШЕНА"
echo "====================="

# Проверяем файлы на GitHub (показываем инструкцию)
echo ""
echo "🔗 Проверьте ваш GitHub репозиторий:"
echo "   https://github.com/Ailgiz/tatanik"
echo ""
echo "Должны быть файлы:"
echo "   ✓ index.html"
echo "   ✓ client.html" 
echo "   ✓ login.html"
echo "   ✓ volunteer.html"
echo "   ✓ папки: assets/, css/, js/"
echo "   ✓ README.MD"
echo "   ✓ .gitignore"

echo ""
echo "🌐 Админ панель доступна по адресу:"
echo "   http://ваш-домен.com/admin-update.php"
