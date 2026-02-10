// -*- coding: utf-8 -*-
// Система профиля игрока - сбор и хранение статистики
class ProfileSystem {
    constructor() {
        // Статистика игрока
        this.stats = {
            // Основные показатели
            level: 1,
            xp: 0,
            
            // Статистика ловли
            totalFishCaught: 0,        // Всего поймано рыб
            totalMonstersCaught: 0,    // Всего поймано монстров
            totalItemsCaught: 0,       // Всего поймано предметов (мусора)
            
            // Рекорды
            heaviestFish: null,        // Самая тяжелая рыба { name, weight, date }
            
            // Прогресс
            questsCompleted: 0,        // Выполнено заданий
            locationsUnlocked: 1,      // Открыто локаций
            
            // Мастерство (процент успешно пойманных рыб)
            successfulCatches: 0,      // Успешно поймано (после подсечки)
            fishEscaped: 0,            // Сорвалось (после подсечки)
            mastery: 100,              // Процент мастерства (изначально 100%)
            
            // Дополнительная статистика
            totalCoinEarned: 0,        // Всего заработано монет
            totalGemsEarned: 0,        // Всего заработано бриллиантов
            totalDistanceTraveled: 0,  // Всего пройдено расстояния (для будущего)
            playTime: 0                // Время игры в секундах
        };
        
        // Время начала сессии
        this.sessionStartTime = Date.now();
        
        this.loadFromStorage();
    }
    
    // ============= ОБНОВЛЕНИЕ СТАТИСТИКИ =============
    
    // Зарегистрировать пойманную рыбу
    registerFishCaught(fish, weight) {
        this.stats.totalFishCaught++;
        this.stats.successfulCatches++; // Успешный улов для мастерства
        
        // Проверяем рекорд по весу
        const isNewRecord = !this.stats.heaviestFish || weight > this.stats.heaviestFish.weight;
        if (isNewRecord) {
            this.stats.heaviestFish = {
                id: fish.id, // Сохраняем ID для локализации
                name: fish.name, // Оставляем для обратной совместимости
                weight: weight,
                date: new Date().toLocaleDateString('ru-RU')
            };
            
            // Обновляем лидерборд веса
            this.updateWeightLeaderboard(weight);
        }
        
        // Обновляем лидерборд количества рыб
        this.updateTotalFishLeaderboard();
        
        // Пересчитываем мастерство
        this.updateMastery();
        this.saveToStorage();
    }
    
    // Зарегистрировать пойманного монстра
    registerMonsterCaught(monster, weight) {
        this.stats.totalMonstersCaught++;
        this.stats.successfulCatches++; // Успешный улов для мастерства
        
        // Монстры тоже могут быть рекордными по весу
        const isNewRecord = !this.stats.heaviestFish || weight > this.stats.heaviestFish.weight;
        if (isNewRecord) {
            this.stats.heaviestFish = {
                name: monster.name,
                weight: weight,
                date: new Date().toLocaleDateString('ru-RU')
            };
            
            // Обновляем лидерборд веса
            this.updateWeightLeaderboard(weight);
        }
        
        // Обновляем лидерборд количества рыб (монстры тоже считаются)
        this.updateTotalFishLeaderboard();
        
        // Пересчитываем мастерство
        this.updateMastery();
        this.saveToStorage();
    }
    
    // Зарегистрировать пойманный предмет
    registerItemCaught(item) {
        this.stats.totalItemsCaught++;
        this.saveToStorage();
    }
    
    // Зарегистрировать сорвавшуюся рыбу (после подсечки)
    registerFishEscaped() {
        this.stats.fishEscaped++;
        console.log('🐟 Рыба сорвалась! Всего сорвалось:', this.stats.fishEscaped);
        
        // Обновляем лидерборд срывов
        this.updateFailsLeaderboard();
        
        // Пересчитываем мастерство
        this.updateMastery();
        this.saveToStorage();
    }
    
    // Обновить мастерство
    updateMastery() {
        const totalAttempts = this.stats.successfulCatches + this.stats.fishEscaped;
        if (totalAttempts === 0) {
            this.stats.mastery = 100;
        } else {
            this.stats.mastery = Math.round((this.stats.successfulCatches / totalAttempts) * 100);
        }
    }
    
    // Зарегистрировать выполненное задание
    registerQuestCompleted() {
        this.stats.questsCompleted++;
        this.saveToStorage();
    }
    
    // Обновить количество открытых локаций
    updateLocationsUnlocked(count) {
        this.stats.locationsUnlocked = count;
        this.saveToStorage();
    }
    
    // Зарегистрировать заработанные монеты
    registerCoinsEarned(amount) {
        this.stats.totalCoinEarned += amount;
        
        // Обновляем лидерборд монет
        this.updateCoinsLeaderboard();
        
        this.saveToStorage();
    }
    
