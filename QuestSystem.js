// -*- coding: utf-8 -*-
// QuestSystem.js - Система ежедневных и еженедельных заданий

class QuestSystem {
    constructor() {
        this.dailyQuests = [];
        this.weeklyQuests = [];
        this.lastDailyReset = null;
        this.lastWeeklyReset = null;
        this.completedDaily = new Set();
        this.completedWeekly = new Set();
        
        this.DAILY_SKIP_COST = 15; // Стоимость пропуска ежедневных заданий в гемах
        this.WEEKLY_SKIP_COST = 50; // Стоимость пропуска еженедельных заданий в гемах
        
        // НЕ вызываем init() здесь - он будет вызван позже из main.js
    }

    init() {
        console.log('[QuestSystem] init() вызван, FISH_DATABASE:', window.FISH_DATABASE ? window.FISH_DATABASE.length : 'не загружена');
        this.loadProgress();
        this.checkAndResetQuests();
    }

    // Проверка и сброс заданий
    checkAndResetQuests() {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const oneWeekMs = 7 * oneDayMs;

        // Проверка ежедневных заданий
        if (!this.lastDailyReset || (now - this.lastDailyReset) >= oneDayMs) {
            this.resetDailyQuests();
        }

        // Проверка еженедельных заданий
        if (!this.lastWeeklyReset || (now - this.lastWeeklyReset) >= oneWeekMs) {
            this.resetWeeklyQuests();
        }
    }

    // Получить доступных рыб по зонам (с учетом уровня игрока)
    getAvailableFish(usePlayerLevel = false) {
        if (!window.FISH_DATABASE || window.FISH_DATABASE.length === 0) {
            console.log('[QuestSystem] FISH_DATABASE не загружена');
            return [];
        }
        
        const playerLevel = window.gameState?.level || 1;
        const unlockedZones = window.gameState?.unlockedZones?.length || 1;
        
        // Если usePlayerLevel = true, используем зоны по уровню игрока (не только открытые)
        // Это позволит давать задания на рыб из зон, которые игрок может открыть на своем уровне
        const maxZone = usePlayerLevel ? Math.min(Math.ceil(playerLevel / 5) + 1, 18) : unlockedZones;
        
        const available = window.FISH_DATABASE.filter(fish => fish.zoneId <= maxZone);
        console.log(`[QuestSystem] Доступно рыб: ${available.length}, уровень игрока: ${playerLevel}, макс зона: ${maxZone}, открыто зон: ${unlockedZones}`);
        return available;
    }

    // Получить рыб по редкости
    getFishByRarity(rarity) {
        const available = this.getAvailableFish();
        return available.filter(fish => fish.rarity === rarity);
    }

