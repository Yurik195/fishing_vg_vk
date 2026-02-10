// Модальное окно с деталями локации
class LocationDetailModal {
    constructor(canvas, zone, playerData, isUnlocked, canUnlock, levelRequirement, mapScreen = null, audioManager = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.zone = zone;
        this.playerData = playerData;
        this.isUnlocked = isUnlocked;
        this.canUnlock = canUnlock;
        this.levelRequirement = levelRequirement;
        this.mapScreen = mapScreen; // Ссылка на MapScreen для получения стоимости со скидкой
        this.audioManager = audioManager;
        
        // Размеры модального окна - увеличены
        this.width = Math.min(850, canvas.width - 80);
        this.height = Math.min(650, canvas.height - 80);
        this.x = (canvas.width - this.width) / 2;
        this.y = (canvas.height - this.height) / 2;
        
        // Кнопки
        this.closeButton = { x: this.x + this.width - 65, y: this.y + 10, width: 52, height: 52 }; // Увеличено на 30% (было 40x40, стало 52x52)
        this.actionButton = { 
            x: this.x + this.width / 2 - 150, 
            y: this.y + this.height - 70, 
            width: 300, 
            height: 55 
        };
        
        // Состояние наведения
        this.hoveredClose = false;
        this.hoveredAction = false;
        
        // Список рыб в локации
        this.fishList = this.getFishForZone();
        
        // Скролл списка рыб
        this.fishScrollY = 0;
        this.maxFishScrollY = 0;
        this.calculateMaxScroll();
        
        // Drag-scroll для списка рыб
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartScroll = 0;
    }
    
    getFishForZone() {
        // Получаем рыб для этой зоны
        if (typeof FISH_DATABASE === 'undefined') return [];
        return FISH_DATABASE.filter(fish => fish.zoneId === this.zone.id);
    }
    
    calculateMaxScroll() {
        const itemHeight = 50;
        const listHeight = 280;
        const totalHeight = this.fishList.length * itemHeight + 20; // +20 для отступа
        this.maxFishScrollY = Math.max(0, totalHeight - listHeight + 10); // +10 чтобы последний элемент был виден
    }
    
    handleClick(x, y) {
        // Воспроизводим звук клика
        if (this.audioManager) this.audioManager.playClickSound();
        
        // Кнопка закрытия
        if (x >= this.closeButton.x && x <= this.closeButton.x + this.closeButton.width &&
            y >= this.closeButton.y && y <= this.closeButton.y + this.closeButton.height) {
            return 'close';
        }
        
        // Проверяем, является ли это текущей зоной (используем playerData)
        const currentZoneId = this.playerData.currentZone || 1;
        const thisZoneId = this.zone.id;
        const isCurrentZone = Number(currentZoneId) === Number(thisZoneId);
        
        // Кнопка действия
        if (x >= this.actionButton.x && x <= this.actionButton.x + this.actionButton.width &&
            y >= this.actionButton.y && y <= this.actionButton.y + this.actionButton.height) {
            
            // Если это текущая локация - переход на рыбалку (независимо от статуса разблокировки)
            if (isCurrentZone) {
                return 'travel'; // Переход на рыбалку в текущей локации
            }
            
            if (this.isUnlocked) {
                return 'travel'; // Отправиться на рыбалку (с оплатой перемещения)
            } else {
                // Пересчитываем canUnlock в реальном времени
                const currentCanUnlock = this.mapScreen ? this.mapScreen.canUnlockZone(this.zone) : this.canUnlock;
                if (currentCanUnlock) {
                    return 'unlock'; // Купить доступ
                }
            }
        }
        
        return null;
    }
    
    handleMouseDown(x, y) {
        // Проверяем клик по кнопкам - они имеют приоритет
        if ((x >= this.closeButton.x && x <= this.closeButton.x + this.closeButton.width &&
             y >= this.closeButton.y && y <= this.closeButton.y + this.closeButton.height) ||
            (x >= this.actionButton.x && x <= this.actionButton.x + this.actionButton.width &&
             y >= this.actionButton.y && y <= this.actionButton.y + this.actionButton.height)) {
            // Это клик по кнопке - не начинаем драг
            return null;
        }
        
        // Проверяем клик в области списка рыб для начала драга
        const listX = this.x + this.width / 2 + 20;
        const listY = this.y + 240;
        const listWidth = this.width / 2 - 60;
        const listHeight = 280;
        
        if (x >= listX && x <= listX + listWidth &&
            y >= listY && y <= listY + listHeight) {
            // Начинаем драг только в области списка рыб
            this.isDragging = true;
            this.dragStartY = y;
            this.dragStartScroll = this.fishScrollY;
        }
        
        return null;
    }
    
