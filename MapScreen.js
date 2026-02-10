// Экран глобальной карты с локациями для рыбалки
class MapScreen {
    constructor(canvas, playerData, onNavigate, onLocationSelect, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.playerData = playerData; // { coins, xp, level, unlockedZones: [] }
        this.onNavigate = onNavigate; // Callback для навигации назад
        this.onLocationSelect = onLocationSelect; // Callback при выборе локации
        this.audioManager = audioManager;
        
        // Загружаем данные зон
        this.zones = ZONES_DATABASE || [];
        
        // Кнопка закрыть (zak) в правом верхнем углу
        this.closeButton = { x: 0, y: 20, width: 78, height: 78 }; // x будет установлен в render (увеличено на 30%)
        
        // Фоновое изображение
        this.backgroundImage = null;
        this.loadBackgroundImage();
        
        // Локации на карте (позиции будут рассчитаны)
        this.locationButtons = [];
        
        // Выбранная локация для детального просмотра
        this.selectedZone = null;
        
        // Модальное окно деталей
        this.detailModal = null;
        
        // Состояние наведения
        this.hoveredLocation = null;
        this.hoveredBackButton = false;
        
        // Скролл карты
        this.scrollY = 0;
        this.maxScrollY = 0;
        
        this.initializeLocations();
    }
    
    loadBackgroundImage() {
        // Загружаем фон карты из облака
        if (window.assetManager) {
            window.assetManager.loadLocationBackground('karta.jpg').then(img => {
                this.backgroundImage = img;
            }).catch(err => {
                console.warn('⚠️ Не удалось загрузить фон карты, используем градиент');
                this.backgroundImage = null;
            });
        }
    }
    
    initializeLocations() {
        // Размещаем локации на карте с небольшим хаосом в рядах со смещением
        const cols = 6; // 6 локаций в ряд
        const spriteSize = 100; // Размер спрайта (уменьшен для 6 в ряд)
        const baseSpacingX = 154; // Расстояние между спрайтами по горизонтали (увеличено на 10%: 140 * 1.1 = 154)
        const baseSpacingY = 160; // Расстояние между рядами
        const buttonHeight = 170; // Высота с учетом текста под спрайтом
        
        // Вычисляем общую ширину сетки
        const gridWidth = cols * spriteSize + (cols - 1) * (baseSpacingX - spriteSize);
        // Центрируем сетку на экране и сдвигаем левее
        const startX = (this.canvas.width - gridWidth) / 2 - 50; // Сдвиг влево на 50px
        
        // Загружаем спрайты локаций из облака через AssetManager
        if (!this.locationSprites) {
            this.locationSprites = [];
            for (let i = 1; i <= 20; i++) {
                // Создаем placeholder
                this.locationSprites.push(null);
                
                // Загружаем из облака асинхронно
                if (window.assetManager) {
                    window.assetManager.loadLocationIcon(i).then(img => {
                        this.locationSprites[i - 1] = img;
                    }).catch(err => {
                        console.warn(`⚠️ Не удалось загрузить иконку локации ${i}:`, err);
                    });
                }
            }
        }
        
        this.locationButtons = this.zones.map((zone, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            // Добавляем небольшое случайное смещение для "живости"
            // Используем zone.id как seed для постоянного смещения
            const randomX = ((zone.id * 37) % 30) - 15; // -15 до +15
            const randomY = ((zone.id * 73) % 20) - 10; // -10 до +10
            
            // Смещение четных рядов для шахматного порядка
            const rowOffset = row % 2 === 1 ? baseSpacingX / 2 : 0;
            
            return {
                zone: zone,
                x: startX + col * baseSpacingX + rowOffset + randomX,
                y: 60 + row * baseSpacingY + randomY, // Поднято на 20px (было 80, стало 60)
                width: spriteSize,
                height: buttonHeight,
                spriteSize: spriteSize,
                isUnlocked: this.isZoneUnlocked(zone),
                canUnlock: this.canUnlockZone(zone)
            };
        });
        
        // Вычисляем максимальный скролл
        const lastButton = this.locationButtons[this.locationButtons.length - 1];
        this.maxScrollY = Math.max(0, lastButton.y + lastButton.height + 100 - this.canvas.height);
    }
    