    // Генерация ежедневных заданий с прогрессией
    resetDailyQuests() {
        this.dailyQuests = [];
        this.completedDaily.clear();
        this.lastDailyReset = Date.now();

        // Используем расширенный пул рыб по уровню игрока
        const availableFish = this.getAvailableFish(true);
        if (availableFish.length === 0) {
            // Если рыбы еще не загружены, откладываем генерацию
            console.log('[QuestSystem] Рыбы не загружены, откладываем генерацию заданий');
            this.saveProgress();
            return;
        }

        // Получаем уровень игрока для масштабирования наград
        const playerLevel = window.gameState?.level || 1;
        // Более плавный рост: начинаем с 0.4x на уровне 1, +15% за каждый уровень
        const levelMultiplier = 0.4 + (playerLevel - 1) * 0.15;
        
        console.log(`[QuestSystem] Генерация заданий для уровня ${playerLevel}, множитель наград: ${levelMultiplier.toFixed(2)}x`);

        // Сортируем рыб по редкости для прогрессии
        // Для сложных заданий берем рыб из топовых зон для текущего уровня
        const maxZone = Math.min(Math.ceil(playerLevel / 5) + 1, 18);
        const topZones = [maxZone, Math.max(1, maxZone - 1)]; // Текущая и предыдущая зона
        
        const commonFish = availableFish.filter(f => f.rarity === 'Common');
        const uncommonFish = availableFish.filter(f => f.rarity === 'Uncommon');
        const rareFish = availableFish.filter(f => f.rarity === 'Rare');
        const epicFish = availableFish.filter(f => f.rarity === 'Epic');
        
        // Для сложных заданий приоритет - рыбы из топовых зон
        const topRareFish = rareFish.filter(f => topZones.includes(f.zoneId));
        const topEpicFish = epicFish.filter(f => topZones.includes(f.zoneId));

        console.log(`[QuestSystem] Рыбы по редкости: Common=${commonFish.length}, Uncommon=${uncommonFish.length}, Rare=${rareFish.length} (топ зоны: ${topRareFish.length}), Epic=${epicFish.length} (топ зоны: ${topEpicFish.length})`);

        // 5 заданий с прогрессией сложности (награды монет уменьшены на 40%)
        const questConfigs = [
            { pool: commonFish, fallback: availableFish, amount: 15, coins: 39, gems: 1, diff: 0 },
            { pool: commonFish, fallback: availableFish, amount: 20, coins: 78, gems: 2, diff: 1 },
            { pool: uncommonFish, fallback: commonFish, amount: 15, coins: 141, gems: 3, diff: 2 },
            { pool: topRareFish.length > 0 ? topRareFish : rareFish, fallback: uncommonFish, amount: 10, coins: 249, gems: 4, diff: 3 },
            { pool: topEpicFish.length > 0 ? topEpicFish : epicFish, fallback: rareFish, amount: 6, coins: 429, gems: 6, diff: 4 }
        ];

        const usedFishIds = new Set();

        for (let i = 0; i < 5; i++) {
            const config = questConfigs[i];
            // Выбираем пул: основной или fallback
            let pool = config.pool.length > 0 ? config.pool : config.fallback.length > 0 ? config.fallback : availableFish;
            
            // Выбираем рыбу, которую еще не использовали
            let fish = this.pickUniqueFish(pool, usedFishIds);
            if (!fish) {
                // Если все рыбы из пула использованы, берем любую из доступных
                fish = this.pickUniqueFish(availableFish, usedFishIds);
            }
            if (!fish) {
                // Если вообще все рыбы использованы, берем случайную
                fish = availableFish[Math.floor(Math.random() * availableFish.length)];
            }
            usedFishIds.add(fish.id);

            // Применяем множитель уровня к наградам
            const scaledCoins = Math.floor(config.coins * levelMultiplier);
            const scaledGems = Math.max(1, Math.floor(config.gems * levelMultiplier));

            console.log(`[QuestSystem] Задание ${i + 1}: ${fish.name} (${fish.rarity}, зона ${fish.zoneId}), ${config.amount} шт, ${scaledCoins}💰, ${scaledGems}💎`);

            // Получаем локализованное имя рыбы
            const localizedFishName = window.FishDB ? window.FishDB.getLocalizedName(fish) : fish.name;

            this.dailyQuests.push({
                id: `daily_${Date.now()}_${i}`,
                type: 'catch_fish',
                fishId: fish.id,
                fishName: localizedFishName,
                targetAmount: config.amount,
                currentAmount: 0,
                rewards: { coins: scaledCoins, gems: scaledGems },
                difficulty: config.diff
            });
        }

        this.saveProgress();
    }

