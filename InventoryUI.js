// UI инвентаря
class InventoryUI {
    constructor(canvas, gearInventory, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        this.inventory = gearInventory;
        
        // Состояние
        this.visible = false;
        this.animProgress = 0;
        this.currentTab = 'keepnet'; // keepnet, rods, lines, floats, hooks, reels, baits
        
        // Вкладки инвентаря
        this.tabs = [
            { id: 'rods', name: L('rods_tab', 'Удочки'), icon: '' },
            { id: 'lines', name: L('lines_tab', 'Лески'), icon: '' },
            { id: 'floats', name: L('floats_tab', 'Поплавки'), icon: '' },
            { id: 'hooks', name: L('hooks_tab', 'Крючки'), icon: '' },
            { id: 'reels', name: L('reels_tab', 'Катушки'), icon: '' },
            { id: 'baits', name: L('baits_tab', 'Наживки'), icon: '' },
            { id: 'keepnet', name: L('keepnet_tab', 'Садок'), icon: '' }
        ];
        
        // Список предметов
        this.items = [];
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.maxVisibleItems = 5.5;
        
        // Размеры окна
        this.modalWidth = 1200;
        this.modalHeight = 696;
        this.modalX = 0;
        this.modalY = 0;
        
        // Размеры списка
        this.listWidth = 380;
        this.listItemHeight = 85;
        
        // Кнопки
        this.equipButton = { x: 0, y: 0, width: 200, height: 60, visible: false, scale: 1.0, targetScale: 1.0 };
        this.repairButton = { x: 0, y: 0, width: 200, height: 60, visible: false, scale: 1.0, targetScale: 1.0 };
        this.sellButton = { x: 0, y: 0, width: 200, height: 60, visible: false, scale: 1.0, targetScale: 1.0 };
        this.upgradeButton = { x: 0, y: 0, width: 250, height: 60, visible: false, scale: 1.0, targetScale: 1.0 };
        this.fishListButton = { x: 0, y: 0, width: 200, height: 60, visible: false };
        this.closeButton = { x: 0, y: 0, size: 42 };
        
        // Модальное окно списка рыб
        this.fishListModal = {
            visible: false,
            fish: [],
            scrollOffset: 0,
            maxVisible: 8,
            // Перетаскивание для скролла
            isDragging: false,
            dragStartY: 0,
            dragStartScroll: 0,
            dragVelocity: 0,
            lastDragY: 0,
            lastDragTime: 0
        };
        
        // Анимация продажи
        this.sellAnimation = { active: false, progress: 0, coins: 0, x: 0, y: 0 };
        
        // Перетаскивание для скролла списка предметов
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartScroll = 0;
        this.dragVelocity = 0;
        this.lastDragY = 0;
        this.lastDragTime = 0;
        
        // Деньги игрока
        this.playerCoins = 0;
        
        // Садок
        this.keepnetCapacity = 10; // Начальная вместимость
        this.keepnetUpgradeLevel = 0; // Уровень улучшения
        
        this.updatePositions();
    }
    
    // Обновить тексты вкладок после смены языка
    updateTabLabels() {
        this.tabs[0].name = L('rods_tab', 'Удочки');
        this.tabs[1].name = L('lines_tab', 'Лески');
        this.tabs[2].name = L('floats_tab', 'Поплавки');
        this.tabs[3].name = L('hooks_tab', 'Крючки');
        this.tabs[4].name = L('reels_tab', 'Катушки');
        this.tabs[5].name = L('baits_tab', 'Наживки');
        this.tabs[6].name = L('keepnet_tab', 'Садок');
        
        // Перезагружаем предметы чтобы обновить их названия
        this.loadItems();
    }
    
    updatePositions() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.modalX = (w - this.modalWidth) / 2;
        this.modalY = (h - this.modalHeight) / 2;
        
        // Кнопка закрытия (в углу с отступом)
        this.closeButton.x = this.modalX + this.modalWidth - 15;
        this.closeButton.y = this.modalY + 30;
        
        // Кнопки в панели деталей
        const detailsX = this.modalX + this.listWidth + 40;
        const detailsWidth = this.modalWidth - this.listWidth - 60;
        
        this.fishListButton.x = detailsX + 20;
        this.fishListButton.y = this.modalY + this.modalHeight - 80;
        
        this.equipButton.x = detailsX + detailsWidth - this.equipButton.width - 20;
        this.equipButton.y = this.modalY + this.modalHeight - 80;
        
        this.repairButton.x = detailsX + detailsWidth / 2 - this.repairButton.width / 2;
        this.repairButton.y = this.modalY + this.modalHeight - 80;
        
        this.sellButton.x = detailsX + detailsWidth / 2 - this.sellButton.width / 2;
        this.sellButton.y = this.modalY + this.modalHeight - 80;
        