    handleMouseMove(x, y) {
        // Drag-scroll списка рыб
        if (this.isDragging) {
            const deltaY = this.dragStartY - y;
            this.fishScrollY = this.dragStartScroll + deltaY;
            this.fishScrollY = Math.max(0, Math.min(this.maxFishScrollY, this.fishScrollY));
            return;
        }
        
        const prevHoveredAction = this.hoveredAction;
        
        this.hoveredClose = (
            x >= this.closeButton.x && x <= this.closeButton.x + this.closeButton.width &&
            y >= this.closeButton.y && y <= this.closeButton.y + this.closeButton.height
        );
        
        this.hoveredAction = (
            x >= this.actionButton.x && x <= this.actionButton.x + this.actionButton.width &&
            y >= this.actionButton.y && y <= this.actionButton.y + this.actionButton.height
        );
        
        // Меняем курсор
        if (this.hoveredClose || this.hoveredAction) {
            this.canvas.style.cursor = 'pointer';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }
    
    handleMouseUp(x, y) {
        // Если был драг - завершаем его
        if (this.isDragging) {
            this.isDragging = false;
            
            // Если движение было минимальным, это клик в области списка
            const dragDistance = Math.abs(this.dragStartY - y);
            if (dragDistance < 15) {
                // Это был клик, но в области списка - не обрабатываем
                return null;
            }
            return null;
        }
        
        // Если не было драга - обрабатываем как обычный клик по кнопкам
        return this.handleClick(x, y);
    }
    
    handleWheel(deltaY) {
        // Скролл списка рыб
        this.fishScrollY = Math.max(0, Math.min(this.maxFishScrollY, this.fishScrollY + deltaY * 0.5));
    }
    
    render() {
        const ctx = this.ctx;
        
        // Затемнение фона
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Тень
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        
        // Рисуем фон рамки используя rmk.png
        const rmkImage = assetManager.getImage('rmk.png');
        if (rmkImage) {
            // Используем изображение rmk.png как фон рамки
            ctx.drawImage(
                rmkImage,
                this.x, this.y,
                this.width, this.height
            );
        } else {
            // Fallback - градиентный фон если изображение не загружено
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            gradient.addColorStop(0, '#34495e');
            gradient.addColorStop(1, '#2c3e50');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.width, this.height, 20);
            ctx.fill();
            
            // Обводка
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Кнопка закрытия
        this.renderCloseButton();
        
        // Заголовок
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const zoneName = window.localizationSystem ? window.localizationSystem.getZoneName(this.zone.id, this.zone.name) : this.zone.name;
        ctx.fillText(zoneName, this.x + this.width / 2, this.y + 25);
        
        // Разделитель под заголовком
        ctx.strokeStyle = 'rgba(243, 156, 18, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 40, this.y + 70);
        ctx.lineTo(this.x + this.width - 40, this.y + 70);
        ctx.stroke();
        
        // Левая колонка - иконка и описание
        this.renderLeftColumn();
        
        // Правая колонка - список рыб
        this.renderRightColumn();
        
        // Информация о требованиях
        this.renderRequirements();
        
        // Кнопка действия
        this.renderActionButton();
    }
    
    renderLeftColumn() {
        const ctx = this.ctx;
        const leftX = this.x + 40;
        const startY = this.y + 90;
        const columnWidth = this.width * 0.45;
        
        // Иконка локации - используем спрайт вместо эмодзи (увеличено на 20%)
        const spriteSize = 168; // Увеличено на 20% (было 140, стало 168)
        const spriteIndex = this.zone.id - 1;
        
        // Загружаем спрайт если еще не загружен
        if (!this.locationSprite) {
            // Загружаем из облака через AssetManager
            if (window.assetManager) {
                window.assetManager.loadLocationIcon(this.zone.id).then(img => {
                    this.locationSprite = img;
                }).catch(err => {
                    console.warn(`⚠️ Не удалось загрузить иконку локации ${this.zone.id}`);
                    this.locationSprite = null;
                });
            }
        }
        
        // Рисуем спрайт локации
        if (this.locationSprite && this.locationSprite.complete && this.locationSprite.naturalWidth > 0) {
            ctx.drawImage(
                this.locationSprite,
                leftX + (columnWidth - spriteSize) / 2,
                startY,
                spriteSize,
                spriteSize
            );
        } else {
            // Fallback - эмодзи если спрайт не загрузился
            ctx.font = '168px Arial'; // Увеличено на 20%
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 1.0;
            ctx.fillText(this.zone.emoji, leftX + columnWidth / 2, startY);
            ctx.globalAlpha = 1.0;
        }
        
        // Описание - УВЕЛИЧЕН ШРИФТ
        ctx.font = '18px Arial';
        ctx.fillStyle = '#ecf0f1';
        ctx.textAlign = 'center';
        
        // Разбиваем описание на строки
        const maxWidth = columnWidth - 20;
        const zoneDesc = window.localizationSystem ? window.localizationSystem.t(`zone_${this.zone.id}_desc`, this.zone.description) : this.zone.description;
        const words = zoneDesc.split(' ');
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
        
        const lineHeight = 26;
        const descStartY = startY + 188; // Увеличено с 160 чтобы учесть больший спрайт
        lines.forEach((line, i) => {
            ctx.fillText(line.trim(), leftX + columnWidth / 2, descStartY + i * lineHeight);
        });
        
        // Регион и биом - УВЕЛИЧЕН ШРИФТ
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#95a5a6';
        ctx.textAlign = 'left';
        const infoY = descStartY + lines.length * lineHeight + 35;
        const regionLabel = L('location_region', '🌍 Регион:');
        const biomeLabel = L('location_biome', '🏞️ Биом:');
        
        // Преобразуем значения в ключи локализации
        const regionKey = this.getRegionKey(this.zone.region);
        const biomeKey = this.getBiomeKey(this.zone.biome);
        
        const regionValue = window.localizationSystem ? window.localizationSystem.t(regionKey, this.zone.region) : this.zone.region;
        const biomeValue = window.localizationSystem ? window.localizationSystem.t(biomeKey, this.zone.biome) : this.zone.biome;
        ctx.fillText(regionLabel + ' ' + regionValue, leftX + 10, infoY);
        ctx.fillText(biomeLabel + ' ' + biomeValue, leftX + 10, infoY + 28);
    }
    
    // Преобразование региона в ключ локализации
    getRegionKey(region) {
        const regionMap = {
            'Европа': 'region_europe',
            'Сибирь': 'region_siberia',
            'Европа/Азия': 'region_europe_asia',
            'Тропики': 'region_tropics',
            'Средиземноморье': 'region_mediterranean',
            'Карибы': 'region_caribbean',
            'США/Юг': 'region_usa_south',
            'Южная Америка': 'region_south_america',
            'Африка': 'region_africa',
            'Япония': 'region_japan',
            'Север': 'region_north',
            'Океан': 'region_ocean'
        };
        return regionMap[region] || 'region_unknown';
    }
    
    // Преобразование биома в ключ локализации
    getBiomeKey(biome) {
        const biomeMap = {
            'Пруд': 'biome_pond',
            'Озеро': 'biome_lake',
            'Река': 'biome_river',
            'Горная река': 'biome_mountain_river',
            'Дельта': 'biome_delta',
            'Лагуна': 'biome_lagoon',
            'Риф': 'biome_reef',
            'Море': 'biome_sea',
            'Болото': 'biome_swamp',
            'Фьорд': 'biome_fjord',
            'Океан': 'biome_ocean',
            'Океан (глубь)': 'biome_ocean_deep',
            'Океан (трофеи)': 'biome_ocean_trophy'
        };
        return biomeMap[biome] || 'biome_unknown';
    }
    
    renderRightColumn() {
        const ctx = this.ctx;
        const rightX = this.x + this.width * 0.5 + 20;
        const startY = this.y + 90;
        const columnWidth = this.width * 0.45;
        
        // Заголовок списка рыб - УВЕЛИЧЕН ШРИФТ
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1.0;
        ctx.fillText(L('location_fish_list', '🐟 Рыбы в локации:'), rightX, startY);
        
        // Фон списка
        const listY = startY + 40;
        const listHeight = 280;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(rightX, listY, columnWidth, listHeight, 10);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Область отсечения для скролла
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(rightX, listY, columnWidth, listHeight, 10);
        ctx.clip();
        
        // Рисуем рыб
        if (this.fishList.length === 0) {
            ctx.fillStyle = '#95a5a6';
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.globalAlpha = 1.0;
            ctx.fillText(L('location_no_fish_data', 'Нет данных о рыбах'), rightX + columnWidth / 2, listY + listHeight / 2);
        } else {
            const itemHeight = 50;
            const itemStartY = listY + 10 - this.fishScrollY;
            
            this.fishList.forEach((fish, index) => {
                const y = itemStartY + index * itemHeight;
                
                // Пропускаем невидимые элементы
                if (y + itemHeight < listY || y > listY + listHeight) return;
                
                // Фон элемента при наведении
                if (index % 2 === 0) {
                    ctx.globalAlpha = 1.0;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                    ctx.fillRect(rightX + 5, y, columnWidth - 10, itemHeight - 5);
                }
                
                // Иконка рыбы - используем спрайт через AssetManager
                ctx.globalAlpha = 1.0;
                const iconSize = 32;
                assetManager.drawImageOrEmoji(
                    ctx, 'fish', fish.id,
                    rightX + 31, y + 24, iconSize,
                    fish.emoji || '🐟'
                );
                
                // Название рыбы - УВЕЛИЧЕН ШРИФТ
                ctx.globalAlpha = 1.0;
                ctx.font = 'bold 17px Arial';
                ctx.textAlign = 'left';
                ctx.fillStyle = this.getRarityColor(fish.rarity);
                const fishName = window.FishDB ? window.FishDB.getLocalizedName(fish) : fish.name;
                ctx.fillText(fishName, rightX + 60, y + 12);
                
                // Вес - УВЕЛИЧЕН ШРИФТ
                ctx.globalAlpha = 1.0;
                ctx.font = '14px Arial';
                ctx.fillStyle = '#bdc3c7';
                ctx.fillText(`⚖️ ${fish.weightMin}-${fish.weightMax} ${L('kg', 'кг')}`, rightX + 60, y + 32);
                
                // Редкость - УВЕЛИЧЕН ШРИФТ
                ctx.globalAlpha = 1.0;
                ctx.font = 'bold 12px Arial';
                ctx.fillStyle = this.getRarityColor(fish.rarity);
                ctx.textAlign = 'right';
                ctx.fillText(this.translateRarity(fish.rarity), rightX + columnWidth - 15, y + 22);
            });
        }
        
        ctx.restore();
        
        // Индикатор скролла
        if (this.maxFishScrollY > 0) {
            const scrollBarHeight = (listHeight / (this.fishList.length * 50)) * listHeight;
            const scrollBarY = listY + (this.fishScrollY / this.maxFishScrollY) * (listHeight - scrollBarHeight);
            
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = 'rgba(243, 156, 18, 0.8)';
            ctx.beginPath();
            ctx.roundRect(rightX + columnWidth - 8, scrollBarY, 5, scrollBarHeight, 3);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
    }
    
    renderCloseButton() {
        const ctx = this.ctx;
        const btn = this.closeButton;
        
        ctx.save();
        ctx.globalAlpha = 0.9; // 90% прозрачность
        
        // Используем спрайт zak.png
        const zakImage = assetManager.getImage('zak.png');
        if (zakImage) {
            const size = btn.width;
            const centerX = btn.x + btn.width / 2;
            const centerY = btn.y + btn.height / 2;
            ctx.drawImage(zakImage, centerX - size/2, centerY - size/2, size, size);
        } else {
            // Fallback - обычный крестик если спрайт не загружен
            ctx.fillStyle = this.hoveredClose ? '#e74c3c' : '#c0392b';
            ctx.beginPath();
            ctx.arc(btn.x + btn.width / 2, btn.y + btn.height / 2, btn.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('×', btn.x + btn.width / 2, btn.y + btn.height / 2);
        }
        
        ctx.restore();
    }
    
    renderRequirements() {
        const ctx = this.ctx;
        const startY = this.y + this.height - 150;
        
        ctx.save();
        ctx.globalAlpha = 1.0;
        
        // Проверяем, является ли это текущей зоной (используем playerData)
        const currentZoneId = this.playerData.currentZone || 1;
        const thisZoneId = this.zone.id;
        const isCurrentZone = Number(currentZoneId) === Number(thisZoneId);
        
        // Панель требований с градиентом
        const gradient = ctx.createLinearGradient(this.x + 40, startY, this.x + 40, startY + 70);
        if (isCurrentZone) {
            // Зеленый градиент для текущей локации
            gradient.addColorStop(0, 'rgba(46, 204, 113, 0.3)');
            gradient.addColorStop(1, 'rgba(39, 174, 96, 0.3)');
        } else {
            gradient.addColorStop(0, 'rgba(41, 128, 185, 0.3)');
            gradient.addColorStop(1, 'rgba(44, 62, 80, 0.3)');
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(this.x + 40, startY, this.width - 80, 70, 12);
        ctx.fill();
        
        ctx.strokeStyle = isCurrentZone ? 'rgba(46, 204, 113, 0.5)' : 'rgba(52, 152, 219, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Если это текущая локация - показываем "Я здесь"
        if (isCurrentZone) {
            ctx.fillStyle = '#2ecc71';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L('location_current', '📍 Я здесь'), this.x + this.width / 2, startY + 35);
            ctx.restore();
            return;
        }
        
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const leftCol = this.x + 60;
        const rightCol = this.x + this.width / 2 + 20;
        
        // Получаем стоимость с учетом скидки
        const actualCost = this.mapScreen ? this.mapScreen.getZoneCost(this.zone) : this.zone.unlockCost;
        const hasDiscount = actualCost < this.zone.unlockCost;
        
        // Стоимость - УВЕЛИЧЕН ШРИФТ
        const hasMoney = this.playerData.coins >= actualCost;
        ctx.fillStyle = hasMoney ? '#2ecc71' : '#e74c3c';
        const costLabel = L('location_cost', '💰 Стоимость:');
        assetManager.drawTextWithCoinIcon(ctx, `${costLabel} ${actualCost}`, leftCol, startY + 12, 20);
        
        // Если есть скидка, показываем иконку карты и старую цену
        if (hasDiscount) {
            // Иконка карты
            ctx.font = '20px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText('🗺️', leftCol + 220, startY + 12);
            
            // Старая цена зачеркнутая
            ctx.font = '16px Arial';
            ctx.fillStyle = '#95a5a6';
            const oldPriceText = `${this.zone.unlockCost}`;
            ctx.fillText(oldPriceText, leftCol, startY + 42);
            
            // Зачеркивание
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            const oldPriceWidth = ctx.measureText(oldPriceText).width;
            ctx.beginPath();
            ctx.moveTo(leftCol - 5, startY + 50);
            ctx.lineTo(leftCol + oldPriceWidth + 5, startY + 50);
            ctx.stroke();
        } else {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#bdc3c7';
            const youHaveCoins = L('location_you_have_coins', '(У вас: {coins})').replace('{coins}', this.playerData.coins);
            ctx.fillText(youHaveCoins, leftCol, startY + 42);
        }
        
        // Уровень - УВЕЛИЧЕН ШРИФТ
        const hasLevel = this.playerData.level >= this.levelRequirement;
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = hasLevel ? '#2ecc71' : '#e74c3c';
        const levelReqText = L('location_level_requirement', '⭐ Уровень:') + ' ' + this.levelRequirement;
        ctx.fillText(levelReqText, rightCol, startY + 12);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#bdc3c7';
        const youHaveLevel = L('location_you_have_level', '(У вас: {level})').replace('{level}', this.playerData.level);
        ctx.fillText(youHaveLevel, rightCol, startY + 42);
        
        ctx.restore();
    }
    

    
    renderActionButton() {
        const ctx = this.ctx;
        const btn = this.actionButton;
        
        ctx.save();
        
        // Проверяем, является ли это текущей зоной (используем playerData)
        const currentZoneId = this.playerData.currentZone || 1;
        const thisZoneId = this.zone.id;
        const isCurrentZone = Number(currentZoneId) === Number(thisZoneId);
        
        // Получаем стоимость с учетом скидки
        const unlockCost = this.mapScreen ? this.mapScreen.getZoneCost(this.zone, false) : this.zone.unlockCost; // Покупка доступа
        const travelCost = this.mapScreen ? this.mapScreen.getZoneCost(this.zone, true) : Math.round(this.zone.unlockCost * 0.8); // Перемещение
        
        let buttonText = '';
        let isDisabled = false;
        let buttonColor = '';
        
        // Если это текущая зона - показываем "На рыбалку" независимо от статуса разблокировки
        if (isCurrentZone) {
            buttonText = L('location_go_fishing', '🎣 На рыбалку');
            buttonColor = '#27ae60';
            isDisabled = false; // Кнопка активна - можно перейти на рыбалку
        } else if (this.isUnlocked) {
            // Другая открытая локация - платное перемещение (80% от стоимости)
            buttonText = `${L('location_travel', 'Переместиться')} (${travelCost}💰)`;
            buttonColor = '#3498db';
        } else {
            // Пересчитываем canUnlock в реальном времени
            const currentCanUnlock = this.mapScreen ? this.mapScreen.canUnlockZone(this.zone) : this.canUnlock;
            
            if (currentCanUnlock) {
                // Еще не открыта - покупка доступа
                buttonText = `${L('location_buy_access', 'Купить доступ')} (${unlockCost}💰)`;
                buttonColor = '#f39c12';
            } else {
                // Проверяем что именно не хватает
                const hasLevel = this.playerData.level >= this.levelRequirement;
                const hasCoins = this.playerData.coins >= unlockCost;
                
                if (!hasLevel) {
                    // Недостаточно уровня
                    buttonText = `${L('insufficient_level', 'Недостаточно уровня')} (${this.levelRequirement})`;
                } else if (!hasCoins) {
                    // Недостаточно денег
                    buttonText = `${L('insufficient_coins', 'Недостаточно монет')} (${unlockCost}💰)`;
                } else {
                    // Общее сообщение
                    buttonText = L('insufficient_level', 'Недостаточно уровня');
                }
                
                buttonColor = '#7f8c8d';
                isDisabled = true;
            }
        }
        
        // Загружаем подложку uipan.png через AssetManager
        if (!this.uipanImage) {
            this.uipanImage = window.assetManager ? window.assetManager.getImage('uipan.png') : null;
        }
        
        // Рисуем подложку uipan.png
        if (this.uipanImage && this.uipanImage.complete && this.uipanImage.naturalWidth > 0) {
            ctx.globalAlpha = isDisabled ? 0.6 : 1.0;
            ctx.drawImage(this.uipanImage, btn.x, btn.y, btn.width, btn.height);
        } else {
            // Fallback - градиент если изображение не загружено
            const gradient = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.height);
            gradient.addColorStop(0, buttonColor);
            gradient.addColorStop(1, this.darkenColor(buttonColor, 0.2));
            
            ctx.globalAlpha = isDisabled ? 0.6 : 1.0;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 12);
            ctx.fill();
            
            // Обводка
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Текст кнопки
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Рисуем текст с иконкой монеты (если есть 💰) или обычный текст
        if (buttonText.includes('💰')) {
            // Используем drawTextWithCoinIcon для текста с монетами (без обводки)
            assetManager.drawTextWithCoinIcon(ctx, buttonText, btn.x + btn.width / 2, btn.y + btn.height / 2, 18);
        } else {
            // Черная обводка для обычного текста
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText(buttonText, btn.x + btn.width / 2, btn.y + btn.height / 2);
            ctx.fillText(buttonText, btn.x + btn.width / 2, btn.y + btn.height / 2);
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
    
    getRarityColor(rarity) {
        const colors = {
            'Обычная': '#95a5a6',
            'Необычная': '#2ecc71',
            'Редкая': '#3498db',
            'Эпическая': '#9b59b6',
            'Легендарная': '#f39c12',
            // Поддержка старых английских названий для совместимости
            'Common': '#95a5a6',
            'Uncommon': '#2ecc71',
            'Rare': '#3498db',
            'Epic': '#9b59b6',
            'Legendary': '#f39c12'
        };
        return colors[rarity] || '#fff';
    }
    
    translateRarity(rarity) {
        // Используем систему локализации для перевода редкости
        if (window.localizationSystem) {
            return window.localizationSystem.t(`rarity_${rarity}`, rarity);
        }
        return rarity;
    }
    
    lightenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) * (1 + amount));
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) * (1 + amount));
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) * (1 + amount));
        return `rgb(${r}, ${g}, ${b})`;
    }
}
