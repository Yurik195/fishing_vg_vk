// -*- coding: utf-8 -*-
// Система подсказок и бонусов перед рыбалкой
class FishingTipsSystem {
    constructor() {
        // База подсказок с ключами локализации
        this.tipKeys = [
            // Основные механики
            'tip_day_night_fishing',
            'tip_gear_durability',
            'tip_fish_weight_xp',
            'tip_use_bait',
            'tip_keepnet_capacity',
            'tip_rare_fish_locations',
            'tip_line_tension',
            'tip_upgrade_gear',
            'tip_complete_quests',
            'tip_watch_float',
            'tip_premium_bonuses',
            'tip_sonar_info',
            'tip_trophy_crafting',
            'tip_unlock_locations',
            'tip_reel_speed',
            'tip_hook_types',
            'tip_float_visibility',
            'tip_monsters_rare',
            'tip_daily_rewards',
            'tip_rating_achievements',
            'tip_bonuses_stack',
            'tip_bait_consumption',
            'tip_gear_level_match',
            'tip_sell_common_keep_rare',
            'tip_time_during_fishing',
            
            // Характеристики снастей
            'tip_rod_max_weight',
            'tip_line_strength',
            'tip_float_sensitivity',
            'tip_hook_sharpness',
            'tip_reel_speed_effect',
            'tip_float_capacity',
            'tip_hook_size',
            'tip_line_material',
            'tip_float_type',
            'tip_reel_quality',
            'tip_rod_level',
            'tip_rod_stiffness',
            'tip_line_thickness',
            'tip_hook_size_match',
            'tip_float_capacity_match',
            
            // Зависимости и механики
            'tip_heavy_bait_float',
            'tip_large_fish_gear',
            'tip_float_fish_preference',
            'tip_active_fish_bait',
            'tip_predator_vs_peaceful',
            'tip_quality_gear_success',
            'tip_current_heavy_float',
            'tip_fish_hook_size',
            'tip_shy_fish_line',
            'tip_reaction_time',
            
            // Разделы главного меню
            'tip_map_locations',
            'tip_shop_gear',
            'tip_inventory_management',
            'tip_quests_rewards',
            'tip_collection_fish',
            'tip_trophies_crafting',
            'tip_rating_progress',
            'tip_profile_stats',
            'tip_settings_customize',
            'tip_daily_rewards_free'
        ];
        
        // Резервные подсказки на русском (если локализация не найдена)
        this.fallbackTips = [
            // Основные механики
            "Разные рыбы охотнее клюют в разное время суток. Следите за индикатором дня и ночи!",
            "Прочность снастей снижается при вываживании. Не забывайте их ремонтировать!",
            "Чем тяжелее рыба, тем больше опыта вы получите за её поимку.",
            "Используйте прикормку для привлечения определенных видов рыб.",
            "Садок имеет ограниченную вместимость. Продавайте рыбу выгоднее на рынке!",
            "Редкие рыбы стоят дороже. Ищите их в разных локациях!",
            "Натяжение лески показывает нагрузку. Не дайте леске порваться!",
            "Улучшайте снасти для ловли более крупной и редкой рыбы.",
            "Выполняйте задания для получения наград и опыта.",
            "Следите за поплавком, чтобы вовремя подсечь рыбу!",
            "Премиум бонусы помогут увеличить доход и опыт с рыбалки.",
            "Эхолот показывает информацию о рыбе в месте заброса.",
            "Чучела рыб можно изготовить из трофейных экземпляров.",
            "Открывайте новые локации для доступа к уникальным видам рыб.",
            "Катушка влияет на скорость подмотки лески при вываживании.",
            "Крючки разного типа подходят для разных видов рыб.",
            "Поплавок помогает заметить поклевку. Следите за ним!",
            "Монстры встречаются редко, но дают огромный опыт и награды.",
            "Ежедневные награды помогут получить бесплатные ресурсы.",
            "Рейтинг показывает ваши достижения среди других рыбаков.",
            "Бонусы за рекламу и марки суммируются между собой!",
            "Наживки расходуются при забросе. Покупайте их в магазине.",
            "Уровень снастей должен соответствовать локации для эффективной ловли.",
            "Продавайте обычную рыбу, а редкую сохраняйте для коллекции.",
            "Время в игре идет только во время рыбалки. Планируйте ловлю!",
            
            // Характеристики снастей
            "Максимальный вес удочки определяет, какую рыбу вы сможете поймать.",
            "Прочность лески влияет на то, выдержит ли она крупную рыбу.",
            "Чувствительность поплавка помогает заметить даже слабые поклевки.",
            "Острота крючка увеличивает шанс успешной подсечки рыбы.",
            "Скорость катушки влияет на то, как быстро вы вытащите рыбу.",
            "Грузоподъемность поплавка должна соответствовать весу наживки.",
            "Размер крючка влияет на то, какую рыбу он может зацепить.",
            "Материал лески определяет её незаметность для рыбы.",
            "Поплавки разных типов имеют различную чувствительность к поклевкам.",
            "Качество катушки влияет на плавность подмотки лески.",
            "Удочки высокого уровня позволяют ловить более тяжелую рыбу.",
            "Жесткость удочки определяет, как она поведет себя при вываживании.",
            "Тонкая леска менее заметна для рыбы, но менее прочная.",
            "Размер крючка должен соответствовать размеру рта рыбы.",
            "Поплавки с высокой грузоподъемностью подходят для тяжелых наживок.",
            
            // Зависимости и механики
            "Тяжелые наживки требуют более грузоподъемных поплавков.",
            "Крупная рыба требует прочной лески и острых крючков.",
            "Разные виды рыб предпочитают разные типы поплавков.",
            "Активные рыбы лучше клюют на движущиеся наживки.",
            "Хищные рыбы предпочитают живые наживки, мирные - растительные.",
            "Качественные снасти увеличивают шансы на успешную ловлю.",
            "Течение требует более тяжелых поплавков для стабильности.",
            "Размер рыбы должен соответствовать размеру крючка.",
            "Пугливые рыбы требуют тонкой и незаметной лески.",
            "Время реакции на поклевку влияет на успешность подсечки.",
            
            // Разделы главного меню
            "В разделе 'Карта' выбирайте локации с подходящими рыбами.",
            "В 'Магазине' покупайте и улучшайте снасти для лучшей ловли.",
            "Раздел 'Инвентарь' поможет управлять пойманной рыбой и снастями.",
            "В 'Заданиях' получайте цели и награды за их выполнение.",
            "Раздел 'Коллекция' показывает всех пойманных рыб и их характеристики.",
            "В 'Трофеях' создавайте чучела из самых крупных экземпляров.",
            "Раздел 'Рейтинг' показывает ваши достижения и место среди игроков.",
            "В 'Профиле' отслеживайте статистику и прогресс в игре.",
            "Раздел 'Настройки' позволяет настроить игру под ваши предпочтения.",
            "В 'Ежедневных наградах' получайте бесплатные ресурсы каждый день."
        ];
        
        // Проверяем соответствие массивов
        if (this.tipKeys.length !== this.fallbackTips.length) {
            console.error(`[FishingTips] Mismatch: ${this.tipKeys.length} keys vs ${this.fallbackTips.length} fallback tips`);
        }
        
        // Последнее время показа
        this.lastShowTime = 0;
        this.minShowInterval = 120000; // 2 минуты в миллисекундах
        
        // Загружаем сохраненное время
        this.loadState();
    }
    