    isZoneUnlocked(zone) {
        // Первая зона всегда открыта
        if (zone.id === 1) return true;
        
        // Проверяем, есть ли зона в списке разблокированных
        return this.playerData.unlockedZones && this.playerData.unlockedZones.includes(zone.id);
    }
    
    canUnlockZone(zone) {
        // Первая зона всегда открыта
        if (zone.id === 1) return true;
        
        // Уже разблокирована
        if (this.isZoneUnlocked(zone)) return true;
        
        // Проверяем требования для покупки доступа (полная стоимость)
        const hasLevel = this.playerData.level >= this.getLevelRequirement(zone);
        const actualCost = this.getZoneCost(zone, false); // false = покупка доступа
        const hasCoins = this.playerData.coins >= actualCost;
        
        return hasLevel && hasCoins;
    }
    
    // Проверить можно ли переместиться в уже открытую зону
    canTravelToZone(zone) {
        // Если зона не открыта, нельзя переместиться
        if (!this.isZoneUnlocked(zone)) return false;
        
        // Проверяем достаточно ли денег для перемещения (80% от стоимости)
        const travelCost = this.getZoneCost(zone, true); // true = перемещение
        return this.playerData.coins >= travelCost;
    }
    
    // Получить стоимость зоны с учетом скидки
    getZoneCost(zone, isTravel = false) {
        let cost = zone.unlockCost;
        
        // Если это перемещение в уже открытую зону - скидка 20%
        if (isTravel) {
            cost = Math.round(cost * 0.8); // 80% от первоначальной стоимости
        }
        
        // Проверяем есть ли бонус карты (скидка на путешествия)
        // premiumEffects находится в window.game.fishingGame
        if (window.game && window.game.fishingGame) {
            const premiumEffects = window.game.fishingGame.premiumEffects;
            
            if (premiumEffects && premiumEffects.hasTravelDiscount()) {
                const discount = premiumEffects.getTravelDiscount();
                cost = Math.round(cost * (1 - discount));
            }
        }
        
        return cost;
    }
    
    // Проверить есть ли скидка на путешествия
    hasTravelDiscount() {
        if (window.game && window.game.fishingGame) {
            const premiumEffects = window.game.fishingGame.premiumEffects;
            return premiumEffects && premiumEffects.hasTravelDiscount();
        }
        return false;
    }
    
    getLevelRequirement(zone) {
        // Используем minPlayerLevel из данных зоны
        return zone.minPlayerLevel || 1;
    }
    
    unlockZone(zone) {
        // Проверяем, является ли это текущей зоной
        const isCurrentZone = window.game && window.game.fishingGame && 
                              window.game.fishingGame.currentZone === zone.id;
        
        if (this.isZoneUnlocked(zone)) {
            // Зона уже разблокирована
            if (isCurrentZone) {
                // Текущая зона - бесплатный вход
                this.onLocationSelect(zone);
                return true;
            } else {
                // Другая разблокированная зона - платное перемещение (80% от стоимости)
                const travelCost = this.getZoneCost(zone, true); // true = перемещение
                
                // Проверяем достаточно ли денег
                if (this.playerData.coins < travelCost) {
                    console.log('Недостаточно денег для перемещения');
                    return false;
                }
                
                // Списываем деньги за перемещение
                this.playerData.coins -= travelCost;
                
                // Обновляем деньги в игре
                if (window.game && window.game.fishingGame) {
                    window.game.fishingGame.coins = this.playerData.coins;
                    // Сохраняем изменения
                    window.game.saveGameDataDebounced();
                }
                
                this.onLocationSelect(zone);
                return true;
            }
        }
        
        // Зона еще не разблокирована
        if (!this.canUnlockZone(zone)) {
            return false;
        }
        
        // Списываем деньги с учетом скидки (первая покупка доступа - полная стоимость)
        const actualCost = this.getZoneCost(zone, false); // false = покупка доступа
        this.playerData.coins -= actualCost;
        
        // Обновляем деньги в игре
        if (window.game && window.game.fishingGame) {
            window.game.fishingGame.coins = this.playerData.coins;
            // Сохраняем изменения
            window.game.saveGameDataDebounced();
        }
        
        // Добавляем в разблокированные
        if (!this.playerData.unlockedZones) {
            this.playerData.unlockedZones = [];
        }
        this.playerData.unlockedZones.push(zone.id);
        
        // Синхронизируем с fishingGame
        if (window.game && window.game.fishingGame) {
            window.game.fishingGame.unlockedZones = this.playerData.unlockedZones;
        }
        
        // Обновляем статусы кнопок
        this.initializeLocations();
        
        // Переходим на новую локацию после разблокировки
        this.onLocationSelect(zone);
        
        return true;
    }
    
