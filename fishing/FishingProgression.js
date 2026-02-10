// Система прогрессии: снаряжение, сопротивление рыбы, баланс сложности
class FishingProgression {
    constructor() {
        // Текущее снаряжение игрока (tier уровни)
        this.equipment = {
            rod: 1,      // Удочка (tier 1)
            line: 1,     // Леска (tier 1)
            reel: 1,     // Катушка (tier 1)
            hook: 1,     // Крючок (tier 1)
            float: 1,    // Поплавок (tier 1)
            bait: 1      // Наживка (id)
        };
        
        // Текущая прочность снаряжения (currentDurability)
        this.durability = {
            rod: null,    // null = полная прочность (будет установлена при первом использовании)
            line: null,
            reel: null,
            hook: null,
            float: null
        };
        
        // Система наживок
        this.baitCount = 100; // Начальное количество наживок
        
        // Текущая зона
        this.currentZone = 1; // Деревенский пруд
        
        // Система опыта и уровней
        this.level = 1; // Начальный уровень
        this.currentXP = 0;
        this.xpToNextLevel = 100; // Базовое значение для уровня 2
        
        // Загружаем базы данных снастей
        if (typeof RODS_DATABASE !== 'undefined') {
            this.rodsDB = RODS_DATABASE;
            this.linesDB = LINES_DATABASE;
            this.floatsDB = FLOATS_DATABASE;
            this.hooksDB = HOOKS_DATABASE;
            this.reelsDB = REELS_DATABASE;
        }
        
        // Загружаем базы данных рыб, наживок и зон
        if (typeof FISH_DATABASE !== 'undefined') {
            this.fishDB = FISH_DATABASE;
        }
        if (typeof BAITS_DATABASE !== 'undefined') {
            this.baitsDB = BAITS_DATABASE;
        }
        if (typeof ZONES_DATABASE !== 'undefined') {
            this.zonesDB = ZONES_DATABASE;
        }
        
        // Инициализируем прочность всех снастей при создании
        this.initializeDurability();
    }
    
    // Инициализировать прочность всех снастей
    initializeDurability() {
        ['rod', 'line', 'reel', 'hook', 'float'].forEach(type => {
            const gear = this[`getCurrent${type.charAt(0).toUpperCase() + type.slice(1)}`]?.();
            if (gear && this.durability[type] === null) {
                this.durability[type] = gear.durability;
            }
        });
    }
    
    // Получить текущую удочку
    getCurrentRod() {
        if (!this.equipment.rod || this.equipment.rod === 0) return null;
        const rod = this.rodsDB?.find(r => r.tier === this.equipment.rod) || null;
        if (rod && this.durability.rod === null) {
            this.durability.rod = rod.durability; // Инициализация при первом использовании
        }
        return rod;
    }
    
    // Получить текущую леску
    getCurrentLine() {
        if (!this.equipment.line || this.equipment.line === 0) return null;
        const line = this.linesDB?.find(l => l.tier === this.equipment.line) || null;
        if (line && this.durability.line === null) {
            this.durability.line = line.durability;
        }
        return line;
    }
    
    // Получить текущий поплавок
    getCurrentFloat() {
        if (!this.equipment.float || this.equipment.float === 0) return null;
        const float = this.floatsDB?.find(f => f.tier === this.equipment.float) || null;
        if (float && this.durability.float === null) {
            this.durability.float = float.durability;
        }
        return float;
    }
    
    // Получить текущий крючок
    getCurrentHook() {
        if (!this.equipment.hook || this.equipment.hook === 0) return null;
        const hook = this.hooksDB?.find(h => h.tier === this.equipment.hook) || null;
        if (hook && this.durability.hook === null) {
            this.durability.hook = hook.durability;
        }
        return hook;
    }
    
    // Получить текущую катушку
    getCurrentReel() {
        if (!this.equipment.reel || this.equipment.reel === 0) return null;
        const reel = this.reelsDB?.find(r => r.tier === this.equipment.reel) || null;
        if (reel && this.durability.reel === null) {
            this.durability.reel = reel.durability;
        }
        return reel;
    }
    
