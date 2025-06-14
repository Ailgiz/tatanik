<?php
// Административный интерфейс для обновления tatanik-chat
$project_path = '/var/www/tatanik-chat';

if (isset($_POST['update'])) {
    $output = shell_exec('/usr/local/bin/tatanik-sync.sh 2>&1');
    $message = $output;
}

if (isset($_POST['status'])) {
    chdir($project_path);
    $git_status = shell_exec('git status --porcelain 2>&1');
    $git_log = shell_exec('git log --oneline -5 2>&1');
    $status_message = "Git Status:\n" . ($git_status ?: "Нет изменений") . "\n\nПоследние коммиты:\n" . $git_log;
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔧 Админ - tatanik-chat</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
        }
        h1 { 
            color: #333; 
            margin-bottom: 30px; 
            text-align: center;
            font-size: 2rem;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #007bff;
        }
        .info-card h3 {
            color: #007bff;
            margin-bottom: 10px;
            font-size: 1rem;
        }
        .btn-group {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        .btn { 
            background: #007bff; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 16px; 
            flex: 1;
            min-width: 150px;
            transition: all 0.3s ease;
        }
        .btn:hover { 
            background: #0056b3; 
            transform: translateY(-2px);
        }
        .btn-secondary {
            background: #6c757d;
        }
        .btn-secondary:hover {
            background: #545b62;
        }
        .output { 
            background: #1e1e1e; 
            color: #00ff00;
            padding: 20px; 
            border-radius: 8px; 
            white-space: pre-wrap; 
            font-family: 'Monaco', 'Consolas', monospace; 
            border: 1px solid #333;
            max-height: 400px;
            overflow-y: auto;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        @media (max-width: 768px) {
            .btn-group { flex-direction: column; }
            .btn { min-width: auto; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Админ панель tatanik-chat</h1>
        
        <div class="info-grid">
            <div class="info-card">
                <h3>📁 Проект</h3>
                <p>/var/www/tatanik-chat</p>
            </div>
            <div class="info-card">
                <h3>🔗 GitHub</h3>
                <p>Ailgiz/tatanik</p>
            </div>
            <div class="info-card">
                <h3>⏰ Автообновление</h3>
                <p>Каждые 10 минут</p>
            </div>
            <div class="info-card">
                <h3>📝 Логи</h3>
                <p>/var/log/tatanik-sync.log</p>
            </div>
        </div>
        
        <form method="post">
            <div class="btn-group">
                <button type="submit" name="update" class="btn">🚀 Обновить проект</button>
                <button type="submit" name="status" class="btn btn-secondary">📊 Статус Git</button>
            </div>
        </form>
        
        <?php if (isset($message)): ?>
            <h3>📤 Результат обновления:</h3>
            <div class="output"><?= htmlspecialchars($message) ?></div>
        <?php endif; ?>
        
        <?php if (isset($status_message)): ?>
            <h3>📊 Статус проекта:</h3>
            <div class="output"><?= htmlspecialchars($status_message) ?></div>
        <?php endif; ?>
        
        <div class="footer">
            <p>🔧 Административная панель для управления синхронизацией</p>
            <p>Время сервера: <?= date('Y-m-d H:i:s') ?></p>
        </div>
    </div>
</body>
</html>