    // Генерация еженедельных заданий с прогрессией
    resetWeeklyQuests() {
        this.weeklyQuests = [];
        this.completedWeekly.clear();
        this.lastWeeklyReset = Date.now();

        // Используем расширенный пул рыб по уровню игрока
        const availableFish = this.getAvailableFish(true);
        if (availableFish.length === 0) {
            // Если рыбы еще не загружены, откладываем генерацию
            console.log('[QuestSystem] Рыбы не загружены, откладываем генерацию еженедельных заданий');
            this.saveProgress();
            return;
        }

        // Получаем уровень игрока для масштабирования наград
        const playerLevel = window.gameState?.level || 1;
        // Более плавный рост: начинаем с 0.4x на уровне 1, +15% за каждый уровень
        const levelMultiplier = 0.4 + (playerLevel - 1) * 0.15;

        console.log(`[QuestSystem] Генерация еженедельных заданий для уровня ${playerLevel}, множитель наград: ${levelMultiplier.toFixed(2)}x`);

        // Сортируем рыб по редкости для прогрессии
        // Для сложных заданий берем рыб из топовых зон для текущего уровня
        const maxZone = Math.min(Math.ceil(playerLevel / 5) + 1, 18);
        const topZones = [maxZone, Math.max(1, maxZone - 1)]; // Текущая и предыдущая зона
        
        const commonFish = availableFish.filter(f => f.rarity === 'Common');
        const uncommonFish = availableFish.filter(f => f.rarity === 'Uncommon');
        const rareFish = availableFish.filter(f => f.rarity === 'Rare');
        const epicFish = availableFish.filter(f => f.rarity === 'Epic');
        const legendaryFish = availableFish.filter(f => f.rarity === 'Legendary');
        
        // Для сложных заданий приоритет - рыбы из топовых зон
        const topRareFish = rareFish.filter(f => topZones.includes(f.zoneId));
        const topEpicFish = epicFish.filter(f => topZones.includes(f.zoneId));
        const topLegendaryFish = legendaryFish.filter(f => topZones.includes(f.zoneId));

        console.log(`[QuestSystem] Еженедельные рыбы по редкости: Common=${commonFish.length}, Uncommon=${uncommonFish.length}, Rare=${rareFish.length} (топ зоны: ${topRareFish.length}), Epic=${epicFish.length} (топ зоны: ${topEpicFish.length}), Legendary=${legendaryFish.length} (топ зоны: ${topLegendaryFish.length})`);

        // Еженедельные задания (награды монет уменьшены на 40%)
        const questConfigs = [
            { pool: commonFish, fallback: availableFish, amount: 80, coins: 147, gems: 5, diff: 0 },
            { pool: uncommonFish, fallback: commonFish, amount: 60, coins: 294, gems: 9, diff: 1 },
            { pool: topRareFish.length > 0 ? topRareFish : rareFish, fallback: uncommonFish, amount: 45, coins: 546, gems: 14, diff: 2 },
            { pool: topEpicFish.length > 0 ? topEpicFish : epicFish, fallback: rareFish, amount: 30, coins: 1008, gems: 23, diff: 3 },
            { pool: topLegendaryFish.length > 0 ? topLegendaryFish : legendaryFish, fallback: epicFish, amount: 15, coins: 1890, gems: 40, diff: 4 }
        ];

        const usedFishIds = new Set();

        for (let i = 0; i < 5; i++) {
            const config = questConfigs[i];
            let pool = config.pool.length > 0 ? config.pool : config.fallback.length > 0 ? config.fallback : availableFish;
            
            let fish = this.pickUniqueFish(pool, usedFishIds);
            if (!fish) {
                fish = this.pickUniqueFish(availableFish, usedFishIds);
            }
            if (!fish) {
                fish = availableFish[Math.floor(Math.random() * availableFish.length)];
            }
            usedFishIds.add(fish.id);

            // Применяем множитель уровня к наградам
            const scaledCoins = Math.floor(config.coins * levelMultiplier);
            const scaledGems = Math.max(1, Math.floor(config.gems * levelMultiplier));

            console.log(`[QuestSystem] Еженедельное задание ${i + 1}: ${fish.name} (${fish.rarity}, зона ${fish.zoneId}), ${config.amount} шт, ${scaledCoins}💰, ${scaledGems}💎`);

            // Получаем локализованное имя рыбы
            const localizedFishName = window.FishDB ? window.FishDB.getLocalizedName(fish) : fish.name;

            this.weeklyQuests.push({
                id: `weekly_${Date.now()}_${i}`,
                type: 'catch_fish',
                fishId: fish.id,
                fishName: localizedFishName,
                targetAmount: config.amount,
                currentAmount: 0,
                rewards: { coins: scaledCoins, gems: scaledGems },
                difficulty: config.diff
            });
        }

        this.saveProgress();
    }

