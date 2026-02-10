// -*- coding: utf-8 -*-
// Система трофеев - изготовление чучел из рыб
class TrophySystem {
    constructor() {
        this.trophies = []; // Список изготовленных чучел
        this.installedTrophies = {}; // Установленные чучела по слотам
        this.slots = [
            // Нижний ряд (бесплатные) - раздвинуты от центра на 60px и подняты на 45px
            { id: 1, x: -180, y: 15, unlocked: true, cost: 0, currency: 'coins' },
            { id: 2, x: 180, y: 15, unlocked: true, cost: 0, currency: 'coins' },
            // Средний ряд (за монеты) - раздвинуты от центра на 60px и подняты на 45px
            { id: 3, x: -180, y: -105, unlocked: false, cost: 50000, currency: 'coins' },
            { id: 4, x: 180, y: -105, unlocked: false, cost: 50000, currency: 'coins' },
            // Верхний ряд (за кристаллы) - раздвинуты от центра на 60px и подняты на 45px
            { id: 5, x: -180, y: -225, unlocked: false, cost: 500, currency: 'gems' },
            { id: 6, x: 180, y: -225, unlocked: false, cost: 500, currency: 'gems' }
        ];
        
        this.loadFromStorage();
    }
    
    // Создать чучело из рыбы
    createTrophy(fish) {
        const trophy = {
            id: Date.now() + Math.random(),
            fishId: fish.id,
            name: fish.name,
            weight: fish.caughtWeight || fish.weight,
            rarity: fish.rarity,
            isMonster: fish.isMonster || false,
            createdAt: Date.now()
        };
        
        this.trophies.push(trophy);
        this.saveToStorage();
        
        return trophy;
    }
    
    // Установить чучело в слот
    installTrophy(trophyId, slotId) {
        const slot = this.slots.find(s => s.id === slotId);
        if (!slot || !slot.unlocked) {
            return false;
        }
        
        // Если в слоте уже есть чучело, снимаем его
        if (this.installedTrophies[slotId]) {
            this.uninstallTrophy(slotId);
        }
        
        this.installedTrophies[slotId] = trophyId;
        this.saveToStorage();
        
        return true;
    }
    
    // Снять чучело со слота
    uninstallTrophy(slotId) {
        delete this.installedTrophies[slotId];
        this.saveToStorage();
    }
    
    // Продать чучело
    sellTrophy(trophyId) {
        const trophyIndex = this.trophies.findIndex(t => t.id === trophyId);
        if (trophyIndex === -1) return 0;
        
        const trophy = this.trophies[trophyIndex];
        
        // Если чучело установлено, снимаем его
        for (const slotId in this.installedTrophies) {
            if (this.installedTrophies[slotId] === trophyId) {
                this.uninstallTrophy(parseInt(slotId));
            }
        }
        
        // Удаляем чучело
        this.trophies.splice(trophyIndex, 1);
        
        // Цена продажи - 70% от стоимости рыбы
        const fishData = this.getFishData(trophy.fishId);
        const baseFishPrice = fishData?.sellPrice || 100;
        const sellPrice = Math.floor(baseFishPrice * trophy.weight * 0.7);
        
        this.saveToStorage();
        return sellPrice;
    }
    
    // Разблокировать слот
    unlockSlot(slotId) {
        const slot = this.slots.find(s => s.id === slotId);
        if (!slot || slot.unlocked) return false;
        
        slot.unlocked = true;
        this.saveToStorage();
        return true;
    }
    
    // Получить данные рыбы из базы
    getFishData(fishId) {
        if (window.FISH_DATABASE) {
            return window.FISH_DATABASE.find(f => f.id === fishId);
        }
        if (window.MONSTERS_DATABASE) {
            return window.MONSTERS_DATABASE.find(m => m.id === fishId);
        }
        return null;
    }
    
    // Получить чучело по ID
    getTrophy(trophyId) {
        return this.trophies.find(t => t.id === trophyId);
    }
    
    // Получить все чучела
    getAllTrophies() {
        return [...this.trophies];
    }
    
    // Получить установленные чучела
    getInstalledTrophies() {
        return { ...this.installedTrophies };
    }
    
    // Сохранение в облако через главную систему
    saveToStorage() {
        if (window.game) {
            window.game.saveGameDataDebounced();
        }
    }
    
    // Загрузка из облака через главную систему
    loadFromStorage() {
        // Загрузка теперь происходит через game.loadGameData()
        // Оставляем метод для совместимости, но ничего не делаем
    }
}
