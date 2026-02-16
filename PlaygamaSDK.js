/**
 * Playgama SDK Integration Module
 * Multi-platform adapter for Playgama SDK supporting VK Play, Yandex Games, OK, and other platforms
 * 
 * This adapter provides the same API as YandexSDKManager for backward compatibility
 * while using Playgama SDK under the hood for multi-platform support.
 * 
 * Created: 2026-02-09
 * Migration from: YandexSDK.js
 * Version: 2.0.1 (VK Storage Fix with Debug Logs)
 */

console.log('[PlaygamaSDK] 🚀 VERSION 2.0.1 LOADED - VK Storage Fix with Debug Logs');

// Debug: Check what's available globally (disabled in production)
// console.log('[PlaygamaSDK] === GLOBAL SDK CHECK ===');
// ... debug logs removed for production

// Try to find SDK in different possible locations
let detectedSDK = null;
let sdkObject = null;

if (typeof window.bridge !== 'undefined') {
    detectedSDK = 'window.bridge';
    sdkObject = window.bridge;
} else if (typeof window.PlaygamaBridge !== 'undefined') {
    detectedSDK = 'window.PlaygamaBridge';
    sdkObject = window.PlaygamaBridge;
} else if (typeof window.Playgama !== 'undefined') {
    detectedSDK = 'window.Playgama';
    sdkObject = window.Playgama;
} else if (typeof window.playgama !== 'undefined') {
    detectedSDK = 'window.playgama';
    sdkObject = window.playgama;
} else if (typeof window.PlaygamaSDK !== 'undefined') {
    detectedSDK = 'window.PlaygamaSDK';
    sdkObject = window.PlaygamaSDK;
} else if (typeof window.PG !== 'undefined') {
    detectedSDK = 'window.PG';
    sdkObject = window.PG;
} else if (typeof window.Bridge !== 'undefined') {
    detectedSDK = 'window.Bridge';
    sdkObject = window.Bridge;
} else if (typeof window.pg !== 'undefined') {
    detectedSDK = 'window.pg';
    sdkObject = window.pg;
} else if (typeof window.PLAYGAMA !== 'undefined') {
    detectedSDK = 'window.PLAYGAMA';
    sdkObject = window.PLAYGAMA;
} else if (typeof window.SDK !== 'undefined') {
    detectedSDK = 'window.SDK';
    sdkObject = window.SDK;
}

// console.log('[PlaygamaSDK] Detected SDK location:', detectedSDK);
// if (sdkObject) {
//     console.log('[PlaygamaSDK] SDK object:', sdkObject);
//     console.log('[PlaygamaSDK] SDK methods:', Object.keys(sdkObject));
// }
// console.log('[PlaygamaSDK] === END GLOBAL SDK CHECK ===');

class PlaygamaSDKManager {
    constructor() {
        // Core SDK reference
        this.sdk = null;
        this.isInitialized = false;
        
        // VK Bridge reference (для облачных сохранений и баннеров)
        this.vkBridge = null;
        this.isVKBridgeInitialized = false;
        
        // Platform information
        this.platform = null; // Platform type: 'yandex', 'vk', 'ok', etc.
        this.platformCapabilities = {
            payments: false,      // IAP support
            leaderboards: false,  // Leaderboard support
            socialShare: false,   // Social sharing support
            cloudSaves: false     // Cloud storage support
        };
        
        // Player and language
        this.language = 'ru'; // Default language
        
        // Initialization callbacks
        this.onInitCallbacks = [];
        this.onPlayerReadyCallbacks = [];
        this.onPaymentsReadyCallbacks = [];
        
        // IAP catalog cache
        this.catalog = [];
        this.catalogMap = new Map(); // Quick lookup by productID
        
        // Product mapping system: internal ID -> platform-specific ID
        this.productMapping = this.initializeProductMapping();
    }

    /**
     * Initialize product mapping configuration
     * Maps internal product IDs to platform-specific IDs
     * @returns {Map} - Map of internal ID to platform mapping object
     */
    initializeProductMapping() {
        const mapping = new Map();
        
        // Premium Bundle
        mapping.set('premium_bundle', {
            platformIds: {
                yandex: 'premium_bundle',
                vk: 'vk_premium_bundle',
                ok: null
            },
            fallbackPrice: 500
        });
        
        // Premium Coins (Рыболовные марки)
        mapping.set('premium_coins_100', {
            platformIds: {
                yandex: 'premium_coins_100',
                vk: 'vk_premium_100',
                ok: null
            },
            fallbackPrice: 100
        });
        
        mapping.set('premium_coins_500', {
            platformIds: {
                yandex: 'premium_coins_500',
                vk: 'vk_premium_500',
                ok: null
            },
            fallbackPrice: 500
        });
        
        mapping.set('premium_coins_1000', {
            platformIds: {
                yandex: 'premium_coins_1000',
                vk: 'vk_premium_1000',
                ok: null
            },
            fallbackPrice: 1000
        });
        
        mapping.set('premium_coins_5000', {
            platformIds: {
                yandex: 'premium_coins_5000',
                vk: 'vk_premium_5000',
                ok: null
            },
            fallbackPrice: 5000
        });
        
        // Regular Coins (Обычные монеты)
        mapping.set('regular_coins_1500', {
            platformIds: {
                yandex: 'regular_coins_1500',
                vk: 'vk_coins_1500',
                ok: null
            },
            fallbackPrice: 30
        });
        
        mapping.set('regular_coins_7000', {
            platformIds: {
                yandex: 'regular_coins_7000',
                vk: 'vk_coins_7000',
                ok: null
            },
            fallbackPrice: 130
        });
        
        mapping.set('regular_coins_14000', {
            platformIds: {
                yandex: 'regular_coins_14000',
                vk: 'vk_coins_14000',
                ok: null
            },
            fallbackPrice: 240
        });
        
        mapping.set('regular_coins_70000', {
            platformIds: {
                yandex: 'regular_coins_70000',
                vk: 'vk_coins_70000',
                ok: null
            },
            fallbackPrice: 1000
        });
        
        // Gear Bundles (Наборы снастей)
        mapping.set('gear_bundle_starter', {
            platformIds: {
                yandex: 'gear_bundle_starter',
                vk: 'vk_gear_starter',
                ok: null
            },
            fallbackPrice: 160
        });
        
        mapping.set('gear_bundle_advanced', {
            platformIds: {
                yandex: 'gear_bundle_advanced',
                vk: 'vk_gear_advanced',
                ok: null
            },
            fallbackPrice: 290
        });
        
        mapping.set('gear_bundle_master', {
            platformIds: {
                yandex: 'gear_bundle_master',
                vk: 'vk_gear_master',
                ok: null
            },
            fallbackPrice: 400
        });
        
        return mapping;
    }

    /**
     * Detect platform capabilities
     * Determines what features are available on the current platform
     * @returns {Promise<Object>} - Platform capabilities object
     */
    async detectPlatformCapabilities() {
        const capabilities = {
            payments: false,
            leaderboards: false,
            socialShare: false,
            cloudSaves: false,
            platform: 'unknown'
        };
        
        if (!this.sdk) {
            console.warn('🔍 SDK not available, cannot detect capabilities');
            return capabilities;
        }
        
        try {
            // Detect platform type
            if (this.sdk.platform && this.sdk.platform.type) {
                capabilities.platform = this.sdk.platform.type;
            }
            
            // Check payments capability
            if (this.sdk.payments) {
                try {
                    const catalog = await this.sdk.payments.getCatalog();
                    capabilities.payments = catalog && catalog.length > 0;
                } catch (error) {
                    capabilities.payments = false;
                }
            }
            
            // Check leaderboards capability
            if (this.sdk.leaderboard) {
                capabilities.leaderboards = true;
            }
            
            // Check social sharing capability
            if (this.sdk.social) {
                capabilities.socialShare = true;
            }
            
            // Check cloud storage capability
            if (this.sdk.storage) {
                capabilities.cloudSaves = true;
            }
            
        } catch (error) {
            console.error('🔍 Failed to detect platform capabilities:', error);
        }
        
        return capabilities;
    }

    /**
     * Check if current platform supports IAP
     * @returns {boolean} - true if platform supports IAP
     */
    isPlatformSupportsIAP() {
        return this.platformCapabilities.payments;
    }

    /**
     * Get platform-specific product ID from internal ID
     * @param {string} internalId - Internal product ID
     * @returns {string|null} - Platform-specific product ID or null if not available
     */
    getPlatformProductId(internalId) {
        const mapping = this.productMapping.get(internalId);
        if (!mapping) {
            console.warn(`⚠️ No mapping found for product: ${internalId}`);
            return null;
        }
        
        const platformId = mapping.platformIds[this.platform];
        if (!platformId) {
        }
        
        return platformId || null;
    }

    /**
     * Get fallback price in premium currency for a product
     * @param {string} internalId - Internal product ID
     * @returns {number} - Fallback price in premium currency
     */
    getPremiumCurrencyPrice(internalId) {
        const mapping = this.productMapping.get(internalId);
        return mapping?.fallbackPrice || 0;
    }

    /**
     * Map platform product ID back to internal ID
     * @param {string} platformId - Platform-specific product ID
     * @returns {string|null} - Internal product ID or null if not found
     */
    getInternalProductId(platformId) {
        for (const [internalId, mapping] of this.productMapping.entries()) {
            const platformIds = Object.values(mapping.platformIds);
            if (platformIds.includes(platformId)) {
                return internalId;
            }
        }
        return null;
    }

