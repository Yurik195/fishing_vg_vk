/**
 * Простой тест для проверки метода getLanguage()
 * Проверяет требования 2.1, 2.2, 2.3
 */

// Загружаем класс PlaygamaSDKManager
const fs = require('fs');
const vm = require('vm');

// Читаем и выполняем код PlaygamaSDK.js
const sdkCode = fs.readFileSync('./PlaygamaSDK.js', 'utf8');
const context = { window: {}, console };
vm.createContext(context);
vm.runInContext(sdkCode, context);

// Получаем класс из контекста
const PlaygamaSDKManager = context.PlaygamaSDKManager || eval(sdkCode.match(/class PlaygamaSDKManager[\s\S]*?^}/m)[0] + '; PlaygamaSDKManager');

// Создаем экземпляр SDK Manager
const sdkManager = new PlaygamaSDKManager();

console.log('🧪 Тестирование метода getLanguage()...\n');

// Тест 1: SDK недоступен - должен вернуть 'ru'
console.log('Тест 1: SDK недоступен');
const lang1 = sdkManager.getLanguage();
console.log(`Результат: ${lang1}`);
console.log(`✅ Ожидаемый результат: 'ru', Получено: '${lang1}', Тест ${lang1 === 'ru' ? 'ПРОЙДЕН' : 'ПРОВАЛЕН'}\n`);

// Тест 2: SDK доступен с поддерживаемым языком
console.log('Тест 2: SDK с поддерживаемым языком (en)');
sdkManager.sdk = {
    player: { language: 'en' }
};
const lang2 = sdkManager.getLanguage();
console.log(`Результат: ${lang2}`);
console.log(`✅ Ожидаемый результат: 'en', Получено: '${lang2}', Тест ${lang2 === 'en' ? 'ПРОЙДЕН' : 'ПРОВАЛЕН'}\n`);

// Тест 3: SDK с неподдерживаемым языком - должен вернуть 'ru'
console.log('Тест 3: SDK с неподдерживаемым языком (zh)');
sdkManager.sdk = {
    player: { language: 'zh' }
};
const lang3 = sdkManager.getLanguage();
console.log(`Результат: ${lang3}`);
console.log(`✅ Ожидаемый результат: 'ru', Получено: '${lang3}', Тест ${lang3 === 'ru' ? 'ПРОЙДЕН' : 'ПРОВАЛЕН'}\n`);

// Тест 4: SDK с языком в верхнем регистре
console.log('Тест 4: SDK с языком в верхнем регистре (EN-US)');
sdkManager.sdk = {
    platform: { language: 'EN-US' }
};
const lang4 = sdkManager.getLanguage();
console.log(`Результат: ${lang4}`);
console.log(`✅ Ожидаемый результат: 'en', Получено: '${lang4}', Тест ${lang4 === 'en' ? 'ПРОЙДЕН' : 'ПРОВАЛЕН'}\n`);

// Тест 5: SDK с альтернативным источником языка
console.log('Тест 5: SDK с альтернативным источником (sdk.language)');
sdkManager.sdk = {
    language: 'tr'
};
const lang5 = sdkManager.getLanguage();
console.log(`Результат: ${lang5}`);
console.log(`✅ Ожидаемый результат: 'tr', Получено: '${lang5}', Тест ${lang5 === 'tr' ? 'ПРОЙДЕН' : 'ПРОВАЛЕН'}\n`);

// Тест 6: SDK с пустым языком - должен вернуть 'ru'
console.log('Тест 6: SDK с пустым языком');
sdkManager.sdk = {
    player: { language: '' }
};
const lang6 = sdkManager.getLanguage();
console.log(`Результат: ${lang6}`);
console.log(`✅ Ожидаемый результат: 'ru', Получено: '${lang6}', Тест ${lang6 === 'ru' ? 'ПРОЙДЕН' : 'ПРОВАЛЕН'}\n`);

console.log('🎉 Все тесты завершены!');
