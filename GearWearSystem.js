// -*- coding: utf-8 -*-
// Система износа снастей
// Рассчитывает прогрессивный износ в зависимости от перегрузки

class GearWearSystem {
    // Базовый износ для каждого типа снасти (за одну пойманную рыбу)
    // Увеличен для более реалистичного износа и экономического баланса
    static BASE_WEAR = {
        rod: 5.4,      // Удочка (было 3.6, +50%)
        line: 6.0,     // Леска (было 4.0, +50%) - изнашивается быстрее всего
        hook: 5.4,     // Крючок (было 3.6, +50%)
        float: 3.0,    // Поплавок (было 2.0, +50%)
        reel: 4.5      // Катушка (было 3.0, +50%)
    };
    
    /**
     * Рассчитывает множитель износа на основе перегрузки
     * @param {number} fishWeight - Вес пойманной рыбы (кг)
     * @param {number} gearMaxWeight - Максимальный вес снасти (кг)
     * @returns {number} Множитель износа (1.0 = нормальный, до 100.0 = мгновенная поломка)
     */
    static calculateWearMultiplier(fishWeight, gearMaxWeight) {
        if (fishWeight <= gearMaxWeight) {
            return 1.0; // Нормальный износ
        }
        
        // Перегрузка в процентах
        const overloadPercent = ((fishWeight - gearMaxWeight) / gearMaxWeight) * 100;
        
        // Прогрессивная шкала множителей с более жесткими штрафами
        if (overloadPercent <= 10) {
            return 6.0;  // Лёгкая перегрузка: +500% износа
        } else if (overloadPercent <= 25) {
            return 12.0;  // Средняя перегрузка: +1100% износа
        } else if (overloadPercent <= 50) {
            return 25.0;  // Сильная перегрузка: +2400% износа
        } else if (overloadPercent <= 100) {
            return 50.0; // Критическая перегрузка: +4900% износа
        } else if (overloadPercent <= 200) {
            return 100.0; // Экстремальная перегрузка: +9900% износа
        } else if (overloadPercent <= 500) {
            return 200.0; // Катастрофическая перегрузка: +19900% износа (снасть сломается за 1-2 рыбы)
        } else {
            return 400.0; // МГНОВЕННАЯ ПОЛОМКА: перегрузка >500% (снасть сломается сразу)
        }
    }
    
    /**
     * Рассчитывает процент перегрузки
     * @param {number} fishWeight - Вес рыбы
     * @param {number} gearMaxWeight - Максимальный вес снасти
     * @returns {number} Процент перегрузки (0 = нет перегрузки)
     */
    static calculateOverloadPercent(fishWeight, gearMaxWeight) {
        if (fishWeight <= gearMaxWeight) {
            return 0;
        }
        return ((fishWeight - gearMaxWeight) / gearMaxWeight) * 100;
    }
    
    /**
     * Рассчитывает износ для конкретной снасти
     * @param {string} gearType - Тип снасти ('rod', 'line', 'hook', 'float', 'reel')
     * @param {number} fishWeight - Вес рыбы
     * @param {number} gearMaxWeight - Максимальный вес снасти
     * @returns {number} Значение износа
     */
    static calculateGearWear(gearType, fishWeight, gearMaxWeight) {
        const baseWear = this.BASE_WEAR[gearType] || 1.0;
        const multiplier = this.calculateWearMultiplier(fishWeight, gearMaxWeight);
        // Добавляем случайную вариативность ±10%
        const randomFactor = 0.9 + Math.random() * 0.2;
        return baseWear * multiplier * randomFactor;
    }
    
    /**
     * Применяет износ ко всем снастям после поимки рыбы
     * @param {number} fishWeight - Вес пойманной рыбы
     * @param {Object} equippedGear - Объект с экипированными снастями
     * @returns {Object} Объект с значениями износа для каждой снасти
     */
    static applyWearToGear(fishWeight, equippedGear) {
        const wear = {};
        
        // Удочка
        if (equippedGear.rod && equippedGear.rod.maxWeight !== undefined) {
            wear.rod = this.calculateGearWear('rod', fishWeight, equippedGear.rod.maxWeight);
        }
        
        // Леска
        if (equippedGear.line && equippedGear.line.testKg !== undefined) {
            wear.line = this.calculateGearWear('line', fishWeight, equippedGear.line.testKg);
        }
        
        // Крючок
        if (equippedGear.hook && equippedGear.hook.maxWeight !== undefined) {
            wear.hook = this.calculateGearWear('hook', fishWeight, equippedGear.hook.maxWeight);
        }
        
        // Поплавок (не зависит от веса рыбы)
        if (equippedGear.float) {
            wear.float = this.BASE_WEAR.float;
        }
        
        // Катушка (не зависит от веса рыбы)
        if (equippedGear.reel) {
            wear.reel = this.BASE_WEAR.reel;
        }
        
        return wear;
    }
    
