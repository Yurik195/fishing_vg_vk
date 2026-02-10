// -*- coding: utf-8 -*-
// Система ежедневных наград
class DailyRewardsSystem {
    constructor() {
        this.currentDay = 0; // Текущий день (0-29)
        this.lastClaimDate = null; // Дата последнего получения награды
        this.totalDaysClaimed = 0; // Всего дней получено наград
        
        // Загружаем прогресс
        this.loadProgress();
        
        // Проверяем, можно ли получить награду сегодня
        this.checkDailyReset();
    }
    
    // Загрузка прогресса из облака через главную систему
    loadProgress() {
        // Загрузка теперь происходит через game.loadGameData()
        // Оставляем метод для совместимости, но ничего не делаем
    }
    
    // Сохранение прогресса в облако через главную систему
    saveProgress() {
        try {
            if (window.game) {
                window.game.saveGameDataDebounced();
            }
        } catch (e) {
            console.error('Ошибка сохранения ежедневных наград:', e);
        }
    }
    
    // Проверка сброса (если пропущен день)
    checkDailyReset() {
        if (!this.lastClaimDate) return;
        
        const now = new Date();
        const lastClaim = new Date(this.lastClaimDate);
        
        // Сбрасываем время до начала дня для корректного сравнения
        now.setHours(0, 0, 0, 0);
        lastClaim.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((now - lastClaim) / (1000 * 60 * 60 * 24));
        
        // Если прошло больше 1 дня - сбрасываем прогресс
        if (daysDiff > 1) {
            this.currentDay = 0;
            this.saveProgress();
        }
    }
    
    // Можно ли получить награду сегодня
    canClaimToday() {
        if (!this.lastClaimDate) return true;
        
        const now = new Date();
        const lastClaim = new Date(this.lastClaimDate);
        
        // Сбрасываем время
        now.setHours(0, 0, 0, 0);
        lastClaim.setHours(0, 0, 0, 0);
        
        return now > lastClaim;
    }
    
    // Получить награду за текущий день
    claimReward() {
        if (!this.canClaimToday()) {
            return { success: false, message: 'Награда уже получена сегодня!' };
        }
        
        const reward = this.getRewardForDay(this.currentDay);
        
        // Обновляем прогресс
        this.lastClaimDate = new Date();
        this.totalDaysClaimed++;
        this.currentDay = (this.currentDay + 1) % 30; // Цикл 30 дней
        
        this.saveProgress();
        
        return {
            success: true,
            day: this.currentDay === 0 ? 30 : this.currentDay, // Показываем день 1-30
            reward: reward,
            message: 'Награда получена!'
        };
    }
    
    // Получить награду для конкретного дня (0-29)
    getRewardForDay(day) {
        const rewards = this.getAllRewards();
        return rewards[day];
    }
    
    // Все награды за 30 дней (уменьшено на 60%)
    getAllRewards() {
        return [
            // День 1
            { coins: 40, bait: { id: 1, count: 5, name: 'Червь' }, description: 'Стартовый набор' },
            // День 2
            { coins: 60, feedBonus: 1, description: 'Монеты + прикормка' },
            // День 3
            { coins: 80, bait: { id: 2, count: 3, name: 'Опарыш' }, description: 'Немного наживки' },
            // День 4
            { coins: 100, gear: { type: 'hook', tier: 2, name: 'Крючок №8' }, description: 'Простой крючок' },
            // День 5
            { coins: 120, bait: { id: 3, count: 2, name: 'Кукуруза' }, description: 'Немного наживки' },
            // День 6
            { coins: 140, feedBonus: 1, description: 'Монеты + прикормка' },
            // День 7 - Бонус недели 1
            { coins: 200, gems: 20, gear: { type: 'line', tier: 2, name: 'Леска 0.18' }, description: 'Недельный бонус!' },
            
            // День 8
            { coins: 160, bait: { id: 1, count: 4, name: 'Червь' }, description: 'Немного наживки' },
            // День 9
            { coins: 180, feedBonus: 1, description: 'Монеты + прикормка' },
            // День 10
            { coins: 200, gear: { type: 'float', tier: 2, name: 'Поплавок 3г' }, description: 'Простой поплавок' },
            // День 11
            { coins: 220, bait: { id: 4, count: 2, name: 'Тесто' }, description: 'Немного наживки' },
            // День 12
            { coins: 240, feedBonus: 1, description: 'Монеты + прикормка' },
            // День 13
            { coins: 260, bait: { id: 2, count: 3, name: 'Опарыш' }, description: 'Немного наживки' },
            // День 14 - Бонус недели 2
            { coins: 280, energyDrink: 1, feedBonus: 1, gear: { type: 'rod', tier: 3, name: 'Удочка Стекло' }, description: 'Недельный бонус!' },
            
            // День 15
            { coins: 280, bait: { id: 5, count: 2, name: 'Мотыль' }, description: 'Немного наживки' },
            // День 16
            { coins: 300, feedBonus: 1, description: 'Монеты + прикормка' },
            // День 17
            { coins: 320, gear: { type: 'hook', tier: 3, name: 'Крючок №6' }, description: 'Крючок получше' },
            // День 18
            { coins: 340, bait: { id: 3, count: 3, name: 'Кукуруза' }, description: 'Немного наживки' },
            // День 19
            { coins: 360, feedBonus: 1, description: 'Монеты + прикормка' },
            // День 20
            { coins: 380, bait: { id: 6, count: 2, name: 'Хлеб' }, description: 'Немного наживки' },
            // День 21 - Бонус недели 3 (Удочка Карбон)
            { coins: 400, gear: { type: 'rod', tier: 5, name: 'Удочка Карбон' }, bait: { id: 7, count: 2, name: 'Живец' }, description: 'Недельный бонус!' },
            
            // День 22
            { coins: 400, feedBonus: 1, description: 'Монеты + прикормка' },
            // День 23
            { coins: 420, gear: { type: 'line', tier: 3, name: 'Леска 0.20' }, description: 'Леска получше' },
            // День 24
            { coins: 440, bait: { id: 4, count: 3, name: 'Тесто' }, description: 'Немного наживки' },
            // День 25
            { coins: 460, energyDrink: 1, description: 'Монеты + энергетик' },
            // День 26
            { coins: 480, bait: { id: 1, count: 5, name: 'Червь' }, description: 'Немного наживки' },
            // День 27
            { coins: 500, gear: { type: 'float', tier: 3, name: 'Поплавок 5г' }, description: 'Поплавок получше' },
            // День 28 - Бонус недели 4 (Живец - наживка для хищника)
            { coins: 600, gems: 30, bait: { id: 7, count: 5, name: 'Живец' }, description: 'Недельный бонус!' },
            
            // День 29
            { coins: 520, energyDrink: 1, feedBonus: 1, description: 'Монеты + бонусы' },
            // День 30 - Финальный бонус
            { 
                coins: 800, 
                gems: 40, 
                energyDrink: 2, 
                feedBonus: 2, 
                blood: 1,
                repairKit: 1,
                bait: { id: 7, count: 3, name: 'Живец' },
                description: 'Юбилейная награда!' 
            }
        ];
    }
    
    // Получить текущий день для отображения (1-30)
    getCurrentDisplayDay() {
        return this.currentDay + 1;
    }
    
    // Получить следующий день для отображения
    getNextDisplayDay() {
        if (!this.canClaimToday()) {
            return this.currentDay + 1;
        }
        return this.currentDay + 1;
    }
}
