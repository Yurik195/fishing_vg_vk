// -*- coding: utf-8 -*-
// База данных премиум товаров
const PREMIUM_DATABASE = [
    {
        id: 'energizer',
        name: 'Энергетик',
        emoji: '⚡',
        spriteId: 1, // p1.png
        description: 'Дает прибавку к силе на 10 минут. С ним немного легче вытаскивать рыбу.',
        price: 19,
        currency: 'gems',
        duration: 600, // 10 минут в секундах
        effect: {
            type: 'power_boost',
            value: 0.15 // +15% к силе вытаскивания
        }
    },
    {
        id: 'bait_booster',
        name: 'Прикормка',
        emoji: '🌾',
        spriteId: 2, // p2.png
        description: 'Рыба чаще клюет на 10 минут. Увеличивает частоту поклевок.',
        price: 29,
        currency: 'gems',
        duration: 600, // 10 минут в секундах
        effect: {
            type: 'bite_frequency',
            value: 0.3 // +30% к частоте поклевок
        }
    },
    {
        id: 'lucky_coin',
        name: 'Юбилейная монета',
        emoji: '🪙',
        spriteId: 3, // p3.png
        description: 'Дает удачу и небольшой процент поймать драгоценности на 1 час.',
        price: 39,
        currency: 'gems',
        duration: 3600, // 1 час в секундах
        effect: {
            type: 'treasure_luck',
            value: 0.01 // +1% шанс поймать драгоценности
        }
    },
    {
        id: 'blood',
        name: 'Кровь',
        emoji: '🩸',
        spriteId: 4, // p4.png
        description: 'Увеличивает шанс поймать рыб-монстров на 10 минут.',
        price: 79,
        currency: 'gems',
        duration: 600, // 10 минут в секундах
        effect: {
            type: 'monster_chance',
            value: 0.01 // +1% шанс поймать монстров
        }
    },
    {
        id: 'sonar_basic',
        name: 'Эхолот',
        emoji: '📡',
        spriteId: 5, // p5.png
        description: 'Показывает возможный вес и количество рыб в месте заброса. Действует всегда если выбран.',
        price: 299,
        currency: 'gems',
        duration: -1, // Постоянный эффект
        effect: {
            type: 'sonar_basic',
            showWeight: true,
            showCount: true,
            showSpecies: false
        }
    },
    {
        id: 'sonar_advanced',
        name: 'Эхолот ур.2',
        emoji: '📡',
        spriteId: 6, // p6.png
        description: 'Показывает возможный вес, количество и виды рыб в месте заброса. Действует всегда если выбран.',
        price: 199,
        currency: 'iap',
        hideGemIcon: true, // Не показывать иконку гемов для IAP товаров
        duration: -1, // Постоянный эффект
        effect: {
            type: 'sonar_advanced',
            showWeight: true,
            showCount: true,
            showSpecies: true
        }
    },
    {
        id: 'compass',
        name: 'Компас',
        emoji: '🧭',
        spriteId: 7, // p7.png
        description: '"Рыбий" компас, показывает количество рыб в месте заброса. Действует всегда если выбран.',
        price: 99,
        currency: 'gems',
        duration: -1, // Постоянный эффект
        effect: {
            type: 'compass',
            showCount: true
        }
    },
    {
        id: 'coffee_thermos',
        name: 'Термос с кофе',
        emoji: '☕',
        spriteId: 8, // p8.png
        description: 'Бодрит, самое время порыбачить на ночных рыб, длится 10 минут.',
        price: 39,
        currency: 'gems',
        duration: 600, // 10 минут в секундах
        effect: {
            type: 'time_slow',
            value: 0.5 // Замедление времени в 2 раза
        }
    },
    {
        id: 'fish_scanner',
        name: 'Сканер рыбы',
        emoji: '🔍',
        spriteId: 9, // p9.png
        description: 'Показывает вид рыбы во время поклевки. Действует всегда если выбран.',
        price: 499,
        currency: 'iap',
        hideGemIcon: true, // Не показывать иконку гемов для IAP товаров
        duration: -1, // Постоянный эффект
        effect: {
            type: 'fish_scanner',
            showSpeciesDuringBite: true
        }
    },
    {
        id: 'travel_map',
        name: 'Карта',
        emoji: '🗺️',
        spriteId: 10, // p10.png
        description: 'Карта коротких маршрутов к местам рыбалки. Постоянная скидка на перемещение по локациям.',
        price: 99,
        currency: 'iap',
        hideGemIcon: true, // Не показывать иконку гемов для IAP товаров
        duration: -1, // Постоянный эффект
        effect: {
            type: 'travel_discount',
            value: 0.1 // -10% на перемещение
        }
    },
    {
        id: 'repair_kit',
        name: 'Рем.набор',
        emoji: '🔧',
        spriteId: 11, // p11.png
        description: 'Ремонтирует все снасти установленные в данный момент.',
        price: 149,
        currency: 'gems',
        duration: 0, // Одноразовый
        effect: {
            type: 'repair_all'
        }
    },
    {
        id: 'glue',
        name: 'Клей',
        emoji: '🧴',
        spriteId: 12, // p12.png
        description: 'Ремонтирует самую изношенную снасть установленную в данный момент.',
        price: 49,
        currency: 'gems',
        duration: 0, // Одноразовый
        effect: {
            type: 'repair_one'
        }
    },
    {
        id: 'lucky_charm',
        name: 'Талисман удачи',
        emoji: '🍀',
        spriteId: 13, // p13.png
        description: 'Редкая рыба чаще клюет на 10 минут. Увеличивает частоту поклевок.',
        price: 79,
        currency: 'gems',
        duration: 600, // 10 минут в секундах
        effect: {
            type: 'rare_fish_boost',
            value: 0.1 // +10% шанс редкой рыбы
        }
    },
    {
        id: 'lucky_wallet',
        name: 'Бумажник удачи',
        emoji: '💰',
        spriteId: 14, // p14.png
        description: 'Продажа рыбы на рыбалке выгоднее на 10 минут. Увеличивает цену рыбы +20% на рыбалке.',
        price: 49,
        currency: 'gems',
        duration: 600, // 10 минут в секундах
        effect: {
            type: 'price_boost',
            value: 0.2 // +20% к цене
        }
    },
    {
        id: 'chan_chu',
        name: 'Чань Чу',
        emoji: '🐸',
        spriteId: 15, // p15.png
        description: 'Продажа рыбы на рыбалке выгоднее на 10 минут. Увеличивает цену рыбы +40% на рыбалке.',
        price: 29,
        currency: 'iap',
        hideGemIcon: true, // Не показывать иконку гемов для IAP товаров
        duration: 600, // 10 минут в секундах
        effect: {
            type: 'price_boost',
            value: 0.4 // +40% к цене
        }
    },
    {
        id: 'fishing_magazine',
        name: 'Журнал Рыбалка',
        emoji: '📰',
        spriteId: 16, // p16.png
        description: 'Выпуск рыбы на рыбалке выгоднее на 10 минут. Увеличивает опыт за рыбу +20% на рыбалке.',
        price: 49,
        currency: 'gems',
        duration: 600, // 10 минут в секундах
        effect: {
            type: 'xp_boost',
            value: 0.2 // +20% к опыту
        }
    },
    {
        id: 'fishing_book',
        name: 'Книга Рыбалка',
        emoji: '📚',
        spriteId: 17, // p17.png
        description: 'Выпуск рыбы на рыбалке выгоднее на 10 минут. Увеличивает опыт за рыбу +40% на рыбалке.',
        price: 29,
        currency: 'iap',
        hideGemIcon: true, // Не показывать иконку гемов для IAP товаров
        duration: 600, // 10 минут в секундах
        effect: {
            type: 'xp_boost',
            value: 0.4 // +40% к опыту
        }
    }
];

