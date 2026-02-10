/**
 * Скрипт для сборки продакшен версии игры
 * Создает папку production/ с только нужными файлами
 * Использование: node build-production.js
 */

const fs = require('fs');
const path = require('path');

const productionDir = path.join(__dirname, 'production');
const fishingDir = path.join(productionDir, 'fishing');

console.log('🚀 Сборка продакшен версии...\n');

// Создаем папки
if (!fs.existsSync(productionDir)) {
    fs.mkdirSync(productionDir);
}
if (!fs.existsSync(fishingDir)) {
    fs.mkdirSync(fishingDir);
}

// Список файлов для копирования
const files = {
    root: [
        // HTML и CSS
        'index.html',
        'app.css',
        
        // JavaScript - Core
        'PlaygamaSDK.js',
        'main.js',
        'config.js',
        
        // JavaScript - Системы
        'FontManager.js',
        'scale.js',
        'audio.js',
        'input.js',
        'CloudAssetLoader.js',
        'LoadingIndicator.js',
        'AssetManager.js',
        
        // JavaScript - Локализация
        'translations_en.js',
        'translations_ru.js',
        'LocalizationSystem.js',
        
        // JavaScript - Данные
        'fishData.js',
        'baitsData.js',
        'gearData.js',
        'GearWearSystem.js',
        'zonesData.js',
        'junkData.js',
        'monstersData.js',
        'premiumData.js',
        'iapData.js',
        
        // JavaScript - Системы игры
        'ProfileSystem.js',
        'ProfileUI.js',
        'CollectionSystem.js',
        'CollectionUI.js',
        'MarketSystem.js',
        'MarketUI.js',
        'QuestSystem.js',
        'QuestUI.js',
        'DailyRewardsSystem.js',
        'DailyRewardsUI.js',
        'RatingSystem.js',
        'RatingUI.js',
        'TrophySystem.js',
        'TrophyUI.js',
        'DayNightSystem.js',
        'DayNightUI.js',
        'RatingPromptSystem.js',
        'FishingTipsSystem.js',
        'TutorialSystem.js',
        'TutorialHighlight.js',
        'DebugPanel.js',
        'CustomCursor.js',
        
        // JavaScript - UI
        'HomeScreen.js',
        'ShopUI.js',
        'InventoryUI.js',
        'LocationDetailModal.js',
        'MapScreen.js',
        'SettingsUI.js',
        
        // JavaScript - Зоны
        'FishingZoneSystem.js',
        
        // Шрифты
        'BabyPop.otf',
        
        // Изображения - UI
        'coin.png',
        'dom.png',
        'enc.png',
        'go.png',
        'inv.png',
        'inv_rib.png',
        'kart.png',
        'katush.png',
        'kladovk.jpg',
        'magaz.png',
        'mark.png',
        'nag.png',
        'nastr.png',
        'naz.png',
        'obl.png',
        'one_marka.png',
        'podr.png',
        'prem1.png',
        'prem2.png',
        'prem3.png',
        'profl.png',
        'ramk.png',
        'reit.png',
        'rinok.png',
        'rmk.png',
        'sadk.png',
        'sadok.png',
        'sereb.png',
        'tini.png',
        'traf.png',
        'trafe.png',
        'udchk.png',
        'udchk0.png',
        'udchk3.png',
        'uipan.png',
        'zad.png',
        'zak.png',
        
        // Аудио
        'kat.wav',
        'klik.wav',
        'kup.mp3',
        'nema.mp3',
        'newur.mp3',
        'obmen.mp3',
        'pods1.wav',
        'pods2.wav',
        'pop1.wav',
        'pop2.wav',
        'pop3.wav',
        'porval.mp3',
        'slomal.mp3',
        'ulov.wav',
        'ulov2.mp3',
        'vzmah.wav'
    ],
    fishing: [
        'FishingConfig.js',
        'FishingProgression.js',
        'FishingStateMachine.js',
        'WaterRenderer.js',
        'FishingRod.js',
        'Bobber.js',
        'FishingLine.js',
        'FishingUI.js',
        'FishStorageUI.js',
        'ResultModal.js',
        'GearInventory.js',
        'GearInventoryUI.js',
        'BonusInventoryUI.js',
        'FishingGame.js'
    ]
};

let copiedCount = 0;
let errorCount = 0;

// Копируем файлы из корня
console.log('📁 Копирование файлов из корня...');
files.root.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(productionDir, file);
    
    try {
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            copiedCount++;
        } else {
            console.log(`⚠️  Файл не найден: ${file}`);
            errorCount++;
        }
    } catch (error) {
        console.log(`❌ Ошибка копирования ${file}: ${error.message}`);
        errorCount++;
    }
});

// Копируем файлы из папки fishing
console.log('\n📁 Копирование файлов из fishing/...');
files.fishing.forEach(file => {
    const src = path.join(__dirname, 'fishing', file);
    const dest = path.join(fishingDir, file);
    
    try {
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            copiedCount++;
        } else {
            console.log(`⚠️  Файл не найден: fishing/${file}`);
            errorCount++;
        }
    } catch (error) {
        console.log(`❌ Ошибка копирования fishing/${file}: ${error.message}`);
        errorCount++;
    }
});

// Копируем изображения с паттернами
console.log('\n📁 Копирование изображений с паттернами...');
const patterns = [
    { prefix: 'float_', count: 18 },
    { prefix: 'g', count: 8 },
    { prefix: 'h', count: 18 },
    { prefix: 'k_', count: 18 },
    { prefix: 'l_', count: 18 },
    { prefix: 'u', count: 18 },
    { prefix: 'n', count: 21 },
    { prefix: 'p', count: 17 }
];

patterns.forEach(pattern => {
    for (let i = 1; i <= pattern.count; i++) {
        const file = `${pattern.prefix}${i}.png`;
        const src = path.join(__dirname, file);
        const dest = path.join(productionDir, file);
        
        try {
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                copiedCount++;
            }
        } catch (error) {
            // Игнорируем ошибки для паттернов
        }
    }
});

console.log('\n' + '='.repeat(50));
console.log('✅ Сборка завершена!');
console.log('='.repeat(50));
console.log(`📦 Скопировано файлов: ${copiedCount}`);
if (errorCount > 0) {
    console.log(`⚠️  Предупреждений: ${errorCount}`);
}
console.log(`📂 Папка: ${productionDir}`);
console.log('\n🚀 Готово к загрузке на Playgama!');
console.log('\n💡 Следующие шаги:');
console.log('   1. Проверьте папку production/');
console.log('   2. Создайте ZIP архив из содержимого папки');
console.log('   3. Загрузите на платформу Playgama');
