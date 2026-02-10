// -*- coding: utf-8 -*-
// Система невидимых зон с динамическими популяциями рыб
class FishingZoneSystem {
    constructor(canvasWidth, canvasHeight, currentLocationTier = 1) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.currentLocationTier = currentLocationTier; // Уровень текущей локации
        
        // Размер сетки зон (невидимые области)
        this.gridCols = 5; // 5 колонок
        this.gridRows = 3; // 3 ряда
        this.zoneWidth = canvasWidth / this.gridCols;
        this.zoneHeight = canvasHeight / this.gridRows;
        
        // Зоны с популяциями рыб
        this.zones = [];
        
        // Таймер миграции рыб
        this.migrationTimer = 0;
        this.migrationInterval = 30; // Каждые 30 секунд возможна миграция
        
        this.initializeZones();
    }
    
    // Инициализация зон
    initializeZones() {
        this.zones = [];
        
        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridCols; col++) {
                const zone = {
                    id: row * this.gridCols + col,
                    row: row,
                    col: col,
                    x: col * this.zoneWidth,
                    y: row * this.zoneHeight,
                    width: this.zoneWidth,
                    height: this.zoneHeight,
                    fish: this.generateFishPopulation(row, col),
                    catchCount: 0, // Сколько рыб поймано в этой зоне
                    depleted: false // Истощена ли зона
                };
                
                this.zones.push(zone);
            }
        }
    }
    
    // Генерация популяции рыб для зоны
    generateFishPopulation(row, col) {
        if (typeof FISH_DATABASE === 'undefined' || FISH_DATABASE.length === 0) {
            return [];
        }
        
        // Фильтруем рыб по ID локации (zoneId)
        const suitableFish = FISH_DATABASE.filter(fish => {
            // Рыба доступна только если её zoneId совпадает с текущей локацией
            return fish.zoneId === this.currentLocationTier;
        });
        
        if (suitableFish.length === 0) {
            // Если нет подходящих рыб, берем первые 3
            console.warn(`Нет рыб для локации ${this.currentLocationTier}, используем fallback`);
            return this.generateFallbackPopulation(row);
        }
        
        const population = [];
        
        // Определяем модификатор для нижних зон (возле удочки)
        // row = 2 это самый нижний ряд (возле удочки)
        const isBottomRow = row === this.gridRows - 1;
        
        // Количество видов рыб в зоне
        let speciesCount = Math.floor(Math.random() * 3) + 2; // 2-4 для баланса
        
        // В нижнем ряду меньше видов
        if (isBottomRow) {
            speciesCount = Math.max(1, speciesCount - 1); // 1-3 вида
        }
        
        // Фильтруем рыб: в нижнем ряду только Common и Uncommon (мелочь)
        let availableFish = suitableFish;
        if (isBottomRow) {
            availableFish = suitableFish.filter(fish => 
                fish.rarity === 'Common' || fish.rarity === 'Uncommon'
            );
            
            // Если нет мелочи, берем самых легких рыб
            if (availableFish.length === 0) {
                availableFish = [...suitableFish].sort((a, b) => {
                    const avgWeightA = (a.weightMin + a.weightMax) / 2;
                    const avgWeightB = (b.weightMin + b.weightMax) / 2;
                    return avgWeightA - avgWeightB;
                }).slice(0, Math.ceil(suitableFish.length / 2));
            }
        }
        
        // Выбираем случайные виды из подходящих
        const shuffled = [...availableFish].sort(() => Math.random() - 0.5);
        const selectedSpecies = shuffled.slice(0, Math.min(speciesCount, availableFish.length));
        
        // Для каждого вида определяем количество особей
        selectedSpecies.forEach(species => {
            // Базовое количество рыб (2-5)
            let count = Math.floor(Math.random() * 4) + 2;
            
            // В нижнем ряду еще меньше рыб (1-3)
            if (isBottomRow) {
                count = Math.floor(count * 0.5) + 1; // Уменьшаем на 50% и минимум 1
            }
            
            for (let i = 0; i < count; i++) {
                population.push({
                    species: species,
                    weight: this.generateFishWeight(species, isBottomRow),
                    caught: false
                });
            }
        });
        
        return population;
    }
    
    // Fallback популяция если нет подходящих рыб
    generateFallbackPopulation(row) {
        const population = [];
        const firstThreeFish = FISH_DATABASE.slice(0, 3);
        const isBottomRow = row === this.gridRows - 1;
        
        firstThreeFish.forEach(species => {
            let count = Math.floor(Math.random() * 5) + 3;
            
            // В нижнем ряду меньше рыб
            if (isBottomRow) {
                count = Math.floor(count * 0.5) + 1;
            }
            
            for (let i = 0; i < count; i++) {
                population.push({
                    species: species,
                    weight: this.generateFishWeight(species, isBottomRow),
                    caught: false
                });
            }
        });
        
        return population;
    }
    
    // Генерация веса рыбы
    generateFishWeight(species, isBottomRow = false) {
        const min = species.minWeight || species.weightMin || 0.1;
        const max = species.maxWeight || species.weightMax || 1.0;
        
        // В нижнем ряду рыбы мельче (ближе к минимальному весу)
        if (isBottomRow) {
            const range = max - min;
            // Генерируем вес в нижних 40% диапазона
            return min + Math.random() * (range * 0.4);
        }
        
        return min + Math.random() * (max - min);
    }
    
    // Получить зону по координатам заброса
    getZoneByPosition(x, y) {
        const col = Math.floor(x / this.zoneWidth);
        const row = Math.floor(y / this.zoneHeight);
        
        const zoneId = row * this.gridCols + col;
        return this.zones.find(z => z.id === zoneId);
    }
    
    // Получить доступных рыб в зоне
    getAvailableFish(zone, currentBaitId = null) {
        if (!zone) return [];
        
        // Фильтруем непойманных рыб
        let availableFish = zone.fish.filter(f => !f.caught);
        
        // Если указана наживка, фильтруем по ней
        if (currentBaitId !== null) {
            availableFish = availableFish.filter(f => {
                const species = f.species;
                return species.preferredBaitId === currentBaitId || species.altBaitId === currentBaitId;
            });
        }
        
        return availableFish;
    }
    
    // Поймать рыбу в зоне
    catchFish(zone, fishSpecies) {
        if (!zone) return null;
        
        // Находим первую непойманную рыбу этого вида
        const fish = zone.fish.find(f => !f.caught && f.species.id === fishSpecies.id);
        
        if (fish) {
            fish.caught = true;
            zone.catchCount++;
            
            // Проверяем истощение зоны (поймано > 70% рыб)
            const totalFish = zone.fish.length;
            const caughtFish = zone.fish.filter(f => f.caught).length;
            
            if (caughtFish / totalFish > 0.7) {
                zone.depleted = true;
            }
            
            return fish;
        }
        
        return null;
    }
    
    // Обновление системы (миграция рыб)
    update(dt) {
        this.migrationTimer += dt;
        
        if (this.migrationTimer >= this.migrationInterval) {
            this.migrationTimer = 0;
            this.migrateFish();
        }
    }
    
    // Миграция рыб между зонами
    migrateFish() {
        this.zones.forEach(zone => {
            const availableFish = this.getAvailableFish(zone);
            
            if (availableFish.length === 0) return;
            
            // Шанс миграции 30%
            if (Math.random() > 0.3) return;
            
            // Мигрирует максимум 20% рыб
            const migrateCount = Math.ceil(availableFish.length * 0.2);
            
            for (let i = 0; i < migrateCount; i++) {
                // Выбираем случайную рыбу
                const fishIndex = Math.floor(Math.random() * availableFish.length);
                const fish = availableFish[fishIndex];
                
                // Выбираем соседнюю зону
                const neighborZone = this.getRandomNeighborZone(zone);
                
                if (neighborZone) {
                    // Удаляем рыбу из текущей зоны
                    const index = zone.fish.indexOf(fish);
                    if (index > -1) {
                        zone.fish.splice(index, 1);
                    }
                    
                    // Добавляем в соседнюю зону
                    neighborZone.fish.push(fish);
                    
                    // Удаляем из availableFish чтобы не мигрировать дважды
                    availableFish.splice(fishIndex, 1);
                }
            }
            
            // Обновляем статус истощения
            this.updateZoneStatus(zone);
        });
    }
    
    // Получить случайную соседнюю зону
    getRandomNeighborZone(zone) {
        const neighbors = [];
        
        // Соседи по горизонтали
        if (zone.col > 0) {
            neighbors.push(this.zones.find(z => z.row === zone.row && z.col === zone.col - 1));
        }
        if (zone.col < this.gridCols - 1) {
            neighbors.push(this.zones.find(z => z.row === zone.row && z.col === zone.col + 1));
        }
        
        // Соседи по вертикали
        if (zone.row > 0) {
            neighbors.push(this.zones.find(z => z.row === zone.row - 1 && z.col === zone.col));
        }
        if (zone.row < this.gridRows - 1) {
            neighbors.push(this.zones.find(z => z.row === zone.row + 1 && z.col === zone.col));
        }
        
        if (neighbors.length === 0) return null;
        
        return neighbors[Math.floor(Math.random() * neighbors.length)];
    }
    
    // Обновить статус зоны
    updateZoneStatus(zone) {
        const totalFish = zone.fish.length;
        const caughtFish = zone.fish.filter(f => f.caught).length;
        
        if (totalFish === 0) {
            zone.depleted = true;
        } else if (caughtFish / totalFish > 0.7) {
            zone.depleted = true;
        } else {
            zone.depleted = false;
        }
    }
    
    // Сброс зон (при перезаходе в локацию)
    reset(newLocationTier = null) {
        if (newLocationTier !== null) {
            this.currentLocationTier = newLocationTier;
        }
        this.initializeZones();
        this.migrationTimer = 0;
    }
    
    // Установить уровень локации
    setLocationTier(tier) {
        this.currentLocationTier = tier;
        this.reset();
    }
    
    // Получить информацию о зоне для эхолота
    getZoneInfo(x, y) {
        const zone = this.getZoneByPosition(x, y);
        if (!zone) return null;
        
        const availableFish = this.getAvailableFish(zone);
        
        if (availableFish.length === 0) {
            return {
                fishCount: 0,
                weightRange: { min: 0, max: 0 },
                species: [],
                depleted: zone.depleted
            };
        }
        
        // Собираем уникальные виды
        const speciesMap = new Map();
        availableFish.forEach(f => {
            if (!speciesMap.has(f.species.id)) {
                speciesMap.set(f.species.id, f.species);
            }
        });
        
        // Диапазон весов
        let minWeight = Infinity;
        let maxWeight = -Infinity;
        
        availableFish.forEach(f => {
            if (f.weight < minWeight) minWeight = f.weight;
            if (f.weight > maxWeight) maxWeight = f.weight;
        });
        
        return {
            fishCount: availableFish.length,
            weightRange: { min: minWeight, max: maxWeight },
            species: Array.from(speciesMap.values()),
            depleted: zone.depleted
        };
    }
    
    // Отладочная отрисовка зон (опционально)
    debugRender(ctx) {
        ctx.save();
        
        this.zones.forEach(zone => {
            const availableFish = this.getAvailableFish(zone);
            
            // Цвет зоны в зависимости от количества рыб
            let alpha = 0.1;
            if (zone.depleted) {
                ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            } else if (availableFish.length > 10) {
                ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
            } else if (availableFish.length > 5) {
                ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            } else {
                ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`;
            }
            
            ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
            
            // Обводка
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
            
            // Информация о зоне
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${availableFish.length}🐟`, zone.x + zone.width / 2, zone.y + zone.height / 2);
        });
        
        ctx.restore();
    }
}