// Класс для управления премиум эффектами
class PremiumEffectsManager {
    constructor() {
        // Активные временные эффекты
        this.activeEffects = [];
        
        // Постоянные эффекты
        this.permanentEffects = {
            sonar: null, // 'basic' или 'advanced'
            compass: false,
            fishScanner: false,
            travelDiscount: false
        };
    }
    
    // Активировать эффект
    activateEffect(itemId) {
        const item = PREMIUM_DATABASE.find(p => p.id === itemId);
        if (!item) return false;
        
        // Одноразовые эффекты (ремонт)
        if (item.duration === 0) {
            if (item.effect.type === 'repair_all') {
                this.repairAllGear();
            } else if (item.effect.type === 'repair_one') {
                this.repairMostDamagedGear();
            }
            return true;
        }
        
        // Постоянные эффекты
        if (item.duration === -1) {
            if (item.effect.type === 'sonar_basic') {
                this.permanentEffects.sonar = 'basic';
            } else if (item.effect.type === 'sonar_advanced') {
                this.permanentEffects.sonar = 'advanced';
            } else if (item.effect.type === 'compass') {
                this.permanentEffects.compass = true;
            } else if (item.effect.type === 'fish_scanner') {
                this.permanentEffects.fishScanner = true;
            } else if (item.effect.type === 'travel_discount') {
                this.permanentEffects.travelDiscount = true;
            }
            return true;
        }
        
        // Временный эффект
        const existingIndex = this.activeEffects.findIndex(e => e.type === item.effect.type);
        
        if (existingIndex !== -1) {
            // Продлеваем существующий эффект
            this.activeEffects[existingIndex].endTime = Date.now() + item.duration * 1000;
        } else {
            // Добавляем новый эффект
            this.activeEffects.push({
                type: item.effect.type,
                value: item.effect.value,
                endTime: Date.now() + item.duration * 1000,
                itemId: itemId,
                name: item.name
            });
        }
        
        return true;
    }
    