    // Проверка нужно ли показать окно
    shouldShow() {
        const now = Date.now();
        const timeSinceLastShow = now - this.lastShowTime;
        return timeSinceLastShow >= this.minShowInterval;
    }
    
    // Получить случайную подсказку
    getRandomTip() {
        const index = Math.floor(Math.random() * this.tipKeys.length);
        const tipKey = this.tipKeys[index];
        
        // Пытаемся получить локализованный текст
        let tipText = this.fallbackTips[index]; // По умолчанию русский
        
        // Если есть система локализации, используем её
        if (typeof window !== 'undefined' && window.localizationSystem) {
            try {
                // Используем метод t() вместо getText()
                const localizedText = window.localizationSystem.t(tipKey, this.fallbackTips[index]);
                if (localizedText && localizedText !== tipKey) {
                    tipText = localizedText;
                }
            } catch (e) {
                console.warn('[FishingTips] Localization error:', e);
            }
        }
        
        return {
            number: index + 1,
            text: tipText,
            key: tipKey
        };
    }
    
    // Получить подходящую наживку для игрока
    getSuitableBait(playerLevel) {
        if (typeof BAITS_DATABASE === 'undefined' || !BAITS_DATABASE) {
            return { id: 1, name: "Хлеб", sprite: "n1.png", price: 50 };
        }
        
        // Получаем наживки доступные игроку
        const availableBaits = BAITS_DATABASE.filter(b => 
            b.unlockTier <= playerLevel
        );
        
        if (availableBaits.length === 0) {
            return { id: 1, name: "Хлеб", sprite: "n1.png", price: 50 };
        }
        
        // Выбираем наживку из верхней половины доступных (более качественные)
        const topTierBaits = availableBaits.filter(b => 
            b.unlockTier >= Math.max(1, playerLevel - 3)
        );
        
        const selectedBaits = topTierBaits.length > 0 ? topTierBaits : availableBaits;
        const randomBait = selectedBaits[Math.floor(Math.random() * selectedBaits.length)];
        
        // Рассчитываем цену как в магазине (за 10 штук)
        const shopPrice = randomBait.price || Math.ceil(50 * Math.pow(1.5, randomBait.unlockTier - 1));
        
        // Локализуем название наживки
        const localizedName = L(`bait_${randomBait.id}_name`, randomBait.name);
        
        return {
            id: randomBait.id,
            name: localizedName,
            sprite: randomBait.sprite,
            shopPrice: shopPrice, // Цена за 10 штук в монетах
            unlockTier: randomBait.unlockTier
        };
    }
    
    // Рассчитать цену в марках с учетом курса и скидки
    calculateGemPrice(shopPrice, quantity) {
        // Цена за единицу в монетах
        const pricePerUnit = shopPrice / 10;
        // Общая цена в монетах
        const totalCoins = pricePerUnit * quantity;
        // Конвертируем в марки (12 монет = 1 марка)
        const gemsPrice = totalCoins / 12;
        // Применяем скидку 5%
        const discountedPrice = gemsPrice * 0.95;
        // Округляем вверх до целого числа
        return Math.max(1, Math.ceil(discountedPrice));
    }
    
    // Получить бонусы за рекламу
    getAdRewards() {
        const playerLevel = this.getPlayerLevel();
        const bait = this.getSuitableBait(playerLevel);
        
        return [
            { id: 'ad_money', name: L('reward_price_boost_5', '+5% к продаже рыбы'), icon: '💰', duration: L('reward_duration_until_exit', 'До выхода'), type: 'price_boost', value: 0.05 },
            { id: 'ad_xp', name: L('reward_xp_boost_5', '+5% к опыту'), icon: '⭐', duration: L('reward_duration_until_exit', 'До выхода'), type: 'xp_boost', value: 0.05 },
            { 
                id: 'ad_baits', 
                name: `5x ${bait.name}`, 
                icon: '🪱', 
                duration: L('reward_duration_once', 'Единоразово'), 
                type: 'baits', 
                value: 5,
                baitData: bait
            }
        ];
    }
    
    // Получить бонусы за марки
    getGemRewards() {
        const playerLevel = this.getPlayerLevel();
        const bait1 = this.getSuitableBait(playerLevel);
        const bait2 = this.getSuitableBait(playerLevel);
        const bait3 = this.getSuitableBait(playerLevel);
        
        return [
            { id: 'gem_money', name: L('reward_price_boost_10', '+10% к продаже'), icon: '💰', price: 15, duration: L('reward_duration_until_exit', 'До выхода'), type: 'price_boost', value: 0.10 },
            { id: 'gem_xp', name: L('reward_xp_boost_10', '+10% к опыту'), icon: '⭐', price: 15, duration: L('reward_duration_until_exit', 'До выхода'), type: 'xp_boost', value: 0.10 },
            { id: 'gem_rare', name: L('reward_rare_fish_boost', '+3% к редкой рыбе'), icon: '🐟', price: 25, duration: L('reward_duration_until_exit', 'До выхода'), type: 'rare_fish_boost', value: 0.03 },
            { 
                id: 'gem_baits_cheap', 
                name: `10x ${bait1.name}`, 
                icon: '🪱', 
                price: this.calculateGemPrice(bait1.shopPrice, 10), 
                duration: L('reward_duration_once', 'Единоразово'), 
                type: 'baits', 
                value: 10,
                baitData: bait1
            },
            { 
                id: 'gem_baits_medium', 
                name: `25x ${bait2.name}`, 
                icon: '🪱', 
                price: this.calculateGemPrice(bait2.shopPrice, 25), 
                duration: L('reward_duration_once', 'Единоразово'), 
                type: 'baits', 
                value: 25,
                baitData: bait2
            }
        ];
    }
    
    // Получить уровень игрока
    getPlayerLevel() {
        if (this.fishingGame && this.fishingGame.progression) {
            return this.fishingGame.progression.level || 1;
        }
        return 1;
    }
    