        this.upgradeButton.x = detailsX + detailsWidth - this.upgradeButton.width - 20;
        this.upgradeButton.y = this.modalY + this.modalHeight - 80;
    }
    
    show(playerCoins = 0, keepnetCapacity = 10, keepnetUpgradeLevel = 0) {
        this.visible = true;
        this.playerCoins = playerCoins;
        this.keepnetCapacity = keepnetCapacity;
        this.keepnetUpgradeLevel = keepnetUpgradeLevel;
        this.currentTab = 'rods';
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.updateTabLabels(); // Обновляем названия вкладок при открытии
        this.loadItems();
        this.updatePositions();
    }
    
    hide() {
        this.visible = false;
        this.items = [];
        this.fishListModal.visible = false;
    }
    
    // Загрузить предметы текущей вкладки
    loadItems() {
        this.items = [];
        
        if (this.currentTab === 'keepnet') {
            // Садок - показываем информацию об улучшении
            this.items = [{
                id: 'keepnet',
                name: L('keepnet_name', 'Садок'),
                capacity: this.keepnetCapacity,
                upgradeLevel: this.keepnetUpgradeLevel,
                nextCapacity: this.keepnetCapacity + 3,
                upgradePrice: this.calculateKeepnetUpgradePrice(),
                emoji: '🎣',
                description: L('keepnet_desc', 'Садок для хранения пойманной рыбы. Улучшайте вместимость за деньги.')
            }];
        } else if (this.currentTab === 'baits') {
            // Наживки из инвентаря
            const baits = this.inventory.getBaits ? this.inventory.getBaits() : [];
            this.items = baits.map(bait => ({
                ...bait,
                isEquipped: this.inventory.equipped.bait === bait.id,
                itemCategory: 'bait' // Используем itemCategory вместо type, чтобы не перезаписывать тип наживки
            }));
        } else if (this.currentTab === 'rods') {
            // Удочки из инвентаря
            const rods = this.inventory.getRods();
            this.items = rods.map(rod => ({
                ...rod,
                isEquipped: this.inventory.equipped.rod === rod.tier,
                type: 'rod'
            }));
        } else if (this.currentTab === 'lines') {
            // Лески из инвентаря
            const lines = this.inventory.getLines();
            this.items = lines.map(line => ({
                ...line,
                isEquipped: this.inventory.equipped.line === line.tier,
                type: 'line'
            }));
        } else if (this.currentTab === 'floats') {
            // Поплавки из инвентаря
            const floats = this.inventory.getFloats();
            this.items = floats.map(float => ({
                ...float,
                isEquipped: this.inventory.equipped.float === float.tier,
                type: 'float'
            }));
        } else if (this.currentTab === 'hooks') {
            // Крючки из инвентаря
            const hooks = this.inventory.getHooks();
            this.items = hooks.map(hook => ({
                ...hook,
                isEquipped: this.inventory.equipped.hook === hook.tier,
                type: 'hook'
            }));
        } else if (this.currentTab === 'reels') {
            // Катушки из инвентаря
            const reels = this.inventory.getReels();
            this.items = reels.map(reel => ({
                ...reel,
                isEquipped: this.inventory.equipped.reel === reel.tier,
                type: 'reel'
            }));
        }
    }
    
    calculateKeepnetUpgradePrice() {
        // Прогрессивная цена: 200 * (уровень + 1)^1.8
        return Math.floor(200 * Math.pow(this.keepnetUpgradeLevel + 1, 1.8));
    }
    
    calculateRepairPrice(item) {
        // Цена ремонта = (макс. прочность - текущая прочность) * 2.4 (увеличено на 20%)
        const maxDurability = item.maxDurability || item.durability;
        const currentDurability = item.durability || maxDurability;
        const damage = maxDurability - currentDurability;
        return Math.ceil(damage * 2.4);
    }
    
    calculateSellPrice(item) {
        // Цена продажи = базовая цена * 0.3 * (текущая прочность / макс. прочность)
        // Минимум 10% от базовой цены
        const basePrice = item.price || 100;
        const maxDurability = item.maxDurability || item.durability;
        const currentDurability = item.durability || maxDurability;
        const durabilityRatio = currentDurability / maxDurability;
        const sellPrice = Math.floor(basePrice * 0.3 * durabilityRatio);
        return Math.max(sellPrice, Math.floor(basePrice * 0.1));
    }
    
    translateBaitType(type) {
        // Перевод типов наживок с английского на русский
        const translations = {
            'bait': 'Наживка',
            'bread': 'Хлеб',
            'worm': 'Червь',
            'dough': 'Тесто',
            'corn': 'Кукуруза',
            'maggot': 'Опарыш',
            'boilie': 'Бойл',
            'pellet': 'Пеллетс',
            'lure': 'Приманка',
            'spoon': 'Блесна',
            'jig': 'Джиг',
            'wobbler': 'Воблер'
        };
        
        return translations[type] || type || 'Наживка';
    }
    
    update(dt) {
        const targetProgress = this.visible ? 1 : 0;
        this.animProgress += (targetProgress - this.animProgress) * dt * 10;
        
        if (!this.visible && this.animProgress < 0.01) {
            this.animProgress = 0;
        }
        
        // Анимация масштаба кнопок (плавное возвращение)
        this.equipButton.scale += (this.equipButton.targetScale - this.equipButton.scale) * dt * 15;
        this.repairButton.scale += (this.repairButton.targetScale - this.repairButton.scale) * dt * 15;
        this.sellButton.scale += (this.sellButton.targetScale - this.sellButton.scale) * dt * 15;
        this.upgradeButton.scale += (this.upgradeButton.targetScale - this.upgradeButton.scale) * dt * 15;
        
        // Анимация продажи
        if (this.sellAnimation.active) {
            this.sellAnimation.progress += dt * 2;
            if (this.sellAnimation.progress >= 1) {
                this.sellAnimation.active = false;
                this.sellAnimation.progress = 0;
            }
        }
        
        // Инерция скролла в модальном окне списка рыб
        if (this.fishListModal.visible && !this.fishListModal.isDragging && Math.abs(this.fishListModal.dragVelocity) > 0.1) {
            this.fishListModal.scrollOffset += this.fishListModal.dragVelocity * dt * 60;
            this.fishListModal.dragVelocity *= 0.92; // Затухание
            
            // Ограничение скролла
            const maxScroll = Math.max(0, this.fishListModal.fish.length - this.fishListModal.maxVisible);
            this.fishListModal.scrollOffset = Math.max(0, Math.min(maxScroll, this.fishListModal.scrollOffset));
            
            if (Math.abs(this.fishListModal.dragVelocity) < 0.1) {
                this.fishListModal.dragVelocity = 0;
            }
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
        
        // Вкладки
        this.renderTabs(ctx);
        
        // Список предметов (слева)
        this.renderItemList(ctx);
        
        // Информация о выбранном предмете (справа)
        this.renderItemDetails(ctx);
        
        // Кнопка закрытия
        this.renderCloseButton(ctx);
        
        // Анимация продажи
        this.renderSellAnimation(ctx);
        
        ctx.restore();
        
        // Модальное окно списка рыб (поверх всего)
        if (this.fishListModal.visible) {
            this.renderFishListModal(ctx);
        }
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
            gradient.addColorStop(0, '#34495e');
            gradient.addColorStop(1, '#2c3e50');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(this.modalX, this.modalY, this.modalWidth, this.modalHeight, 16);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    renderHeader(ctx) {
        ctx.save();
        
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(38);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L('inventory', 'ИНВЕНТАРЬ'), this.modalX + this.modalWidth / 2, this.modalY + 40);
        
        // Валюты справа от названия (как в главном меню)
        const coins = this.playerCoins;
        const gems = window.profileSystem ? window.profileSystem.getGems() : 0;
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        const iconSize = 36;
        const iconTextGap = 5;
        
        // Обычные монеты со спрайтом sereb.png
        ctx.font = fontManager.getFont(18, 'bold');
        ctx.textAlign = 'right';
        const coinsX = this.modalX + this.modalWidth - 80; // Сдвинуто левее на 30px
        const coinsY = this.modalY + 40;
        
        // Рисуем текст монет: белый текст с черной обводкой
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${coins}`, coinsX, coinsY);
        ctx.fillStyle = '#fff';
        ctx.fillText(`${coins}`, coinsX, coinsY);
        
        // Рисуем иконку монет слева от текста
        const coinImage = assetManager.getImage('sereb.png');
        if (coinImage) {
            const textWidth = ctx.measureText(`${coins}`).width;
            ctx.drawImage(coinImage, coinsX - textWidth - iconSize - iconTextGap, coinsY - iconSize / 2, iconSize, iconSize);
        }
        
        // Премиум валюта со спрайтом mark.png
        const gemsX = this.modalX + this.modalWidth - 220; // Сдвинуто левее на 30px
        const gemsY = this.modalY + 40;
        
        // Рисуем текст гемов: золотой текст с черной обводкой
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${gems}`, gemsX, gemsY);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`${gems}`, gemsX, gemsY);
        
        // Рисуем иконку гемов слева от текста
        const gemImage = assetManager.getImage('mark.png');
        if (gemImage) {
            const textWidth = ctx.measureText(`${gems}`).width;
            ctx.drawImage(gemImage, gemsX - textWidth - iconSize - iconTextGap, gemsY - iconSize / 2, iconSize, iconSize);
        }
        
        ctx.restore();
    }
    
    renderTabs(ctx) {
        const tabY = this.modalY + 75;
        const tabHeight = 45;
        const tabWidth = 155;
        const spacing = 8;
        const startX = this.modalX + 31; // Сдвинуто вправо на 6px
        
        ctx.save();
        
        // Получаем изображение uipan.png
        const uipanImage = assetManager.getImage('uipan.png');
        
        this.tabs.forEach((tab, index) => {
            const x = startX + index * (tabWidth + spacing);
            const isActive = tab.id === this.currentTab;
            
            // Рисуем фон вкладки используя uipan.png
            if (uipanImage) {
                ctx.drawImage(
                    uipanImage,
                    x, tabY,
                    tabWidth, tabHeight
                );
            } else {
                // Fallback - обычный фон если изображение не загружено
                if (isActive) {
                    ctx.fillStyle = '#e67e22';
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                }
                
                ctx.beginPath();
                ctx.roundRect(x, tabY, tabWidth, tabHeight, 8);
                ctx.fill();
            }
            
            // Обводка для активной вкладки
            if (isActive) {
                ctx.strokeStyle = '#d35400';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(x, tabY, tabWidth, tabHeight, 8);
                ctx.stroke();
            }
            
            // Текст (без смайликов)
            ctx.fillStyle = '#fff';
            ctx.font = fontManager.getFont(24);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Черная обводка текста
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeText(tab.name, x + tabWidth / 2, tabY + tabHeight / 2);
            
            // Белый текст поверх обводки
            ctx.fillText(tab.name, x + tabWidth / 2, tabY + tabHeight / 2);
        });
        
        ctx.restore();
    }
    
    renderItemList(ctx) {
        const listX = this.modalX + 25;
        const listY = this.modalY + 135;
        const listHeight = this.modalHeight - 160;
        
        ctx.save();
        
        // Фон списка
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(listX, listY, this.listWidth, listHeight, 8);
        ctx.fill();
        
        // Обрезка для скролла
        ctx.save();
        ctx.beginPath();
        ctx.rect(listX, listY, this.listWidth, listHeight);
        ctx.clip();
        
        // Рендер элементов
        const visibleStart = Math.floor(this.scrollOffset);
        const visibleEnd = Math.min(this.items.length, visibleStart + this.maxVisibleItems + 2);
        
        for (let i = visibleStart; i < visibleEnd; i++) {
            const item = this.items[i];
            const itemY = listY + (i - this.scrollOffset) * this.listItemHeight + 8;
            
            this.renderListItem(ctx, item, i, listX + 8, itemY);
        }
        
        ctx.restore();
        ctx.restore();
        
        // Скроллбар
        if (this.items.length > this.maxVisibleItems) {
            this.renderScrollbar(ctx, listX + this.listWidth - 15, listY + 8, 10, listHeight - 16);
        }
    }
    
    renderListItem(ctx, item, index, x, y) {
        const width = this.listWidth - 25;
        const height = this.listItemHeight - 8;
        const isSelected = index === this.selectedIndex;
        
        ctx.save();
        
        // Фон элемента
        if (isSelected) {
            ctx.fillStyle = 'rgba(230, 126, 34, 0.4)';
        } else if (item.isEquipped) {
            ctx.fillStyle = 'rgba(46, 204, 113, 0.2)';
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        }
        
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 6);
        ctx.fill();
        
        // Обводка для выбранного или экипированного
        if (isSelected) {
            ctx.strokeStyle = '#e67e22';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (item.isEquipped) {
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Иконка
        const iconSize = 50;
        const iconX = x + 40;
        const iconY = y + height / 2;
        
        const assetType = this.currentTab === 'keepnet' ? 'keepnet' :
                         this.currentTab === 'rods' ? 'rod' :
                         this.currentTab === 'lines' ? 'line' :
                         this.currentTab === 'floats' ? 'float' :
                         this.currentTab === 'hooks' ? 'hook' :
                         this.currentTab === 'reels' ? 'reel' :
                         this.currentTab === 'baits' ? 'bait' : 'keepnet';
        const defaultEmoji = item.emoji || '🎣';
        const itemId = item.tier || item.id;
        
        // Для поплавков, лесок и крючков используем спрайты напрямую
        if (this.currentTab === 'floats') {
            const floatTier = item.tier;
            const floatSpriteKey = `float_${String(floatTier).padStart(2, '0')}.png`;
            const floatSprite = assetManager.getImage(floatSpriteKey);
            
            if (floatSprite) {
                ctx.drawImage(floatSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = `${iconSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(defaultEmoji, iconX, iconY);
            }
        } else if (this.currentTab === 'lines') {
            const lineTier = item.tier;
            const lineSpriteKey = `l_${lineTier}.png`;
            const lineSprite = assetManager.getImage(lineSpriteKey);
            
            if (lineSprite) {
                ctx.drawImage(lineSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = `${iconSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(defaultEmoji, iconX, iconY);
            }
        } else if (this.currentTab === 'hooks') {
            const hookTier = item.tier;
            const hookSpriteKey = `k_${hookTier}.png`;
            const hookSprite = assetManager.getImage(hookSpriteKey);
            
            if (hookSprite) {
                ctx.drawImage(hookSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = `${iconSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(defaultEmoji, iconX, iconY);
            }
        } else if (this.currentTab === 'rods') {
            const rodTier = item.tier;
            const rodSpriteKey = `u${rodTier}.png`;
            const rodSprite = assetManager.getImage(rodSpriteKey);
            
            if (rodSprite) {
                ctx.drawImage(rodSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = `${iconSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(defaultEmoji, iconX, iconY);
            }
        } else if (this.currentTab === 'reels') {
            const reelTier = item.tier;
            const reelSpriteKey = `h${reelTier}.png`;
            const reelSprite = assetManager.getImage(reelSpriteKey);
            
            if (reelSprite) {
                ctx.drawImage(reelSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = `${iconSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(defaultEmoji, iconX, iconY);
            }
        } else if (this.currentTab === 'keepnet') {
            // Садок - используем спрайт sadok.png
            const keepnetSprite = assetManager.getImage('sadok.png');
            
            if (keepnetSprite) {
                ctx.drawImage(keepnetSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = `${iconSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(defaultEmoji, iconX, iconY);
            }
        } else {
            // Для остальных используем стандартный метод
            assetManager.drawImageOrEmoji(
                ctx, assetType, itemId,
                iconX, iconY, iconSize,
                defaultEmoji
            );
        }
        
        // Название
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(18);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Получаем локализованное название для снастей и наживок
        let name = item.name || `Предмет ${item.id}`;
        if (this.currentTab === 'baits' && window.localizationSystem) {
            // Для наживок используем локализацию
            name = window.localizationSystem.getBaitName(item.id, item.name);
        } else if (item.type && item.tier && window.GearDB) {
            // Для снастей используем GearDB
            name = window.GearDB.getLocalizedGearName(item.type, item.tier, item.name);
        }
        const displayName = name.length > 24 ? name.substring(0, 22) + '...' : name;
        ctx.fillText(displayName, x + 80, y + 12);
        
        // Дополнительная информация
        if (this.currentTab === 'keepnet') {
            ctx.fillStyle = '#3498db';
            ctx.font = fontManager.getFont(17);
            ctx.fillText(`${L('capacity', 'Вместимость')}: ${item.capacity}`, x + 80, y + 38);
        } else if (this.currentTab === 'baits') {
            // Для наживок показываем тип (локализованный)
            const baitType = window.localizationSystem ? 
                window.localizationSystem.getBaitType(item.id, item.type) : 
                this.translateBaitType(item.type);
            ctx.fillStyle = '#9b59b6';
            ctx.font = fontManager.getFont(17);
            ctx.fillText(`${L('type', 'Тип')}: ${baitType}`, x + 80, y + 38);
            
            // Количество - только если не экипировано (чтобы не перекрывалось)
            if (item.quantity !== undefined && !item.isEquipped) {
                ctx.fillStyle = '#3498db';
                ctx.fillText(`${L('quantity', 'Количество')}: ${item.quantity}`, x + 80, y + 58);
            }
        } else {
            // Прочность
            const maxDurability = item.maxDurability || item.durability;
            const currentDurability = item.durability || maxDurability;
            const durabilityPercent = (currentDurability / maxDurability) * 100;
            
            let durabilityColor = '#2ecc71';
            if (durabilityPercent < 30) durabilityColor = '#e74c3c';
            else if (durabilityPercent < 60) durabilityColor = '#f39c12';
            
            ctx.fillStyle = durabilityColor;
            ctx.font = fontManager.getFont(17);
            ctx.fillText(`${L('shop_durability', 'Прочность')}: ${Math.floor(currentDurability)}/${maxDurability}`, x + 80, y + 38);
        }
        
        // Статус экипировки
        if (item.isEquipped) {
            ctx.fillStyle = '#2ecc71';
            ctx.font = fontManager.getFont(15, 'normal');
            ctx.fillText(L('gear_equipped', '✓ Установлено'), x + 80, y + 58);
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
        const detailsX = this.modalX + this.listWidth + 50;
        const detailsY = this.modalY + 135;
        const detailsWidth = this.modalWidth - this.listWidth - 75;
        const detailsHeight = this.modalHeight - 160;
        
        ctx.save();
        
        // Фон панели деталей
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.roundRect(detailsX, detailsY, detailsWidth, detailsHeight, 8);
        ctx.fill();
        
        if (this.selectedIndex < 0 || this.selectedIndex >= this.items.length) {
            // Нет выбранного элемента
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = fontManager.getFont(20, 'normal');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L('select_item', 'Выберите предмет'), detailsX + detailsWidth / 2, detailsY + detailsHeight / 2);
            ctx.restore();
            return;
        }
        
        const item = this.items[this.selectedIndex];
        
        // Иконка большая (увеличено на 60% для спрайтов рыб)
        const iconSize = 160; // 100 * 1.6 = 160
        const iconX = detailsX + detailsWidth / 2;
        const iconY = detailsY + 70;
        
        const assetType = this.currentTab === 'keepnet' ? 'keepnet' :
                         this.currentTab === 'rods' ? 'rod' :
                         this.currentTab === 'lines' ? 'line' :
                         this.currentTab === 'floats' ? 'float' :
                         this.currentTab === 'hooks' ? 'hook' :
                         this.currentTab === 'reels' ? 'reel' :
                         this.currentTab === 'baits' ? 'bait' : 'keepnet';
        const defaultEmoji = item.emoji || '🎣';
        const itemId = item.tier || item.id;
        
        // Для поплавков, лесок и крючков используем спрайты напрямую
        if (this.currentTab === 'floats') {
            const floatTier = item.tier;
            const floatSpriteKey = `float_${String(floatTier).padStart(2, '0')}.png`;
            const floatSprite = assetManager.getImage(floatSpriteKey);
            
            if (floatSprite) {
                ctx.drawImage(floatSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = `${iconSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(defaultEmoji, iconX, iconY);
            }
        } else if (this.currentTab === 'lines') {
            const lineTier = item.tier;
            const lineSpriteKey = `l_${lineTier}.png`;
            const lineSprite = assetManager.getImage(lineSpriteKey);
            
            if (lineSprite) {
                ctx.drawImage(lineSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = `${iconSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(defaultEmoji, iconX, iconY);
            }
        } else if (this.currentTab === 'hooks') {
            const hookTier = item.tier;
            const hookSpriteKey = `k_${hookTier}.png`;
            const hookSprite = assetManager.getImage(hookSpriteKey);
            
            if (hookSprite) {
                ctx.drawImage(hookSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = `${iconSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(defaultEmoji, iconX, iconY);
            }
        } else if (this.currentTab === 'rods') {
            const rodTier = item.tier;
            const rodSpriteKey = `u${rodTier}.png`;
            const rodSprite = assetManager.getImage(rodSpriteKey);
            
            if (rodSprite) {
                ctx.drawImage(rodSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = `${iconSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(defaultEmoji, iconX, iconY);
            }
        } else if (this.currentTab === 'reels') {
            const reelTier = item.tier;
            const reelSpriteKey = `h${reelTier}.png`;
            const reelSprite = assetManager.getImage(reelSpriteKey);
            
            if (reelSprite) {
                ctx.drawImage(reelSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = `${iconSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(defaultEmoji, iconX, iconY);
            }
        } else if (this.currentTab === 'keepnet') {
            // Для садка используем спрайт sadok.png
            const sadokSprite = assetManager.getImage('sadok.png');
            
            if (sadokSprite) {
                ctx.drawImage(sadokSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = `${iconSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(defaultEmoji, iconX, iconY);
            }
        } else {
            // Для остальных используем стандартный метод
            assetManager.drawImageOrEmoji(
                ctx, assetType, itemId,
                iconX, iconY, iconSize,
                defaultEmoji
            );
        }
        
        // Название
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(28);
        ctx.textAlign = 'center';
        // Получаем локализованное название для снастей и наживок
        let itemName = item.name || `Предмет ${item.id}`;
        if (this.currentTab === 'baits' && window.localizationSystem) {
            // Для наживок используем локализацию
            itemName = window.localizationSystem.getBaitName(item.id, item.name);
        } else if (item.type && item.tier && window.GearDB) {
            // Для снастей используем GearDB
            itemName = window.GearDB.getLocalizedGearName(item.type, item.tier, item.name);
        }
        ctx.fillText(itemName, detailsX + detailsWidth / 2, detailsY + 135);
        
        // Характеристики
        ctx.font = fontManager.getFont(18, 'normal');
        ctx.textAlign = 'left';
        ctx.fillStyle = '#bdc3c7';
        
        let statsY = detailsY + 170;
        const statsX = detailsX + 25;
        const lineHeight = 28;
        
        if (this.currentTab === 'keepnet') {
            // Садок
            ctx.fillStyle = '#3498db';
            ctx.fillText(`${L('current_capacity', 'Текущая вместимость')}: ${item.capacity}`, statsX, statsY);
            statsY += lineHeight;
            
            ctx.fillStyle = '#2ecc71';
            ctx.fillText(`${L('next_level', 'Следующий уровень')}: ${item.nextCapacity}`, statsX, statsY);
            statsY += lineHeight;
            
            ctx.fillStyle = '#f39c12';
            assetManager.drawTextWithCoinIcon(ctx, `${L('upgrade_price', 'Цена улучшения')}: ${item.upgradePrice} 💰`, statsX, statsY, 18);
            statsY += lineHeight;
        } else if (this.currentTab === 'baits') {
            // Наживки - показываем информацию (локализованную)
            const baitType = window.localizationSystem ? 
                window.localizationSystem.getBaitType(item.id, item.type) : 
                this.translateBaitType(item.type);
            ctx.fillStyle = '#9b59b6';
            ctx.fillText(`${L('type', 'Тип')}: ${baitType}`, statsX, statsY);
            statsY += lineHeight;
            
            if (item.unlockTier) {
                ctx.fillStyle = '#f39c12';
                ctx.fillText(`${L('unlock_level', 'Уровень разблокировки')}: ${item.unlockTier}`, statsX, statsY);
                statsY += lineHeight;
            }
            
            if (item.role) {
                ctx.fillStyle = '#3498db';
                // Локализуем роль наживки
                const baitRole = window.localizationSystem ? 
                    window.localizationSystem.t(`bait_role_${item.role.toLowerCase().replace(/\s+/g, '_')}`, item.role) : 
                    item.role;
                ctx.fillText(`${L('role', 'Роль')}: ${baitRole}`, statsX, statsY);
                statsY += lineHeight;
            }
            
            if (item.targets) {
                ctx.fillStyle = '#2ecc71';
                // Локализуем цели наживки
                const baitTargets = window.localizationSystem ? 
                    window.localizationSystem.getBaitTargets(item.id, item.targets) : 
                    item.targets;
                ctx.fillText(`${L('targets', 'Цели')}: ${baitTargets}`, statsX, statsY);
                statsY += lineHeight;
            }
            
            if (item.quantity !== undefined) {
                ctx.fillStyle = '#e67e22';
                ctx.fillText(`${L('quantity', 'Количество')}: ${item.quantity}`, statsX, statsY);
                statsY += lineHeight;
            }
            
            // Описание
            if (item.description) {
                statsY += 10;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = fontManager.getFont(20, 'normal'); // Увеличено еще на 10%
                
                // Получаем локализованное описание для наживок
                let description = item.description;
                if (window.localizationSystem) {
                    description = window.localizationSystem.getBaitDescription(item.id, item.description);
                }
                
                const words = description.split(' ');
                let line = '';
                const maxWidth = this.modalWidth - this.listWidth - 125;
                
                words.forEach(word => {
                    const testLine = line + word + ' ';
                    const metrics = ctx.measureText(testLine);
                    
                    if (metrics.width > maxWidth && line !== '') {
                        // Черная обводка
                        ctx.strokeStyle = '#000';
                        ctx.lineWidth = 2;
                        ctx.strokeText(line.trim(), statsX, statsY);
                        // Белый текст поверх
                        ctx.fillText(line.trim(), statsX, statsY);
                        line = word + ' ';
                        statsY += 24; // Увеличено
                    } else {
                        line = testLine;
                    }
                });
                
                if (line.trim()) {
                    // Черная обводка
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.strokeText(line.trim(), statsX, statsY);
                    // Белый текст поверх
                    ctx.fillText(line.trim(), statsX, statsY);
                }
            }
        } else {
            // Снасти - показываем характеристики
            this.renderGearStats(ctx, item, statsX, statsY, lineHeight);
        }
        
        ctx.restore();
        
        // Кнопки
        this.renderActionButtons(ctx, item);
    }
    
    renderGearStats(ctx, item, statsX, statsY, lineHeight) {
        if (this.currentTab === 'rods') {
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`${L('shop_level', 'Уровень')}: ${item.tier}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            ctx.fillText(`${L('ui_power_cap', 'Мощность')}: ${item.powerCap}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillText(`${L('ui_accuracy', 'Точность')}: ${item.accuracy}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillText(`${L('ui_hook_window', 'Окно подсечки')}: +${item.hookWindowBonus}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillText(`${L('ui_cast_bonus', 'Заброс')}: +${item.castBonus}`, statsX, statsY);
            statsY += lineHeight;
            
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(`${L('ui_max_weight', 'Макс. вес')}: ${item.maxWeight} ${L('ui_kg', 'кг')}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
        } else if (this.currentTab === 'lines') {
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`${L('shop_level', 'Уровень')}: ${item.tier}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            ctx.fillStyle = '#3498db';
            ctx.fillText(`${L('shop_type', 'Тип')}: ${item.type}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(`${L('shop_breaking_load', 'Разрывная нагрузка')}: ${item.testKg} ${L('ui_kg', 'кг')}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            ctx.fillText(`${L('ui_abrasion_resist', 'Истирание')}: ${item.abrasionResist}`, statsX, statsY);
            statsY += lineHeight;
        } else if (this.currentTab === 'floats') {
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`${L('shop_level', 'Уровень')}: ${item.tier}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(`${L('ui_sensitivity', 'Чувствительность')}: ${item.sensitivity}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            ctx.fillStyle = '#2ecc71';
            ctx.fillText(`${L('ui_stability', 'Стабильность')}: ${item.stability}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
        } else if (this.currentTab === 'hooks') {
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`${L('shop_level', 'Уровень')}: ${item.tier}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            ctx.fillText(`${L('ui_hold_bonus', 'Удержание')}: +${item.holdBonus}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillText(`${L('ui_penetration', 'Проникновение')}: ${item.penetration}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillText(`${L('hook_size', 'Размер')}: #${item.hookSize}`, statsX, statsY);
            statsY += lineHeight;
            
            ctx.fillStyle = '#3498db';
            ctx.fillText(`${L('ui_max_weight', 'Макс. вес')}: ${item.maxWeight} ${L('ui_kg', 'кг')}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
        } else if (this.currentTab === 'reels') {
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`${L('shop_level', 'Уровень')}: ${item.tier}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            ctx.fillText(`${L('ui_drag_kg', 'Тормоз')}: ${item.dragKg} ${L('ui_kg', 'кг')}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillText(`${L('ui_retrieve_speed', 'Скорость')}: ${item.retrieveSpeed}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillText(`${L('ui_smoothness', 'Плавность')}: ${item.smoothness}`, statsX, statsY);
            statsY += lineHeight;
        }
        
        // Прочность для всех снастей
        const maxDurability = item.maxDurability || item.durability;
        const currentDurability = item.durability || maxDurability;
        const durabilityPercent = (currentDurability / maxDurability) * 100;
        
        let durabilityColor = '#2ecc71';
        if (durabilityPercent < 30) durabilityColor = '#e74c3c';
        else if (durabilityPercent < 60) durabilityColor = '#f39c12';
        
        ctx.fillStyle = durabilityColor;
        ctx.fillText(`${L('shop_durability', 'Прочность')}: ${Math.floor(currentDurability)}/${maxDurability}`, statsX, statsY);
        statsY += lineHeight;
        
        // Описание
        if (item.description) {
            statsY += 10;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = fontManager.getFont(20, 'normal'); // Увеличено еще на 10%
            
            // Получаем локализованное описание для снастей
            let description = item.description;
            if (item.type && item.tier && window.GearDB) {
                description = window.GearDB.getLocalizedGearDescription(item.type, item.tier, item.description);
            }
            
            const words = description.split(' ');
            let line = '';
            const maxWidth = this.modalWidth - this.listWidth - 125;
            
            words.forEach(word => {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && line !== '') {
                    // Черная обводка
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.strokeText(line.trim(), statsX, statsY);
                    // Белый текст поверх
                    ctx.fillText(line.trim(), statsX, statsY);
                    line = word + ' ';
                    statsY += 24; // Увеличено
                } else {
                    line = testLine;
                }
            });
            
            if (line.trim()) {
                // Черная обводка
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeText(line.trim(), statsX, statsY);
                // Белый текст поверх
                ctx.fillText(line.trim(), statsX, statsY);
            }
        }
    }
    
    renderActionButtons(ctx, item) {
        const detailsX = this.modalX + this.listWidth + 40;
        const detailsWidth = this.modalWidth - this.listWidth - 60;
        
        if (this.currentTab === 'keepnet') {
            // Кнопка улучшения садка
            this.renderUpgradeButton(ctx, item);
        } else if (this.currentTab === 'baits') {
            // Кнопка "Виды рыб" для наживок
            this.renderFishListButton(ctx, item);
            // Кнопка экипировки для наживок
            this.renderEquipButton(ctx, item);
        } else {
            // Кнопки экипировки, ремонта и продажи для снастей
            this.renderEquipButton(ctx, item);
            
            if (item.isEquipped) {
                // Если экипировано - показываем ремонт
                this.renderRepairButton(ctx, item);
            } else {
                // Если не экипировано - показываем продажу
                this.renderSellButton(ctx, item);
            }
        }
    }
    
    renderEquipButton(ctx, item) {
        const buttonText = item.isEquipped ? L('unequip', 'Снять') : L('equip', 'Экипировать');
        const buttonColor1 = item.isEquipped ? '#e74c3c' : '#2ecc71';
        const buttonColor2 = item.isEquipped ? '#c0392b' : '#27ae60';
        
        ctx.save();
        
        // Кнопка экипировки всегда справа (координаты установлены в updatePositions)
        const buttonX = this.equipButton.x;
        const buttonY = this.equipButton.y;
        
        // Получаем изображение uipan.png
        const uipanImage = assetManager.getImage('uipan.png');
        
        if (uipanImage) {
            // Рисуем фон кнопки используя uipan.png
            ctx.drawImage(
                uipanImage,
                buttonX, buttonY,
                this.equipButton.width, this.equipButton.height
            );
        } else {
            // Fallback - градиентный фон если изображение не загружено
            const gradient = ctx.createLinearGradient(
                buttonX, buttonY,
                buttonX, buttonY + this.equipButton.height
            );
            gradient.addColorStop(0, buttonColor1);
            gradient.addColorStop(1, buttonColor2);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(
                buttonX, buttonY,
                this.equipButton.width, this.equipButton.height, 8
            );
            ctx.fill();
        }
        
        // Обводка
        ctx.strokeStyle = buttonColor1;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(
            buttonX, buttonY,
            this.equipButton.width, this.equipButton.height, 8
        );
        ctx.stroke();
        
        // Текст
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(25);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Черная обводка текста
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(buttonText, 
            buttonX + this.equipButton.width / 2, 
            buttonY + this.equipButton.height / 2
        );
        
        // Белый текст поверх обводки
        ctx.fillText(buttonText, 
            buttonX + this.equipButton.width / 2, 
            buttonY + this.equipButton.height / 2
        );
        
        ctx.restore();
    }
    
    renderFishListButton(ctx, item) {
        // Кнопка "Виды рыб" показывается только для наживок
        if (this.currentTab !== 'baits') return;
        
        ctx.save();
        
        // Получаем изображение uipan.png
        const uipanImage = assetManager.getImage('uipan.png');
        
        if (uipanImage) {
            // Рисуем фон кнопки используя uipan.png
            ctx.drawImage(
                uipanImage,
                this.fishListButton.x, this.fishListButton.y,
                this.fishListButton.width, this.fishListButton.height
            );
        } else {
            // Fallback - градиентный фон если изображение не загружено
            const gradient = ctx.createLinearGradient(
                this.fishListButton.x, this.fishListButton.y,
                this.fishListButton.x, this.fishListButton.y + this.fishListButton.height
            );
            gradient.addColorStop(0, '#3498db');
            gradient.addColorStop(1, '#2980b9');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(
                this.fishListButton.x, this.fishListButton.y,
                this.fishListButton.width, this.fishListButton.height, 8
            );
            ctx.fill();
        }
        
        // Обводка
        ctx.strokeStyle = '#5dade2';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(
            this.fishListButton.x, this.fishListButton.y,
            this.fishListButton.width, this.fishListButton.height, 8
        );
        ctx.stroke();
        
        // Текст
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const fishTypesText = L('fish_types', 'Виды рыб');
        
        // Черная обводка текста
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(fishTypesText, 
            this.fishListButton.x + this.fishListButton.width / 2, 
            this.fishListButton.y + this.fishListButton.height / 2
        );
        
        // Белый текст поверх обводки
        ctx.fillText(fishTypesText, 
            this.fishListButton.x + this.fishListButton.width / 2, 
            this.fishListButton.y + this.fishListButton.height / 2
        );
        
        ctx.restore();
    }
    
    renderRepairButton(ctx, item) {
        const maxDurability = item.maxDurability || item.durability;
        const currentDurability = item.durability || maxDurability;
        const needsRepair = currentDurability < maxDurability;
        const repairPrice = this.calculateRepairPrice(item);
        const canAfford = this.playerCoins >= repairPrice;
        
        const buttonText = needsRepair ? `${L('repair', 'Ремонт')} ${repairPrice}` : L('not_required', 'Не требуется');
        const canRepair = needsRepair && canAfford;
        
        ctx.save();
        
        // Применяем масштабирование для анимации нажатия
        const centerX = this.repairButton.x + this.repairButton.width / 2;
        const centerY = this.repairButton.y + this.repairButton.height / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(this.repairButton.scale, this.repairButton.scale);
        ctx.translate(-centerX, -centerY);
        
        // Получаем изображение uipan.png
        const uipanImage = assetManager.getImage('uipan.png');
        
        if (uipanImage) {
            // Рисуем фон кнопки используя uipan.png
            ctx.drawImage(
                uipanImage,
                this.repairButton.x, this.repairButton.y,
                this.repairButton.width, this.repairButton.height
            );
        } else {
            // Fallback - градиентный фон если изображение не загружено
            if (canRepair) {
                const gradient = ctx.createLinearGradient(
                    this.repairButton.x, this.repairButton.y,
                    this.repairButton.x, this.repairButton.y + this.repairButton.height
                );
                gradient.addColorStop(0, '#f39c12');
                gradient.addColorStop(1, '#e67e22');
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = '#7f8c8d';
            }
            
            ctx.beginPath();
            ctx.roundRect(
                this.repairButton.x, this.repairButton.y,
                this.repairButton.width, this.repairButton.height, 8
            );
            ctx.fill();
        }
        
        // Обводка
        ctx.strokeStyle = canRepair ? '#f39c12' : '#95a5a6';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Текст
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(25);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Черная обводка текста
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(buttonText, 
            this.repairButton.x + this.repairButton.width / 2, 
            this.repairButton.y + this.repairButton.height / 2
        );
        
        // Белый текст поверх обводки
        const btnCenterX = this.repairButton.x + this.repairButton.width / 2;
        const btnCenterY = this.repairButton.y + this.repairButton.height / 2;
        
        ctx.fillText(buttonText, btnCenterX, btnCenterY);
        
        // Рисуем иконку монеты если нужен ремонт
        if (needsRepair) {
            const textWidth = ctx.measureText(buttonText).width;
            assetManager.drawCoinIcon(ctx, btnCenterX + textWidth / 2 + 18, btnCenterY, 24);
        }
        
        ctx.restore();
    }
    
    renderSellButton(ctx, item) {
        const sellPrice = this.calculateSellPrice(item);
        const buttonText = L('sell', 'Продать');
        
        ctx.save();
        
        // Вычисляем необходимую ширину кнопки
        ctx.font = fontManager.getFont(25);
        const textWidth = ctx.measureText(buttonText).width;
        const coinSize = 24;
        const priceText = `${sellPrice}`;
        const priceWidth = ctx.measureText(priceText).width;
        const contentWidth = textWidth + 10 + priceWidth + 5 + coinSize;
        const padding = 40; // Запас по бокам
        const calculatedWidth = contentWidth + padding;
        
        // Обновляем ширину кнопки динамически
        this.sellButton.width = Math.max(200, calculatedWidth);
        
        // Применяем масштабирование для анимации нажатия
        const centerX = this.sellButton.x + this.sellButton.width / 2;
        const centerY = this.sellButton.y + this.sellButton.height / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(this.sellButton.scale, this.sellButton.scale);
        ctx.translate(-centerX, -centerY);
        
        // Получаем изображение uipan.png
        const uipanImage = assetManager.getImage('uipan.png');
        
        if (uipanImage) {
            // Рисуем фон кнопки используя uipan.png
            ctx.drawImage(
                uipanImage,
                this.sellButton.x, this.sellButton.y,
                this.sellButton.width, this.sellButton.height
            );
        } else {
            // Fallback - градиентный фон если изображение не загружено
            const gradient = ctx.createLinearGradient(
                this.sellButton.x, this.sellButton.y,
                this.sellButton.x, this.sellButton.y + this.sellButton.height
            );
            gradient.addColorStop(0, '#9b59b6');
            gradient.addColorStop(1, '#8e44ad');
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            ctx.roundRect(
                this.sellButton.x, this.sellButton.y,
                this.sellButton.width, this.sellButton.height, 8
            );
            ctx.fill();
        }
        
        // Обводка
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(
            this.sellButton.x, this.sellButton.y,
            this.sellButton.width, this.sellButton.height, 8
        );
        ctx.stroke();
        
        // Текст и иконка монеты
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(25);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const btnCenterX = this.sellButton.x + this.sellButton.width / 2;
        const btnCenterY = this.sellButton.y + this.sellButton.height / 2;
        
        // Начальная позиция (центрируем всё вместе)
        let currentX = btnCenterX - contentWidth / 2;
        
        // Черная обводка текста "Продать"
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.strokeText(buttonText, currentX, btnCenterY);
        ctx.fillText(buttonText, currentX, btnCenterY);
        currentX += textWidth + 10;
        
        // Черная обводка цены
        ctx.strokeText(priceText, currentX, btnCenterY);
        ctx.fillText(priceText, currentX, btnCenterY);
        currentX += priceWidth + 5;
        
        // Рисуем иконку монеты
        assetManager.drawCoinIcon(ctx, currentX + coinSize / 2, btnCenterY, coinSize);
        
        ctx.restore();
    }
    
    renderUpgradeButton(ctx, item) {
        const canAfford = this.playerCoins >= item.upgradePrice;
        const buttonText = `${L('upgrade', 'Улучшить')} ${item.upgradePrice}`;
        
        ctx.save();
        
        // Получаем изображение uipan.png
        const uipanImage = assetManager.getImage('uipan.png');
        
        if (uipanImage) {
            // Рисуем фон кнопки используя uipan.png
            ctx.drawImage(
                uipanImage,
                this.upgradeButton.x, this.upgradeButton.y,
                this.upgradeButton.width, this.upgradeButton.height
            );
        } else {
            // Fallback - градиентный фон если изображение не загружено
            if (canAfford) {
                const gradient = ctx.createLinearGradient(
                    this.upgradeButton.x, this.upgradeButton.y,
                    this.upgradeButton.x, this.upgradeButton.y + this.upgradeButton.height
                );
                gradient.addColorStop(0, '#3498db');
                gradient.addColorStop(1, '#2980b9');
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = '#7f8c8d';
            }
            
            ctx.beginPath();
            ctx.roundRect(
                this.upgradeButton.x, this.upgradeButton.y,
                this.upgradeButton.width, this.upgradeButton.height, 8
            );
            ctx.fill();
        }
        
        // Обводка
        ctx.strokeStyle = canAfford ? '#3498db' : '#95a5a6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(
            this.upgradeButton.x, this.upgradeButton.y,
            this.upgradeButton.width, this.upgradeButton.height, 8
        );
        ctx.stroke();
        
        // Текст
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(25);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Черная обводка текста
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(buttonText, 
            this.upgradeButton.x + this.upgradeButton.width / 2, 
            this.upgradeButton.y + this.upgradeButton.height / 2
        );
        
        // Белый текст поверх обводки
        const btnCenterX = this.upgradeButton.x + this.upgradeButton.width / 2;
        const btnCenterY = this.upgradeButton.y + this.upgradeButton.height / 2;
        
        ctx.fillText(buttonText, btnCenterX, btnCenterY);
        
        // Рисуем иконку монеты
        const textWidth = ctx.measureText(buttonText).width;
        assetManager.drawCoinIcon(ctx, btnCenterX + textWidth / 2 + 18, btnCenterY, 24);
        
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
    
    renderSellAnimation(ctx) {
        if (!this.sellAnimation.active) return;
        
        const progress = this.sellAnimation.progress;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        ctx.save();
        
        // Позиция анимации
        const startX = this.sellAnimation.x;
        const startY = this.sellAnimation.y;
        const endX = this.modalX + this.modalWidth - 100;
        const endY = this.modalY + 40;
        
        const currentX = startX + (endX - startX) * easeOut;
        const currentY = startY + (endY - startY) * easeOut - Math.sin(progress * Math.PI) * 50;
        
        // Прозрачность
        ctx.globalAlpha = 1 - progress;
        
        // Масштаб
        const scale = 1 + progress * 0.5;
        
        // Текст с монетами
        ctx.fillStyle = '#f1c40f';
        ctx.font = fontManager.getFont(Math.floor(32 * scale));
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const animText = `+${this.sellAnimation.coins}`;
        ctx.fillText(animText, currentX - 15, currentY);
        
        // Рисуем иконку монеты
        assetManager.drawCoinIcon(ctx, currentX + ctx.measureText(animText).width / 2 + 10, currentY, 32 * scale);
        
        // Эффект свечения
        ctx.shadowColor = '#f1c40f';
        ctx.shadowBlur = 20 * (1 - progress);
        ctx.fillText(animText, currentX - 15, currentY);
        assetManager.drawCoinIcon(ctx, currentX + ctx.measureText(animText).width / 2 + 10, currentY, 32 * scale);
        
        ctx.restore();
    }
    
    // Модальное окно списка рыб
    renderFishListModal(ctx) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        
        // Затемнение
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const modalWidth = 480;
        const modalHeight = 580;
        const modalX = (this.canvas.width - modalWidth) / 2;
        const modalY = (this.canvas.height - modalHeight) / 2;
        
        // Фон модального окна
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 20;
        
        // Рисуем фон используя rmk.png
        const rmkImage = assetManager.getImage('rmk.png');
        if (rmkImage) {
            // Используем изображение rmk.png как фон рамки
            ctx.drawImage(
                rmkImage,
                modalX, modalY,
                modalWidth, modalHeight
            );
        } else {
            // Fallback - градиентный фон если изображение не загружено
            const gradient = ctx.createLinearGradient(modalX, modalY, modalX, modalY + modalHeight);
            gradient.addColorStop(0, '#2c3e50');
            gradient.addColorStop(1, '#1a252f');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(modalX, modalY, modalWidth, modalHeight, 12);
            ctx.fill();
            
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Заголовок
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(28);
        ctx.textAlign = 'center';
        ctx.fillText(L('fish_types', 'Виды рыб'), modalX + modalWidth / 2, modalY + 40);
        
        // Список рыб
        const listY = modalY + 70;
        const listHeight = modalHeight - 110;
        const itemHeight = 70;
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(modalX + 10, listY + 5, modalWidth - 20, listHeight + 15);
        ctx.clip();
        
        const visibleStart = Math.floor(this.fishListModal.scrollOffset);
        const visibleEnd = Math.min(
            this.fishListModal.fish.length, 
            visibleStart + this.fishListModal.maxVisible + 2
        );
        
        for (let i = visibleStart; i < visibleEnd; i++) {
            const fish = this.fishListModal.fish[i];
            const itemY = listY + 5 + (i - this.fishListModal.scrollOffset) * itemHeight;
            
            // Фон элемента
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.roundRect(modalX + 15, itemY, modalWidth - 30, itemHeight - 8, 6);
            ctx.fill();
            
            // Иконка рыбы (увеличено на 60% для спрайтов)
            const iconSize = 80; // 50 * 1.6 = 80
            const iconX = modalX + 50;
            const iconY = itemY + (itemHeight - 8) / 2;
            
            assetManager.drawImageOrEmoji(
                ctx, 'fish', fish.id,
                iconX, iconY, iconSize,
                fish.emoji || '🐟'
            );
            
            // Название рыбы
            ctx.fillStyle = '#fff';
            ctx.font = fontManager.getFont(18);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            const fishName = window.FishDB ? window.FishDB.getLocalizedName(fish) : fish.name;
            ctx.fillText(fishName, modalX + 85, itemY + 22);
            
            // Редкость
            const rarityColors = {
                'Common': '#95a5a6',
                'Uncommon': '#2ecc71',
                'Rare': '#3498db',
                'Epic': '#9b59b6',
                'Legendary': '#f39c12'
            };
            ctx.fillStyle = rarityColors[fish.rarity] || '#95a5a6';
            ctx.font = fontManager.getFont(15, 'normal');
            // Получаем локализованную редкость
            const localizedRarity = window.localizationSystem ? 
                window.localizationSystem.t(`rarity_${fish.rarity}`, fish.rarity) : 
                fish.rarity;
            ctx.fillText(localizedRarity, modalX + 85, itemY + 45);
        }
        
        ctx.restore();
        
        // Скроллбар для списка рыб
        if (this.fishListModal.fish.length > this.fishListModal.maxVisible) {
            const scrollbarX = modalX + modalWidth - 20;
            const scrollbarY = listY + 5;
            const scrollbarHeight = listHeight - 10;
            
            const totalItems = this.fishListModal.fish.length;
            const visibleRatio = this.fishListModal.maxVisible / totalItems;
            const scrollRatio = this.fishListModal.scrollOffset / (totalItems - this.fishListModal.maxVisible);
            
            const thumbHeight = Math.max(30, scrollbarHeight * visibleRatio);
            const thumbY = scrollbarY + (scrollbarHeight - thumbHeight) * scrollRatio;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.roundRect(scrollbarX, scrollbarY, 8, scrollbarHeight, 4);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.roundRect(scrollbarX, thumbY, 8, thumbHeight, 4);
            ctx.fill();
        }
        
        // Кнопка закрытия
        const closeX = modalX + modalWidth - 15; // Ближе к углу
        const closeY = modalY + 15;
        const closeSize = 60; // Увеличиваем в 2 раза (было 30)
        
        ctx.save();
        ctx.globalAlpha = 0.9; // 90% прозрачность
        
        // Используем спрайт zak.png
        const zakImage = assetManager.getImage('zak.png');
        if (zakImage) {
            ctx.drawImage(zakImage, closeX - closeSize/2, closeY - closeSize/2, closeSize, closeSize);
        } else {
            // Fallback - обычный крестик если спрайт не загружен
            ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
            ctx.beginPath();
            ctx.arc(closeX, closeY, closeSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            
            const offset = 12; // Увеличиваем offset
            ctx.beginPath();
            ctx.moveTo(closeX - offset, closeY - offset);
            ctx.lineTo(closeX + offset, closeY + offset);
            ctx.moveTo(closeX + offset, closeY - offset);
            ctx.lineTo(closeX - offset, closeY + offset);
            ctx.stroke();
        }
        
        ctx.restore();
        
        ctx.restore();
    }
    
    // Получить рыб для текущей наживки
    getFishForBait(bait) {
        if (typeof FISH_DATABASE === 'undefined') return [];
        
        // Используем ID наживки для поиска
        const baitId = bait.id;
        
        // Фильтруем рыб, которые используют эту наживку по ID
        const matchingFish = FISH_DATABASE.filter(fish => {
            return fish.preferredBaitId === baitId || fish.altBaitId === baitId;
        });
        
        console.log(`Searching fish for bait ID ${baitId} (${bait.name})`);
        console.log(`Found ${matchingFish.length} fish:`, matchingFish.map(f => f.name));
        
        return matchingFish;
    }
    
    showFishList() {
        if (this.selectedIndex < 0 || this.selectedIndex >= this.items.length) {
            return;
        }
        
        const item = this.items[this.selectedIndex];
        this.fishListModal.fish = this.getFishForBait(item);
        this.fishListModal.scrollOffset = 0;
        this.fishListModal.visible = true;
        this.fishListModal.justOpened = true; // Флаг, что модальное окно только что открылось
        
        // Сбрасываем флаг через небольшой таймаут
        setTimeout(() => {
            if (this.fishListModal) {
                this.fishListModal.justOpened = false;
            }
        }, 100);
    }
    
    handleFishListModalClick(x, y) {
        // Если модальное окно только что открылось, игнорируем клик "вне окна"
        // чтобы клик по кнопке открытия не закрыл окно сразу
        if (this.fishListModal.justOpened) {
            // Не сбрасываем флаг здесь, он сбросится автоматически через таймаут
            return true;
        }
        
        const modalWidth = 480;
        const modalHeight = 580;
        const modalX = (this.canvas.width - modalWidth) / 2;
        const modalY = (this.canvas.height - modalHeight) / 2;
        
        // Кнопка закрытия
        const closeX = modalX + modalWidth - 25;
        const closeY = modalY + 25;
        const closeSize = 30;
        
        const dx = x - closeX;
        const dy = y - closeY;
        
        if (Math.sqrt(dx * dx + dy * dy) < closeSize / 2) {
            this.fishListModal.visible = false;
            return true;
        }
        
        // Клик вне окна
        if (x < modalX || x > modalX + modalWidth || y < modalY || y > modalY + modalHeight) {
            this.fishListModal.visible = false;
            return true;
        }
        
        // Начало перетаскивания списка
        const listY = modalY + 70;
        const listHeight = modalHeight - 110;
        
        if (x >= modalX + 10 && x <= modalX + modalWidth - 10 &&
            y >= listY + 5 && y <= listY + listHeight + 15) {
            this.fishListModal.isDragging = true;
            this.fishListModal.dragStartY = y;
            this.fishListModal.dragStartScroll = this.fishListModal.scrollOffset;
            this.fishListModal.lastDragY = y;
            this.fishListModal.lastDragTime = performance.now();
            this.fishListModal.dragVelocity = 0;
            return true;
        }
        
        return true;
    }
    
    // Обработка клика
    handleClick(x, y) {
        if (!this.visible) return false;
        
        // Звук клика будет воспроизводиться для конкретных действий (закрытие, вкладки, выбор)
        // Для продажи/ремонта используются специальные звуки (kup/nema)
        
        // Клик на модальном окне списка рыб (БЕЗ трансформации, так как оно рендерится после ctx.restore)
        if (this.fishListModal.visible) {
            return this.handleFishListModalClick(x, y);
        }
        
        // Трансформируем координаты клика с учетом масштабирования окна (только для основного окна)
        const scale = 0.8 + this.animProgress * 0.2;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const transformedX = (x - centerX) / scale + centerX;
        const transformedY = (y - centerY) / scale + centerY;
        x = transformedX;
        y = transformedY;
        
        // Клик на кнопку закрытия
        if (this.isCloseButtonClicked(x, y)) {
            if (this.audioManager) this.audioManager.playClickSound();
            this.hide();
            return true;
        }
        
        // Клик вне модального окна
        if (!this.isInsideModal(x, y)) {
            if (this.audioManager) this.audioManager.playClickSound();
            this.hide();
            return true;
        }
        
        // Клик на вкладку
        const clickedTab = this.getClickedTab(x, y);
        if (clickedTab) {
            if (this.audioManager) this.audioManager.playClickSound();
            this.currentTab = clickedTab.id;
            this.selectedIndex = -1;
            this.scrollOffset = 0;
            this.loadItems();
            return true;
        }
        
        // Клик на элемент списка или начало драга
        const listX = this.modalX + 25;
        const listY = this.modalY + 135;
        const listHeight = this.modalHeight - 160;
        
        if (x >= listX && x <= listX + this.listWidth &&
            y >= listY && y <= listY + listHeight) {
            // Начинаем драг
            this.isDragging = true;
            this.dragStartY = y;
            this.dragStartScroll = this.scrollOffset;
            this.lastDragY = y;
            this.lastDragTime = performance.now();
            this.dragVelocity = 0;
            return true;
        }
        
        // Клик на кнопки действий
        if (this.selectedIndex >= 0 && this.selectedIndex < this.items.length) {
            const item = this.items[this.selectedIndex];
            
            console.log('Клик в инвентаре:', x, y, 'Выбран:', item.name);
            
            if (this.currentTab === 'keepnet') {
                // Кнопка улучшения садка
                if (this.isUpgradeButtonClicked(x, y)) {
                    console.log('Клик по кнопке улучшения');
                    this.upgradeKeepnet();
                    return true;
                }
            } else if (this.currentTab === 'baits') {
                console.log('📦 Вкладка наживок, проверяем кнопки');
                // Кнопка "Виды рыб" для наживок
                if (this.isFishListButtonClicked(x, y)) {
                    console.log('✅ Обработка клика по кнопке "Виды рыб"');
                    this.showFishList();
                    return true;
                }
                
                // Кнопка экипировки для наживок
                if (this.isEquipButtonClicked(x, y)) {
                    console.log('Клик по кнопке экипировки наживки');
                    this.toggleEquip(item);
                    return true;
                }
            } else {
                // Кнопка экипировки
                if (this.isEquipButtonClicked(x, y)) {
                    console.log('Клик по кнопке экипировки');
                    this.toggleEquip(item);
                    return true;
                }
                
                // Кнопка ремонта (если экипировано)
                if (item.isEquipped && this.isRepairButtonClicked(x, y)) {
                    console.log('Клик по кнопке ремонта');
                    // Анимация нажатия кнопки
                    this.repairButton.targetScale = 0.85;
                    setTimeout(() => {
                        this.repairButton.targetScale = 1.0;
                    }, 100);
                    this.repairItem(item);
                    return true;
                }
                
                // Кнопка продажи (если не экипировано)
                if (!item.isEquipped && this.isSellButtonClicked(x, y)) {
                    console.log('Клик по кнопке продажи');
                    // Анимация нажатия кнопки
                    this.sellButton.targetScale = 0.85;
                    setTimeout(() => {
                        this.sellButton.targetScale = 1.0;
                    }, 100);
                    this.sellItem(item);
                    return true;
                }
            }
        }
        
        return true;
    }
    
    toggleEquip(item) {
        // Преобразуем currentTab в правильный ключ для equipped
        const typeMap = {
            'rods': 'rod',
            'lines': 'line',
            'floats': 'float',
            'hooks': 'hook',
            'reels': 'reel',
            'baits': 'bait'
        };
        
        const equipKey = typeMap[this.currentTab];
        if (!equipKey) return;
        
        if (item.isEquipped) {
            // Снять снасть/наживку - устанавливаем null
            this.inventory.equipped[equipKey] = null;
        } else {
            // Экипировать снасть/наживку
            if (equipKey === 'bait') {
                this.inventory.equipped[equipKey] = item.id;
            } else {
                this.inventory.equipped[equipKey] = item.tier;
            }
        }
        
        // Сохраняем в localStorage
        this.inventory.saveToStorage();
        
        // Перезагружаем список
        this.loadItems();
        
        // Вызываем callback
        if (this.onEquip) {
            this.onEquip(equipKey, item, !item.isEquipped);
        }
    }
    
    repairItem(item) {
        const maxDurability = item.maxDurability || item.durability;
        const currentDurability = item.durability || maxDurability;
        
        if (currentDurability >= maxDurability) return; // Не требует ремонта
        
        const repairPrice = this.calculateRepairPrice(item);
        if (this.playerCoins < repairPrice) {
            // Звук недостаточно денег
            if (this.audioManager) this.audioManager.playSound('nema');
            return; // Недостаточно денег
        }
        
        // Звук успешного ремонта (покупка услуги)
        if (this.audioManager) this.audioManager.playSound('kup');
        
        // Преобразуем currentTab в правильный ключ
        const typeMap = {
            'rods': 'rod',
            'lines': 'line',
            'floats': 'float',
            'hooks': 'hook',
            'reels': 'reel'
        };
        
        const equipKey = typeMap[this.currentTab];
        if (!equipKey) return;
        
        // Ремонтируем через инвентарь
        const repaired = this.inventory.repairGear(equipKey, item.tier);
        
        if (repaired) {
            // Вызываем callback для списания денег
            if (this.onRepair) {
                this.onRepair(equipKey, item, repairPrice);
            }
            
            // Обновляем баланс локально
            this.playerCoins -= repairPrice;
            
            // Перезагружаем список
            this.loadItems();
        }
    }
    
    sellItem(item) {
        if (item.isEquipped) return; // Нельзя продать экипированное
        
        const sellPrice = this.calculateSellPrice(item);
        
        // Звук успешной продажи
        if (this.audioManager) this.audioManager.playSound('kup');
        
        // Преобразуем currentTab в правильный ключ
        const typeMap = {
            'rods': 'rods',
            'lines': 'lines',
            'floats': 'floats',
            'hooks': 'hooks',
            'reels': 'reels'
        };
        
        const inventoryKey = typeMap[this.currentTab];
        if (!inventoryKey) return;
        
        // Удаляем снасть из инвентаря
        const gearArray = this.inventory.inventory[inventoryKey];
        if (!gearArray) return;
        
        const index = gearArray.findIndex(g => g.tier === item.tier);
        if (index === -1) return;
        
        gearArray.splice(index, 1);
        this.inventory.saveToStorage();
        
        // Запускаем анимацию продажи
        this.sellAnimation.active = true;
        this.sellAnimation.progress = 0;
        this.sellAnimation.coins = sellPrice;
        this.sellAnimation.x = this.sellButton.x + this.sellButton.width / 2;
        this.sellAnimation.y = this.sellButton.y;
        
        // Вызываем callback для начисления денег
        if (this.onSell) {
            this.onSell(inventoryKey, item, sellPrice);
        }
        
        // НЕ обновляем баланс локально - это делает callback
        // this.playerCoins += sellPrice; // УБРАНО
        
        // Сбрасываем выбор и перезагружаем список
        this.selectedIndex = -1;
        this.loadItems();
    }
    
    upgradeKeepnet() {
        if (this.selectedIndex < 0 || this.selectedIndex >= this.items.length) return;
        
        const item = this.items[this.selectedIndex];
        if (this.playerCoins < item.upgradePrice) return; // Недостаточно денег
        
        // Улучшаем
        this.keepnetCapacity = item.nextCapacity;
        this.keepnetUpgradeLevel++;
        
        // Вызываем callback
        if (this.onUpgradeKeepnet) {
            this.onUpgradeKeepnet(this.keepnetCapacity, this.keepnetUpgradeLevel, item.upgradePrice);
        }
        
        // Перезагружаем список
        this.loadItems();
    }
    
    // Обработка скролла
    handleScroll(deltaY) {
        if (!this.visible) return false;
        
        if (this.fishListModal.visible) {
            // Скролл в модальном окне рыб
            const maxScroll = Math.max(0, this.fishListModal.fish.length - this.fishListModal.maxVisible);
            this.fishListModal.scrollOffset = Math.max(0, Math.min(maxScroll, this.fishListModal.scrollOffset + deltaY * 0.5));
        } else {
            // Скролл в списке товаров
            const maxScroll = Math.max(0, this.items.length - this.maxVisibleItems);
            this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset + deltaY * 0.5));
        }
        
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
        // Кнопка экипировки всегда справа (координаты установлены в updatePositions)
        return x >= this.equipButton.x && x <= this.equipButton.x + this.equipButton.width &&
               y >= this.equipButton.y && y <= this.equipButton.y + this.equipButton.height;
    }
    
    isRepairButtonClicked(x, y) {
        return x >= this.repairButton.x && x <= this.repairButton.x + this.repairButton.width &&
               y >= this.repairButton.y && y <= this.repairButton.y + this.repairButton.height;
    }
    
    isSellButtonClicked(x, y) {
        return x >= this.sellButton.x && x <= this.sellButton.x + this.sellButton.width &&
               y >= this.sellButton.y && y <= this.sellButton.y + this.sellButton.height;
    }
    
    isUpgradeButtonClicked(x, y) {
        return x >= this.upgradeButton.x && x <= this.upgradeButton.x + this.upgradeButton.width &&
               y >= this.upgradeButton.y && y <= this.upgradeButton.y + this.upgradeButton.height;
    }
    
    isFishListButtonClicked(x, y) {
        if (this.selectedIndex < 0) return false;
        
        const isClicked = x >= this.fishListButton.x && x <= this.fishListButton.x + this.fishListButton.width &&
               y >= this.fishListButton.y && y <= this.fishListButton.y + this.fishListButton.height;
        
        if (isClicked) {
            console.log('🐟 Клик по кнопке "Виды рыб"!', {
                clickX: x,
                clickY: y,
                buttonX: this.fishListButton.x,
                buttonY: this.fishListButton.y,
                buttonWidth: this.fishListButton.width,
                buttonHeight: this.fishListButton.height
            });
        }
        
        return isClicked;
    }
    
    getClickedTab(x, y) {
        const tabY = this.modalY + 75;
        const tabHeight = 45;
        const tabWidth = 155;
        const spacing = 8;
        const startX = this.modalX + 25;
        
        if (y < tabY || y > tabY + tabHeight) return null;
        
        for (let i = 0; i < this.tabs.length; i++) {
            const tabX = startX + i * (tabWidth + spacing);
            if (x >= tabX && x <= tabX + tabWidth) {
                return this.tabs[i];
            }
        }
        
        return null;
    }
    
    getClickedItemIndex(x, y) {
        const listX = this.modalX + 25;
        const listY = this.modalY + 135;
        const listHeight = this.modalHeight - 160;
        
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
    
    handleMouseDown(x, y) {
        return this.handleClick(x, y);
    }
    
    handleMouseMove(x, y) {
        if (!this.visible) return;
        
        // Перетаскивание в модальном окне списка рыб
        if (this.fishListModal.visible && this.fishListModal.isDragging) {
            const modalWidth = 480;
            const modalHeight = 580;
            const modalY = (this.canvas.height - modalHeight) / 2;
            const listY = modalY + 70;
            const itemHeight = 70;
            
            const deltaY = this.fishListModal.dragStartY - y;
            const deltaItems = deltaY / itemHeight;
            
            this.fishListModal.scrollOffset = this.fishListModal.dragStartScroll + deltaItems;
            
            // Ограничение скролла
            const maxScroll = Math.max(0, this.fishListModal.fish.length - this.fishListModal.maxVisible);
            this.fishListModal.scrollOffset = Math.max(0, Math.min(maxScroll, this.fishListModal.scrollOffset));
            
            // Вычисление скорости для инерции
            const now = performance.now();
            const dt = (now - this.fishListModal.lastDragTime) / 1000;
            if (dt > 0) {
                const velocity = (this.fishListModal.lastDragY - y) / dt / itemHeight;
                this.fishListModal.dragVelocity = velocity * 0.3;
            }
            
            this.fishListModal.lastDragY = y;
            this.fishListModal.lastDragTime = now;
            return;
        }
        
        // Драг списка предметов
        if (this.isDragging) {
            const deltaY = this.dragStartY - y;
            const deltaItems = deltaY / this.listItemHeight;
            
            this.scrollOffset = this.dragStartScroll + deltaItems;
            
            // Ограничение скролла
            const maxScroll = Math.max(0, this.items.length - this.maxVisibleItems);
            this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset));
            
            // Вычисление скорости для инерции
            const now = performance.now();
            const dt = (now - this.lastDragTime) / 1000;
            if (dt > 0) {
                const velocity = (this.lastDragY - y) / dt / this.listItemHeight;
                this.dragVelocity = velocity * 0.3;
            }
            
            this.lastDragY = y;
            this.lastDragTime = now;
        }
    }
    
    handleMouseUp(x, y) {
        if (!this.visible) return;
        
        // Завершение перетаскивания в модальном окне списка рыб
        if (this.fishListModal.visible && this.fishListModal.isDragging) {
            this.fishListModal.isDragging = false;
            
            // Если движение было минимальным, сбрасываем инерцию
            const dragDistance = Math.abs(this.fishListModal.dragStartY - y);
            if (dragDistance < 15) {
                this.fishListModal.dragVelocity = 0;
            }
            return;
        }
        
        if (this.isDragging) {
            this.isDragging = false;
            
            // Если движение было минимальным, это клик
            const dragDistance = Math.abs(this.dragStartY - y);
            if (dragDistance < 15) {
                const listY = this.modalY + 135;
                const relativeY = y - listY - 8;
                const clickedIndex = Math.floor(relativeY / this.listItemHeight + this.scrollOffset);
                
                if (clickedIndex >= 0 && clickedIndex < this.items.length) {
                    if (this.audioManager) this.audioManager.playClickSound();
                    this.selectedIndex = clickedIndex;
                }
                this.dragVelocity = 0;
            }
        }
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InventoryUI;
}
