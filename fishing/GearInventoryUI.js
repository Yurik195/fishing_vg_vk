// UI для инвентаря снастей
// Модальное окно выбора и установки снастей

class GearInventoryUI {
    constructor(canvas, gearInventory) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.inventory = gearInventory;
        
        // Состояние UI
        this.visible = false;
        this.animProgress = 0;
        this.currentType = null; // Тип снасти: rod, line, float, hook, reel, bait
        
        // Список снастей
        this.items = [];
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.maxVisibleItems = 5;
        
        // Размеры окна
        this.modalWidth = 850; // Увеличено с 700
        this.modalHeight = 600; // Увеличено с 500
        this.modalX = 0;
        this.modalY = 0;
        
        // Размеры списка
        this.listWidth = 280;
        this.listItemHeight = 70;
        
        // Кнопки
        this.equipButton = { x: 0, y: 0, width: 140, height: 45, visible: false };
        this.closeButton = { x: 0, y: 0, size: 36 };
        
        // Скролл
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartScroll = 0;
        
        // Названия типов
        this.typeNames = {
            rod: L('gear_modal_rods', 'Удочки'),
            line: L('gear_modal_lines', 'Лески'),
            float: L('gear_modal_floats', 'Поплавки'),
            hook: L('gear_modal_hooks', 'Крючки'),
            reel: L('gear_modal_reels', 'Катушки'),
            bait: L('gear_modal_baits', 'Наживки')
        };
        
        // Иконки типов
        this.typeIcons = {
            rod: '🎣',
            line: '🧵',
            float: '🎈',
            hook: '🪝',
            reel: '⚙️',
            bait: '🍞'
        };
        