    // ==================== CORE SDK METHODS ====================
    
    /**
     * Initialize Playgama SDK
     * Detects platform, capabilities, loads player data, and sets up event handlers
     * @returns {Promise<boolean>} - true if initialization successful
     */
    async init() {
        // console.log('[PlaygamaSDK] init() called');
        
        // Try to find SDK in multiple locations (Bridge SDK priority)
        let sdkFound = null;
        let sdkLocation = null;
        
        if (typeof window.bridge !== 'undefined') {
            sdkFound = window.bridge;
            sdkLocation = 'window.bridge';
        } else if (typeof window.PlaygamaBridge !== 'undefined') {
            sdkFound = window.PlaygamaBridge;
            sdkLocation = 'window.PlaygamaBridge';
        } else if (typeof window.Playgama !== 'undefined') {
            sdkFound = window.Playgama;
            sdkLocation = 'window.Playgama';
        } else if (typeof window.playgama !== 'undefined') {
            sdkFound = window.playgama;
            sdkLocation = 'window.playgama';
        } else if (typeof window.PlaygamaSDK !== 'undefined') {
            sdkFound = window.PlaygamaSDK;
            sdkLocation = 'window.PlaygamaSDK';
        } else if (typeof window.PG !== 'undefined') {
            sdkFound = window.PG;
            sdkLocation = 'window.PG';
        } else if (typeof window.Bridge !== 'undefined') {
            sdkFound = window.Bridge;
            sdkLocation = 'window.Bridge';
        } else if (typeof window.pg !== 'undefined') {
            sdkFound = window.pg;
            sdkLocation = 'window.pg';
        } else if (typeof window.PLAYGAMA !== 'undefined') {
            sdkFound = window.PLAYGAMA;
            sdkLocation = 'window.PLAYGAMA';
        } else if (typeof window.SDK !== 'undefined') {
            sdkFound = window.SDK;
            sdkLocation = 'window.SDK';
        }
        
        // console.log('[PlaygamaSDK] SDK search result:', sdkLocation);
        // console.log('[PlaygamaSDK] SDK object:', sdkFound);
        
        try {
            // Check if Playgama SDK is available
            if (!sdkFound) {
                console.warn('⚠️ Playgama SDK not available, falling back to standalone mode');
                this.isInitialized = false;
                this.platform = 'standalone';
                
                // Load data from localStorage in standalone mode
                const localData = this.loadFromLocalStorage();
                
                // Trigger init callbacks
                this.onInitCallbacks.forEach(callback => callback(null));
                this.onPlayerReadyCallbacks.forEach(callback => callback(null));
                
                return true;
            }
            
            // console.log('[PlaygamaSDK] Found SDK at:', sdkLocation);
            // console.log('[PlaygamaSDK] SDK methods:', Object.keys(sdkFound));
            
            // Check if SDK has initialize method (Bridge SDK uses initialize, not init)
            if (typeof sdkFound.initialize === 'function') {
                // console.log('[PlaygamaSDK] Calling SDK.initialize()...');
                await sdkFound.initialize();
                // console.log('[PlaygamaSDK] SDK.initialize() completed');
            } else if (typeof sdkFound.init === 'function') {
                // console.log('[PlaygamaSDK] Calling SDK.init()...');
                await sdkFound.init();
                // console.log('[PlaygamaSDK] SDK.init() completed');
            } else {
                // console.log('[PlaygamaSDK] SDK does not have init/initialize method, assuming already initialized');
            }
            
            this.sdk = sdkFound;
            
            // console.log('[PlaygamaSDK] SDK assigned:', this.sdk);
            
            // Detect platform type
            this.platform = this.sdk.platform?.type || this.sdk.platform?.id || 'unknown';
            
            // console.log('[PlaygamaSDK] Platform detected:', this.platform);
            
            // Detect platform capabilities
            this.platformCapabilities = await this.detectPlatformCapabilities();
            
            // Get player language
            this.language = this.getLanguage();
            
            // Setup event handlers for pause/resume
            this.setupEventHandlers();
            
            // Load player data
            try {
                const cloudData = await this.loadData();
            } catch (error) {
                console.warn('⚠️ Failed to load cloud data, using localStorage:', error);
                const localData = this.loadFromLocalStorage();
            }
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Trigger init callbacks
            this.onInitCallbacks.forEach(callback => callback(this.sdk));
            this.onPlayerReadyCallbacks.forEach(callback => callback(this.sdk));
            
            // Load IAP catalog if payments are available
            if (this.platformCapabilities.payments) {
                try {
                    await this.loadCatalog();
                    // console.log('💳 IAP каталог загружен:', this.catalog.length, 'товаров');
                } catch (error) {
                    console.error('❌ Ошибка загрузки IAP каталога:', error);
                }
                
                // Trigger payments callbacks after catalog is loaded
                this.onPaymentsReadyCallbacks.forEach(callback => callback(this.sdk));
            }
            
            // Initialize VK Bridge if on VK platform
            if (this.platform === 'vk') {
                await this.initVKBridge();
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Playgama SDK:', error);
            
            // Fallback to standalone mode
            this.isInitialized = false;
            this.platform = 'standalone';
            
            // Load from localStorage as fallback
            const localData = this.loadFromLocalStorage();
            
            // Trigger callbacks even in fallback mode
            this.onInitCallbacks.forEach(callback => callback(null));
            this.onPlayerReadyCallbacks.forEach(callback => callback(null));
            
            return true; // Return true to allow game to continue
        }
    }
    
    /**
     * Signal to platform that game is ready to start
     * Should be called after all game assets are loaded
     */
    async gameReady() {
        if (!this.sdk) {
            return;
        }
        
        try {
            // Playgama Bridge SDK uses bridge.platform.sendMessage("game_ready")
            if (this.sdk.platform && typeof this.sdk.platform.sendMessage === 'function') {
                await this.sdk.platform.sendMessage("game_ready");
            } 
            // Fallback: Bridge SDK uses bridge.game.gameLoadingFinished()
            else if (this.sdk.game && typeof this.sdk.game.gameLoadingFinished === 'function') {
                await this.sdk.game.gameLoadingFinished();
            } 
            // Fallback: Old SDK uses gameReady()
            else if (typeof this.sdk.gameReady === 'function') {
                await this.sdk.gameReady();
            }
        } catch (error) {
            console.error('❌ Failed to signal game ready:', error);
        }
    }
    
    /**
     * Signal to platform that gameplay has started
     * Should be called when player starts playing (e.g., starts fishing)
     */
    async gameplayStart() {
        
        if (!this.sdk) {
            return;
        }
        
        try {
            if (this.sdk.gameplayStart) {
                await this.sdk.gameplayStart();
            } else {
            }
        } catch (error) {
            console.error('❌ Failed to signal gameplay start:', error);
        }
    }
    
    /**
     * Signal to platform that gameplay has stopped
     * Should be called when player stops playing (e.g., returns to menu)
     */
    async gameplayStop() {
        
        if (!this.sdk) {
            return;
        }
        
        try {
            if (this.sdk.gameplayStop) {
                await this.sdk.gameplayStop();
            } else {
            }
        } catch (error) {
            console.error('❌ Failed to signal gameplay stop:', error);
        }
    }
    
    // ==================== VK BRIDGE METHODS ====================
    
    /**
     * Initialize VK Bridge for cloud storage and banners
     * Only called when platform is VK
     * @returns {Promise<boolean>} - true if initialization successful
     */
    async initVKBridge() {
        // console.log('[PlaygamaSDK] 🔵 Инициализация VK Bridge...');
        
        try {
            // Check if VK Bridge is available (может быть в разных местах)
            let vkBridgeInstance = null;
            
            if (typeof window.vkBridge !== 'undefined') {
                vkBridgeInstance = window.vkBridge;
                // console.log('[PlaygamaSDK] VK Bridge найден в window.vkBridge');
            } else if (typeof window.VKBridge !== 'undefined') {
                vkBridgeInstance = window.VKBridge;
                // console.log('[PlaygamaSDK] VK Bridge найден в window.VKBridge');
            } else if (typeof vkBridge !== 'undefined') {
                vkBridgeInstance = vkBridge;
                // console.log('[PlaygamaSDK] VK Bridge найден в глобальной области');
            }
            
            if (!vkBridgeInstance) {
                console.warn('[PlaygamaSDK] ⚠️ VK Bridge SDK не найден');
                return false;
            }
            
            this.vkBridge = vkBridgeInstance;
            // console.log('[PlaygamaSDK] VK Bridge объект:', this.vkBridge);
            
            // Initialize VK Bridge
            // console.log('[PlaygamaSDK] Отправка VKWebAppInit...');
            const initResult = await this.vkBridge.send('VKWebAppInit');
            // console.log('[PlaygamaSDK] VKWebAppInit результат:', initResult);
            
            this.isVKBridgeInitialized = true;
            // console.log('[PlaygamaSDK] ✅ VK Bridge инициализирован успешно');
            
            // Тестовая проверка Storage API
            try {
                // console.log('[PlaygamaSDK] Тестовая проверка VK Storage API...');
                const testResult = await this.vkBridge.send('VKWebAppStorageGet', {
                    keys: ['_test_key']
                });
                // console.log('[PlaygamaSDK] ✅ VK Storage API доступен:', testResult);
            } catch (testError) {
                console.warn('[PlaygamaSDK] ⚠️ VK Storage API может быть недоступен:', testError);
            }
            
            return true;
            
        } catch (error) {
            console.error('[PlaygamaSDK] ❌ Ошибка инициализации VK Bridge:', error);
            this.isVKBridgeInitialized = false;
            return false;
        }
    }
    
    /**
     * Check if VK Bridge is available and initialized
     * @returns {boolean} - true if VK Bridge is ready
     */
    isVKBridgeReady() {
        return this.platform === 'vk' && this.isVKBridgeInitialized && this.vkBridge !== null;
    }
    
    /**
     * Show VK sticky banner at the bottom of the screen
     * Only works on VK platform
     * @returns {Promise<boolean>} - true if banner shown successfully
     */
    async showVKBanner() {
        // console.log('[PlaygamaSDK] 📢 Показываем VK баннер...');
        
        if (!this.isVKBridgeReady()) {
            console.warn('[PlaygamaSDK] ⚠️ VK Bridge не готов для показа баннера');
            return false;
        }
        
        try {
            await this.vkBridge.send('VKWebAppShowBannerAd', {
                banner_location: 'bottom'
            });
            
            // console.log('[PlaygamaSDK] ✅ VK баннер показан');
            return true;
            
        } catch (error) {
            console.error('[PlaygamaSDK] ❌ Ошибка показа VK баннера:', error);
            return false;
        }
    }
    
    /**
     * Hide VK sticky banner
     * Only works on VK platform
     * @returns {Promise<boolean>} - true if banner hidden successfully
     */
    async hideVKBanner() {
        // console.log('[PlaygamaSDK] 🔇 Скрываем VK баннер...');
        
        if (!this.isVKBridgeReady()) {
            console.warn('[PlaygamaSDK] ⚠️ VK Bridge не готов');
            return false;
        }
        
        try {
            await this.vkBridge.send('VKWebAppHideBannerAd');
            
            // console.log('[PlaygamaSDK] ✅ VK баннер скрыт');
            return true;
            
        } catch (error) {
            console.error('[PlaygamaSDK] ❌ Ошибка скрытия VK баннера:', error);
            return false;
        }
    }
    
    /**
     * Save data to VK Cloud Storage
     * Only works on VK platform
     * @param {string} key - Storage key
     * @param {any} value - Value to save (will be converted to string)
     * @returns {Promise<boolean>} - true if save successful
     */
    async saveToVKStorage(key, value) {
        console.log(`[PlaygamaSDK] 💾 Сохранение в VK Storage: ${key}`);
        
        if (!this.isVKBridgeReady()) {
            console.warn('[PlaygamaSDK] ⚠️ VK Bridge не готов, используем localStorage');
            localStorage.setItem(`vk_${key}`, JSON.stringify(value));
            return true;
        }
        
        // VK Storage requires string values
        // ИСПРАВЛЕНИЕ: Всегда делаем JSON.stringify, даже если value уже строка
        // Это гарантирует корректное сохранение объектов
        const stringValue = JSON.stringify(value);
        
        try {
            console.log(`[PlaygamaSDK] Отправка VKWebAppStorageSet для ключа: ${key}, длина: ${stringValue.length}`);
            
            const result = await this.vkBridge.send('VKWebAppStorageSet', {
                key: key,
                value: stringValue
            });
            
            console.log(`[PlaygamaSDK] ✅ Данные сохранены в VK Storage: ${key}, результат:`, result);
            
            // Also backup to localStorage
            localStorage.setItem(`vk_${key}`, stringValue);
            console.log(`[PlaygamaSDK] ✅ Резервная копия в localStorage: vk_${key}`);
            
            return true;
            
        } catch (error) {
            console.error(`[PlaygamaSDK] ❌ Ошибка сохранения в VK Storage (${key}):`, error);
            console.error(`[PlaygamaSDK] Детали ошибки:`, error.message, error.error_data, error.error_type, error.error_code);
            
            // Fallback to localStorage
            localStorage.setItem(`vk_${key}`, stringValue);
            // console.log(`[PlaygamaSDK] ⚠️ Использован fallback в localStorage`);
            return false;
        }
    }
    
    /**
     * Load data from VK Cloud Storage
     * Only works on VK platform
     * @param {string|string[]} keys - Storage key(s) to load
     * @returns {Promise<Object>} - Object with key-value pairs
     */
    async loadFromVKStorage(keys) {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        console.log(`[PlaygamaSDK] 📥 Загрузка из VK Storage:`, keyArray);
        
        if (!this.isVKBridgeReady()) {
            console.warn('[PlaygamaSDK] ⚠️ VK Bridge не готов, используем localStorage');
            
            const result = {};
            keyArray.forEach(key => {
                const value = localStorage.getItem(`vk_${key}`);
                if (value) {
                    try {
                        // Первая попытка парсинга
                        let parsed = JSON.parse(value);
                        
                        // ИСПРАВЛЕНИЕ: Если результат - строка, пробуем распарсить еще раз
                        if (typeof parsed === 'string') {
                            try {
                                parsed = JSON.parse(parsed);
                            } catch (e) {
                                // Если второй парсинг не удался, оставляем строку
                            }
                        }
                        
                        result[key] = parsed;
                    } catch (e) {
                        result[key] = value;
                    }
                }
            });
            
            console.log(`[PlaygamaSDK] Загружено из localStorage:`, Object.keys(result));
            return result;
        }
        
        try {
            console.log(`[PlaygamaSDK] Отправка VKWebAppStorageGet для ключей:`, keyArray);
            
            const response = await this.vkBridge.send('VKWebAppStorageGet', {
                keys: keyArray
            });
            
            console.log(`[PlaygamaSDK] Ответ VKWebAppStorageGet:`, response);
            
            // Convert response to object
            const result = {};
            if (response.keys && Array.isArray(response.keys)) {
                response.keys.forEach(item => {
                    console.log(`[PlaygamaSDK] Обработка ключа: ${item.key}, значение длиной: ${item.value ? item.value.length : 0}`);
                    
                    if (item.value) {
                        try {
                            // Первая попытка парсинга
                            let parsed = JSON.parse(item.value);
                            
                            console.log(`[PlaygamaSDK] 🔍 После первого парсинга, тип:`, typeof parsed);
                            console.log(`[PlaygamaSDK] 🔍 Количество ключей:`, typeof parsed === 'object' ? Object.keys(parsed).length : 'N/A');
                            
                            // ИСПРАВЛЕНИЕ: Если результат - строка, пробуем распарсить еще раз
                            // (на случай двойного stringify из старых сохранений)
                            if (typeof parsed === 'string') {
                                try {
                                    parsed = JSON.parse(parsed);
                                    console.log(`[PlaygamaSDK] ✅ Исправлен двойной stringify для ключа ${item.key}`);
                                } catch (e) {
                                    // Если второй парсинг не удался, оставляем строку
                                }
                            }
                            
                            result[item.key] = parsed;
                        } catch (e) {
                            console.warn(`[PlaygamaSDK] ⚠️ Не удалось распарсить JSON для ключа ${item.key}, используем как строку`);
                            result[item.key] = item.value;
                        }
                    }
                });
            }
            
            console.log(`[PlaygamaSDK] ✅ Данные загружены из VK Storage:`, Object.keys(result));
            
            return result;
            
        } catch (error) {
            console.error('[PlaygamaSDK] ❌ Ошибка загрузки из VK Storage:', error);
            
            // Fallback to localStorage
            const result = {};
            keyArray.forEach(key => {
                const value = localStorage.getItem(`vk_${key}`);
                if (value) {
                    try {
                        // Первая попытка парсинга
                        let parsed = JSON.parse(value);
                        
                        // ИСПРАВЛЕНИЕ: Если результат - строка, пробуем распарсить еще раз
                        if (typeof parsed === 'string') {
                            try {
                                parsed = JSON.parse(parsed);
                            } catch (e) {
                                // Если второй парсинг не удался, оставляем строку
                            }
                        }
                        
                        result[key] = parsed;
                    } catch (e) {
                        result[key] = value;
                    }
                }
            });
            
            // console.log(`[PlaygamaSDK] ⚠️ Использован fallback в localStorage:`, Object.keys(result));
            return result;
        }
    }
    
    /**
     * Save complete player data to VK Cloud Storage
     * Saves all data as a single JSON string to avoid flood control
     * @param {Object} updates - Object with fields to update
     * @returns {Promise<boolean>} - true if save successful
     */
    async savePlayerDataToVK(updates) {
        console.log('[PlaygamaSDK] 💾 Сохранение данных игрока в VK Cloud...');
        console.log('[PlaygamaSDK] 💾 Количество обновляемых полей:', Object.keys(updates).length);
        
        if (!this.isVKBridgeReady()) {
            console.warn('[PlaygamaSDK] ⚠️ VK Bridge не готов');
            return false;
        }
        
        try {
            // ИСПРАВЛЕНИЕ: НЕ загружаем старые данные, а просто перезаписываем
            // Это решает проблему с 4096 полями из старого формата
            
            const gameDataKey = 'fishingGameData';
            
            // Сохраняем только новые данные (без слияния со старыми)
            console.log('[PlaygamaSDK] 💾 Сохранение данных без слияния со старыми');
            console.log('[PlaygamaSDK] 💾 Количество полей для сохранения:', Object.keys(updates).length);
            
            await this.saveToVKStorage(gameDataKey, updates);
            
            console.log('[PlaygamaSDK] ✅ Данные игрока сохранены в VK Cloud');
            return true;
            
        } catch (error) {
            console.error('[PlaygamaSDK] ❌ Ошибка сохранения данных игрока в VK Cloud:', error);
            return false;
        }
    }
    
    /**
     * Load complete player data from VK Cloud Storage
     * Loads all data from a single JSON string
     * @returns {Promise<Object>} - Player data object
     */
    async loadPlayerDataFromVK() {
        console.log('[PlaygamaSDK] 📥 Загрузка данных игрока из VK Cloud...');
        
        if (!this.isVKBridgeReady()) {
            console.warn('[PlaygamaSDK] ⚠️ VK Bridge не готов');
            return {};
        }
        
        try {
            // ИСПРАВЛЕНИЕ: Загружаем все данные из ОДНОГО ключа
            const gameDataKey = 'fishingGameData';
            
            const data = await this.loadFromVKStorage([gameDataKey]);
            
            console.log('[PlaygamaSDK] 🔍 Данные из loadFromVKStorage:', data);
            console.log('[PlaygamaSDK] 🔍 Тип данных:', typeof data);
            console.log('[PlaygamaSDK] 🔍 Ключи данных:', Object.keys(data));
            
            const gameData = data[gameDataKey] || {};
            
            console.log('[PlaygamaSDK] 🔍 gameData после извлечения:', gameData);
            console.log('[PlaygamaSDK] 🔍 Тип gameData:', typeof gameData);
            console.log('[PlaygamaSDK] ✅ Данные игрока загружены из VK Cloud');
            console.log('[PlaygamaSDK] 📊 Количество полей:', Object.keys(gameData).length);
            
            return gameData;
            
        } catch (error) {
            console.error('[PlaygamaSDK] ❌ Ошибка загрузки данных игрока из VK Cloud:', error);
            return {};
        }
    }
    
    /**
     * Get player language from platform
     * @returns {string} - Language code (e.g., 'ru', 'en')
     */
    getLanguage() {
        if (!this.sdk) {
            return 'ru';
        }
        
        try {
            // Try to get language from Playgama SDK
            let lang = 'ru'; // Default fallback
            
            if (this.sdk.player && this.sdk.player.language) {
                lang = this.sdk.player.language;
            } else if (this.sdk.language) {
                lang = this.sdk.language;
            } else if (this.sdk.platform && this.sdk.platform.language) {
                lang = this.sdk.platform.language;
            }
            
            // Normalize language code (take first 2 characters)
            lang = lang.toLowerCase().substring(0, 2);
            
            // Validate against supported languages
            const supportedLanguages = ['ru', 'en', 'tr', 'de', 'es', 'fr'];
            if (!supportedLanguages.includes(lang)) {
                lang = 'ru';
            }
            
            return lang;
            
        } catch (error) {
            console.error('❌ Failed to get language:', error);
            return 'ru';
        }
    }
    
    /**
     * Save data to cloud storage with localStorage backup
     * Implements Requirements 3.1, 3.3, 3.5
     * @param {Object} data - Data to save
     * @param {boolean} flush - Whether to flush immediately (default: true)
     * @returns {Promise<boolean>} - true if save successful
     */
    async saveData(data, flush = true) {
        console.log('[PlaygamaSDK] ========== SAVEDATA ВЫЗВАН ==========');
        console.log('[PlaygamaSDK] Платформа:', this.platform);
        console.log('[PlaygamaSDK] VK Bridge готов:', this.isVKBridgeReady());
        console.log('[PlaygamaSDK] Данные для сохранения, ключей:', Object.keys(data).length);
        
        // Validate input
        if (!data || typeof data !== 'object') {
            console.warn('⚠️ Invalid data provided to saveData');
            return false;
        }
        
        // Always backup to localStorage first (Requirement 3.5)
        const localSaveSuccess = this.saveToLocalStorage(data);
        if (!localSaveSuccess) {
            console.warn('⚠️ Failed to backup to localStorage');
        } else {
            console.log('[PlaygamaSDK] ✅ Резервная копия в localStorage сохранена');
        }
        
        // VK Platform: Use VK Bridge Storage (priority over Playgama storage)
        if (this.platform === 'vk' && this.isVKBridgeReady()) {
            console.log('[PlaygamaSDK] 💾 Сохранение через VK Bridge Storage...');
            
            try {
                await this.savePlayerDataToVK(data);
                console.log('[PlaygamaSDK] ✅ Данные сохранены через VK Bridge');
                console.log('[PlaygamaSDK] ========== SAVEDATA ЗАВЕРШЕН (VK Bridge) ==========');
                return true;
            } catch (error) {
                console.error('[PlaygamaSDK] ❌ Ошибка сохранения через VK Bridge:', error);
                // Continue to Playgama storage fallback
            }
        } else {
            console.log('[PlaygamaSDK] ⚠️ VK Bridge НЕ используется. Причина:');
            console.log('[PlaygamaSDK]   - Платформа === "vk"?', this.platform === 'vk');
            console.log('[PlaygamaSDK]   - VK Bridge готов?', this.isVKBridgeReady());
        }
        
        // If SDK not available or cloud saves not supported, use localStorage only (Requirement 3.3)
        if (!this.sdk || !this.platformCapabilities.cloudSaves) {
            return localSaveSuccess;
        }
        
        try {
            // Save to cloud storage via Playgama SDK
            if (this.sdk.storage && this.sdk.storage.set) {
                // Playgama SDK expects data as object
                await this.sdk.storage.set(data, flush);
                return true;
            } else {
                console.warn('⚠️ Cloud storage API not available');
                return localSaveSuccess;
            }
            
        } catch (error) {
            // Handle cloud save errors with fallback (Requirement 3.3)
            console.error('❌ Failed to save to cloud storage:', error);
            
            // localStorage backup already done above
            return localSaveSuccess;
        }
    }
    
    /**
     * Load data from cloud storage with localStorage fallback
     * Implements Requirements 3.2, 3.3, 3.4, 3.5
     * @param {Array<string>} keys - Optional array of specific keys to load
     * @returns {Promise<Object>} - Loaded data
     */
    async loadData(keys = null) {
        // console.log('[PlaygamaSDK] ========== LOADDATA ВЫЗВАН ==========');
        // console.log('[PlaygamaSDK] Платформа:', this.platform);
        // console.log('[PlaygamaSDK] VK Bridge готов:', this.isVKBridgeReady());
        // console.log('[PlaygamaSDK] Запрошенные ключи:', keys);
        
        // VK Platform: Use VK Bridge Storage (priority over Playgama storage)
        if (this.platform === 'vk' && this.isVKBridgeReady()) {
            // console.log('[PlaygamaSDK] 📥 Загрузка через VK Bridge Storage...');
            
            try {
                const vkData = await this.loadPlayerDataFromVK();
                
                // Check if VK data is empty
                const isVKEmpty = !vkData || Object.keys(vkData).length === 0;
                
                if (isVKEmpty) {
                    // console.log('[PlaygamaSDK] ⚠️ VK Storage пуст, проверяем localStorage...');
                    
                    // Load from localStorage
                    const localData = this.loadFromLocalStorage();
                    const isLocalEmpty = !localData || Object.keys(localData).length === 0;
                    
                    if (!isLocalEmpty) {
                        // console.log('[PlaygamaSDK] 📤 Загружаем данные из localStorage в VK Storage...');
                        
                        // Upload localStorage data to VK Storage
                        try {
                            await this.savePlayerDataToVK(localData);
                            // console.log('[PlaygamaSDK] ✅ Данные из localStorage загружены в VK Storage');
                        } catch (uploadError) {
                            console.error('[PlaygamaSDK] ❌ Ошибка загрузки в VK Storage:', uploadError);
                        }
                        
                        // console.log('[PlaygamaSDK] ========== LOADDATA ЗАВЕРШЕН (localStorage -> VK) ==========');
                        return localData;
                    }
                    
                    // console.log('[PlaygamaSDK] ========== LOADDATA ЗАВЕРШЕН (пусто) ==========');
                    return {};
                }
                
                // console.log('[PlaygamaSDK] ✅ Данные загружены через VK Bridge, ключей:', Object.keys(vkData).length);
                
                // Filter by keys if specified
                if (keys && Array.isArray(keys)) {
                    const filteredData = {};
                    keys.forEach(key => {
                        if (vkData.hasOwnProperty(key)) {
                            filteredData[key] = vkData[key];
                        }
                    });
                    // console.log('[PlaygamaSDK] ========== LOADDATA ЗАВЕРШЕН (VK Bridge, filtered) ==========');
                    return filteredData;
                }
                
                // console.log('[PlaygamaSDK] ========== LOADDATA ЗАВЕРШЕН (VK Bridge) ==========');
                return vkData;
                
            } catch (error) {
                console.error('[PlaygamaSDK] ❌ Ошибка загрузки через VK Bridge:', error);
                // Fallback to localStorage on VK Bridge error
                const localData = this.loadFromLocalStorage();
                
                // Filter by keys if specified
                if (keys && Array.isArray(keys)) {
                    const filteredData = {};
                    keys.forEach(key => {
                        if (localData.hasOwnProperty(key)) {
                            filteredData[key] = localData[key];
                        }
                    });
                    return filteredData;
                }
                
                return localData;
            }
        }
        
        // If SDK not available or cloud saves not supported, use localStorage only (Requirement 3.3)
        if (!this.sdk || !this.platformCapabilities.cloudSaves) {
            const localData = this.loadFromLocalStorage();
            
            // Filter by keys if specified
            if (keys && Array.isArray(keys)) {
                const filteredData = {};
                keys.forEach(key => {
                    if (localData.hasOwnProperty(key)) {
                        filteredData[key] = localData[key];
                    }
                });
                return filteredData;
            }
            
            return localData;
        }
        
        try {
            // Load from cloud storage via Playgama SDK
            let cloudData = {};
            
            if (this.sdk.storage && this.sdk.storage.get) {
                if (keys && Array.isArray(keys)) {
                    // Load specific keys
                    cloudData = await this.sdk.storage.get(keys);
                } else {
                    // Load all data
                    cloudData = await this.sdk.storage.get();
                }
                
            } else {
                console.warn('⚠️ Cloud storage API not available');
                cloudData = {};
            }
            
            // Check if cloud data is empty (Requirement 3.4)
            const isCloudEmpty = !cloudData || Object.keys(cloudData).length === 0;
            
            if (isCloudEmpty) {
                
                // Load from localStorage (Requirement 3.3)
                const localData = this.loadFromLocalStorage();
                const isLocalEmpty = !localData || Object.keys(localData).length === 0;
                
                if (!isLocalEmpty) {
                    // Upload localStorage data to cloud (Requirement 3.4)
                    try {
                        await this.sdk.storage.set(localData, true);
                    } catch (uploadError) {
                        console.error('❌ Failed to upload localStorage data to cloud:', uploadError);
                    }
                    
                    // Return localStorage data
                    if (keys && Array.isArray(keys)) {
                        const filteredData = {};
                        keys.forEach(key => {
                            if (localData.hasOwnProperty(key)) {
                                filteredData[key] = localData[key];
                            }
                        });
                        return filteredData;
                    }
                    return localData;
                } else {
                    return {};
                }
            }
            
            // Cloud data exists, return it
            return cloudData;
            
        } catch (error) {
            // Handle cloud load errors with fallback (Requirement 3.3)
            console.error('❌ Failed to load from cloud storage:', error);
            
            const localData = this.loadFromLocalStorage();
            
            // Filter by keys if specified
            if (keys && Array.isArray(keys)) {
                const filteredData = {};
                keys.forEach(key => {
                    if (localData.hasOwnProperty(key)) {
                        filteredData[key] = localData[key];
                    }
                });
                return filteredData;
            }
            
            return localData;
        }
    }
    
    /**
     * Show fullscreen interstitial ad
     * Implements Requirements 4.1, 4.2, 4.3, 4.4, 4.5
     * @param {Object} callbacks - Callback functions { onOpen, onClose, onError }
     * @returns {Promise<boolean>} - true if ad was shown successfully
     */
    async showFullscreenAdv(callbacks = {}) {
        // Extract callbacks
        const { onOpen, onClose, onError } = callbacks;
        
        // Check SDK availability
        if (!this.sdk) {
            console.warn('⚠️ SDK not initialized');
            if (onClose) onClose(false);
            return false;
        }
        
        // Check ads API availability
        let adsAPI = this.sdk.advertisement || this.sdk.ads;
        
        if (!adsAPI) {
            console.warn('⚠️ Advertisement API not available');
            if (onClose) onClose(false);
            return false;
        }
        
        if (!adsAPI.showInterstitial) {
            console.warn('⚠️ showInterstitial method not available');
            if (onClose) onClose(false);
            return false;
        }
        
        try {
            // Mute audio before showing ad (Requirement 4.2)
            if (window.audioManager) {
                window.audioManager.muteAll();
            }
            
            // Call onOpen callback if provided
            if (onOpen) {
                onOpen();
            }
            
            // Show interstitial ad - согласно рабочему примеру, вызываем без параметров
            const result = adsAPI.showInterstitial();
            
            // Если не Promise - завершаем сразу
            if (!result || typeof result.then !== 'function') {
                if (window.audioManager) {
                    window.audioManager.unmuteAll();
                }
                if (onClose) onClose(true);
                return true;
            }
            
            // Ждем завершения рекламы
            await result;
            
            // Unmute audio after ad closes (Requirement 4.3)
            if (window.audioManager) {
                window.audioManager.unmuteAll();
            }
            
            // Call onClose callback if provided
            if (onClose) {
                onClose(true);
            }
            
            return true;
            
        } catch (error) {
            // Handle ad errors gracefully (Requirement 4.4, 4.5)
            console.error('❌ Failed to show fullscreen ad:', error);
            
            // Ensure audio is unmuted on error (Requirement 4.3)
            if (window.audioManager) {
                window.audioManager.unmuteAll();
            }
            
            // Call onError callback if provided
            if (onError) {
                onError(error);
            }
            
            // Call onClose to continue game flow
            if (onClose) {
                onClose(false);
            }
            
            return false;
        }
    }
    
    /**
     * Show rewarded video ad
     * Implements Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
     * @param {Object} callbacks - Callback functions { onOpen, onRewarded, onClose, onError }
     * @returns {Promise<Object>} - { success: boolean, rewarded: boolean, reward: Object }
     */
    async showRewardedVideo(callbacks = {}) {
        // Extract callbacks
        const { onOpen, onRewarded, onClose, onError } = callbacks;
        
        // Check SDK availability
        if (!this.sdk) {
            console.warn('⚠️ SDK not initialized');
            if (onError) {
                onError({ code: 'AD_NOT_AVAILABLE', message: 'SDK not initialized' });
            }
            if (onClose) {
                onClose(false);
            }
            return { success: false, rewarded: false };
        }
        
        // Check ads API availability
        let adsAPI = this.sdk.advertisement || this.sdk.ads;
        
        if (!adsAPI) {
            console.warn('⚠️ Advertisement API not available');
            if (onError) {
                onError({ code: 'AD_NOT_AVAILABLE', message: 'Advertisement API not available' });
            }
            if (onClose) {
                onClose(false);
            }
            return { success: false, rewarded: false };
        }
        
        // Проверяем разные варианты названия метода
        const showRewardedMethod = adsAPI.showRewardedVideo || 
                                  adsAPI.showRewarded || 
                                  adsAPI.showRewardedAd ||
                                  adsAPI.showRewardedAdvertisement;
        
        if (!showRewardedMethod) {
            console.warn('⚠️ Rewarded video method not available');
            if (onError) {
                onError({ code: 'AD_NOT_AVAILABLE', message: 'Method not available' });
            }
            if (onClose) {
                onClose(false);
            }
            return { success: false, rewarded: false };
        }
        
        try {
            // Mute audio before showing ad (Requirement 5.2)
            if (window.audioManager) {
                window.audioManager.muteAll();
            }
            
            // Call onOpen callback if provided
            if (onOpen) {
                onOpen();
            }
            
            // Show rewarded ad - согласно рабочему примеру, вызываем без параметров
            const result = showRewardedMethod.call(adsAPI);
            
            // Если не Promise - считаем что награда получена
            if (!result || typeof result.then !== 'function') {
                if (window.audioManager) {
                    window.audioManager.unmuteAll();
                }
                
                // Call onRewarded callback (Requirement 5.3)
                if (onRewarded) {
                    onRewarded();
                }
                
                if (onClose) onClose(true);
                return { success: true, rewarded: true };
            }
            
            // Ждем завершения рекламы
            await result;
            
            // Unmute audio after ad closes (Requirement 5.7)
            if (window.audioManager) {
                window.audioManager.unmuteAll();
            }
            
            // Call onRewarded callback (Requirement 5.3)
            if (onRewarded) {
                onRewarded();
            }
            
            // Call onClose callback if provided
            if (onClose) {
                onClose(true);
            }
            
            return { success: true, rewarded: true };
            
        } catch (error) {
            // Handle ad errors gracefully (Requirement 5.8)
            console.error('❌ Failed to show rewarded ad:', error);
            
            // Ensure audio is unmuted on error (Requirement 5.7)
            if (window.audioManager) {
                window.audioManager.unmuteAll();
            }
            
            // Call onError callback if provided
            if (onError) {
                onError(error);
            }
            
            // Call onClose to continue game flow
            if (onClose) {
                onClose(false);
            }
            
            return { success: false, rewarded: false };
        }
    }
    
    /**
     * Load IAP catalog from Playgama SDK
     * Maps platform product IDs to internal product IDs
     * Implements Requirements 6.1, 6.2
     * @returns {Promise<Array>} - Array of catalog products
     */
    async loadCatalog() {
        
        // Check if platform supports payments
        if (!this.isPlatformSupportsIAP()) {
            this.catalog = [];
            this.catalogMap.clear();
            return [];
        }
        
        // Check if SDK is available
        if (!this.sdk || !this.sdk.payments) {
            console.warn('⚠️ Payments API not available');
            this.catalog = [];
            this.catalogMap.clear();
            return [];
        }
        
        try {
            // Load catalog from Playgama SDK (Requirement 6.1)
            const platformCatalog = await this.sdk.payments.getCatalog();
            
            if (!platformCatalog || platformCatalog.length === 0) {
                this.catalog = [];
                this.catalogMap.clear();
                return [];
            }
            
            
            // Map platform products to internal products (Requirement 6.2)
            const mappedCatalog = [];
            
            for (const platformProduct of platformCatalog) {
                // Get internal product ID from platform product ID
                const internalId = this.getInternalProductId(platformProduct.id);
                
                if (!internalId) {
                    console.warn(`⚠️ No internal mapping found for platform product: ${platformProduct.id}`);
                    continue;
                }
                
                // Create mapped product with both IDs
                const mappedProduct = {
                    // Internal ID
                    id: internalId,
                    
                    // Platform ID
                    platformId: platformProduct.id,
                    
                    // Product information from platform
                    title: platformProduct.title || platformProduct.name || internalId,
                    description: platformProduct.description || '',
                    imageURI: platformProduct.imageURI || platformProduct.image || '',
                    
                    // Pricing information
                    price: platformProduct.price || '0',
                    priceValue: platformProduct.priceValue || 0,
                    priceCurrencyCode: platformProduct.priceCurrencyCode || platformProduct.currency || 'RUB',
                    
                    // Original platform product for reference
                    platformProduct: platformProduct
                };
                
                mappedCatalog.push(mappedProduct);
                
                // Add to quick lookup map (Requirement 6.2)
                this.catalogMap.set(internalId, mappedProduct);
                
            }
            
            // Store catalog
            this.catalog = mappedCatalog;
            
            
            // Trigger payments ready callbacks
            this.onPaymentsReadyCallbacks.forEach(callback => callback(this.sdk));
            
            return mappedCatalog;
            
        } catch (error) {
            console.error('❌ Failed to load IAP catalog:', error);
            this.catalog = [];
            this.catalogMap.clear();
            return [];
        }
    }
    
    /**
     * Purchase a product via IAP
     * Maps internal product ID to platform ID and initiates purchase
     * Implements Requirements 6.3, 6.4
     * @param {string} productID - Internal product ID
     * @param {string} developerPayload - Optional developer payload
     * @returns {Promise<Object>} - { success: boolean, error: string, purchase: Object }
     */
    async purchase(productID, developerPayload = '') {
        
        // Check if platform supports payments
        if (!this.isPlatformSupportsIAP()) {
            return { 
                success: false, 
                error: 'IAP_NOT_AVAILABLE',
                fallback: true // Indicate that premium currency fallback should be used
            };
        }
        
        // Check if SDK is available
        if (!this.sdk || !this.sdk.payments) {
            console.warn('⚠️ Payments API not available');
            return { 
                success: false, 
                error: 'PAYMENTS_NOT_AVAILABLE',
                fallback: true
            };
        }
        
        try {
            // Map internal product ID to platform product ID (Requirement 6.3)
            const platformProductId = this.getPlatformProductId(productID);
            
            if (!platformProductId) {
                console.error(`❌ No platform mapping found for product: ${productID}`);
                return { 
                    success: false, 
                    error: 'PRODUCT_NOT_FOUND',
                    fallback: true
                };
            }
            
            
            // Initiate purchase through Playgama SDK (Requirement 6.3)
            const purchaseResult = await this.sdk.payments.purchase({
                productId: platformProductId,
                developerPayload: developerPayload
            });
            
            // Check if purchase was successful
            if (!purchaseResult || !purchaseResult.signature) {
                console.warn('⚠️ Purchase completed but no signature received');
                return {
                    success: false,
                    error: 'PURCHASE_FAILED'
                };
            }
            
            // Log successful purchase
            console.log('[Purchase] Purchase successful:', {
                productId: purchaseResult.productId,
                purchaseToken: purchaseResult.purchaseToken
            });
            
            // Grant items to player (Requirement 6.4)
            // Note: Item granting is handled by the game code after this method returns
            // This method just returns the purchase result
            
            return {
                success: true,
                purchase: {
                    productId: productID, // Return internal ID
                    platformProductId: platformProductId,
                    purchaseToken: purchaseResult.purchaseToken,
                    signature: purchaseResult.signature,
                    developerPayload: purchaseResult.developerPayload || developerPayload
                }
            };
            
        } catch (error) {
            // Handle different error types (Requirement 6.3)
            console.error('❌ Purchase failed:', error);
            
            // User cancelled purchase
            if (error.code === 'USER_CANCELLED' || error.code === 'PURCHASE_CANCELLED') {
                return {
                    success: false,
                    error: 'USER_CANCELLED'
                };
            }
            
            // Payment not available
            if (error.code === 'PAYMENT_NOT_AVAILABLE' || error.code === 'PAYMENTS_NOT_AVAILABLE') {
                return {
                    success: false,
                    error: 'PAYMENT_NOT_AVAILABLE',
                    fallback: true
                };
            }
            
            // Product not found
            if (error.code === 'PRODUCT_NOT_FOUND') {
                console.error('❌ Product not found in platform catalog');
                return {
                    success: false,
                    error: 'PRODUCT_NOT_FOUND',
                    fallback: true
                };
            }
            
            // Already owned (shouldn't happen for consumables, but handle it)
            if (error.code === 'ALREADY_OWNED') {
                return {
                    success: false,
                    error: 'ALREADY_OWNED'
                };
            }
            
            // Generic error
            return {
                success: false,
                error: error.code || 'PURCHASE_FAILED',
                message: error.message
            };
        }
    }
    
    /**
     * Consume a purchase (for consumable products)
     * Implements Requirement 6.5
     * @param {string} purchaseToken - Purchase token from purchase result
     * @returns {Promise<boolean>} - true if consumption successful
     */
    async consumePurchase(purchaseToken) {
        
        // Check if platform supports payments
        if (!this.isPlatformSupportsIAP()) {
            return false;
        }
        
        // Check if SDK is available
        if (!this.sdk || !this.sdk.payments) {
            console.warn('⚠️ Payments API not available');
            return false;
        }
        
        // Validate purchase token
        if (!purchaseToken || typeof purchaseToken !== 'string') {
            console.error('❌ Invalid purchase token provided');
            return false;
        }
        
        try {
            // Consume purchase through Playgama SDK (Requirement 6.5)
            await this.sdk.payments.consumePurchase(purchaseToken);
            
            return true;
            
        } catch (error) {
            // Handle consumption errors (Requirement 6.5)
            console.error('❌ Failed to consume purchase:', error);
            
            // Log specific error codes
            if (error.code === 'PURCHASE_NOT_FOUND') {
                console.error('❌ Purchase not found or already consumed');
            } else if (error.code === 'INVALID_PURCHASE_TOKEN') {
                console.error('❌ Invalid purchase token');
            } else {
                console.error('❌ Consumption error:', error.code || error.message);
            }
            
            return false;
        }
    }
    
    /**
     * Get list of purchases from platform
     * Implements Requirement 6.6
     * @returns {Promise<Array>} - Array of purchase objects
     */
    async getPurchases() {
        
        // Check if platform supports payments
        if (!this.isPlatformSupportsIAP()) {
            return [];
        }
        
        // Check if SDK is available
        if (!this.sdk || !this.sdk.payments) {
            console.warn('⚠️ Payments API not available');
            return [];
        }
        
        try {
            // Get purchases from Playgama SDK (Requirement 6.6)
            const purchases = await this.sdk.payments.getPurchases();
            
            if (!purchases || purchases.length === 0) {
                return [];
            }
            
            
            // Map platform product IDs to internal IDs
            const mappedPurchases = purchases.map(purchase => {
                const internalId = this.getInternalProductId(purchase.productId);
                
                return {
                    productId: internalId || purchase.productId,
                    platformProductId: purchase.productId,
                    purchaseToken: purchase.purchaseToken,
                    signature: purchase.signature,
                    developerPayload: purchase.developerPayload || ''
                };
            });
            
            return mappedPurchases;
            
        } catch (error) {
            console.error('❌ Failed to get purchases:', error);
            return [];
        }
    }
    
    /**
     * Get product information by internal product ID
     * Implements Requirement 6.1
     * @param {string} productID - Internal product ID
     * @returns {Object|null} - Product information or null if not found
     */
    getProductInfo(productID) {
        // Look up product in catalog map
        const product = this.catalogMap.get(productID);
        
        if (!product) {
            console.warn(`⚠️ Product not found in catalog: ${productID}`);
            return null;
        }
        
        return product;
    }
    
    /**
     * Get full IAP catalog
     * Implements Requirement 6.1
     * @returns {Array} - Array of all catalog products
     */
    getCatalog() {
        return this.catalog;
    }
    
    /**
     * Purchase a product using premium currency (fallback for platforms without IAP)
     * Implements Requirements 7.2, 7.3, 7.4
     * @param {string} productID - Internal product ID
     * @param {Object} playerData - Player data object with premiumCoins balance
     * @returns {Promise<Object>} - { success: boolean, error: string, grantedItems: Object }
     */
    async purchaseWithPremiumCurrency(productID, playerData) {
        
        // Validate inputs
        if (!productID || typeof productID !== 'string') {
            console.error('❌ Invalid product ID provided');
            return { 
                success: false, 
                error: 'INVALID_PRODUCT_ID' 
            };
        }
        
        if (!playerData || typeof playerData !== 'object') {
            console.error('❌ Invalid player data provided');
            return { 
                success: false, 
                error: 'INVALID_PLAYER_DATA' 
            };
        }
        
        // Get fallback price for this product (Requirement 7.1)
        const price = this.getPremiumCurrencyPrice(productID);
        
        if (price <= 0) {
            console.error(`❌ No fallback price found for product: ${productID}`);
            return { 
                success: false, 
                error: 'PRODUCT_NOT_FOUND' 
            };
        }
        
        
        // Check player's premium currency balance (Requirement 7.3)
        const playerBalance = playerData.premiumCoins || 0;
        
        if (playerBalance < price) {
            console.warn(`❌ Insufficient premium currency: has ${playerBalance}, needs ${price}`);
            return { 
                success: false, 
                error: 'INSUFFICIENT_PREMIUM_CURRENCY',
                required: price,
                current: playerBalance
            };
        }
        
        // Get product mapping to determine what items to grant
        const mapping = this.productMapping.get(productID);
        
        if (!mapping) {
            console.error(`❌ No product mapping found for: ${productID}`);
            return { 
                success: false, 
                error: 'PRODUCT_NOT_FOUND' 
            };
        }
        
        try {
            // Deduct premium currency from player balance (Requirement 7.2)
            playerData.premiumCoins -= price;
            
            // Determine what items to grant based on product type
            // This will be handled by the game code, but we return the product info
            const grantedItems = {
                productId: productID,
                price: price,
                paidWith: 'premium_currency'
            };
            
            
            // Note: Saving data is handled by game code after this method returns (Requirement 7.4)
            // Game code should:
            // 1. Grant items based on product contents
            // 2. Call saveData() to persist changes
            
            return {
                success: true,
                grantedItems: grantedItems,
                newBalance: playerData.premiumCoins
            };
            
        } catch (error) {
            console.error('❌ Failed to process premium currency purchase:', error);
            
            // Rollback the deduction if something went wrong
            playerData.premiumCoins += price;
            
            return {
                success: false,
                error: 'PURCHASE_FAILED',
                message: error.message
            };
        }
    }
    
    /**
     * Submit score to platform leaderboard
     * Implements Requirements 8.1, 8.3
     * @param {string} leaderboardName - Name of the leaderboard
     * @param {number} score - Player's score to submit
     * @param {string} extraData - Optional extra data to attach to the score
     * @returns {Promise<boolean>} - true if score was submitted successfully
     */
    async setLeaderboardScore(leaderboardName, score, extraData = '') {
        
        // Validate inputs
        if (!leaderboardName || typeof leaderboardName !== 'string') {
            console.error('❌ Invalid leaderboard name provided');
            return false;
        }
        
        if (typeof score !== 'number' || score < 0) {
            console.error('❌ Invalid score provided');
            return false;
        }
        
        // Check if platform supports leaderboards (Requirement 8.1)
        if (!this.platformCapabilities.leaderboards) {
            return false;
        }
        
        // Check if SDK is available
        if (!this.sdk || !this.sdk.leaderboard) {
            console.warn('⚠️ Leaderboard API not available');
            return false;
        }
        
        try {
            // Submit score to platform leaderboard (Requirement 8.1)
            await this.sdk.leaderboard.setScore({
                leaderboardName: leaderboardName,
                score: score,
                extraData: extraData
            });
            
            return true;
            
        } catch (error) {
            // Handle errors gracefully (Requirement 8.3)
            console.error('❌ Failed to submit score to leaderboard:', error);
            
            // Log specific error codes for debugging
            if (error.code === 'LEADERBOARD_NOT_FOUND') {
                console.error('❌ Leaderboard not found:', leaderboardName);
            } else if (error.code === 'INVALID_SCORE') {
                console.error('❌ Invalid score value:', score);
            } else if (error.code === 'LEADERBOARD_NOT_AVAILABLE') {
                console.error('❌ Leaderboard service not available');
            } else {
                console.error('❌ Leaderboard error:', error.code || error.message);
            }
            
            // Return false but don't throw - graceful degradation (Requirement 8.3)
            return false;
        }
    }
    
    /**
     * Get leaderboard entries (top players and player position)
     * Implements Requirement 8.2
     * @param {string} leaderboardName - Name of the leaderboard
     * @param {Object} options - Options for fetching entries
     *   - topPlayersCount: number of top players to fetch (default: 10)
     *   - includeUser: whether to include current player's entry (default: true)
     *   - quantityAround: number of players around current player (default: 5)
     *   - quantityTop: number of top players (default: 10)
     * @returns {Promise<Object|null>} - Leaderboard data or null if error
     */
    async getLeaderboardEntries(leaderboardName, options = {}) {
        
        // Validate inputs
        if (!leaderboardName || typeof leaderboardName !== 'string') {
            console.error('❌ Invalid leaderboard name provided');
            return null;
        }
        
        // Check if platform supports leaderboards
        if (!this.platformCapabilities.leaderboards) {
            return null;
        }
        
        // Check if SDK is available
        if (!this.sdk || !this.sdk.leaderboard) {
            console.warn('⚠️ Leaderboard API not available');
            return null;
        }
        
        try {
            // Set default options
            const fetchOptions = {
                leaderboardName: leaderboardName,
                includeUser: options.includeUser !== false, // Default true
                quantityAround: options.quantityAround || 5,
                quantityTop: options.quantityTop || 10
            };
            
            // Fetch leaderboard entries from Playgama SDK (Requirement 8.2)
            const leaderboardData = await this.sdk.leaderboard.getEntries(fetchOptions);
            
            if (!leaderboardData) {
                return null;
            }
            
            // Parse and format the response
            const result = {
                leaderboardName: leaderboardName,
                
                // Top players list
                topPlayers: leaderboardData.topPlayers || leaderboardData.entries || [],
                
                // Current player's entry
                playerEntry: leaderboardData.userRank || leaderboardData.playerEntry || null,
                
                // Players around current player
                aroundPlayer: leaderboardData.aroundPlayer || [],
                
                // Total number of entries in leaderboard
                totalEntries: leaderboardData.totalEntries || 0
            };
            
            
            return result;
            
        } catch (error) {
            // Handle errors gracefully (Requirement 8.2)
            console.error('❌ Failed to fetch leaderboard entries:', error);
            
            // Log specific error codes for debugging
            if (error.code === 'LEADERBOARD_NOT_FOUND') {
                console.error('❌ Leaderboard not found:', leaderboardName);
            } else if (error.code === 'LEADERBOARD_NOT_AVAILABLE') {
                console.error('❌ Leaderboard service not available');
            } else if (error.code === 'PLAYER_NOT_FOUND') {
                console.error('❌ Player not found in leaderboard');
            } else {
                console.error('❌ Leaderboard error:', error.code || error.message);
            }
            
            // Return null but don't throw - graceful degradation
            return null;
        }
    }
    
    /**
     * Get current player's entry in leaderboard
     * Implements Requirement 8.2
     * @param {string} leaderboardName - Name of the leaderboard
     * @returns {Promise<Object|null>} - Player's leaderboard entry or null if not found/error
     */
    async getPlayerLeaderboardEntry(leaderboardName) {
        
        // Validate inputs
        if (!leaderboardName || typeof leaderboardName !== 'string') {
            console.error('❌ Invalid leaderboard name provided');
            return null;
        }
        
        // Check if platform supports leaderboards
        if (!this.platformCapabilities.leaderboards) {
            return null;
        }
        
        // Check if SDK is available
        if (!this.sdk || !this.sdk.leaderboard) {
            console.warn('⚠️ Leaderboard API not available');
            return null;
        }
        
        try {
            // Fetch player's entry from Playgama SDK (Requirement 8.2)
            const playerEntry = await this.sdk.leaderboard.getPlayerEntry({
                leaderboardName: leaderboardName
            });
            
            if (!playerEntry) {
                return null;
            }
            
            // Format the player entry
            const result = {
                leaderboardName: leaderboardName,
                rank: playerEntry.rank || playerEntry.position || 0,
                score: playerEntry.score || 0,
                extraData: playerEntry.extraData || '',
                player: {
                    id: playerEntry.playerId || playerEntry.id || '',
                    name: playerEntry.playerName || playerEntry.name || '',
                    photo: playerEntry.playerPhoto || playerEntry.photo || ''
                }
            };
            
            
            return result;
            
        } catch (error) {
            // Handle errors gracefully (Requirement 8.2)
            console.error('❌ Failed to fetch player leaderboard entry:', error);
            
            // Log specific error codes for debugging
            if (error.code === 'LEADERBOARD_NOT_FOUND') {
                console.error('❌ Leaderboard not found:', leaderboardName);
            } else if (error.code === 'PLAYER_NOT_FOUND') {
                // This is expected if player hasn't submitted a score yet
            } else if (error.code === 'LEADERBOARD_NOT_AVAILABLE') {
                console.error('❌ Leaderboard service not available');
            } else {
                console.error('❌ Leaderboard error:', error.code || error.message);
            }
            
            // Return null but don't throw - graceful degradation
            return null;
        }
    }
    
    /**
     * Setup event handlers for platform pause/resume events
     * Manages audio muting/unmuting when ads are shown or game loses focus
     */
    setupEventHandlers() {
        if (!this.sdk) {
            return;
        }
        
        try {
            // Listen for platform pause events (ad opening, game losing focus)
            if (this.sdk.on) {
                this.sdk.on('pause', () => {
                    if (window.audioManager) {
                        window.audioManager.muteAll();
                    }
                });
                
                // Listen for platform resume events (ad closing, game regaining focus)
                this.sdk.on('resume', () => {
                    if (window.audioManager) {
                        window.audioManager.unmuteAll();
                    }
                });
                
            } else {
            }
        } catch (error) {
            console.error('❌ Failed to setup event handlers:', error);
        }
    }
    
    /**
     * Save data to localStorage with error handling
     * Handles JSON serialization errors gracefully
     * @param {Object} data - Data to save
     * @returns {boolean} - true if save successful
     */
    saveToLocalStorage(data) {
        try {
            // Validate input
            if (!data || typeof data !== 'object') {
                console.warn('⚠️ Invalid data provided to saveToLocalStorage');
                return false;
            }
            
            // Load existing data
            const existingData = JSON.parse(localStorage.getItem('gameData') || '{}');
            
            // Merge with new data
            const mergedData = { ...existingData, ...data };
            
            // Add timestamp
            mergedData.lastSaveTime = Date.now();
            
            // Serialize to JSON
            const jsonString = JSON.stringify(mergedData);
            
            // Save to localStorage
            localStorage.setItem('gameData', jsonString);
            
            return true;
            
        } catch (error) {
            // Handle JSON serialization errors
            if (error instanceof TypeError) {
                console.error('❌ Failed to serialize data to JSON:', error);
            } else if (error.name === 'QuotaExceededError') {
                console.error('❌ localStorage quota exceeded:', error);
            } else {
                console.error('❌ Failed to save to localStorage:', error);
            }
            return false;
        }
    }
    
    /**
     * Load data from localStorage with error handling
     * Handles JSON parsing errors gracefully
     * @returns {Object} - Loaded data or empty object if error
     */
    loadFromLocalStorage() {
        try {
            // Get data from localStorage
            const jsonString = localStorage.getItem('gameData');
            
            // Return empty object if no data
            if (!jsonString) {
                return {};
            }
            
            // Parse JSON
            const data = JSON.parse(jsonString);
            
            return data;
            
        } catch (error) {
            // Handle JSON parsing errors
            if (error instanceof SyntaxError) {
                console.error('❌ Failed to parse localStorage data (corrupted JSON):', error);
                // Clear corrupted data
                try {
                    localStorage.removeItem('gameData');
                } catch (clearError) {
                    console.error('❌ Failed to clear corrupted data:', clearError);
                }
            } else {
                console.error('❌ Failed to load from localStorage:', error);
            }
            return {};
        }
    }
    
    onInit(callback) {
        if (this.isInitialized) {
            callback(this.sdk);
        } else {
            this.onInitCallbacks.push(callback);
        }
    }
    
    onPlayerReady(callback) {
        if (this.isInitialized) {
            callback(this.sdk);
        } else {
            this.onPlayerReadyCallbacks.push(callback);
        }
    }
    
    onPaymentsReady(callback) {
        if (this.platformCapabilities.payments) {
            callback(this.sdk);
        } else {
            this.onPaymentsReadyCallbacks.push(callback);
        }
    }
    
    /**
     * Check for unprocessed purchases at game start
     * Grants items for any purchases that weren't processed
     * Implements Requirement 6.6
     * @returns {Promise<Array>} - Array of unprocessed purchases
     */
    async checkUnprocessedPurchases() {
        
        // Check if platform supports payments
        if (!this.isPlatformSupportsIAP()) {
            return [];
        }
        
        try {
            // Get all purchases (Requirement 6.6)
            const purchases = await this.getPurchases();
            
            if (purchases.length === 0) {
                return [];
            }
            
            
            // Return purchases for game code to process
            // Game code should:
            // 1. Grant items for each purchase
            // 2. Call consumePurchase() for each purchase token
            // 3. Save game data
            
            return purchases;
            
        } catch (error) {
            console.error('❌ Failed to check unprocessed purchases:', error);
            return [];
        }
    }
    
    /**
     * Exchange premium currency for regular currency
     * Implements Requirements 10.1, 10.2, 10.3, 10.4, 10.5
     * @param {number} premiumAmount - Amount of premium currency to exchange
     * @param {Object} playerData - Player data object with currency balances
     * @returns {Promise<Object>} - { success: boolean, error: string, newBalances: Object }
     */
    async exchangeCurrency(premiumAmount, playerData) {
        
        // Validate inputs
        if (!premiumAmount || typeof premiumAmount !== 'number' || premiumAmount <= 0) {
            console.error('❌ Invalid premium amount provided');
            return { 
                success: false, 
                error: 'INVALID_AMOUNT' 
            };
        }
        
        if (!playerData || typeof playerData !== 'object') {
            console.error('❌ Invalid player data provided');
            return { 
                success: false, 
                error: 'INVALID_PLAYER_DATA' 
            };
        }
        
        // Check player's premium currency balance (Requirement 10.3)
        const playerPremiumBalance = playerData.premiumCoins || 0;
        
        if (playerPremiumBalance < premiumAmount) {
            console.warn(`❌ Insufficient premium currency: has ${playerPremiumBalance}, needs ${premiumAmount}`);
            return { 
                success: false, 
                error: 'INSUFFICIENT_PREMIUM_CURRENCY',
                required: premiumAmount,
                current: playerPremiumBalance
            };
        }
        
        try {
            // Convert at fixed rate 1:12 (Requirement 10.1)
            const EXCHANGE_RATE = 12;
            const regularAmount = premiumAmount * EXCHANGE_RATE;
            
            
            // Deduct premium currency (Requirement 10.2)
            playerData.premiumCoins -= premiumAmount;
            
            // Add regular currency (Requirement 10.2)
            playerData.coins = (playerData.coins || 0) + regularAmount;
            
            // Save data (Requirement 10.4)
            const saveSuccess = await this.saveData(playerData);
            
            if (!saveSuccess) {
                console.warn('⚠️ Failed to save data after currency exchange');
                // Rollback the exchange
                playerData.premiumCoins += premiumAmount;
                playerData.coins -= regularAmount;
                
                return {
                    success: false,
                    error: 'SAVE_FAILED'
                };
            }
            
            
            return {
                success: true,
                exchanged: {
                    premium: premiumAmount,
                    regular: regularAmount,
                    rate: EXCHANGE_RATE
                },
                newBalances: {
                    premiumCoins: playerData.premiumCoins,
                    regularCoins: playerData.coins
                }
            };
            
        } catch (error) {
            console.error('❌ Failed to process currency exchange:', error);
            
            // Attempt to rollback if balances were modified
            // This is a safety measure in case save failed after balance update
            return {
                success: false,
                error: 'EXCHANGE_FAILED',
                message: error.message
            };
        }
    }
}

// Create global instance
// console.log('[PlaygamaSDK] Creating global instance...');
// console.log('[PlaygamaSDK] Checking available global objects:');
// console.log('[PlaygamaSDK] - window.Playgama:', typeof window.Playgama);
// console.log('[PlaygamaSDK] - window.playgama:', typeof window.playgama);
// console.log('[PlaygamaSDK] - window.PlaygamaSDK:', typeof window.PlaygamaSDK);
// console.log('[PlaygamaSDK] - window.SDK:', typeof window.SDK);
// console.log('[PlaygamaSDK] - window.PG:', typeof window.PG);
// console.log('[PlaygamaSDK] - window.Bridge:', typeof window.Bridge);
// console.log('[PlaygamaSDK] - window.pg:', typeof window.pg);
// console.log('[PlaygamaSDK] - window.PLAYGAMA:', typeof window.PLAYGAMA);

// Log ALL window properties that might be SDK-related
// const allKeys = Object.keys(window);
// const sdkRelated = allKeys.filter(k => 
//     k.toLowerCase().includes('play') || 
//     k.toLowerCase().includes('game') || 
//     k.toLowerCase().includes('sdk') ||
//     k.toLowerCase().includes('bridge') ||
//     k.toLowerCase().includes('pg')
// );
// console.log('[PlaygamaSDK] All SDK-related window keys:', sdkRelated);

window.playgamaSDK = new PlaygamaSDKManager();

// console.log('[PlaygamaSDK] Global instance created:', window.playgamaSDK);
// console.log('[PlaygamaSDK] Ready for initialization');


// Добавляем функцию для очистки VK Storage (для отладки)
window.clearVKStorage = async function() {
    console.log('=== ОЧИСТКА VK STORAGE ===');
    console.warn('⚠️ ВНИМАНИЕ: Это удалит ВСЕ данные из VK Cloud Storage!');
    
    if (!window.playgamaSDK || !window.playgamaSDK.vkBridge) {
        console.error('❌ VK Bridge не найден');
        return;
    }
    
    try {
        console.log('🗑️ Удаление ключа: fishingGameData');
        
        await window.playgamaSDK.vkBridge.send('VKWebAppStorageSet', {
            key: 'fishingGameData',
            value: ''
        });
        
        console.log('✅ VK Storage очищен');
        console.log('💡 Обновите страницу для загрузки данных из localStorage');
        
    } catch (error) {
        console.error('❌ Ошибка очистки VK Storage:', error);
    }
};

console.log('💡 Функция clearVKStorage() доступна в консоли');
