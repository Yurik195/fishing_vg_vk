class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Инициализация облачной загрузки ассетов
        this.loadingIndicator = new LoadingIndicator();
        assetManager.initCloudLoader('https://storage.yandexcloud.net/vet-fishing/');
        console.log('☁️ Облачная загрузка инициализирована');
        
        this.scaleManager = new ScaleManager(this.canvas, CONFIG);
        this.audioManager = new AudioManager();
        this.inputManager = new InputManager(this.canvas, this.scaleManager);
        
        this.canvas.addEventListener('click', () => {
            this.audioManager.init();
        }, { once: true });
        
        // Текущий экран ('home', 'fishing', 'shop', 'map', 'collection', 'market')
        this.currentScreen = 'home';
        
        // Флаг инициализации SDK
        this.sdkInitialized = false;
        
        // Время начала игры для проверки фуллскрин рекламы
        this.gameStartTime = Date.now();
        
        // Таймер для fullscreen рекламы (не сохраняется)
        this.lastFullscreenAdTime = 0;
        this.fullscreenAdCooldown = 90000; // 90 секунд
        this.firstFishingVisit = true; // Флаг первого входа в рыбалку
        
        // Последнее время суток для отслеживания изменений
        this.lastTimeOfDay = null;
        
        // Debounce для сохранения (не сохраняем чаще чем раз в 3 секунды)
        this.saveDebounceTimer = null;
        this.saveDebounceDelay = 3000;
        
        // Инициализация систем
        this.collectionSystem = new CollectionSystem();
        this.marketSystem = new MarketSystem();
        this.profileSystem = new ProfileSystem();
        
        // Делаем profileSystem доступной глобально для FishingGame и HomeScreen
        window.game = this;
        window.profileSystem = this.profileSystem;
        
        // Создаем систему заданий после загрузки всех данных
        window.questSystem = new QuestSystem();
        console.log('[Game] QuestSystem создана, FISH_DATABASE:', window.FISH_DATABASE ? window.FISH_DATABASE.length : 'не загружена');
        
        // Инициализируем систему заданий (загружаем прогресс и генерируем задания)
        window.questSystem.init();
        
        // Создаем систему ежедневных наград
        window.dailyRewardsSystem = new DailyRewardsSystem();
        console.log('[Game] DailyRewardsSystem создана');
        
        // Инициализация экранов
        this.homeScreen = new HomeScreen(this.canvas, (screen) => this.navigateTo(screen), this.audioManager);
        this.fishingGame = new FishingGame(this.canvas, this.inputManager, () => this.navigateTo('home'));
        
        // Создаем дебаг панель
        this.debugPanel = new DebugPanel(this);
        
        // Создаем кастомный курсор
        this.customCursor = new CustomCursor();
        console.log('👆 CustomCursor создан (клавиша "З" для переключения)');
        
        // Передаем audioManager в FishingGame
        this.fishingGame.setAudioManager(this.audioManager);
        console.log('🔊 AudioManager передан в FishingGame');
        
        // Загружаем все звуки
        this.loadSounds();
        
        // Инициализируем currentZone если не установлена
        if (!this.fishingGame.currentZone) {
            this.fishingGame.currentZone = this.fishingGame.unlockedZones?.[0] || 1;
            console.log('[Game] Установлена начальная currentZone:', this.fishingGame.currentZone);
        }
        
        this.shopUI = new ShopUI(this.canvas, this.fishingGame.gearInventory, this.audioManager);
        this.inventoryUI = new InventoryUI(this.canvas, this.fishingGame.gearInventory, this.audioManager);
        this.collectionUI = new CollectionUI(this.canvas, this.collectionSystem, this.audioManager);
        this.marketUI = new MarketUI(this.canvas, this.marketSystem, this.audioManager);
        this.questUI = new QuestUI(this.canvas, this.audioManager);
        this.profileUI = new ProfileUI(this.canvas, this.profileSystem, this.audioManager);
        this.settingsUI = new SettingsUI(this.canvas, this.audioManager);
        this.dailyRewardsUI = new DailyRewardsUI(this.canvas, window.dailyRewardsSystem, this.audioManager);
        
        // Создаем систему рейтинга
        this.ratingSystem = new RatingSystem();
        this.ratingUI = new RatingUI(this.canvas, this.ratingSystem, this.profileSystem, this.audioManager);
        
        // Создаем систему трофеев
        this.trophySystem = new TrophySystem();
        this.trophyUI = new TrophyUI(this.canvas, this.trophySystem, this.audioManager);
        
        // Создаем систему дня и ночи
        this.dayNightSystem = new DayNightSystem();
        this.dayNightUI = new DayNightUI(this.dayNightSystem);
        console.log('[Game] DayNightSystem создана');
        
        // Создаем систему подсказок перед рыбалкой
        this.fishingTipsSystem = new FishingTipsSystem();
        this.fishingTipsUI = new FishingTipsUI(this.canvas, this.fishingTipsSystem, this.fishingGame, this.audioManager, this);
        console.log('[Game] FishingTipsSystem создана');
        
        this.mapScreen = null; // Создается при первом открытии
        
        // Передаем систему коллекции в игру
        this.fishingGame.collectionSystem = this.collectionSystem;
        
        // Передаем менеджер премиум эффектов в магазин
        this.shopUI.premiumEffects = this.fishingGame.premiumEffects;
        
        // Настройка обработчика покупок
        this.shopUI.onBuy = async (type, item, extra) => {
            // Обработка IAP покупок за реальные деньги
            if (item.currency === 'iap' || item.isIAP) {
                if (item.type === 'exchange') {
                    // Обмен валюты уже выполнен в ShopUI, просто синхронизируем
                    this.fishingGame.coins = this.shopUI.playerCoins;
                    this.fishingGame.premiumCoins = this.shopUI.playerPremiumCoins;
                    
                    console.log(`✅ Обмен выполнен! Баланс: ${this.fishingGame.coins} 💰, ${this.fishingGame.premiumCoins} 💎`);
                    return;
                }
                
                // Покупка через Yandex SDK
                await this.handleIAPPurchase(item);
                return;
            }
            
            // Списываем деньги для обычных покупок
            if (item.isPremium) {
                this.fishingGame.premiumCoins -= item.price;
                console.log(`Куплено: ${item.name} за ${item.price}💎`);
            } else if (item.currency === 'gems') {
                // Товары за гемы (премиум валюта)
                this.fishingGame.premiumCoins -= item.price;
                console.log(`Куплено: ${item.name} за ${item.price}💎`);
            } else {
                // Обычные товары за монеты
                this.fishingGame.coins -= item.price;
                console.log(`Куплено: ${item.name} за ${item.price}💰`);
            }
        };
        
        // Настройка обработчиков инвентаря
        this.inventoryUI.onEquip = (type, item, equipped) => {
            console.log(`${equipped ? 'Экипировано' : 'Снято'}: ${item.name}`);
            // Синхронизируем с игровым процессом
            if (this.fishingGame) {
                if (equipped) {
                    this.fishingGame.gearInventory.equipGear(type, item.tier);
                } else {
                    // Снимаем снасть
                    this.fishingGame.gearInventory.equipped[type] = null;
                    this.fishingGame.gearInventory.saveToStorage();
                }
            }
        };
        
        this.inventoryUI.onRepair = (type, item, price) => {
            this.fishingGame.coins -= price;
            console.log(`Отремонтировано: ${item.name} за ${price}💰`);
        };
        
        this.inventoryUI.onSell = (type, item, price) => {
            this.fishingGame.coins += price;
            console.log(`Продано: ${item.name} за ${price}💰`);
        };
        
        this.inventoryUI.onUpgradeKeepnet = (capacity, level, price) => {
            this.fishingGame.coins -= price;
            this.fishingGame.keepnetCapacity = capacity;
            this.fishingGame.keepnetUpgradeLevel = level;
            console.log(`Садок улучшен до уровня ${level}, вместимость: ${capacity}`);
        };
        
        // Настройка обработчиков рынка
        this.marketUI.onSell = (fishIndex, price) => {
            // Удаляем рыбу из садка по индексу
            if (fishIndex >= 0 && fishIndex < this.fishingGame.storedFish.length) {
                const fish = this.fishingGame.storedFish[fishIndex];
                this.fishingGame.storedFish.splice(fishIndex, 1);
                console.log(`Продана рыба: ${fish.name} (${fish.caughtWeight.toFixed(2)} кг) за ${price}💰`);
            }
            
            // Добавляем деньги
            this.fishingGame.coins += price;
            
            // Регистрируем заработанные монеты в профиле
            if (this.profileSystem) {
                this.profileSystem.registerCoinsEarned(price);
            }
        };
        
        this.marketUI.onSellAll = (totalPrice) => {
            // Очищаем садок
            const fishCount = this.fishingGame.storedFish.length;
            this.fishingGame.storedFish = [];
            
            // Добавляем деньги
            this.fishingGame.coins += totalPrice;
            console.log(`Продано ${fishCount} рыб за ${totalPrice}💰`);
            
            // Регистрируем заработанные монеты в профиле
            if (this.profileSystem) {
                this.profileSystem.registerCoinsEarned(totalPrice);
            }
        };
        
        // Обработчики продажи чучел
        this.marketUI.onSellTrophy = (trophyId, price) => {
            // Продаем чучело через систему трофеев
            const actualPrice = this.trophySystem.sellTrophy(trophyId);
            
            // Добавляем деньги
            this.fishingGame.coins += actualPrice;
            console.log(`Продано чучело за ${actualPrice}💰`);
            
            // Регистрируем заработанные монеты в профиле
            if (this.profileSystem) {
                this.profileSystem.registerCoinsEarned(actualPrice);
            }
        };
        
        this.marketUI.onSellAllTrophies = (totalPrice) => {
            // Продаем все чучела
            const trophyCount = this.trophySystem.trophies.length;
            let actualTotal = 0;
            
            // Продаем каждое чучело
            while (this.trophySystem.trophies.length > 0) {
                const trophy = this.trophySystem.trophies[0];
                actualTotal += this.trophySystem.sellTrophy(trophy.id);
            }
            
            // Добавляем деньги
            this.fishingGame.coins += actualTotal;
            console.log(`Продано ${trophyCount} чучел за ${actualTotal}💰`);
            
            // Регистрируем заработанные монеты в профиле
            if (this.profileSystem) {
                this.profileSystem.registerCoinsEarned(actualTotal);
            }
        };
        
        // Настройка обработчиков трофеев
        this.trophyUI.onCraft = (fish, cost) => {
            // Списываем деньги
            this.fishingGame.coins -= cost;
            
            // Удаляем рыбу из садка
            const fishIndex = this.fishingGame.storedFish.findIndex(f => f === fish);
            if (fishIndex !== -1) {
                this.fishingGame.storedFish.splice(fishIndex, 1);
            }
            
            console.log(`Изготовлено чучело: ${fish.name} за ${cost}💰`);
        };
        
        this.trophyUI.onSell = (price) => {
            this.fishingGame.coins += price;
            console.log(`Чучело продано за ${price}💰`);
        };
        
        this.trophyUI.onUnlockSlot = (cost, currency) => {
            if (currency === 'gems') {
                this.fishingGame.premiumCoins -= cost;
            } else {
                this.fishingGame.coins -= cost;
            }
            console.log(`Слот разблокирован за ${cost} ${currency === 'gems' ? '💎' : '💰'}`);
        };
        
        // Настройка глобальных переменных для системы заданий
        window.gameState = {
            get coins() { return game.fishingGame.coins; },
            set coins(value) { game.fishingGame.coins = value; },
            get gems() { return game.fishingGame.premiumCoins; },
            set gems(value) { game.fishingGame.premiumCoins = value; },
            get level() { return game.fishingGame.progression?.level || 1; },
            get unlockedZones() { return game.fishingGame.unlockedZones || [1]; }
        };
        
        const game = this;
        window.updateCurrencyDisplay = function() {
            // Обновление валюты в UI (если нужно)
            console.log(`Валюта обновлена: ${game.fishingGame.coins} 💰, ${game.fishingGame.premiumCoins} 💎`);
        };
        
        // Настройка обработчиков ввода для главного экрана
        this.setupHomeInput();
        
        // Запускаем систему дня и ночи
        this.dayNightUI.create();
        this.dayNightSystem.start();
        
        // Подписываемся на смену времени суток для обновления атмосферных звуков
        this.dayNightSystem.addEventListener((event, data) => {
            if (event === 'timeUpdate' && this.currentScreen === 'fishing') {
                const timeOfDay = this.dayNightSystem.getTimeOfDay();
                // Обновляем атмосферу только если изменилось время суток
                if (this.lastTimeOfDay !== timeOfDay) {
                    this.audioManager.updateAtmosphere(timeOfDay);
                    this.lastTimeOfDay = timeOfDay;
                }
            }
        });
        
        // Загрузка времени дня/ночи теперь происходит через loadGameData()
        
        // Ставим время на паузу (начинаем с главного меню)
        this.dayNightSystem.pause();
        
        // Инициализируем Playgama SDK асинхронно
        // Не блокируем конструктор, инициализация произойдет в фоне
        this.initPlaygamaSDK().catch(error => {
            console.error('Ошибка инициализации SDK:', error);
        });
    }
    
    /**
     * Ожидание загрузки Playgama SDK скрипта
     */
    async waitForPlaygamaSDK(timeout = 10000) {
        const startTime = Date.now();
        
        while (typeof window.Playgama === 'undefined') {
            // Проверяем таймаут
            if (Date.now() - startTime > timeout) {
                console.warn('⚠️ Таймаут ожидания Playgama SDK, продолжаем без SDK');
                return false;
            }
            
            // Ждем 100ms перед следующей проверкой
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('✅ Playgama SDK загружен');
        return true;
    }
    
    /**
     * Инициализация Playgama SDK
     */
    async initPlaygamaSDK() {
        console.log('[Game] initPlaygamaSDK() started');
        console.log('[Game] window.playgamaSDK:', window.playgamaSDK);
        
        // Даем время платформе внедрить SDK (если она это делает)
        console.log('[Game] Waiting 1000ms for platform SDK injection...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Проверяем все возможные варианты SDK
        console.log('[Game] Checking for SDK after delay...');
        console.log('[Game] - window.bridge:', typeof window.bridge, window.bridge);
        console.log('[Game] - window.PlaygamaBridge:', typeof window.PlaygamaBridge, window.PlaygamaBridge);
        console.log('[Game] - window.Playgama:', typeof window.Playgama, window.Playgama);
        console.log('[Game] - window.playgama:', typeof window.playgama, window.playgama);
        console.log('[Game] - window.PG:', typeof window.PG, window.PG);
        console.log('[Game] - window.Bridge:', typeof window.Bridge, window.Bridge);
        console.log('[Game] - window.SDK:', typeof window.SDK, window.SDK);
        
        try {
            console.log('[Game] Calling window.playgamaSDK.init()...');
            const initialized = await window.playgamaSDK.init();
            console.log('[Game] window.playgamaSDK.init() returned:', initialized);
            this.sdkInitialized = initialized;
            
            if (initialized) {
                // Получаем язык из SDK
                const language = window.playgamaSDK.getLanguage();
                
                // Устанавливаем язык в системе локализации
                if (window.localizationSystem) {
                    window.localizationSystem.setLanguage(language);
                    
                    // Обновляем тексты кнопок в HomeScreen
                    if (this.homeScreen && this.homeScreen.updateButtonLabels) {
                        this.homeScreen.updateButtonLabels();
                    }
                    
                    // Обновляем вкладки магазина
                    if (this.shopUI && this.shopUI.updateTabLabels) {
                        this.shopUI.updateTabLabels();
                    }
                    
                    // Обновляем вкладки коллекции
                    if (this.collectionUI && this.collectionUI.updateTabLabels) {
                        this.collectionUI.updateTabLabels();
                    }
                    
                    // Обновляем вкладки заданий
                    if (this.questUI && this.questUI.updateTabLabels) {
                        this.questUI.updateTabLabels();
                    }
                    
                    // Обновляем вкладки инвентаря
                    if (this.inventoryUI && this.inventoryUI.updateTabLabels) {
                        this.inventoryUI.updateTabLabels();
                    }
                    
                    // Обновляем метки настроек
                    if (this.settingsUI && this.settingsUI.updateLabels) {
                        this.settingsUI.updateLabels();
                    }
                    
                    // Обновляем вкладки рейтинга
                    if (this.ratingUI && this.ratingUI.updateTabLabels) {
                        this.ratingUI.updateTabLabels();
                    }
                    
                    // Обновляем текст туториала в рыбалке (только при смене языка, данные уже загружены)
                    if (this.fishingGame && this.fishingGame.updateTutorialText) {
                        this.fishingGame.updateTutorialText();
                    }
                } else {
                    console.error('❌ window.localizationSystem не найдена!');
                }
                
                // Подписываемся на готовность платежей
                window.playgamaSDK.onPaymentsReady(async () => {
                    console.log('💳 Payments ready');
                    
                    // Синхронизируем цены IAP с SDK
                    if (typeof syncIAPPricesWithSDK === 'function') {
                        syncIAPPricesWithSDK();
                    }
                    
                    // Проверяем необработанные покупки
                    await this.checkUnprocessedPurchases();
                });
                
                // Загружаем данные из облака
                await this.loadGameData();
                
                // ВАЖНО: Проверяем необработанные покупки после загрузки данных
                // Это нужно для случая, когда пользователь обновил страницу сразу после покупки
                if (window.playgamaSDK.isPaymentsReady) {
                    await this.checkUnprocessedPurchases();
                }
            } else {
                // Используем detectLanguage как fallback
                if (window.localizationSystem) {
                    window.localizationSystem.detectLanguage();
                    
                    // Обновляем тексты кнопок в HomeScreen
                    if (this.homeScreen && this.homeScreen.updateButtonLabels) {
                        this.homeScreen.updateButtonLabels();
                    }
                    
                    // Обновляем вкладки UI
                    if (this.shopUI && this.shopUI.updateTabLabels) {
                        this.shopUI.updateTabLabels();
                    }
                    if (this.collectionUI && this.collectionUI.updateTabLabels) {
                        this.collectionUI.updateTabLabels();
                    }
                    if (this.questUI && this.questUI.updateTabLabels) {
                        this.questUI.updateTabLabels();
                    }
                    if (this.inventoryUI && this.inventoryUI.updateTabLabels) {
                        this.inventoryUI.updateTabLabels();
                    }
                    if (this.ratingUI && this.ratingUI.updateTabLabels) {
                        this.ratingUI.updateTabLabels();
                    }
                    // НЕ вызываем updateTutorialText() здесь - данные еще не загружены!
                    // Туториал обновится автоматически при входе в состояние IDLE
                }
                // Загружаем данные из localStorage
                await this.loadGameData();
            }
        } catch (error) {
            console.error('Ошибка инициализации SDK:', error);
            // Используем detectLanguage как fallback
            if (window.localizationSystem) {
                window.localizationSystem.detectLanguage();
                console.log('🌍 Язык определён из браузера (fallback):', window.localizationSystem.currentLocale);
                
                // Обновляем тексты кнопок в HomeScreen
                if (this.homeScreen && this.homeScreen.updateButtonLabels) {
                    this.homeScreen.updateButtonLabels();
                }
                
                // Обновляем вкладки UI
                if (this.shopUI && this.shopUI.updateTabLabels) {
                    this.shopUI.updateTabLabels();
                }
                if (this.collectionUI && this.collectionUI.updateTabLabels) {
                    this.collectionUI.updateTabLabels();
                }
                if (this.questUI && this.questUI.updateTabLabels) {
                    this.questUI.updateTabLabels();
                }
                if (this.inventoryUI && this.inventoryUI.updateTabLabels) {
                    this.inventoryUI.updateTabLabels();
                }
                if (this.ratingUI && this.ratingUI.updateTabLabels) {
                    this.ratingUI.updateTabLabels();
                }
                // НЕ вызываем updateTutorialText() здесь - данные еще не загружены!
                // Туториал обновится автоматически при входе в состояние IDLE
            }
            // Загружаем данные из localStorage
            await this.loadGameData();
        }
        
        // Запускаем игру после загрузки данных
        this.start();
        
        // Отправляем gameReady сразу после старта игры
        if (this.sdkInitialized) {
            await window.playgamaSDK.gameReady();
            
            // Показываем VK баннер если на платформе VK
            if (window.playgamaSDK.platform === 'vk') {
                console.log('[Game] 📢 Показываем VK баннер...');
                await window.playgamaSDK.showVKBanner();
            }
        }
    }
    
    /**
     * Загрузка игровых данных
     */
    async loadGameData() {
        try {
            let data = {};
            
            console.log('🔄 Начинаем загрузку игровых данных...');
            console.log('🔄 SDK инициализирован:', this.sdkInitialized);
            console.log('🔄 Player готов:', window.playgamaSDK?.isPlayerReady);
            console.log('🔄 Платформа:', window.playgamaSDK?.platform);
            console.log('🔄 VK Bridge готов:', window.playgamaSDK?.isVKBridgeReady());
            
            if (this.sdkInitialized) {
                // Загружаем из облака
                console.log('📥 Вызываем loadData()...');
                data = await window.playgamaSDK.loadData();
                console.log('📥 Данные загружены из облака, ключей:', Object.keys(data).length);
                
                // Логируем основные данные для отладки
                if (Object.keys(data).length > 0) {
                    console.log('📊 Загруженные данные:', {
                        coins: data.coins,
                        premiumCoins: data.premiumCoins,
                        level: data.level,
                        xp: data.xp,
                        currentZone: data.currentZone,
                        hasGearInventory: !!data.gearInventory,
                        hasCollection: !!data.collection,
                        hasTutorial: !!data.tutorial
                    });
                } else {
                    console.log('📊 Облачные данные пусты - новый игрок или первый запуск');
                }
            } else {
                // Загружаем из localStorage
                if (window.playgamaSDK && typeof window.playgamaSDK.loadFromLocalStorage === 'function') {
                    data = window.playgamaSDK.loadFromLocalStorage();
                    console.log('📥 Данные загружены из localStorage, ключей:', Object.keys(data).length);
                } else {
                    // Fallback: загружаем напрямую из localStorage
                    const savedData = localStorage.getItem('fishingGameData');
                    data = savedData ? JSON.parse(savedData) : {};
                    console.log('📥 Данные загружены из localStorage (fallback), ключей:', Object.keys(data).length);
                }
            }
            
            // Восстанавливаем валюты
            if (data.coins !== undefined) {
                this.fishingGame.coins = data.coins;
                console.log('💰 Восстановлены монеты:', data.coins);
            } else {
                this.fishingGame.coins = 0; // Если нет сохранения, начинаем с 0
                console.log('💰 Монеты не найдены, установлены в 0');
            }
            if (data.premiumCoins !== undefined) {
                this.fishingGame.premiumCoins = data.premiumCoins;
                console.log('💎 Восстановлены гемы:', data.premiumCoins);
            } else {
                this.fishingGame.premiumCoins = 0; // Если нет сохранения, начинаем с 0
                console.log('💎 Гемы не найдены, установлены в 0');
            }
            
            // Восстанавливаем опыт и уровень
            if (data.xp !== undefined && this.fishingGame.progression) {
                this.fishingGame.progression.currentXP = data.xp;
                console.log('⭐ Восстановлен опыт:', data.xp);
            }
            if (data.level !== undefined && this.fishingGame.progression) {
                this.fishingGame.progression.level = data.level;
                console.log('📈 Восстановлен уровень:', data.level);
            }
            
            // Восстанавливаем текущую локацию
            if (data.currentZone !== undefined) {
                this.fishingGame.currentZone = data.currentZone;
            }
            
            // Восстанавливаем разблокированные зоны
            if (data.unlockedZones && Array.isArray(data.unlockedZones)) {
                this.fishingGame.unlockedZones = data.unlockedZones;
            }
            
            // Восстанавливаем садок
            if (data.storedFish && Array.isArray(data.storedFish)) {
                this.fishingGame.storedFish = data.storedFish;
            }
            
            // Восстанавливаем улучшения садка
            if (data.keepnetCapacity !== undefined) {
                this.fishingGame.keepnetCapacity = data.keepnetCapacity;
            }
            if (data.keepnetUpgradeLevel !== undefined) {
                this.fishingGame.keepnetUpgradeLevel = data.keepnetUpgradeLevel;
            }
            
            // Восстанавливаем инвентарь снастей (с прочностью)
            if (data.gearInventory) {
                if (data.gearInventory.inventory) {
                    this.fishingGame.gearInventory.inventory = data.gearInventory.inventory;
                }
                if (data.gearInventory.equipped) {
                    this.fishingGame.gearInventory.equipped = data.gearInventory.equipped;
                }
                console.log('✅ Инвентарь снастей восстановлен из облака');
            }
            
            // Восстанавливаем коллекцию
            if (data.collection) {
                if (data.collection.caughtFish) {
                    this.collectionSystem.caughtFish = new Set(data.collection.caughtFish);
                }
                if (data.collection.caughtMonsters) {
                    this.collectionSystem.caughtMonsters = new Set(data.collection.caughtMonsters);
                }
                if (data.collection.caughtItems) {
                    this.collectionSystem.caughtItems = new Set(data.collection.caughtItems);
                }
                console.log('✅ Коллекция восстановлена из облака');
            }
            
            // Восстанавливаем квесты
            if (data.quests && window.questSystem) {
                if (data.quests.dailyQuests) window.questSystem.dailyQuests = data.quests.dailyQuests;
                if (data.quests.weeklyQuests) window.questSystem.weeklyQuests = data.quests.weeklyQuests;
                if (data.quests.lastDailyReset) window.questSystem.lastDailyReset = data.quests.lastDailyReset;
                if (data.quests.lastWeeklyReset) window.questSystem.lastWeeklyReset = data.quests.lastWeeklyReset;
                if (data.quests.completedDaily) window.questSystem.completedDaily = new Set(data.quests.completedDaily);
                if (data.quests.completedWeekly) window.questSystem.completedWeekly = new Set(data.quests.completedWeekly);
                console.log('✅ Квесты восстановлены из облака');
            }
            
            // Восстанавливаем трофеи
            if (data.trophies && this.trophySystem) {
                if (data.trophies.trophies) this.trophySystem.trophies = data.trophies.trophies;
                if (data.trophies.installedTrophies) this.trophySystem.installedTrophies = data.trophies.installedTrophies;
                if (data.trophies.slots) this.trophySystem.slots = data.trophies.slots;
                console.log('✅ Трофеи восстановлены из облака');
            }
            
            // Восстанавливаем профиль
            if (data.profile && this.profileSystem) {
                if (data.profile.stats) {
                    this.profileSystem.stats = { ...this.profileSystem.stats, ...data.profile.stats };
                }
                console.log('✅ Профиль восстановлен из облака');
            }
            
            // Восстанавливаем рынок
            if (data.market && this.marketSystem) {
                if (data.market.priceMultipliers) {
                    this.marketSystem.priceMultipliers = new Map(Object.entries(data.market.priceMultipliers));
                }
                if (data.market.lastUpdateTime) {
                    this.marketSystem.lastUpdateTime = data.market.lastUpdateTime;
                }
                console.log('✅ Рынок восстановлен из облака');
            }
            
            // Восстанавливаем ежедневные награды
            if (data.dailyRewards && window.dailyRewardsSystem) {
                if (data.dailyRewards.lastClaimDate) {
                    window.dailyRewardsSystem.lastClaimDate = new Date(data.dailyRewards.lastClaimDate);
                }
                if (data.dailyRewards.currentDay !== undefined) window.dailyRewardsSystem.currentDay = data.dailyRewards.currentDay;
                if (data.dailyRewards.totalDaysClaimed !== undefined) window.dailyRewardsSystem.totalDaysClaimed = data.dailyRewards.totalDaysClaimed;
                console.log('✅ Ежедневные награды восстановлены из облака');
            }
            
            // Восстанавливаем день/ночь
            if (data.dayNight && this.dayNightSystem) {
                this.dayNightSystem.load(data.dayNight);
                console.log('✅ Система дня/ночи восстановлена из облака');
            }
            
            // Восстанавливаем туториал
            if (data.tutorial && window.tutorialSystem) {
                if (data.tutorial.tutorialCompleted !== undefined) window.tutorialSystem.tutorialCompleted = data.tutorial.tutorialCompleted;
                if (data.tutorial.tutorialFishCount !== undefined) window.tutorialSystem.tutorialFishCount = data.tutorial.tutorialFishCount;
                if (data.tutorial.currentStep !== undefined) window.tutorialSystem.currentStep = data.tutorial.currentStep;
                if (data.tutorial.firstFishingSession !== undefined) window.tutorialSystem.firstFishingSession = data.tutorial.firstFishingSession;
                if (data.tutorial.uiTutorialShown !== undefined) window.tutorialSystem.uiTutorialShown = data.tutorial.uiTutorialShown;
                console.log('✅ Туториал восстановлен из облака:', window.tutorialSystem.tutorialCompleted);
            }
            
            // ВСЕГДА устанавливаем флаг что данные загружены (для новых и старых игроков)
            if (window.tutorialSystem) {
                window.tutorialSystem.dataLoaded = true;
                console.log('✅ Флаг dataLoaded установлен. tutorialCompleted:', window.tutorialSystem.tutorialCompleted);
            }
            
            // Восстанавливаем рекламные награды
            if (data.adRewards && typeof loadAdRewardData === 'function') {
                loadAdRewardData(data.adRewards);
                console.log('✅ Рекламные награды восстановлены из облака');
            }
            
            console.log('✅ Все игровые данные восстановлены');
            
            // ИСПРАВЛЕНИЕ: Сохраняем данные после загрузки, чтобы синхронизировать localStorage и VK Storage
            // Это важно для первого запуска, когда данные есть в localStorage, но нет в VK Storage
            await this.saveGameData();
            
            // Запускаем фоновую загрузку всех рыб из облака
            this.preloadAllFishInBackground();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }
    
    /**
     * Фоновая загрузка всех 120 рыб и 20 монстров из облака
     */
    async preloadAllFishInBackground() {
        try {
            // Получаем все ID рыб (1-120)
            const allFishIds = [];
            for (let i = 1; i <= 120; i++) {
                allFishIds.push(i);
            }
            
            // Получаем все ID монстров (1-20)
            const allMonsterIds = [];
            for (let i = 1; i <= 20; i++) {
                allMonsterIds.push(i);
            }
            
            // Загружаем рыб пакетами по 15 штук для плавности
            const batchSize = 15;
            let loadedFish = 0;
            
            for (let i = 0; i < allFishIds.length; i += batchSize) {
                const batch = allFishIds.slice(i, i + batchSize);
                
                // Загружаем пакет параллельно
                await Promise.all(batch.map(fishId => 
                    window.assetManager.loadFishImage(fishId).catch(err => {
                        console.warn(`⚠️ Не удалось загрузить рыбу ${fishId}:`, err);
                    })
                ));
                
                loadedFish += batch.length;
                
                // Небольшая задержка между пакетами чтобы не блокировать UI
                if (i + batchSize < allFishIds.length) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
            
            // Загружаем монстров
            let loadedMonsters = 0;
            for (const monsterId of allMonsterIds) {
                await window.assetManager.loadMonsterImage(monsterId).catch(err => {
                    console.warn(`⚠️ Не удалось загрузить монстра ${monsterId}:`, err);
                });
                loadedMonsters++;
            }
            
            // Загружаем иконки локаций (20 штук)
            let loadedIcons = 0;
            for (let i = 1; i <= 20; i++) {
                await window.assetManager.loadLocationIcon(i).catch(err => {
                    console.warn(`⚠️ Не удалось загрузить иконку локации ${i}:`, err);
                });
                loadedIcons++;
            }
            
            console.log(`✅ Фоновая загрузка завершена: ${loadedFish} рыб + ${loadedMonsters} монстров + ${loadedIcons} иконок локаций`);
        } catch (error) {
            console.error('❌ Ошибка фоновой загрузки:', error);
        }
    }
    
    /**
     * Сохранение игровых данных с debounce
     * Вызывайте этот метод вместо saveGameData() для автоматических сохранений
     */
    saveGameDataDebounced() {
        // Отменяем предыдущий таймер
        if (this.saveDebounceTimer) {
            clearTimeout(this.saveDebounceTimer);
        }
        
        // Устанавливаем новый таймер
        this.saveDebounceTimer = setTimeout(() => {
            this.saveGameData();
            this.saveDebounceTimer = null;
        }, this.saveDebounceDelay);
    }
    
    /**
     * Сохранение игровых данных
     */
    async saveGameData() {
        try {
            // Проверяем что fishingGame полностью инициализирован
            if (!this.fishingGame || this.fishingGame.coins === undefined) {
                console.log('[Game] Пропуск сохранения - fishingGame еще не инициализирован');
                return;
            }
            
            // ИСПРАВЛЕНИЕ: Ждем инициализации SDK перед первым сохранением
            if (!this.sdkInitialized && window.playgamaSDK && !window.playgamaSDK.isInitialized) {
                console.log('[Game] Пропуск сохранения - SDK еще не инициализирован, данные будут сохранены после инициализации');
                return;
            }
            
            console.log('💾 Начинаем сохранение игровых данных...');
            console.log('💾 SDK инициализирован:', this.sdkInitialized);
            console.log('💾 Player готов:', window.playgamaSDK?.isPlayerReady);
            
            const data = {
                coins: this.fishingGame.coins,
                premiumCoins: this.fishingGame.premiumCoins,
                xp: this.fishingGame.progression?.currentXP || 0,
                level: this.fishingGame.progression?.level || 1,
                currentZone: this.fishingGame.currentZone,
                unlockedZones: this.fishingGame.unlockedZones || [1],
                storedFish: this.fishingGame.storedFish || [],
                keepnetCapacity: this.fishingGame.keepnetCapacity || 10,
                keepnetUpgradeLevel: this.fishingGame.keepnetUpgradeLevel || 0,
                
                // Инвентарь снастей (с прочностью)
                gearInventory: {
                    inventory: this.fishingGame.gearInventory.inventory,
                    equipped: this.fishingGame.gearInventory.equipped
                },
                
                // Коллекция
                collection: {
                    caughtFish: Array.from(this.collectionSystem.caughtFish),
                    caughtMonsters: Array.from(this.collectionSystem.caughtMonsters),
                    caughtItems: Array.from(this.collectionSystem.caughtItems)
                },
                
                // Квесты
                quests: window.questSystem ? {
                    dailyQuests: window.questSystem.dailyQuests,
                    weeklyQuests: window.questSystem.weeklyQuests,
                    lastDailyReset: window.questSystem.lastDailyReset,
                    lastWeeklyReset: window.questSystem.lastWeeklyReset,
                    completedDaily: Array.from(window.questSystem.completedDaily),
                    completedWeekly: Array.from(window.questSystem.completedWeekly)
                } : null,
                
                // Трофеи
                trophies: this.trophySystem ? {
                    trophies: this.trophySystem.trophies,
                    installedTrophies: this.trophySystem.installedTrophies,
                    slots: this.trophySystem.slots
                } : null,
                
                // Профиль
                profile: this.profileSystem ? {
                    stats: this.profileSystem.stats
                } : null,
                
                // Рынок
                market: this.marketSystem ? {
                    priceMultipliers: Object.fromEntries(this.marketSystem.priceMultipliers),
                    lastUpdateTime: this.marketSystem.lastUpdateTime
                } : null,
                
                // Ежедневные награды
                dailyRewards: window.dailyRewardsSystem ? {
                    lastClaimDate: window.dailyRewardsSystem.lastClaimDate ? window.dailyRewardsSystem.lastClaimDate.toISOString() : null,
                    currentDay: window.dailyRewardsSystem.currentDay,
                    totalDaysClaimed: window.dailyRewardsSystem.totalDaysClaimed
                } : null,
                
                // День/ночь
                dayNight: this.dayNightSystem ? this.dayNightSystem.save() : null,
                
                // Туториал
                tutorial: window.tutorialSystem ? {
                    tutorialCompleted: window.tutorialSystem.tutorialCompleted,
                    tutorialFishCount: window.tutorialSystem.tutorialFishCount,
                    currentStep: window.tutorialSystem.currentStep,
                    firstFishingSession: window.tutorialSystem.firstFishingSession,
                    uiTutorialShown: window.tutorialSystem.uiTutorialShown
                } : null,
                
                // Рекламные награды
                adRewards: typeof getAdRewardData === 'function' ? getAdRewardData() : null
            };
            
            // Логируем основные данные для отладки
            console.log('📊 Сохраняемые данные:', {
                coins: data.coins,
                premiumCoins: data.premiumCoins,
                level: data.level,
                xp: data.xp,
                currentZone: data.currentZone,
                unlockedZones: data.unlockedZones,
                tutorialCompleted: data.tutorial?.tutorialCompleted
            });
            
            console.log('📊 Все ключи данных:', Object.keys(data));
            
            console.log('💾 SDK инициализирован:', this.sdkInitialized);
            console.log('💾 Платформа:', window.playgamaSDK?.platform);
            console.log('💾 VK Bridge готов:', window.playgamaSDK?.isVKBridgeReady());
            
            // ИСПРАВЛЕНИЕ: Проверяем не только sdkInitialized, но и наличие playgamaSDK
            const canUseSdk = window.playgamaSDK && 
                             window.playgamaSDK.isInitialized && 
                             typeof window.playgamaSDK.saveData === 'function';
            
            console.log('💾 Можем использовать SDK для сохранения:', canUseSdk);
            
            if (canUseSdk) {
                // Сохраняем в облако
                console.log('💾 Вызываем saveData()...');
                console.log('💾 window.playgamaSDK:', window.playgamaSDK);
                console.log('💾 typeof saveData:', typeof window.playgamaSDK.saveData);
                console.log('💾 Данные для передачи, ключей:', Object.keys(data).length);
                
                const success = await window.playgamaSDK.saveData(data, true);
                
                console.log('💾 saveData() вернул:', success);
                
                if (success) {
                    console.log('✅ Все данные сохранены в облако');
                } else {
                    console.warn('⚠️ Не удалось сохранить в облако, данные сохранены только в localStorage');
                }
            } else {
                // Сохраняем в localStorage напрямую, если SDK еще не готов
                if (window.playgamaSDK && typeof window.playgamaSDK.saveToLocalStorage === 'function') {
                    window.playgamaSDK.saveToLocalStorage(data);
                    console.log('💾 Все данные сохранены в localStorage');
                } else {
                    // Fallback: сохраняем напрямую в localStorage
                    localStorage.setItem('fishingGameData', JSON.stringify(data));
                    console.log('💾 Данные сохранены в localStorage (fallback)');
                }
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения данных:', error);
            console.error('Error details:', error.message, error.stack);
        }
    }
    
    /**
     * Показать fullscreen рекламу если прошло достаточно времени
     * @param {boolean} isFishingEntry - Вход в рыбалку (не показываем при первом входе)
     * @returns {Promise<boolean>} - true если реклама была показана
     */
    async tryShowFullscreenAd(isFishingEntry = false) {
        if (!this.sdkInitialized) {
            return false;
        }
        
        const now = Date.now();
        const timeSinceGameStart = now - this.gameStartTime;
        
        // Не показываем рекламу если игрок в игре меньше 90 секунд
        if (timeSinceGameStart < 90000) {
            console.log(`⏱️ Реклама не показана: игрок в игре ${Math.ceil(timeSinceGameStart / 1000)}с (нужно 90с)`);
            return false;
        }
        
        // Не показываем рекламу при первом входе в рыбалку
        if (isFishingEntry && this.firstFishingVisit) {
            console.log('⏱️ Реклама не показана: первый вход в рыбалку');
            return false;
        }
        
        const timeSinceLastAd = now - this.lastFullscreenAdTime;
        
        // Проверяем прошло ли 90 секунд с последней рекламы
        if (timeSinceLastAd < this.fullscreenAdCooldown) {
            console.log(`⏱️ Реклама на кулдауне: ${Math.ceil((this.fullscreenAdCooldown - timeSinceLastAd) / 1000)}с`);
            return false;
        }
        
        console.log('📺 Показываем fullscreen рекламу...');
        
        // Глушим звук
        this.audioManager.muteAll();
        
        // Показываем рекламу
        const shown = await window.playgamaSDK.showFullscreenAdv({
            onOpen: () => {
                console.log('📺 Реклама открыта');
            },
            onClose: (wasShown) => {
                console.log('📺 Реклама закрыта, показана:', wasShown);
                // Восстанавливаем звук
                this.audioManager.unmuteAll();
                
                if (wasShown) {
                    // Обновляем время последней рекламы
                    this.lastFullscreenAdTime = Date.now();
                }
            },
            onError: (error) => {
                console.error('📺 Ошибка рекламы:', error);
                // Восстанавливаем звук даже при ошибке
                this.audioManager.unmuteAll();
            }
        });
        
        return shown;
    }
    
    /**
     * Показать rewarded рекламу
     * @param {Function} onReward - Callback при получении награды
     * @returns {Promise<boolean>} - true если награда получена
     */
    async showRewardedAd(onReward) {
        if (!this.sdkInitialized) {
            console.warn('⚠️ SDK не инициализирован, награда выдана без рекламы (тестовый режим)');
            if (onReward) onReward();
            return true;
        }
        
        // Глушим звук
        this.audioManager.muteAll();
        
        let rewardGiven = false;
        
        const rewarded = await window.playgamaSDK.showRewardedVideo({
            onRewarded: () => {
                rewardGiven = true;
                if (onReward) {
                    onReward();
                }
            },
            onClose: () => {
                // Восстанавливаем звук
                this.audioManager.unmuteAll();
            },
            onError: (error) => {
                console.error('❌ Ошибка rewarded рекламы:', error);
                // Восстанавливаем звук даже при ошибке
                this.audioManager.unmuteAll();
            }
        });
        
        return rewarded;
    }
    
    navigateTo(screen) {
        // Сигнализируем остановку геймплея если выходим из рыбалки
        if (this.currentScreen === 'fishing' && screen !== 'fishing' && this.sdkInitialized) {
            window.playgamaSDK.gameplayStop();
        }
        
        // Закрываем модальное окно локации при выходе из карты
        if (this.currentScreen === 'map' && screen !== 'map' && this.mapScreen) {
            this.mapScreen.detailModal = null;
        }
        
        this.currentScreen = screen;
        
        if (screen === 'home') {
            // Переключаемся на главный экран
            
            // Завершаем первую сессию рыбалки (для туториала)
            if (window.tutorialSystem && window.tutorialSystem.isFirstFishingSession()) {
                window.tutorialSystem.completeFirstSession();
                console.log('🎓 Первая сессия рыбалки завершена, все кнопки теперь доступны');
            }
            
            // Показываем fullscreen рекламу при возврате в меню
            this.tryShowFullscreenAd();
            
            // Сохраняем данные при возврате в меню
            this.saveGameData();
            
            // Сбрасываем бонусы от окна подсказок при выходе из рыбалки
            if (this.fishingTipsUI) {
                this.fishingTipsUI.sessionBonuses = [];
            }
            
            // Останавливаем атмосферные звуки
            this.audioManager.stopAtmosphere();
            
            this.shopUI.hide();
            this.inventoryUI.hide();
            this.questUI.hide();
            this.profileUI.hide();
            this.settingsUI.hide();
            this.dailyRewardsUI.hide();
            this.dayNightUI.hide(); // Скрываем индикатор времени
            this.dayNightSystem.pause(); // Останавливаем время
            this.setupHomeInput();
        } else if (screen === 'fishing') {
            // Переключаемся на рыбалку
            
            // Показываем fullscreen рекламу перед рыбалкой (но не при первом входе)
            this.tryShowFullscreenAd(true);
            
            // Сбрасываем флаг первого входа в рыбалку
            this.firstFishingVisit = false;
            
            // Если currentZone не установлена, устанавливаем первую разблокированную зону
            if (!this.fishingGame.currentZone) {
                const firstUnlockedZone = this.fishingGame.unlockedZones?.[0] || 1;
                this.fishingGame.currentZone = firstUnlockedZone;
                console.log('Установлена текущая зона:', firstUnlockedZone);
            }
            
            // ВАЖНО: Обновляем фон ПЕРЕД запуском рыбалки
            if (this.fishingGame.waterRenderer) {
                this.fishingGame.waterRenderer.updateZone(this.fishingGame.currentZone);
                console.log('Обновлен фон для зоны:', this.fishingGame.currentZone);
            }
            
            // Проверяем нужно ли показать окно подсказок
            // Не показываем для новичков в первый раз И не показываем во второй раз (только с третьего)
            const isFirstSession = window.tutorialSystem && window.tutorialSystem.isFirstFishingSession();
            const isSecondSession = !isFirstSession && this.fishingTipsSystem.lastShowTime === 0;
            
            if (!isFirstSession && !isSecondSession && this.fishingTipsSystem.shouldShow()) {
                // Показываем окно подсказок (начиная с третьего входа)
                this.fishingTipsUI.show(() => {
                    // После закрытия окна запускаем рыбалку
                    this.startFishing();
                });
                this.setupTipsInput();
            } else {
                // Сразу запускаем рыбалку
                this.startFishing();
                
                // Если это второй вход, обновляем время чтобы в следующий раз показать окно
                if (isSecondSession) {
                    this.fishingTipsSystem.updateShowTime();
                    console.log('[FishingTips] Второй вход - окно не показано, но время обновлено для следующего раза');
                }
            }
        } else if (screen === 'shop') {
            // Открываем магазин
            
            // Показываем fullscreen рекламу при открытии магазина
            this.tryShowFullscreenAd();
            
            // Проверяем необработанные покупки перед открытием магазина (в фоне)
            this.checkUnprocessedPurchases().catch(err => {
                console.error('💳 Error checking unprocessed purchases:', err);
            });
            
            const playerLevel = this.fishingGame.progression.level;
            this.shopUI.show(this.fishingGame.coins, this.fishingGame.premiumCoins, playerLevel);
            this.inventoryUI.hide();
            this.questUI.hide();
            this.profileUI.hide();
            this.settingsUI.hide();
            this.dailyRewardsUI.hide();
            this.dayNightUI.hide(); // Скрываем индикатор времени
            this.dayNightSystem.pause(); // Останавливаем время
            this.setupShopInput();
        } else if (screen === 'inventory') {
            // Открываем инвентарь
            
            // Показываем fullscreen рекламу при открытии инвентаря
            this.tryShowFullscreenAd();
            
            const keepnetCapacity = this.fishingGame.keepnetCapacity || 10;
            const keepnetUpgradeLevel = this.fishingGame.keepnetUpgradeLevel || 0;
            this.inventoryUI.show(this.fishingGame.coins, keepnetCapacity, keepnetUpgradeLevel);
            this.shopUI.hide();
            this.collectionUI.hide();
            this.questUI.hide();
            this.profileUI.hide();
            this.settingsUI.hide();
            this.dailyRewardsUI.hide();
            this.dayNightUI.hide(); // Скрываем индикатор времени
            this.dayNightSystem.pause(); // Останавливаем время
            this.setupInventoryInput();
        } else if (screen === 'collection') {
            // Открываем коллекцию
            
            // Показываем fullscreen рекламу при открытии коллекции
            this.tryShowFullscreenAd();
            
            this.collectionUI.show();
            this.shopUI.hide();
            this.inventoryUI.hide();
            this.marketUI.hide();
            this.questUI.hide();
            this.profileUI.hide();
            this.settingsUI.hide();
            this.dailyRewardsUI.hide();
            this.dayNightUI.hide(); // Скрываем индикатор времени
            this.dayNightSystem.pause(); // Останавливаем время
            this.setupCollectionInput();
        } else if (screen === 'market') {
            // Открываем рынок
            
            // Показываем fullscreen рекламу при открытии рынка
            this.tryShowFullscreenAd();
            
            this.marketUI.show(this.fishingGame.coins, this.fishingGame.storedFish, this.trophySystem.trophies);
            this.shopUI.hide();
            this.inventoryUI.hide();
            this.collectionUI.hide();
            this.questUI.hide();
            this.profileUI.hide();
            this.settingsUI.hide();
            this.dailyRewardsUI.hide();
            this.dayNightUI.hide(); // Скрываем индикатор времени
            this.dayNightSystem.pause(); // Останавливаем время
            this.setupMarketInput();
        } else if (screen === 'quests') {
            // Открываем задания
            this.questUI.show();
            this.shopUI.hide();
            this.inventoryUI.hide();
            this.collectionUI.hide();
            this.marketUI.hide();
            this.profileUI.hide();
            this.settingsUI.hide();
            this.dailyRewardsUI.hide();
            this.dayNightUI.hide(); // Скрываем индикатор времени
            this.dayNightSystem.pause(); // Останавливаем время
            this.setupQuestInput();
        } else if (screen === 'profile') {
            // Открываем профиль
            this.profileUI.show();
            this.shopUI.hide();
            this.inventoryUI.hide();
            this.collectionUI.hide();
            this.marketUI.hide();
            this.questUI.hide();
            this.settingsUI.hide();
            this.dailyRewardsUI.hide();
            this.dayNightUI.hide(); // Скрываем индикатор времени
            this.dayNightSystem.pause(); // Останавливаем время
            this.setupProfileInput();
        } else if (screen === 'settings') {
            // Открываем настройки
            this.settingsUI.show();
            this.shopUI.hide();
            this.inventoryUI.hide();
            this.collectionUI.hide();
            this.marketUI.hide();
            this.questUI.hide();
            this.profileUI.hide();
            this.dailyRewardsUI.hide();
            this.dayNightUI.hide(); // Скрываем индикатор времени
            this.dayNightSystem.pause(); // Останавливаем время
            this.setupSettingsInput();
        } else if (screen === 'rewards') {
            // Открываем ежедневные награды
            this.dailyRewardsUI.show();
            this.shopUI.hide();
            this.inventoryUI.hide();
            this.collectionUI.hide();
            this.marketUI.hide();
            this.questUI.hide();
            this.profileUI.hide();
            this.settingsUI.hide();
            this.ratingUI.close();
            this.dayNightUI.hide(); // Скрываем индикатор времени
            this.dayNightSystem.pause(); // Останавливаем время
            this.setupRewardsInput();
        } else if (screen === 'rating') {
            // Открываем рейтинг
            this.ratingUI.open();
            this.shopUI.hide();
            this.inventoryUI.hide();
            this.collectionUI.hide();
            this.marketUI.hide();
            this.questUI.hide();
            this.profileUI.hide();
            this.settingsUI.hide();
            this.dailyRewardsUI.hide();
            this.trophyUI.hide();
            this.dayNightUI.hide(); // Скрываем индикатор времени
            this.dayNightSystem.pause(); // Останавливаем время
            this.setupRatingInput();
        } else if (screen === 'trophies') {
            // Открываем трофеи
            
            // Показываем fullscreen рекламу при открытии трофеев
            this.tryShowFullscreenAd();
            
            this.trophyUI.show(this.fishingGame.coins, this.fishingGame.premiumCoins, this.fishingGame.storedFish);
            this.shopUI.hide();
            this.inventoryUI.hide();
            this.collectionUI.hide();
            this.marketUI.hide();
            this.questUI.hide();
            this.profileUI.hide();
            this.settingsUI.hide();
            this.dailyRewardsUI.hide();
            this.ratingUI.close();
            this.dayNightUI.hide(); // Скрываем индикатор времени
            this.dayNightSystem.pause(); // Останавливаем время
            this.setupTrophiesInput();
        } else if (screen === 'map') {
            // Открываем карту
            if (!this.mapScreen) {
                this.mapScreen = new MapScreen(
                    this.canvas,
                    this.getPlayerData(),
                    (dest) => this.navigateTo(dest),
                    (zone) => this.startFishingInZone(zone),
                    this.audioManager
                );
            } else {
                // Обновляем данные игрока
                this.mapScreen.playerData = this.getPlayerData();
                this.mapScreen.initializeLocations();
                
                // Принудительно обновляем статусы всех кнопок
                this.mapScreen.locationButtons.forEach(btn => {
                    btn.isUnlocked = this.mapScreen.isZoneUnlocked(btn.zone);
                    btn.canUnlock = this.mapScreen.canUnlockZone(btn.zone);
                });
            }
            this.shopUI.hide();
            this.inventoryUI.hide();
            this.marketUI.hide();
            this.questUI.hide();
            this.profileUI.hide();
            this.settingsUI.hide();
            this.dailyRewardsUI.hide();
            this.dayNightUI.hide(); // Скрываем индикатор времени
            this.dayNightSystem.pause(); // Останавливаем время
            this.setupMapInput();
        }
    }
    
    getPlayerData() {
        return {
            coins: this.fishingGame.coins,
            xp: this.fishingGame.progression.currentXP || 0,
            level: this.fishingGame.progression.level || 1,
            unlockedZones: this.fishingGame.unlockedZones || [1],
            currentZone: this.fishingGame.currentZone || 1
        };
    }
    
    startFishingInZone(zone) {
        console.log(`Отправляемся на рыбалку в: ${zone.name}`);
        
        // Устанавливаем текущую зону
        this.fishingGame.currentZone = zone.id;
        
        // Обновляем фон в WaterRenderer
        if (this.fishingGame.waterRenderer) {
            this.fishingGame.waterRenderer.updateZone(zone.id);
        }
        
        // Обновляем систему зон в игре - передаем ID локации, а не minGearTier!
        if (this.fishingGame.zoneSystem) {
            this.fishingGame.zoneSystem.setLocationTier(zone.id);
        }
        
        // Переходим на рыбалку
        this.navigateTo('fishing');
    }
    
    // Запуск рыбалки (после окна подсказок или сразу)
    startFishing() {
        // Сигнализируем начало геймплея
        if (this.sdkInitialized) {
            window.playgamaSDK.gameplayStart();
        }
        
        // Устанавливаем локацию в FishingGame
        this.fishingGame.setLocation(this.fishingGame.currentZone);
        
        console.log('[startFishing] Состояние туториала:', {
            dataLoaded: window.tutorialSystem?.dataLoaded,
            tutorialCompleted: window.tutorialSystem?.tutorialCompleted,
            currentStep: window.tutorialSystem?.getCurrentStep()
        });
        
        // Отменяем предыдущий таймер если он есть
        if (this.idleTransitionTimer) {
            clearTimeout(this.idleTransitionTimer);
        }
        
        // Переходим в состояние IDLE через 1 секунду (вызовет enter:IDLE и покажет туториал если нужно)
        // НО только если состояние все еще начальное (не CASTING, не WAITING и т.д.)
        this.idleTransitionTimer = setTimeout(() => {
            // Проверяем что игрок еще не начал рыбачить
            if (this.fishingGame.stateMachine.is(FISHING_CONFIG.STATES.IDLE)) {
                console.log('[startFishing] Переход в IDLE через setTimeout (игрок еще не кликнул)');
                this.fishingGame.stateMachine.transition(FISHING_CONFIG.STATES.IDLE);
            } else {
                console.log('[startFishing] Пропускаем переход в IDLE - игрок уже начал рыбачить, текущее состояние:', this.fishingGame.stateMachine.currentState);
            }
            this.idleTransitionTimer = null;
        }, 1000);
        
        this.shopUI.hide();
        this.inventoryUI.hide();
        this.questUI.hide();
        this.profileUI.hide();
        this.settingsUI.hide();
        this.dailyRewardsUI.hide();
        this.fishingTipsUI.hide();
        // НЕ показываем dayNightUI.show() - затемнение теперь рисуется в FishingGame
        this.dayNightSystem.resume(); // Запускаем время
        
        // Запускаем атмосферные звуки в зависимости от времени суток
        const timeOfDay = this.dayNightSystem.getTimeOfDay();
        this.audioManager.startAtmosphere(timeOfDay);
        
        this.setupFishingInput();
    }
    
    setupHomeInput() {
        // Удаляем старые обработчики
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчики магазина если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        // Удаляем обработчики инвентаря если они были
        if (this.inventoryMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.inventoryMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.inventoryMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.inventoryMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.inventoryMouseHandlers.mouseleave);
            this.inventoryMouseHandlers = null;
        }
        
        // Удаляем обработчики коллекции если они были
        if (this.collectionMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.collectionMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.collectionMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.collectionMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.collectionMouseHandlers.mouseleave);
            this.collectionMouseHandlers = null;
        }
        
        // Удаляем обработчики рынка если они были
        if (this.marketMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.marketMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.marketMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.marketMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.marketMouseHandlers.mouseleave);
            this.marketMouseHandlers = null;
        }
        
        // Удаляем обработчики трофеев если они были
        if (this.trophiesMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.trophiesMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.trophiesMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.trophiesMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.trophiesMouseHandlers.mouseleave);
            this.trophiesMouseHandlers = null;
        }
        
        // Удаляем обработчик скролла карты если он был
        if (this.mapWheelHandler) {
            this.canvas.removeEventListener('wheel', this.mapWheelHandler);
            this.mapWheelHandler = null;
        }
        
        // Добавляем обработчики для главного экрана
        this.inputManager.on('pointerdown', (pos) => {
            if (this.currentScreen === 'home') {
                this.homeScreen.handleClick(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointermove', (pos) => {
            if (this.currentScreen === 'home') {
                this.homeScreen.handleMouseMove(pos.x, pos.y);
            }
        });
    }
    
    setupFishingInput() {
        // Обработчики для рыбалки уже настроены в FishingGame
        // Просто удаляем обработчики главного экрана
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчики магазина если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        // Удаляем обработчики коллекции если они были
        if (this.collectionMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.collectionMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.collectionMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.collectionMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.collectionMouseHandlers.mouseleave);
            this.collectionMouseHandlers = null;
        }
        
        // Удаляем обработчики трофеев если они были
        if (this.trophiesMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.trophiesMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.trophiesMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.trophiesMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.trophiesMouseHandlers.mouseleave);
            this.trophiesMouseHandlers = null;
        }
        
        // Удаляем обработчик скролла карты если он был
        if (this.mapWheelHandler) {
            this.canvas.removeEventListener('wheel', this.mapWheelHandler);
            this.mapWheelHandler = null;
        }
        
        // Переинициализируем обработчики рыбалки
        this.fishingGame.setupInput();
    }
    
    setupMapInput() {
        // Удаляем старые обработчики
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчики магазина если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        // Удаляем обработчики трофеев если они были
        if (this.trophiesMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.trophiesMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.trophiesMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.trophiesMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.trophiesMouseHandlers.mouseleave);
            this.trophiesMouseHandlers = null;
        }
        
        // Добавляем обработчики для карты через inputManager
        this.inputManager.on('pointerdown', (pos) => {
            if (this.currentScreen === 'map' && this.mapScreen) {
                this.mapScreen.handleMouseDown(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointermove', (pos) => {
            if (this.currentScreen === 'map' && this.mapScreen) {
                this.mapScreen.handleMouseMove(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointerup', (pos) => {
            if (this.currentScreen === 'map' && this.mapScreen) {
                this.mapScreen.handleMouseUp(pos.x, pos.y);
            }
        });
        
        // Обработка скролла для карты
        if (!this.mapWheelHandler) {
            this.mapWheelHandler = (e) => {
                if (this.currentScreen === 'map' && this.mapScreen) {
                    e.preventDefault();
                    this.mapScreen.handleWheel(e.deltaY);
                }
            };
            this.canvas.addEventListener('wheel', this.mapWheelHandler, { passive: false });
        }
    }
    
    setupShopInput() {
        // Удаляем старые обработчики
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчик скролла карты если он был
        if (this.mapWheelHandler) {
            this.canvas.removeEventListener('wheel', this.mapWheelHandler);
            this.mapWheelHandler = null;
        }
        
        // Удаляем обработчики магазина если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        // Добавляем обработчики для магазина ТОЛЬКО через inputManager (как в QuestUI)
        this.inputManager.on('pointerdown', (pos) => {
            if (this.currentScreen === 'shop') {
                this.shopUI.handleMouseDown(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointermove', (pos) => {
            if (this.currentScreen === 'shop') {
                this.shopUI.handleMouseMove(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointerup', (pos) => {
            if (this.currentScreen === 'shop') {
                this.shopUI.handleMouseUp(pos.x, pos.y);
                // Если магазин закрыт, возвращаемся на главный экран
                if (!this.shopUI.visible) {
                    this.navigateTo('home');
                }
            }
        });
        
        this.inputManager.on('wheel', (data) => {
            if (this.currentScreen === 'shop') {
                this.shopUI.handleScroll(data.deltaY);
            }
        });
    }
    
    setupTipsInput() {
        // Удаляем старые обработчики
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчик скролла карты если он был
        if (this.mapWheelHandler) {
            this.canvas.removeEventListener('wheel', this.mapWheelHandler);
            this.mapWheelHandler = null;
        }
        
        // Удаляем обработчики магазина если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        // Добавляем обработчики для окна подсказок
        this.inputManager.on('pointerdown', (pos) => {
            if (this.fishingTipsUI.visible) {
                this.fishingTipsUI.handleClick(pos.x, pos.y);
            }
        });
    }
    
    setupInventoryInput() {
        // Удаляем старые обработчики
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчик скролла карты если он был
        if (this.mapWheelHandler) {
            this.canvas.removeEventListener('wheel', this.mapWheelHandler);
            this.mapWheelHandler = null;
        }
        
        // Удаляем обработчики магазина если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        // Удаляем обработчики инвентаря если они были
        if (this.inventoryMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.inventoryMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.inventoryMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.inventoryMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.inventoryMouseHandlers.mouseleave);
            this.inventoryMouseHandlers = null;
        }
        
        // Добавляем обработчики для инвентаря ТОЛЬКО через inputManager (как в QuestUI)
        this.inputManager.on('pointerdown', (pos) => {
            if (this.currentScreen === 'inventory') {
                this.inventoryUI.handleMouseDown(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointermove', (pos) => {
            if (this.currentScreen === 'inventory') {
                this.inventoryUI.handleMouseMove(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointerup', (pos) => {
            if (this.currentScreen === 'inventory') {
                this.inventoryUI.handleMouseUp(pos.x, pos.y);
                // Если инвентарь закрыт, возвращаемся на главный экран
                if (!this.inventoryUI.visible) {
                    this.navigateTo('home');
                }
            }
        });
        
        this.inputManager.on('wheel', (data) => {
            if (this.currentScreen === 'inventory') {
                this.inventoryUI.handleScroll(data.deltaY);
            }
        });
    }
    
    setupCollectionInput() {
        // Удаляем старые обработчики
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчики магазина если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        // Удаляем обработчики инвентаря если они были
        if (this.inventoryMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.inventoryMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.inventoryMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.inventoryMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.inventoryMouseHandlers.mouseleave);
            this.inventoryMouseHandlers = null;
        }
        
        // Удаляем обработчики рынка если они были
        if (this.marketMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.marketMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.marketMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.marketMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.marketMouseHandlers.mouseleave);
            this.marketMouseHandlers = null;
        }
        
        // Удаляем обработчик скролла карты если он был
        if (this.mapWheelHandler) {
            this.canvas.removeEventListener('wheel', this.mapWheelHandler);
            this.mapWheelHandler = null;
        }
        
        // Обработчики для перетаскивания списка
        const handleMouseDown = (e) => {
            if (this.currentScreen !== 'collection') return;
            
            // Используем screenToGame как в InputManager
            const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
            this.collectionUI.handleMouseDown(pos.x, pos.y);
        };
        
        const handleMouseMove = (e) => {
            if (this.currentScreen !== 'collection') return;
            
            // Используем screenToGame как в InputManager
            const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
            this.collectionUI.handleMouseMove(pos.x, pos.y);
        };
        
        const handleMouseUp = () => {
            if (this.currentScreen !== 'collection') return;
            this.collectionUI.handleMouseUp();
        };
        
        const handleMouseLeave = () => {
            if (this.currentScreen !== 'collection') return;
            this.collectionUI.handleMouseUp();
        };
        
        // Добавляем обработчики напрямую к canvas
        this.canvas.addEventListener('mousedown', handleMouseDown);
        this.canvas.addEventListener('mousemove', handleMouseMove);
        this.canvas.addEventListener('mouseup', handleMouseUp);
        this.canvas.addEventListener('mouseleave', handleMouseLeave);
        
        // Сохраняем ссылки для удаления при смене экрана
        this.collectionMouseHandlers = {
            mousedown: handleMouseDown,
            mousemove: handleMouseMove,
            mouseup: handleMouseUp,
            mouseleave: handleMouseLeave
        };
        
        // Добавляем обработчики для коллекции
        this.inputManager.on('pointerdown', (pos) => {
            if (this.currentScreen === 'collection') {
                this.collectionUI.handleMouseDown(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointermove', (pos) => {
            if (this.currentScreen === 'collection') {
                this.collectionUI.handleMouseMove(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointerup', (pos) => {
            if (this.currentScreen === 'collection') {
                this.collectionUI.handleMouseUp();
                // Если коллекция закрыта, возвращаемся на главный экран
                if (!this.collectionUI.visible) {
                    this.navigateTo('home');
                }
            }
        });
        
        this.inputManager.on('wheel', (data) => {
            if (this.currentScreen === 'collection') {
                this.collectionUI.handleScroll(data.deltaY);
            }
        });
    }
    
    setupMarketInput() {
        // Удаляем старые обработчики
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчики магазина если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        // Удаляем обработчики инвентаря если они были
        if (this.inventoryMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.inventoryMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.inventoryMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.inventoryMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.inventoryMouseHandlers.mouseleave);
            this.inventoryMouseHandlers = null;
        }
        
        // Удаляем обработчики коллекции если они были
        if (this.collectionMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.collectionMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.collectionMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.collectionMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.collectionMouseHandlers.mouseleave);
            this.collectionMouseHandlers = null;
        }
        
        // Удаляем обработчики заданий если они были
        if (this.questMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.questMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.questMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.questMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.questMouseHandlers.mouseleave);
            this.questMouseHandlers = null;
        }
        
        // Удаляем обработчики наград если они были
        if (this.rewardsMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.rewardsMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.rewardsMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.rewardsMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.rewardsMouseHandlers.mouseleave);
            this.rewardsMouseHandlers = null;
        }
        
        // Удаляем обработчик скролла карты если он был
        if (this.mapWheelHandler) {
            this.canvas.removeEventListener('wheel', this.mapWheelHandler);
            this.mapWheelHandler = null;
        }
        
        // Обработчики для перетаскивания списка
        const handleMouseDown = (e) => {
            if (this.currentScreen !== 'market') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.marketUI.handleMouseDown(x, y);
        };
        
        const handleMouseMove = (e) => {
            if (this.currentScreen !== 'market') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.marketUI.handleMouseMove(x, y);
        };
        
        const handleMouseUp = () => {
            if (this.currentScreen !== 'market') return;
            this.marketUI.handleMouseUp();
        };
        
        const handleMouseLeave = () => {
            if (this.currentScreen !== 'market') return;
            this.marketUI.handleMouseUp();
        };
        
        // Добавляем обработчики напрямую к canvas
        this.canvas.addEventListener('mousedown', handleMouseDown);
        this.canvas.addEventListener('mousemove', handleMouseMove);
        this.canvas.addEventListener('mouseup', handleMouseUp);
        this.canvas.addEventListener('mouseleave', handleMouseLeave);
        
        // Сохраняем ссылки для удаления при смене экрана
        this.marketMouseHandlers = {
            mousedown: handleMouseDown,
            mousemove: handleMouseMove,
            mouseup: handleMouseUp,
            mouseleave: handleMouseLeave
        };
        
        // Добавляем обработчики для рынка
        this.inputManager.on('pointerdown', (pos) => {
            if (this.currentScreen === 'market') {
                this.marketUI.handleMouseDown(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointermove', (pos) => {
            if (this.currentScreen === 'market') {
                this.marketUI.handleMouseMove(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointerup', (pos) => {
            if (this.currentScreen === 'market') {
                this.marketUI.handleMouseUp();
                // Если рынок закрыт, переходим на главный экран
                if (!this.marketUI.visible) {
                    this.navigateTo('home');
                }
            }
        });
        
        this.inputManager.on('wheel', (data) => {
            if (this.currentScreen === 'market') {
                this.marketUI.handleScroll(data.deltaY);
            }
        });
    }
    
    setupQuestInput() {
        // Удаляем старые обработчики
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчики других UI если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        if (this.collectionMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.collectionMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.collectionMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.collectionMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.collectionMouseHandlers.mouseleave);
            this.collectionMouseHandlers = null;
        }
        
        if (this.marketMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.marketMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.marketMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.marketMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.marketMouseHandlers.mouseleave);
            this.marketMouseHandlers = null;
        }
        
        if (this.mapWheelHandler) {
            this.canvas.removeEventListener('wheel', this.mapWheelHandler);
            this.mapWheelHandler = null;
        }
        
        // Обработчики для перетаскивания списка
        const handleMouseDown = (e) => {
            if (this.currentScreen !== 'quests') return;
            
            // Используем screenToGame как в InputManager
            const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
            this.questUI.handleMouseDown(pos.x, pos.y);
        };
        
        const handleMouseMove = (e) => {
            if (this.currentScreen !== 'quests') return;
            
            // Используем screenToGame как в InputManager
            const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
            this.questUI.handleMouseMove(pos.x, pos.y);
        };
        
        const handleMouseUp = () => {
            if (this.currentScreen !== 'quests') return;
            this.questUI.handleMouseUp();
        };
        
        const handleMouseLeave = () => {
            if (this.currentScreen !== 'quests') return;
            this.questUI.handleMouseUp();
        };
        
        // Добавляем обработчики напрямую к canvas
        this.canvas.addEventListener('mousedown', handleMouseDown);
        this.canvas.addEventListener('mousemove', handleMouseMove);
        this.canvas.addEventListener('mouseup', handleMouseUp);
        this.canvas.addEventListener('mouseleave', handleMouseLeave);
        
        // Сохраняем ссылки для удаления при смене экрана
        this.questMouseHandlers = {
            mousedown: handleMouseDown,
            mousemove: handleMouseMove,
            mouseup: handleMouseUp,
            mouseleave: handleMouseLeave
        };
        
        // Добавляем обработчики для заданий
        this.inputManager.on('pointerdown', (pos) => {
            if (this.currentScreen === 'quests') {
                this.questUI.handleMouseDown(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointermove', (pos) => {
            if (this.currentScreen === 'quests') {
                this.questUI.handleMouseMove(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointerup', (pos) => {
            if (this.currentScreen === 'quests') {
                this.questUI.handleMouseUp();
                // Если задания закрыты, возвращаемся на главный экран
                if (!this.questUI.visible) {
                    this.navigateTo('home');
                }
            }
        });
        
        this.inputManager.on('wheel', (data) => {
            if (this.currentScreen === 'quests') {
                this.questUI.handleScroll(data.deltaY);
            }
        });
    }
    
    setupProfileInput() {
        // Удаляем старые обработчики
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчики других UI если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        if (this.collectionMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.collectionMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.collectionMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.collectionMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.collectionMouseHandlers.mouseleave);
            this.collectionMouseHandlers = null;
        }
        
        if (this.marketMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.marketMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.marketMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.marketMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.marketMouseHandlers.mouseleave);
            this.marketMouseHandlers = null;
        }
        
        if (this.questMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.questMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.questMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.questMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.questMouseHandlers.mouseleave);
            this.questMouseHandlers = null;
        }
        
        if (this.rewardsMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.rewardsMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.rewardsMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.rewardsMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.rewardsMouseHandlers.mouseleave);
            this.rewardsMouseHandlers = null;
        }
        
        if (this.mapWheelHandler) {
            this.canvas.removeEventListener('wheel', this.mapWheelHandler);
            this.mapWheelHandler = null;
        }
        
        // Добавляем обработчики для профиля
        this.inputManager.on('pointerdown', (pos) => {
            if (this.currentScreen === 'profile') {
                const handled = this.profileUI.handleClick(pos.x, pos.y);
                if (!handled || !this.profileUI.visible) {
                    // Профиль закрыт - возвращаемся на главный экран
                    this.navigateTo('home');
                }
            }
        });
    }
    
    setupRewardsInput() {
        // Удаляем старые обработчики
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчики других UI если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        if (this.collectionMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.collectionMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.collectionMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.collectionMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.collectionMouseHandlers.mouseleave);
            this.collectionMouseHandlers = null;
        }
        
        if (this.marketMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.marketMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.marketMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.marketMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.marketMouseHandlers.mouseleave);
            this.marketMouseHandlers = null;
        }
        
        if (this.questMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.questMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.questMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.questMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.questMouseHandlers.mouseleave);
            this.questMouseHandlers = null;
        }
        
        if (this.settingsMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.settingsMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.settingsMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.settingsMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.settingsMouseHandlers.mouseleave);
            this.settingsMouseHandlers = null;
        }
        
        if (this.trophiesMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.trophiesMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.trophiesMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.trophiesMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.trophiesMouseHandlers.mouseleave);
            this.trophiesMouseHandlers = null;
        }
        
        if (this.mapWheelHandler) {
            this.canvas.removeEventListener('wheel', this.mapWheelHandler);
            this.mapWheelHandler = null;
        }
        
        // Обработчики для перетаскивания списка
        const handleMouseDown = (e) => {
            if (this.currentScreen !== 'rewards') return;
            
            const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
            this.dailyRewardsUI.handleMouseDown(pos.x, pos.y);
        };
        
        const handleMouseMove = (e) => {
            if (this.currentScreen !== 'rewards') return;
            
            const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
            this.dailyRewardsUI.handleMouseMove(pos.x, pos.y);
        };
        
        const handleMouseUp = (e) => {
            if (this.currentScreen !== 'rewards') return;
            
            const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
            this.dailyRewardsUI.handleMouseUp(pos.x, pos.y);
        };
        
        const handleMouseLeave = (e) => {
            if (this.currentScreen !== 'rewards') return;
            
            const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
            this.dailyRewardsUI.handleMouseUp(pos.x, pos.y);
        };
        
        // Добавляем обработчики напрямую к canvas
        this.canvas.addEventListener('mousedown', handleMouseDown);
        this.canvas.addEventListener('mousemove', handleMouseMove);
        this.canvas.addEventListener('mouseup', handleMouseUp);
        this.canvas.addEventListener('mouseleave', handleMouseLeave);
        
        // Сохраняем ссылки для удаления при смене экрана
        this.rewardsMouseHandlers = {
            mousedown: handleMouseDown,
            mousemove: handleMouseMove,
            mouseup: handleMouseUp,
            mouseleave: handleMouseLeave
        };
        
        // Добавляем обработчики для наград
        this.inputManager.on('pointerdown', (pos) => {
            if (this.currentScreen === 'rewards') {
                this.dailyRewardsUI.handleMouseDown(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointermove', (pos) => {
            if (this.currentScreen === 'rewards') {
                this.dailyRewardsUI.handleMouseMove(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointerup', (pos) => {
            if (this.currentScreen === 'rewards') {
                this.dailyRewardsUI.handleMouseUp(pos.x, pos.y);
                // Если награды закрыты, возвращаемся на главный экран
                if (!this.dailyRewardsUI.visible) {
                    this.navigateTo('home');
                }
            }
        });
        
        this.inputManager.on('wheel', (data) => {
            if (this.currentScreen === 'rewards') {
                this.dailyRewardsUI.handleScroll(data.deltaY);
            }
        });
    }
    
    setupRatingInput() {
        // Удаляем старые обработчики
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчики других UI если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        if (this.collectionMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.collectionMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.collectionMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.collectionMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.collectionMouseHandlers.mouseleave);
            this.collectionMouseHandlers = null;
        }
        
        if (this.marketMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.marketMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.marketMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.marketMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.marketMouseHandlers.mouseleave);
            this.marketMouseHandlers = null;
        }
        
        if (this.questMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.questMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.questMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.questMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.questMouseHandlers.mouseleave);
            this.questMouseHandlers = null;
        }
        
        if (this.settingsMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.settingsMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.settingsMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.settingsMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.settingsMouseHandlers.mouseleave);
            this.settingsMouseHandlers = null;
        }
        
        if (this.rewardsMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.rewardsMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.rewardsMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.rewardsMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.rewardsMouseHandlers.mouseleave);
            this.rewardsMouseHandlers = null;
        }
        
        if (this.mapWheelHandler) {
            this.canvas.removeEventListener('wheel', this.mapWheelHandler);
            this.mapWheelHandler = null;
        }
        
        // Обработчики для перетаскивания списка рейтинга
        const handleMouseDown = (e) => {
            if (this.currentScreen !== 'rating') return;
            
            const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
            this.ratingUI.handleMouseDown(pos.x, pos.y);
        };
        
        const handleMouseMove = (e) => {
            if (this.currentScreen !== 'rating') return;
            
            const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
            this.ratingUI.handleMouseMove(pos.x, pos.y);
        };
        
        const handleMouseUp = (e) => {
            if (this.currentScreen !== 'rating') return;
            
            const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
            this.ratingUI.handleMouseUp(pos.x, pos.y);
        };
        
        const handleMouseLeave = (e) => {
            if (this.currentScreen !== 'rating') return;
            
            const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
            this.ratingUI.handleMouseUp(pos.x, pos.y);
        };
        
        // Добавляем обработчики напрямую к canvas
        this.canvas.addEventListener('mousedown', handleMouseDown);
        this.canvas.addEventListener('mousemove', handleMouseMove);
        this.canvas.addEventListener('mouseup', handleMouseUp);
        this.canvas.addEventListener('mouseleave', handleMouseLeave);
        
        // Сохраняем ссылки для удаления при смене экрана
        this.ratingMouseHandlers = {
            mousedown: handleMouseDown,
            mousemove: handleMouseMove,
            mouseup: handleMouseUp,
            mouseleave: handleMouseLeave
        };
        
        // Добавляем обработчики для рейтинга
        this.inputManager.on('pointerdown', (pos) => {
            if (this.currentScreen === 'rating') {
                this.ratingUI.handleMouseDown(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointermove', (pos) => {
            if (this.currentScreen === 'rating') {
                this.ratingUI.handleMouseMove(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointerup', (pos) => {
            if (this.currentScreen === 'rating') {
                this.ratingUI.handleMouseUp(pos.x, pos.y);
                // Если рейтинг закрыт, возвращаемся на главный экран
                if (!this.ratingUI.isOpen) {
                    this.navigateTo('home');
                }
            }
        });
        
        this.inputManager.on('wheel', (data) => {
            if (this.currentScreen === 'rating') {
                this.ratingUI.handleWheel(data.deltaY);
            }
        });
    }
    
    setupTrophiesInput() {
        // Удаляем старые обработчики
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчики других UI если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        if (this.ratingMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.ratingMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.ratingMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.ratingMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.ratingMouseHandlers.mouseleave);
            this.ratingMouseHandlers = null;
        }
        
        if (this.trophiesMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.trophiesMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.trophiesMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.trophiesMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.trophiesMouseHandlers.mouseleave);
            this.trophiesMouseHandlers = null;
        }
        
        if (this.mapWheelHandler) {
            this.canvas.removeEventListener('wheel', this.mapWheelHandler);
            this.mapWheelHandler = null;
        }
        
        // Добавляем обработчики для трофеев ТОЛЬКО через inputManager (как в QuestUI)
        this.inputManager.on('pointerdown', (pos) => {
            if (this.currentScreen === 'trophies') {
                this.trophyUI.handleMouseDown(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointermove', (pos) => {
            if (this.currentScreen === 'trophies') {
                this.trophyUI.handleMouseMove(pos.x, pos.y);
                this.trophyUI.updateHover(pos.x, pos.y);
            }
        });
        
        this.inputManager.on('pointerup', (pos) => {
            if (this.currentScreen === 'trophies') {
                const wasOpen = this.trophyUI.isOpen;
                this.trophyUI.handleMouseUp(pos.x, pos.y);
                
                // Если трофеи были открыты, но теперь закрыты - возвращаемся на главный экран
                if (wasOpen && !this.trophyUI.isOpen) {
                    setTimeout(() => {
                        this.navigateTo('home');
                    }, 0);
                }
            }
        });
        
        this.inputManager.on('wheel', (data) => {
            if (this.currentScreen === 'trophies') {
                this.trophyUI.handleWheel(data.deltaY);
            }
        });
    }
    
    setupSettingsInput() {
        // Удаляем старые обработчики
        this.inputManager.removeAllListeners();
        
        // Удаляем обработчики других UI если они были
        if (this.shopMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.shopMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.shopMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.shopMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.shopMouseHandlers.mouseleave);
            this.shopMouseHandlers = null;
        }
        
        if (this.collectionMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.collectionMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.collectionMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.collectionMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.collectionMouseHandlers.mouseleave);
            this.collectionMouseHandlers = null;
        }
        
        if (this.marketMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.marketMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.marketMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.marketMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.marketMouseHandlers.mouseleave);
            this.marketMouseHandlers = null;
        }
        
        if (this.questMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.questMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.questMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.questMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.questMouseHandlers.mouseleave);
            this.questMouseHandlers = null;
        }
        
        if (this.rewardsMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.rewardsMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.rewardsMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.rewardsMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.rewardsMouseHandlers.mouseleave);
            this.rewardsMouseHandlers = null;
        }
        
        if (this.trophiesMouseHandlers) {
            this.canvas.removeEventListener('mousedown', this.trophiesMouseHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.trophiesMouseHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.trophiesMouseHandlers.mouseup);
            this.canvas.removeEventListener('mouseleave', this.trophiesMouseHandlers.mouseleave);
            this.trophiesMouseHandlers = null;
        }
        
        if (this.mapWheelHandler) {
            this.canvas.removeEventListener('wheel', this.mapWheelHandler);
            this.mapWheelHandler = null;
        }
        
        // Обработчики для перетаскивания ползунков
        const handleMouseDown = (e) => {
            if (this.currentScreen !== 'settings') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.settingsUI.handleMouseDown(x, y);
        };
        
        const handleMouseMove = (e) => {
            if (this.currentScreen !== 'settings') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.settingsUI.handleMouseMove(x, y);
        };
        
        const handleMouseUp = () => {
            if (this.currentScreen !== 'settings') return;
            this.settingsUI.handleMouseUp();
        };
        
        const handleMouseLeave = () => {
            if (this.currentScreen !== 'settings') return;
            this.settingsUI.handleMouseUp();
        };
        
        // Добавляем обработчики напрямую к canvas
        this.canvas.addEventListener('mousedown', handleMouseDown);
        this.canvas.addEventListener('mousemove', handleMouseMove);
        this.canvas.addEventListener('mouseup', handleMouseUp);
        this.canvas.addEventListener('mouseleave', handleMouseLeave);
        
        // Сохраняем ссылки для удаления при смене экрана
        this.settingsMouseHandlers = {
            mousedown: handleMouseDown,
            mousemove: handleMouseMove,
            mouseup: handleMouseUp,
            mouseleave: handleMouseLeave
        };
        
        // Добавляем обработчики для настроек
        this.inputManager.on('pointerdown', (pos) => {
            if (this.currentScreen === 'settings') {
                const handled = this.settingsUI.handleClick(pos.x, pos.y);
                if (!handled || !this.settingsUI.visible) {
                    // Настройки закрыты - возвращаемся на главный экран
                    this.navigateTo('home');
                }
            }
        });
    }
    
    loadSounds() {
        console.log('🔊 Начало загрузки звуков...');
        
        // Звук клика по UI элементам (локально)
        this.audioManager.loadSound('klik', 'klik.wav');
        
        // Загружаем звуки рыбалки (локально)
        this.audioManager.loadSound('ulov', 'ulov.wav');      // Удачное вываживание
        this.audioManager.loadSound('ulov2', 'ulov2.mp3');    // Удачное вываживание (вариант 2)
        this.audioManager.loadSound('vzmah', 'vzmah.wav');    // Взмах удочки
        this.audioManager.loadSound('kat', 'kat.wav');        // Подмотка лески (зацикленный)
        this.audioManager.loadSound('porval', 'porval.mp3');  // Обрыв лески
        this.audioManager.loadSound('slomal', 'slomal.mp3');  // Поломка снасти
        
        // UI звуки (локально)
        this.audioManager.loadSound('nema', 'nema.mp3');      // Недостаточно валюты
        this.audioManager.loadSound('kup', 'kup.mp3');        // Успешная покупка/продажа
        this.audioManager.loadSound('obmen', 'obmen.mp3');    // Обмен валюты (марки)
        this.audioManager.loadSound('newur', 'newur.mp3');    // Новый уровень
        
        // Звуки поплавка (локально)
        this.audioManager.loadSound('pop1', 'pop1.wav');
        this.audioManager.loadSound('pop2', 'pop2.wav');
        this.audioManager.loadSound('pop3', 'pop3.wav');
        
        // Звуки подсечки (локально)
        this.audioManager.loadSound('pods1', 'pods1.wav');
        this.audioManager.loadSound('pods2', 'pods2.wav');
        
        // Атмосферные звуки - загружаем из облака
        const cloudSounds = [
            { name: 'veter1', path: 'sounds/ambient/veter1.wav' },
            { name: 'veter2', path: 'sounds/ambient/veter2.wav' },
            { name: 'veter3', path: 'sounds/ambient/veter3.wav' },
            { name: 'rain1', path: 'sounds/ambient/rain1.wav' },
            { name: 'rain2', path: 'sounds/ambient/rain2.wav' },
            { name: 'bird1', path: 'sounds/ambient/bird1.mp3' },
            { name: 'bird2', path: 'sounds/ambient/bird2.mp3' },
            { name: 'bird3', path: 'sounds/ambient/bird3.mp3' },
            { name: 'frog1', path: 'sounds/ambient/frog1.mp3' },
            { name: 'frog2', path: 'sounds/ambient/frog2.mp3' },
            { name: 'sverch', path: 'sounds/ambient/sverch.mp3' },
            { name: 'sova', path: 'sounds/ambient/sova.mp3' }
        ];
        
        // Загружаем атмосферные звуки из облака в фоне
        if (assetManager.cloudLoader) {
            cloudSounds.forEach(sound => {
                assetManager.cloudLoader.loadAudio(sound.path)
                    .then(audio => {
                        audio.volume = this.audioManager.ambientVolume;
                        this.audioManager.sounds.set(sound.name, audio);
                        console.log(`✅ Звук из облака загружен: ${sound.name}`);
                    })
                    .catch(err => {
                        console.warn(`⚠️ Не удалось загрузить звук ${sound.name}:`, err);
                    });
            });
        }
        
        // Загружаем музыку из облака в фоне
        this.loadBackgroundMusic();
        
        console.log('✅ Локальные звуки загружены. Облачные звуки загружаются в фоне...');
    }
    
    // Загрузка фоновой музыки из облака
    async loadBackgroundMusic() {
        if (!assetManager.cloudLoader) return;
        
        try {
            console.log('🎵 Загрузка фоновой музыки из облака...');
            const musicAudio = await assetManager.cloudLoader.loadAudio('sounds/music/muz.mp3');
            
            if (musicAudio) {
                musicAudio.loop = true;
                musicAudio.volume = this.audioManager.musicVolume;
                this.audioManager.music = musicAudio;
                
                console.log('✅ Фоновая музыка загружена из облака');
                
                // Автоматически включаем музыку если она включена в настройках
                if (this.audioManager.musicEnabled && !this.audioManager.isMuted) {
                    this.audioManager.playMusic();
                }
            }
        } catch (error) {
            console.warn('⚠️ Не удалось загрузить фоновую музыку:', error);
        }
    }
    
    start() {
        this.lastTime = performance.now();
        this.gameLoop();
        
        // Автосохранение каждые 30 секунд
        this.autoSaveInterval = setInterval(() => {
            this.saveGameData();
        }, 30000);
    }
    
    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Ограничение dt
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(dt) {
        // Обновляем время игры в профиле
        if (this.profileSystem) {
            this.profileSystem.updatePlayTime(dt);
        }
        
        if (this.currentScreen === 'home') {
            this.homeScreen.update(dt);
            // Обновляем уровень и опыт в ProfileSystem для отображения на главном экране
            this.profileSystem.updateLevelAndXP(
                this.fishingGame.progression?.level || 1,
                this.fishingGame.progression?.currentXP || 0
            );
        } else if (this.currentScreen === 'fishing') {
            this.fishingGame.update(dt);
            // Обновляем уровень и опыт в ProfileSystem для отображения в интерфейсе рыбалки
            this.profileSystem.updateLevelAndXP(
                this.fishingGame.progression?.level || 1,
                this.fishingGame.progression?.currentXP || 0
            );
        } else if (this.currentScreen === 'shop') {
            this.shopUI.update(dt);
            // Обновляем баланс в магазине
            this.shopUI.playerCoins = this.fishingGame.coins;
            this.shopUI.playerPremiumCoins = this.fishingGame.premiumCoins;
        } else if (this.currentScreen === 'inventory') {
            this.inventoryUI.update(dt);
            // Обновляем баланс в инвентаре
            this.inventoryUI.playerCoins = this.fishingGame.coins;
        } else if (this.currentScreen === 'collection') {
            this.collectionUI.update(dt);
        } else if (this.currentScreen === 'market') {
            this.marketUI.update(dt);
            // Обновляем баланс в рынке
            this.marketUI.playerCoins = this.fishingGame.coins;
        } else if (this.currentScreen === 'quests') {
            this.questUI.update(dt);
        } else if (this.currentScreen === 'profile') {
            this.profileUI.update(dt);
            // Обновляем уровень и опыт в профиле
            this.profileSystem.updateLevelAndXP(
                this.fishingGame.progression?.level || 1,
                this.fishingGame.progression?.currentXP || 0
            );
            // Обновляем количество открытых локаций
            this.profileSystem.updateLocationsUnlocked(
                this.fishingGame.unlockedZones?.length || 1
            );
        } else if (this.currentScreen === 'settings') {
            this.settingsUI.update(dt);
        } else if (this.currentScreen === 'rewards') {
            this.dailyRewardsUI.update(dt);
        } else if (this.currentScreen === 'rating') {
            this.ratingUI.update(dt);
        } else if (this.currentScreen === 'trophies') {
            this.trophyUI.update(dt);
            // Обновляем баланс в трофеях
            this.trophyUI.playerCoins = this.fishingGame.coins;
            this.trophyUI.playerGems = this.fishingGame.premiumCoins;
            this.trophyUI.availableFish = this.fishingGame.storedFish;
        } else if (this.currentScreen === 'map' && this.mapScreen) {
            this.mapScreen.update(dt);
        }
    }
    
    render() {
        if (this.currentScreen === 'home') {
            this.homeScreen.render();
        } else if (this.currentScreen === 'fishing') {
            this.fishingGame.render();
        } else if (this.currentScreen === 'shop') {
            // Рисуем главный экран как фон
            this.homeScreen.render();
            // Поверх рисуем магазин
            this.shopUI.render(this.ctx);
        } else if (this.currentScreen === 'inventory') {
            // Рисуем главный экран как фон
            this.homeScreen.render();
            // Поверх рисуем инвентарь
            this.inventoryUI.render(this.ctx);
        } else if (this.currentScreen === 'collection') {
            // Рисуем главный экран как фон
            this.homeScreen.render();
            // Поверх рисуем коллекцию
            this.collectionUI.render(this.ctx);
        } else if (this.currentScreen === 'market') {
            // Рисуем главный экран как фон
            this.homeScreen.render();
            // Поверх рисуем рынок
            this.marketUI.render(this.ctx);
        } else if (this.currentScreen === 'quests') {
            // Рисуем главный экран как фон
            this.homeScreen.render();
            // Поверх рисуем задания
            this.questUI.render();
        } else if (this.currentScreen === 'profile') {
            // Рисуем главный экран как фон
            this.homeScreen.render();
            // Поверх рисуем профиль
            this.profileUI.render();
        } else if (this.currentScreen === 'settings') {
            // Рисуем главный экран как фон
            this.homeScreen.render();
            // Поверх рисуем настройки
            this.settingsUI.render(this.ctx);
        } else if (this.currentScreen === 'rewards') {
            // Рисуем главный экран как фон
            this.homeScreen.render();
            // Поверх рисуем награды
            this.dailyRewardsUI.render();
        } else if (this.currentScreen === 'rating') {
            // Рисуем главный экран как фон
            this.homeScreen.render();
            // Поверх рисуем рейтинг
            this.ratingUI.render();
        } else if (this.currentScreen === 'trophies') {
            // Рисуем только трофеи (отдельная локация)
            this.trophyUI.render();
        } else if (this.currentScreen === 'map' && this.mapScreen) {
            this.mapScreen.render();
        }
        
        // Рисуем окно подсказок поверх всего если оно видимо
        if (this.fishingTipsUI && this.fishingTipsUI.visible) {
            this.fishingTipsUI.draw(this.ctx, this.scaleManager);
        }
        
        // Рисуем индикатор загрузки поверх всего
        if (this.loadingIndicator && this.loadingIndicator.isVisible) {
            const locale = window.localizationSystem?.currentLocale || 'ru';
            this.loadingIndicator.render(this.ctx, this.canvas.width, this.canvas.height, locale);
        }
        
        // Рисуем кастомный курсор поверх всего
        if (this.customCursor) {
            this.customCursor.render(this.ctx);
        }
    }

    /**
     * Handle IAP purchase through Playgama SDK
     * @param {Object} item - IAP item to purchase
     */
    async handleIAPPurchase(item) {
        if (!window.playgamaSDK || !window.playgamaSDK.isPaymentsReady) {
            console.error('💳 Playgama SDK payments not ready');
            return;
        }

        try {
            console.log(`💳 Initiating IAP purchase: ${item.id} - ${item.name}`);
            
            // Initiate purchase through SDK (SDK handles all UI)
            const result = await window.playgamaSDK.purchase(item.id);
            
            if (result.success) {
                console.log('💳 Purchase successful!', result.purchase);
                
                // Process the purchase
                await this.processIAPPurchase(result.purchase);
                
                // Update shop UI with new balances
                if (this.shopUI && this.shopUI.visible) {
                    this.shopUI.playerCoins = this.fishingGame.coins;
                    this.shopUI.playerPremiumCoins = this.fishingGame.premiumCoins;
                }
            } else {
                console.error('💳 Purchase failed:', result.error);
            }
        } catch (error) {
            console.error('💳 IAP purchase error:', error);
        }
    }

    /**
     * Process IAP purchase and grant items
     * @param {Object} purchase - Purchase object from SDK
     */
    async processIAPPurchase(purchase) {
        const productID = purchase.productID;
        const purchaseToken = purchase.purchaseToken;
        
        console.log(`💳 Processing purchase: ${productID}`);
        
        // Get IAP item data - check both IAP_DATABASE and PREMIUM_DATABASE
        let iapItem = getIAPItem(productID);
        
        // If not found in IAP_DATABASE, check PREMIUM_DATABASE for items with currency: 'iap'
        if (!iapItem && typeof PREMIUM_DATABASE !== 'undefined') {
            iapItem = PREMIUM_DATABASE.find(item => item.id === productID && item.currency === 'iap');
        }
        
        if (!iapItem) {
            console.error(`💳 Unknown product: ${productID}`);
            // Still consume the purchase to avoid it being stuck
            const consumed = await window.playgamaSDK.consumePurchase(purchaseToken);
            if (consumed) {
                console.log(`💳 Unknown purchase consumed`);
            }
            return;
        }

        // Grant items based on purchase type
        let shouldConsume = false;
        
        switch (iapItem.type) {
            case 'bundle':
                // Premium bundle - grant all contents
                if (iapItem.contents) {
                    if (iapItem.contents.premiumCoins) {
                        this.fishingGame.premiumCoins += iapItem.contents.premiumCoins;
                        console.log(`💎 +${iapItem.contents.premiumCoins} premium coins`);
                        // Регистрируем заработанные марки в профиле
                        if (this.profileSystem) {
                            this.profileSystem.registerGemsEarned(iapItem.contents.premiumCoins);
                        }
                    }
                    if (iapItem.contents.regularCoins) {
                        this.fishingGame.coins += iapItem.contents.regularCoins;
                        console.log(`💰 +${iapItem.contents.regularCoins} regular coins`);
                        // Регистрируем заработанные монеты в профиле
                        if (this.profileSystem) {
                            this.profileSystem.registerCoinsEarned(iapItem.contents.regularCoins);
                        }
                    }
                    if (iapItem.contents.energyDrink) {
                        // Add energy drinks to inventory
                        console.log(`⚡ +${iapItem.contents.energyDrink} energy drinks`);
                    }
                    if (iapItem.contents.feedBonus) {
                        // Add feed bonuses to inventory
                        console.log(`🌾 +${iapItem.contents.feedBonus} feed bonuses`);
                    }
                    if (iapItem.contents.noAds) {
                        // Disable ads permanently
                        console.log(`🚫 Ads disabled`);
                    }
                }
                shouldConsume = true;
                break;
                
            case 'premium_coins':
                // Premium coins pack
                if (iapItem.contents && iapItem.contents.premiumCoins) {
                    this.fishingGame.premiumCoins += iapItem.contents.premiumCoins;
                    console.log(`💎 +${iapItem.contents.premiumCoins} premium coins`);
                    // Регистрируем заработанные марки в профиле
                    if (this.profileSystem) {
                        this.profileSystem.registerGemsEarned(iapItem.contents.premiumCoins);
                    }
                }
                shouldConsume = true;
                break;
                
            case 'regular_coins':
                // Regular coins pack
                if (iapItem.contents && iapItem.contents.regularCoins) {
                    this.fishingGame.coins += iapItem.contents.regularCoins;
                    console.log(`💰 +${iapItem.contents.regularCoins} regular coins`);
                    // Регистрируем заработанные монеты в профиле
                    if (this.profileSystem) {
                        this.profileSystem.registerCoinsEarned(iapItem.contents.regularCoins);
                    }
                }
                shouldConsume = true;
                break;
                
            case 'gear_bundle':
                // Gear bundle - add gear to inventory
                if (iapItem.contents) {
                    const gearInventory = this.fishingGame.gearInventory;
                    if (iapItem.contents.rod) {
                        gearInventory.addGear('rod', iapItem.contents.rod);
                        console.log(`🎣 +Rod tier ${iapItem.contents.rod}`);
                    }
                    if (iapItem.contents.line) {
                        gearInventory.addGear('line', iapItem.contents.line);
                        console.log(`🧵 +Line tier ${iapItem.contents.line}`);
                    }
                    if (iapItem.contents.float) {
                        gearInventory.addGear('float', iapItem.contents.float);
                        console.log(`🎈 +Float tier ${iapItem.contents.float}`);
                    }
                    if (iapItem.contents.hook) {
                        gearInventory.addGear('hook', iapItem.contents.hook);
                        console.log(`🪝 +Hook tier ${iapItem.contents.hook}`);
                    }
                    if (iapItem.contents.reel) {
                        gearInventory.addGear('reel', iapItem.contents.reel);
                        console.log(`🎣 +Reel tier ${iapItem.contents.reel}`);
                    }
                }
                shouldConsume = true;
                break;
                
            default:
                // For individual gear items or bonuses
                // Check if it's a gear item
                if (productID.startsWith('rod_') || productID.startsWith('line_') || 
                    productID.startsWith('float_') || productID.startsWith('hook_') || 
                    productID.startsWith('reel_')) {
                    // Add gear to inventory
                    const parts = productID.split('_');
                    const gearType = parts[0];
                    const tier = parseInt(parts[parts.length - 1]);
                    
                    if (gearType && tier) {
                        this.fishingGame.gearInventory.addGear(gearType, tier);
                        console.log(`🎣 +${gearType} tier ${tier}`);
                    }
                    shouldConsume = true;
                } else {
                    // Bonus items (premium effects) - add to bonus inventory
                    console.log(`✨ Processing bonus/premium item: ${productID}`);
                    
                    // Добавляем бонус в инвентарь
                    if (this.fishingGame.bonusInventoryUI) {
                        this.fishingGame.bonusInventoryUI.addBonus(productID, 1);
                        console.log(`📦 Bonus added to inventory: ${productID}`);
                    } else {
                        console.warn(`⚠️ bonusInventoryUI not available, cannot add bonus`);
                    }
                    
                    // Для постоянных эффектов (duration: -1) автоматически активируем
                    if (iapItem.duration === -1) {
                        if (this.fishingGame.premiumEffects) {
                            const activated = this.fishingGame.premiumEffects.activateEffect(productID);
                            if (activated) {
                                console.log(`✨ Permanent effect activated: ${iapItem.name || productID}`);
                            } else {
                                console.warn(`⚠️ Failed to activate permanent effect: ${productID}`);
                            }
                        } else {
                            console.warn(`⚠️ premiumEffects not available, cannot activate effect`);
                        }
                        
                        // Сохраняем состояние
                        if (this.fishingGame.bonusInventoryUI) {
                            this.fishingGame.bonusInventoryUI.saveInventory();
                        }
                    }
                    
                    shouldConsume = true;
                }
                break;
        }

        // Consume the purchase if it's consumable
        if (shouldConsume) {
            const consumed = await window.playgamaSDK.consumePurchase(purchaseToken);
            
            if (consumed) {
                console.log(`💳 ✅ Purchase consumed: ${productID}`);
            } else {
                console.error(`💳 ❌ Failed to consume purchase: ${productID}`);
            }
        }

        // Save game state
        await this.saveGameData();
        
        // Update UI
        if (this.shopUI) {
            this.shopUI.playerCoins = this.fishingGame.coins;
            this.shopUI.playerPremiumCoins = this.fishingGame.premiumCoins;
        }
    }

    /**
     * Check and process unprocessed purchases on game start
     */
    async checkUnprocessedPurchases() {
        if (!window.playgamaSDK || !window.playgamaSDK.isPaymentsReady) {
            return;
        }

        try {
            const purchases = await window.playgamaSDK.checkUnprocessedPurchases();
            
            if (purchases.length > 0) {
                console.log(`💳 Found ${purchases.length} unprocessed purchase(s), processing...`);
                
                for (const purchase of purchases) {
                    await this.processIAPPurchase(purchase);
                }
                
                console.log('💳 ✅ All unprocessed purchases processed');
            }
        } catch (error) {
            console.error('💳 Error checking unprocessed purchases:', error);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Сохранение состояния дня/ночи и игровых данных при закрытии
    window.addEventListener('beforeunload', () => {
        // Отменяем отложенное сохранение если оно есть
        if (game.saveDebounceTimer) {
            clearTimeout(game.saveDebounceTimer);
            game.saveDebounceTimer = null;
        }
        // Сохраняем все игровые данные в облако немедленно
        game.saveGameData();
    });
});