        this.updatePositions();
    }
    
    // Обновить названия типов снастей после смены языка
    updateTypeNames() {
        this.typeNames = {
            rod: L('gear_modal_rods', 'Удочки'),
            line: L('gear_modal_lines', 'Лески'),
            float: L('gear_modal_floats', 'Поплавки'),
            hook: L('gear_modal_hooks', 'Крючки'),
            reel: L('gear_modal_reels', 'Катушки'),
            bait: L('gear_modal_baits', 'Наживки')
        };
    }
    
    updatePositions() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.modalX = (w - this.modalWidth) / 2;
        this.modalY = (h - this.modalHeight) / 2;
        
        // Кнопка закрытия (в углу с отступом)
        this.closeButton.x = this.modalX + this.modalWidth - 15;
        this.closeButton.y = this.modalY + 15;
        
        // Кнопка установки
        this.equipButton.x = this.modalX + this.listWidth + 50 + (this.modalWidth - this.listWidth - 100 - this.equipButton.width) / 2;
        this.equipButton.y = this.modalY + this.modalHeight - 70;
    }
    
    // Открыть окно для определенного типа снастей
    show(gearType) {
        this.visible = true;
        this.currentType = gearType;
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.updateTypeNames(); // Обновляем названия при открытии
        this.loadItems();
        this.updatePositions();
        
        // Выбираем текущую установленную снасть
        this.selectEquipped();
    }
    
    hide() {
        this.visible = false;
        this.currentType = null;
        this.items = [];
    }
    
    toggle(gearType) {
        if (this.visible && this.currentType === gearType) {
            this.hide();
        } else {
            this.show(gearType);
        }
    }
    
    // Загрузить предметы из инвентаря
    loadItems() {
        if (this.currentType === 'bait') {
            this.items = this.inventory.getBaits();
        } else {
            this.items = this.inventory.getGearsByType(this.currentType);
        }
    }
    
    // Выбрать текущую установленную снасть
    selectEquipped() {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].isEquipped) {
                this.selectedIndex = i;
                // Прокрутить к выбранному элементу
                if (i >= this.scrollOffset + this.maxVisibleItems) {
                    this.scrollOffset = i - this.maxVisibleItems + 1;
                } else if (i < this.scrollOffset) {
                    this.scrollOffset = i;
                }
                break;
            }
        }
    }
    
    update(dt) {
        // Анимация появления/скрытия
        const targetProgress = this.visible ? 1 : 0;
        this.animProgress += (targetProgress - this.animProgress) * dt * 10;
        
        if (!this.visible && this.animProgress < 0.01) {
            this.animProgress = 0;
        }
    }
    
    render(ctx) {
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
        
        // Список снастей (слева)
        this.renderItemList(ctx);
        
        // Информация о выбранной снасти (справа)
        this.renderItemDetails(ctx);
        
        // Кнопка закрытия
        this.renderCloseButton(ctx);
        
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
            // Используем изображение rmk.png как фон рамки
            ctx.drawImage(
                rmkImage,
                this.modalX, this.modalY,
                this.modalWidth, this.modalHeight
            );
        } else {
            // Fallback - градиентный фон если изображение не загружено
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
        const title = this.typeNames[this.currentType] || 'Снаряжение';
        
        ctx.save();
        
        ctx.fillStyle = '#f1c40f';
        ctx.font = fontManager.getFont(36); // Увеличено
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, this.modalX + this.modalWidth / 2, this.modalY + 35); // Убран смайл
        
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
        
        // Обрезка для скролла
        ctx.beginPath();
        ctx.rect(listX, listY, this.listWidth, listHeight);
        ctx.clip();
        
        // Рендер элементов
        const visibleStart = Math.floor(this.scrollOffset);
        const visibleEnd = Math.min(this.items.length, visibleStart + this.maxVisibleItems + 1);
        
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
        const isEquipped = item.isEquipped;
        
        ctx.save();
        
        // Фон элемента
        if (isSelected) {
            ctx.fillStyle = 'rgba(52, 152, 219, 0.4)';
        } else if (isEquipped) {
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
        } else if (isEquipped) {
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Иконка - для поплавков, лесок и крючков используем спрайт, для остальных смайлик
        if (this.currentType === 'float') {
            const floatTier = item.tier;
            const floatSpriteKey = `float_${String(floatTier).padStart(2, '0')}.png`;
            const floatSprite = assetManager.getImage(floatSpriteKey);
            
            if (floatSprite) {
                const iconSize = 40;
                ctx.drawImage(floatSprite, x + 25 - iconSize/2, y + height/2 - iconSize/2, iconSize, iconSize);
            } else {
                ctx.font = fontManager.getFont(36, 'normal');
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.emoji || '📦', x + 25, y + height / 2);
            }
        } else if (this.currentType === 'line') {
            const lineTier = item.tier;
            const lineSpriteKey = `l_${lineTier}.png`;
            const lineSprite = assetManager.getImage(lineSpriteKey);
            
            if (lineSprite) {
                const iconSize = 40;
                ctx.drawImage(lineSprite, x + 25 - iconSize/2, y + height/2 - iconSize/2, iconSize, iconSize);
            } else {
                ctx.font = fontManager.getFont(36, 'normal');
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.emoji || '📦', x + 25, y + height / 2);
            }
        } else if (this.currentType === 'hook') {
            const hookTier = item.tier;
            const hookSpriteKey = `k_${hookTier}.png`;
            const hookSprite = assetManager.getImage(hookSpriteKey);
            
            if (hookSprite) {
                const iconSize = 40;
                ctx.drawImage(hookSprite, x + 25 - iconSize/2, y + height/2 - iconSize/2, iconSize, iconSize);
            } else {
                ctx.font = fontManager.getFont(36, 'normal');
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.emoji || '📦', x + 25, y + height / 2);
            }
        } else if (this.currentType === 'rod') {
            const rodTier = item.tier;
            const rodSpriteKey = `u${rodTier}.png`;
            const rodSprite = assetManager.getImage(rodSpriteKey);
            
            if (rodSprite) {
                const iconSize = 40;
                ctx.drawImage(rodSprite, x + 25 - iconSize/2, y + height/2 - iconSize/2, iconSize, iconSize);
            } else {
                ctx.font = fontManager.getFont(36, 'normal');
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.emoji || '📦', x + 25, y + height / 2);
            }
        } else if (this.currentType === 'reel') {
            const reelTier = item.tier;
            const reelSpriteKey = `h${reelTier}.png`;
            const reelSprite = assetManager.getImage(reelSpriteKey);
            
            if (reelSprite) {
                const iconSize = 40;
                ctx.drawImage(reelSprite, x + 25 - iconSize/2, y + height/2 - iconSize/2, iconSize, iconSize);
            } else {
                ctx.font = fontManager.getFont(36, 'normal');
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.emoji || '📦', x + 25, y + height / 2);
            }
        } else if (this.currentType === 'bait') {
            // Для наживок используем спрайты n1.png - n21.png
            const baitId = item.id;
            const baitSpriteKey = `n${baitId}.png`;
            const baitSprite = assetManager.getImage(baitSpriteKey);
            
            if (baitSprite) {
                const iconSize = 40;
                ctx.drawImage(baitSprite, x + 25 - iconSize/2, y + height/2 - iconSize/2, iconSize, iconSize);
            } else {
                ctx.font = fontManager.getFont(36, 'normal');
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.emoji || '📦', x + 25, y + height / 2);
            }
        } else {
            // Для остальных снастей используем смайлики
            ctx.font = fontManager.getFont(36, 'normal');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.emoji || '📦', x + 25, y + height / 2);
        }
        
        // Название
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(18); // Увеличено
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Получаем переведенное название
        let itemName = item.name || `T${item.tier}`;
        if (this.currentType === 'bait' && window.localizationSystem) {
            itemName = window.localizationSystem.getBaitName(item.id, item.name);
        } else if (this.currentType !== 'bait' && item.tier && window.GearDB) {
            itemName = window.GearDB.getLocalizedGearName(this.currentType, item.tier, item.name);
        }
        const displayName = itemName.length > 18 ? itemName.substring(0, 16) + '...' : itemName;
        ctx.fillText(displayName, x + 50, y + 10);
        
        // Уровень или количество
        ctx.fillStyle = '#f1c40f';
        ctx.font = fontManager.getFont(16, 'normal'); // Увеличено
        
        if (this.currentType === 'bait') {
            ctx.fillText(`x${item.count}`, x + 50, y + 30);
        } else {
            ctx.fillText(`${L('gear_level', 'Уровень')} ${item.tier}`, x + 50, y + 30);
            
            // Прочность
            if (item.durability !== undefined) {
                const durPercent = (item.durability / item.maxDurability) * 100;
                const durColor = durPercent > 50 ? '#2ecc71' : durPercent > 25 ? '#f1c40f' : '#e74c3c';
                ctx.fillStyle = durColor;
                ctx.fillText(`${Math.round(durPercent)}%`, x + 50, y + 45);
            }
        }
        
        // Метка "Установлено"
        if (isEquipped) {
            ctx.fillStyle = '#2ecc71';
            ctx.font = fontManager.getFont(14); // Увеличено
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
            ctx.font = fontManager.getFont(22, 'normal'); // Увеличено
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L('gear_modal_select', 'Выберите снасть'), detailsX + detailsWidth / 2, detailsY + detailsHeight / 2);
            ctx.restore();
            return;
        }
        
        const item = this.items[this.selectedIndex];
        
        // Иконка - для поплавков, лесок и крючков используем спрайт, для остальных смайлик
        if (this.currentType === 'float') {
            const floatTier = item.tier;
            const floatSpriteKey = `float_${String(floatTier).padStart(2, '0')}.png`;
            const floatSprite = assetManager.getImage(floatSpriteKey);
            
            if (floatSprite) {
                const iconSize = 85;
                ctx.drawImage(floatSprite, detailsX + detailsWidth / 2 - iconSize/2, detailsY + 50 - iconSize/2, iconSize, iconSize);
            } else {
                ctx.font = fontManager.getFont(68, 'normal');
                ctx.textAlign = 'center';
                ctx.fillText(item.emoji || '📦', detailsX + detailsWidth / 2, detailsY + 50);
            }
        } else if (this.currentType === 'line') {
            const lineTier = item.tier;
            const lineSpriteKey = `l_${lineTier}.png`;
            const lineSprite = assetManager.getImage(lineSpriteKey);
            
            if (lineSprite) {
                const iconSize = 85;
                ctx.drawImage(lineSprite, detailsX + detailsWidth / 2 - iconSize/2, detailsY + 50 - iconSize/2, iconSize, iconSize);
            } else {
                ctx.font = fontManager.getFont(68, 'normal');
                ctx.textAlign = 'center';
                ctx.fillText(item.emoji || '📦', detailsX + detailsWidth / 2, detailsY + 50);
            }
        } else if (this.currentType === 'hook') {
            const hookTier = item.tier;
            const hookSpriteKey = `k_${hookTier}.png`;
            const hookSprite = assetManager.getImage(hookSpriteKey);
            
            if (hookSprite) {
                const iconSize = 85;
                ctx.drawImage(hookSprite, detailsX + detailsWidth / 2 - iconSize/2, detailsY + 50 - iconSize/2, iconSize, iconSize);
            } else {
                ctx.font = fontManager.getFont(68, 'normal');
                ctx.textAlign = 'center';
                ctx.fillText(item.emoji || '📦', detailsX + detailsWidth / 2, detailsY + 50);
            }
        } else if (this.currentType === 'rod') {
            const rodTier = item.tier;
            const rodSpriteKey = `u${rodTier}.png`;
            const rodSprite = assetManager.getImage(rodSpriteKey);
            
            if (rodSprite) {
                const iconSize = 85;
                ctx.drawImage(rodSprite, detailsX + detailsWidth / 2 - iconSize/2, detailsY + 50 - iconSize/2, iconSize, iconSize);
            } else {
                ctx.font = fontManager.getFont(68, 'normal');
                ctx.textAlign = 'center';
                ctx.fillText(item.emoji || '📦', detailsX + detailsWidth / 2, detailsY + 50);
            }
        } else if (this.currentType === 'reel') {
            const reelTier = item.tier;
            const reelSpriteKey = `h${reelTier}.png`;
            const reelSprite = assetManager.getImage(reelSpriteKey);
            
            if (reelSprite) {
                const iconSize = 85;
                ctx.drawImage(reelSprite, detailsX + detailsWidth / 2 - iconSize/2, detailsY + 50 - iconSize/2, iconSize, iconSize);
            } else {
                ctx.font = fontManager.getFont(68, 'normal');
                ctx.textAlign = 'center';
                ctx.fillText(item.emoji || '📦', detailsX + detailsWidth / 2, detailsY + 50);
            }
        } else if (this.currentType === 'bait') {
            // Для наживок используем спрайты n1.png - n21.png
            const baitId = item.id;
            const baitSpriteKey = `n${baitId}.png`;
            const baitSprite = assetManager.getImage(baitSpriteKey);
            
            if (baitSprite) {
                const iconSize = 85;
                ctx.drawImage(baitSprite, detailsX + detailsWidth / 2 - iconSize/2, detailsY + 50 - iconSize/2, iconSize, iconSize);
            } else {
                ctx.font = fontManager.getFont(68, 'normal');
                ctx.textAlign = 'center';
                ctx.fillText(item.emoji || '📦', detailsX + detailsWidth / 2, detailsY + 50);
            }
        } else {
            // Для остальных снастей используем смайлики
            ctx.font = fontManager.getFont(80, 'normal');
            ctx.textAlign = 'center';
            ctx.fillText(item.emoji || '📦', detailsX + detailsWidth / 2, detailsY + 50);
        }
        
        // Название
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(26); // Увеличено
        ctx.textAlign = 'center';
        
        // Получаем переведенное название
        let itemName = item.name || `${L('gear_level', 'Уровень')} ${item.tier}`;
        if (this.currentType === 'bait' && window.localizationSystem) {
            itemName = window.localizationSystem.getBaitName(item.id, item.name);
        } else if (this.currentType !== 'bait' && item.tier && window.GearDB) {
            itemName = window.GearDB.getLocalizedGearName(this.currentType, item.tier, item.name);
        }
        ctx.fillText(itemName, detailsX + detailsWidth / 2, detailsY + 95);
        
        // Получаем переведенное описание
        let itemDescription = item.description;
        if (this.currentType !== 'bait' && item.tier && window.GearDB) {
            itemDescription = window.GearDB.getLocalizedGearDescription(this.currentType, item.tier, item.description);
        }
        
        // Характеристики
        ctx.font = fontManager.getFont(18, 'normal'); // Увеличено
        ctx.textAlign = 'left';
        ctx.fillStyle = '#bdc3c7';
        
        let statsY = detailsY + 130;
        const statsX = detailsX + 20;
        const lineHeight = 28; // Увеличено
        
        // Рендер характеристик в зависимости от типа
        const stats = this.getItemStats(item);
        stats.forEach(stat => {
            ctx.fillStyle = stat.color || '#bdc3c7';
            ctx.fillText(`${stat.label}: ${stat.value}`, statsX, statsY);
            statsY += lineHeight;
        });
        
        // Описание
        if (itemDescription) {
            ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
            ctx.font = fontManager.getFont(18, 'normal'); // Увеличено до 18
            
            const words = itemDescription.split(' ');
            let line = '';
            let descY = statsY + 15;
            const maxWidth = detailsWidth - 40;
            
            words.forEach(word => {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && line !== '') {
                    ctx.fillText(line.trim(), statsX, descY);
                    line = word + ' ';
                    descY += 24; // Увеличено
                } else {
                    line = testLine;
                }
            });
            
            if (line.trim()) {
                ctx.fillText(line.trim(), statsX, descY);
            }
        }
        
        ctx.restore();
        
        // Кнопка установки
        this.renderEquipButton(ctx, item);
    }
    
    getItemStats(item) {
        const stats = [];
        
        if (this.currentType === 'bait') {
            stats.push({ label: L('gear_quantity', 'Количество'), value: item.count, color: '#f1c40f' });
            
            // Получаем переведенный тип наживки
            const baitType = window.localizationSystem ? 
                window.localizationSystem.getBaitType(item.id, item.type) : 
                (item.type || L('gear_type_universal', 'Универсальная'));
            stats.push({ label: L('gear_type', 'Тип'), value: baitType });
            
            // Получаем переведенные цели наживки
            const baitTargets = window.localizationSystem ? 
                window.localizationSystem.getBaitTargets(item.id, item.targets) : 
                (item.targets || L('gear_target_various', 'Разная рыба'));
            stats.push({ label: L('gear_target', 'Цель'), value: baitTargets });
            
            if (item.unlockTier) {
                stats.push({ label: L('gear_unlock', 'Разблокировка'), value: `${L('gear_level', 'Уровень')} ${item.unlockTier}` });
            }
        } else {
            stats.push({ label: L('gear_level', 'Уровень'), value: item.tier, color: '#f1c40f' });
            
            // Прочность
            if (item.durability !== undefined) {
                const durPercent = Math.round((item.durability / item.maxDurability) * 100);
                const durColor = durPercent > 50 ? '#2ecc71' : durPercent > 25 ? '#f1c40f' : '#e74c3c';
                stats.push({ 
                    label: L('gear_durability', 'Прочность'), 
                    value: `${Math.round(item.durability)}/${item.maxDurability} (${durPercent}%)`,
                    color: durColor
                });
            }
            
            // Специфичные характеристики
            switch (this.currentType) {
                case 'rod':
                    stats.push({ label: L('gear_power', 'Мощность'), value: item.powerCap });
                    stats.push({ label: L('gear_accuracy', 'Точность'), value: item.accuracy });
                    stats.push({ label: L('gear_hook_bonus', 'Бонус подсечки'), value: `+${item.hookWindowBonus}` });
                    stats.push({ label: L('gear_cast_bonus', 'Бонус заброса'), value: `+${item.castBonus}` });
                    break;
                case 'line':
                    stats.push({ label: L('gear_test_kg', 'Тест (кг)'), value: item.testKg });
                    stats.push({ label: L('gear_resistance', 'Устойчивость'), value: item.abrasionResist });
                    
                    // Локализуем тип лески
                    let lineType = item.type || 'Моно';
                    let lineTypeKey = 'gear_type_mono';
                    
                    if (lineType === 'Моно') {
                        lineTypeKey = 'gear_type_mono';
                    } else if (lineType === 'Флюр/Моно') {
                        lineTypeKey = 'gear_type_fluoro_mono';
                    } else if (lineType === 'Плетёнка') {
                        lineTypeKey = 'gear_type_braid';
                    }
                    
                    stats.push({ label: L('gear_type', 'Тип'), value: L(lineTypeKey, lineType) });
                    break;
                case 'float':
                    stats.push({ label: L('gear_sensitivity', 'Чувствительность'), value: item.sensitivity });
                    stats.push({ label: L('gear_stability', 'Стабильность'), value: item.stability });
                    break;
                case 'hook':
                    stats.push({ label: L('gear_hold', 'Удержание'), value: item.holdBonus });
                    stats.push({ label: L('gear_penetration', 'Проникновение'), value: item.penetration });
                    stats.push({ label: L('hook_size', 'Размер'), value: `#${item.hookSize}` });
                    break;
                case 'reel':
                    stats.push({ label: L('gear_drag_kg', 'Фрикцион (кг)'), value: item.dragKg });
                    stats.push({ label: L('gear_speed', 'Скорость'), value: item.retrieveSpeed });
                    stats.push({ label: L('gear_smoothness', 'Плавность'), value: item.smoothness });
                    break;
            }
            
            // Цена
            if (item.price) {
                stats.push({ label: L('gear_price', 'Цена'), value: `${item.price} 💰` });
            }
        }
        
        return stats;
    }

    
    renderEquipButton(ctx, item) {
        // Не показываем кнопку если уже установлено
        if (item.isEquipped) {
            ctx.save();
            ctx.fillStyle = '#2ecc71';
            ctx.font = fontManager.getFont(20); // Увеличено
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L('gear_equipped', '✓ Установлено'), this.equipButton.x + this.equipButton.width / 2, this.equipButton.y + this.equipButton.height / 2);
            ctx.restore();
            return;
        }
        
        // Проверяем можно ли установить
        let canEquip = true;
        let reason = '';
        
        if (this.currentType === 'bait' && item.count <= 0) {
            canEquip = false;
            reason = L('gear_modal_no_baits', 'Нет наживок');
        } else if (this.currentType !== 'bait' && item.durability <= 0) {
            canEquip = false;
            reason = L('gear_modal_broken', 'Сломано');
        }
        
        ctx.save();
        
        // Фон кнопки
        if (canEquip) {
            const gradient = ctx.createLinearGradient(
                this.equipButton.x, this.equipButton.y,
                this.equipButton.x, this.equipButton.y + this.equipButton.height
            );
            gradient.addColorStop(0, '#27ae60');
            gradient.addColorStop(1, '#1e8449');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = '#7f8c8d';
        }
        
        ctx.beginPath();
        ctx.roundRect(
            this.equipButton.x, this.equipButton.y,
            this.equipButton.width, this.equipButton.height, 8
        );
        ctx.fill();
        
        // Обводка
        ctx.strokeStyle = canEquip ? '#2ecc71' : '#95a5a6';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Текст
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20); // Увеличено
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const text = canEquip ? L('gear_modal_equip', 'Установить') : reason;
        ctx.fillText(text, this.equipButton.x + this.equipButton.width / 2, this.equipButton.y + this.equipButton.height / 2);
        
        ctx.restore();
    }
    
    renderCloseButton(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.9; // 90% прозрачность
        
        // Используем спрайт zak.png (увеличен в 2 раза)
        const zakImage = assetManager.getImage('zak.png');
        if (zakImage) {
            const size = this.closeButton.size * 2; // Увеличиваем в 2 раза
            ctx.drawImage(zakImage, this.closeButton.x - size/2, this.closeButton.y - size/2, size, size);
        } else {
            // Fallback - обычный крестик если спрайт не загружен
            ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
            ctx.beginPath();
            ctx.arc(this.closeButton.x, this.closeButton.y, this.closeButton.size, 0, Math.PI * 2); // Увеличиваем радиус в 2 раза
            ctx.fill();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            
            const offset = this.closeButton.size / 2; // Увеличиваем offset
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
        
        // Клик на элемент списка
        const clickedIndex = this.getClickedItemIndex(x, y);
        if (clickedIndex !== -1) {
            this.selectedIndex = clickedIndex;
            return true;
        }
        
        // Клик на кнопку установки
        if (this.isEquipButtonClicked(x, y)) {
            this.equipSelected();
            return true;
        }
        
        return true;
    }
    
    // Обработка скролла
    handleScroll(deltaY) {
        if (!this.visible) return false;
        
        const maxScroll = Math.max(0, this.items.length - this.maxVisibleItems);
        this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset + deltaY * 0.5));
        
        return true;
    }
    
    isInsideModal(x, y) {
        return x >= this.modalX && x <= this.modalX + this.modalWidth &&
               y >= this.modalY && y <= this.modalY + this.modalHeight;
    }
    
    isCloseButtonClicked(x, y) {
        // Увеличенная область клика в 2 раза
        const dx = x - this.closeButton.x;
        const dy = y - this.closeButton.y;
        return Math.sqrt(dx * dx + dy * dy) < this.closeButton.size; // Увеличиваем область клика в 2 раза
    }
    
    isEquipButtonClicked(x, y) {
        return x >= this.equipButton.x && x <= this.equipButton.x + this.equipButton.width &&
               y >= this.equipButton.y && y <= this.equipButton.y + this.equipButton.height;
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
    
    // Установить выбранную снасть
    equipSelected() {
        if (this.selectedIndex < 0 || this.selectedIndex >= this.items.length) return;
        
        const item = this.items[this.selectedIndex];
        
        // Проверки
        if (item.isEquipped) return;
        
        if (this.currentType === 'bait') {
            if (item.count <= 0) return;
            this.inventory.equipBait(item.id);
        } else {
            if (item.durability <= 0) return;
            this.inventory.equipGear(this.currentType, item.tier);
        }
        
        // Обновляем список
        this.loadItems();
        
        // Вызываем callback если есть
        if (this.onEquip) {
            this.onEquip(this.currentType, item);
        }
    }
    
    // Callback при установке снасти
    onEquip = null;
}