    /**
     * Получает предупреждение об уровне износа
     * @param {number} fishWeight - Вес рыбы
     * @param {number} gearMaxWeight - Максимальный вес снасти
     * @returns {Object} Объект с уровнем и сообщением
     */
    static getWearWarning(fishWeight, gearMaxWeight) {
        const multiplier = this.calculateWearMultiplier(fishWeight, gearMaxWeight);
        const overload = this.calculateOverloadPercent(fishWeight, gearMaxWeight);
        
        if (multiplier === 1.0) {
            return { 
                level: 'safe', 
                color: '#2ecc71',
                message: 'Нормальный износ',
                icon: '✅'
            };
        }
        if (multiplier === 6.0) {
            return { 
                level: 'warning', 
                color: '#f39c12',
                message: `Лёгкая перегрузка (+${overload.toFixed(0)}%, износ x6)`,
                icon: '⚠️'
            };
        }
        if (multiplier === 12.0) {
            return { 
                level: 'danger', 
                color: '#e67e22',
                message: `Средняя перегрузка (+${overload.toFixed(0)}%, износ x12)`,
                icon: '⚠️'
            };
        }
        if (multiplier === 25.0) {
            return { 
                level: 'critical', 
                color: '#e74c3c',
                message: `Сильная перегрузка (+${overload.toFixed(0)}%, износ x25)`,
                icon: '❌'
            };
        }
        if (multiplier === 50.0) {
            return { 
                level: 'extreme', 
                color: '#c0392b',
                message: `Критическая перегрузка (+${overload.toFixed(0)}%, износ x50)`,
                icon: '💀'
            };
        }
        if (multiplier === 100.0) {
            return { 
                level: 'catastrophic', 
                color: '#8b0000',
                message: `ЭКСТРЕМАЛЬНАЯ ПЕРЕГРУЗКА (+${overload.toFixed(0)}%, износ x100)`,
                icon: '💀💀'
            };
        }
        if (multiplier === 200.0) {
            return { 
                level: 'breaking', 
                color: '#660000',
                message: `КАТАСТРОФА! (+${overload.toFixed(0)}%, износ x200 - снасть сломается!)`,
                icon: '💀💀💀'
            };
        }
        return { 
            level: 'instant_break', 
            color: '#330000',
            message: `МГНОВЕННАЯ ПОЛОМКА! (+${overload.toFixed(0)}%, износ x400)`,
            icon: '☠️☠️☠️'
        };
    }
    
