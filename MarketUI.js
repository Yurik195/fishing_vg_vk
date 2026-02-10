// UI рынка для продажи рыбы из садка
class MarketUI {
    constructor(canvas, marketSystem, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        this.market = marketSystem;
        
        // Состояние
        this.visible = false;
        this.animProgress = 0;
        
        // Данные игрока
        this.playerCoins = 0;
        this.keepnetFish = []; // Массив рыб в садке
        this.trophies = []; // Массив чучел
        
        // Режим отображения: 'keepnet' или 'trophies'
        this.viewMode = 'keepnet';
        
        // Список рыб/чучел
        this.fishEntries = [];
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.maxVisibleItems = 5.5;
        
        // Размеры окна (увеличены на 5%)
        this.modalWidth = 1260;  // было 1200
        this.modalHeight = 735;  // было 700
        this.modalX = 0;
        this.modalY = 0;
        
        // Размеры списка
        this.listWidth = 400;
        this.listItemHeight = 90;
        
        // Кнопки
        this.closeButton = { x: 0, y: 0, size: 42 };
        this.sellButton = { x: 0, y: 0, width: 200, height: 50, scale: 1.0, targetScale: 1.0 };
        this.sellAllButton = { x: 0, y: 0, width: 200, height: 50, scale: 1.0, targetScale: 1.0 };
        
        // Кнопки переключения режима
        this.keepnetButton = { x: 0, y: 0, width: 180, height: 45 };
        this.trophiesButton = { x: 0, y: 0, width: 180, height: 45 };
        
        // Перетаскивание для скролла
        this.isDragging = false;
        this.isActuallyScrolling = false; // Флаг для ПК - начался ли реальный скролл
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartScroll = 0;
        this.dragVelocity = 0;
        this.lastDragX = 0;
        this.lastDragY = 0;
        this.lastDragTime = 0;
        
        // Callback при продаже
        this.onSell = null;
        
        // Анимация продажи
        this.saleAnimations = []; // Массив активных анимаций
        
        this.updatePositions();
    }
    
    updatePositions() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.modalX = (w - this.modalWidth) / 2;
        this.modalY = (h - this.modalHeight) / 2;
        
        // Кнопка закрытия (в углу с отступом, сдвинута ниже и левее)
        this.closeButton.x = this.modalX + this.modalWidth - 60;
        this.closeButton.y = this.modalY + 50;
        
        // Кнопки переключения режима (над списком)
        const listX = this.modalX + 35; // Сдвинуто на 10 пикселей вправо
        const buttonSpacing = 10;
        this.keepnetButton.x = listX;
        this.keepnetButton.y = this.modalY + 95;
        this.trophiesButton.x = listX + this.keepnetButton.width + buttonSpacing;
        this.trophiesButton.y = this.modalY + 95;
        
        // Кнопки продажи (справа внизу)
        const detailsX = this.modalX + this.listWidth + 50;
        const detailsWidth = this.modalWidth - this.listWidth - 75;
        
        this.sellButton.x = detailsX + detailsWidth / 2 - this.sellButton.width - 10;
        this.sellButton.y = this.modalY + this.modalHeight - 80;
        
