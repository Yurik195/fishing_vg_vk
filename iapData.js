// -*- coding: utf-8 -*-
// База данных IAP покупок (внутриигровые покупки за реальные деньги)
// ВАЖНО: Цены и валюта берутся из Yandex SDK через getCatalog()
// Здесь указаны только базовые данные для отображения до загрузки каталога
const IAP_DATABASE = [
    // Премиум набор со скидкой
    {
        id: 'premium_bundle',
        name: 'Премиум набор',
        emoji: '🎁',
        price: 159, // Базовая цена, будет заменена на реальную из SDK
        priceCurrencyCode: '', // Будет заменено на реальную валюту из SDK
        originalPrice: 300,
        discount: 47, // процент скидки
        type: 'bundle',
        description: 'Выгодный набор для настоящих рыбаков! Включает рыболовные марки, обычные монеты, энергетики, подкормки и отключение межстраничной рекламы.',
        platformIds: {
            yandex: 'premium_bundle',
            vk: 'vk_premium_bundle', // TODO: заполнить реальный ID после настройки VK
            ok: null // OK не поддерживает IAP
        },
        fallbackPrice: 500, // Цена в рыболовных марках для платформ без IAP
        contents: {
            premiumCoins: 500,
            regularCoins: 2000,
            energyDrink: 2,
            feedBonus: 2,
            noAds: true
        }
    },
    
    // Награды за просмотр рекламы
    {
        id: 'ad_reward_small',
        name: 'Просмотр рекламы',
        emoji: '📺',
        price: 0, // Бесплатно
        type: 'ad_reward',
        description: 'Посмотрите 3 рекламных ролика и получите 500 обычных монет!',
        adCount: 3,
        currentProgress: 0,
        maxProgress: 3,
        cooldown: 20 * 60 * 1000, // 20 минут в миллисекундах
        lastClaimTime: 0,
        reward: {
            regularCoins: 500,
            premiumCoins: 15 // Выдается только на платформах без IAP
        }
    },
    {
        id: 'ad_reward_medium',
        name: 'Просмотр рекламы',
        emoji: '📺',
        price: 0,
        type: 'ad_reward',
        description: 'Посмотрите 5 рекламных роликов и получите 700 обычных монет!',
        adCount: 5,
        currentProgress: 0,
        maxProgress: 5,
        cooldown: 60 * 60 * 1000, // 60 минут в миллисекундах
        lastClaimTime: 0,
        reward: {
            regularCoins: 700,
            premiumCoins: 22 // Выдается только на платформах без IAP
        }
    },
    {
        id: 'ad_reward_large',
        name: 'Просмотр рекламы',
        emoji: '📺',
        price: 0,
        type: 'ad_reward',
        description: 'Посмотрите 7 рекламных роликов и получите 1000 обычных монет!',
        adCount: 7,
        currentProgress: 0,
        maxProgress: 7,
        cooldown: 2 * 60 * 60 * 1000, // 2 часа в миллисекундах
        lastClaimTime: 0,
        reward: {
            regularCoins: 1000,
            premiumCoins: 30 // Выдается только на платформах без IAP
        }
    },
    
    // Наборы рыболовных марок
    {
        id: 'premium_coins_100',
        name: '100 Рыболовных марок',
        emoji: '🪙',
        price: 29, // ЯН
        type: 'premium_coins',
        description: 'Небольшой набор рыболовных марок для покупки особых товаров.',
        platformIds: {
            yandex: 'premium_coins_100',
            vk: 'vk_premium_100', // TODO: заполнить реальный ID после настройки VK
            ok: null // OK не поддерживает IAP
        },
        fallbackPrice: 100, // Цена в рыболовных марках для платформ без IAP
        contents: {
            premiumCoins: 100
        }
    },
    {
        id: 'premium_coins_500',
        name: '500 Рыболовных марок',
        emoji: '🪙',
        price: 129, // ЯН
        type: 'premium_coins',
        description: 'Средний набор рыболовных марок. Отличное соотношение цены и количества!',
        platformIds: {
            yandex: 'premium_coins_500',
            vk: 'vk_premium_500', // TODO: заполнить реальный ID после настройки VK
            ok: null // OK не поддерживает IAP
        },
        fallbackPrice: 500, // Цена в рыболовных марках для платформ без IAP
        contents: {
            premiumCoins: 500
        }
    },
    {
        id: 'premium_coins_1000',
        name: '1000 Рыболовных марок',
        emoji: '🪙',
        price: 239, // ЯН
        type: 'premium_coins',
        description: 'Большой набор рыболовных марок для серьезных покупок.',
        platformIds: {
            yandex: 'premium_coins_1000',
            vk: 'vk_premium_1000', // TODO: заполнить реальный ID после настройки VK
            ok: null // OK не поддерживает IAP
        },
        fallbackPrice: 1000, // Цена в рыболовных марках для платформ без IAP
        contents: {
            premiumCoins: 1000
        }
    },
    {
        id: 'premium_coins_5000',
        name: '5000 Рыболовных марок',
        emoji: '🪙',
        price: 999, // ЯН
        type: 'premium_coins',
        description: 'Огромный набор рыболовных марок! Максимальная выгода для профессионалов.',
        platformIds: {
            yandex: 'premium_coins_5000',
            vk: 'vk_premium_5000', // TODO: заполнить реальный ID после настройки VK
            ok: null // OK не поддерживает IAP
        },
        fallbackPrice: 5000, // Цена в рыболовных марках для платформ без IAP
        contents: {
            premiumCoins: 5000
        }
    },
    
    // Наборы обычных монет
    {
        id: 'regular_coins_1500',
        name: '1500 Обычных монет',
        sprite: 'sereb.png',
        price: 29, // ЯН
        type: 'regular_coins',
        description: 'Небольшой набор обычных монет для повседневных покупок.',
        platformIds: {
            yandex: 'regular_coins_1500',
            vk: 'vk_regular_1500', // TODO: заполнить реальный ID после настройки VK
            ok: null // OK не поддерживает IAP
        },
        fallbackPrice: 30, // Цена в рыболовных марках для платформ без IAP
        contents: {
            regularCoins: 1500
        }
    },
    {
        id: 'regular_coins_7000',
        name: '7000 Обычных монет',
        sprite: 'sereb.png',
        price: 129, // ЯН
        type: 'regular_coins',
        description: 'Средний набор обычных монет. Выгоднее чем обмен марок!',
        platformIds: {
            yandex: 'regular_coins_7000',
            vk: 'vk_regular_7000', // TODO: заполнить реальный ID после настройки VK
            ok: null // OK не поддерживает IAP
        },
        fallbackPrice: 130, // Цена в рыболовных марках для платформ без IAP
        contents: {
            regularCoins: 7000
        }
    },
    {
        id: 'regular_coins_14000',
        name: '14000 Обычных монет',
        sprite: 'sereb.png',
        price: 239, // ЯН
        type: 'regular_coins',
        description: 'Большой набор обычных монет для серьезных покупок.',
        platformIds: {
            yandex: 'regular_coins_14000',
            vk: 'vk_regular_14000', // TODO: заполнить реальный ID после настройки VK
            ok: null // OK не поддерживает IAP
        },
        fallbackPrice: 240, // Цена в рыболовных марках для платформ без IAP
        contents: {
            regularCoins: 14000
        }
    },
    {
        id: 'regular_coins_70000',
        name: '70000 Обычных монет',
        sprite: 'sereb.png',
        price: 999, // ЯН
        type: 'regular_coins',
        description: 'Огромный набор обычных монет! Максимальная выгода для профессионалов.',
        platformIds: {
            yandex: 'regular_coins_70000',
            vk: 'vk_regular_70000', // TODO: заполнить реальный ID после настройки VK
            ok: null // OK не поддерживает IAP
        },
        fallbackPrice: 1000, // Цена в рыболовных марках для платформ без IAP
        contents: {
            regularCoins: 70000
        }
    },
    
    // Наборы премиальных снастей
    {
        id: 'gear_bundle_starter',
        name: 'Набор начинающего рыбака',
        sprite: 'prem1.png',
        price: 159, // ЯН (вместо 205, скидка 22%)
        originalPrice: 205,
        discount: 22,
        type: 'gear_bundle',
        description: 'Полный комплект премиальных снастей для начинающих! Включает удочку, леску, поплавок, крючок и катушку.',
        platformIds: {
            yandex: 'gear_bundle_starter',
            vk: 'vk_gear_starter', // TODO: заполнить реальный ID после настройки VK
            ok: null // OK не поддерживает IAP
        },
        fallbackPrice: 160, // Цена в рыболовных марках для платформ без IAP
        contents: {
            rod: 4,      // Удочка Матчевая
            line: 4,     // Леска Флюорокарбон 0.28
            float: 3,    // Поплавок Веретено
            hook: 4,     // Крючок Карповый
            reel: 3      // Катушка Комфорт
        }
    },
    {
        id: 'gear_bundle_advanced',
        name: 'Набор опытного рыбака',
        sprite: 'prem2.png',
        price: 289, // ЯН (вместо 375, скидка 23%)
        originalPrice: 375,
        discount: 23,
        type: 'gear_bundle',
        description: 'Профессиональный комплект премиальных снастей! Мощные снасти для трофейной рыбалки.',
        platformIds: {
            yandex: 'gear_bundle_advanced',
            vk: 'vk_gear_advanced', // TODO: заполнить реальный ID после настройки VK
            ok: null // OK не поддерживает IAP
        },
        fallbackPrice: 290, // Цена в рыболовных марках для платформ без IAP
        contents: {
            rod: 9,      // Удочка Карповая
            line: 10,    // Леска Морская PE 4.0
            float: 7,    // Поплавок Матчевый
            hook: 8,     // Крючок Хищник
            reel: 8      // Катушка Турнир
        }
    },
    {
        id: 'gear_bundle_master',
        name: 'Набор мастера рыбалки',
        sprite: 'prem3.png',
        price: 399, // ЯН (вместо 525, скидка 24%)
        originalPrice: 525,
        discount: 24,
        type: 'gear_bundle',
        description: 'Легендарный комплект топовых премиальных снастей! Максимальная мощность для океанической рыбалки.',
        platformIds: {
            yandex: 'gear_bundle_master',
            vk: 'vk_gear_master', // TODO: заполнить реальный ID после настройки VK
            ok: null // OK не поддерживает IAP
        },
        fallbackPrice: 400, // Цена в рыболовных марках для платформ без IAP
        contents: {
            rod: 14,     // Удочка Троллинг Pro
            line: 15,    // Леска Океан PE 12
            float: 16,   // Поплавок Титан
            hook: 17,    // Крючок Меч-рыба
            reel: 13     // Катушка Морская X-Heavy
        }
    },
    
    // Конвертация валюты
    {
        id: 'currency_exchange',
        name: 'Обмен валюты',
        emoji: '💱',
        price: 0, // Используется премиум валюта
        type: 'exchange',
        description: 'Обменяйте рыболовные марки на обычные монеты. Курс: 1 = 12',
        exchangeRate: 12, // 1 премиум = 12 обычных
        minExchange: 1,
        maxExchange: 1000
    }
];


