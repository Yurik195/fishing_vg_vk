// -*- coding: utf-8 -*-
// Система локализации для игры
class LocalizationSystem {
    constructor() {
        this.currentLocale = 'ru'; // По умолчанию русский
        this.translations = {};
        console.log('[LocalizationSystem] Конструктор вызван, начальная локаль: ru');
        this.loadTranslations();
        // НЕ вызываем detectLanguage() здесь - язык будет установлен из SDK
        // Если SDK не инициализируется, можно вызвать detectLanguage() вручную
        console.log('[LocalizationSystem] Инициализация завершена, ожидаем установки языка из SDK');
    }
    
    // Определение языка пользователя (fallback если SDK не доступен)
    detectLanguage() {
        // Заглушка для SDK - определяем язык браузера
        const browserLang = navigator.language || navigator.userLanguage;
        console.log('[LocalizationSystem] detectLanguage: navigator.language =', browserLang);
        
        // Если язык русский - оставляем ru, иначе en
        if (browserLang && (browserLang.startsWith('ru') || browserLang === 'ru-RU')) {
            this.currentLocale = 'ru';
            console.log('[LocalizationSystem] Установлен русский язык');
        } else {
            this.currentLocale = 'en';
            console.log('[LocalizationSystem] Установлен английский язык');
        }
    }
    
    // Загрузка переводов
    loadTranslations() {
        // Русский язык - загружаем переводы английских технических терминов
        if (typeof RU_TRANSLATIONS !== 'undefined') {
            this.translations.ru = RU_TRANSLATIONS;
            console.log('[LocalizationSystem] Русские переводы загружены, количество ключей:', Object.keys(RU_TRANSLATIONS).length);
        } else {
            this.translations.ru = {};
            console.warn('[LocalizationSystem] RU_TRANSLATIONS не найден, используем пустой объект');
        }
        
        // Английский язык - загружаем из файла
        if (typeof EN_TRANSLATIONS !== 'undefined') {
            this.translations.en = EN_TRANSLATIONS;
            console.log('[LocalizationSystem] Английские переводы загружены, количество ключей:', Object.keys(EN_TRANSLATIONS).length);
            
            // Тестируем загрузку переводов зон
            console.log('[LocalizationSystem] Тест: zone_1_name =', EN_TRANSLATIONS['zone_1_name']);
            console.log('[LocalizationSystem] Тест: zone_2_name =', EN_TRANSLATIONS['zone_2_name']);
        } else {
            console.error('[LocalizationSystem] EN_TRANSLATIONS не найден!');
        }
    }
    
    // Получить текущую локаль
    getLocale() {
        return this.currentLocale;
    }
    
    // Установить локаль
    setLocale(locale) {
        if (locale === 'ru' || locale === 'en') {
            console.log(`[LocalizationSystem] setLocale: ${this.currentLocale} -> ${locale}`);
            this.currentLocale = locale;
            console.log(`[LocalizationSystem] currentLocale установлена: ${this.currentLocale}`);
        } else {
            console.warn(`[LocalizationSystem] Неподдерживаемая локаль: ${locale}`);
        }
    }
    
    // Установить язык (алиас для setLocale, для совместимости с SDK)
    setLanguage(lang) {
        console.log(`[LocalizationSystem] setLanguage вызван с параметром: ${lang}`);
        console.log(`[LocalizationSystem] currentLocale ДО изменения: ${this.currentLocale}`);
        
        // Преобразуем язык SDK в локаль
        const localeMap = {
            'ru': 'ru',
            'en': 'en',
            'tr': 'en', // Турецкий -> английский
            'uk': 'ru', // Украинский -> русский
            'be': 'ru', // Белорусский -> русский
            'kk': 'ru', // Казахский -> русский
            'uz': 'ru', // Узбекский -> русский
            'hy': 'ru', // Армянский -> русский
            'ka': 'ru', // Грузинский -> русский
            'az': 'ru', // Азербайджанский -> русский
        };
        
        const locale = localeMap[lang] || 'en';
        console.log(`[LocalizationSystem] Преобразовано: ${lang} -> ${locale}`);
        this.setLocale(locale);
        console.log(`[LocalizationSystem] currentLocale ПОСЛЕ изменения: ${this.currentLocale}`);
    }
    
