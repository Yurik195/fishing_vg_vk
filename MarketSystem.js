// -*- coding: utf-8 -*-
// Система рынка с динамическими ценами
class MarketSystem {
    constructor() {
        this.priceMultipliers = new Map(); // ID рыбы -> множитель цены
        this.lastUpdateTime = Date.now();
        this.updateInterval = 5 * 60 * 1000; // Обновление цен каждые 5 минут
        
        this.loadFromStorage();
        this.initializePrices();
    }
    
    // Инициализация цен для всех рыб
    initializePrices() {
        if (typeof FISH_DATABASE === 'undefined') {
            console.warn('MarketSystem: FISH_DATABASE не загружена');
            return;
        }
        
        // Если цены уже есть и не устарели, не обновляем
        const timeSinceUpdate = Date.now() - this.lastUpdateTime;
        if (this.priceMultipliers.size > 0 && timeSinceUpdate < this.updateInterval) {
            console.log(`MarketSystem: Цены актуальны (обновлены ${Math.floor(timeSinceUpdate / 1000)}с назад)`);
            return;
        }
        
        // Генерируем новые цены для всех рыб
        FISH_DATABASE.forEach(fish => {
            this.priceMultipliers.set(fish.id, this.generatePriceMultiplier());
        });
        
        this.lastUpdateTime = Date.now();
        this.saveToStorage();
        
        console.log(`MarketSystem: Цены обновлены для ${this.priceMultipliers.size} видов рыб`);
    }
    
    // Генерация множителя цены (0.9 - 1.2)
    generatePriceMultiplier() {
        // Базовый рандом от 0.9 до 1.2
        const baseMultiplier = 0.9 + Math.random() * 0.3;
        
        // Добавляем влияние времени суток (если будет реализовано)
        const timeOfDayBonus = this.getTimeOfDayBonus();
        
        // Итоговый множитель с учетом времени
        const finalMultiplier = baseMultiplier + timeOfDayBonus;
        
        // Ограничиваем диапазон 0.9 - 1.2
        return Math.max(0.9, Math.min(1.2, finalMultiplier));
    }
    
    // Бонус от времени суток (пока заглушка, можно расширить)
    getTimeOfDayBonus() {
        const hour = new Date().getHours();
        
        // Утро (6-10): небольшой бонус
        if (hour >= 6 && hour < 10) {
            return 0.05;
        }
        // День (10-18): нормальные цены
        else if (hour >= 10 && hour < 18) {
            return 0;
        }
        // Вечер (18-22): повышенный спрос
        else if (hour >= 18 && hour < 22) {
            return 0.1;
        }
        // Ночь (22-6): низкий спрос
        else {
            return -0.05;
        }
    }
    
    // Получить текущую цену рыбы
    getFishPrice(fishId, basePrice) {
        const multiplier = this.priceMultipliers.get(fishId) || 1.0;
        return Math.floor(basePrice * multiplier);
    }
    
    // Получить множитель цены (для отображения процента)
    getPriceMultiplier(fishId) {
        return this.priceMultipliers.get(fishId) || 1.0;
    }
    
    // Продать рыбу
    sellFish(fishId, basePrice, quantity = 1) {
        const pricePerFish = this.getFishPrice(fishId, basePrice);
        const totalPrice = pricePerFish * quantity;
        
        console.log(`MarketSystem: Продано ${quantity}x рыба ID=${fishId} за ${totalPrice}💰 (${pricePerFish}💰 за шт.)`);
        
        return totalPrice;
    }
    
    // Обновить цены (вызывается периодически)
    update() {
        const timeSinceUpdate = Date.now() - this.lastUpdateTime;
        
        if (timeSinceUpdate >= this.updateInterval) {
            console.log('MarketSystem: Обновление цен на рынке...');
            this.initializePrices();
            return true; // Цены обновлены
        }
        
        return false; // Цены не изменились
    }
    
    // Получить время до следующего обновления цен
    getTimeUntilNextUpdate() {
        const timeSinceUpdate = Date.now() - this.lastUpdateTime;
        const timeRemaining = this.updateInterval - timeSinceUpdate;
        return Math.max(0, timeRemaining);
    }
    
    // Форматировать время до обновления
    getFormattedTimeUntilUpdate() {
        const ms = this.getTimeUntilNextUpdate();
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Сохранение в облако через главную систему
    saveToStorage() {
        try {
            if (window.game) {
                window.game.saveGameDataDebounced();
            }
        } catch (e) {
            console.error('Ошибка сохранения рынка:', e);
        }
    }
    
    // Загрузка из облака через главную систему
    loadFromStorage() {
        // Загрузка теперь происходит через game.loadGameData()
        // Оставляем метод для совместимости, но ничего не делаем
    }
    
    // Сброс (для тестирования)
    reset() {
        this.priceMultipliers.clear();
        this.lastUpdateTime = Date.now();
        this.initializePrices();
        this.saveToStorage();
    }
}