    // Ремонт всех снастей
    repairAllGear() {
        if (window.game && window.game.fishingGame) {
            const gearInventory = window.game.fishingGame.gearInventory;
            if (gearInventory && gearInventory.inventory && gearInventory.equipped) {
                let repaired = false;
                
                // Ремонтируем только установленные снасти (equipped)
                const typeMap = {
                    rod: 'rods',
                    line: 'lines',
                    float: 'floats',
                    hook: 'hooks',
                    reel: 'reels'
                };
                
                Object.entries(typeMap).forEach(([type, category]) => {
                    const equippedTier = gearInventory.equipped[type];
                    if (equippedTier && gearInventory.inventory[category]) {
                        const item = gearInventory.inventory[category].find(g => g.tier === equippedTier);
                        if (item && item.durability !== undefined) {
                            item.durability = item.maxDurability || 100;
                            repaired = true;
                        }
                    }
                });
                
                if (repaired) {
                    gearInventory.saveToStorage();
                    console.log('[PremiumEffects] Все установленные снасти отремонтированы');
                    return true;
                }
            }
        }
        return false;
    }
    
    // Ремонт самой изношенной снасти
    repairMostDamagedGear() {
        if (window.game && window.game.fishingGame) {
            const gearInventory = window.game.fishingGame.gearInventory;
            if (gearInventory && gearInventory.inventory && gearInventory.equipped) {
                let mostDamaged = null;
                let lowestPercent = 1;
                
                // Ищем самую изношенную среди установленных снастей
                const typeMap = {
                    rod: 'rods',
                    line: 'lines',
                    float: 'floats',
                    hook: 'hooks',
                    reel: 'reels'
                };
                
                Object.entries(typeMap).forEach(([type, category]) => {
                    const equippedTier = gearInventory.equipped[type];
                    if (equippedTier && gearInventory.inventory[category]) {
                        const item = gearInventory.inventory[category].find(g => g.tier === equippedTier);
                        if (item && item.durability !== undefined) {
                            const percent = item.durability / (item.maxDurability || 100);
                            if (percent < lowestPercent) {
                                lowestPercent = percent;
                                mostDamaged = { type, item };
                            }
                        }
                    }
                });
                
                if (mostDamaged) {
                    mostDamaged.item.durability = mostDamaged.item.maxDurability || 100;
                    gearInventory.saveToStorage();
                    console.log(`[PremiumEffects] Отремонтирована снасть: ${mostDamaged.type}`);
                    return true;
                }
            }
        }
        return false;
    }
    
    // Обновление эффектов (удаление истекших)
    update() {
        const now = Date.now();
        this.activeEffects = this.activeEffects.filter(effect => effect.endTime > now);
    }
    
    // Получить активный эффект по типу
    getEffect(type) {
        return this.activeEffects.find(e => e.type === type);
    }
    
    // Проверить есть ли активный эффект
    hasEffect(type) {
        return this.activeEffects.some(e => e.type === type);
    }
    
    // Получить множитель силы
    getPowerMultiplier() {
        const effect = this.getEffect('power_boost');
        return effect ? (1 + effect.value) : 1;
    }
    
    // Получить множитель частоты поклевок
    getBiteFrequencyMultiplier() {
        const effect = this.getEffect('bite_frequency');
        return effect ? (1 + effect.value) : 1;
    }
    