    // Получить перевод по ключу
    t(key, defaultValue = '') {
        // Если русский язык - проверяем есть ли перевод для технических терминов
        if (this.currentLocale === 'ru') {
            // Если есть перевод в RU_TRANSLATIONS - используем его
            if (this.translations.ru && this.translations.ru[key]) {
                return this.translations.ru[key];
            }
            // Иначе возвращаем оригинальный текст
            return defaultValue;
        }
        
        // Для английского языка ищем перевод
        if (this.translations.en && this.translations.en[key]) {
            return this.translations.en[key];
        }
        
        // Если перевод не найден - возвращаем оригинал
        return defaultValue;
    }
    
    // Получить перевод рыбы
    getFishName(fishId, defaultName) {
        return this.t(`fish_${fishId}_name`, defaultName);
    }
    
    getFishDescription(fishId, defaultDescription) {
        return this.t(`fish_${fishId}_desc`, defaultDescription);
    }
    
    // Получить перевод снасти
    getGearName(type, tier, defaultName) {
        return this.t(`gear_${type}_${tier}_name`, defaultName);
    }
    
    getGearDescription(type, tier, defaultDescription) {
        return this.t(`gear_${type}_${tier}_desc`, defaultDescription);
    }
    
    // Получить перевод наживки
    getBaitName(baitId, defaultName) {
        return this.t(`bait_${baitId}_name`, defaultName);
    }
    
    getBaitType(baitId, defaultType) {
        return this.t(`bait_${baitId}_type`, defaultType);
    }
    
    getBaitDescription(baitId, defaultDescription) {
        return this.t(`bait_${baitId}_desc`, defaultDescription);
    }
    
    getBaitTargets(baitId, defaultTargets) {
        return this.t(`bait_${baitId}_targets`, defaultTargets);
    }
    
    // Получить перевод премиум товара
    getBonusName(bonusId, defaultName) {
        return this.t(`bonus_${bonusId}_name`, defaultName);
    }
    
    getBonusDescription(bonusId, defaultDescription) {
        return this.t(`bonus_${bonusId}_desc`, defaultDescription);
    }
    
    // Получить перевод IAP товара
    getIAPName(iapId, defaultName) {
        return this.t(`iap_${iapId}_name`, defaultName);
    }
    
    getIAPDescription(iapId, defaultDescription) {
        return this.t(`iap_${iapId}_desc`, defaultDescription);
    }
    
    // Получить перевод зоны
    getZoneName(zoneId, defaultName) {
        const key = `zone_${zoneId}_name`;
        const result = this.t(key, defaultName);
        return result;
    }
    
    getZoneDescription(zoneId, defaultDescription) {
        return this.t(`zone_${zoneId}_desc`, defaultDescription);
    }
    
    // Получить перевод монстра
    getMonsterName(monsterId, defaultName) {
        return this.t(`monster_${monsterId}_name`, defaultName);
    }
    
    getMonsterDescription(monsterId, defaultDescription) {
        return this.t(`monster_${monsterId}_desc`, defaultDescription);
    }
    
    // Получить перевод предмета (junk/item)
    getJunkName(junkId, defaultName) {
        return this.t(`junk_${junkId}_name`, defaultName);
    }
    
    getJunkDescription(junkId, defaultDescription) {
        return this.t(`junk_${junkId}_desc`, defaultDescription);
    }
    
    getJunkCategory(junkId, defaultCategory) {
        return this.t(`junk_${junkId}_category`, defaultCategory);
    }
    
    // Получить перевод UI элемента
    getUI(key, defaultValue) {
        return this.t(`ui_${key}`, defaultValue);
    }
    
    // Вспомогательная функция для быстрого доступа (алиас)
    // Использование: L('play', 'Играть')
    L(key, defaultValue) {
        // Если ключ начинается с ui_, fish_, gear_ и т.д. - используем напрямую
        if (key.includes('_')) {
            return this.t(key, defaultValue);
        }
        // Иначе добавляем префикс ui_
        return this.getUI(key, defaultValue);
    }
}

// Создаем глобальный экземпляр
window.localizationSystem = new LocalizationSystem();

// Создаем короткий алиас для удобства
window.L = (key, defaultValue) => window.localizationSystem.L(key, defaultValue);
