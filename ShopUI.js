// UI магазина
class ShopUI {
    constructor(canvas, gearInventory, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.inventory = gearInventory;
        this.audioManager = audioManager;
        
        // Состояние
        this.visible = false;
        this.animProgress = 0;
        this.currentTab = 'baits'; // baits, rods, lines, floats, hooks, premium, iap
        
        // Система анимации покупки
        this.purchaseAnimations = [];
        
        // Вкладки магазина
        this.tabs = [
            { id: 'baits', name: L('baits', 'Наживки'), icon: '' },
            { id: 'hooks', name: L('hooks', 'Крючки'), icon: '' },
            { id: 'floats', name: L('floats', 'Поплавки'), icon: '' },
            { id: 'lines', name: L('lines', 'Лески'), icon: '' },
            { id: 'reels', name: L('reels', 'Катушки'), icon: '' },
            { id: 'rods', name: L('rods', 'Удочки'), icon: '' },
            { id: 'premium', name: L('premium', 'Премиум'), icon: '' },
            { id: 'iap', name: L('purchases', 'Покупки'), icon: '' }
        ];
        
        // Список товаров
        this.items = [];
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.maxVisibleItems = 5.5;
        
        // Размеры окна (увеличены для IAP вкладки)
        this.modalWidth = 1200;
        this.modalHeight = 696;
        this.modalX = 0;
        this.modalY = 0;
        
        // Размеры списка (увеличены)
        this.listWidth = 380;
        this.listItemHeight = 85;
        
        // Кнопки (увеличены)
        this.buyButton = { 
            x: 0, y: 0, width: 230, height: 60, visible: false,
            scale: 1.0, // Масштаб для анимации нажатия
            targetScale: 1.0
        };
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
        
        // Обмен валюты
        this.exchangeAmount = 1; // Текущее количество для обмена
        this.exchangeSlider = { x: 0, y: 0, width: 0, height: 20, dragging: false };
        this.exchangeArrows = {
            left: { x: 0, y: 0, size: 30 },
            right: { x: 0, y: 0, size: 30 }
        };
        
        // Перетаскивание для скролла списка товаров
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartScroll = 0;
        this.dragVelocity = 0;
        this.lastDragY = 0;
        this.lastDragTime = 0;
        
        // Деньги игрока (будет передаваться извне)
        this.playerCoins = 0;
        this.playerPremiumCoins = 0; // Премиум валюта
        this.playerLevel = 1; // Уровень игрока для проверки доступа к снастям
        
        // Менеджер премиум эффектов
        this.premiumEffects = null; // Будет передан извне
        
        this.updatePositions();
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
        
        this.buyButton.x = detailsX + detailsWidth - this.buyButton.width - 20;
        this.buyButton.y = this.modalY + this.modalHeight - 80;
    }
    
    // Получить шрифт (используем глобальный fontManager)
    getFont(size, weight = 'bold') {
        return fontManager.getFont(size, weight);
    }
    
    // Применить межбуквенное расстояние (используем глобальный fontManager)
    applyLetterSpacing(ctx, forTitles = false) {
        fontManager.applyLetterSpacing(ctx, forTitles);
    }
    
    show(playerCoins = 0, playerPremiumCoins = 0, playerLevel = 1) {
        this.visible = true;
        this.playerCoins = playerCoins;
        this.playerPremiumCoins = playerPremiumCoins;
        this.playerLevel = playerLevel;
        this.currentTab = 'baits';
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.loadItems();
        this.updatePositions();
    }
    
    hide() {
        this.visible = false;
        this.items = [];
        this.fishListModal.visible = false;
        // Очищаем анимации покупки при выходе из магазина
        this.purchaseAnimations = [];
    }
    
    // Обновить названия вкладок после смены языка
    updateTabLabels() {
        this.tabs[0].name = L('baits', 'Наживки');
        this.tabs[1].name = L('hooks', 'Крючки');
        this.tabs[2].name = L('floats', 'Поплавки');
        this.tabs[3].name = L('lines', 'Лески');
        this.tabs[4].name = L('reels', 'Катушки');
        this.tabs[5].name = L('rods', 'Удочки');
        this.tabs[6].name = L('premium', 'Премиум');
        this.tabs[7].name = L('purchases', 'Покупки');
    }
    
    // Загрузить товары текущей вкладки
    loadItems() {
        if (this.currentTab === 'baits') {
            // Загружаем все наживки из базы
            if (typeof BAITS_DATABASE !== 'undefined') {
                this.items = BAITS_DATABASE.map(bait => ({
                    ...bait,
                    // Добавляем цену если её нет (10 наживок)
                    price: bait.price || Math.ceil(50 * Math.pow(1.5, bait.unlockTier - 1)),
                    quantity: 10 // Продаются по 10 штук
                }))
                // Сортируем по цене (по возрастанию)
                .sort((a, b) => a.price - b.price);
            }
        } else if (this.currentTab === 'hooks') {
            // Загружаем все крючки из базы
            if (typeof HOOKS_DATABASE !== 'undefined') {
                this.items = HOOKS_DATABASE.map(hook => {
                    const requiredLevel = typeof getRequiredLevelForTier === 'function' ? getRequiredLevelForTier(hook.tier) : 1;
                    const isPremium = hook.currency === 'iap';
                    const isLocked = !isPremium && this.playerLevel < requiredLevel;
                    
                    return {
                        ...hook,
                        type: 'hook',
                        quantity: 1,
                        requiredLevel,
                        isLocked
                    };
                });
            }
        } else if (this.currentTab === 'floats') {
            // Загружаем все поплавки из базы
            if (typeof FLOATS_DATABASE !== 'undefined') {
                this.items = FLOATS_DATABASE.map(float => {
                    const requiredLevel = typeof getRequiredLevelForTier === 'function' ? getRequiredLevelForTier(float.tier) : 1;
                    const isPremium = float.currency === 'iap';
                    const isLocked = !isPremium && this.playerLevel < requiredLevel;
                    
                    return {
                        ...float,
                        type: 'float',
                        quantity: 1,
                        requiredLevel,
                        isLocked
                    };
                });
            }
        } else if (this.currentTab === 'lines') {
            // Загружаем все лески из базы
            if (typeof LINES_DATABASE !== 'undefined') {
                this.items = LINES_DATABASE.map(line => {
                    const requiredLevel = typeof getRequiredLevelForTier === 'function' ? getRequiredLevelForTier(line.tier) : 1;
                    const isPremium = line.currency === 'iap';
                    const isLocked = !isPremium && this.playerLevel < requiredLevel;
                    
                    return {
                        ...line,
                        type: 'line',
                        quantity: 1,
                        requiredLevel,
                        isLocked
                    };
                });
            }
        } else if (this.currentTab === 'reels') {
            // Загружаем все катушки из базы
            if (typeof REELS_DATABASE !== 'undefined') {
                this.items = REELS_DATABASE.map(reel => {
                    const requiredLevel = typeof getRequiredLevelForTier === 'function' ? getRequiredLevelForTier(reel.tier) : 1;
                    const isPremium = reel.currency === 'iap';
                    const isLocked = !isPremium && this.playerLevel < requiredLevel;
                    
                    return {
                        ...reel,
                        type: 'reel',
                        quantity: 1,
                        requiredLevel,
                        isLocked
                    };
                });
            }
        } else if (this.currentTab === 'rods') {
            // Загружаем все удочки из базы
            if (typeof RODS_DATABASE !== 'undefined') {
                this.items = RODS_DATABASE.map(rod => {
                    const requiredLevel = typeof getRequiredLevelForTier === 'function' ? getRequiredLevelForTier(rod.tier) : 1;
                    const isPremium = rod.currency === 'iap';
                    const isLocked = !isPremium && this.playerLevel < requiredLevel;
                    
                    return {
                        ...rod,
                        type: 'rod',
                        quantity: 1,
                        requiredLevel,
                        isLocked
                    };
                });
            }
        } else if (this.currentTab === 'premium') {
            // Загружаем премиум товары
            if (typeof PREMIUM_DATABASE !== 'undefined') {
                this.items = PREMIUM_DATABASE.map(item => {
                    const mappedItem = {
                        ...item,
                        quantity: 1,
                        isPremium: true
                    };
                    
                    // Синхронизируем цены из SDK для товаров с currency: 'iap'
                    if (item.currency === 'iap' && window.playgamaSDK && window.playgamaSDK.isPaymentsReady) {
                        const productInfo = window.playgamaSDK.getProductInfo(item.id);
                        if (productInfo) {
                            mappedItem.priceValue = productInfo.priceValue;
                            mappedItem.priceCurrencyCode = productInfo.priceCurrencyCode;
                            mappedItem.priceFormatted = productInfo.price; // "159 ЯН"
                        }
                    }
                    
                    return mappedItem;
                });
            }
        } else if (this.currentTab === 'iap') {
            // Загружаем IAP товары
            if (typeof IAP_DATABASE !== 'undefined') {
                this.items = IAP_DATABASE.map(item => {
                    const mappedItem = {
                        ...item,
                        quantity: 1,
                        isIAP: true
                    };
                    
                    // Синхронизируем цены из SDK только для реальных IAP товаров (не ad_reward и не exchange)
                    if (item.type !== 'ad_reward' && item.type !== 'exchange' && 
                        window.playgamaSDK && window.playgamaSDK.platformCapabilities.payments) {
                        const productInfo = window.playgamaSDK.getProductInfo(item.id);
                        if (productInfo) {
                            mappedItem.priceValue = productInfo.priceValue;
                            mappedItem.priceCurrencyCode = productInfo.priceCurrencyCode;
                            mappedItem.priceFormatted = productInfo.price; // "159 ЯН"
                            console.log(`💳 Синхронизирована цена для ${item.id}: ${mappedItem.priceFormatted}`);
                        } else {
                            console.warn(`💳 Не удалось получить цену для ${item.id} из SDK, используем дефолтную`);
                        }
                    }
                    
                    return mappedItem;
                });
            }
        }
        
        // Сбрасываем значение обмена валюты
        this.exchangeAmount = 1;
    }
    