    // Получить случайный бонусный набор
    getRandomBundle() {
        // Наборы снастей из iapData с уровнями и содержимым
        const gearBundles = [
            { 
                id: 'gear_bundle_starter', 
                name: L('bundle_starter_name', 'Набор начинающего'), 
                sprite: 'prem1.png', 
                price: 159, 
                priceCurrencyCode: 'YAN',
                currency: 'iap', 
                tier: 4, 
                description: L('bundle_starter_desc', 'Снасти 4 уровня'),
                contents: { rod: 4, line: 4, float: 3, hook: 4, reel: 3 }
            },
            { 
                id: 'gear_bundle_advanced', 
                name: L('bundle_advanced_name', 'Набор опытного'), 
                sprite: 'prem2.png', 
                price: 289, 
                priceCurrencyCode: 'YAN',
                currency: 'iap', 
                tier: 9, 
                description: L('bundle_advanced_desc', 'Снасти 9 уровня'),
                contents: { rod: 9, line: 10, float: 7, hook: 8, reel: 8 }
            },
            { 
                id: 'gear_bundle_master', 
                name: L('bundle_master_name', 'Набор мастера'), 
                sprite: 'prem3.png', 
                price: 399, 
                priceCurrencyCode: 'YAN',
                currency: 'iap', 
                tier: 14, 
                description: L('bundle_master_desc', 'Снасти 14 уровня'),
                contents: { rod: 14, line: 15, float: 16, hook: 17, reel: 13 }
            }
        ];
        
        // Синхронизируем цены из SDK если доступен
        if (window.playgamaSDK && window.playgamaSDK.isPaymentsReady) {
            gearBundles.forEach(bundle => {
                const productInfo = window.playgamaSDK.getProductInfo(bundle.id);
                if (productInfo) {
                    bundle.priceValue = productInfo.priceValue;
                    bundle.priceCurrencyCode = productInfo.priceCurrencyCode;
                    bundle.priceFormatted = productInfo.price; // "159 ЯН"
                }
            });
        }
        
        // Другие бонусы из магазина за ЯН
        const otherBonuses = [];
        
        // Иногда показываем другие бонусы
        if (Math.random() < 0.3 && otherBonuses.length > 0) {
            return otherBonuses[Math.floor(Math.random() * otherBonuses.length)];
        }
        
        // Обычно показываем наборы снастей
        return gearBundles[Math.floor(Math.random() * gearBundles.length)];
    }
    
    // Обновить время последнего показа
    updateShowTime() {
        this.lastShowTime = Date.now();
        this.saveState();
    }
    
    // Сохранение состояния
    saveState() {
        localStorage.setItem('fishingTipsSystem', JSON.stringify({
            lastShowTime: this.lastShowTime
        }));
    }
    
    // Загрузка состояния
    loadState() {
        const saved = localStorage.getItem('fishingTipsSystem');
        if (saved) {
            const data = JSON.parse(saved);
            this.lastShowTime = data.lastShowTime || 0;
        }
    }
}

// UI для системы подсказок
class FishingTipsUI {
    constructor(canvas, tipsSystem, fishingGame, audioManager, game = null) {
        this.canvas = canvas;
        this.tipsSystem = tipsSystem;
        this.fishingGame = fishingGame;
        this.audioManager = audioManager;
        this.game = game; // Ссылка на главный объект Game для handleIAPPurchase
        this.visible = false;
        
        // Данные для отображения (выбираются один раз при show)
        this.currentTip = null;
        this.selectedAdReward = null;
        this.selectedGemReward = null;
        this.selectedBundle = null;
        
        // Флаг просмотра рекламы
        this.adWatched = false;
        
        // Флаг покупки бонуса за марки
        this.gemRewardPurchased = false;
        
        // Активные бонусы сессии
        this.sessionBonuses = [];
        
        // Обработчики
        this.onContinue = null;
        
        // Кэш изображений
        this.imageCache = {};
        
        // Анимация кнопок
        this.buttonAnimations = {
            adReward: { scale: 1, pressed: false },
            gemReward: { scale: 1, pressed: false },
            bundle: { scale: 1, pressed: false },
            continue: { scale: 1, pressed: false }
        };
    }
    
    // Показать окно
    show(onContinue) {
        this.visible = true;
        this.onContinue = onContinue;
        
        // Получаем данные один раз при входе
        this.currentTip = this.tipsSystem.getRandomTip();
        
        // Проверяем что подсказка получена корректно
        if (!this.currentTip || !this.currentTip.text) {
            console.error('[FishingTips] Failed to get tip, using fallback');
            this.currentTip = {
                number: 1,
                text: "Добро пожаловать в мир рыбалки! Изучайте механики игры для лучших результатов.",
                key: 'tip_fallback'
            };
        }
        
        this.selectedAdReward = this.tipsSystem.getAdRewards()[0]; // Первый бонус за рекламу
        this.selectedGemReward = this.tipsSystem.getGemRewards()[Math.floor(Math.random() * this.tipsSystem.getGemRewards().length)]; // Один случайный за гемы
        this.selectedBundle = this.tipsSystem.getRandomBundle();
        
        // Сбрасываем флаг рекламы
        this.adWatched = false;
        
        // Сбрасываем флаг покупки
        this.gemRewardPurchased = false;
        
        // Обновляем время показа
        this.tipsSystem.updateShowTime();
    }
    
    // Скрыть окно
    hide() {
        this.visible = false;
        this.sessionBonuses = [];
        this.gemRewardPurchased = false;
    }
    
    // Применить бонус за рекламу
    applyAdReward(reward) {
        if (this.adWatched) return false;
        
        this.adWatched = true;
        
        if (reward.type === 'baits') {
            // Выдаем конкретную наживку
            this.addSpecificBait(reward.baitData.id, reward.value);
        } else {
            // Добавляем временный бонус
            this.sessionBonuses.push(reward);
        }
        
        // Сохраняем игру
        if (this.fishingGame && typeof this.fishingGame.saveGame === 'function') {
            this.fishingGame.saveGame();
        }
        
        return true;
    }
    
    // Применить бонус за марки
    applyGemReward(reward) {
        if (this.gemRewardPurchased) return false;
        
        if (!this.fishingGame || this.fishingGame.premiumCoins < reward.price) return false;
        
        // Списываем марки
        this.fishingGame.premiumCoins -= reward.price;
        
        if (reward.type === 'baits') {
            // Выдаем конкретную наживку
            this.addSpecificBait(reward.baitData.id, reward.value);
        } else {
            // Добавляем временный бонус
            this.sessionBonuses.push(reward);
            console.log(`[FishingTips] ✅ Бонус активирован: ${reward.name}`);
        }
        
        // Блокируем повторную покупку
        this.gemRewardPurchased = true;
        console.log('[FishingTips] Бонус за марки заблокирован для повторной покупки');
        
        // Сохраняем игру
        if (this.fishingGame && typeof this.fishingGame.saveGame === 'function') {
            this.fishingGame.saveGame();
            console.log('[FishingTips] Игра сохранена');
        }
        
        return true;
    }
    
    // Добавить конкретную наживку
    addSpecificBait(baitId, count) {
        if (!this.fishingGame || !this.fishingGame.gearInventory) {
            console.error('[FishingTips] Нет fishingGame или gearInventory');
            return;
        }
        
        // Получаем данные наживки
        let baitData = null;
        if (typeof BAITS_DATABASE !== 'undefined' && BAITS_DATABASE) {
            baitData = BAITS_DATABASE.find(b => b.id === baitId);
        }
        
        const baitName = baitData ? baitData.name : `Наживка ID ${baitId}`;
        console.log(`[FishingTips] Добавляем ${count}x ${baitName} (ID: ${baitId})`);
        
        // Добавляем в инвентарь
        const success = this.fishingGame.gearInventory.addBait(baitId, count);
        
        if (success) {
            console.log(`[FishingTips] ✅ Успешно добавлено ${count}x ${baitName}`);
            
            // Проверяем что наживка действительно добавилась
            const baitInInventory = this.fishingGame.gearInventory.inventory.baits.find(b => b.id === baitId);
            if (baitInInventory) {
                console.log(`[FishingTips] ✅ Наживка в инвентаре: ${baitInInventory.count} шт.`);
            } else {
                console.error(`[FishingTips] ❌ Наживка не найдена в инвентаре!`);
            }
            
            // Принудительно сохраняем инвентарь
            this.fishingGame.gearInventory.saveToStorage();
            console.log(`[FishingTips] ✅ Инвентарь сохранен`);
            
        } else {
            console.error(`[FishingTips] ❌ Ошибка добавления наживки`);
        }
    }
    