    /**
     * Получает детальную информацию об износе всех снастей
     * @param {number} fishWeight - Вес рыбы
     * @param {Object} equippedGear - Экипированные снасти
     * @returns {Object} Детальная информация об износе
     */
    static getWearDetails(fishWeight, equippedGear) {
        const details = {
            fishWeight: fishWeight,
            totalWear: 0,
            gearWear: {},
            warnings: {},
            worstCase: null
        };
        
        let maxMultiplier = 1.0;
        let worstGear = null;
        
        // Удочка
        if (equippedGear.rod && equippedGear.rod.maxWeight !== undefined) {
            const wear = this.calculateGearWear('rod', fishWeight, equippedGear.rod.maxWeight);
            const warning = this.getWearWarning(fishWeight, equippedGear.rod.maxWeight);
            const multiplier = this.calculateWearMultiplier(fishWeight, equippedGear.rod.maxWeight);
            
            details.gearWear.rod = wear;
            details.warnings.rod = warning;
            details.totalWear += wear;
            
            if (multiplier > maxMultiplier) {
                maxMultiplier = multiplier;
                worstGear = { type: 'rod', name: 'Удочка', wear, warning };
            }
        }
        
        // Леска
        if (equippedGear.line && equippedGear.line.testKg !== undefined) {
            const wear = this.calculateGearWear('line', fishWeight, equippedGear.line.testKg);
            const warning = this.getWearWarning(fishWeight, equippedGear.line.testKg);
            const multiplier = this.calculateWearMultiplier(fishWeight, equippedGear.line.testKg);
            
            details.gearWear.line = wear;
            details.warnings.line = warning;
            details.totalWear += wear;
            
            if (multiplier > maxMultiplier) {
                maxMultiplier = multiplier;
                worstGear = { type: 'line', name: 'Леска', wear, warning };
            }
        }
        
        // Крючок
        if (equippedGear.hook && equippedGear.hook.maxWeight !== undefined) {
            const wear = this.calculateGearWear('hook', fishWeight, equippedGear.hook.maxWeight);
            const warning = this.getWearWarning(fishWeight, equippedGear.hook.maxWeight);
            const multiplier = this.calculateWearMultiplier(fishWeight, equippedGear.hook.maxWeight);
            
            details.gearWear.hook = wear;
            details.warnings.hook = warning;
            details.totalWear += wear;
            
            if (multiplier > maxMultiplier) {
                maxMultiplier = multiplier;
                worstGear = { type: 'hook', name: 'Крючок', wear, warning };
            }
        }
        
        // Поплавок и катушка (базовый износ)
        if (equippedGear.float) {
            details.gearWear.float = this.BASE_WEAR.float;
            details.totalWear += this.BASE_WEAR.float;
        }
        
        if (equippedGear.reel) {
            details.gearWear.reel = this.BASE_WEAR.reel;
            details.totalWear += this.BASE_WEAR.reel;
        }
        
        details.worstCase = worstGear;
        
        return details;
    }
    
    /**
     * Рассчитывает стоимость ремонта снасти
     * @param {number} originalPrice - Изначальная цена снасти
     * @param {number} currentDurability - Текущая прочность
     * @param {number} maxDurability - Максимальная прочность
     * @returns {number} Стоимость ремонта
     */
    static calculateRepairCost(originalPrice, currentDurability, maxDurability) {
        // Процент износа (0 = новая, 1 = полностью изношена)
        const wearPercent = 1 - (currentDurability / maxDurability);
        
        // Базовая стоимость ремонта - 90% от цены новой снасти
        // Умножаем на процент износа, чтобы 38/40 было дешевле чем 30/40
        // Но не дороже новой снасти
        const repairCost = Math.min(
            Math.ceil(originalPrice * 0.9 * wearPercent),
            originalPrice - 1  // Всегда дешевле хотя бы на 1 монету
        );
        
        return repairCost;
    }
    
    /**
     * Рекомендует минимальный уровень снастей для рыбы
     * @param {number} fishWeight - Вес рыбы
     * @returns {number} Рекомендуемый tier снастей
     */
    static recommendGearTier(fishWeight) {
        // Примерная таблица соответствия веса и tier
        const tierWeights = [
            { tier: 1, maxWeight: 0.82 },
            { tier: 2, maxWeight: 3.5 },
            { tier: 3, maxWeight: 5.0 },
            { tier: 4, maxWeight: 7.0 },
            { tier: 5, maxWeight: 9.0 },
            { tier: 6, maxWeight: 12.0 },
            { tier: 7, maxWeight: 15.0 },
            { tier: 8, maxWeight: 18.0 },
            { tier: 9, maxWeight: 22.0 },
            { tier: 10, maxWeight: 28.0 },
            { tier: 11, maxWeight: 35.0 },
            { tier: 12, maxWeight: 45.0 },
            { tier: 13, maxWeight: 55.0 },
            { tier: 14, maxWeight: 70.0 },
            { tier: 15, maxWeight: 90.0 },
            { tier: 16, maxWeight: 120.0 },
            { tier: 17, maxWeight: 160.0 },
            { tier: 18, maxWeight: 220.0 }
        ];
        
        for (let i = 0; i < tierWeights.length; i++) {
            if (fishWeight <= tierWeights[i].maxWeight) {
                return tierWeights[i].tier;
            }
        }
        
        return 18; // Максимальный tier
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GearWearSystem;
}