    update(dt) {
        const targetProgress = this.visible ? 1 : 0;
        this.animProgress += (targetProgress - this.animProgress) * dt * 10;
        
        if (!this.visible && this.animProgress < 0.01) {
            this.animProgress = 0;
        }
        
        // Анимация масштаба кнопки покупки (плавное возвращение)
        this.buyButton.scale += (this.buyButton.targetScale - this.buyButton.scale) * dt * 15;
        
        // Обновляем анимации покупки
        this.updatePurchaseAnimations(dt);
        
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
    
    updatePurchaseAnimations(dt) {
        for (let i = this.purchaseAnimations.length - 1; i >= 0; i--) {
            const anim = this.purchaseAnimations[i];
            anim.progress += dt * anim.speed;
            
            // Обновляем иконки товара
            if (anim.icons) {
                anim.icons.forEach(icon => {
                    icon.x += icon.vx * dt * 60;
                    icon.y += icon.vy * dt * 60;
                    icon.vy += icon.gravity * dt * 60; // Применяем гравитацию
                    icon.rotation += icon.rotationSpeed * dt * 60;
                    icon.life -= dt;
                });
                
                // Удаляем мертвые иконки
                anim.icons = anim.icons.filter(i => i.life > 0);
            }
            
            // Удаляем завершенные анимации
            if (anim.progress >= 1 && anim.icons.length === 0) {
                this.purchaseAnimations.splice(i, 1);
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
        
        // Список товаров (слева)
        this.renderItemList(ctx);
        
        // Информация о выбранном товаре (справа)
        this.renderItemDetails(ctx);
        
        // Кнопка закрытия
        this.renderCloseButton(ctx);
        
        ctx.restore();
        
        // Модальное окно списка рыб (поверх всего)
        if (this.fishListModal.visible) {
            this.renderFishListModal(ctx);
        }
        
        // Рендерим анимации покупки (поверх всего)
        this.renderPurchaseAnimations(ctx);
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
        ctx.font = this.getFont(38);
        this.applyLetterSpacing(ctx, true); // Увеличенное расстояние для заголовка
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L('shop', 'МАГАЗИН'), this.modalX + this.modalWidth / 2, this.modalY + 40);
        this.applyLetterSpacing(ctx, false); // Сброс
        
        // Валюты справа от названия (как в главном меню)
        const coins = this.playerCoins;
        const gems = this.playerPremiumCoins;
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        const iconSize = 36;
        const iconTextGap = 5;
        
        // Обычные монеты со спрайтом sereb.png
        ctx.font = this.getFont(18, 'bold');
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
        const tabWidth = 120; // Уменьшено со 140 до 120
        const spacing = 8; // Уменьшено с 12 до 8
        const startX = this.modalX + 35; // Сдвинуто левее для размещения всех вкладок
        
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
                    // Премиум вкладка имеет особый цвет
                    if (tab.id === 'premium') {
                        ctx.fillStyle = '#9b59b6';
                    } else if (tab.id === 'iap') {
                        ctx.fillStyle = '#e67e22';
                    } else {
                        ctx.fillStyle = '#f39c12';
                    }
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                }
                
                ctx.beginPath();
                ctx.roundRect(x, tabY, tabWidth, tabHeight, 8);
                ctx.fill();
            }
            
            // Обводка для активной вкладки
            if (isActive) {
                if (tab.id === 'premium') {
                    ctx.strokeStyle = '#8e44ad';
                } else if (tab.id === 'iap') {
                    ctx.strokeStyle = '#d35400';
                } else {
                    ctx.strokeStyle = '#f1c40f';
                }
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(x, tabY, tabWidth, tabHeight, 8);
                ctx.stroke();
            }
            
            // Текст (без смайликов, уменьшенный шрифт с обводкой)
            ctx.fillStyle = '#fff';
            ctx.font = this.getFont(20); // Уменьшено с 24 до 20
            this.applyLetterSpacing(ctx, true); // Увеличенное расстояние для вкладок
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Черная обводка текста
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeText(tab.name, x + tabWidth / 2, tabY + tabHeight / 2);
            
            // Белый текст поверх обводки
            ctx.fillText(tab.name, x + tabWidth / 2, tabY + tabHeight / 2);
            this.applyLetterSpacing(ctx, false); // Сброс
        });
        
        ctx.restore();
    }
    
    renderItemList(ctx) {
        const listX = this.modalX + 25;
        const listY = this.modalY + 135;
        const listHeight = this.modalHeight - 160;
        
        ctx.save();
        
        // Сбрасываем все эффекты
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        
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
        const visibleEnd = Math.min(this.items.length, visibleStart + this.maxVisibleItems + 2); // +2 для запаса
        
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
        
        // Сбрасываем все эффекты
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        
        // Фон элемента
        if (isSelected) {
            ctx.fillStyle = 'rgba(243, 156, 18, 0.4)';
        } else if (item.currency === 'iap') {
            // Премиальные товары - легкий золотистый фон
            ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        }
        
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 6);
        ctx.fill();
        
        // Обводка для выбранного
        if (isSelected) {
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (item.currency === 'iap') {
            // Премиальные товары - тонкая золотистая обводка
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        
        // Иконка (изображение или emoji)
        const iconSize = 50;
        const iconX = x + 40;
        const iconY = y + height / 2;
        
        // Для товаров с рыболовными марками рисуем спрайт гема напрямую
        if (this.currentTab === 'iap' && item.type === 'premium_coins') {
            assetManager.drawGemIcon(ctx, iconX, iconY, iconSize);
        } else {
            // Определяем тип ассета и ID по текущей вкладке
            const assetType = this.currentTab === 'baits' ? 'bait' : 
                             this.currentTab === 'hooks' ? 'hook' :
                             this.currentTab === 'floats' ? 'float' :
                             this.currentTab === 'lines' ? 'line' :
                             this.currentTab === 'reels' ? 'reel' :
                             this.currentTab === 'rods' ? 'rod' :
                             this.currentTab === 'premium' ? 'premium' :
                             this.currentTab === 'iap' ? 'iap' : 'bait';
            
            // Для товаров с рыболовными марками используем специальную иконку
            let defaultEmoji;
            if (this.currentTab === 'iap' && item.type === 'premium_coins') {
                defaultEmoji = '💎'; // Для рыболовных марок используем бриллиант
            } else {
                defaultEmoji = this.currentTab === 'baits' ? '🍞' : 
                              this.currentTab === 'hooks' ? '🪝' :
                              this.currentTab === 'floats' ? '🎈' :
                              this.currentTab === 'lines' ? '🧵' :
                              this.currentTab === 'reels' ? '⚙️' :
                              this.currentTab === 'rods' ? '🎣' :
                              this.currentTab === 'premium' ? '💎' :
                              this.currentTab === 'iap' ? '💳' : '🍞';
            }
            
            // Затемняем заблокированные снасти (кроме премиум за ЯНы)
            if (item.isLocked && item.currency !== 'iap') {
                ctx.globalAlpha = 0.4;
            }
            
            // Для поплавков, лесок, крючков и удочек используем спрайты напрямую
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
                    ctx.fillText(item.emoji || defaultEmoji, iconX, iconY);
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
                    ctx.fillText(item.emoji || defaultEmoji, iconX, iconY);
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
                    ctx.fillText(item.emoji || defaultEmoji, iconX, iconY);
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
                    ctx.fillText(item.emoji || defaultEmoji, iconX, iconY);
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
                    ctx.fillText(item.emoji || '⚙️', iconX, iconY);
                }
            } else if (this.currentTab === 'baits') {
                // Для наживок используем спрайты n1.png - n21.png
                const baitId = item.id;
                const baitSpriteKey = `n${baitId}.png`;
                const baitSprite = assetManager.getImage(baitSpriteKey);
                
                if (baitSprite) {
                    ctx.drawImage(baitSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.font = `${iconSize}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(item.emoji || defaultEmoji, iconX, iconY);
                }
            } else if (this.currentTab === 'premium' || this.currentTab === 'iap') {
                // Для премиум бонусов используем спрайты p1.png - p17.png
                if (item.spriteId) {
                    const premiumSpriteKey = `p${item.spriteId}.png`;
                    const premiumSprite = assetManager.getImage(premiumSpriteKey);
                    
                    if (premiumSprite) {
                        ctx.drawImage(premiumSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
                    } else {
                        ctx.fillStyle = '#fff';
                        ctx.font = `${iconSize}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(item.emoji || defaultEmoji, iconX, iconY);
                    }
                } else if (item.sprite) {
                    // Для покупок с прямым указанием спрайта (например, sereb.png)
                    // Увеличиваем размер на 50% для лучшей видимости
                    const sprite = assetManager.getImage(item.sprite);
                    
                    if (sprite) {
                        const enlargedSize = iconSize * 1.5;
                        ctx.drawImage(sprite, iconX - enlargedSize/2, iconY - enlargedSize/2, enlargedSize, enlargedSize);
                    } else {
                        ctx.fillStyle = '#fff';
                        ctx.font = `${iconSize}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(item.emoji || defaultEmoji, iconX, iconY);
                    }
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.font = `${iconSize}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(item.emoji || defaultEmoji, iconX, iconY);
                }
            } else {
                // Для остальных используем стандартный метод
                const itemId = (this.currentTab === 'hooks' || this.currentTab === 'floats' || 
                               this.currentTab === 'lines' || this.currentTab === 'rods' || this.currentTab === 'reels') ? item.tier : item.id;
                
                assetManager.drawImageOrEmoji(
                    ctx, assetType, itemId,
                    iconX, iconY, iconSize,
                    item.emoji || defaultEmoji
                );
            }
        }
        
        // Сбрасываем прозрачность после отрисовки иконки
        ctx.globalAlpha = 1.0;
        
        // Добавляем иконку замка для заблокированных снастей (кроме премиум за ЯНы)
        if (item.isLocked && item.currency !== 'iap') {
            ctx.font = `${iconSize * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillText('🔒', iconX, iconY);
        }
        
        // Название
        ctx.fillStyle = '#fff';
        ctx.font = this.getFont(18);
        this.applyLetterSpacing(ctx, true); // Увеличенное расстояние для названий
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Получаем локализованное название
        let name = item.name || `Наживка ${item.id}`;
        if (this.currentTab === 'baits' && window.localizationSystem) {
            // Для наживок используем локализацию
            name = window.localizationSystem.getBaitName(item.id, item.name);
        } else if (item.type && item.tier && window.GearDB) {
            // Для снастей используем GearDB
            name = window.GearDB.getLocalizedGearName(item.type, item.tier, item.name);
        } else if ((this.currentTab === 'premium' || this.currentTab === 'iap') && window.localizationSystem && item.id) {
            // Для премиум товаров используем локализацию
            if (this.currentTab === 'iap') {
                name = window.localizationSystem.getIAPName(item.id, item.name);
            } else {
                name = window.localizationSystem.getBonusName(item.id, item.name);
            }
        }
        // Увеличиваем лимит символов и используем меньший шрифт для длинных названий
        const displayName = name.length > 24 ? name.substring(0, 22) + '...' : name;
        ctx.fillText(displayName, x + 80, y + 12);
        
        // Добавляем небольшую звездочку для премиальных товаров
        if (item.currency === 'iap') {
            const nameWidth = ctx.measureText(displayName).width;
            ctx.fillStyle = '#FFD700';
            ctx.font = this.getFont(14);
            ctx.fillText('★', x + 80 + nameWidth + 5, y + 12);
        }
        
        this.applyLetterSpacing(ctx, false); // Сброс
        
        // Цена
        if (item.isIAP) {
            if (item.type === 'ad_reward') {
                ctx.fillStyle = '#3498db';
                ctx.font = this.getFont(17);
                ctx.fillText(`${item.currentProgress}/${item.maxProgress} 📺`, x + 80, y + 38);
            } else if (item.type === 'exchange') {
                // Оранжевый цвет с белой обводкой
                ctx.font = this.getFont(17);
                
                const exchangeText = L('shop_exchange', 'Обмен');
                
                // Черная обводка для лучшей читаемости
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeText(`${exchangeText} 💱`, x + 80, y + 38);
                
                // Оранжевая заливка
                ctx.fillStyle = '#ff8c00';
                ctx.fillText(`${exchangeText} 💱`, x + 80, y + 38);
            } else {
                // Используем форматированную цену из SDK если доступна
                const priceText = item.priceFormatted || `${item.price} ${item.priceCurrencyCode || 'YAN'}`;
                ctx.fillStyle = '#e67e22';
                ctx.font = this.getFont(17);
                ctx.fillText(priceText, x + 80, y + 38);
            }
        } else if (item.isPremium) {
            // Для IAP товаров (currency === 'iap') или товаров с флагом hideGemIcon не показываем иконку гемов
            if (item.currency === 'iap' || item.hideGemIcon) {
                // Используем форматированную цену из SDK если доступна
                const priceText = item.priceFormatted || `${item.price} ${item.priceCurrencyCode || 'YAN'}`;
                ctx.fillStyle = '#e67e22';
                ctx.font = this.getFont(17);
                ctx.textAlign = 'left';
                ctx.fillText(priceText, x + 80, y + 38);
            } else {
                // Оранжевый цвет с белой обводкой для лучшей читаемости
                ctx.font = this.getFont(17);
                ctx.textAlign = 'left';
                
                // Черная обводка для лучшей читаемости
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeText(`${item.price}`, x + 80, y + 38);
                
                // Оранжевая заливка
                ctx.fillStyle = '#ff8c00';
                ctx.fillText(`${item.price}`, x + 80, y + 38);
                
                // Рисуем иконку гема справа от цены с отступом
                // drawGemIcon рисует по центру, поэтому добавляем половину размера иконки
                const priceWidth = ctx.measureText(`${item.price}`).width;
                const iconSize = 17;
                assetManager.drawGemIcon(ctx, x + 80 + priceWidth + 5 + iconSize/2, y + 38, iconSize);
            }
        } else {
            // Проверяем валюту товара
            if (item.currency === 'iap') {
                // Товар за ЯНы (IAP) - используем форматированную цену из SDK
                const priceText = item.priceFormatted || `${item.price} ${item.priceCurrencyCode || 'YAN'}`;
                ctx.fillStyle = '#e67e22';
                ctx.font = this.getFont(17);
                ctx.textAlign = 'left';
                ctx.fillText(priceText, x + 80, y + 38);
            } else if (item.currency === 'gems') {
                // Товар за гемы - отображаем с иконкой
                ctx.font = this.getFont(17);
                ctx.textAlign = 'left';
                
                // Черная обводка для лучшей читаемости
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeText(`${item.price}`, x + 80, y + 38);
                
                // Оранжевая заливка
                ctx.fillStyle = '#ff8c00';
                ctx.fillText(`${item.price}`, x + 80, y + 38);
                
                // Рисуем иконку гема справа от цены с отступом
                const priceWidth = ctx.measureText(`${item.price}`).width;
                const iconSize = 17;
                assetManager.drawGemIcon(ctx, x + 80 + priceWidth + 5 + iconSize/2, y + 38, iconSize);
            } else {
                // Товар за обычные монеты
                ctx.fillStyle = '#f1c40f';
                ctx.font = this.getFont(17);
                assetManager.drawTextWithCoinIcon(ctx, `${item.price} 💰`, x + 80, y + 38, 17);
            }
        }
        
        // Количество или дополнительная информация
        ctx.fillStyle = '#95a5a6';
        ctx.font = this.getFont(15, 'normal');
        if (item.isIAP && item.discount) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(`-${item.discount}%`, x + 80, y + 60);
        } else if (!item.isIAP) {
            ctx.fillText(`x${item.quantity}`, x + 80, y + 60);
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
        const detailsHeight = this.modalHeight - 160; // Увеличена высота с 240 до 160
        
        ctx.save();
        
        // Фон панели деталей
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.roundRect(detailsX, detailsY, detailsWidth, detailsHeight, 8);
        ctx.fill();
        
        if (this.selectedIndex < 0 || this.selectedIndex >= this.items.length) {
            // Нет выбранного элемента
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = this.getFont(20, 'normal');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L('shop_select_item', 'Выберите товар'), detailsX + detailsWidth / 2, detailsY + detailsHeight / 2);
            ctx.restore();
            return;
        }
        
        const item = this.items[this.selectedIndex];
        
        // Для премиальных товаров добавляем тонкую золотистую обводку
        if (item.currency === 'iap') {
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(detailsX, detailsY, detailsWidth, detailsHeight, 8);
            ctx.stroke();
        }
        
        // Иконка большая
        const iconSize = 100;
        const iconX = detailsX + detailsWidth / 2;
        const iconY = detailsY + 70;
        
        // Для товаров с рыболовными марками рисуем спрайт гема напрямую
        if (this.currentTab === 'iap' && item.type === 'premium_coins') {
            assetManager.drawGemIcon(ctx, iconX, iconY, iconSize);
        } else {
            // Для поплавков, лесок, крючков и удочек используем спрайты напрямую
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
                    ctx.fillText(item.emoji || '🎈', iconX, iconY);
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
                    ctx.fillText(item.emoji || '🧵', iconX, iconY);
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
                    ctx.fillText(item.emoji || '🪝', iconX, iconY);
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
                    ctx.fillText(item.emoji || '🎣', iconX, iconY);
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
                    ctx.fillText(item.emoji || '⚙️', iconX, iconY);
                }
            } else if (this.currentTab === 'baits') {
                // Для наживок используем спрайты n1.png - n21.png
                const baitId = item.id;
                const baitSpriteKey = `n${baitId}.png`;
                const baitSprite = assetManager.getImage(baitSpriteKey);
                
                if (baitSprite) {
                    ctx.drawImage(baitSprite, iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize);
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.font = `${iconSize}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(item.emoji || '🍞', iconX, iconY);
                }
            } else if (this.currentTab === 'premium' || this.currentTab === 'iap') {
                // Для премиум бонусов используем спрайты p1.png - p17.png (увеличены на 30%)
                if (item.spriteId) {
                    const premiumSpriteKey = `p${item.spriteId}.png`;
                    const premiumSprite = assetManager.getImage(premiumSpriteKey);
                    
                    if (premiumSprite) {
                        const premiumIconSize = iconSize * 1.3; // Увеличение на 30%
                        ctx.drawImage(premiumSprite, iconX - premiumIconSize/2, iconY - premiumIconSize/2, premiumIconSize, premiumIconSize);
                    } else {
                        ctx.fillStyle = '#fff';
                        ctx.font = `${iconSize}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(item.emoji || '💎', iconX, iconY);
                    }
                } else if (item.sprite) {
                    // Для покупок с прямым указанием спрайта (например, sereb.png)
                    const sprite = assetManager.getImage(item.sprite);
                    
                    if (sprite) {
                        const spriteIconSize = iconSize * 1.3; // Увеличение на 30%
                        ctx.drawImage(sprite, iconX - spriteIconSize/2, iconY - spriteIconSize/2, spriteIconSize, spriteIconSize);
                    } else {
                        ctx.fillStyle = '#fff';
                        ctx.font = `${iconSize}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(item.emoji || '💎', iconX, iconY);
                    }
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.font = `${iconSize}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(item.emoji || '💎', iconX, iconY);
                }
            } else {
                // Для остальных используем стандартный метод
                const assetType = this.currentTab === 'baits' ? 'bait' : 
                                 this.currentTab === 'hooks' ? 'hook' :
                                 this.currentTab === 'floats' ? 'float' :
                                 this.currentTab === 'lines' ? 'line' :
                                 this.currentTab === 'rods' ? 'rod' :
                                 this.currentTab === 'premium' ? 'premium' :
                                 this.currentTab === 'iap' ? 'iap' : 'bait';
                const defaultEmoji = this.currentTab === 'baits' ? '🍞' : 
                                    this.currentTab === 'hooks' ? '🪝' :
                                    this.currentTab === 'floats' ? '🎈' :
                                    this.currentTab === 'lines' ? '🧵' :
                                    this.currentTab === 'rods' ? '🎣' :
                                    this.currentTab === 'premium' ? '💎' :
                                    this.currentTab === 'iap' ? '💳' : '🍞';
                const itemId = (this.currentTab === 'hooks' || this.currentTab === 'floats' || 
                               this.currentTab === 'lines' || this.currentTab === 'rods') ? item.tier : item.id;
                
                assetManager.drawImageOrEmoji(
                    ctx, assetType, itemId,
                    iconX, iconY, iconSize,
                    item.emoji || defaultEmoji
                );
            }
        }
        
        // Название
        ctx.fillStyle = '#fff';
        ctx.font = this.getFont(28);
        this.applyLetterSpacing(ctx, true); // Увеличенное расстояние для названия
        ctx.textAlign = 'center';
        const defaultName = this.currentTab === 'baits' ? `Наживка ${item.id}` : 
                           this.currentTab === 'hooks' ? `Крючок ${item.tier}` :
                           this.currentTab === 'floats' ? `Поплавок ${item.tier}` :
                           this.currentTab === 'lines' ? `Леска ${item.tier}` :
                           this.currentTab === 'rods' ? `Удочка ${item.tier}` :
                           this.currentTab === 'iap' ? `IAP ${item.id}` : `Товар ${item.id}`;
        
        // Получаем локализованное название
        let itemName = item.name || defaultName;
        if (this.currentTab === 'baits' && window.localizationSystem) {
            // Для наживок используем локализацию
            itemName = window.localizationSystem.getBaitName(item.id, item.name);
        } else if (item.type && item.tier && window.GearDB) {
            // Для снастей используем GearDB
            itemName = window.GearDB.getLocalizedGearName(item.type, item.tier, item.name);
        } else if ((this.currentTab === 'premium' || this.currentTab === 'iap') && window.localizationSystem && item.id) {
            // Для премиум товаров используем локализацию
            if (this.currentTab === 'iap') {
                itemName = window.localizationSystem.getIAPName(item.id, item.name);
            } else {
                itemName = window.localizationSystem.getBonusName(item.id, item.name);
            }
        }
        ctx.fillText(itemName, detailsX + detailsWidth / 2, detailsY + 135);
        
        // Добавляем звездочку для премиальных товаров
        if (item.currency === 'iap') {
            const nameWidth = ctx.measureText(itemName).width;
            ctx.fillStyle = '#FFD700';
            ctx.font = this.getFont(24);
            ctx.fillText('★', detailsX + detailsWidth / 2 + nameWidth / 2 + 10, detailsY + 135);
        }
        
        this.applyLetterSpacing(ctx, false); // Сброс
        
        // Характеристики
        ctx.font = this.getFont(18, 'normal');
        ctx.textAlign = 'left';
        ctx.fillStyle = '#bdc3c7';
        
        let statsY = detailsY + 170;
        const statsX = detailsX + 25;
        const lineHeight = 28; // Уменьшен с 32 до 28
        
        // Характеристики в зависимости от типа товара
        if (this.currentTab === 'baits') {
            // Тип (локализованный)
            const baitType = window.localizationSystem ? 
                window.localizationSystem.getBaitType(item.id, item.type) : 
                (item.type || 'Универсальная');
            ctx.fillText(`${L('type', 'Тип')}: ${baitType}`, statsX, statsY);
            statsY += lineHeight;
            
            // Цель
            const targets = window.localizationSystem ? 
                window.localizationSystem.getBaitTargets(item.id, item.targets || 'Разная рыба') : 
                (item.targets || 'Разная рыба');
            ctx.fillText(`${L('targets', 'Цель')}: ${targets}`, statsX, statsY);
            statsY += lineHeight;
            
            // Разблокировка
            if (item.unlockTier) {
                ctx.fillStyle = '#f39c12';
                ctx.fillText(`${L('shop_unlock_level', 'Разблокировка: Уровень')} ${item.unlockTier}`, statsX, statsY);
                statsY += lineHeight;
                ctx.fillStyle = '#bdc3c7';
            }
        } else if (this.currentTab === 'hooks') {
            // Уровень (Tier)
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`${L('shop_level', 'Уровень')}: T${item.tier}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Удержание
            ctx.fillText(`${L('ui_hold_bonus', 'Удержание')}: +${item.holdBonus}`, statsX, statsY);
            statsY += lineHeight;
            
            // Проникновение
            ctx.fillText(`${L('ui_penetration', 'Проникновение')}: ${item.penetration}`, statsX, statsY);
            statsY += lineHeight;
            
            // Размер крючка
            ctx.fillText(`${L('hook_size', 'Размер')}: #${item.hookSize}`, statsX, statsY);
            statsY += lineHeight;
            
            // Максимальный вес рыбы
            ctx.fillStyle = '#3498db';
            ctx.fillText(`${L('ui_max_weight', 'Макс. вес')}: ${item.maxWeight} ${L('ui_kg', 'кг')}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Прочность
            ctx.fillText(`${L('shop_durability', 'Прочность')}: ${item.durability}`, statsX, statsY);
            statsY += lineHeight;
        } else if (this.currentTab === 'floats') {
            // Уровень (Tier)
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`${L('shop_level', 'Уровень')}: T${item.tier}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Чувствительность
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(`${L('ui_sensitivity', 'Чувствительность')}: ${item.sensitivity}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Стабильность
            ctx.fillStyle = '#2ecc71';
            ctx.fillText(`${L('ui_stability', 'Стабильность')}: ${item.stability}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Прочность
            ctx.fillText(`${L('shop_durability', 'Прочность')}: ${item.durability}`, statsX, statsY);
            statsY += lineHeight;
        } else if (this.currentTab === 'lines') {
            // Уровень (Tier)
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`${L('shop_level', 'Уровень')}: T${item.tier}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Тип лески
            ctx.fillStyle = '#3498db';
            ctx.fillText(`${L('shop_type', 'Тип')}: ${item.type}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Тест (прочность на разрыв)
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(`${L('shop_breaking_load', 'Разрывная нагрузка')}: ${item.testKg} ${L('ui_kg', 'кг')}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Устойчивость к истиранию
            ctx.fillText(`${L('ui_abrasion_resist', 'Истирание')}: ${item.abrasionResist}`, statsX, statsY);
            statsY += lineHeight;
            
            // Прочность
            ctx.fillText(`${L('shop_durability', 'Прочность')}: ${item.durability}`, statsX, statsY);
            statsY += lineHeight;
        } else if (this.currentTab === 'reels') {
            // Уровень (Tier)
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`${L('shop_level', 'Уровень')}: T${item.tier}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Фрикцион
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(`${L('ui_drag_kg', 'Фрикцион')}: ${item.dragKg} ${L('ui_kg', 'кг')}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Скорость подмотки
            ctx.fillStyle = '#3498db';
            ctx.fillText(`${L('ui_retrieve_speed', 'Скорость')}: ${item.retrieveSpeed}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Плавность
            ctx.fillText(`${L('ui_smoothness', 'Плавность')}: ${item.smoothness}`, statsX, statsY);
            statsY += lineHeight;
            
            // Прочность
            ctx.fillText(`${L('shop_durability', 'Прочность')}: ${item.durability}`, statsX, statsY);
            statsY += lineHeight;
        } else if (this.currentTab === 'rods') {
            // Уровень (Tier)
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`${L('shop_level', 'Уровень')}: T${item.tier}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Мощность
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(`${L('ui_power_cap', 'Мощность')}: ${item.powerCap}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Точность
            ctx.fillStyle = '#3498db';
            ctx.fillText(`${L('ui_accuracy', 'Точность')}: ${item.accuracy}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Бонус окна подсечки
            ctx.fillText(`${L('ui_hook_window', 'Окно подсечки')}: +${item.hookWindowBonus}`, statsX, statsY);
            statsY += lineHeight;
            
            // Бонус заброса
            ctx.fillText(`${L('ui_cast_bonus', 'Заброс')}: +${item.castBonus}`, statsX, statsY);
            statsY += lineHeight;
            
            // Максимальный вес рыбы
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(`${L('ui_max_weight', 'Макс. вес')}: ${item.maxWeight} ${L('ui_kg', 'кг')}`, statsX, statsY);
            statsY += lineHeight;
            ctx.fillStyle = '#bdc3c7';
            
            // Прочность
            ctx.fillText(`${L('shop_durability', 'Прочность')}: ${item.durability}`, statsX, statsY);
            statsY += lineHeight;
        } else if (this.currentTab === 'premium') {
            // Премиум товары - оранжевый цвет с белой обводкой
            ctx.font = this.getFont(18);
            
            // Длительность эффекта
            let durationText;
            if (item.duration === -1) {
                durationText = `${L('premium_duration', 'Длительность')}: ${L('premium_duration_permanent', 'Постоянно')}`;
            } else {
                const minutes = Math.floor(item.duration / 60);
                const hours = Math.floor(minutes / 60);
                if (hours > 0) {
                    const hourWord = hours > 1 ? L('premium_duration_hours', 'часа') : L('premium_duration_hour', 'час');
                    durationText = `${L('premium_duration', 'Длительность')}: ${hours} ${hourWord}`;
                } else {
                    durationText = `${L('premium_duration', 'Длительность')}: ${minutes} ${L('premium_duration_minutes', 'минут')}`;
                }
            }
            
            // Черная обводка для лучшей читаемости
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeText(durationText, statsX, statsY);
            
            // Оранжевая заливка
            ctx.fillStyle = '#ff8c00';
            ctx.fillText(durationText, statsX, statsY);
            statsY += lineHeight;
            
            // Эффект
            ctx.fillStyle = '#bdc3c7';
            ctx.font = this.getFont(18, 'normal');
            
            let effectText = L('premium_effect', 'Эффект') + ': ';
            if (item.effect.type === 'power_boost') {
                effectText += L('premium_effect_power_boost', '+{value}% к силе').replace('{value}', Math.round(item.effect.value * 100));
            } else if (item.effect.type === 'bite_frequency') {
                effectText += L('premium_effect_bite_frequency', '+{value}% к поклевкам').replace('{value}', Math.round(item.effect.value * 100));
            } else if (item.effect.type === 'treasure_luck') {
                effectText += L('premium_effect_treasure_luck', '+{value}% к драгоценностям').replace('{value}', Math.round(item.effect.value * 100));
            } else if (item.effect.type === 'monster_chance') {
                effectText += L('premium_effect_monster_chance', '+{value}% к монстрам').replace('{value}', Math.round(item.effect.value * 100));
            } else if (item.effect.type === 'sonar_basic') {
                effectText += L('premium_effect_sonar_basic', 'Показывает вес и количество рыб');
            } else if (item.effect.type === 'sonar_advanced') {
                effectText += L('premium_effect_sonar_advanced', 'Показывает вес, количество и виды');
            } else if (item.effect.type === 'compass') {
                effectText += L('premium_effect_compass', 'Показывает количество рыб');
            } else if (item.effect.type === 'time_slow') {
                effectText += L('premium_effect_time_slow', 'Замедляет время в 2 раза');
            } else if (item.effect.type === 'fish_scanner') {
                effectText += L('premium_effect_fish_scanner', 'Показывает вид рыбы при поклевке');
            } else if (item.effect.type === 'travel_discount') {
                effectText += L('premium_effect_travel_discount', '-10% на перемещение');
            } else if (item.effect.type === 'repair_all') {
                effectText += L('premium_effect_repair_all', 'Ремонтирует все снасти');
            } else if (item.effect.type === 'repair_one') {
                effectText += L('premium_effect_repair_one', 'Ремонтирует одну снасть');
            } else if (item.effect.type === 'rare_fish_boost') {
                effectText += L('premium_effect_rare_fish_boost', '+{value}% к редкой рыбе').replace('{value}', Math.round(item.effect.value * 100));
            } else if (item.effect.type === 'price_boost') {
                effectText += L('premium_effect_price_boost', '+{value}% к цене рыбы').replace('{value}', Math.round(item.effect.value * 100));
            } else if (item.effect.type === 'xp_boost') {
                effectText += L('premium_effect_xp_boost', '+{value}% к опыту').replace('{value}', Math.round(item.effect.value * 100));
            }
            ctx.fillText(effectText, statsX, statsY);
            statsY += lineHeight;
            
            // Проверяем активен ли эффект
            if (this.premiumEffects) {
                if (item.duration === -1) {
                    // Постоянный эффект
                    if (item.effect.type === 'sonar_basic' && this.premiumEffects.permanentEffects.sonar === 'basic') {
                        ctx.fillStyle = '#2ecc71';
                        ctx.fillText(L('premium_active', '✓ Активен'), statsX, statsY);
                        statsY += lineHeight;
                    } else if (item.effect.type === 'sonar_advanced' && this.premiumEffects.permanentEffects.sonar === 'advanced') {
                        ctx.fillStyle = '#2ecc71';
                        ctx.fillText(L('premium_active', '✓ Активен'), statsX, statsY);
                        statsY += lineHeight;
                    }
                } else {
                    // Временный эффект
                    const remaining = this.premiumEffects.getRemainingTime(item.effect.type);
                    if (remaining > 0) {
                        ctx.fillStyle = '#2ecc71';
                        const mins = Math.floor(remaining / 60);
                        const secs = remaining % 60;
                        const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
                        ctx.fillText(L('premium_active_time', '✓ Активен: {time}').replace('{time}', timeStr), statsX, statsY);
                        statsY += lineHeight;
                    }
                }
            }
            ctx.fillStyle = '#bdc3c7';
        } else if (this.currentTab === 'iap') {
            // IAP товары
            ctx.fillStyle = '#e67e22';
            ctx.font = this.getFont(18);
            
            // Тип товара
            if (item.type === 'bundle') {
                ctx.fillText(`${L('shop_type', 'Тип')}: ${L('shop_type_bundle', 'Набор')}`, statsX, statsY);
                statsY += lineHeight;
                
                // Скидка
                if (item.discount) {
                    ctx.fillStyle = '#e74c3c';
                    ctx.fillText(`${L('shop_discount', 'Скидка:')} -${item.discount}%`, statsX, statsY);
                    statsY += lineHeight;
                    ctx.fillStyle = '#bdc3c7';
                    
                    // Старая цена
                    ctx.fillStyle = '#95a5a6';
                    ctx.font = this.getFont(16, 'normal');
                    ctx.fillText(`${L('shop_regular_price', 'Обычная цена:')} ${item.originalPrice} ЯН`, statsX, statsY);
                    statsY += lineHeight;
                    ctx.fillStyle = '#bdc3c7';
                    ctx.font = this.getFont(18, 'normal');
                }
                
                // Содержимое набора (в 2 столбика)
                ctx.fillStyle = '#2ecc71';
                ctx.fillText(`${L('shop_contents', 'Содержимое:')}`, statsX, statsY);
                statsY += lineHeight;
                ctx.fillStyle = '#bdc3c7';
                ctx.font = this.getFont(16, 'normal');
                
                const col1X = statsX;
                const col2X = statsX + (detailsWidth - 50) / 2;
                let col1Y = statsY;
                let col2Y = statsY;
                
                if (item.contents.premiumCoins) {
                    // Рисуем иконку гема слева и текст справа
                    ctx.textAlign = 'left';
                    const iconSize = 16;
                    assetManager.drawGemIcon(ctx, col1X + iconSize/2, col1Y, iconSize);
                    ctx.fillText(`${item.contents.premiumCoins} ${L('shop_premium', 'премиум')}`, col1X + iconSize + 5, col1Y);
                    col1Y += 22;
                }
                if (item.contents.regularCoins) {
                    assetManager.drawTextWithCoinIcon(ctx, `💰 ${item.contents.regularCoins} ${L('shop_regular', 'обычных')}`, col1X, col1Y, 16);
                    col1Y += 22;
                }
                if (item.contents.energyDrink) {
                    ctx.fillText(`⚡ ${item.contents.energyDrink} ${L('shop_energy_drink', 'энергетика')}`, col2X, col2Y);
                    col2Y += 22;
                }
                if (item.contents.feedBonus) {
                    ctx.fillText(`🌾 ${item.contents.feedBonus} ${L('shop_groundbait', 'подкормки')}`, col2X, col2Y);
                    col2Y += 22;
                }
                if (item.contents.noAds) {
                    ctx.fillText(`🚫 ${L('shop_no_ads', 'Без рекламы')}`, col2X, col2Y);
                    col2Y += 22;
                }
                
                statsY = Math.max(col1Y, col2Y) + 5;
                ctx.font = this.getFont(18, 'normal');
            } else if (item.type === 'gear_bundle') {
                ctx.fillText(`${L('shop_type', 'Тип')}: ${L('shop_type_gear_bundle', 'Набор снастей')}`, statsX, statsY);
                statsY += lineHeight;
                
                // Скидка
                if (item.discount) {
                    ctx.fillStyle = '#e74c3c';
                    ctx.fillText(`${L('shop_discount', 'Скидка:')} -${item.discount}%`, statsX, statsY);
                    statsY += lineHeight;
                    ctx.fillStyle = '#bdc3c7';
                    ctx.font = this.getFont(18, 'normal');
                }
                
                // Содержимое набора снастей
                ctx.fillStyle = '#2ecc71';
                ctx.fillText(`${L('shop_includes', 'В наборе:')}`, statsX, statsY);
                statsY += lineHeight;
                ctx.fillStyle = '#bdc3c7';
                ctx.font = this.getFont(16, 'normal');
                
                if (item.contents.rod) {
                    const rod = RODS_DATABASE.find(r => r.tier === item.contents.rod);
                    if (rod) {
                        // Рисуем спрайт удочки
                        const rodSprite = assetManager.getImage(`u${item.contents.rod}.png`);
                        const rodName = L(`gear_rod_${rod.tier}_name`, rod.name);
                        if (rodSprite) {
                            ctx.drawImage(rodSprite, statsX, statsY - 8, 16, 16);
                            ctx.fillText(rodName, statsX + 20, statsY);
                        } else {
                            ctx.fillText(`🎣 ${rodName}`, statsX, statsY);
                        }
                        statsY += 22;
                    }
                }
                if (item.contents.line) {
                    const line = LINES_DATABASE.find(l => l.tier === item.contents.line);
                    if (line) {
                        // Рисуем спрайт лески
                        const lineSprite = assetManager.getImage(`l_${item.contents.line}.png`);
                        const lineName = L(`gear_line_${line.tier}_name`, line.name);
                        if (lineSprite) {
                            ctx.drawImage(lineSprite, statsX, statsY - 8, 16, 16);
                            ctx.fillText(lineName, statsX + 20, statsY);
                        } else {
                            ctx.fillText(`🧵 ${lineName}`, statsX, statsY);
                        }
                        statsY += 22;
                    }
                }
                if (item.contents.float) {
                    const float = FLOATS_DATABASE.find(f => f.tier === item.contents.float);
                    if (float) {
                        // Рисуем спрайт поплавка
                        const floatFileName = item.contents.float < 10 
                            ? `float_0${item.contents.float}.png` 
                            : `float_${item.contents.float}.png`;
                        const floatSprite = assetManager.getImage(floatFileName);
                        const floatName = L(`gear_float_${float.tier}_name`, float.name);
                        if (floatSprite) {
                            ctx.drawImage(floatSprite, statsX, statsY - 8, 16, 16);
                            ctx.fillText(floatName, statsX + 20, statsY);
                        } else {
                            ctx.fillText(`🎈 ${floatName}`, statsX, statsY);
                        }
                        statsY += 22;
                    }
                }
                if (item.contents.hook) {
                    const hook = HOOKS_DATABASE.find(h => h.tier === item.contents.hook);
                    if (hook) {
                        // Рисуем спрайт крючка
                        const hookSprite = assetManager.getImage(`k_${item.contents.hook}.png`);
                        const hookName = L(`gear_hook_${hook.tier}_name`, hook.name);
                        if (hookSprite) {
                            ctx.drawImage(hookSprite, statsX, statsY - 8, 16, 16);
                            ctx.fillText(hookName, statsX + 20, statsY);
                        } else {
                            ctx.fillText(`🪝 ${hookName}`, statsX, statsY);
                        }
                        statsY += 22;
                    }
                }
                if (item.contents.reel) {
                    const reel = REELS_DATABASE.find(r => r.tier === item.contents.reel);
                    if (reel) {
                        // Рисуем спрайт катушки
                        const reelSprite = assetManager.getImage(`h${item.contents.reel}.png`);
                        const reelName = L(`gear_reel_${reel.tier}_name`, reel.name);
                        if (reelSprite) {
                            ctx.drawImage(reelSprite, statsX, statsY - 8, 16, 16);
                            ctx.fillText(reelName, statsX + 20, statsY);
                        } else {
                            ctx.fillText(`⚙️ ${reelName}`, statsX, statsY);
                        }
                        statsY += 22;
                    }
                }
            } else if (item.type === 'ad_reward') {
                ctx.fillText(`${L('shop_type', 'Тип')}: ${L('shop_type_ad_reward', 'Награда за рекламу')}`, statsX, statsY);
                statsY += lineHeight;
                
                // Прогресс
                ctx.fillStyle = '#3498db';
                ctx.font = this.getFont(20);
                ctx.fillText(`Прогресс: ${item.currentProgress}/${item.maxProgress}`, statsX, statsY);
                statsY += lineHeight;
                ctx.fillStyle = '#bdc3c7';
                ctx.font = this.getFont(18, 'normal');
                
                // Награда
                ctx.fillStyle = '#2ecc71';
                ctx.fillText(`Награда:`, statsX, statsY);
                statsY += lineHeight;
                ctx.fillStyle = '#bdc3c7';
                
                // Проверяем поддержку IAP платформой
                const supportsIAP = window.playgamaSDK && window.playgamaSDK.isPlatformSupportsIAP();
                
                // Всегда показываем обычные монеты (Requirement 5.4)
                if (item.reward.regularCoins) {
                    const coinsText = L('shop_regular_coins', '{amount} обычных монет').replace('{amount}', item.reward.regularCoins);
                    assetManager.drawTextWithCoinIcon(ctx, `  💰 ${coinsText}`, statsX, statsY, 18);
                    statsY += lineHeight;
                }
                
                // Показываем премиум валюту только если платформа НЕ поддерживает IAP (Requirements 5.5, 7.1.5)
                if (!supportsIAP && item.reward.premiumCoins) {
                    const gemsText = L('shop_premium_coins', '{amount} рыболовных марок').replace('{amount}', item.reward.premiumCoins);
                    assetManager.drawTextWithGemIcon(ctx, `  💎 ${gemsText}`, statsX, statsY, 18);
                    statsY += lineHeight;
                }
            } else if (item.type === 'premium_coins') {
                ctx.fillText(`${L('shop_type', 'Тип')}: ${L('shop_type_premium_coins', 'Рыболовные марки')}`, statsX, statsY);
                statsY += lineHeight;
                
                // Количество - оранжевый цвет с белой обводкой
                ctx.font = this.getFont(20);
                ctx.textAlign = 'left';
                
                const marksText = L('shop_fishing_marks_amount', '{amount} марок').replace('{amount}', item.contents.premiumCoins);
                
                // Черная обводка для лучшей читаемости
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeText(marksText, statsX, statsY);
                
                // Оранжевая заливка
                ctx.fillStyle = '#ff8c00';
                ctx.fillText(marksText, statsX, statsY);
                
                // Рисуем иконку гема слева от текста
                const iconSize = 20;
                assetManager.drawGemIcon(ctx, statsX - iconSize/2 - 5, statsY, iconSize);
                statsY += lineHeight;
                ctx.fillStyle = '#bdc3c7';
                ctx.font = this.getFont(18, 'normal');
            } else if (item.type === 'exchange') {
                ctx.fillText(`${L('shop_type', 'Тип')}: ${L('shop_type_exchange', 'Обмен валюты')}`, statsX, statsY);
                statsY += lineHeight;
                
                // Курс обмена
                ctx.fillStyle = '#f39c12';
                ctx.font = this.getFont(18);
                
                // Рисуем курс обмена со спрайтами вместо эмодзи
                const rateLabel = window.localizationSystem ? window.localizationSystem.t('exchange_rate', 'Курс') : 'Курс';
                const courseText = `${rateLabel}: 1`;
                const courseWidth = ctx.measureText(courseText).width;
                const gemIconSize = 18;
                const equalText = ` = ${item.exchangeRate}`;
                const equalWidth = ctx.measureText(equalText).width;
                const coinIconSize = 18;
                
                const totalWidth = courseWidth + gemIconSize + equalWidth + coinIconSize + 10;
                const startX = statsX;
                
                ctx.fillText(courseText, startX, statsY);
                assetManager.drawGemIcon(ctx, startX + courseWidth + gemIconSize/2 + 5, statsY, gemIconSize);
                ctx.fillText(equalText, startX + courseWidth + gemIconSize + 10, statsY);
                
                const coinImage = assetManager.getImage('sereb.png');
                if (coinImage) {
                    ctx.drawImage(coinImage, 
                        startX + courseWidth + gemIconSize + equalWidth + 10, 
                        statsY - coinIconSize/2, 
                        coinIconSize, coinIconSize);
                }
                
                statsY += lineHeight + 10;
                ctx.fillStyle = '#bdc3c7';
                ctx.font = this.getFont(18, 'normal');
                
                // Ползунок для выбора количества
                const sliderWidth = detailsWidth - 100;
                const sliderX = statsX + 40;
                const sliderY = statsY;
                
                // Сохраняем позицию ползунка
                this.exchangeSlider.x = sliderX;
                this.exchangeSlider.y = sliderY;
                this.exchangeSlider.width = sliderWidth;
                
                // Стрелочки
                this.exchangeArrows.left.x = statsX;
                this.exchangeArrows.left.y = sliderY + 10;
                this.exchangeArrows.right.x = sliderX + sliderWidth + 10;
                this.exchangeArrows.right.y = sliderY + 10;
                
                // Ограничиваем значение
                const maxExchange = Math.min(this.playerPremiumCoins, item.maxExchange);
                this.exchangeAmount = Math.max(item.minExchange, Math.min(this.exchangeAmount, maxExchange));
                
                // Рисуем стрелочки
                ctx.save();
                
                // Левая стрелка
                ctx.fillStyle = this.exchangeAmount > item.minExchange ? '#3498db' : '#7f8c8d';
                ctx.beginPath();
                ctx.moveTo(this.exchangeArrows.left.x + 20, this.exchangeArrows.left.y);
                ctx.lineTo(this.exchangeArrows.left.x + 5, this.exchangeArrows.left.y + 10);
                ctx.lineTo(this.exchangeArrows.left.x + 20, this.exchangeArrows.left.y + 20);
                ctx.fill();
                
                // Правая стрелка
                ctx.fillStyle = this.exchangeAmount < maxExchange ? '#3498db' : '#7f8c8d';
                ctx.beginPath();
                ctx.moveTo(this.exchangeArrows.right.x, this.exchangeArrows.right.y);
                ctx.lineTo(this.exchangeArrows.right.x + 15, this.exchangeArrows.right.y + 10);
                ctx.lineTo(this.exchangeArrows.right.x, this.exchangeArrows.right.y + 20);
                ctx.fill();
                
                // Фон ползунка
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.beginPath();
                ctx.roundRect(sliderX, sliderY, sliderWidth, 20, 10);
                ctx.fill();
                
                // Заполненная часть
                const fillRatio = (this.exchangeAmount - item.minExchange) / (maxExchange - item.minExchange);
                ctx.fillStyle = '#9b59b6';
                ctx.beginPath();
                ctx.roundRect(sliderX, sliderY, sliderWidth * fillRatio, 20, 10);
                ctx.fill();
                
                // Ползунок
                const thumbX = sliderX + sliderWidth * fillRatio;
                const thumbY = sliderY + 10; // Центр ползунка
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(thumbX, thumbY, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#9b59b6';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                // Обновляем высоту области для правильного клика
                this.exchangeSlider.height = 20;
                
                ctx.restore();
                
                statsY += 40;
                
                // Показываем количество
                ctx.fillStyle = '#fff';
                ctx.font = this.getFont(20);
                ctx.textAlign = 'center';
                const amountText = `${this.exchangeAmount}`;
                const amountWidth = ctx.measureText(amountText).width;
                const iconSize = 20;
                // Рисуем текст и иконку по центру
                ctx.fillText(amountText, detailsX + detailsWidth / 2 - iconSize/2 - 2, statsY);
                assetManager.drawGemIcon(ctx, detailsX + detailsWidth / 2 + amountWidth / 2 + iconSize/2, statsY, iconSize);
                statsY += 30;
                
                // Показываем результат обмена
                const resultCoins = this.exchangeAmount * item.exchangeRate;
                ctx.fillStyle = '#f39c12';
                ctx.font = this.getFont(24);
                ctx.fillText(`↓`, detailsX + detailsWidth / 2, statsY);
                statsY += 35;
                
                // Рисуем результат со спрайтом монет
                ctx.fillStyle = '#2ecc71';
                ctx.font = this.getFont(24);
                const resultText = `${resultCoins}`;
                const resultWidth = ctx.measureText(resultText).width;
                const resultIconSize = 24;
                
                ctx.fillText(resultText, detailsX + detailsWidth / 2 - resultIconSize/2 - 2, statsY);
                
                const resultCoinImage = assetManager.getImage('sereb.png');
                if (resultCoinImage) {
                    ctx.drawImage(resultCoinImage, 
                        detailsX + detailsWidth / 2 + resultWidth / 2 + 5, 
                        statsY - resultIconSize/2, 
                        resultIconSize, resultIconSize);
                }
                
                statsY += 30;
                
                ctx.textAlign = 'left';
                ctx.font = this.getFont(18, 'normal');
                ctx.fillStyle = '#bdc3c7';
            }
        }
        
        // Цена
        if (item.isIAP) {
            if (item.type === 'ad_reward') {
                ctx.fillStyle = '#3498db';
                ctx.font = this.getFont(20);
                ctx.fillText(L('exchange_free_ad', 'Бесплатно (реклама)'), statsX, statsY);
            } else if (item.type === 'exchange') {
                // Оранжевый цвет с белой обводкой
                ctx.font = this.getFont(20);
                
                const exchangeText = L('exchange_fishing_marks', 'Обмен рыболовных марок');
                
                // Черная обводка для лучшей читаемости
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeText(exchangeText, statsX, statsY);
                
                // Оранжевая заливка
                ctx.fillStyle = '#ff8c00';
                ctx.fillText(exchangeText, statsX, statsY);
            } else {
                // Используем форматированную цену из SDK если доступна
                const priceText = item.priceFormatted || `${item.price} ${item.priceCurrencyCode || 'YAN'}`;
                ctx.fillStyle = '#e67e22';
                ctx.font = this.getFont(20);
                ctx.fillText(`${L('shop_price', 'Цена:')} ${priceText}`, statsX, statsY);
            }
        } else if (item.isPremium) {
            // Для IAP товаров (currency === 'iap') или товаров с флагом hideGemIcon не показываем иконку гемов
            if (item.currency === 'iap' || item.hideGemIcon) {
                // Используем форматированную цену из SDK если доступна
                const priceText = item.priceFormatted || `${item.price} ${item.priceCurrencyCode || 'YAN'}`;
                ctx.fillStyle = '#e67e22';
                ctx.font = this.getFont(20);
                ctx.textAlign = 'left';
                ctx.fillText(`${L('shop_price', 'Цена:')} ${priceText}`, statsX, statsY);
            } else {
                // Оранжевый цвет с белой обводкой для лучшей читаемости
                ctx.font = this.getFont(20);
                ctx.textAlign = 'left';
                
                const priceText = `${L('shop_price', 'Цена:')} ${item.price}`;
                
                // Черная обводка для лучшей читаемости
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeText(priceText, statsX, statsY);
                
                // Оранжевая заливка
                ctx.fillStyle = '#ff8c00';
                ctx.fillText(priceText, statsX, statsY);
                
                // Рисуем иконку гема справа от цены с отступом
                // drawGemIcon рисует по центру, поэтому добавляем половину размера иконки
                const priceWidth = ctx.measureText(priceText).width;
                const iconSize = 20;
                assetManager.drawGemIcon(ctx, statsX + priceWidth + 5 + iconSize/2, statsY, iconSize);
            }
        } else {
            // Проверяем валюту товара
            if (item.currency === 'iap') {
                // Товар за ЯНы (IAP) - используем форматированную цену из SDK
                const priceText = item.priceFormatted || `${item.price} ${item.priceCurrencyCode || 'YAN'}`;
                ctx.fillStyle = '#e67e22';
                ctx.font = this.getFont(20);
                ctx.textAlign = 'left';
                ctx.fillText(`${L('shop_price', 'Цена:')} ${priceText}`, statsX, statsY);
            } else {
                // Товар за обычные монеты
                ctx.fillStyle = '#f1c40f';
                ctx.font = this.getFont(20);
                assetManager.drawTextWithCoinIcon(ctx, `${L('shop_price', 'Цена:')} ${item.price} 💰 (x${item.quantity})`, statsX, statsY, 20);
            }
        }
        statsY += lineHeight + 8;
        
        // Описание
        if (item.description) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = this.getFont(22, 'normal'); // Увеличено еще на 15%
            
            // Получаем локализованное описание
            let description = item.description;
            if ((this.currentTab === 'premium' || this.currentTab === 'iap') && window.localizationSystem && item.id) {
                if (this.currentTab === 'iap') {
                    description = window.localizationSystem.getIAPDescription(item.id, item.description);
                } else {
                    description = window.localizationSystem.getBonusDescription(item.id, item.description);
                }
            } else if (item.type && item.tier && window.GearDB) {
                description = window.GearDB.getLocalizedGearDescription(item.type, item.tier, item.description);
            }
            
            // Добавляем таймер кулдауна для рекламных наград
            if (item.type === 'ad_reward' && item.cooldown) {
                const now = Date.now();
                const timeSinceLastClaim = now - (item.lastClaimTime || 0);
                
                if (item.currentProgress === 0 && timeSinceLastClaim < item.cooldown) {
                    // На кулдауне - показываем таймер
                    const timeRemaining = item.cooldown - timeSinceLastClaim;
                    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
                    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
                    const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
                    
                    let timerText = '';
                    if (hours > 0) {
                        timerText = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                    } else {
                        timerText = `${minutes}:${String(seconds).padStart(2, '0')}`;
                    }
                    
                    description += `\n\n⏱️ ${L('cooldown', 'Доступно через')}: ${timerText}`;
                } else if (item.currentProgress > 0) {
                    // Показываем прогресс
                    description += `\n\n📺 ${L('progress', 'Прогресс')}: ${item.currentProgress}/${item.maxProgress}`;
                }
            }
            
            const words = description.split(' ');
            let line = '';
            let descY = statsY;
            const maxWidth = detailsWidth - 50;
            
            words.forEach(word => {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && line !== '') {
                    // Черная обводка
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.strokeText(line.trim(), statsX, descY);
                    // Белый текст поверх
                    ctx.fillText(line.trim(), statsX, descY);
                    line = word + ' ';
                    descY += 20; // Уменьшен с 24 до 20
                } else {
                    line = testLine;
                }
            });
            
            if (line.trim()) {
                // Черная обводка
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeText(line.trim(), statsX, descY);
                // Белый текст поверх
                ctx.fillText(line.trim(), statsX, descY);
            }
        }
        
        ctx.restore();
        
        // Кнопки
        this.renderFishListButton(ctx, item);
        this.renderBuyButton(ctx, item);
    }
    
    renderFishListButton(ctx, item) {
        // Кнопка "Виды рыб" показывается только для наживок
        if (this.currentTab !== 'baits') return;
        
        // Отладка: выводим координаты кнопки раз в 2 секунды
        if (!this._buttonDebugCounter) this._buttonDebugCounter = 0;
        this._buttonDebugCounter++;
        if (this._buttonDebugCounter % 120 === 0) {
            console.log('📍 Координаты кнопки "Виды рыб":', {
                x: this.fishListButton.x,
                y: this.fishListButton.y,
                width: this.fishListButton.width,
                height: this.fishListButton.height,
                modalY: this.modalY,
                modalHeight: this.modalHeight
            });
        }
        
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
        ctx.font = this.getFont(20);
        this.applyLetterSpacing(ctx, true); // Увеличенное расстояние
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Черная обводка текста
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(L('shop_fish_types', 'Виды рыб'), 
            this.fishListButton.x + this.fishListButton.width / 2, 
            this.fishListButton.y + this.fishListButton.height / 2
        );
        
        // Белый текст поверх обводки
        ctx.fillText(L('shop_fish_types', 'Виды рыб'), 
            this.fishListButton.x + this.fishListButton.width / 2, 
            this.fishListButton.y + this.fishListButton.height / 2
        );
        this.applyLetterSpacing(ctx, false); // Сброс
        
        ctx.restore();
    }
    
    renderBuyButton(ctx, item) {
        // Проверяем поддержку IAP платформой (Requirement 6.7)
        const supportsIAP = window.playgamaSDK && window.playgamaSDK.isPlatformSupportsIAP();
        
        // Проверяем можно ли купить
        let canBuy = false;
        let buttonText = '';
        let buttonColor1 = '';
        let buttonColor2 = '';
        let strokeColor = '';
        
        // Проверяем заблокирована ли снасть по уровню (кроме премиум снастей за ЯНы)
        const isPremiumIAP = item.currency === 'iap';
        if (item.isLocked && !isPremiumIAP) {
            canBuy = false;
            buttonText = `🔒 ${L('level', 'Уровень')} ${item.requiredLevel}`;
            buttonColor1 = '#95a5a6';
            buttonColor2 = '#7f8c8d';
            strokeColor = '#7f8c8d';
        } else if (item.isIAP) {
            if (item.type === 'ad_reward') {
                canBuy = item.currentProgress < item.maxProgress;
                buttonText = canBuy ? L('watch_ad', 'Смотреть\nрекламу') : L('claim_reward', 'Получить награду');
                buttonColor1 = '#3498db';
                buttonColor2 = '#2980b9';
                strokeColor = '#5dade2';
            } else if (item.type === 'exchange') {
                canBuy = this.playerPremiumCoins >= 1;
                buttonText = canBuy ? L('exchange', 'Обменять') : L('insufficient', 'Недостаточно');
                buttonColor1 = '#9b59b6';
                buttonColor2 = '#8e44ad';
                strokeColor = '#8e44ad';
            } else {
                // Проверяем поддержку IAP (Requirement 7.1)
                if (supportsIAP) {
                    // Платформа поддерживает IAP - показываем цену в реальных деньгах
                    canBuy = true; // IAP всегда доступны
                    // Используем форматированную цену из SDK если доступна
                    const priceText = item.priceFormatted || `${item.price} ${item.priceCurrencyCode || 'YAN'}`;
                    buttonText = `${L('buy', 'Купить')} ${priceText}`;
                    buttonColor1 = '#e67e22';
                    buttonColor2 = '#d35400';
                    strokeColor = '#d35400';
                } else {
                    // Платформа НЕ поддерживает IAP - показываем цену в премиум валюте (Requirement 7.1)
                    const fallbackPrice = item.fallbackPrice || 0;
                    canBuy = this.playerPremiumCoins >= fallbackPrice;
                    buttonText = canBuy ? `${L('buy', 'Купить')} ${fallbackPrice}` : L('insufficient', 'Недостаточно');
                    buttonColor1 = '#9b59b6';
                    buttonColor2 = '#8e44ad';
                    strokeColor = canBuy ? '#8e44ad' : '#95a5a6';
                }
            }
        } else if (item.isPremium) {
            // Проверяем валюту бонуса
            if (item.currency === 'iap') {
                // Проверяем поддержку IAP (Requirement 7.1)
                if (supportsIAP) {
                    // Платформа поддерживает IAP - показываем цену в реальных деньгах
                    canBuy = true; // IAP всегда доступны
                    // Используем форматированную цену из SDK если доступна
                    const priceText = item.priceFormatted || `${item.price} ${item.priceCurrencyCode || 'YAN'}`;
                    buttonText = `${L('buy', 'Купить')} ${priceText}`;
                    buttonColor1 = '#e67e22';
                    buttonColor2 = '#d35400';
                    strokeColor = '#d35400';
                } else {
                    // Платформа НЕ поддерживает IAP - показываем цену в премиум валюте (Requirement 7.1)
                    const fallbackPrice = item.fallbackPrice || 0;
                    canBuy = this.playerPremiumCoins >= fallbackPrice;
                    buttonText = canBuy ? `${L('buy', 'Купить')} ${fallbackPrice}` : L('insufficient', 'Недостаточно');
                    buttonColor1 = '#9b59b6';
                    buttonColor2 = '#8e44ad';
                    strokeColor = canBuy ? '#8e44ad' : '#95a5a6';
                }
            } else {
                // Обычные гемы
                canBuy = this.playerPremiumCoins >= item.price;
                buttonText = canBuy ? `${L('buy', 'Купить')} ${item.price}` : L('insufficient', 'Недостаточно');
                buttonColor1 = '#9b59b6';
                buttonColor2 = '#8e44ad';
                strokeColor = canBuy ? '#8e44ad' : '#95a5a6';
            }
        } else {
            // Проверяем валюту товара
            if (item.currency === 'iap') {
                // Товар за ЯНы (IAP) - проверяем поддержку платформы
                // Проверяем поддержку IAP (Requirement 7.1)
                if (supportsIAP) {
                    // Платформа поддерживает IAP - показываем цену в реальных деньгах
                    canBuy = true; // Всегда доступны
                    const priceText = item.priceFormatted || `${item.price} ${item.priceCurrencyCode || 'YAN'}`;
                    buttonText = `${L('buy', 'Купить')} ${priceText}`;
                    buttonColor1 = '#e67e22';
                    buttonColor2 = '#d35400';
                    strokeColor = '#d35400';
                } else {
                    // Платформа НЕ поддерживает IAP - показываем цену в премиум валюте (Requirement 7.1)
                    const fallbackPrice = item.fallbackPrice || 0;
                    canBuy = this.playerPremiumCoins >= fallbackPrice;
                    buttonText = canBuy ? `${L('buy', 'Купить')} ${fallbackPrice}` : L('insufficient', 'Недостаточно');
                    buttonColor1 = '#9b59b6';
                    buttonColor2 = '#8e44ad';
                    strokeColor = canBuy ? '#8e44ad' : '#95a5a6';
                }
            } else if (item.currency === 'gems') {
                // Товар за гемы
                canBuy = this.playerPremiumCoins >= item.price;
                buttonText = canBuy ? `${L('buy', 'Купить')} ${item.price}` : L('insufficient', 'Недостаточно');
                buttonColor1 = '#9b59b6';
                buttonColor2 = '#8e44ad';
                strokeColor = canBuy ? '#8e44ad' : '#95a5a6';
            } else {
                // Товар за обычные монеты
                canBuy = this.playerCoins >= item.price;
                buttonText = canBuy ? L('buy', 'Купить') : L('insufficient', 'Недостаточно');
                buttonColor1 = '#27ae60';
                buttonColor2 = '#1e8449';
                strokeColor = canBuy ? '#2ecc71' : '#95a5a6';
            }
        }
        
        ctx.save();
        
        // Применяем масштаб для анимации нажатия
        const centerX = this.buyButton.x + this.buyButton.width / 2;
        const centerY = this.buyButton.y + this.buyButton.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.scale(this.buyButton.scale, this.buyButton.scale);
        ctx.translate(-centerX, -centerY);
        
        // Получаем изображение uipan.png
        const uipanImage = assetManager.getImage('uipan.png');
        
        if (uipanImage) {
            // Рисуем фон кнопки используя uipan.png
            ctx.drawImage(
                uipanImage,
                this.buyButton.x, this.buyButton.y,
                this.buyButton.width, this.buyButton.height
            );
        } else {
            // Fallback - градиентный фон если изображение не загружено
            if (canBuy || item.isIAP) {
                const gradient = ctx.createLinearGradient(
                    this.buyButton.x, this.buyButton.y,
                    this.buyButton.x, this.buyButton.y + this.buyButton.height
                );
                gradient.addColorStop(0, buttonColor1);
                gradient.addColorStop(1, buttonColor2);
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = '#7f8c8d';
            }
            
            ctx.beginPath();
            ctx.roundRect(
                this.buyButton.x, this.buyButton.y,
                this.buyButton.width, this.buyButton.height, 8
            );
            ctx.fill();
        }
        
        // Обводка
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(
            this.buyButton.x, this.buyButton.y,
            this.buyButton.width, this.buyButton.height, 8
        );
        ctx.stroke();
        
        // Текст
        ctx.fillStyle = '#fff';
        ctx.font = this.getFont(25);
        this.applyLetterSpacing(ctx, true); // Увеличенное расстояние
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Черная обводка текста
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        const btnCenterX = this.buyButton.x + this.buyButton.width / 2;
        const btnCenterY = this.buyButton.y + this.buyButton.height / 2;
        
        // Проверяем, есть ли перенос строки
        if (buttonText.includes('\n')) {
            const lines = buttonText.split('\n');
            const lineHeight = 20;
            const startY = btnCenterY - (lines.length - 1) * lineHeight / 2;
            
            lines.forEach((line, index) => {
                const y = startY + index * lineHeight;
                ctx.strokeText(line, btnCenterX, y);
            });
        } else if (canBuy && !item.isIAP && !item.isPremium && item.currency !== 'iap') {
            // Для обычных товаров рисуем текст + цену + иконку монеты
            const textWidth = ctx.measureText(buttonText).width;
            const coinSize = 24;
            const priceText = `${item.price}`;
            const priceWidth = ctx.measureText(priceText).width;
            const totalWidth = textWidth + 10 + priceWidth + 5 + coinSize;
            
            // Начальная позиция (центрируем всё вместе)
            let currentX = btnCenterX - totalWidth / 2;
            
            // Черная обводка текста "Купить"
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
        } else {
            ctx.strokeText(buttonText, btnCenterX, btnCenterY);
        }
        
        // Белый текст поверх обводки
        if (buttonText.includes('\n')) {
            const lines = buttonText.split('\n');
            const lineHeight = 20;
            const startY = btnCenterY - (lines.length - 1) * lineHeight / 2;
            
            lines.forEach((line, index) => {
                const y = startY + index * lineHeight;
                ctx.fillText(line, btnCenterX, y);
            });
        } else if (!canBuy || item.isIAP || item.isPremium || item.currency === 'iap') {
            const btnCenterX = this.buyButton.x + this.buyButton.width / 2;
            const btnCenterY = this.buyButton.y + this.buyButton.height / 2;
            
            ctx.fillText(buttonText, btnCenterX, btnCenterY);
            
            // Рисуем иконку монеты/гема в зависимости от валюты (Requirement 7.1)
            if (canBuy) {
                const textWidth = ctx.measureText(buttonText).width;
                const iconSize = 24;
                const iconX = btnCenterX + textWidth / 2 + 18;
                
                // Проверяем, нужно ли рисовать иконку премиум валюты
                const showPremiumIcon = !supportsIAP && (item.isIAP || item.isPremium || item.currency === 'iap');
                
                if (showPremiumIcon) {
                    // Рисуем иконку рыболовной марки для платформ без IAP
                    assetManager.drawGemIcon(ctx, iconX, btnCenterY, iconSize);
                } else if (!item.isIAP && !item.isPremium && item.currency !== 'iap') {
                    // Рисуем иконку обычной монеты
                    assetManager.drawCoinIcon(ctx, iconX, btnCenterY, iconSize);
                }
            }
        }
        this.applyLetterSpacing(ctx, false); // Сброс
        
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
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(L('shop_fish_types', 'Виды рыб'), modalX + modalWidth / 2, modalY + 40);
        
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
            visibleStart + this.fishListModal.maxVisible + 2 // +2 для запаса
        );
        
        for (let i = visibleStart; i < visibleEnd; i++) {
            const fish = this.fishListModal.fish[i];
            const itemY = listY + 5 + (i - this.fishListModal.scrollOffset) * itemHeight;
            
            // Фон элемента
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.roundRect(modalX + 15, itemY, modalWidth - 30, itemHeight - 8, 6);
            ctx.fill();
            
            // Иконка рыбы
            const iconSize = 108; // Увеличено на 116% (было 50)
            const iconX = modalX + 50;
            const iconY = itemY + (itemHeight - 8) / 2;
            
            assetManager.drawImageOrEmoji(
                ctx, 'fish', fish.id,
                iconX, iconY, iconSize,
                fish.emoji || '🐟'
            );
            
            // Название рыбы
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px Arial';
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
            ctx.font = '15px Arial';
            ctx.fillText(L(`rarity_${fish.rarity}`, fish.rarity), modalX + 85, itemY + 45);
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
        
        // Используем ID наживки для поиска (надёжнее, чем названия)
        const baitId = bait.id;
        
        // Фильтруем рыб, которые используют эту наживку по ID
        const matchingFish = FISH_DATABASE.filter(fish => {
            return fish.preferredBaitId === baitId || fish.altBaitId === baitId;
        });
        
        return matchingFish;
    }
    
    // Обработка клика
    handleClick(x, y) {
        if (!this.visible) return false;
        
        // Звук клика будет воспроизводиться для конкретных действий (закрытие, вкладки, выбор)
        // Для покупки используются специальные звуки (kup/nema/obmen)
        
        // Клик на модальном окне списка рыб (БЕЗ трансформации, так как оно рендерится после ctx.restore)
        if (this.fishListModal.visible) {
            return this.handleFishListModalClick(x, y);
        }
        
        // Сохраняем оригинальные координаты для списка
        const origX = x;
        const origY = y;
        
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
        
        // Клик на элемент списка или начало драга - используем ОРИГИНАЛЬНЫЕ координаты
        const listX = this.modalX + 25;
        const listY = this.modalY + 135;
        const listHeight = this.modalHeight - 160;
        
        if (origX >= listX && origX <= listX + this.listWidth &&
            origY >= listY && origY <= listY + listHeight) {
            // Начинаем драг с оригинальными координатами
            this.isDragging = true;
            this.dragStartY = origY;
            this.dragStartScroll = this.scrollOffset;
            this.lastDragY = origY;
            this.lastDragTime = performance.now();
            this.dragVelocity = 0;
            return true;
        }
        
        // Клик на кнопку "Виды рыб" (только для наживок)
        if (this.currentTab === 'baits' && this.isFishListButtonClicked(x, y)) {
            if (this.audioManager) this.audioManager.playClickSound();
            this.showFishList();
            return true;
        }
        
        // Клик на стрелочки обмена валюты или начало драга ползунка
        if (this.currentTab === 'iap' && this.selectedIndex >= 0) {
            const item = this.items[this.selectedIndex];
            if (item && item.type === 'exchange') {
                // x и y уже трансформированы выше, используем их напрямую
                
                // Проверяем клик по ползунку (увеличиваем область клика для мобильных)
                const sliderArea = {
                    x: this.exchangeSlider.x,
                    y: this.exchangeSlider.y - 10, // Увеличиваем область клика сверху
                    width: this.exchangeSlider.width,
                    height: this.exchangeSlider.height + 20 // Увеличиваем область клика снизу
                };
                
                if (x >= sliderArea.x && x <= sliderArea.x + sliderArea.width &&
                    y >= sliderArea.y && y <= sliderArea.y + sliderArea.height) {
                    this.exchangeSlider.dragging = true;
                    
                    // Сохраняем начальные координаты для обработки в handleMouseMove
                    this.exchangeSlider.startX = x;
                    this.exchangeSlider.startY = y;
                    
                    // Сразу обновляем позицию
                    const maxExchange = Math.min(this.playerPremiumCoins, item.maxExchange);
                    const ratio = Math.max(0, Math.min(1, (x - this.exchangeSlider.x) / this.exchangeSlider.width));
                    this.exchangeAmount = Math.round(item.minExchange + ratio * (maxExchange - item.minExchange));
                    this.exchangeAmount = Math.max(item.minExchange, Math.min(maxExchange, this.exchangeAmount));
                    return true;
                }
                
                // Левая стрелка (увеличиваем область клика для мобильных)
                const leftDist = Math.sqrt(
                    Math.pow(x - (this.exchangeArrows.left.x + 12), 2) + 
                    Math.pow(y - (this.exchangeArrows.left.y + 10), 2)
                );
                if (leftDist < 25) { // Увеличено с 15 до 25
                    if (this.audioManager) this.audioManager.playClickSound();
                    this.exchangeAmount = Math.max(item.minExchange, this.exchangeAmount - 1);
                    return true;
                }
                
                // Правая стрелка (увеличиваем область клика для мобильных)
                const rightDist = Math.sqrt(
                    Math.pow(x - (this.exchangeArrows.right.x + 7), 2) + 
                    Math.pow(y - (this.exchangeArrows.right.y + 10), 2)
                );
                const maxExchange = Math.min(this.playerPremiumCoins, item.maxExchange);
                if (rightDist < 25) { // Увеличено с 15 до 25
                    if (this.audioManager) this.audioManager.playClickSound();
                    this.exchangeAmount = Math.min(maxExchange, this.exchangeAmount + 1);
                    return true;
                }
            }
        }
        
        // Клик на кнопку покупки
        if (this.isBuyButtonClicked(x, y)) {
            this.buySelected();
            return true;
        }
        
        return true;
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
        
        // Кнопка закрытия (увеличенная в 2 раза)
        const closeX = modalX + modalWidth - 15; // Ближе к углу
        const closeY = modalY + 15;
        const closeSize = 60; // Увеличиваем в 2 раза
        
        const dx = x - closeX;
        const dy = y - closeY;
        
        if (Math.sqrt(dx * dx + dy * dy) < closeSize / 2) { // Увеличенная область клика
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
    
    buySelected() {
        if (this.selectedIndex < 0 || this.selectedIndex >= this.items.length) return;
        
        const item = this.items[this.selectedIndex];
        
        // Проверяем заблокирована ли снасть по уровню (кроме премиум снастей за ЯНы)
        const isPremiumIAP = item.currency === 'iap';
        if (item.isLocked && !isPremiumIAP) {
            // Снасть заблокирована - не даем купить
            if (this.audioManager) this.audioManager.playSound('nema');
            console.log(`Снасть заблокирована. Требуется уровень ${item.requiredLevel}`);
            return;
        }
        
        // Проверяем поддержку IAP платформой (Requirements 6.7, 7.1)
        const supportsIAP = window.playgamaSDK && window.playgamaSDK.isPlatformSupportsIAP();
        
        // Обработка IAP покупок
        if (item.isIAP) {
            if (item.type === 'ad_reward') {
                // Проверяем кулдаун
                const now = Date.now();
                const timeSinceLastClaim = now - (item.lastClaimTime || 0);
                
                if (item.currentProgress === 0 && timeSinceLastClaim < item.cooldown) {
                    // На кулдауне - не даем смотреть рекламу
                    if (this.audioManager) this.audioManager.playSound('nema');
                    console.log(`⏱️ Награда на кулдауне: ${Math.ceil((item.cooldown - timeSinceLastClaim) / 1000)}с`);
                    return;
                }
                
                // Показываем rewarded рекламу
                console.log(`🎁 Просмотр рекламы для ${item.id}, текущий прогресс: ${item.currentProgress}/${item.maxProgress}`);
                
                // Вызываем метод из main.js для показа rewarded рекламы
                // ВАЖНО: Запускаем асинхронно, не блокируя UI
                if (window.game && window.game.showRewardedAd) {
                    // Запускаем промис без await, чтобы не блокировать UI
                    window.game.showRewardedAd(() => {
                        // Награда получена!
                        console.log(`✅ Награда получена за просмотр рекламы: ${item.id}`);
                        console.log(`📊 Прогресс ДО увеличения: ${item.currentProgress}/${item.maxProgress}`);
                        
                        // Увеличиваем прогресс
                        item.currentProgress = Math.min(item.currentProgress + 1, item.maxProgress);
                        console.log(`📊 Прогресс ПОСЛЕ увеличения: ${item.currentProgress}/${item.maxProgress}`);
                        
                        // ВАЖНО: Обновляем прогресс в IAP_DATABASE
                        if (typeof IAP_DATABASE !== 'undefined') {
                            const dbItem = IAP_DATABASE.find(i => i.id === item.id);
                            if (dbItem) {
                                dbItem.currentProgress = item.currentProgress;
                            }
                        }
                        
                        // Если достигнут максимум - выдаем награду
                        if (item.currentProgress >= item.maxProgress) {
                            console.log(`🎉 Достигнут максимум просмотров! Выдаем награду...`);
                            
                            // Проверяем поддержку IAP платформой
                            const supportsIAP = window.playgamaSDK && window.playgamaSDK.isPlatformSupportsIAP();
                            console.log(`💳 Платформа поддерживает IAP: ${supportsIAP}`);
                            
                            // Всегда выдаем обычные монеты (Requirement 5.4)
                            if (item.reward.regularCoins) {
                                this.playerCoins += item.reward.regularCoins;
                                // Синхронизируем с FishingGame
                                if (window.game && window.game.fishingGame) {
                                    window.game.fishingGame.coins = this.playerCoins;
                                }
                                console.log(`💰 Получено ${item.reward.regularCoins} монет, всего: ${this.playerCoins}`);
                                // Регистрируем заработанные монеты в профиле
                                if (window.game && window.game.profileSystem) {
                                    window.game.profileSystem.registerCoinsEarned(item.reward.regularCoins);
                                }
                            }
                            
                            // Выдаем премиум валюту только если платформа НЕ поддерживает IAP (Requirements 5.5, 7.1.1-7.1.5)
                            if (!supportsIAP && item.reward.premiumCoins) {
                                this.playerPremiumCoins += item.reward.premiumCoins;
                                // Синхронизируем с FishingGame
                                if (window.game && window.game.fishingGame) {
                                    window.game.fishingGame.premiumCoins = this.playerPremiumCoins;
                                }
                                console.log(`💎 Получено ${item.reward.premiumCoins} гемов (платформа без IAP), всего: ${this.playerPremiumCoins}`);
                                // Регистрируем заработанные марки в профиле
                                if (window.game && window.game.profileSystem) {
                                    window.game.profileSystem.registerGemsEarned(item.reward.premiumCoins);
                                }
                            }
                            
                            // Сбрасываем прогресс и устанавливаем время получения награды
                            item.currentProgress = 0;
                            item.lastClaimTime = Date.now();
                            console.log(`🔄 Прогресс сброшен, установлен кулдаун`);
                            
                            // ВАЖНО: Обновляем в IAP_DATABASE
                            if (typeof IAP_DATABASE !== 'undefined') {
                                const dbItem = IAP_DATABASE.find(i => i.id === item.id);
                                if (dbItem) {
                                    dbItem.currentProgress = item.currentProgress;
                                    dbItem.lastClaimTime = item.lastClaimTime;
                                }
                            }
                            
                            // Звук награды
                            if (this.audioManager) this.audioManager.playSound('kup');
                            
                            // Сохраняем прогресс
                            if (window.game) {
                                window.game.saveGameDataDebounced();
                            }
                        } else {
                            console.log(`📊 Прогресс сохранен: ${item.currentProgress}/${item.maxProgress}`);
                            // Сохраняем прогресс после каждой рекламы
                            if (window.game) {
                                window.game.saveGameDataDebounced();
                            }
                        }
                        
                        // Обновляем UI
                        this.loadItems();
                    });
                } else {
                    // Fallback если SDK не доступен
                    console.warn('SDK не доступен, награда выдана без рекламы');
                    item.currentProgress = Math.min(item.currentProgress + 1, item.maxProgress);
                    
                    // ВАЖНО: Обновляем прогресс в IAP_DATABASE
                    if (typeof IAP_DATABASE !== 'undefined') {
                        const dbItem = IAP_DATABASE.find(i => i.id === item.id);
                        if (dbItem) {
                            dbItem.currentProgress = item.currentProgress;
                        }
                    }
                    
                    if (item.currentProgress >= item.maxProgress) {
                        // Проверяем поддержку IAP платформой
                        const supportsIAP = window.playgamaSDK && window.playgamaSDK.isPlatformSupportsIAP();
                        
                        // Всегда выдаем обычные монеты
                        if (item.reward.regularCoins) {
                            this.playerCoins += item.reward.regularCoins;
                            // Синхронизируем с FishingGame
                            if (window.game && window.game.fishingGame) {
                                window.game.fishingGame.coins = this.playerCoins;
                            }
                            // Регистрируем заработанные монеты в профиле
                            if (window.game && window.game.profileSystem) {
                                window.game.profileSystem.registerCoinsEarned(item.reward.regularCoins);
                            }
                        }
                        
                        // Выдаем премиум валюту только если платформа НЕ поддерживает IAP
                        if (!supportsIAP && item.reward.premiumCoins) {
                            this.playerPremiumCoins += item.reward.premiumCoins;
                            // Синхронизируем с FishingGame
                            if (window.game && window.game.fishingGame) {
                                window.game.fishingGame.premiumCoins = this.playerPremiumCoins;
                            }
                            // Регистрируем заработанные марки в профиле
                            if (window.game && window.game.profileSystem) {
                                window.game.profileSystem.registerGemsEarned(item.reward.premiumCoins);
                            }
                        }
                        item.currentProgress = 0;
                        item.lastClaimTime = Date.now();
                        
                        // ВАЖНО: Обновляем в IAP_DATABASE
                        if (typeof IAP_DATABASE !== 'undefined') {
                            const dbItem = IAP_DATABASE.find(i => i.id === item.id);
                            if (dbItem) {
                                dbItem.currentProgress = item.currentProgress;
                                dbItem.lastClaimTime = item.lastClaimTime;
                            }
                        }
                        
                        if (this.audioManager) this.audioManager.playSound('kup');
                        
                        // Сохраняем прогресс
                        if (window.game) {
                            window.game.saveGameDataDebounced();
                        }
                    } else {
                        // Сохраняем прогресс
                        if (window.game) {
                            window.game.saveGameDataDebounced();
                        }
                    }
                    
                    this.loadItems();
                }
                
                return; // Выходим из функции
            } else if (item.type === 'exchange') {
                // Обмен валюты - используем значение из ползунка
                if (this.playerPremiumCoins >= this.exchangeAmount) {
                    const exchangedAmount = this.exchangeAmount; // Сохраняем до изменения
                    const resultCoins = exchangedAmount * item.exchangeRate;
                    
                    // Реальный обмен валюты
                    this.playerPremiumCoins -= exchangedAmount;
                    this.playerCoins += resultCoins;
                    
                    // Регистрируем заработанные монеты в профиле (обмен тоже считается заработком)
                    if (window.game && window.game.profileSystem) {
                        window.game.profileSystem.registerCoinsEarned(resultCoins);
                    }
                    
                    console.log(`✅ Обменяно ${exchangedAmount} 💎 на ${resultCoins} 💰`);
                    console.log(`Баланс: ${this.playerCoins} 💰, ${this.playerPremiumCoins} 💎`);
                    
                    // Звук обмена валюты
                    if (this.audioManager) this.audioManager.playSound('obmen');
                    
                    // Вызываем callback для обновления UI
                    if (this.onBuy) {
                        this.onBuy(this.currentTab, item, {
                            exchanged: exchangedAmount,
                            received: resultCoins
                        });
                    }
                    
                    // Сбрасываем значение обмена после callback
                    this.exchangeAmount = Math.min(1, this.playerPremiumCoins);
                } else {
                    // Недостаточно рыболовных марок - просто не выполняем обмен
                    console.log('⚠️ Недостаточно рыболовных марок для обмена');
                    // Звук недостаточно валюты
                    if (this.audioManager) this.audioManager.playSound('nema');
                }
                return;
            } else if (item.type === 'gear_bundle') {
                // Покупка набора снастей
                console.log(`Покупка набора снастей ${item.id}`);
                
                // Проверяем поддержку IAP (Requirement 6.7)
                if (supportsIAP) {
                    // Платформа поддерживает IAP - покупка за реальные деньги
                    console.log(`💳 Покупка ${item.id} через IAP за ${item.price} ЯН`);
                    
                    // Вызываем callback, который обработает покупку через SDK
                    if (this.onBuy) {
                        this.onBuy(this.currentTab, item);
                    }
                } else {
                    // Платформа НЕ поддерживает IAP - покупка за премиум валюту (Requirement 7.1, 7.2)
                    const fallbackPrice = item.fallbackPrice || 0;
                    
                    if (fallbackPrice <= 0) {
                        console.error(`❌ Нет fallback цены для товара ${item.id}`);
                        if (this.audioManager) this.audioManager.playSound('nema');
                        return;
                    }
                    
                    // Проверяем баланс премиум валюты (Requirement 7.3)
                    if (this.playerPremiumCoins < fallbackPrice) {
                        console.log(`⚠️ Недостаточно рыболовных марок: есть ${this.playerPremiumCoins}, нужно ${fallbackPrice}`);
                        if (this.audioManager) this.audioManager.playSound('nema');
                        return;
                    }
                    
                    console.log(`💎 Покупка ${item.id} за ${fallbackPrice} рыболовных марок`);
                    
                    // Вызываем метод SDK для покупки за премиум валюту
                    if (window.playgamaSDK) {
                        const playerData = {
                            premiumCoins: this.playerPremiumCoins,
                            regularCoins: this.playerCoins
                        };
                        
                        window.playgamaSDK.purchaseWithPremiumCurrency(item.id, playerData).then(result => {
                            if (result.success) {
                                console.log(`✅ Покупка успешна! Новый баланс: ${result.newBalance} марок`);
                                
                                // Обновляем баланс
                                this.playerPremiumCoins = result.newBalance;
                                
                                // Синхронизируем с FishingGame
                                if (window.game && window.game.fishingGame) {
                                    window.game.fishingGame.premiumCoins = this.playerPremiumCoins;
                                }
                                
                                // Звук успешной покупки
                                if (this.audioManager) this.audioManager.playSound('kup');
                                
                                // Запускаем анимацию покупки
                                this.createPurchaseAnimation(item);
                                
                                // Выдаем предметы (Requirement 7.4)
                                if (this.onBuy) {
                                    this.onBuy(this.currentTab, item, { paidWithPremiumCurrency: true });
                                }
                            } else {
                                console.error(`❌ Ошибка покупки: ${result.error}`);
                                if (this.audioManager) this.audioManager.playSound('nema');
                            }
                        }).catch(error => {
                            console.error('❌ Ошибка при покупке за премиум валюту:', error);
                            if (this.audioManager) this.audioManager.playSound('nema');
                        });
                    }
                }
                return;
            } else {
                // Покупка за реальные деньги через Playgama SDK
                console.log(`Покупка ${item.id}`);
                
                // Проверяем поддержку IAP (Requirement 6.7)
                if (supportsIAP) {
                    // Платформа поддерживает IAP - покупка за реальные деньги
                    console.log(`💳 Покупка ${item.id} через IAP за ${item.price} ЯН`);
                    
                    // Вызываем callback, который обработает покупку через SDK
                    if (this.onBuy) {
                        this.onBuy(this.currentTab, item);
                    }
                } else {
                    // Платформа НЕ поддерживает IAP - покупка за премиум валюту (Requirement 7.1, 7.2)
                    const fallbackPrice = item.fallbackPrice || 0;
                    
                    if (fallbackPrice <= 0) {
                        console.error(`❌ Нет fallback цены для товара ${item.id}`);
                        if (this.audioManager) this.audioManager.playSound('nema');
                        return;
                    }
                    
                    // Проверяем баланс премиум валюты (Requirement 7.3)
                    if (this.playerPremiumCoins < fallbackPrice) {
                        console.log(`⚠️ Недостаточно рыболовных марок: есть ${this.playerPremiumCoins}, нужно ${fallbackPrice}`);
                        if (this.audioManager) this.audioManager.playSound('nema');
                        return;
                    }
                    
                    console.log(`💎 Покупка ${item.id} за ${fallbackPrice} рыболовных марок`);
                    
                    // Вызываем метод SDK для покупки за премиум валюту
                    if (window.playgamaSDK) {
                        const playerData = {
                            premiumCoins: this.playerPremiumCoins,
                            regularCoins: this.playerCoins
                        };
                        
                        window.playgamaSDK.purchaseWithPremiumCurrency(item.id, playerData).then(result => {
                            if (result.success) {
                                console.log(`✅ Покупка успешна! Новый баланс: ${result.newBalance} марок`);
                                
                                // Обновляем баланс
                                this.playerPremiumCoins = result.newBalance;
                                
                                // Синхронизируем с FishingGame
                                if (window.game && window.game.fishingGame) {
                                    window.game.fishingGame.premiumCoins = this.playerPremiumCoins;
                                }
                                
                                // Звук успешной покупки
                                if (this.audioManager) this.audioManager.playSound('kup');
                                
                                // Запускаем анимацию покупки
                                this.createPurchaseAnimation(item);
                                
                                // Выдаем предметы (Requirement 7.4)
                                if (this.onBuy) {
                                    this.onBuy(this.currentTab, item, { paidWithPremiumCurrency: true });
                                }
                            } else {
                                console.error(`❌ Ошибка покупки: ${result.error}`);
                                if (this.audioManager) this.audioManager.playSound('nema');
                            }
                        }).catch(error => {
                            console.error('❌ Ошибка при покупке за премиум валюту:', error);
                            if (this.audioManager) this.audioManager.playSound('nema');
                        });
                    }
                }
            }
            return;
        }
        
        // Проверяем деньги для обычных покупок
        if (item.isPremium) {
            // Для IAP бонусов проверяем поддержку платформы
            if (item.currency === 'iap') {
                // Проверяем поддержку IAP (Requirement 6.7)
                if (supportsIAP) {
                    // Платформа поддерживает IAP - покупка за реальные деньги
                    console.log(`💳 Покупка премиум товара ${item.name} через IAP за ${item.price} ЯН`);
                    
                    // Вызываем callback, который обработает покупку через SDK
                    if (this.onBuy) {
                        this.onBuy(this.currentTab, item);
                    }
                } else {
                    // Платформа НЕ поддерживает IAP - покупка за премиум валюту (Requirement 7.1, 7.2)
                    const fallbackPrice = item.fallbackPrice || 0;
                    
                    if (fallbackPrice <= 0) {
                        console.error(`❌ Нет fallback цены для товара ${item.id}`);
                        if (this.audioManager) this.audioManager.playSound('nema');
                        return;
                    }
                    
                    // Проверяем баланс премиум валюты (Requirement 7.3)
                    if (this.playerPremiumCoins < fallbackPrice) {
                        console.log(`⚠️ Недостаточно рыболовных марок: есть ${this.playerPremiumCoins}, нужно ${fallbackPrice}`);
                        if (this.audioManager) this.audioManager.playSound('nema');
                        return;
                    }
                    
                    console.log(`💎 Покупка ${item.name} за ${fallbackPrice} рыболовных марок`);
                    
                    // Вызываем метод SDK для покупки за премиум валюту
                    if (window.playgamaSDK) {
                        const playerData = {
                            premiumCoins: this.playerPremiumCoins,
                            regularCoins: this.playerCoins
                        };
                        
                        window.playgamaSDK.purchaseWithPremiumCurrency(item.id, playerData).then(result => {
                            if (result.success) {
                                console.log(`✅ Покупка успешна! Новый баланс: ${result.newBalance} марок`);
                                
                                // Обновляем баланс
                                this.playerPremiumCoins = result.newBalance;
                                
                                // Синхронизируем с FishingGame
                                if (window.game && window.game.fishingGame) {
                                    window.game.fishingGame.premiumCoins = this.playerPremiumCoins;
                                }
                                
                                // Звук успешной покупки
                                if (this.audioManager) this.audioManager.playSound('kup');
                                
                                // Запускаем анимацию покупки
                                this.createPurchaseAnimation(item);
                                
                                // Выдаем предметы (Requirement 7.4)
                                if (this.onBuy) {
                                    this.onBuy(this.currentTab, item, { paidWithPremiumCurrency: true });
                                }
                            } else {
                                console.error(`❌ Ошибка покупки: ${result.error}`);
                                if (this.audioManager) this.audioManager.playSound('nema');
                            }
                        }).catch(error => {
                            console.error('❌ Ошибка при покупке за премиум валюту:', error);
                            if (this.audioManager) this.audioManager.playSound('nema');
                        });
                    }
                }
                return;
            } else {
                if (this.playerPremiumCoins < item.price) {
                    // Звук недостаточно валюты
                    if (this.audioManager) this.audioManager.playSound('nema');
                    return;
                }
            }
        } else if (item.currency === 'iap') {
            // Товары за ЯНы (IAP) - проверяем поддержку платформы
            // Проверяем поддержку IAP (Requirement 6.7)
            if (supportsIAP) {
                // Платформа поддерживает IAP - покупка за реальные деньги
                console.log(`💳 Покупка ${item.name} через IAP за ${item.price} ЯН`);
                
                // Вызываем callback, который обработает покупку через SDK
                if (this.onBuy) {
                    this.onBuy(this.currentTab, item);
                }
            } else {
                // Платформа НЕ поддерживает IAP - покупка за премиум валюту (Requirement 7.1, 7.2)
                const fallbackPrice = item.fallbackPrice || 0;
                
                if (fallbackPrice <= 0) {
                    console.error(`❌ Нет fallback цены для товара ${item.id}`);
                    if (this.audioManager) this.audioManager.playSound('nema');
                    return;
                }
                
                // Проверяем баланс премиум валюты (Requirement 7.3)
                if (this.playerPremiumCoins < fallbackPrice) {
                    console.log(`⚠️ Недостаточно рыболовных марок: есть ${this.playerPremiumCoins}, нужно ${fallbackPrice}`);
                    if (this.audioManager) this.audioManager.playSound('nema');
                    return;
                }
                
                console.log(`💎 Покупка ${item.name} за ${fallbackPrice} рыболовных марок`);
                
                // Вызываем метод SDK для покупки за премиум валюту
                if (window.playgamaSDK) {
                    const playerData = {
                        premiumCoins: this.playerPremiumCoins,
                        regularCoins: this.playerCoins
                    };
                    
                    window.playgamaSDK.purchaseWithPremiumCurrency(item.id, playerData).then(result => {
                        if (result.success) {
                            console.log(`✅ Покупка успешна! Новый баланс: ${result.newBalance} марок`);
                            
                            // Обновляем баланс
                            this.playerPremiumCoins = result.newBalance;
                            
                            // Синхронизируем с FishingGame
                            if (window.game && window.game.fishingGame) {
                                window.game.fishingGame.premiumCoins = this.playerPremiumCoins;
                            }
                            
                            // Звук успешной покупки
                            if (this.audioManager) this.audioManager.playSound('kup');
                            
                            // Запускаем анимацию покупки
                            this.createPurchaseAnimation(item);
                            
                            // Выдаем предметы (Requirement 7.4)
                            if (this.onBuy) {
                                this.onBuy(this.currentTab, item, { paidWithPremiumCurrency: true });
                            }
                        } else {
                            console.error(`❌ Ошибка покупки: ${result.error}`);
                            if (this.audioManager) this.audioManager.playSound('nema');
                        }
                    }).catch(error => {
                        console.error('❌ Ошибка при покупке за премиум валюту:', error);
                        if (this.audioManager) this.audioManager.playSound('nema');
                    });
                }
            }
            return;
        } else if (item.currency === 'gems') {
            // Товары за гемы (премиум валюта)
            if (this.playerPremiumCoins < item.price) {
                // Звук недостаточно валюты
                if (this.audioManager) this.audioManager.playSound('nema');
                return;
            }
        } else {
            // Обычные товары за монеты
            if (this.playerCoins < item.price) {
                // Звук недостаточно валюты
                if (this.audioManager) this.audioManager.playSound('nema');
                return;
            }
        }
        
        // Звук успешной покупки
        if (this.audioManager) this.audioManager.playSound('kup');
        
        // Запускаем анимацию покупки
        this.createPurchaseAnimation(item);
        
        // Покупаем
        if (this.currentTab === 'baits') {
            this.inventory.addBait(item.id, item.quantity);
        } else if (this.currentTab === 'hooks') {
            this.inventory.addHook(item.tier, item.quantity);
        } else if (this.currentTab === 'floats') {
            this.inventory.addFloat(item.tier, item.quantity);
        } else if (this.currentTab === 'lines') {
            this.inventory.addLine(item.tier, item.quantity);
        } else if (this.currentTab === 'reels') {
            this.inventory.addReel(item.tier, item.quantity);
        } else if (this.currentTab === 'rods') {
            this.inventory.addRod(item.tier, item.quantity);
        } else if (this.currentTab === 'premium') {
            // Добавляем бонус в инвентарь
            if (window.game && window.game.fishingGame && window.game.fishingGame.bonusInventoryUI) {
                window.game.fishingGame.bonusInventoryUI.addBonus(item.id, item.quantity || 1);
                
                // Постоянные эффекты автоматически активируются при покупке
                if (item.duration === -1 && window.game.fishingGame.premiumEffects) {
                    window.game.fishingGame.premiumEffects.activateEffect(item.id);
                    // Сохраняем состояние
                    window.game.fishingGame.bonusInventoryUI.saveInventory();
                    console.log(`[Shop] Постоянный эффект ${item.id} автоматически активирован и сохранен`);
                }
            }
        }
        
        // Вызываем callback
        if (this.onBuy) {
            this.onBuy(this.currentTab, item);
        }
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
    
    isBuyButtonClicked(x, y) {
        if (this.selectedIndex < 0) return false;
        return x >= this.buyButton.x && x <= this.buyButton.x + this.buyButton.width &&
               y >= this.buyButton.y && y <= this.buyButton.y + this.buyButton.height;
    }
    
    isFishListButtonClicked(x, y) {
        if (this.selectedIndex < 0) return false;
        
        // Отладочный вывод для всех кликов в области кнопки
        const inXRange = x >= this.fishListButton.x && x <= this.fishListButton.x + this.fishListButton.width;
        const inYRange = y >= this.fishListButton.y && y <= this.fishListButton.y + this.fishListButton.height;
        
        console.log('🔍 Проверка клика на кнопку "Виды рыб":', {
            clickX: x,
            clickY: y,
            buttonX: this.fishListButton.x,
            buttonY: this.fishListButton.y,
            buttonWidth: this.fishListButton.width,
            buttonHeight: this.fishListButton.height,
            inXRange,
            inYRange,
            isClicked: inXRange && inYRange
        });
        
        return inXRange && inYRange;
    }
    
    getClickedTab(x, y) {
        const tabY = this.modalY + 75;
        const tabHeight = 45;
        const tabWidth = 120; // Обновлено со 140 до 120
        const spacing = 8; // Обновлено с 12 до 8
        const startX = this.modalX + 35; // Обновлено с 25 до 35
        
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
    
    // Обработка начала перетаскивания (mousedown)
    handleMouseDown(x, y) {
        // Сохраняем координаты для обработки клика в handleMouseUp
        this.dragStartX = x;
        return this.handleClick(x, y);
    }
    
    // Обработка перетаскивания (mousemove)
    handleMouseMove(x, y) {
        // Перетаскивание в модальном окне списка рыб (БЕЗ трансформации)
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
                this.fishListModal.dragVelocity = velocity * 0.3; // Коэффициент инерции
            }
            
            this.fishListModal.lastDragY = y;
            this.fishListModal.lastDragTime = now;
            return true;
        }
        
        // Драг списка товаров
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
            return true;
        }
        
        // Трансформируем координаты с учетом масштабирования окна (только для ползунка обмена)
        const scale = 0.8 + this.animProgress * 0.2;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const transformedX = (x - centerX) / scale + centerX;
        const transformedY = (y - centerY) / scale + centerY;
        
        if (!this.exchangeSlider.dragging) {
            return false;
        }
        
        const item = this.items[this.selectedIndex];
        if (!item || item.type !== 'exchange') {
            this.exchangeSlider.dragging = false;
            return false;
        }
        
        // Используем трансформированные координаты
        const maxExchange = Math.min(this.playerPremiumCoins, item.maxExchange);
        const ratio = Math.max(0, Math.min(1, (transformedX - this.exchangeSlider.x) / this.exchangeSlider.width));
        this.exchangeAmount = Math.round(item.minExchange + ratio * (maxExchange - item.minExchange));
        this.exchangeAmount = Math.max(item.minExchange, Math.min(maxExchange, this.exchangeAmount));
        
        return true;
    }
    
    // Обработка окончания перетаскивания (mouseup)
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
        
        if (this.exchangeSlider.dragging) {
            this.exchangeSlider.dragging = false;
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
    
    // ============ СИСТЕМА АНИМАЦИИ ПОКУПКИ ============
    
    createPurchaseAnimation(item) {
        // Определяем позицию кнопки покупки (откуда начинается анимация)
        const startX = this.buyButton.x + this.buyButton.width / 2;
        const startY = this.buyButton.y + this.buyButton.height / 2;
        
        // Анимация нажатия кнопки
        this.buyButton.targetScale = 0.85; // Сжимаем кнопку
        setTimeout(() => {
            this.buyButton.targetScale = 1.0; // Возвращаем обратно
        }, 100);
        
        // Создаем анимацию
        const animation = {
            item: item,
            progress: 0,
            speed: 1.2, // Скорость анимации
            startX: startX,
            startY: startY,
            icons: [], // Несколько иконок товара
            flashProgress: 0
        };
        
        // Для одиночных покупок (удочки, лески и т.д.) - только 1 иконка
        // Для множественных (наживка) - несколько иконок с усиленным эффектом
        const isMultiple = item.quantity > 1;
        const iconCount = isMultiple ? (5 + Math.floor(Math.random() * 4)) : 1;
        
        // Центр экрана для направления выброса
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < iconCount; i++) {
            // ВСЕ покупки выстреливаются к центру экрана с увеличенной силой
            const dx = centerX - startX;
            const dy = centerY - startY;
            const baseAngle = Math.atan2(dy, dx);
            
            let angle, speed;
            
            if (isMultiple) {
                // Для множественных покупок - больше разброса и силы
                angle = baseAngle + (Math.random() - 0.5) * Math.PI / 3;
                speed = 10 + Math.random() * 8; // Увеличена сила
            } else {
                // Для одиночных покупок - меньше разброса
                angle = baseAngle + (Math.random() - 0.5) * Math.PI / 6;
                speed = 9 + Math.random() * 6; // Увеличена сила
            }
            
            animation.icons.push({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 0.35,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                scale: 0.7 + Math.random() * 0.5,
                life: 1.5
            });
        }
        
        this.purchaseAnimations.push(animation);
    }
    
    renderPurchaseAnimations(ctx) {
        this.purchaseAnimations.forEach(anim => {
            this.renderSinglePurchaseAnimation(ctx, anim);
        });
    }
    
    renderSinglePurchaseAnimation(ctx, anim) {
        ctx.save();
        
        const t = anim.progress;
        
        // 1. Вспышка на кнопке покупки (первые 0.3 секунды)
        if (t < 0.4) {
            const flashAlpha = (1 - t / 0.4) * 0.7;
            ctx.globalAlpha = flashAlpha;
            
            const gradient = ctx.createRadialGradient(
                anim.startX, anim.startY, 0,
                anim.startX, anim.startY, 120 * (t / 0.4)
            );
            gradient.addColorStop(0, anim.item.isPremium ? '#9b59b6' : '#f1c40f');
            gradient.addColorStop(0.5, anim.item.isPremium ? 'rgba(155, 89, 182, 0.3)' : 'rgba(241, 196, 15, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(anim.startX, anim.startY, 120 * (t / 0.4), 0, Math.PI * 2);
            ctx.fill();
            
            // Дополнительные кольца
            ctx.globalAlpha = flashAlpha * 0.5;
            ctx.strokeStyle = anim.item.isPremium ? '#9b59b6' : '#f1c40f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(anim.startX, anim.startY, 80 * (t / 0.4), 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 2. Иконки товара (подбрасываются и падают)
        anim.icons.forEach(icon => {
            if (icon.life <= 0) return;
            
            ctx.globalAlpha = Math.min(1, icon.life);
            ctx.save();
            ctx.translate(icon.x, icon.y);
            ctx.rotate(icon.rotation);
            ctx.scale(icon.scale, icon.scale);
            
            // Определяем тип ассета и ID
            const assetType = this.currentTab === 'baits' ? 'bait' : 
                             this.currentTab === 'hooks' ? 'hook' :
                             this.currentTab === 'floats' ? 'float' :
                             this.currentTab === 'lines' ? 'line' :
                             this.currentTab === 'rods' ? 'rod' :
                             this.currentTab === 'premium' ? 'premium' :
                             this.currentTab === 'iap' ? 'iap' : 'bait';
            const defaultEmoji = this.currentTab === 'baits' ? '🍞' : 
                                this.currentTab === 'hooks' ? '🪝' :
                                this.currentTab === 'floats' ? '🎈' :
                                this.currentTab === 'lines' ? '🧵' :
                                this.currentTab === 'rods' ? '🎣' :
                                this.currentTab === 'premium' ? '💎' :
                                this.currentTab === 'iap' ? '💳' : '🍞';
            const itemId = (this.currentTab === 'hooks' || this.currentTab === 'floats' || 
                           this.currentTab === 'lines' || this.currentTab === 'rods') ? 
                           anim.item.tier : anim.item.id;
            
            // Для наживок используем спрайты напрямую
            if (this.currentTab === 'baits') {
                const baitSpriteKey = `n${anim.item.id}.png`;
                const baitSprite = assetManager.getImage(baitSpriteKey);
                
                if (baitSprite) {
                    ctx.drawImage(baitSprite, -35, -35, 70, 70);
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.font = '70px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(anim.item.emoji || defaultEmoji, 0, 0);
                }
            } else if (this.currentTab === 'floats') {
                // Для поплавков используем спрайты float_01.png - float_18.png
                const floatSpriteKey = `float_${String(anim.item.tier).padStart(2, '0')}.png`;
                const floatSprite = assetManager.getImage(floatSpriteKey);
                
                if (floatSprite) {
                    ctx.drawImage(floatSprite, -35, -35, 70, 70);
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.font = '70px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(anim.item.emoji || defaultEmoji, 0, 0);
                }
            } else if (this.currentTab === 'lines') {
                // Для лесок используем спрайты l_1.png - l_18.png
                const lineSpriteKey = `l_${anim.item.tier}.png`;
                const lineSprite = assetManager.getImage(lineSpriteKey);
                
                if (lineSprite) {
                    ctx.drawImage(lineSprite, -35, -35, 70, 70);
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.font = '70px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(anim.item.emoji || defaultEmoji, 0, 0);
                }
            } else if (this.currentTab === 'hooks') {
                // Для крючков используем спрайты k_1.png - k_18.png
                const hookSpriteKey = `k_${anim.item.tier}.png`;
                const hookSprite = assetManager.getImage(hookSpriteKey);
                
                if (hookSprite) {
                    ctx.drawImage(hookSprite, -35, -35, 70, 70);
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.font = '70px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(anim.item.emoji || defaultEmoji, 0, 0);
                }
            } else if (this.currentTab === 'rods') {
                // Для удочек используем спрайты u1.png - u18.png (увеличенные в 2 раза)
                const rodSpriteKey = `u${anim.item.tier}.png`;
                const rodSprite = assetManager.getImage(rodSpriteKey);
                
                if (rodSprite) {
                    ctx.drawImage(rodSprite, -70, -70, 140, 140);
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.font = '70px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(anim.item.emoji || defaultEmoji, 0, 0);
                }
            } else if (this.currentTab === 'reels') {
                // Для катушек используем спрайты h1.png - h18.png
                const reelSpriteKey = `h${anim.item.tier}.png`;
                const reelSprite = assetManager.getImage(reelSpriteKey);
                
                if (reelSprite) {
                    ctx.drawImage(reelSprite, -35, -35, 70, 70);
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.font = '70px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(anim.item.emoji || '⚙️', 0, 0);
                }
            } else if (this.currentTab === 'premium' || this.currentTab === 'iap') {
                // Для премиум бонусов используем спрайты p1.png - p17.png
                if (anim.item.spriteId) {
                    const premiumSpriteKey = `p${anim.item.spriteId}.png`;
                    const premiumSprite = assetManager.getImage(premiumSpriteKey);
                    
                    if (premiumSprite) {
                        ctx.drawImage(premiumSprite, -35, -35, 70, 70);
                    } else {
                        ctx.fillStyle = '#fff';
                        ctx.font = '70px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(anim.item.emoji || defaultEmoji, 0, 0);
                    }
                } else if (anim.item.sprite) {
                    // Для покупок с прямым указанием спрайта (например, sereb.png)
                    const sprite = assetManager.getImage(anim.item.sprite);
                    
                    if (sprite) {
                        ctx.drawImage(sprite, -35, -35, 70, 70);
                    } else {
                        ctx.fillStyle = '#fff';
                        ctx.font = '70px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(anim.item.emoji || defaultEmoji, 0, 0);
                    }
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.font = '70px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(anim.item.emoji || defaultEmoji, 0, 0);
                }
            } else {
                assetManager.drawImageOrEmoji(
                    ctx, assetType, itemId,
                    0, 0, 70,
                    anim.item.emoji || defaultEmoji
                );
            }
            
            ctx.restore();
        });
        
        // 3. Всплывающий текст (появляется в начале и поднимается)
        if (t < 0.8) {
            const textAlpha = t < 0.2 ? t / 0.2 : 1 - ((t - 0.6) / 0.2);
            ctx.globalAlpha = Math.max(0, Math.min(1, textAlpha));
            
            const textY = anim.startY - 100 - t * 80;
            
            // Тень текста
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            
            // Текст покупки - разбиваем на две строки если длинный
            ctx.fillStyle = '#2ecc71';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const fullText = `+${anim.item.quantity} ${anim.item.name}`;
            
            // Если текст длинный (больше 20 символов), разбиваем на две строки
            if (fullText.length > 20) {
                // Первая строка - количество
                ctx.font = this.getFont(28);
                this.applyLetterSpacing(ctx, true);
                ctx.fillText(`+${anim.item.quantity}`, anim.startX, textY - 15);
                
                // Вторая строка - название (обрезаем если очень длинное)
                const itemName = anim.item.name.length > 18 ? 
                    anim.item.name.substring(0, 16) + '...' : 
                    anim.item.name;
                ctx.fillText(itemName, anim.startX, textY + 15);
                this.applyLetterSpacing(ctx, false);
            } else {
                // Короткий текст - в одну строку
                ctx.font = this.getFont(32);
                this.applyLetterSpacing(ctx, true);
                ctx.fillText(fullText, anim.startX, textY);
                this.applyLetterSpacing(ctx, false);
            }
            
            // Цена
            ctx.fillStyle = anim.item.isPremium ? '#9b59b6' : '#f1c40f';
            ctx.font = this.getFont(24);
            ctx.textAlign = 'center';
            
            if (anim.item.isPremium) {
                const priceText = `-${anim.item.price}`;
                const priceWidth = ctx.measureText(priceText).width;
                ctx.fillText(priceText, anim.startX - 10, textY + 45);
                assetManager.drawGemIcon(ctx, anim.startX + priceWidth / 2 + 5, textY + 45, 24);
            } else {
                assetManager.drawTextWithCoinIcon(ctx, `-${anim.item.price}💰`, anim.startX, textY + 45, 24);
            }
            
            // Галочка успеха
            if (t > 0.3) {
                ctx.fillStyle = '#2ecc71';
                ctx.font = this.getFont(48);
                ctx.fillText('✓', anim.startX, textY - 55);
            }
        }
        
        ctx.restore();
    }
    
    // Callback при покупке
    onBuy = null;
}
