// Система инвентаря снастей
// Управляет купленными снастями игрока

class GearInventory {
    constructor() {
        // Инвентарь снастей (купленные предметы)
        this.inventory = {
            rods: [],      // Удочки
            lines: [],     // Лески
            floats: [],    // Поплавки
            hooks: [],     // Крючки
            reels: [],     // Катушки
            baits: []      // Наживки
        };
        
        // Текущее установленное снаряжение (tier или id)
        this.equipped = {
            rod: 1,
            line: 1,
            float: 1,
            hook: 1,
            reel: 1,
            bait: 1
        };
        
        this.loadFromStorage();
        this.initializeStarterGear();
    }
    
    // Инициализация стартового снаряжения
    initializeStarterGear() {
        // Добавляем стартовые снасти T1 если инвентарь пуст
        if (this.inventory.rods.length === 0) {
            this.addGear('rod', 1);
            this.addGear('line', 1);
            this.addGear('float', 1);
            this.addGear('hook', 1);
            this.addGear('reel', 1);
            this.addBait(1, 20); // 20 стартовых наживок (выдаются только один раз при первом запуске)
        }
    }
    
    // Добавить снасть в инвентарь
    addGear(type, tier) {
        const typeMap = {
            rod: 'rods',
            line: 'lines',
            float: 'floats',
            hook: 'hooks',
            reel: 'reels'
        };
        
        const inventoryKey = typeMap[type];
        if (!inventoryKey) return false;
        
        // Проверяем, есть ли уже эта снасть
        if (this.hasGear(type, tier)) {
            return false;
        }
        
        // Получаем данные снасти из базы
        const gearData = this.getGearData(type, tier);
        if (!gearData) return false;
        
        // Добавляем в инвентарь с полной прочностью
        this.inventory[inventoryKey].push({
            tier: tier,
            durability: gearData.durability,
            maxDurability: gearData.durability
        });
        
        this.saveToStorage();
        return true;
    }
    
    // Добавить наживку
    addBait(baitId, count) {
        const existingBait = this.inventory.baits.find(b => b.id === baitId);
        
        if (existingBait) {
            existingBait.count += count;
        } else {
            this.inventory.baits.push({
                id: baitId,
                count: count
            });
        }
        
        this.saveToStorage();
        return true;
    }
    
    // Добавить крючок (обёртка для addGear)
    addHook(tier, count = 1) {
        return this.addGear('hook', tier);
    }
    
    // Добавить поплавок (обёртка для addGear)
    addFloat(tier, count = 1) {
        return this.addGear('float', tier);
    }
    
    // Добавить леску (обёртка для addGear)
    addLine(tier, count = 1) {
        return this.addGear('line', tier);
    }
    
    // Добавить удочку (обёртка для addGear)
    addRod(tier, count = 1) {
        return this.addGear('rod', tier);
    }
    
    // Добавить катушку (обёртка для addGear)
    addReel(tier, count = 1) {
        return this.addGear('reel', tier);
    }
    
    // Проверить наличие снасти
    hasGear(type, tier) {
        const typeMap = {
            rod: 'rods',
            line: 'lines',
            float: 'floats',
            hook: 'hooks',
            reel: 'reels'
        };
        
        const inventoryKey = typeMap[type];
        if (!inventoryKey) return false;
        
        return this.inventory[inventoryKey].some(item => item.tier === tier);
    }
    
    // Получить все снасти определенного типа
    getGearsByType(type) {
        const typeMap = {
            rod: 'rods',
            line: 'lines',
            float: 'floats',
            hook: 'hooks',
            reel: 'reels'
        };
        
        const inventoryKey = typeMap[type];
        if (!inventoryKey) return [];
        
        // Возвращаем с полными данными из базы, фильтруем сломанные снасти
        return this.inventory[inventoryKey]
            .filter(item => item.durability > 0) // Фильтруем сломанные снасти
            .map(item => {
                const gearData = this.getGearData(type, item.tier);
                return {
                    ...gearData,
                    durability: item.durability,
                    maxDurability: item.maxDurability,
                    isEquipped: this.equipped[type] === item.tier && this.equipped[type] !== null
                };
            }).sort((a, b) => a.tier - b.tier);
    }
    
    // Получить все наживки
    getBaits() {
        return this.inventory.baits
            .filter(item => item.count > 0) // Фильтруем наживки с нулевым количеством
            .map(item => {
                const baitData = this.getBaitData(item.id);
                return {
                    ...baitData,
                    count: item.count,
                    quantity: item.count, // Для совместимости с UI
                    isEquipped: this.equipped.bait === item.id
                };
            }).sort((a, b) => a.id - b.id);
    }
    
    // Установить снасть
    equipGear(type, tier) {
        if (!this.hasGear(type, tier)) return false;
        
        this.equipped[type] = tier;
        this.saveToStorage();
        return true;
    }
    
    // Снять снасть (установить в null)
    unequipGear(type) {
        this.equipped[type] = null;
        this.saveToStorage();
        return true;
    }
    
    // Удалить сломанную снасть из инвентаря
    removeGear(type, tier) {
        const typeMap = {
            rod: 'rods',
            line: 'lines',
            float: 'floats',
            hook: 'hooks',
            reel: 'reels'
        };
        
        const inventoryKey = typeMap[type];
        if (!inventoryKey) return false;
        
        const index = this.inventory[inventoryKey].findIndex(item => item.tier === tier);
        if (index !== -1) {
            this.inventory[inventoryKey].splice(index, 1);
            
            // Если эта снасть была установлена, снимаем её
            if (this.equipped[type] === tier) {
                this.equipped[type] = null;
            }
            
            this.saveToStorage();
            return true;
        }
        
        return false;
    }
    