    // Получить текущую наживку
    getCurrentBait() {
        return this.baitsDB?.find(b => b.id === this.equipment.bait) || null;
    }
    
    // Получить текущую зону
    getCurrentZone() {
        return this.zonesDB?.find(z => z.id === this.currentZone) || null;
    }
    
    // Получить общую силу вытягивания (powerCap удочки)
    getTotalPullPower() {
        const rod = this.getCurrentRod();
        if (!rod) return 1.0;
        
        // Нормализуем powerCap к множителю (10-95 -> 1.0-9.5)
        return rod.powerCap / 10;
    }
    
    // Получить порог разрыва лески (на основе testKg и dragKg катушки)
    getBreakTension(fish = null, fishWeight = 0) {
        const line = this.getCurrentLine();
        const reel = this.getCurrentReel();
        if (!line) return 0.9;
        
        let breakPoint = 0.85;
        
        // Режим для новичков: только для первой локации (зона 1) и игроков до 6 уровня
        const isNoviceZone = this.currentZone === 1;
        const isNoviceLevel = this.level < 6;
        const isNoviceMode = isNoviceZone && isNoviceLevel;
        
        // Только первый уровень в режиме новичка получает бонус к прочности
        if (line.tier === 1 && isNoviceMode) {
            breakPoint = 0.95; // Щадящий режим для новичков в первой локации
        } else {
            // Остальные случаи: стандартная прочность (0.85-0.88)
            breakPoint = 0.85 + (line.testKg / 52) * 0.03;
        }
        
        // Бонус от dragKg катушки (1.4-37.4 кг -> +0-0.05)
        if (reel && reel.dragKg) {
            const dragBonus = (reel.dragKg / 37.4) * 0.05;
            breakPoint += dragBonus;
        }
        
        // ШТРАФ: Если леска не соответствует весу рыбы - порог разрыва снижается до 70%
        if (fish && fishWeight > 0 && this.isLineMismatched(fish, fishWeight)) {
            breakPoint = 0.70; // Критический режим - леска рвется намного раньше
        }
        
        return Math.min(1.0, breakPoint);
    }
    
    // ============= СИСТЕМА ПРОВЕРКИ НЕСООТВЕТСТВИЯ СНАСТЕЙ =============
    
    // Проверить несоответствие лески весу рыбы
    isLineMismatched(fish, fishWeight) {
        const line = this.getCurrentLine();
        if (!line || !fish || fish.type === 'junk') return false;
        
        return fishWeight > line.testKg;
    }
    
    // Проверить несоответствие удочки параметрам рыбы
    isRodMismatched(fish, fishWeight) {
        const rod = this.getCurrentRod();
        if (!rod || !fish || fish.type === 'junk') return false;
        
        const fishPower = fish.power || 0;
        return fishPower > rod.powerCap || fishWeight > rod.maxWeight;
    }
    
    // Проверить несоответствие катушки весу рыбы
    isReelMismatched(fish, fishWeight) {
        const reel = this.getCurrentReel();
        if (!reel || !fish || fish.type === 'junk') return false;
        
        return fishWeight > reel.dragKg * 2;
    }
    
    // Проверить несоответствие крючка силе рыбы
    isHookMismatched(fish, fishWeight) {
        const hook = this.getCurrentHook();
        if (!hook || !fish || fish.type === 'junk') return false;
        
        const fishPower = fish.power || 0;
        return fishPower > hook.penetration * 5;
    }
    
    // Проверить несоответствие поплавка весу рыбы
    isFloatMismatched(fish, fishWeight) {
        const float = this.getCurrentFloat();
        if (!float || !fish || fish.type === 'junk') return false;
        
        return fishWeight > float.stability * 2;
    }
    
    // ============= КОНЕЦ СИСТЕМЫ ПРОВЕРКИ НЕСООТВЕТСТВИЯ =============
    