    // Зарегистрировать заработанные бриллианты
    registerGemsEarned(amount) {
        this.stats.totalGemsEarned += amount;
        this.saveToStorage();
    }
    
    // Обновить уровень и опыт
    updateLevelAndXP(level, xp) {
        this.stats.level = level;
        this.stats.xp = xp;
        this.saveToStorage();
    }
    
    // Обновить время игры
    updatePlayTime(deltaTime) {
        this.stats.playTime += deltaTime;
    }
    
    // ============= ПОЛУЧЕНИЕ СТАТИСТИКИ =============
    
    // Получить всю статистику
    getStats() {
        return { ...this.stats };
    }
    
    // Получить уровень
    getLevel() {
        return this.stats.level;
    }
    
    // Получить опыт
    getXP() {
        return this.stats.xp;
    }
    
    // Получить опыт для следующего уровня
    getXPForNextLevel() {
        // Формула должна соответствовать FishingProgression
        // До 20 уровня: 100 * 1.2^(level-1)
        // После 20 уровня: 100 * 1.09^(level-1)
        // Максимальный уровень 100
        if (this.stats.level >= 100) {
            return 0; // Максимальный уровень достигнут
        }
        const coefficient = this.stats.level < 20 ? 1.2 : 1.09;
        return Math.floor(100 * Math.pow(coefficient, this.stats.level - 1));
    }
    
    // Получить монеты (из FishingGame)
    getCoins() {
        return window.game?.fishingGame?.coins || 0;
    }
    
    // Получить бриллианты (из FishingGame)
    getGems() {
        return window.game?.fishingGame?.premiumCoins || 0;
    }
    
    // Получить мастерство
    getMastery() {
        return this.stats.mastery;
    }
    
    // Получить общее количество пойманного
    getTotalCaught() {
        return this.stats.totalFishCaught + this.stats.totalMonstersCaught + this.stats.totalItemsCaught;
    }
    
    // Получить самую тяжелую рыбу
    getHeaviestFish() {
        return this.stats.heaviestFish;
    }
    
    // Получить форматированное время игры
    getFormattedPlayTime() {
        const hours = Math.floor(this.stats.playTime / 3600);
        const minutes = Math.floor((this.stats.playTime % 3600) / 60);
        
        if (hours > 0) {
            return `${hours} ч ${minutes} мин`;
        } else {
            return `${minutes} мин`;
        }
    }
    
    // ============= СОХРАНЕНИЕ/ЗАГРУЗКА =============
    
    saveToStorage() {
        try {
            if (window.game) {
                window.game.saveGameDataDebounced();
            }
        } catch (e) {
            console.error('Ошибка сохранения статистики профиля:', e);
        }
    }
    
    loadFromStorage() {
        // Загрузка теперь происходит через game.loadGameData()
        // Оставляем метод для совместимости, но ничего не делаем
    }
    
    // Сброс статистики (для отладки)
    reset() {
        this.stats = {
            level: 1,
            xp: 0,
            totalFishCaught: 0,
            totalMonstersCaught: 0,
            totalItemsCaught: 0,
            heaviestFish: null,
            questsCompleted: 0,
            locationsUnlocked: 1,
            successfulCatches: 0,
            fishEscaped: 0,
            mastery: 100,
            totalCoinEarned: 0,
            totalGemsEarned: 0,
            totalDistanceTraveled: 0,
            playTime: 0
        };
        this.saveToStorage();
    }
    
    // ============= ОБНОВЛЕНИЕ ЛИДЕРБОРДОВ =============
    
    // Обновить лидерборд веса
    async updateWeightLeaderboard(weight) {
        if (window.ratingSystem) {
            // Отправляем вес в граммах (умножаем на 100 для точности)
            const scoreInGrams = Math.floor(weight * 100);
            await window.ratingSystem.updateLeaderboardScore('weight', scoreInGrams);
        }
    }
    
    // Обновить лидерборд количества рыб
    async updateTotalFishLeaderboard() {
        if (window.ratingSystem) {
            await window.ratingSystem.updateLeaderboardScore('totalFish', this.stats.totalFishCaught);
        }
    }
    
    // Обновить лидерборд монет
    async updateCoinsLeaderboard() {
        if (window.ratingSystem) {
            await window.ratingSystem.updateLeaderboardScore('coins', this.stats.totalCoinEarned);
        }
    }
    
    // Обновить лидерборд срывов
    async updateFailsLeaderboard() {
        if (window.ratingSystem) {
            await window.ratingSystem.updateLeaderboardScore('fails', this.stats.fishEscaped);
        }
    }
}
