cd /var/www/tatanik-chat

# Исправляем права доступа
git config --global --add safe.directory /var/www/tatanik-chat
chown -R root:www-data /var/www/tatanik-chat
chown -R root:root /var/www/tatanik-chat/.git

# Добавляем файлы
git add .

# Коммит
git commit -m "Initial commit: tatanik-chat project"

# Подключаем GitHub
git remote add origin https://github.com/Ailgiz/tatanik.git

# Отправляем
git push -u origin main