    // Получить бонус к скорости подмотки (на основе retrieveSpeed катушки)
    getReelSpeedMultiplier(fish = null, fishWeight = 0) {
        const reel = this.getCurrentReel();
        if (!reel) return 1.0;
        
        let multiplier = 0.8 + (reel.retrieveSpeed / 10) * 1.0; // 1.0-1.8
        
        // ШТРАФ: Если катушка не соответствует - скорость падает в 3 раза
        if (fish && fishWeight > 0 && this.isReelMismatched(fish, fishWeight)) {
            multiplier /= 3;
        }
        
        return multiplier;
    }
    
    // Получить бонус к времени остывания лески (на основе smoothness катушки)
    getCooldownBonus(fish = null, fishWeight = 0) {
        const reel = this.getCurrentReel();
        if (!reel) return 0;
        
        let bonus = (reel.smoothness / 10) * 0.35; // 0-0.35
        
        // ШТРАФ: Если катушка не соответствует - бонус падает вдвое
        if (fish && fishWeight > 0 && this.isReelMismatched(fish, fishWeight)) {
            bonus /= 2;
        }
        
        return bonus;
    }
    
    // Получить общий шанс на редкую рыбу (на основе accuracy удочки и penetration крючка)
    getRareFishBonus() {
        const rod = this.getCurrentRod();
        const hook = this.getCurrentHook();
        
        let bonus = 0;
        if (rod) bonus += (rod.accuracy / 8) * 0.1; // accuracy: 2-8 -> 0-0.1
        if (hook) bonus += (hook.penetration / 8) * 0.07; // penetration: 2-8 -> 0-0.07
        
        return bonus;
    }
    
    // Получить бонус к времени подсечки (на основе sensitivity поплавка)
    getBiteTimeBonus() {
        const float = this.getCurrentFloat();
        if (!float) return 0;
        
        // sensitivity: 2-10 -> 0-0.4
        return (float.sensitivity / 10) * 0.4;
    }
    
    // Получить бонус стабильности от поплавка (уменьшает натяжение от рывков)
    getStabilityBonus(fish = null, fishWeight = 0) {
        const float = this.getCurrentFloat();
        if (!float) return 0;
        
        // ШТРАФ: Если поплавок не соответствует - бонус стабильности = 0
        if (fish && fishWeight > 0 && this.isFloatMismatched(fish, fishWeight)) {
            return 0;
        }
        
        // stability: 3-10 -> 0-0.25 (уменьшение натяжения от рывков на 0-25%)
        return (float.stability / 10) * 0.25;
    }
    
    // Получить бонус удержания от крючка (уменьшает шанс срыва)
    getHoldBonus(fish = null, fishWeight = 0) {
        const hook = this.getCurrentHook();
        if (!hook) return 0;
        
        // ШТРАФ: Если крючок не соответствует - бонус удержания = 0
        if (fish && fishWeight > 0 && this.isHookMismatched(fish, fishWeight)) {
            return 0;
        }
        
        // holdBonus: 2-10 -> 0-0.20 (уменьшение силы рывков на 0-20%)
        return (hook.holdBonus / 10) * 0.20;
    }
    
    // Получить бонус от стойкости лески к истиранию (замедляет перегрев)
    getAbrasionBonus() {
        const line = this.getCurrentLine();
        if (!line) return 0;
        
        // abrasionResist: 2-6 -> 0-0.20 (замедление перегрева на 0-20%)
        return (line.abrasionResist / 6) * 0.20;
    }
    
    // Рассчитать сопротивление рыбы с учётом снаряжения
    calculateFishResistance(fish, weight) {
        // Базовое сопротивление из power рыбы (5-95 -> 0.05-0.95)
        let resistance = fish.power / 100;
        
        // Увеличение сопротивления от веса (тяжелее = сильнее)
        const avgWeight = (fish.weightMin + fish.weightMax) / 2;
        const weightFactor = weight / avgWeight;
        resistance *= (0.8 + weightFactor * 0.4);
        
        // Уменьшение сопротивления от силы снаряжения
        const pullPower = this.getTotalPullPower();
        resistance /= pullPower;
        
        // Ограничиваем диапазон
        return Math.max(0.1, Math.min(0.9, resistance));
    }
    