    // Добавить наживки в инвентарь
    addBaits(count) {
        if (!this.fishingGame || !this.fishingGame.gearInventory) {
            console.error('[FishingTips] Нет fishingGame или gearInventory');
            return;
        }
        
        // Проверяем доступность базы данных наживок
        if (typeof BAITS_DATABASE === 'undefined' || !BAITS_DATABASE) {
            console.error('[FishingTips] BAITS_DATABASE не загружена');
            // Используем базовую наживку (ID 1 - хлеб)
            const success = this.fishingGame.gearInventory.addBait(1, count);
            if (success) {
                console.log(`[FishingTips] ✅ Добавлено ${count} базовых наживок (хлеб)`);
            }
            return;
        }
        
        // Получаем случайную разблокированную наживку
        const playerLevel = this.fishingGame.progression?.level || 1;
        const availableBaits = BAITS_DATABASE.filter(b => 
            b.unlockTier <= playerLevel
        );
        
        if (availableBaits.length === 0) {
            console.error('[FishingTips] Нет доступных наживок для уровня', playerLevel);
            // Используем базовую наживку
            const success = this.fishingGame.gearInventory.addBait(1, count);
            if (success) {
                console.log(`[FishingTips] ✅ Добавлено ${count} базовых наживок (хлеб)`);
            }
            return;
        }
        
        const randomBait = availableBaits[Math.floor(Math.random() * availableBaits.length)];
        
        console.log(`[FishingTips] Добавляем ${count}x ${randomBait.name} (ID: ${randomBait.id})`);
        
        // Добавляем в инвентарь через метод addBait
        const success = this.fishingGame.gearInventory.addBait(randomBait.id, count);
        
        if (success) {
            console.log(`[FishingTips] ✅ Успешно добавлено ${count}x ${randomBait.name}`);
            
            // Проверяем что наживка действительно добавилась
            const baitInInventory = this.fishingGame.gearInventory.inventory.baits.find(b => b.id === randomBait.id);
            if (baitInInventory) {
                console.log(`[FishingTips] ✅ Наживка в инвентаре: ${baitInInventory.count} шт.`);
            } else {
                console.error(`[FishingTips] ❌ Наживка не найдена в инвентаре!`);
            }
            
            // Принудительно сохраняем инвентарь
            this.fishingGame.gearInventory.saveToStorage();
            console.log(`[FishingTips] ✅ Инвентарь сохранен`);
            
        } else {
            console.error(`[FishingTips] ❌ Ошибка добавления наживки`);
        }
    }
    
    // Получить множитель цены от бонусов
    getPriceMultiplier() {
        let multiplier = 1;
        this.sessionBonuses.forEach(bonus => {
            if (bonus.type === 'price_boost') {
                multiplier += bonus.value;
            }
        });
        return multiplier;
    }
    
    // Получить множитель опыта от бонусов
    getXpMultiplier() {
        let multiplier = 1;
        this.sessionBonuses.forEach(bonus => {
            if (bonus.type === 'xp_boost') {
                multiplier += bonus.value;
            }
        });
        return multiplier;
    }
    
    // Получить бонус к редкой рыбе
    getRareFishBonus() {
        let bonus = 0;
        this.sessionBonuses.forEach(b => {
            if (b.type === 'rare_fish_boost') {
                bonus += b.value;
            }
        });
        return bonus;
    }
    
    // Обновление анимации кнопок
    updateAnimations() {
        // Плавное возвращение к нормальному размеру
        Object.keys(this.buttonAnimations).forEach(key => {
            const anim = this.buttonAnimations[key];
            if (anim.pressed) {
                anim.scale = Math.max(0.9, anim.scale - 0.05);
            } else {
                anim.scale = Math.min(1, anim.scale + 0.1);
            }
        });
    }
    
    // Отрисовка
    draw(ctx, scaleManager) {
        if (!this.visible) return;
        
        // Обновляем анимации
        this.updateAnimations();
        
        const scale = scaleManager.scale;
        
        // Определяем мобильное устройство
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Полноэкранное окно
        const windowX = 0;
        const windowY = 0;
        const windowWidth = this.canvas.width;
        const windowHeight = this.canvas.height;
        
        // Затемнение фона
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, windowWidth, windowHeight);
        
        // Загружаем фон окна (rmk.png)
        this.loadImage('rmk.png', (img) => {
            if (img) {
                ctx.drawImage(img, windowX, windowY, windowWidth, windowHeight);
            }
        });
        
