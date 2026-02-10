/**
 * Скрипт для переключения index.html на продакшен режим
 * Использование: node switch-to-production.js
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');

console.log('🔄 Переключение на продакшен режим...');

try {
    // Читаем index.html
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Проверяем текущий режим
    const isProduction = content.includes('<script src="https://sdk.playgama.com/sdk.js"></script>') && 
                        !content.includes('<!-- <script src="https://sdk.playgama.com/sdk.js"></script> -->');
    
    if (isProduction) {
        console.log('✅ Уже в продакшен режиме!');
        process.exit(0);
    }
    
    // Заменяем mock SDK на настоящий
    content = content.replace(
        /<!-- PRODUCTION: Настоящий SDK -->\s*<!-- <script src="https:\/\/sdk\.playgama\.com\/sdk\.js"><\/script> -->\s*<!-- DEVELOPMENT: Mock SDK для локальной разработки -->\s*<script src="playgama-sdk\.js"><\/script>/,
        `<!-- PRODUCTION: Настоящий SDK -->
    <script src="https://sdk.playgama.com/sdk.js"></script>
    
    <!-- DEVELOPMENT: Mock SDK для локальной разработки -->
    <!-- <script src="playgama-sdk.js"></script> -->`
    );
    
    // Сохраняем
    fs.writeFileSync(indexPath, content, 'utf8');
    
    console.log('✅ Успешно переключено на продакшен режим!');
    console.log('📝 Изменения:');
    console.log('   - Настоящий SDK: ВКЛЮЧЕН');
    console.log('   - Mock SDK: ВЫКЛЮЧЕН');
    console.log('');
    console.log('🚀 Теперь можно загружать игру на Playgama!');
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
}