    // Рассчитать силу рывка рыбы
    calculateStrugglePower(fish, weight) {
        // Базовая сила из power рыбы
        let strugglePower = fish.power / 100;
        
        // Увеличение от веса (тяжелее = сильнее рывок)
        const avgWeight = (fish.weightMin + fish.weightMax) / 2;
        const weightFactor = weight / avgWeight;
        strugglePower *= (0.6 + weightFactor * 0.8);
        
        // Уменьшение от силы снаряжения
        const pullPower = this.getTotalPullPower();
        strugglePower /= (pullPower * 0.9);
        
        // ШТРАФ: Если удочка не соответствует - рывки в 2 раза сильнее
        if (this.isRodMismatched(fish, weight)) {
            strugglePower *= 2;
        }
        
        // Маленькие рыбки: 0.15-0.3, средние: 0.3-0.5, большие: 0.5-0.8
        return Math.max(0.15, Math.min(0.8, strugglePower));
    }
    
    // Рассчитать частоту рывков (сек между рывками)
    calculateStruggleFrequency(fish, weight) {
        // Базовая частота зависит от power рыбы
        let frequency = 2.0 + (fish.power / 100) * 2;
        
        // Более тяжёлая рыба дёргается чаще (меньше интервал)
        const avgWeight = (fish.weightMin + fish.weightMax) / 2;
        const weightFactor = weight / avgWeight;
        frequency *= (1.3 - weightFactor * 0.5);
        
        // Более сильное снаряжение даёт больше времени между рывками
        const pullPower = this.getTotalPullPower();
        frequency *= (0.7 + pullPower * 0.5);
        
        // Ограничиваем диапазон: маленькие рыбки 2-4 сек, большие 0.6-2 сек
        return Math.max(0.6, Math.min(4.0, frequency));
    }
    
    // Получить минимальный tier снаряжения
    getMinGearTier() {
        return Math.min(
            this.equipment.rod,
            this.equipment.line,
            this.equipment.float,
            this.equipment.hook,
            this.equipment.reel
        );
    }
    
    // Проверить доступность рыбы по уровню снаряжения, зоне и наживке
    isFishAvailable(fishId) {
        const fish = this.fishDB?.find(f => f.id === fishId);
        if (!fish) return false;
        
        // Проверяем зону
        if (fish.zoneId !== this.currentZone) return false;
        
        // Проверяем минимальный tier снаряжения
        const minTier = this.getMinGearTier();
        if (fish.minGearTier > minTier) return false;
        
        // Проверяем наживку (используем ID вместо названий)
        const currentBait = this.getCurrentBait();
        if (currentBait) {
            const baitId = currentBait.id;
            const acceptsBait = fish.preferredBaitId === baitId || fish.altBaitId === baitId;
            if (!acceptsBait) return false;
        }
        
        return true;
    }
    
    // Получить доступных рыб в текущей зоне с учетом наживки
    getAvailableFish() {
        if (!this.fishDB) return [];
        
        const minTier = this.getMinGearTier();
        const currentBait = this.getCurrentBait();
        const baitId = currentBait ? currentBait.id : null;
        
        return this.fishDB.filter(fish => {
            // Проверяем зону
            if (fish.zoneId !== this.currentZone) return false;
            
            // Проверяем минимальный tier снаряжения
            if (fish.minGearTier > minTier) return false;
            
            // Проверяем наживку - рыба клюет только на preferredBait или altBait (используем ID)
            if (baitId) {
                const acceptsBait = fish.preferredBaitId === baitId || fish.altBaitId === baitId;
                if (!acceptsBait) return false;
            }
            
            return true;
        });
    }
    
    // ============= СИСТЕМА ПРОЧНОСТИ =============
    