        if (isMobile) {
            // МОБИЛЬНАЯ ВЕРСИЯ
            const areaY = 80 * scale; // Сдвигаем вверх, чтобы освободить место для подсказки внизу
            const areaWidth = (windowWidth - 80 * scale) / 3 * 0.7; // Уменьшаем ширину на 30%
            const areaHeight = 360 * scale * 1.2; // Увеличиваем высоту на 20%
            const areaSpacing = 10 * scale;
            
            // 1. Бонус за рекламу
            this.drawAdRewardArea(
                ctx,
                40 * scale + ((windowWidth - 80 * scale) / 3 - areaWidth) / 2, // Центрируем
                areaY,
                areaWidth,
                areaHeight,
                scale,
                true // isMobile флаг для увеличения текста
            );
            
            // 2. Бонус за марки
            this.drawMarksRewardArea(
                ctx,
                40 * scale + (windowWidth - 80 * scale) / 3 + areaSpacing + ((windowWidth - 80 * scale) / 3 - areaWidth) / 2,
                areaY,
                areaWidth,
                areaHeight,
                scale,
                true // isMobile флаг для увеличения текста
            );
            
            // 3. Бонусный набор
            this.drawBundleArea(
                ctx,
                40 * scale + ((windowWidth - 80 * scale) / 3 + areaSpacing) * 2 + ((windowWidth - 80 * scale) / 3 - areaWidth) / 2,
                areaY,
                areaWidth,
                areaHeight,
                scale,
                true // isMobile флаг для увеличения текста
            );
            
            // Текст подсказки перемещаем под мини рамки бонусов (опускаем на 200 пикселей ниже + 80 для мобильных)
            const tipStartY = areaY + areaHeight + 310 * scale;
            
            // Заголовок с подсказкой
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${80 * scale}px "BabyPop", Arial`;
            ctx.textAlign = 'center';
            
            if (this.currentTip && this.currentTip.number) {
                ctx.fillText(
                    `${L('tip', 'Подсказка')} №${this.currentTip.number}`,
                    windowWidth / 2,
                    tipStartY
                );
            } else {
                ctx.fillText(
                    L('tip', 'Подсказка'),
                    windowWidth / 2,
                    tipStartY
                );
            }
            
            // Текст подсказки
            ctx.font = `${55 * scale}px "BabyPop", Arial`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            
            const tipText = (this.currentTip && this.currentTip.text) ? this.currentTip.text : 'Добро пожаловать в мир рыбалки!';
            this.wrapText(
                ctx,
                tipText,
                windowWidth / 2,
                tipStartY + 60 * scale,
                windowWidth - (40 * scale),
                65 * scale
            );
            
            // Кнопка "Продолжить" с анимацией - увеличена в 2 раза и поднята на 60 пикселей
            const buttonWidth = 400 * scale * 2;
            const buttonHeight = 80 * scale * 2;
            const buttonX = (windowWidth - buttonWidth) / 2;
            const buttonY = windowHeight - 180 * scale;
            
            // Применяем анимацию
            const animScale = this.buttonAnimations.continue.scale;
            const animButtonWidth = buttonWidth * animScale;
            const animButtonHeight = buttonHeight * animScale;
            const animButtonX = buttonX + (buttonWidth - animButtonWidth) / 2;
            const animButtonY = buttonY + (buttonHeight - animButtonHeight) / 2;
            
            // Фон кнопки (uipan.png)
            this.loadImage('uipan.png', (img) => {
                if (img) {
                    ctx.drawImage(img, animButtonX, animButtonY, animButtonWidth, animButtonHeight);
                }
            });
            
            // Текст кнопки (по центру) - увеличен в 2 раза
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${42 * scale * 2}px "BabyPop", Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(
                L('continue', 'Продолжить'),
                buttonX + buttonWidth / 2,
                buttonY + buttonHeight / 2 + 2 * scale
            );
            
            // Сохраняем данные для клика (используем оригинальные размеры)
            this.continueButton = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };
        } else {
            // ДЕСКТОПНАЯ ВЕРСИЯ - горизонтальное расположение
            
            // Заголовок с подсказкой
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${53 * scale}px "BabyPop", Arial`;
            ctx.textAlign = 'center';
            
            // Проверяем что currentTip существует
            if (this.currentTip && this.currentTip.number) {
                ctx.fillText(
                    `${L('tip', 'Подсказка')} №${this.currentTip.number}`,
                    windowWidth / 2,
                    80 * scale
                );
            } else {
                ctx.fillText(
                    L('tip', 'Подсказка'),
                    windowWidth / 2,
                    80 * scale
                );
            }
            
            // Текст подсказки (по центру)
            ctx.font = `${31 * scale}px "BabyPop", Arial`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            
            const tipText = (this.currentTip && this.currentTip.text) ? this.currentTip.text : 'Добро пожаловать в мир рыбалки!';
            this.wrapText(
                ctx,
                tipText,
                windowWidth / 2,
                140 * scale,
                windowWidth - 100 * scale,
                44 * scale
            );
            
            const areaY = 240 * scale;
            const areaWidth = (windowWidth - 80 * scale) / 3;
            const areaHeight = 360 * scale;
            const areaSpacing = 10 * scale;
            
            // 1. Бонус за рекламу
            this.drawAdRewardArea(
                ctx,
                40 * scale,
                areaY,
                areaWidth,
                areaHeight,
                scale
            );
            
            // 2. Бонус за марки
            this.drawMarksRewardArea(
                ctx,
                40 * scale + areaWidth + areaSpacing,
                areaY,
                areaWidth,
                areaHeight,
                scale
            );
            
            // 3. Бонусный набор
            this.drawBundleArea(
                ctx,
                40 * scale + (areaWidth + areaSpacing) * 2,
                areaY,
                areaWidth,
                areaHeight,
                scale
            );
            
            // Кнопка "Продолжить" с анимацией
            const buttonWidth = 400 * scale;
            const buttonHeight = 80 * scale;
            const buttonX = (windowWidth - buttonWidth) / 2;
            const buttonY = windowHeight - 120 * scale;
            
            // Применяем анимацию
            const animScale = this.buttonAnimations.continue.scale;
            const animButtonWidth = buttonWidth * animScale;
            const animButtonHeight = buttonHeight * animScale;
            const animButtonX = buttonX + (buttonWidth - animButtonWidth) / 2;
            const animButtonY = buttonY + (buttonHeight - animButtonHeight) / 2;
            
            // Фон кнопки (uipan.png)
            this.loadImage('uipan.png', (img) => {
                if (img) {
                    ctx.drawImage(img, animButtonX, animButtonY, animButtonWidth, animButtonHeight);
                }
            });
            
            // Текст кнопки (по центру)
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${42 * scale}px "BabyPop", Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(
                L('continue', 'Продолжить'),
                buttonX + buttonWidth / 2,
                buttonY + buttonHeight / 2 + 2 * scale
            );
            
            // Сохраняем данные для клика (используем оригинальные размеры)
            this.continueButton = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };
        }
    }
    
    // Загрузка изображения с кэшем
    loadImage(src, callback) {
        if (this.imageCache[src]) {
            callback(this.imageCache[src]);
            return;
        }
        
        const img = new Image();
        img.onload = () => {
            this.imageCache[src] = img;
            callback(img);
        };
        img.onerror = () => callback(null);
        img.src = src;
    }
    
    // Отрисовка области бонуса за рекламу
    drawAdRewardArea(ctx, x, y, width, height, scale, isMobile = false) {
        const textScale = isMobile ? 2.0 : 1; // Увеличиваем текст в 2 раза для мобильных
        const spriteShift = isMobile ? 70 : 0; // Сдвиг спрайтов вниз на 70 пикселей для мобильных (40 + 30)
        const textShift = isMobile ? 10 : 0; // Сдвиг текста вниз на 10 пикселей для мобильных
        
        // Фон области (rmk.png)
        const rmkImg = assetManager.getImage('rmk.png');
        if (rmkImg) {
            ctx.drawImage(rmkImg, x, y, width, height);
        }
        
        // Заголовок
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2 * scale;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${30 * scale * textScale}px "BabyPop", Arial`;
        ctx.textAlign = 'center';
        ctx.strokeText(L('for_ad', 'За рекламу'), x + width / 2, y + (35 + textShift) * scale);
        ctx.fillText(L('for_ad', 'За рекламу'), x + width / 2, y + (35 + textShift) * scale);
        
        const reward = this.selectedAdReward;
        
        // Иконка - используем спрайты вместо смайлов
        if (reward.type === 'price_boost') {
            // Монеты
            const coinImg = assetManager.getImage('coin.png');
            if (coinImg) {
                const imgSize = 60 * scale * textScale;
                ctx.drawImage(coinImg, x + (width - imgSize) / 2, y + (55 + spriteShift) * scale, imgSize, imgSize);
            }
        } else if (reward.type === 'xp_boost') {
            // Звезда опыта - используем иконку уровня
            ctx.font = `${60 * scale * textScale}px Arial`;
            ctx.fillStyle = '#ffcc00';
            ctx.textAlign = 'center';
            ctx.fillText('⭐', x + width / 2, y + (95 + spriteShift) * scale);
        } else if (reward.type === 'baits') {
            // Наживка - используем спрайт конкретной наживки для рекламы
            const sprite = reward.baitData ? reward.baitData.sprite : 'n1.png';
            const baitImg = assetManager.getImage(sprite);
            if (baitImg) {
                const imgSize = 60 * scale * textScale;
                ctx.drawImage(baitImg, x + (width - imgSize) / 2, y + (55 + spriteShift) * scale, imgSize, imgSize);
            }
        }
        
        // Название
        ctx.fillStyle = '#ffffff';
        ctx.font = `${24 * scale * textScale}px "BabyPop", Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(reward.name, x + width / 2, y + (125 + textShift) * scale);
        
        // Кнопка с анимацией - уменьшена на 30% по ширине для мобильных и ПК
        const btnWidthMultiplier = 1.05; // 1.5 * 0.7 = 1.05 для всех
        const btnWidth = (width - 20 * scale) * btnWidthMultiplier;
        const btnHeight = 55 * scale * textScale;
        const btnX = x + (width - btnWidth) / 2;
        const btnY = y + height - 65 * scale;
        
        // Применяем анимацию
        const animScale = this.buttonAnimations.adReward.scale;
        const animBtnWidth = btnWidth * animScale;
        const animBtnHeight = btnHeight * animScale;
        const animBtnX = btnX + (btnWidth - animBtnWidth) / 2;
        const animBtnY = btnY + (btnHeight - animBtnHeight) / 2;
        
        // Фон кнопки (uipan.png)
        const uipanImg = assetManager.getImage('uipan.png');
        if (uipanImg) {
            ctx.drawImage(uipanImg, animBtnX, animBtnY, animBtnWidth, animBtnHeight);
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${22 * scale * textScale * 1.7}px "BabyPop", Arial`; // Увеличено на 70%
        ctx.textAlign = 'center';
        ctx.fillText(
            this.adWatched ? L('watched', 'Просмотрено') : L('watch', '📺 Смотреть'),
            btnX + btnWidth / 2,
            btnY + btnHeight / 2 + 2 * scale
        );
        
        // Сохраняем данные для клика (используем оригинальные размеры)
        this.adRewardButton = { x: btnX, y: btnY, width: btnWidth, height: btnHeight, reward };
    }
    
    // Отрисовка области бонуса за марки (один бонус)
    drawMarksRewardArea(ctx, x, y, width, height, scale, isMobile = false) {
        const textScale = isMobile ? 2.0 : 1; // Увеличиваем текст в 2 раза для мобильных
        const spriteShift = isMobile ? 70 : 0; // Сдвиг спрайтов вниз на 70 пикселей для мобильных (40 + 30)
        const textShift = isMobile ? 10 : 0; // Сдвиг текста вниз на 10 пикселей для мобильных
        
        // Фон области (rmk.png)
        const rmkImg = assetManager.getImage('rmk.png');
        if (rmkImg) {
            ctx.drawImage(rmkImg, x, y, width, height);
        }
        
        // Заголовок
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2 * scale;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${30 * scale * textScale}px "BabyPop", Arial`;
        ctx.textAlign = 'center';
        ctx.strokeText(L('for_marks', 'За марки'), x + width / 2, y + (35 + textShift) * scale);
        ctx.fillText(L('for_marks', 'За марки'), x + width / 2, y + (35 + textShift) * scale);
        
        const reward = this.selectedGemReward;
        
        // Иконка - используем спрайты вместо смайлов
        if (reward.type === 'price_boost') {
            // Монеты
            const coinImg = assetManager.getImage('coin.png');
            if (coinImg) {
                const imgSize = 60 * scale * textScale;
                ctx.drawImage(coinImg, x + (width - imgSize) / 2, y + (55 + spriteShift) * scale, imgSize, imgSize);
            }
        } else if (reward.type === 'xp_boost') {
            // Звезда опыта
            ctx.font = `${60 * scale * textScale}px Arial`;
            ctx.fillStyle = '#ffcc00';
            ctx.textAlign = 'center';
            ctx.fillText('⭐', x + width / 2, y + (95 + spriteShift) * scale);
        } else if (reward.type === 'rare_fish_boost') {
            // Редкая рыба - используем спрайт рыбы
            const fishImg = assetManager.getImage('fish_001.png');
            if (fishImg) {
                const imgSize = 60 * scale * textScale;
                ctx.drawImage(fishImg, x + (width - imgSize) / 2, y + (55 + spriteShift) * scale, imgSize, imgSize);
            }
        } else if (reward.type === 'baits') {
            // Наживка - используем спрайт конкретной наживки для марок
            const sprite = reward.baitData ? reward.baitData.sprite : 'n1.png';
            const baitImg = assetManager.getImage(sprite);
            if (baitImg) {
                const imgSize = 60 * scale * textScale;
                ctx.drawImage(baitImg, x + (width - imgSize) / 2, y + (55 + spriteShift) * scale, imgSize, imgSize);
            }
        }
        
        // Название
        ctx.fillStyle = '#ffffff';
        ctx.font = `${24 * scale * textScale}px "BabyPop", Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(reward.name, x + width / 2, y + (125 + textShift) * scale);
        
        // Кнопка с анимацией - уменьшена на 30% по ширине для мобильных и ПК
        const btnWidthMultiplier = 1.05; // 1.5 * 0.7 = 1.05 для всех
        const btnWidth = (width - 20 * scale) * btnWidthMultiplier;
        const btnHeight = 55 * scale * textScale;
        const btnX = x + (width - btnWidth) / 2;
        const btnY = y + height - 65 * scale;
        
        // Применяем анимацию
        const animScale = this.buttonAnimations.gemReward.scale;
        const animBtnWidth = btnWidth * animScale;
        const animBtnHeight = btnHeight * animScale;
        const animBtnX = btnX + (btnWidth - animBtnWidth) / 2;
        const animBtnY = btnY + (btnHeight - animBtnHeight) / 2;
        
        // Фон кнопки (uipan.png)
        const uipanImg = assetManager.getImage('uipan.png');
        if (uipanImg) {
            ctx.drawImage(uipanImg, animBtnX, animBtnY, animBtnWidth, animBtnHeight);
        }
        
        // Проверяем куплено ли
        if (this.gemRewardPurchased) {
            // Затемняем кнопку
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(animBtnX, animBtnY, animBtnWidth, animBtnHeight);
            
            // Текст "Куплено"
            ctx.fillStyle = '#888888';
            ctx.font = `bold ${22 * scale * textScale * 1.7}px "BabyPop", Arial`; // Увеличено на 70%
            ctx.textAlign = 'center';
            ctx.fillText(L('bought', 'Куплено'), btnX + btnWidth / 2, btnY + btnHeight / 2 + 2 * scale);
        } else {
            // Текст кнопки с ценой и иконкой марки
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${20 * scale * textScale * 1.7}px "BabyPop", Arial`; // Увеличено на 70%
            ctx.textAlign = 'center';
            
            // Рисуем текст с иконкой марки
            const text = `${L('buy_for', 'Купить за')} ${reward.price}`;
            const textWidth = ctx.measureText(text).width;
            const markImg = assetManager.getImage('one_marka.png');
            if (markImg) {
                const markSize = 20 * scale * textScale * 1.7;
                // Текст слева
                ctx.fillText(text, btnX + btnWidth / 2 - markSize / 2 - 5 * scale, btnY + btnHeight / 2 + 2 * scale);
                // Иконка марки справа
                ctx.drawImage(markImg, btnX + btnWidth / 2 + textWidth / 2 - markSize / 2 + 5 * scale, btnY + btnHeight / 2 - markSize / 2, markSize, markSize);
            } else {
                ctx.fillText(text, btnX + btnWidth / 2, btnY + btnHeight / 2 + 2 * scale);
            }
        }
        
        this.gemRewardButton = { x: btnX, y: btnY, width: btnWidth, height: btnHeight, reward };
    }
    
    // Отрисовка области бонусного набора
    drawBundleArea(ctx, x, y, width, height, scale, isMobile = false) {
        const textScale = isMobile ? 2.0 : 1; // Увеличиваем текст в 2 раза для мобильных
        const spriteShift = isMobile ? 70 : 0; // Сдвиг спрайтов вниз на 70 пикселей для мобильных (40 + 30)
        const textShift = isMobile ? 10 : 0; // Сдвиг текста вниз на 10 пикселей для мобильных
        
        // Фон области (rmk.png)
        const rmkImg = assetManager.getImage('rmk.png');
        if (rmkImg) {
            ctx.drawImage(rmkImg, x, y, width, height);
        }
        
        // Заголовок
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2 * scale;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${30 * scale * textScale}px "BabyPop", Arial`;
        ctx.textAlign = 'center';
        ctx.strokeText(L('special_offer', 'Спец. предложение'), x + width / 2, y + (35 + textShift) * scale);
        ctx.fillText(L('special_offer', 'Спец. предложение'), x + width / 2, y + (35 + textShift) * scale);
        
        // Спрайт набора
        if (this.selectedBundle.sprite) {
            const bundleImg = assetManager.getImage(this.selectedBundle.sprite);
            if (bundleImg) {
                const imgSize = 60 * scale * textScale;
                ctx.drawImage(
                    bundleImg,
                    x + (width - imgSize) / 2,
                    y + (55 + spriteShift) * scale,
                    imgSize,
                    imgSize
                );
            }
        }
        
        // Название
        ctx.fillStyle = '#ffffff';
        ctx.font = `${22 * scale * textScale}px "BabyPop", Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.selectedBundle.name, x + width / 2, y + (125 + textShift) * scale);
        
        // Получаем содержимое набора для отображения снастей
        const bundleContents = this.selectedBundle.contents;
        
        // Список снастей в наборе (как в магазине)
        if (bundleContents && typeof RODS_DATABASE !== 'undefined' && typeof LINES_DATABASE !== 'undefined' && 
            typeof FLOATS_DATABASE !== 'undefined' && typeof HOOKS_DATABASE !== 'undefined' && typeof REELS_DATABASE !== 'undefined') {
            
            ctx.fillStyle = '#2ecc71';
            ctx.font = `${18 * scale * textScale}px "BabyPop", Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(L('shop_includes', 'Включает:'), x + width / 2, y + (150 + textShift) * scale);
            
            let itemY = y + (170 + textShift) * scale;
            const itemHeight = 20 * scale * textScale;
            const iconSize = 16 * scale * textScale;
            
            ctx.fillStyle = '#bdc3c7';
            ctx.font = `${14 * scale * textScale}px "BabyPop", Arial`;
            ctx.textAlign = 'left';
            
            // Удочка
            if (bundleContents.rod) {
                const rod = RODS_DATABASE.find(r => r.tier === bundleContents.rod);
                if (rod) {
                    const rodSprite = assetManager.getImage(`u${bundleContents.rod}.png`);
                    const rodName = L(`gear_rod_${rod.tier}_name`, rod.name);
                    if (rodSprite) {
                        ctx.drawImage(rodSprite, x + 10 * scale, itemY - iconSize / 2, iconSize, iconSize);
                        ctx.fillText(rodName, x + 10 * scale + iconSize + 5 * scale, itemY + 4 * scale);
                    } else {
                        ctx.fillText(`🎣 ${rodName}`, x + 10 * scale, itemY + 4 * scale);
                    }
                    itemY += itemHeight;
                }
            }
            
            // Леска
            if (bundleContents.line) {
                const line = LINES_DATABASE.find(l => l.tier === bundleContents.line);
                if (line) {
                    const lineSprite = assetManager.getImage(`l_${bundleContents.line}.png`);
                    const lineName = L(`gear_line_${line.tier}_name`, line.name);
                    if (lineSprite) {
                        ctx.drawImage(lineSprite, x + 10 * scale, itemY - iconSize / 2, iconSize, iconSize);
                        ctx.fillText(lineName, x + 10 * scale + iconSize + 5 * scale, itemY + 4 * scale);
                    } else {
                        ctx.fillText(`🧵 ${lineName}`, x + 10 * scale, itemY + 4 * scale);
                    }
                    itemY += itemHeight;
                }
            }
            
            // Поплавок
            if (bundleContents.float) {
                const float = FLOATS_DATABASE.find(f => f.tier === bundleContents.float);
                if (float) {
                    const floatFileName = bundleContents.float < 10 ? `float_0${bundleContents.float}.png` : `float_${bundleContents.float}.png`;
                    const floatSprite = assetManager.getImage(floatFileName);
                    const floatName = L(`gear_float_${float.tier}_name`, float.name);
                    if (floatSprite) {
                        ctx.drawImage(floatSprite, x + 10 * scale, itemY - iconSize / 2, iconSize, iconSize);
                        ctx.fillText(floatName, x + 10 * scale + iconSize + 5 * scale, itemY + 4 * scale);
                    } else {
                        ctx.fillText(`🎈 ${floatName}`, x + 10 * scale, itemY + 4 * scale);
                    }
                    itemY += itemHeight;
                }
            }
            
            // Крючок
            if (bundleContents.hook) {
                const hook = HOOKS_DATABASE.find(h => h.tier === bundleContents.hook);
                if (hook) {
                    const hookSprite = assetManager.getImage(`k_${bundleContents.hook}.png`);
                    const hookName = L(`gear_hook_${hook.tier}_name`, hook.name);
                    if (hookSprite) {
                        ctx.drawImage(hookSprite, x + 10 * scale, itemY - iconSize / 2, iconSize, iconSize);
                        ctx.fillText(hookName, x + 10 * scale + iconSize + 5 * scale, itemY + 4 * scale);
                    } else {
                        ctx.fillText(`🪝 ${hookName}`, x + 10 * scale, itemY + 4 * scale);
                    }
                    itemY += itemHeight;
                }
            }
            
            // Катушка
            if (bundleContents.reel) {
                const reel = REELS_DATABASE.find(r => r.tier === bundleContents.reel);
                if (reel) {
                    const reelSprite = assetManager.getImage(`h${bundleContents.reel}.png`);
                    const reelName = L(`gear_reel_${reel.tier}_name`, reel.name);
                    if (reelSprite) {
                        ctx.drawImage(reelSprite, x + 10 * scale, itemY - iconSize / 2, iconSize, iconSize);
                        ctx.fillText(reelName, x + 10 * scale + iconSize + 5 * scale, itemY + 4 * scale);
                    } else {
                        ctx.fillText(`⚙️ ${reelName}`, x + 10 * scale, itemY + 4 * scale);
                    }
                }
            }
        } else {
            // Fallback - показываем простое описание если базы данных не загружены
            if (this.selectedBundle.description) {
                ctx.fillStyle = '#cccccc';
                ctx.font = `${16 * scale * textScale}px "BabyPop", Arial`;
                ctx.textAlign = 'center';
                this.wrapText(
                    ctx,
                    this.selectedBundle.description,
                    x + width / 2,
                    y + (150 + textShift) * scale,
                    width - 20 * scale,
                    20 * scale * textScale
                );
            }
        }
        
        // Кнопка с анимацией - уменьшена на 30% по ширине для мобильных и ПК
        const btnWidthMultiplier = 1.05; // 1.5 * 0.7 = 1.05 для всех
        const btnWidth = (width - 20 * scale) * btnWidthMultiplier;
        const btnHeight = 55 * scale * textScale;
        const btnX = x + (width - btnWidth) / 2;
        const btnY = y + height - 65 * scale;
        
        // Применяем анимацию
        const animScale = this.buttonAnimations.bundle.scale;
        const animBtnWidth = btnWidth * animScale;
        const animBtnHeight = btnHeight * animScale;
        const animBtnX = btnX + (btnWidth - animBtnWidth) / 2;
        const animBtnY = btnY + (btnHeight - animBtnHeight) / 2;
        
        // Фон кнопки (uipan.png)
        const uipanImg = assetManager.getImage('uipan.png');
        if (uipanImg) {
            ctx.drawImage(uipanImg, animBtnX, animBtnY, animBtnWidth, animBtnHeight);
        }
        
        // Текст кнопки с ценой (используем форматированную цену из SDK)
        const priceText = this.selectedBundle.priceFormatted || 
                         `${this.selectedBundle.price} ${this.selectedBundle.priceCurrencyCode || 'YAN'}`;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${20 * scale * textScale * 1.7}px "BabyPop", Arial`; // Увеличено на 70%
        ctx.textAlign = 'center';
        ctx.fillText(
            `${L('buy', 'Купить')} ${priceText}`,
            btnX + btnWidth / 2,
            btnY + btnHeight / 2 + 2 * scale
        );
        
        this.bundleButton = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };
    }
    
    // Перенос текста (с поддержкой центрирования)
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        const lines = [];
        
        // Сначала формируем все строки
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);
        
        // Рисуем все строки
        lines.forEach(line => {
            ctx.fillText(line.trim(), x, currentY);
            currentY += lineHeight;
        });
    }
    
    // Обработка клика
    handleClick(x, y) {
        if (!this.visible) return false;
        
        const scale = this.canvas.width / 1280;
        
        // Клик по кнопке "Продолжить"
        if (this.continueButton) {
            const btn = this.continueButton;
            if (x >= btn.x && x <= btn.x + btn.width &&
                y >= btn.y && y <= btn.y + btn.height) {
                // Звук клика
                if (this.audioManager) this.audioManager.playClickSound();
                // Анимация нажатия
                this.buttonAnimations.continue.pressed = true;
                setTimeout(() => {
                    this.buttonAnimations.continue.pressed = false;
                    this.hide();
                    if (this.onContinue) this.onContinue();
                }, 100);
                return true;
            }
        }
        
        // Клик по кнопке рекламы
        if (this.adRewardButton && !this.adWatched) {
            const btn = this.adRewardButton;
            if (x >= btn.x && x <= btn.x + btn.width &&
                y >= btn.y && y <= btn.y + btn.height) {
                // Звук клика
                if (this.audioManager) this.audioManager.playClickSound();
                // Анимация нажатия
                this.buttonAnimations.adReward.pressed = true;
                
                // Показываем rewarded рекламу
                if (window.game && window.game.showRewardedAd) {
                    window.game.showRewardedAd(() => {
                        // Награда получена!
                        console.log('✅ Награда получена за просмотр рекламы в подсказках');
                        this.buttonAnimations.adReward.pressed = false;
                        this.applyAdReward(btn.reward);
                    });
                } else {
                    // Fallback если SDK не доступен
                    console.warn('SDK не доступен, награда выдана без рекламы');
                    setTimeout(() => {
                        this.buttonAnimations.adReward.pressed = false;
                        this.applyAdReward(btn.reward);
                    }, 100);
                }
                
                return true;
            }
        }
        
        // Клик по кнопке марок
        if (this.gemRewardButton && !this.gemRewardPurchased) {
            const btn = this.gemRewardButton;
            if (x >= btn.x && x <= btn.x + btn.width &&
                y >= btn.y && y <= btn.y + btn.height) {
                // Звук клика (или obmen если покупка за марки)
                if (this.audioManager) this.audioManager.playSound('obmen');
                // Анимация нажатия
                this.buttonAnimations.gemReward.pressed = true;
                setTimeout(() => {
                    this.buttonAnimations.gemReward.pressed = false;
                    this.applyGemReward(btn.reward);
                }, 100);
                return true;
            }
        }
        
        // Клик по кнопке набора
        if (this.bundleButton) {
            const btn = this.bundleButton;
            if (x >= btn.x && x <= btn.x + btn.width &&
                y >= btn.y && y <= btn.y + btn.height) {
                // Анимация нажатия
                this.buttonAnimations.bundle.pressed = true;
                
                // Вызываем покупку через game.handleIAPPurchase для единообразной обработки
                if (this.game && this.game.handleIAPPurchase) {
                    const bundle = this.selectedBundle;
                    console.log('[FishingTips] Покупка набора через game.handleIAPPurchase:', bundle.name, bundle.price);
                    
                    // Создаем объект item для handleIAPPurchase
                    const iapItem = {
                        id: bundle.id,
                        name: bundle.name,
                        price: bundle.price,
                        type: 'gear_bundle',
                        contents: bundle.contents,
                        currency: 'iap',
                        isIAP: true
                    };
                    
                    this.game.handleIAPPurchase(iapItem)
                        .then(() => {
                            console.log('[FishingTips] ✅ Покупка обработана');
                            this.buttonAnimations.bundle.pressed = false;
                            
                            // Звук покупки
                            if (this.audioManager) {
                                this.audioManager.playSound('kup');
                            }
                        })
                        .catch(error => {
                            console.error('[FishingTips] ❌ Ошибка покупки:', error);
                            this.buttonAnimations.bundle.pressed = false;
                            
                            // Звук ошибки
                            if (this.audioManager) {
                                this.audioManager.playSound('nema');
                            }
                        });
                } else {
                    // Fallback если game.handleIAPPurchase не доступен
                    console.warn('[FishingTips] game.handleIAPPurchase не доступен для покупки');
                    setTimeout(() => {
                        this.buttonAnimations.bundle.pressed = false;
                    }, 100);
                }
                
                return true;
            }
        }
        
        return false;
    }
}
