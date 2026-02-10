// UI для инвентаря бонусов
// Модальное окно выбора и использования бонусов (по аналогии с GearInventoryUI)

class BonusInventoryUI {
    constructor(canvas, premiumEffects) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.premiumEffects = premiumEffects;
        
        // Состояние UI
        this.visible = false;
        this.animProgress = 0;
        
        // Кнопка открытия инвентаря (inv_rib в левом верхнем углу)
        this.openButton = {
            x: 80,
            y: 80,
            size: 72,
            sprite: null
        };
        
        // Загрузка спрайта кнопки
        this.loadSprite();
        
        // Список бонусов
        this.items = [];
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.maxVisibleItems = 5;
        
        // Перетаскивание для скролла
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartScroll = 0;
        this.dragVelocity = 0;
        this.lastDragY = 0;
        this.lastDragTime = 0;
        
        // Размеры окна (как у GearInventoryUI)
        this.modalWidth = 850;
        this.modalHeight = 600;
        this.modalX = 0;
        this.modalY = 0;
        
        // Размеры списка
        this.listWidth = 280;
        this.listItemHeight = 70;
        
        // Кнопки
        this.useButton = { x: 0, y: 0, width: 140, height: 45, visible: false };
        this.closeButton = { x: 0, y: 0, size: 36 };
        
        // Инвентарь бонусов (количество каждого бонуса)
        this.inventory = {
            energizer: 0,
            bait_booster: 0,
            blood: 0,
            lucky_coin: 0,
            sonar_basic: 0,
            sonar_advanced: 0,
            compass: 0,
            coffee_thermos: 0,
            fish_scanner: 0,
            travel_map: 0,
            repair_kit: 0,
            glue: 0,
            lucky_charm: 0,
            lucky_wallet: 0,
            chan_chu: 0,
            fishing_magazine: 0,
            fishing_book: 0
        };
        
        // Загрузка инвентаря из localStorage
        this.loadInventory();
        