    // Получить текущую прочность снасти (в процентах)
    getDurabilityPercent(type) {
        const gear = this[`getCurrent${type.charAt(0).toUpperCase() + type.slice(1)}`]?.();
        if (!gear || !gear.durability || gear.durability <= 0) return 100;
        
        const current = this.durability[type];
        if (current === null || current === undefined) return 100; // Новая снасть
        
        const percent = (current / gear.durability) * 100;
        return Math.max(0, Math.min(100, percent)); // Ограничиваем от 0 до 100
    }
    
    // Получить состояние снасти (отлично/хорошо/изношено/критично)
    getDurabilityState(type) {
        const percent = this.getDurabilityPercent(type);
        
        // Проверяем на NaN или некорректные значения
        if (isNaN(percent) || percent === null || percent === undefined) {
            return { state: 'unknown', color: '#95a5a6', text: L('durability_unknown', 'Неизвестно') };
        }
        
        if (percent >= 75) return { state: 'excellent', color: '#2ecc71', text: L('durability_excellent', 'Отлично') };
        if (percent >= 50) return { state: 'good', color: '#f39c12', text: L('durability_good', 'Хорошо') };
        if (percent >= 25) return { state: 'worn', color: '#e67e22', text: L('durability_worn', 'Изношено') };
        return { state: 'critical', color: '#e74c3c', text: L('durability_critical', 'Критично') };
    }
    
    // Рассчитать износ снасти после рыбалки
    calculateWear(type, fish, fishWeight, wasSuccessful) {
        const gear = this[`getCurrent${type.charAt(0).toUpperCase() + type.slice(1)}`]?.();
        if (!gear) return 0;
        
        // Для мусора - минимальный износ
        if (fish.type === 'junk') {
            return 0.1; // Минимальный износ для предметов
        }
        
        // Базовый износ зависит от типа снасти
        let baseWear = 0;
        
        // Проверяем наличие свойства power у рыбы
        const fishPower = fish.power || 0;
        
        switch(type) {
            case 'rod':
                // Удочка: износ от мощности рыбы
                baseWear = 0.5 + (fishPower / 100) * 2.0; // 0.5-2.5
                break;
            case 'line':
                // Леска: износ от веса и рывков
                baseWear = 0.8 + (fishWeight / 10) * 1.5; // 0.8-3.0+
                break;
            case 'reel':
                // Катушка: износ от времени подмотки
                baseWear = 0.4 + (fishPower / 100) * 1.2; // 0.4-1.6
                break;
            case 'hook':
                // Крючок: износ от веса рыбы и подсечки
                baseWear = 0.6 + (fishWeight / 5) * 1.0; // 0.6-4.0+
                break;
            case 'float':
                // Поплавок: минимальный износ
                baseWear = 0.3 + (fishWeight / 20) * 0.5; // 0.3-1.0
                break;
        }
        
        // Модификаторы износа
        
        // 1. Успешная ловля = меньше износа
        if (wasSuccessful) {
            baseWear *= 0.7; // -30% износа при успехе
        } else {
            baseWear *= 1.5; // +50% износа при обрыве/срыве
        }
        
        // 2. Несоответствие снасти и рыбы = больше износа
        const mismatchMultiplier = this.calculateMismatchWear(type, fish, fishWeight);
        baseWear *= mismatchMultiplier;
        
        // 3. Качество снасти (высокий tier = медленнее изнашивается)
        const tierBonus = 1 - (gear.tier / 18) * 0.3; // T1: 1.0x, T18: 0.7x
        baseWear *= tierBonus;
        
        return Math.max(0.1, baseWear); // Минимум 0.1 износа
    }
    