    // Получить бонус к шансу драгоценностей
    getTreasureLuckBonus() {
        const effect = this.getEffect('treasure_luck');
        return effect ? effect.value : 0;
    }
    
    // Получить бонус к шансу монстров
    getMonsterChanceBonus() {
        const effect = this.getEffect('monster_chance');
        return effect ? effect.value : 0;
    }
    
    // Получить бонус к шансу редкой рыбы
    getRareFishBonus() {
        const effect = this.getEffect('rare_fish_boost');
        return effect ? effect.value : 0;
    }
    
    // Получить бонус к цене рыбы
    getPriceBonus() {
        const effect = this.getEffect('price_boost');
        return effect ? effect.value : 0;
    }
    
    // Получить бонус к опыту
    getXpBonus() {
        const effect = this.getEffect('xp_boost');
        return effect ? effect.value : 0;
    }
    
    // Проверить активен ли замедлитель времени
    hasTimeSlowEffect() {
        return this.hasEffect('time_slow');
    }
    
    // Получить множитель скорости времени
    getTimeSpeedMultiplier() {
        const effect = this.getEffect('time_slow');
        return effect ? effect.value : 1;
    }
    
    // Проверить есть ли скидка на путешествия
    hasTravelDiscount() {
        return this.permanentEffects.travelDiscount || false;
    }
    
    // Получить скидку на путешествия
    getTravelDiscount() {
        return this.permanentEffects.travelDiscount ? 0.1 : 0;
    }
    
    // Проверить есть ли сканер рыбы
    hasFishScanner() {
        return this.permanentEffects.fishScanner || false;
    }
    
    // Получить информацию об эхолоте или компасе
    getSonarInfo(castX, castY, fishingGame) {
        const hasSonar = this.permanentEffects.sonar;
        const hasCompass = this.permanentEffects.compass;
        
        if (!hasSonar && !hasCompass) return null;
        
        const isAdvanced = this.permanentEffects.sonar === 'advanced';
        const isBasic = this.permanentEffects.sonar === 'basic';
        
        // Используем кешированные данные если они есть
        if (this._cachedSonarData && this._cachedSonarData.castX === castX && this._cachedSonarData.castY === castY) {
            return this._cachedSonarData.info;
        }
        
        // Получаем случайных рыб из базы (симуляция)
        const possibleFish = this.getRandomFish();
        
        if (possibleFish.length === 0) return null;
        
        const info = {
            fishCount: possibleFish.length,
            weightRange: (isBasic || isAdvanced) ? this.getWeightRange(possibleFish) : null,
            species: isAdvanced ? possibleFish.map(f => f.name) : null,
            isAdvanced: isAdvanced,
            isBasic: isBasic,
            isCompass: hasCompass && !hasSonar
        };
        
        // Кешируем данные для этой позиции
        this._cachedSonarData = {
            castX: castX,
            castY: castY,
            info: info
        };
        
        return info;
    }
    
    // Получить случайных рыб для эхолота
    getRandomFish() {
        if (typeof FISH_DATABASE === 'undefined' || FISH_DATABASE.length === 0) {
            return [];
        }
        
        // Берем случайные 2-4 рыбы из базы
        const count = Math.floor(Math.random() * 3) + 2;
        const shuffled = [...FISH_DATABASE].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, FISH_DATABASE.length));
    }
    
    // Получить диапазон весов
    getWeightRange(fish) {
        if (fish.length === 0) return { min: 0, max: 0 };
        
        let min = Infinity;
        let max = -Infinity;
        
        fish.forEach(f => {
            const fishMin = f.minWeight || f.weightMin || 0.1;
            const fishMax = f.maxWeight || f.weightMax || 1.0;
            if (fishMin < min) min = fishMin;
            if (fishMax > max) max = fishMax;
        });
        
        return { min, max };
    }
    
    // Получить оставшееся время эффекта в секундах
    getRemainingTime(type) {
        const effect = this.getEffect(type);
        if (!effect) return 0;
        
        return Math.max(0, Math.ceil((effect.endTime - Date.now()) / 1000));
    }
    
    // Сохранение состояния
    save() {
        return {
            activeEffects: this.activeEffects,
            permanentEffects: this.permanentEffects
        };
    }
    
    // Загрузка состояния
    load(data) {
        if (data.activeEffects) {
            this.activeEffects = data.activeEffects;
        }
        if (data.permanentEffects) {
            this.permanentEffects = data.permanentEffects;
        }
    }
}