    handleClick(x, y) {
        // Воспроизводим звук клика
        if (this.audioManager) this.audioManager.playClickSound();
        
        // Корректируем координаты с учетом скролла
        const adjustedY = y + this.scrollY;
        
        // Кнопка закрыть (zak) в правом верхнем углу
        const closeBtn = this.closeButton;
        closeBtn.x = this.canvas.width - closeBtn.width - 20;
        if (x >= closeBtn.x && x <= closeBtn.x + closeBtn.width &&
            y >= closeBtn.y && y <= closeBtn.y + closeBtn.height) {
            this.onNavigate('home');
            return true;
        }
        
        // Клик по модальному окну
        if (this.detailModal) {
            const result = this.detailModal.handleClick(x, y);
            if (result === 'close') {
                this.detailModal = null;
                return true;
            } else if (result === 'unlock') {
                const success = this.unlockZone(this.selectedZone);
                if (success) {
                    this.detailModal = null;
                    // unlockZone уже вызывает onLocationSelect, не нужно дублировать
                }
                return true;
            } else if (result === 'travel') {
                // Используем unlockZone для перемещения - он проверит и спишет монеты
                const success = this.unlockZone(this.selectedZone);
                if (success) {
                    this.detailModal = null;
                }
                return true;
            }
            return true;
        }
        
        // Клик по локации
        for (const btn of this.locationButtons) {
            if (x >= btn.x && x <= btn.x + btn.width &&
                adjustedY >= btn.y && adjustedY <= btn.y + btn.height) {
                this.selectedZone = btn.zone;
                this.detailModal = new LocationDetailModal(
                    this.canvas,
                    btn.zone,
                    this.playerData,
                    this.isZoneUnlocked(btn.zone),
                    this.canUnlockZone(btn.zone),
                    this.getLevelRequirement(btn.zone),
                    this, // Передаем ссылку на MapScreen для получения стоимости со скидкой
                    this.audioManager // Передаем audioManager
                );
                return true;
            }
        }
        
        return false;
    }
    
    handleMouseDown(x, y) {
        // Если открыто модальное окно, передаем событие в него
        if (this.detailModal) {
            return this.detailModal.handleMouseDown(x, y);
        }
        return this.handleClick(x, y);
    }
    
    handleMouseMove(x, y) {
        // Если открыто модальное окно, обрабатываем только его события
        if (this.detailModal) {
            this.detailModal.handleMouseMove(x, y);
            return;
        }
        
        // Корректируем координаты с учетом скролла
        const adjustedY = y + this.scrollY;
        
        // Проверка наведения на кнопку закрыть
        const closeBtn = this.closeButton;
        closeBtn.x = this.canvas.width - closeBtn.width - 20;
        this.hoveredCloseButton = (
            x >= closeBtn.x && x <= closeBtn.x + closeBtn.width &&
            y >= closeBtn.y && y <= closeBtn.y + closeBtn.height
        );
        
        // Проверка наведения на локации
        this.hoveredLocation = null;
        for (const btn of this.locationButtons) {
            if (x >= btn.x && x <= btn.x + btn.width &&
                adjustedY >= btn.y && adjustedY <= btn.y + btn.height) {
                this.hoveredLocation = btn;
                break;
            }
        }
    }
    