    // Рассчитать множитель износа от несоответствия снасти и рыбы
    calculateMismatchWear(type, fish, fishWeight) {
        const gear = this[`getCurrent${type.charAt(0).toUpperCase() + type.slice(1)}`]?.();
        if (!gear) return 1.0;
        
        // Для мусора - нет дополнительного износа от несоответствия
        if (fish.type === 'junk') {
            return 1.0;
        }
        
        let mismatch = 1.0;
        
        // Проверяем наличие свойства power у рыбы
        const fishPower = fish.power || 0;
        
        switch(type) {
            case 'rod':
                // Удочка: если power рыбы > powerCap
                if (fishPower > gear.powerCap) {
                    const overload = (fishPower - gear.powerCap) / gear.powerCap;
                    mismatch = 1.0 + overload * 2.0; // До +200% износа
                }
                break;
            case 'line':
                // Леска: если вес рыбы > testKg
                if (fishWeight > gear.testKg) {
                    const overload = (fishWeight - gear.testKg) / gear.testKg;
                    mismatch = 1.0 + overload * 2.5; // До +250% износа
                }
                break;
            case 'hook':
                // Крючок: если рыба слишком мощная
                const requiredHold = fishPower / 10;
                if (requiredHold > gear.holdBonus) {
                    const overload = (requiredHold - gear.holdBonus) / gear.holdBonus;
                    mismatch = 1.0 + overload * 1.8; // До +180% износа
                }
                break;
            case 'reel':
                // Катушка: если вес рыбы > dragKg * 2
                if (fishWeight > gear.dragKg * 2) {
                    const overload = (fishWeight - gear.dragKg * 2) / (gear.dragKg * 2);
                    mismatch = 1.0 + overload * 1.5; // До +150% износа
                }
                break;
            case 'float':
                // Поплавок: если вес рыбы > stability * 2
                if (fishWeight > gear.stability * 2) {
                    const overload = (fishWeight - gear.stability * 2) / (gear.stability * 2);
                    mismatch = 1.0 + overload * 1.2; // До +120% износа
                }
                break;
        }
        
        return Math.min(4.0, mismatch); // Максимум 4x износа
    }
    
    // Применить износ к снасти
    applyWear(type, amount) {
        const gear = this[`getCurrent${type.charAt(0).toUpperCase() + type.slice(1)}`]?.();
        if (!gear) return;
        
        // Инициализация если нужно
        if (this.durability[type] === null) {
            this.durability[type] = gear.durability;
        }
        
        this.durability[type] = Math.max(0, this.durability[type] - amount);
        
        // Проверка на поломку
        if (this.durability[type] <= 0) {
            return { broken: true, type, name: gear.name };
        }
        
        return { broken: false, remaining: this.durability[type] };
    }
    
    // Применить износ ко всем снастям после рыбалки
    applyFishingWear(fish, fishWeight, wasSuccessful) {
        const results = {
            rod: null,
            line: null,
            reel: null,
            hook: null,
            float: null,
            broken: []
        };
        
        ['rod', 'line', 'reel', 'hook', 'float'].forEach(type => {
            const wear = this.calculateWear(type, fish, fishWeight, wasSuccessful);
            const result = this.applyWear(type, wear);
            results[type] = { wear, ...result };
            
            if (result.broken) {
                results.broken.push({ type, name: result.name });
            }
        });
        
        return results;
    }
    
    // Починить снасть (восстановить до максимума)
    repairGear(type) {
        const gear = this[`getCurrent${type.charAt(0).toUpperCase() + type.slice(1)}`]?.();
        if (!gear) return false;
        
        this.durability[type] = gear.durability;
        return true;
    }
    
    // Починить все снасти
    repairAllGear() {
        ['rod', 'line', 'reel', 'hook', 'float'].forEach(type => {
            this.repairGear(type);
        });
    }
    
    // Получить стоимость ремонта снасти
    getRepairCost(type) {
        const gear = this[`getCurrent${type.charAt(0).toUpperCase() + type.slice(1)}`]?.();
        if (!gear) return 0;
        
        const percent = this.getDurabilityPercent(type);
        const missingPercent = (100 - percent) / 100;
        
        // Стоимость ремонта = 36% от цены снасти * процент износа (увеличено на 20%)
        return Math.ceil(gear.price * 0.36 * missingPercent);
    }
    
    // Получить общую стоимость ремонта всех снастей
    getTotalRepairCost() {
        return ['rod', 'line', 'reel', 'hook', 'float'].reduce((sum, type) => {
            return sum + this.getRepairCost(type);
        }, 0);
    }
    