/**
 * Sync IAP prices with Playgama SDK catalog
 * Updates price, priceValue, and priceCurrencyCode from real SDK data
 */
function syncIAPPricesWithSDK() {
    if (!window.playgamaSDK || !window.playgamaSDK.isPaymentsReady) {
        console.warn('💳 Playgama SDK payments not ready, using default prices');
        return;
    }

    const catalog = window.playgamaSDK.getCatalog();
    if (!catalog || catalog.length === 0) {
        console.warn('💳 SDK catalog is empty, using default prices');
        return;
    }

    console.log('💳 Syncing IAP prices with SDK catalog...');
    
    let syncedCount = 0;
    const platform = window.playgamaSDK.platform || 'unknown';
    
    IAP_DATABASE.forEach(item => {
        // Skip non-IAP items (ad rewards, currency exchange)
        if (item.type === 'ad_reward' || item.type === 'exchange') {
            return;
        }
        
        // Get platform-specific product ID
        const platformId = item.platformIds ? item.platformIds[platform] : item.id;
        
        if (!platformId) {
            console.log(`💳 Product ${item.id} not available on platform ${platform}, will use fallback price`);
            return;
        }
        
        const productInfo = window.playgamaSDK.getProductInfo(platformId);
        
        if (productInfo) {
            // Update price data from SDK
            item.price = productInfo.priceValue || item.price;
            item.priceValue = productInfo.priceValue;
            item.priceCurrencyCode = productInfo.priceCurrencyCode || 'YAN';
            item.priceFormatted = productInfo.price; // Formatted price string like "159 ЯН"
            
            // Optional: update title and description from SDK if needed
            // item.name = productInfo.title || item.name;
            // item.description = productInfo.description || item.description;
            
            syncedCount++;
            
            console.log(`💳 Synced ${item.id} (${platformId}): ${item.priceFormatted} (${item.priceValue} ${item.priceCurrencyCode})`);
        } else {
            console.warn(`💳 Product ${item.id} (${platformId}) not found in SDK catalog`);
        }
    });
    
    console.log(`💳 Synced ${syncedCount} IAP items with SDK on platform ${platform}`);
}