        this.updatePositions();
    }
    
    loadSprite() {
        if (window.assetManager) {
            this.openButton.sprite = assetManager.getImage('inv_rib.png');
        } else {
            const img = new Image();
            img.src = 'inv_rib.png';
            this.openButton.sprite = img;
        }
    }
    
    updatePositions() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.modalX = (w - this.modalWidth) / 2;
        this.modalY = (h - this.modalHeight) / 2;
        
        // Кнопка закрытия (в углу с отступом)
        this.closeButton.x = this.modalX + this.modalWidth - 15;
        this.closeButton.y = this.modalY + 15;
        
        // Кнопка использования
        this.useButton.x = this.modalX + this.listWidth + 50 + (this.modalWidth - this.listWidth - 100 - this.useButton.width) / 2;
        this.useButton.y = this.modalY + this.modalHeight - 70;
    }
    
    // Открыть окно
    show() {
        this.visible = true;
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.loadItems();
        this.updatePositions();
    }
    
    hide() {
        this.visible = false;
        this.items = [];
    }
    
    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    // Загрузить бонусы из инвентаря
    loadItems() {
        this.items = [];
        
        PREMIUM_DATABASE.forEach(item => {
            const count = this.inventory[item.id] || 0;
            
            // Показываем бонусы которые есть в инвентаре
            if (count > 0) {
                this.items.push({
                    ...item,
                    count: count,
                    isActive: this.isActive(item)
                });
            }
        });
    }
    
    // Проверить активен ли бонус
    isActive(item) {
        if (item.duration === -1) {
            // Постоянные эффекты
            if (item.id === 'sonar_basic') {
                return this.premiumEffects.permanentEffects.sonar === 'basic';
            } else if (item.id === 'sonar_advanced') {
                return this.premiumEffects.permanentEffects.sonar === 'advanced';
            } else if (item.id === 'compass') {
                return this.premiumEffects.permanentEffects.compass === true;
            } else if (item.id === 'fish_scanner') {
                return this.premiumEffects.permanentEffects.fishScanner === true;
            } else if (item.id === 'travel_map') {
                return this.premiumEffects.permanentEffects.travelDiscount === true;
            }
        } else if (item.duration === 0) {
            // Одноразовые эффекты всегда не активны
            return false;
        } else {
            // Временный эффект
            return this.premiumEffects.hasEffect(item.effect.type);
        }
        return false;
    }
    
    // Добавить бонус в инвентарь
    addBonus(itemId, count = 1) {
        // Инициализируем ключ если его нет
        if (!this.inventory.hasOwnProperty(itemId)) {
            this.inventory[itemId] = 0;
        }
        this.inventory[itemId] += count;
        this.saveInventory();
    }
    
    // Использовать бонус
    useBonus(itemId) {
        const item = PREMIUM_DATABASE.find(p => p.id === itemId);
        if (!item) return false;
        
        if (this.inventory[itemId] > 0 || item.duration === -1) {
            // Для постоянных эффектов - устанавливаем, не уменьшаем количество
            if (item.duration === -1) {
                this.premiumEffects.activateEffect(itemId);
                this.saveInventory();
                return true;
            }
            
            // Для одноразовых и временных эффектов - уменьшаем количество
            this.inventory[itemId]--;
            this.premiumEffects.activateEffect(itemId);
            this.saveInventory();
            return true;
        }
        return false;
    }
    
    // Снять постоянный эффект
    removePermanentEffect(itemId) {
        if (itemId === 'sonar_basic' || itemId === 'sonar_advanced') {
            this.premiumEffects.permanentEffects.sonar = null;
        } else if (itemId === 'compass') {
            this.premiumEffects.permanentEffects.compass = false;
        } else if (itemId === 'fish_scanner') {
            this.premiumEffects.permanentEffects.fishScanner = false;
        } else if (itemId === 'travel_map') {
            this.premiumEffects.permanentEffects.travelDiscount = false;
        }
        this.saveInventory();
    }
    
    // Сохранение инвентаря
    saveInventory() {
        localStorage.setItem('bonusInventory', JSON.stringify(this.inventory));
        // Сохраняем также состояние постоянных эффектов
        if (this.premiumEffects && this.premiumEffects.permanentEffects) {
            localStorage.setItem('premiumPermanentEffects', JSON.stringify(this.premiumEffects.permanentEffects));
        }
    }
    
    // Загрузка инвентаря
    loadInventory() {
        const saved = localStorage.getItem('bonusInventory');
        if (saved) {
            try {
                const loadedInventory = JSON.parse(saved);
                // Объединяем загруженный инвентарь с базовым (чтобы добавить новые ключи)
                this.inventory = { ...this.inventory, ...loadedInventory };
            } catch (e) {
            }
        }
        
        // Загружаем состояние постоянных эффектов
        const savedEffects = localStorage.getItem('premiumPermanentEffects');
        if (savedEffects && this.premiumEffects) {
            try {
                const loadedEffects = JSON.parse(savedEffects);
                this.premiumEffects.permanentEffects = { ...this.premiumEffects.permanentEffects, ...loadedEffects };
                
                // Автоматически применяем постоянные эффекты при входе в рыбалку
                this.restorePermanentEffects();
            } catch (e) {
            }
        }
    }
    
    // Восстановить постоянные эффекты при входе в рыбалку
    restorePermanentEffects() {
        const effects = this.premiumEffects.permanentEffects;
        let restoredCount = 0;
        
        // Восстанавливаем эхолот
        if (effects.sonar === 'basic' || effects.sonar === 'advanced') {
            restoredCount++;
        }
        
        // Восстанавливаем компас
        if (effects.compass === true) {
            restoredCount++;
        }
        
        // Восстанавливаем сканер рыбы
        if (effects.fishScanner === true) {
            restoredCount++;
        }
        
        // Восстанавливаем карту путешествий
        if (effects.travelDiscount === true) {
            restoredCount++;
        }
    }
    
    update(dt) {
        // Анимация появления/скрытия
        const targetProgress = this.visible ? 1 : 0;
        this.animProgress += (targetProgress - this.animProgress) * dt * 10;
        
        if (!this.visible && this.animProgress < 0.01) {
            this.animProgress = 0;
        }
        
        // Инерция скролла
        if (!this.isDragging && Math.abs(this.dragVelocity) > 0.1) {
            this.scrollOffset += this.dragVelocity * dt * 60;
            this.dragVelocity *= 0.92;
            
            const maxScroll = Math.max(0, this.items.length - this.maxVisibleItems);
            this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset));
            
            if (Math.abs(this.dragVelocity) < 0.1) {
                this.dragVelocity = 0;
            }
        }
    }
    
    render(ctx) {
        // Кнопка открытия инвентаря (всегда видна)
        this.renderOpenButton(ctx);
        
        // Активные бонусы под кнопкой (всегда видны)
        this.renderActiveBonuses(ctx);
        
        if (this.animProgress < 0.01) return;
        
        ctx.save();
        ctx.globalAlpha = this.animProgress;
        
        // Затемнение фона
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Масштабирование окна
        const scale = 0.8 + this.animProgress * 0.2;
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
        
        // Фон модального окна
        this.renderModalBackground(ctx);
        
        // Заголовок
        this.renderHeader(ctx);
        
        // Список бонусов (слева)
        this.renderItemList(ctx);
        
        // Информация о выбранном бонусе (справа)
        this.renderItemDetails(ctx);
        
        // Кнопка закрытия
        this.renderCloseButton(ctx);
        
        ctx.restore();
    }
    
    renderOpenButton(ctx) {
        const btn = this.openButton;
        
        ctx.save();
        
        // Получаем спрайт через AssetManager
        const sprite = assetManager ? assetManager.getImage('inv_rib.png') : null;
        
        // Рисуем спрайт
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, btn.x - btn.size / 2, btn.y - btn.size / 2, btn.size, btn.size);
        } else {
            // Fallback
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(btn.x, btn.y, btn.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = fontManager.getFont(32, 'bold');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🎒', btn.x, btn.y);
        }
        
        ctx.restore();
    }
    
    renderActiveBonuses(ctx) {
        const activeEffects = this.premiumEffects.activeEffects;
        
        let yOffset = this.openButton.y + this.openButton.size / 2 + 20;
        const iconSize = 40; // Уменьшен размер иконок с 48 до 40
        const spacing = 5; // Уменьшен отступ с 10 до 5
        
        ctx.save();
        
        // Активные временные эффекты
        activeEffects.forEach(effect => {
            const item = PREMIUM_DATABASE.find(p => p.id === effect.itemId);
            if (!item) return;
            
            // Черная подложка
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.beginPath();
            ctx.roundRect(this.openButton.x - iconSize / 2 - 5, yOffset - 5, iconSize + 10, iconSize + 10, 8);
            ctx.fill();
            
            // Иконка
            if (item.spriteId && assetManager) {
                const premiumImg = assetManager.getPremiumImage(item.spriteId);
                if (premiumImg) {
                    ctx.drawImage(premiumImg, this.openButton.x - (iconSize - 8) / 2, yOffset + 4, iconSize - 8, iconSize - 8);
                } else {
                    // Fallback на эмодзи
                    ctx.font = `${iconSize - 8}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(item.emoji, this.openButton.x, yOffset + iconSize / 2);
                }
            } else {
                // Fallback на эмодзи
                ctx.font = `${iconSize - 8}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.emoji, this.openButton.x, yOffset + iconSize / 2);
            }
            
            // Таймер
            const remaining = this.premiumEffects.getRemainingTime(effect.type);
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
            
            ctx.fillStyle = '#fff';
            ctx.font = fontManager.getFont(11, 'bold');
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeText(timeStr, this.openButton.x, yOffset + iconSize + 6);
            ctx.fillText(timeStr, this.openButton.x, yOffset + iconSize + 6);
            
            yOffset += iconSize + spacing + 12; // Уменьшен общий отступ
        });
        
        // Эхолот и компас не отображаются слева - они показываются в своих окнах справа
        
        ctx.restore();
    }
    
    renderModalBackground(ctx) {
        ctx.save();
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        
        // Рисуем фон рамки используя rmk.png
        const rmkImage = assetManager.getImage('rmk.png');
        if (rmkImage) {
            ctx.drawImage(
                rmkImage,
                this.modalX, this.modalY,
                this.modalWidth, this.modalHeight
            );
        } else {
            // Fallback
            const gradient = ctx.createLinearGradient(
                this.modalX, this.modalY,
                this.modalX, this.modalY + this.modalHeight
            );
            gradient.addColorStop(0, '#2c3e50');
            gradient.addColorStop(1, '#1a252f');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(this.modalX, this.modalY, this.modalWidth, this.modalHeight, 16);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    renderHeader(ctx) {
        ctx.save();
        
        ctx.fillStyle = '#f1c40f';
        ctx.font = fontManager.getFont(36);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L('bonus_title', 'Бонусы'), this.modalX + this.modalWidth / 2, this.modalY + 35);
        
        // Разделитель
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.modalX + 20, this.modalY + 60);
        ctx.lineTo(this.modalX + this.modalWidth - 20, this.modalY + 60);
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderItemList(ctx) {
        const listX = this.modalX + 20;
        const listY = this.modalY + 75;
        const listHeight = this.modalHeight - 95;
        
        ctx.save();
        
        // Фон списка
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(listX, listY, this.listWidth, listHeight, 8);
        ctx.fill();
        
        // Обрезка для скролла (увеличена вниз на высоту одной плитки)
        ctx.beginPath();
        ctx.rect(listX, listY, this.listWidth, listHeight + this.listItemHeight);
        ctx.clip();
        
        // Рендер элементов
        const visibleStart = Math.floor(this.scrollOffset);
        const visibleEnd = Math.min(this.items.length, visibleStart + this.maxVisibleItems + 2);
        
        for (let i = visibleStart; i < visibleEnd; i++) {
            const item = this.items[i];
            const itemY = listY + (i - this.scrollOffset) * this.listItemHeight + 5;
            
            this.renderListItem(ctx, item, i, listX + 5, itemY);
        }
        
        ctx.restore();
        
        // Скроллбар
        if (this.items.length > this.maxVisibleItems) {
            this.renderScrollbar(ctx, listX + this.listWidth - 12, listY + 5, 8, listHeight - 10);
        }
    }
    
    renderListItem(ctx, item, index, x, y) {
        const width = this.listWidth - 20;
        const height = this.listItemHeight - 5;
        const isSelected = index === this.selectedIndex;
        const isActive = item.isActive;
        
        ctx.save();
        
        // Фон элемента
        if (isSelected) {
            ctx.fillStyle = 'rgba(52, 152, 219, 0.4)';
        } else if (isActive) {
            ctx.fillStyle = 'rgba(46, 204, 113, 0.2)';
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        }
        
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 6);
        ctx.fill();
        
        // Обводка для выбранного
        if (isSelected) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (isActive) {
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Иконка
        if (item.spriteId && assetManager) {
            const premiumImg = assetManager.getPremiumImage(item.spriteId);
            if (premiumImg) {
                ctx.drawImage(premiumImg, x + 7, y + height / 2 - 18, 36, 36);
            } else {
                // Fallback на эмодзи
                ctx.font = '36px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.emoji || '📦', x + 25, y + height / 2);
            }
        } else {
            // Fallback на эмодзи
            ctx.font = '36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.emoji || '📦', x + 25, y + height / 2);
        }
        
        // Название
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(18);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Получаем переведенное название
        const itemName = window.localizationSystem ? 
            window.localizationSystem.t(`bonus_${item.id}_name`, item.name) : 
            item.name;
        const displayName = itemName.length > 14 ? itemName.substring(0, 12) + '...' : itemName;
        ctx.fillText(displayName, x + 50, y + 10);
        
        // Количество или статус
        ctx.fillStyle = '#f1c40f';
        ctx.font = fontManager.getFont(16, 'normal');
        
        if (item.duration === -1) {
            // Эхолот
            ctx.fillStyle = isActive ? '#2ecc71' : '#95a5a6';
            ctx.fillText(isActive ? L('bonus_active', 'Активен') : L('bonus_available', 'Есть'), x + 50, y + 35);
        } else {
            // Временный эффект
            ctx.fillText(`×${item.count}`, x + 50, y + 35);
        }
        
        // Метка активности
        if (isActive && item.duration !== -1) {
            const remaining = this.premiumEffects.getRemainingTime(item.effect.type);
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            ctx.fillStyle = '#2ecc71';
            ctx.font = fontManager.getFont(12);
            ctx.textAlign = 'right';
            ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}`, x + width - 10, y + height / 2);
        } else if (isActive) {
            ctx.fillStyle = '#2ecc71';
            ctx.font = fontManager.getFont(14);
            ctx.textAlign = 'right';
            ctx.fillText('✓', x + width - 10, y + height / 2);
        }
        
        ctx.restore();
    }
    
    renderScrollbar(ctx, x, y, width, height) {
        const totalItems = this.items.length;
        const visibleRatio = this.maxVisibleItems / totalItems;
        const scrollRatio = this.scrollOffset / (totalItems - this.maxVisibleItems);
        
        const thumbHeight = Math.max(30, height * visibleRatio);
        const thumbY = y + (height - thumbHeight) * scrollRatio;
        
        ctx.save();
        
        // Фон скроллбара
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 4);
        ctx.fill();
        
        // Ползунок
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.roundRect(x, thumbY, width, thumbHeight, 4);
        ctx.fill();
        
        ctx.restore();
    }
    
    renderItemDetails(ctx) {
        const detailsX = this.modalX + this.listWidth + 40;
        const detailsY = this.modalY + 75;
        const detailsWidth = this.modalWidth - this.listWidth - 60;
        const detailsHeight = this.modalHeight - 150;
        
        ctx.save();
        
        // Фон панели деталей
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.roundRect(detailsX, detailsY, detailsWidth, detailsHeight, 8);
        ctx.fill();
        
        if (this.selectedIndex < 0 || this.selectedIndex >= this.items.length) {
            // Нет выбранного элемента
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = fontManager.getFont(22, 'normal');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L('bonus_select', 'Выберите бонус'), detailsX + detailsWidth / 2, detailsY + detailsHeight / 2);
            ctx.restore();
            return;
        }
        
        const item = this.items[this.selectedIndex];
        
        // Получаем переведенное название и описание
        const itemName = window.localizationSystem ? 
            window.localizationSystem.t(`bonus_${item.id}_name`, item.name) : 
            item.name;
        const itemDesc = window.localizationSystem ? 
            window.localizationSystem.t(`bonus_${item.id}_desc`, item.description) : 
            item.description;
        
        // Иконка (увеличена на 30%)
        if (item.spriteId && assetManager) {
            const premiumImg = assetManager.getPremiumImage(item.spriteId);
            if (premiumImg) {
                const iconSize = 104; // 80 * 1.3 = 104
                ctx.drawImage(premiumImg, detailsX + detailsWidth / 2 - iconSize/2, detailsY + 10, iconSize, iconSize);
            } else {
                // Fallback на эмодзи
                ctx.font = '80px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(item.emoji || '📦', detailsX + detailsWidth / 2, detailsY + 50);
            }
        } else {
            // Fallback на эмодзи
            ctx.font = '80px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.emoji || '📦', detailsX + detailsWidth / 2, detailsY + 50);
        }
        
        // Название
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(26);
        ctx.textAlign = 'center';
        ctx.fillText(itemName, detailsX + detailsWidth / 2, detailsY + 95);
        
        // Описание
        ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
        ctx.font = fontManager.getFont(18, 'normal');
        ctx.textAlign = 'left';
        
        const words = itemDesc.split(' ');
        let line = '';
        let descY = detailsY + 140;
        const maxWidth = detailsWidth - 40;
        const statsX = detailsX + 20;
        
        words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line.trim(), statsX, descY);
                line = word + ' ';
                descY += 24;
            } else {
                line = testLine;
            }
        });
        
        if (line.trim()) {
            ctx.fillText(line.trim(), statsX, descY);
        }
        
        // Дополнительная информация
        descY += 40;
        ctx.fillStyle = '#bdc3c7';
        ctx.font = fontManager.getFont(18, 'normal');
        
        if (item.duration === -1) {
            ctx.fillText(L('bonus_permanent', 'Постоянный эффект'), statsX, descY);
        } else {
            const mins = Math.floor(item.duration / 60);
            ctx.fillText(`${L('bonus_duration', 'Длительность')}: ${mins} ${L('bonus_minutes', 'минут')}`, statsX, descY);
        }
        
        ctx.restore();
        
        // Кнопка использования
        this.renderUseButton(ctx, item);
    }
    
    renderUseButton(ctx, item) {
        const isPermanent = item.duration === -1;
        const isOneTime = item.duration === 0;
        const isActive = item.isActive;
        
        ctx.save();
        
        // Фон кнопки uipan
        const uipanImage = assetManager.getImage('uipan.png');
        if (uipanImage) {
            ctx.drawImage(
                uipanImage,
                this.useButton.x, this.useButton.y,
                this.useButton.width, this.useButton.height
            );
        }
        
        // Определяем текст и цвет кнопки
        let buttonText = '';
        let canUse = true;
        
        if (isPermanent) {
            if (isActive) {
                buttonText = L('bonus_remove', 'Снять');
                ctx.fillStyle = '#e74c3c';
            } else {
                buttonText = L('bonus_install', 'Установить');
                ctx.fillStyle = '#2ecc71';
            }
        } else {
            if (item.count > 0) {
                buttonText = isOneTime ? L('bonus_apply', 'Применить') : L('bonus_use', 'Использовать');
                ctx.fillStyle = '#2ecc71';
            } else {
                buttonText = L('bonus_not_available', 'Нет в наличии');
                ctx.fillStyle = '#7f8c8d';
                canUse = false;
            }
        }
        
        // Обводка кнопки
        if (!uipanImage) {
            ctx.beginPath();
            ctx.roundRect(
                this.useButton.x, this.useButton.y,
                this.useButton.width, this.useButton.height, 8
            );
            ctx.fill();
        }
        
        // Текст кнопки
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(buttonText, this.useButton.x + this.useButton.width / 2, this.useButton.y + this.useButton.height / 2);
        
        ctx.restore();
    }
    
    renderCloseButton(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.9;
        
        // Используем спрайт zak.png (увеличен в 2 раза)
        const zakImage = assetManager.getImage('zak.png');
        if (zakImage) {
            const size = this.closeButton.size * 2;
            ctx.drawImage(zakImage, this.closeButton.x - size/2, this.closeButton.y - size/2, size, size);
        } else {
            // Fallback
            ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
            ctx.beginPath();
            ctx.arc(this.closeButton.x, this.closeButton.y, this.closeButton.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            
            const offset = this.closeButton.size / 2;
            ctx.beginPath();
            ctx.moveTo(this.closeButton.x - offset, this.closeButton.y - offset);
            ctx.lineTo(this.closeButton.x + offset, this.closeButton.y + offset);
            ctx.moveTo(this.closeButton.x + offset, this.closeButton.y - offset);
            ctx.lineTo(this.closeButton.x - offset, this.closeButton.y + offset);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // Обработка клика
    handleClick(x, y) {
        if (!this.visible) return false;
        
        // Воспроизводим звук клика
        if (this.audioManager) this.audioManager.playClickSound();
        
        // Клик на кнопку закрытия
        if (this.isCloseButtonClicked(x, y)) {
            this.hide();
            return true;
        }
        
        // Клик вне модального окна
        if (!this.isInsideModal(x, y)) {
            this.hide();
            return true;
        }
        
        // Начало перетаскивания списка
        const listX = this.modalX + 20;
        const listY = this.modalY + 75;
        const listHeight = this.modalHeight - 95;
        
        if (x >= listX && x <= listX + this.listWidth &&
            y >= listY && y <= listY + listHeight) {
            this.isDragging = true;
            this.dragStartY = y;
            this.dragStartScroll = this.scrollOffset;
            this.lastDragY = y;
            this.lastDragTime = performance.now();
            this.dragVelocity = 0;
            return true;
        }
        
        // Клик на кнопку использования
        if (this.isUseButtonClicked(x, y)) {
            this.useSelected();
            return true;
        }
        
        return true;
    }
    
    // Обработка движения мыши
    handleMouseMove(x, y) {
        if (!this.visible || !this.isDragging) return;
        
        const deltaY = this.dragStartY - y;
        const deltaItems = deltaY / this.listItemHeight;
        
        this.scrollOffset = this.dragStartScroll + deltaItems;
        
        const maxScroll = Math.max(0, this.items.length - this.maxVisibleItems);
        this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset));
        
        const now = performance.now();
        const dt = (now - this.lastDragTime) / 1000;
        if (dt > 0) {
            const velocity = (this.lastDragY - y) / dt / this.listItemHeight;
            this.dragVelocity = velocity * 0.3;
        }
        
        this.lastDragY = y;
        this.lastDragTime = now;
    }
    
    // Обработка отпускания мыши
    handleMouseUp(x, y) {
        if (!this.visible) return;
        
        if (this.isDragging) {
            this.isDragging = false;
            
            const dragDistance = Math.abs(this.dragStartY - this.lastDragY);
            if (dragDistance < 5) {
                // Это был клик, а не перетаскивание
                const clickedIndex = this.getClickedItemIndex(x, y);
                if (clickedIndex !== -1) {
                    this.selectedIndex = clickedIndex;
                }
                this.dragVelocity = 0;
            }
        }
    }
    
    // Обработка скролла
    handleWheel(deltaY) {
        if (!this.visible) return false;
        
        const maxScroll = Math.max(0, this.items.length - this.maxVisibleItems);
        // Нормализуем deltaY и делаем скролл более плавным
        const scrollAmount = Math.sign(deltaY) * 0.3;
        this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset + scrollAmount));
        this.dragVelocity = 0;
        
        return true;
    }
    
    isInsideModal(x, y) {
        return x >= this.modalX && x <= this.modalX + this.modalWidth &&
               y >= this.modalY && y <= this.modalY + this.modalHeight;
    }
    
    isCloseButtonClicked(x, y) {
        const dx = x - this.closeButton.x;
        const dy = y - this.closeButton.y;
        return Math.sqrt(dx * dx + dy * dy) < this.closeButton.size;
    }
    
    isUseButtonClicked(x, y) {
        return x >= this.useButton.x && x <= this.useButton.x + this.useButton.width &&
               y >= this.useButton.y && y <= this.useButton.y + this.useButton.height;
    }
    
    getClickedItemIndex(x, y) {
        const listX = this.modalX + 20;
        const listY = this.modalY + 75;
        const listHeight = this.modalHeight - 95;
        
        if (x < listX || x > listX + this.listWidth || y < listY || y > listY + listHeight) {
            return -1;
        }
        
        const relativeY = y - listY + this.scrollOffset * this.listItemHeight;
        const index = Math.floor(relativeY / this.listItemHeight);
        
        if (index >= 0 && index < this.items.length) {
            return index;
        }
        
        return -1;
    }
    
    // Использовать выбранный бонус
    useSelected() {
        if (this.selectedIndex < 0 || this.selectedIndex >= this.items.length) return;
        
        const item = this.items[this.selectedIndex];
        
        // Для постоянных эффектов
        if (item.duration === -1) {
            if (item.isActive) {
                // Снять постоянный эффект
                this.removePermanentEffect(item.id);
            } else {
                // Установить постоянный эффект
                this.useBonus(item.id);
            }
            this.loadItems();
            return;
        }
        
        // Для временных и одноразовых эффектов
        if (item.count > 0) {
            this.useBonus(item.id);
            this.loadItems();
        }
    }
    
    // Проверка клика по кнопке открытия
    isOpenButtonPressed(x, y) {
        const btn = this.openButton;
        const dx = x - btn.x;
        const dy = y - btn.y;
        return Math.sqrt(dx * dx + dy * dy) < btn.size / 2;
    }
    
    // Сброс всех активных бонусов (при выходе в меню)
    resetAllBonuses() {
        // Очищаем все активные временные эффекты
        this.premiumEffects.activeEffects = [];
        
        // ПОСТОЯННЫЕ ЭФФЕКТЫ НЕ СБРАСЫВАЕМ - они должны сохраняться между сессиями
        // Эхолот, компас, сканер рыбы и карта путешествий остаются активными
    }
}