    // ============= КОНЕЦ СИСТЕМЫ ПРОЧНОСТИ =============
    
    // ============= СИСТЕМА НАЖИВОК =============
    
    // Использовать наживку (при подсечке)
    useBait() {
        if (this.baitCount > 0) {
            this.baitCount--;
            return true;
        }
        return false;
    }
    
    // Добавить наживки
    addBait(amount) {
        this.baitCount += amount;
    }
    
    // Проверить наличие наживок
    hasBait() {
        return this.baitCount > 0;
    }
    
    // ============= КОНЕЦ СИСТЕМЫ НАЖИВОК =============
    
    // Улучшить снаряжение (заглушка для будущей системы покупок)
    upgradeEquipment(type, tier) {
        if (this.equipment[type] !== undefined) {
            this.equipment[type] = tier;
            // Сбрасываем прочность при смене снасти
            if (this.durability[type] !== undefined) {
                this.durability[type] = null; // Будет установлена при первом использовании
            }
            return true;
        }
        return false;
    }
    
    // Получить информацию о текущем снаряжении
    getEquipmentInfo() {
        return {
            rod: this.getCurrentRod(),
            line: this.getCurrentLine(),
            float: this.getCurrentFloat(),
            hook: this.getCurrentHook(),
            reel: this.getCurrentReel(),
            bait: this.getCurrentBait(),
            zone: this.getCurrentZone()
        };
    }
    
    // Добавить опыт
    addXP(amount) {
        this.currentXP += amount;
        
        // Проверяем повышение уровня
        while (this.currentXP >= this.xpToNextLevel) {
            this.levelUp();
        }
    }
    
    // Повышение уровня
    levelUp() {
        this.currentXP -= this.xpToNextLevel;
        this.level++;
        
        // Ограничиваем максимальный уровень до 100
        if (this.level > 100) {
            this.level = 100;
            this.currentXP = 0;
            return;
        }
        
        // Рассчитываем опыт для следующего уровня (прогрессивный рост)
        // До 20 уровня медленнее (1.2), после 20 - еще медленнее (1.09)
        const coefficient = this.level < 20 ? 1.2 : 1.09;
        this.xpToNextLevel = Math.floor(100 * Math.pow(coefficient, this.level - 1));
        
        // Можно добавить награды за уровень здесь
        
        // Обновляем счет в лидерборде Яндекс
        this.updateLeaderboard();
        
        // Проверяем, нужно ли показать предложение оценить игру
        if (window.ratingPromptSystem) {
            window.ratingPromptSystem.checkAndShow(this.level);
        }
    }
    
    // Обновить счет в лидерборде
    async updateLeaderboard() {
        if (window.ratingSystem) {
            await window.ratingSystem.updateLeaderboardScore('level', this.level);
        }
    }
    
    // Получить информацию об опыте
    getXPInfo() {
        return {
            level: this.level,
            currentXP: this.currentXP,
            xpToNextLevel: this.xpToNextLevel,
            progress: this.currentXP / this.xpToNextLevel
        };
    }
    
    // Сохранение/загрузка (для будущей интеграции с localStorage)
    save() {
        return {
            equipment: { ...this.equipment },
            durability: { ...this.durability },
            baitCount: this.baitCount,
            level: this.level,
            currentXP: this.currentXP,
            xpToNextLevel: this.xpToNextLevel,
            currentZone: this.currentZone
        };
    }
    
    load(data) {
        if (data && data.equipment) {
            this.equipment = { ...data.equipment };
        }
        if (data && data.durability) {
            this.durability = { ...data.durability };
        }
        if (data && data.baitCount !== undefined) {
            this.baitCount = data.baitCount;
        }
        if (data && data.level !== undefined) {
            this.level = data.level;
            this.currentXP = data.currentXP || 0;
            this.xpToNextLevel = data.xpToNextLevel || 100;
        }
        if (data && data.currentZone !== undefined) {
            this.currentZone = data.currentZone;
        }
    }
}
