/**
 * Скрипт для переключения index.html на режим разработки
 * Использование: node switch-to-development.js
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');

console.log('🔄 Переключение на режим разработки...');

try {
    // Читаем index.html
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Проверяем текущий режим
    const isDevelopment = content.includes('<script src="playgama-sdk.js"></script>') && 
                         !content.includes('<!-- <script src="playgama-sdk.js"></script> -->');
    
    if (isDevelopment) {
        console.log('✅ Уже в режиме разработки!');
        process.exit(0);
    }
    
    // Заменяем настоящий SDK на mock
    content = content.replace(
        /<!-- PRODUCTION: Настоящий SDK -->\s*<script src="https:\/\/sdk\.playgama\.com\/sdk\.js"><\/script>\s*<!-- DEVELOPMENT: Mock SDK для локальной разработки -->\s*<!-- <script src="playgama-sdk\.js"><\/script> -->/,
        `<!-- PRODUCTION: Настоящий SDK -->
    <!-- <script src="https://sdk.playgama.com/sdk.js"></script> -->
    
    <!-- DEVELOPMENT: Mock SDK для локальной разработки -->
    <script src="playgama-sdk.js"></script>`
    );
    
    // Сохраняем
    fs.writeFileSync(indexPath, content, 'utf8');
    
    console.log('✅ Успешно переключено на режим разработки!');
    console.log('📝 Изменения:');
    console.log('   - Настоящий SDK: ВЫКЛЮЧЕН');
    console.log('   - Mock SDK: ВКЛЮЧЕН');
    console.log('');
    console.log('💻 Теперь можно разрабатывать локально!');
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
}