/**
 * Get IAP item by ID with SDK prices
 * @param {string} id - IAP item ID
 * @returns {Object|null} - IAP item with real SDK prices
 */
function getIAPItem(id) {
    const item = IAP_DATABASE.find(item => item.id === id);
    if (!item) return null;
    
    // Try to get fresh price from SDK
    if (window.playgamaSDK && window.playgamaSDK.isPaymentsReady) {
        const platform = window.playgamaSDK.platform || 'unknown';
        const platformId = item.platformIds ? item.platformIds[platform] : item.id;
        
        if (platformId) {
            const productInfo = window.playgamaSDK.getProductInfo(platformId);
            if (productInfo) {
                return {
                    ...item,
                    price: productInfo.priceValue || item.price,
                    priceValue: productInfo.priceValue,
                    priceCurrencyCode: productInfo.priceCurrencyCode || item.priceCurrencyCode,
                    priceFormatted: productInfo.price
                };
            }
        }
    }
    
    return item;
}

/**
 * Get ad reward data for saving/loading
 * @returns {Object} - Ad reward progress and cooldowns
 */
function getAdRewardData() {
    const adRewards = {};
    IAP_DATABASE.forEach(item => {
        if (item.type === 'ad_reward') {
            adRewards[item.id] = {
                currentProgress: item.currentProgress || 0,
                lastClaimTime: item.lastClaimTime || 0
            };
        }
    });
    return adRewards;
}

/**
 * Load ad reward data from save
 * @param {Object} data - Saved ad reward data
 */
function loadAdRewardData(data) {
    if (!data) return;
    
    IAP_DATABASE.forEach(item => {
        if (item.type === 'ad_reward' && data[item.id]) {
            item.currentProgress = data[item.id].currentProgress || 0;
            item.lastClaimTime = data[item.id].lastClaimTime || 0;
        }
    });
    
    console.log('✅ Ad reward data loaded:', data);
}

