// -*- coding: utf-8 -*-
// Система коллекции - отслеживание пойманных рыб и предметов
class CollectionSystem {
    constructor() {
        this.caughtFish = new Set(); // ID пойманных рыб
        this.caughtMonsters = new Set(); // ID пойманных монстров
        this.caughtItems = new Set(); // ID найденных предметов
        
        this.loadFromStorage();
    }
    
    // Отметить рыбу как пойманную
    markFishCaught(fishId) {
        if (!this.caughtFish.has(fishId)) {
            this.caughtFish.add(fishId);
            this.saveToStorage();
            return true; // Первая поимка
        }
        return false;
    }
    
    // Отметить монстра как пойманного
    markMonsterCaught(monsterId) {
        if (!this.caughtMonsters.has(monsterId)) {
            this.caughtMonsters.add(monsterId);
            this.saveToStorage();
            return true;
        }
        return false;
    }
    
    // Отметить предмет как найденный
    markItemFound(itemId) {
        if (!this.caughtItems.has(itemId)) {
            this.caughtItems.add(itemId);
            this.saveToStorage();
            return true;
        }
        return false;
    }
    
    // Проверить, поймана ли рыба
    isFishCaught(fishId) {
        const result = this.caughtFish.has(fishId);
        // console.log(`CollectionSystem: Проверка рыбы ID=${fishId}: ${result ? 'поймана' : 'не поймана'}`);
        return result;
    }
    
    // Проверить, пойман ли монстр
    isMonsterCaught(monsterId) {
        return this.caughtMonsters.has(monsterId);
    }
    
    // Проверить, найден ли предмет
    isItemFound(itemId) {
        return this.caughtItems.has(itemId);
    }
    
    // Получить статистику коллекции
    getStats() {
        const totalFish = FISH_DATABASE ? FISH_DATABASE.length : 0;
        const caughtFishCount = this.caughtFish.size;
        const totalMonsters = (typeof MONSTERS_DATABASE !== 'undefined') ? MONSTERS_DATABASE.length : 0;
        const caughtMonstersCount = this.caughtMonsters.size;
        const totalItems = (typeof JUNK_DATABASE !== 'undefined') ? JUNK_DATABASE.length : 0;
        const caughtItemsCount = this.caughtItems.size;
        
        return {
            fish: { caught: caughtFishCount, total: totalFish },
            monsters: { caught: caughtMonstersCount, total: totalMonsters },
            items: { caught: caughtItemsCount, total: totalItems }
        };
    }
    
    // Сохранение в облако через главную систему
    saveToStorage() {
        // Сохранение теперь происходит через game.saveGameData()
        if (window.game) {
            window.game.saveGameDataDebounced();
        }
    }
    
    // Загрузка из облака через главную систему
    loadFromStorage() {
        // Загрузка теперь происходит через game.loadGameData()
        // Оставляем метод для совместимости, но ничего не делаем
    }
    
    // Сброс коллекции (для тестирования)
    reset() {
        this.caughtFish.clear();
        this.caughtMonsters.clear();
        this.caughtItems.clear();
        this.saveToStorage();
    }
}