    // Выбрать уникальную рыбу из пула
    pickUniqueFish(pool, usedIds) {
        const available = pool.filter(f => !usedIds.has(f.id));
        if (available.length === 0) return null;
        return available[Math.floor(Math.random() * available.length)];
    }

    // Обновление прогресса задания
    updateQuestProgress(type, data) {
        let updated = false;

        console.log(`[QuestSystem] updateQuestProgress вызван: type=${type}, data=`, data);

        // Обновляем ежедневные задания
        this.dailyQuests.forEach(quest => {
            if (!this.completedDaily.has(quest.id) && this.matchesQuest(quest, type, data)) {
                // Увеличиваем счетчик только если не достигнут лимит
                if (quest.currentAmount < quest.targetAmount) {
                    quest.currentAmount++;
                    updated = true;
                    console.log(`[QuestSystem] Обновлено ежедневное задание: ${quest.fishName}, прогресс: ${quest.currentAmount}/${quest.targetAmount}`);
                }
            }
        });

        // Обновляем еженедельные задания
        this.weeklyQuests.forEach(quest => {
            if (!this.completedWeekly.has(quest.id) && this.matchesQuest(quest, type, data)) {
                // Увеличиваем счетчик только если не достигнут лимит
                if (quest.currentAmount < quest.targetAmount) {
                    quest.currentAmount++;
                    updated = true;
                    console.log(`[QuestSystem] Обновлено еженедельное задание: ${quest.fishName}, прогресс: ${quest.currentAmount}/${quest.targetAmount}`);
                }
            }
        });

        if (updated) {
            this.saveProgress();
        }
    }

    // Проверка соответствия задания
    matchesQuest(quest, type, data) {
        if (quest.type === 'catch_fish' && type === 'fish_caught') {
            // Сравниваем ID рыбы
            const matches = quest.fishId === data.fishId || quest.fishId === data.id;
            if (!matches) {
                console.log(`[QuestSystem] Рыба не совпала: quest.fishId=${quest.fishId}, data.fishId=${data.fishId}, data.id=${data.id}`);
            }
            return matches;
        }
        if (quest.type === 'find_rare_item' && type === 'rare_item_found') {
            return true;
        }
        if (quest.type === 'catch_monster' && type === 'monster_caught') {
            return true;
        }
        return false;
    }

    // Забрать награду за задание
    claimReward(questId, isWeekly = false) {
        const quest = isWeekly 
            ? this.weeklyQuests.find(q => q.id === questId)
            : this.dailyQuests.find(q => q.id === questId);

        if (!quest) return { success: false, message: L('quest_not_found', 'Задание не найдено') };

        const completedSet = isWeekly ? this.completedWeekly : this.completedDaily;
        
        if (completedSet.has(questId)) {
            return { success: false, message: L('quest_reward_claimed', 'Награда уже получена') };
        }

        if (quest.currentAmount < quest.targetAmount) {
            return { success: false, message: L('quest_not_completed', 'Задание не выполнено') };
        }

        // Выдаем награду
        if (window.gameState) {
            window.gameState.coins = (window.gameState.coins || 0) + quest.rewards.coins;
            window.gameState.gems = (window.gameState.gems || 0) + quest.rewards.gems;
        }

        completedSet.add(questId);
        
        // Регистрируем выполненное задание и заработанные валюты в профиле
        if (window.game && window.game.profileSystem) {
            window.game.profileSystem.registerQuestCompleted();
            window.game.profileSystem.registerCoinsEarned(quest.rewards.coins);
            window.game.profileSystem.registerGemsEarned(quest.rewards.gems);
        }
        
        this.saveProgress();

        return { success: true, rewards: quest.rewards };
    }