    handleMouseUp(x, y) {
        // Если открыто модальное окно, передаем событие в него
        if (this.detailModal) {
            const result = this.detailModal.handleMouseUp(x, y);
            if (result === 'close') {
                this.detailModal = null;
                return true;
            } else if (result === 'unlock') {
                const success = this.unlockZone(this.selectedZone);
                if (success) {
                    this.detailModal = null;
                }
                return true;
            } else if (result === 'travel') {
                // Используем unlockZone для перемещения - он проверит и спишет монеты
                const success = this.unlockZone(this.selectedZone);
                if (success) {
                    this.detailModal = null;
                }
                return true;
            }
            return true;
        }
        return false;
    }
    
    handleWheel(deltaY) {
        // Если открыто модальное окно, передаем скролл в него
        if (this.detailModal) {
            this.detailModal.handleWheel(deltaY);
        } else {
            // Скролл карты
            this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY + deltaY * 0.5));
        }
    }
    
    update(dt) {
        // Обновление анимаций
    }
    
    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Фон карты - градиент
        if (this.backgroundImage && this.backgroundImage.complete && this.backgroundImage.naturalWidth > 0) {
            ctx.drawImage(this.backgroundImage, 0, 0, w, h);
        } else {
            // Градиентный фон
            const gradient = ctx.createLinearGradient(0, 0, 0, h);
            gradient.addColorStop(0, '#1a2332');
            gradient.addColorStop(0.5, '#2d3e50');
            gradient.addColorStop(1, '#1a2332');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
        }
        
        // Сохраняем состояние для скролла
        ctx.save();
        ctx.translate(0, -this.scrollY);
        
        // Рисуем локации
        this.locationButtons.forEach(btn => {
            this.renderLocationButton(btn);
        });
        
        ctx.restore();
        
        // Кнопка закрыть (zak) в правом верхнем углу (не скроллится)
        this.renderCloseButton();
        
        // Модальное окно поверх всего
        if (this.detailModal) {
            this.detailModal.render();
        }
    }
    
    renderLocationButton(btn) {
        const ctx = this.ctx;
        const isHovered = this.hoveredLocation === btn;
        const isUnlocked = btn.isUnlocked;
        const canUnlock = btn.canUnlock;
        
        ctx.save();
        
        // Центр спрайта
        const centerX = btn.x + btn.spriteSize / 2;
        const spriteY = btn.y;
        
        // Тень для спрайта
        if (isHovered) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 8;
        }
        
        // Рисуем спрайт локации
        const spriteIndex = btn.zone.id - 1;
        const sprite = this.locationSprites && this.locationSprites[spriteIndex];
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            // Если заблокирована - затемняем
            if (!isUnlocked) {
                ctx.globalAlpha = 0.5;
            }
            
            // Рисуем спрайт
            ctx.drawImage(
                sprite,
                btn.x,
                spriteY,
                btn.spriteSize,
                btn.spriteSize
            );
            
            ctx.globalAlpha = 1.0;
            
            // Если заблокирована - добавляем иконку замка поверх
            if (!isUnlocked) {
                ctx.font = fontManager.getFont(40, 'normal');
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillText('🔒', centerX, spriteY + btn.spriteSize / 2);
            }
        } else {
            // Запасной вариант - цветной круг с эмодзи
            let bgColor;
            if (isUnlocked) {
                bgColor = '#27ae60';
            } else if (canUnlock) {
                bgColor = '#f39c12';
            } else {
                bgColor = '#7f8c8d';
            }
            
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.arc(centerX, spriteY + btn.spriteSize / 2, btn.spriteSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.font = fontManager.getFont(50, 'normal');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText(btn.zone.emoji, centerX, spriteY + btn.spriteSize / 2);
        }
        
        ctx.shadowColor = 'transparent';
        
        // Название локации под спрайтом (на 10px ближе)
        const textY = spriteY + btn.spriteSize - 6; // Приближено на 10px (было +4, стало -6)
        ctx.font = fontManager.getFont(18, 'bold'); // Увеличено на 20% (было 15, стало 18)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Черная обводка 2px
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // Тень для текста
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillStyle = '#fff';
        
        // Разбиваем длинное название на строки
        const name = window.localizationSystem ? window.localizationSystem.getZoneName(btn.zone.id, btn.zone.name) : btn.zone.name;
        const maxWidth = btn.spriteSize + 30;
        const words = name.split(' ');
        let line = '';
        let lines = [];
        
        words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                lines.push(line);
                line = word + ' ';
            } else {
                line = testLine;
            }
        });
        lines.push(line);
        
        const lineHeight = 18; // Увеличено на 20% (было 15, стало 18)
        lines.forEach((line, i) => {
            const y = textY + i * lineHeight;
            // Рисуем обводку
            ctx.strokeText(line.trim(), centerX, y);
            // Рисуем текст
            ctx.fillText(line.trim(), centerX, y);
        });
        
        // Требуемый уровень под названием
        const levelY = textY + lines.length * lineHeight + 2;
        ctx.font = fontManager.getFont(16);
        
        if (isUnlocked) {
            // Проверяем, находимся ли мы сейчас в этой локации
            // Приводим оба значения к числу для корректного сравнения
            const currentZoneId = window.game?.fishingGame?.currentZone;
            const buttonZoneId = btn.zone.id;
            const isCurrentZone = window.game && window.game.fishingGame && 
                                  Number(currentZoneId) === Number(buttonZoneId);
            
            if (isCurrentZone) {
                // Зеленая галочка - текущая локация
                ctx.fillStyle = '#2ecc71';
                const hereText = L('map_here', '✓ Здесь');
                ctx.strokeText(hereText, centerX, levelY);
                ctx.fillText(hereText, centerX, levelY);
            }
            // Убираем текст "Открыта" для других локаций - не нужно показывать
        } else {
            const reqLevel = this.getLevelRequirement(btn.zone);
            if (canUnlock) {
                // Можно разблокировать - показываем только уровень
                ctx.fillStyle = '#f1c40f';
                const levelText = `${L('map_level', 'Уровень')} ${reqLevel}`;
                ctx.strokeText(levelText, centerX, levelY);
                ctx.fillText(levelText, centerX, levelY);
            } else {
                // Заблокировано - показываем замок и уровень
                ctx.fillStyle = '#e74c3c';
                const text = `${L('map_locked_level', '🔒 Уровень')} ${reqLevel}`;
                ctx.strokeText(text, centerX, levelY);
                ctx.fillText(text, centerX, levelY);
            }
        }
        
        ctx.restore();
    }
    
    renderCloseButton() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const btn = this.closeButton;
        btn.x = w - btn.width - 20;
        const isHovered = this.hoveredCloseButton;
        
        ctx.save();
        
        // Загружаем изображение кнопки zak
        if (!this.closeButtonImage) {
            this.closeButtonImage = new Image();
            this.closeButtonImage.src = 'zak.png';
        }
        
        // Рисуем кнопку
        if (this.closeButtonImage.complete) {
            if (isHovered) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 10;
            }
            ctx.drawImage(this.closeButtonImage, btn.x, btn.y, btn.width, btn.height);
        } else {
            // Запасной вариант - красный крестик
            if (isHovered) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 10;
            }
            
            ctx.fillStyle = isHovered ? '#e74c3c' : '#c0392b';
            ctx.beginPath();
            ctx.arc(btn.x + btn.width / 2, btn.y + btn.height / 2, btn.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            const centerX = btn.x + btn.width / 2;
            const centerY = btn.y + btn.height / 2;
            const size = btn.width / 4;
            ctx.beginPath();
            ctx.moveTo(centerX - size, centerY - size);
            ctx.lineTo(centerX + size, centerY + size);
            ctx.moveTo(centerX + size, centerY - size);
            ctx.lineTo(centerX - size, centerY + size);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
        return `rgb(${r}, ${g}, ${b})`;
    }
}