        this.sellAllButton.x = detailsX + detailsWidth / 2 + 10;
        this.sellAllButton.y = this.modalY + this.modalHeight - 80;
    }
    
    show(playerCoins, keepnetFish, trophies) {
        this.visible = true;
        this.playerCoins = playerCoins;
        this.keepnetFish = keepnetFish || [];
        this.trophies = trophies || [];
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.viewMode = 'keepnet'; // По умолчанию показываем садок
        
        this.loadEntries();
        this.updatePositions();
        
        // Обновляем цены при открытии
        this.market.update();
        
        console.log(`MarketUI: Открыт рынок. Рыб в садке: ${this.keepnetFish.length}, Чучел: ${this.trophies.length}`);
    }
    
    hide() {
        this.visible = false;
        this.fishEntries = [];
        // Очищаем анимации продажи при выходе из рынка
        this.saleAnimations = [];
    }
    
    // Загрузить список рыб/чучел в зависимости от режима
    loadEntries() {
        this.fishEntries = [];
        
        if (this.viewMode === 'keepnet') {
            this.loadKeepnetEntries();
        } else {
            this.loadTrophyEntries();
        }
    }
    
    // Загрузить список рыб из садка
    loadKeepnetEntries() {
        console.log('MarketUI: loadKeepnetEntries вызван');
        console.log('MarketUI: keepnetFish =', this.keepnetFish);
        
        if (!this.keepnetFish || this.keepnetFish.length === 0) {
            console.log('MarketUI: Садок пуст');
            return;
        }
        
        // Каждая рыба - отдельный элемент (не группируем)
        this.keepnetFish.forEach((fish, index) => {
            // Используем caughtWeight если есть, иначе weight
            const fishWeight = fish.caughtWeight || fish.weight || 0;
            const basePrice = fish.sellPrice || 0;
            const currentPrice = this.market.getFishPrice(fish.id, basePrice);
            const multiplier = this.market.getPriceMultiplier(fish.id);
            
            this.fishEntries.push({
                ...fish,
                type: 'fish',
                index: index, // Индекс в массиве садка
                weight: fishWeight,
                basePrice: basePrice,
                currentPrice: currentPrice,
                priceMultiplier: multiplier
            });
        });
    }
    
    // Загрузить список чучел
    loadTrophyEntries() {
        console.log('MarketUI: loadTrophyEntries вызван');
        console.log('MarketUI: trophies =', this.trophies);
        
        if (!this.trophies || this.trophies.length === 0) {
            console.log('MarketUI: Чучел нет');
            return;
        }
        
        // Каждое чучело - отдельный элемент
        this.trophies.forEach((trophy, index) => {
            // Получаем данные рыбы для расчета цены
            const fishData = this.getFishData(trophy.fishId);
            const baseFishPrice = fishData?.sellPrice || 100;
            
            // Базовая цена чучела - 70% от стоимости рыбы
            const trophyBasePrice = Math.floor(baseFishPrice * trophy.weight * 0.7);
            
            // Применяем плавающие цены через MarketSystem
            const currentPrice = this.market.getFishPrice(trophy.fishId, trophyBasePrice);
            const multiplier = this.market.getPriceMultiplier(trophy.fishId);
            
            this.fishEntries.push({
                ...trophy,
                type: 'trophy',
                index: index, // Индекс в массиве чучел
                basePrice: trophyBasePrice,
                currentPrice: currentPrice,
                priceMultiplier: multiplier
            });
        });
    }
    
    // Получить данные рыбы из базы
    getFishData(fishId) {
        if (window.FISH_DATABASE) {
            return window.FISH_DATABASE[fishId];
        }
        return null;
    }
    
    update(dt) {
        const targetProgress = this.visible ? 1 : 0;
        this.animProgress += (targetProgress - this.animProgress) * dt * 10;
        
        if (!this.visible && this.animProgress < 0.01) {
            this.animProgress = 0;
        }
        
        // Анимация масштаба кнопок (плавное возвращение)
        this.sellButton.scale += (this.sellButton.targetScale - this.sellButton.scale) * dt * 15;
        this.sellAllButton.scale += (this.sellAllButton.targetScale - this.sellAllButton.scale) * dt * 15;
        
        // Инерция скролла
        if (!this.isDragging && Math.abs(this.dragVelocity) > 0.1) {
            this.scrollOffset += this.dragVelocity * dt * 60;
            this.dragVelocity *= 0.92;
            
            const maxScroll = Math.max(0, this.fishEntries.length - this.maxVisibleItems);
            this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset));
            
            if (Math.abs(this.dragVelocity) < 0.1) {
                this.dragVelocity = 0;
            }
        }
        
        // Обновляем анимации продажи
        this.saleAnimations = this.saleAnimations.filter(anim => {
            anim.progress += dt * 0.6; // Скорость анимации (замедлено с 1.5 до 0.6 для более долгого отображения)
            return anim.progress < 1; // Удаляем завершенные
        });
        
        // Обновляем цены (для обоих режимов)
        if (this.market.update()) {
            // Цены обновились - перезагружаем список
            this.loadEntries();
        }
    }
    
    handleClick(x, y) {
        if (!this.visible) return false;
        
        // Воспроизводим звук клика
        if (this.audioManager) this.audioManager.playClickSound();
        
        // Кнопка закрытия (увеличенная в 2 раза)
        const dx = x - this.closeButton.x;
        const dy = y - this.closeButton.y;
        if (Math.sqrt(dx * dx + dy * dy) < this.closeButton.size) { // Увеличиваем область клика в 2 раза
            this.hide();
            return false;
        }
        
        // Клик вне окна - закрыть
        if (x < this.modalX || x > this.modalX + this.modalWidth ||
            y < this.modalY || y > this.modalY + this.modalHeight) {
            this.hide();
            return false;
        }
        
        // Кнопка "Садок"
        if (x >= this.keepnetButton.x && x <= this.keepnetButton.x + this.keepnetButton.width &&
            y >= this.keepnetButton.y && y <= this.keepnetButton.y + this.keepnetButton.height) {
            if (this.viewMode !== 'keepnet') {
                this.viewMode = 'keepnet';
                this.selectedIndex = -1;
                this.scrollOffset = 0;
                this.loadEntries();
            }
            return true;
        }
        
        // Кнопка "Чучела"
        if (x >= this.trophiesButton.x && x <= this.trophiesButton.x + this.trophiesButton.width &&
            y >= this.trophiesButton.y && y <= this.trophiesButton.y + this.trophiesButton.height) {
            if (this.viewMode !== 'trophies') {
                this.viewMode = 'trophies';
                this.selectedIndex = -1;
                this.scrollOffset = 0;
                this.loadEntries();
            }
            return true;
        }
        
        // Кнопка "Продать"
        if (this.selectedIndex >= 0 && this.selectedIndex < this.fishEntries.length) {
            if (x >= this.sellButton.x && x <= this.sellButton.x + this.sellButton.width &&
                y >= this.sellButton.y && y <= this.sellButton.y + this.sellButton.height) {
                // Анимация нажатия кнопки
                this.sellButton.targetScale = 0.85;
                setTimeout(() => {
                    this.sellButton.targetScale = 1.0;
                }, 100);
                this.sellSelectedFish();
                return true;
            }
        }
        
        // Кнопка "Продать всё"
        if (this.fishEntries.length > 0) {
            if (x >= this.sellAllButton.x && x <= this.sellAllButton.x + this.sellAllButton.width &&
                y >= this.sellAllButton.y && y <= this.sellAllButton.y + this.sellAllButton.height) {
                // Анимация нажатия кнопки
                this.sellAllButton.targetScale = 0.85;
                setTimeout(() => {
                    this.sellAllButton.targetScale = 1.0;
                }, 100);
                this.sellAllFish();
                return true;
            }
        }
        
        // Начало перетаскивания списка
        const listX = this.modalX + 25;
        const listY = this.modalY + 155;
        const listHeight = this.modalHeight - 180;
        
        if (x >= listX && x <= listX + this.listWidth &&
            y >= listY && y <= listY + listHeight) {
            this.isDragging = true;
            this.dragStartX = x;
            this.dragStartY = y;
            this.dragStartScroll = this.scrollOffset;
            this.lastDragX = x;
            this.lastDragY = y;
            this.lastDragTime = performance.now();
            this.dragVelocity = 0;
            return true;
        }
        
        return true;
    }
    
    handleMouseDown(x, y) {
        return this.handleClick(x, y);
    }
    
    handleMouseMove(x, y) {
        if (!this.visible || !this.isDragging) return;
        
        // Для ПК: проверяем минимальное расстояние перед началом скролла
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isMobile) {
            const dragDistance = Math.sqrt(
                Math.pow(this.dragStartX - x, 2) + Math.pow(this.dragStartY - y, 2)
            );
            // Если перемещение меньше 10 пикселей, не начинаем скролл
            if (dragDistance < 10) {
                return;
            }
            // Отмечаем что начался реальный скролл
            this.isActuallyScrolling = true;
        }
        
        const deltaY = this.dragStartY - y;
        const deltaItems = deltaY / this.listItemHeight;
        
        this.scrollOffset = this.dragStartScroll + deltaItems;
        
        const maxScroll = Math.max(0, this.fishEntries.length - this.maxVisibleItems);
        this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset));
        
        const now = performance.now();
        const dt = (now - this.lastDragTime) / 1000;
        if (dt > 0) {
            const velocity = (this.lastDragY - y) / dt / this.listItemHeight;
            this.dragVelocity = velocity * 0.3;
        }
        
        this.lastDragX = x;
        this.lastDragY = y;
        this.lastDragTime = now;
    }
    
    handleMouseUp() {
        if (!this.visible) return;
        
        if (this.isDragging) {
            const wasDragging = this.isDragging;
            const wasScrolling = this.isActuallyScrolling || false;
            
            // Всегда сбрасываем флаги
            this.isDragging = false;
            this.isActuallyScrolling = false;
            
            // Для ПК: если не было реального скролла, обрабатываем как клик
            const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            if (!isMobile && !wasScrolling) {
                // На ПК: это был клик, а не скролл
                const listX = this.modalX + 25;
                const listY = this.modalY + 145;
                const relativeY = this.lastDragY - listY;
                const clickedIndex = Math.floor(relativeY / this.listItemHeight + this.scrollOffset);
                
                if (clickedIndex >= 0 && clickedIndex < this.fishEntries.length) {
                    this.selectedIndex = clickedIndex;
                }
                this.dragVelocity = 0;
            } else if (isMobile) {
                // Для мобильных: проверяем расстояние как раньше
                const dragDistance = Math.abs(this.dragStartY - this.lastDragY);
                if (dragDistance < 15) {
                    // Это был клик, а не скролл
                    const listX = this.modalX + 25;
                    const listY = this.modalY + 145;
                    const relativeY = this.lastDragY - listY;
                    const clickedIndex = Math.floor(relativeY / this.listItemHeight + this.scrollOffset);
                    
                    if (clickedIndex >= 0 && clickedIndex < this.fishEntries.length) {
                        this.selectedIndex = clickedIndex;
                    }
                    this.dragVelocity = 0;
                }
            }
        }
    }
    
    handleScroll(deltaY) {
        if (!this.visible) return;
        
        const maxScroll = Math.max(0, this.fishEntries.length - this.maxVisibleItems);
        // Нормализуем deltaY (обычно от -100 до 100) и делаем скролл более плавным
        const scrollAmount = Math.sign(deltaY) * 0.3; // Скролл на 0.3 элемента за раз
        this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset + scrollAmount));
        this.dragVelocity = 0;
    }
    
    // Продать выбранную рыбу/чучело
    sellSelectedFish() {
        if (this.selectedIndex < 0 || this.selectedIndex >= this.fishEntries.length) return;
        
        const entry = this.fishEntries[this.selectedIndex];
        const price = entry.currentPrice;
        
        console.log(`MarketUI: Продажа ${entry.name} (${entry.weight.toFixed(2)} кг) за ${price}💰`);
        
        // Звук успешной продажи
        if (this.audioManager) this.audioManager.playSound('kup');
        
        // Создаем анимацию продажи
        this.createSaleAnimation(price, 1);
        
        if (entry.type === 'fish') {
            // Продажа рыбы из садка
            if (this.onSell) {
                this.onSell(entry.index, price);
            }
        } else if (entry.type === 'trophy') {
            // Продажа чучела
            if (this.onSellTrophy) {
                this.onSellTrophy(entry.id, price);
            }
        }
        
        // Удаляем из списка
        this.fishEntries.splice(this.selectedIndex, 1);
        this.selectedIndex = -1;
    }
    
    // Продать всё
    sellAllFish() {
        if (this.fishEntries.length === 0) return;
        
        let totalPrice = 0;
        const itemCount = this.fishEntries.length;
        
        this.fishEntries.forEach(entry => {
            totalPrice += entry.currentPrice;
        });
        
        const itemType = this.viewMode === 'keepnet' ? 'рыбы' : 'чучел';
        console.log(`MarketUI: Продажа всех ${itemType} за ${totalPrice}💰`);
        
        // Звук успешной продажи
        if (this.audioManager) this.audioManager.playSound('kup');
        
        // Создаем анимацию продажи
        this.createSaleAnimation(totalPrice, itemCount);
        
        if (this.viewMode === 'keepnet') {
            // Продажа всей рыбы
            if (this.onSellAll) {
                this.onSellAll(totalPrice);
            }
        } else {
            // Продажа всех чучел
            if (this.onSellAllTrophies) {
                this.onSellAllTrophies(totalPrice);
            }
        }
        
        this.fishEntries = [];
        this.selectedIndex = -1;
    }
    
    // Создать анимацию продажи
    createSaleAnimation(price, fishCount) {
        const centerX = this.modalX + this.modalWidth / 2;
        const centerY = this.modalY + this.modalHeight / 2;
        
        // Создаем несколько монет для красоты
        const coinCount = Math.min(8, Math.max(3, Math.floor(price / 50)));
        
        for (let i = 0; i < coinCount; i++) {
            const angle = (Math.PI * 2 * i) / coinCount;
            const distance = 80 + Math.random() * 40;
            
            this.saleAnimations.push({
                type: 'coin',
                startX: centerX + Math.cos(angle) * 30,
                startY: centerY + Math.sin(angle) * 30,
                endX: centerX + Math.cos(angle) * distance,
                endY: centerY + Math.sin(angle) * distance - 100,
                progress: 0,
                delay: i * 0.05,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
        
        // Текст с суммой (без смайлика, только спрайт)
        this.saleAnimations.push({
            type: 'text',
            text: `+${price}`,
            x: centerX,
            y: centerY - 50,
            progress: 0,
            delay: 0,
            showCoin: true // Флаг для отображения спрайта монеты
        });
        
        // Текст с количеством рыб (если больше 1)
        if (fishCount > 1) {
            const itemTypeKey = this.viewMode === 'trophies' ? 'trophies_sold' : 'fish_sold';
            const itemTypeText = L(itemTypeKey, this.viewMode === 'trophies' ? 'чучел продано!' : 'рыб продано!');
            this.saleAnimations.push({
                type: 'text',
                text: `${fishCount} ${itemTypeText}`,
                x: centerX,
                y: centerY + 20,
                progress: 0,
                delay: 0.1,
                showCoin: false
            });
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
        
        // Кнопки переключения режима
        this.renderModeButtons(ctx);
        
        // Список рыб/чучел (слева)
        this.renderFishList(ctx);
        
        // Детали выбранной рыбы (справа)
        this.renderFishDetails(ctx);
        
        // Кнопка закрытия
        this.renderCloseButton(ctx);
        
        // Анимации продажи (поверх всего)
        this.renderSaleAnimations(ctx);
        
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
            gradient.addColorStop(0, '#1a472a');
            gradient.addColorStop(1, '#2d5a3d');
            
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
        ctx.font = fontManager.getFont(40);
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L('market', 'РЫНОК'), this.modalX + this.modalWidth / 2, this.modalY + 40);
        fontManager.applyLetterSpacing(ctx, false);
        
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
        const coinsX = this.modalX + this.modalWidth - 120; // Сдвинуто левее на 80px
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
        
        // Таймер обновления цен (для обоих режимов)
        ctx.fillStyle = '#ecf0f1';
        ctx.font = fontManager.getFont(18, 'normal');
        ctx.textAlign = 'center';
        const timeText = `${L('price_update_in', 'Обновление цен через')}: ${this.market.getFormattedTimeUntilUpdate()}`;
        ctx.fillText(timeText, this.modalX + this.modalWidth / 2, this.modalY + 85);
        
        ctx.restore();
    }
    
    renderModeButtons(ctx) {
        ctx.save();
        
        // Получаем изображение uipan.png
        const uipanImage = assetManager.getImage('uipan.png');
        
        // Кнопка "Садок"
        const isKeepnetActive = this.viewMode === 'keepnet';
        
        if (uipanImage) {
            // Рисуем фон кнопки используя uipan.png
            ctx.drawImage(
                uipanImage,
                this.keepnetButton.x, this.keepnetButton.y,
                this.keepnetButton.width, this.keepnetButton.height
            );
        } else {
            // Fallback - обычный фон если изображение не загружено
            ctx.fillStyle = isKeepnetActive ? '#27ae60' : 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.roundRect(this.keepnetButton.x, this.keepnetButton.y, this.keepnetButton.width, this.keepnetButton.height, 8);
            ctx.fill();
        }
        
        if (isKeepnetActive) {
            ctx.strokeStyle = '#229954';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(this.keepnetButton.x, this.keepnetButton.y, this.keepnetButton.width, this.keepnetButton.height, 8);
            ctx.stroke();
        }
        
        ctx.fillStyle = isKeepnetActive ? '#fff' : 'rgba(255, 255, 255, 0.6)';
        ctx.font = fontManager.getFont(20);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L('keepnet_button', '🐟 Садок'), this.keepnetButton.x + this.keepnetButton.width / 2, this.keepnetButton.y + this.keepnetButton.height / 2);
        
        // Кнопка "Чучела"
        const isTrophiesActive = this.viewMode === 'trophies';
        
        if (uipanImage) {
            // Рисуем фон кнопки используя uipan.png
            ctx.drawImage(
                uipanImage,
                this.trophiesButton.x, this.trophiesButton.y,
                this.trophiesButton.width, this.trophiesButton.height
            );
        } else {
            // Fallback - обычный фон если изображение не загружено
            ctx.fillStyle = isTrophiesActive ? '#27ae60' : 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.roundRect(this.trophiesButton.x, this.trophiesButton.y, this.trophiesButton.width, this.trophiesButton.height, 8);
            ctx.fill();
        }
        
        if (isTrophiesActive) {
            ctx.strokeStyle = '#229954';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(this.trophiesButton.x, this.trophiesButton.y, this.trophiesButton.width, this.trophiesButton.height, 8);
            ctx.stroke();
        }
        
        ctx.fillStyle = isTrophiesActive ? '#fff' : 'rgba(255, 255, 255, 0.6)';
        ctx.font = fontManager.getFont(20);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L('trophies_button', '🏆 Чучела'), this.trophiesButton.x + this.trophiesButton.width / 2, this.trophiesButton.y + this.trophiesButton.height / 2);
        
        ctx.restore();
    }
    
    renderFishList(ctx) {
        const listX = this.modalX + 25;
        const listY = this.modalY + 155; // Сдвинуто вниз, чтобы освободить место для кнопок
        const listHeight = this.modalHeight - 180;
        
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
        if (this.fishEntries.length === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = fontManager.getFont(20, 'normal');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const emptyText = this.viewMode === 'keepnet' ? L('keepnet_empty_text', 'Садок пуст') : L('no_trophies_text', 'Нет чучел');
            ctx.fillText(emptyText, listX + this.listWidth / 2, listY + listHeight / 2);
        } else {
            const visibleStart = Math.floor(this.scrollOffset);
            const visibleEnd = Math.min(this.fishEntries.length, visibleStart + this.maxVisibleItems + 2);
            
            for (let i = visibleStart; i < visibleEnd; i++) {
                const entry = this.fishEntries[i];
                const itemY = listY + (i - this.scrollOffset) * this.listItemHeight + 8;
                
                this.renderListEntry(ctx, entry, i, listX + 8, itemY);
            }
        }
        
        ctx.restore();
        ctx.restore();
        
        // Скроллбар
        if (this.fishEntries.length > this.maxVisibleItems) {
            this.renderScrollbar(ctx, listX + this.listWidth - 15, listY + 8, 10, listHeight - 16);
        }
    }
    
    renderListEntry(ctx, entry, index, x, y) {
        const width = this.listWidth - 25;
        const height = this.listItemHeight - 8;
        const isSelected = index === this.selectedIndex;
        
        ctx.save();
        
        // Фон элемента
        if (isSelected) {
            ctx.fillStyle = 'rgba(39, 174, 96, 0.4)';
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        }
        
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 6);
        ctx.fill();
        
        if (isSelected) {
            ctx.strokeStyle = '#27ae60';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Иконка рыбы - используем только спрайт
        const iconSize = 60;
        const iconX = x + 45;
        const iconY = y + height / 2;
        
        // Для чучел используем fishId, для рыб - id
        const fishId = entry.type === 'trophy' ? entry.fishId : entry.id;
        
        // Используем getFishImage для загрузки спрайта рыбы
        const fishImage = assetManager.getFishImage(fishId);
        if (fishImage) {
            ctx.drawImage(fishImage, iconX - iconSize / 2, iconY - iconSize / 2, iconSize, iconSize);
        }
        
        // Название
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(18);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Получаем локализованное название
        // Для чучел используем fishId для получения данных рыбы из базы
        let localizedName;
        if (entry.type === 'trophy' && window.FISH_DATABASE) {
            const fishData = window.FISH_DATABASE.find(f => f.id === entry.fishId);
            localizedName = fishData && window.FishDB ? window.FishDB.getLocalizedName(fishData) : entry.name;
        } else {
            localizedName = window.FishDB ? window.FishDB.getLocalizedName(entry) : entry.name;
        }
        const name = localizedName.length > 15 ? localizedName.substring(0, 13) + '...' : localizedName;
        ctx.fillText(name, x + 85, y + 10);
        
        // Вес
        ctx.fillStyle = '#3498db';
        ctx.font = fontManager.getFont(15, 'normal');
        ctx.fillText(`${entry.weight.toFixed(2)} ${L('kg', 'кг')}`, x + 85, y + 35);
        
        // Цена с индикатором изменения (для обоих типов)
        const pricePercent = Math.round((entry.priceMultiplier - 1) * 100);
        const priceColor = pricePercent > 0 ? '#2ecc71' : pricePercent < 0 ? '#e74c3c' : '#f39c12';
        
        ctx.fillStyle = priceColor;
        ctx.font = fontManager.getFont(15);
        const priceText = `${entry.currentPrice}💰 (${pricePercent > 0 ? '+' : ''}${pricePercent}%)`;
        assetManager.drawTextWithCoinIcon(ctx, priceText, x + 85, y + 58, 15);
        
        ctx.restore();
    }
    
    renderScrollbar(ctx, x, y, width, height) {
        const totalItems = this.fishEntries.length;
        const visibleRatio = this.maxVisibleItems / totalItems;
        const scrollRatio = this.scrollOffset / (totalItems - this.maxVisibleItems);
        
        const thumbHeight = Math.max(30, height * visibleRatio);
        const thumbY = y + (height - thumbHeight) * scrollRatio;
        
        ctx.save();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 4);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.roundRect(x, thumbY, width, thumbHeight, 4);
        ctx.fill();
        
        ctx.restore();
    }
    
    renderFishDetails(ctx) {
        const detailsX = this.modalX + this.listWidth + 50;
        const detailsY = this.modalY + 145;
        const detailsWidth = this.modalWidth - this.listWidth - 75;
        const detailsHeight = this.modalHeight - 170;
        
        ctx.save();
        
        // Фон панели деталей
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.roundRect(detailsX, detailsY, detailsWidth, detailsHeight, 8);
        ctx.fill();
        
        if (this.selectedIndex < 0 || this.selectedIndex >= this.fishEntries.length) {
            // Нет выбранной рыбы
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = fontManager.getFont(22, 'normal');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L('market_select_fish', 'Выберите рыбу для продажи'), detailsX + detailsWidth / 2, detailsY + detailsHeight / 2);
            
            // Кнопка "Продать всё" если есть рыба
            if (this.fishEntries.length > 0) {
                this.renderSellAllButton(ctx);
            }
            
            ctx.restore();
            return;
        }
        
        const entry = this.fishEntries[this.selectedIndex];
        
        // Большая иконка
        const iconSize = 120;
        const iconX = detailsX + detailsWidth / 2;
        const iconY = detailsY + 80;
        
        // Рисуем спрайт рыбы (для чучел используем fishId, для рыб - id)
        const fishId = entry.type === 'trophy' ? entry.fishId : entry.id;
        
        // Используем getFishImage для загрузки спрайта рыбы
        const fishImage = assetManager.getFishImage(fishId);
        if (fishImage) {
            ctx.drawImage(fishImage, iconX - iconSize / 2, iconY - iconSize / 2, iconSize, iconSize);
        }
        
        // Название
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(32);
        ctx.textAlign = 'center';
        // Получаем локализованное название
        // Для чучел используем fishId для получения данных рыбы из базы
        let localizedName;
        if (entry.type === 'trophy' && window.FISH_DATABASE) {
            const fishData = window.FISH_DATABASE.find(f => f.id === entry.fishId);
            localizedName = fishData && window.FishDB ? window.FishDB.getLocalizedName(fishData) : entry.name;
        } else {
            localizedName = window.FishDB ? window.FishDB.getLocalizedName(entry) : entry.name;
        }
        ctx.fillText(localizedName, iconX, detailsY + 155);
        
        // Информация
        ctx.font = fontManager.getFont(20, 'normal');
        ctx.textAlign = 'left';
        const statsX = detailsX + 25;
        let statsY = detailsY + 200;
        const lineHeight = 35;
        
        // Вес
        ctx.fillStyle = '#9b59b6';
        ctx.fillText(`${L('weight', 'Вес')}: ${entry.weight.toFixed(2)} ${L('kg', 'кг')}`, statsX, statsY);
        statsY += lineHeight;
        
        statsY += 10;
        
        // Базовая цена
        ctx.fillStyle = '#95a5a6';
        const basePriceLabel = L('market_base_price', 'Базовая цена:');
        assetManager.drawTextWithCoinIcon(ctx, `${basePriceLabel} ${entry.basePrice}💰`, statsX, statsY, 18);
        statsY += lineHeight;
        
        // Текущая цена с процентами (для обоих типов)
        const pricePercent = Math.round((entry.priceMultiplier - 1) * 100);
        const priceColor = pricePercent > 0 ? '#2ecc71' : pricePercent < 0 ? '#e74c3c' : '#f39c12';
        
        ctx.fillStyle = priceColor;
        ctx.font = fontManager.getFont(22);
        const currentPriceLabel = L('market_current_price', 'Текущая цена:');
        assetManager.drawTextWithCoinIcon(ctx, `${currentPriceLabel} ${entry.currentPrice}💰 (${pricePercent > 0 ? '+' : ''}${pricePercent}%)`, statsX, statsY, 22);
        statsY += lineHeight + 5;
        
        // Итоговая сумма
        ctx.fillStyle = '#f1c40f';
        ctx.font = fontManager.getFont(26);
        const totalLabel = L('market_total', 'Итого:');
        assetManager.drawTextWithCoinIcon(ctx, `${totalLabel} ${entry.currentPrice}💰`, statsX, statsY, 26);
        
        // Кнопки продажи
        this.renderSellButton(ctx);
        this.renderSellAllButton(ctx);
        
        ctx.restore();
    }
    
    renderSellButton(ctx) {
        if (this.selectedIndex < 0) return;
        
        ctx.save();
        
        // Применяем масштабирование для анимации нажатия
        const centerX = this.sellButton.x + this.sellButton.width / 2;
        const centerY = this.sellButton.y + this.sellButton.height / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(this.sellButton.scale, this.sellButton.scale);
        ctx.translate(-centerX, -centerY);
        
        // Фон кнопки
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.roundRect(this.sellButton.x, this.sellButton.y, this.sellButton.width, this.sellButton.height, 8);
        ctx.fill();
        
        // Обводка
        ctx.strokeStyle = '#229954';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Текст
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L('sell', 'Продать'), this.sellButton.x + this.sellButton.width / 2, this.sellButton.y + this.sellButton.height / 2);
        
        ctx.restore();
    }
    
    renderSellAllButton(ctx) {
        if (this.fishEntries.length === 0) return;
        
        ctx.save();
        
        // Применяем масштабирование для анимации нажатия
        const centerX = this.sellAllButton.x + this.sellAllButton.width / 2;
        const centerY = this.sellAllButton.y + this.sellAllButton.height / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(this.sellAllButton.scale, this.sellAllButton.scale);
        ctx.translate(-centerX, -centerY);
        
        // Фон кнопки
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.roundRect(this.sellAllButton.x, this.sellAllButton.y, this.sellAllButton.width, this.sellAllButton.height, 8);
        ctx.fill();
        
        // Обводка
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Текст
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L('sell_all', 'Продать всё'), this.sellAllButton.x + this.sellAllButton.width / 2, this.sellAllButton.y + this.sellAllButton.height / 2);
        
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
            ctx.fillStyle = '#e74c3c';
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

    // Рендер анимаций продажи
    renderSaleAnimations(ctx) {
        if (this.saleAnimations.length === 0) return;
        
        ctx.save();
        
        this.saleAnimations.forEach(anim => {
            // Учитываем задержку
            const effectiveProgress = Math.max(0, Math.min(1, (anim.progress - anim.delay) / (1 - anim.delay)));
            
            if (effectiveProgress <= 0) return;
            
            if (anim.type === 'coin') {
                this.renderCoinAnimation(ctx, anim, effectiveProgress);
            } else if (anim.type === 'text') {
                this.renderTextAnimation(ctx, anim, effectiveProgress);
            }
        });
        
        ctx.restore();
    }
    
    // Анимация монеты
    renderCoinAnimation(ctx, anim, progress) {
        // Easing: быстрый старт, медленный конец
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const x = anim.startX + (anim.endX - anim.startX) * easeOut;
        const y = anim.startY + (anim.endY - anim.startY) * easeOut;
        
        // Прозрачность: появляется быстро, исчезает в конце
        const alpha = progress < 0.1 ? progress / 0.1 : progress > 0.8 ? (1 - progress) / 0.2 : 1;
        
        // Размер: увеличивается в начале
        const scale = progress < 0.2 ? progress / 0.2 : 1;
        const size = 40 * scale;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.rotate(anim.rotation + anim.rotationSpeed * progress);
        
        // Рисуем монету
        // Золотой круг
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Обводка
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Блик
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(-size / 6, -size / 6, size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Символ монеты - используем спрайт вместо эмодзи
        const coinSize = Math.floor(size * 0.6);
        assetManager.drawCoinIcon(ctx, 0, 0, coinSize);
        
        ctx.restore();
    }
    
    // Анимация текста
    renderTextAnimation(ctx, anim, progress) {
        // Easing: плавное появление и исчезание
        const easeInOut = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // Движение вверх
        const y = anim.y - easeInOut * 80;
        
        // Прозрачность: появляется, держится дольше, исчезает
        let alpha;
        if (progress < 0.15) {
            // Быстрое появление
            alpha = progress / 0.15;
        } else if (progress > 0.85) {
            // Медленное исчезание
            alpha = (1 - progress) / 0.15;
        } else {
            // Долгое отображение
            alpha = 1;
        }
        
        // Размер: немного увеличивается в начале
        const scale = progress < 0.3 ? 0.8 + (progress / 0.3) * 0.2 : 1;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(anim.x, y);
        ctx.scale(scale, scale);
        
        // Тень для читаемости
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        
        // Текст
        ctx.fillStyle = '#f1c40f';
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 3;
        ctx.font = fontManager.getFont(36);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Рисуем текст (без смайликов)
        ctx.strokeText(anim.text, 0, 0);
        ctx.fillText(anim.text, 0, 0);
        
        // Рисуем иконку монеты если нужно
        if (anim.showCoin) {
            const textWidth = ctx.measureText(anim.text).width;
            assetManager.drawCoinIcon(ctx, textWidth / 2 + 18, 0, 30);
        }
        
        ctx.restore();
    }
}