    // Пропустить день (за бриллианты)
    skipDay() {
        if (!window.gameState || window.gameState.gems < this.DAILY_SKIP_COST) {
            return { success: false, message: L('quest_not_enough_gems', 'Недостаточно бриллиантов') };
        }

        window.gameState.gems -= this.DAILY_SKIP_COST;
        this.resetDailyQuests();

        return { success: true, message: L('quest_daily_updated', 'Ежедневные задания обновлены!') };
    }

    // Пропустить неделю (за бриллианты)
    skipWeek() {
        if (!window.gameState || window.gameState.gems < this.WEEKLY_SKIP_COST) {
            return { success: false, message: L('quest_not_enough_gems', 'Недостаточно бриллиантов') };
        }

        window.gameState.gems -= this.WEEKLY_SKIP_COST;
        this.resetWeeklyQuests();

        return { success: true, message: L('quest_weekly_updated', 'Еженедельные задания обновлены!') };
    }

    // Получить время до следующего сброса
    getTimeUntilReset(isWeekly = false) {
        const lastReset = isWeekly ? this.lastWeeklyReset : this.lastDailyReset;
        const resetInterval = isWeekly ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        const nextReset = lastReset + resetInterval;
        return Math.max(0, nextReset - Date.now());
    }

    // Форматирование времени
    formatTimeLeft(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            return `${days}д ${remainingHours}ч`;
        }
        
        return `${hours}ч ${minutes}м`;
    }

    // Сохранение в облако через главную систему
    saveProgress() {
        if (window.game) {
            window.game.saveGameDataDebounced();
        }
    }

    // Загрузка из облака через главную систему
    loadProgress() {
        // Загрузка теперь происходит через game.loadGameData()
        // Оставляем метод для совместимости, но ничего не делаем
    }

    // Получить описание задания
    getQuestDescription(quest) {
        if (quest.type === 'catch_fish') {
            // Получаем локализованное имя рыбы
            let fishName = quest.fishName || L('fish', 'рыбу');
            
            // Если есть fishId, пытаемся получить актуальное локализованное имя
            if (quest.fishId && window.FISH_DATABASE) {
                const fishData = window.FISH_DATABASE.find(f => f.id === quest.fishId);
                if (fishData && window.FishDB) {
                    fishName = window.FishDB.getLocalizedName(fishData);
                }
            }
            
            return `${L('quest_catch_fish', 'Поймать:')} ${fishName} (${quest.targetAmount} ${L('quest_pieces_short', 'шт.')})`;
        }
        if (quest.type === 'find_rare_item') {
            return `${L('quest_find_rare_item', 'Найти редких предметов:')} ${quest.targetAmount} ${L('quest_pieces_short', 'шт.')}`;
        }
        if (quest.type === 'catch_monster') {
            return `${L('quest_catch_monster', 'Поймать монстров:')} ${quest.targetAmount} ${L('quest_pieces_short', 'шт.')}`;
        }
        return L('quest_unknown', 'Неизвестное задание');
    }

    // Проверить наличие выполненных, но не забранных заданий
    hasUnclaimedQuests() {
        // Проверяем ежедневные задания
        for (const quest of this.dailyQuests) {
            if (quest.currentAmount >= quest.targetAmount && !this.completedDaily.has(quest.id)) {
                return true;
            }
        }
        
        // Проверяем еженедельные задания
        for (const quest of this.weeklyQuests) {
            if (quest.currentAmount >= quest.targetAmount && !this.completedWeekly.has(quest.id)) {
                return true;
            }
        }
        
        return false;
    }
}

// Не создаем экземпляр сразу - он будет создан в main.js после загрузки всех данных