    // Установить наживку
    equipBait(baitId) {
        const bait = this.inventory.baits.find(b => b.id === baitId);
        if (!bait || bait.count <= 0) return false;
        
        this.equipped.bait = baitId;
        this.saveToStorage();
        return true;
    }
    
    // Получить установленную снасть
    getEquippedGear(type) {
        const tier = this.equipped[type];
        
        // Если снасть не установлена (null или undefined)
        if (!tier) return null;
        
        const gearData = this.getGearData(type, tier);
        
        if (!gearData) return null;
        
        // Находим в инвентаре для получения текущей прочности
        const typeMap = {
            rod: 'rods',
            line: 'lines',
            float: 'floats',
            hook: 'hooks',
            reel: 'reels'
        };
        
        const inventoryKey = typeMap[type];
        const inventoryItem = this.inventory[inventoryKey]?.find(item => item.tier === tier);
        
        return {
            ...gearData,
            durability: inventoryItem?.durability || gearData.durability,
            maxDurability: inventoryItem?.maxDurability || gearData.durability
        };
    }
    
    // Получить установленную наживку
    getEquippedBait() {
        const baitId = this.equipped.bait;
        const baitData = this.getBaitData(baitId);
        
        if (!baitData) return null;
        
        const inventoryBait = this.inventory.baits.find(b => b.id === baitId);
        
        return {
            ...baitData,
            count: inventoryBait?.count || 0
        };
    }
    
    // Получить данные снасти из базы
    getGearData(type, tier) {
        const databases = {
            rod: typeof RODS_DATABASE !== 'undefined' ? RODS_DATABASE : [],
            line: typeof LINES_DATABASE !== 'undefined' ? LINES_DATABASE : [],
            float: typeof FLOATS_DATABASE !== 'undefined' ? FLOATS_DATABASE : [],
            hook: typeof HOOKS_DATABASE !== 'undefined' ? HOOKS_DATABASE : [],
            reel: typeof REELS_DATABASE !== 'undefined' ? REELS_DATABASE : []
        };
        
        const db = databases[type];
        return db?.find(item => item.tier === tier) || null;
    }
    
    // Получить данные наживки из базы
    getBaitData(baitId) {
        if (typeof BAITS_DATABASE === 'undefined') return null;
        return BAITS_DATABASE.find(bait => bait.id === baitId) || null;
    }
    
    // Использовать наживку
    useBait() {
        const baitId = this.equipped.bait;
        const bait = this.inventory.baits.find(b => b.id === baitId);
        
        if (!bait || bait.count <= 0) return false;
        
        bait.count--;
        
        // Если наживка закончилась, удаляем её из инвентаря и снимаем с экипировки
        if (bait.count <= 0) {
            const index = this.inventory.baits.findIndex(b => b.id === baitId);
            if (index !== -1) {
                this.inventory.baits.splice(index, 1);
            }
            this.equipped.bait = null; // Снимаем с экипировки
        }
        
        this.saveToStorage();
        return true;
    }
    
    // Обновить прочность снасти
    updateDurability(type, durability) {
        const tier = this.equipped[type];
        
        const typeMap = {
            rod: 'rods',
            line: 'lines',
            float: 'floats',
            hook: 'hooks',
            reel: 'reels'
        };
        
        const inventoryKey = typeMap[type];
        const item = this.inventory[inventoryKey]?.find(item => item.tier === tier);
        
        if (item) {
            item.durability = Math.max(0, durability);
            this.saveToStorage();
        }
    }
    
    // Починить снасть (восстановить прочность)
    repairGear(type, tier) {
        const typeMap = {
            rod: 'rods',
            line: 'lines',
            float: 'floats',
            hook: 'hooks',
            reel: 'reels'
        };
        
        const inventoryKey = typeMap[type];
        const item = this.inventory[inventoryKey]?.find(item => item.tier === tier);
        
        if (item) {
            item.durability = item.maxDurability;
            this.saveToStorage();
            return true;
        }
        
        return false;
    }
    
    // Сохранение в облако через главную систему (без debounce для критичных данных)
    saveToStorage() {
        // Сохранение теперь происходит через game.saveGameData()
        // Для инвентаря используем немедленное сохранение, так как прочность критична
        if (window.game) {
            window.game.saveGameData();
        }
    }
    
    // Загрузка из облака через главную систему
    loadFromStorage() {
        // Загрузка теперь происходит через game.loadGameData()
        // Оставляем метод для совместимости, но ничего не делаем
    }
    
    // Методы-обёртки для получения снастей по типам
    getRods() {
        return this.getGearsByType('rod');
    }
    
    getLines() {
        return this.getGearsByType('line');
    }
    
    getFloats() {
        return this.getGearsByType('float');
    }
    
    getHooks() {
        return this.getGearsByType('hook');
    }
    
    getReels() {
        return this.getGearsByType('reel');
    }
    
    // Очистить инвентарь (для отладки)
    clear() {
        this.inventory = {
            rods: [],
            lines: [],
            floats: [],
            hooks: [],
            reels: [],
            baits: []
        };
        this.equipped = {
            rod: 1,
            line: 1,
            float: 1,
            hook: 1,
            reel: 1,
            bait: 1
        };
        this.saveToStorage();
    }
}
