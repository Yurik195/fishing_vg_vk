// UI для системы трофеев
class TrophyUI {
    constructor(canvas, trophySystem, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        this.trophySystem = trophySystem;
        
        this.isOpen = false;
        this.playerCoins = 0;
        this.playerGems = 0;
        this.availableFish = []; // Рыбы из садка
        
        // Списки
        this.fishListScroll = 0;
        this.trophyListScroll = 0;
        this.maxFishScroll = 0;
        this.maxTrophyScroll = 0;
        
        // Модальное окно изготовления
        this.craftModal = {
            visible: false,
            fish: null
        };
        
        // Модальное окно информации о чучеле
        this.infoModal = {
            visible: false,
            trophy: null
        };
        
        // Скрытие списков
        this.listsHidden = false;
        
        // Перетаскивание
        this.draggedTrophy = null;
        this.dragStartTime = 0;
        this.dragThreshold = 100; // мс для начала перетаскивания (уменьшено для мобильных)
        this.isDraggingTrophy = false;
        this.dragSourceIndex = -1;
        this.dragOffset = { x: 0, y: 0 };
        this.mousePos = { x: 0, y: 0 }; // Позиция мыши
        this.lastScrollTime = 0; // Время последнего скролла
        this.potentialDragTrophy = null; // Потенциальное чучело для перетаскивания
        this.isScrolling = false; // Флаг активного скролла
        
        // Наведение
        this.hoveredFish = null;
        this.hoveredTrophy = null;
        this.hoveredSlot = null;
        this.hoveredButton = null;
        
        // Для drag-scroll
        this.isDraggingList = false;
        this.dragStartY = 0;
        this.dragStartScroll = 0;
        this.activeList = null; // 'fish' или 'trophy'
        
        this.closeButton = { x: 0, y: 0, width: 120, height: 50 };
        this.toggleListsButton = { x: 0, y: 0, width: 120, height: 50 };
    }
    
    show(coins, gems, storedFish) {
        this.isOpen = true;
        this.playerCoins = coins;
        this.playerGems = gems;
        this.availableFish = storedFish || [];
        this.fishListScroll = 0;
        this.trophyListScroll = 0;
        this.craftModal.visible = false;
        this.updateLayout();
        
        // Отладка: проверяем загрузку фона
        const kladovkImage = assetManager.getImage('kladovk.jpg');
        console.log('TrophyUI открыт. Фон kladovk.jpg:', kladovkImage ? 'загружен ✅' : 'НЕ загружен ❌');
    }
    
    hide() {
        this.isOpen = false;
        this.craftModal.visible = false;
        this.infoModal.visible = false;
        this.draggedTrophy = null;
        this.isDraggingTrophy = false;
    }
    
    updateLayout() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Кнопка закрытия
        this.closeButton.x = w / 2 + 70;
        this.closeButton.y = h - 80;
        
        // Кнопка скрытия списков
        this.toggleListsButton.x = w / 2 - 190;
        this.toggleListsButton.y = h - 80;
        
        // Вычисляем максимальный скролл (обновляем для новых позиций)
        const fishItemHeight = 70;
        const trophyItemHeight = 70;
        const listHeight = h - 250; // Обновляем высоту списков (было h - 200)
        
        // Для списка чучел учитываем только неустановленные
        const installedIds = Object.values(this.trophySystem.installedTrophies);
        const availableTrophies = this.trophySystem.trophies.filter(
            trophy => !installedIds.includes(trophy.id)
        );
        
        this.maxFishScroll = Math.max(0, this.availableFish.length * fishItemHeight - listHeight);
        this.maxTrophyScroll = Math.max(0, availableTrophies.length * trophyItemHeight - listHeight);
    }
    
    handleClick(x, y) {
        if (!this.isOpen) return false;
        
        // Воспроизводим звук клика
        if (this.audioManager) this.audioManager.playClickSound();
        
        // Закрытие модального окна изготовления
        if (this.craftModal.visible) {
            const modalW = 400;
            const modalH = 300;
            const modalX = this.canvas.width / 2 - modalW / 2;
            const modalY = this.canvas.height / 2 - modalH / 2;
            
            // Крестик закрытия
            if (x >= modalX + modalW - 40 && x <= modalX + modalW - 10 &&
                y >= modalY + 10 && y <= modalY + 40) {
                this.craftModal.visible = false;
                return true;
            }
            
            // Кнопка "Сделать чучело"
            const btnY = modalY + modalH - 70;
            if (x >= modalX + 50 && x <= modalX + modalW - 50 &&
                y >= btnY && y <= btnY + 50) {
                this.craftTrophy();
                return true;
            }
            
            return true; // Поглощаем клики в модалке
        }
        
        // Клик по кнопке закрытия
        if (x >= this.closeButton.x && x <= this.closeButton.x + this.closeButton.width &&
            y >= this.closeButton.y && y <= this.closeButton.y + this.closeButton.height) {
            this.hide();
            return false;
        }
        
        // Клик по кнопке скрытия списков
        if (x >= this.toggleListsButton.x && x <= this.toggleListsButton.x + this.toggleListsButton.width &&
            y >= this.toggleListsButton.y && y <= this.toggleListsButton.y + this.toggleListsButton.height) {
            this.listsHidden = !this.listsHidden;
            return true;
        }
        
        const w = this.canvas.width;
        const h = this.canvas.height;
        const listWidth = 180;
        
        // Клик по списку рыб (слева) - только если не было скролла
        const fishListX = 20;
        const fishListY = 150; // Обновляем координату (было 100)
        const fishListH = h - 250; // Обновляем высоту (было h - 200)
        
        if (!this.listsHidden && x >= fishListX && x <= fishListX + listWidth &&
            y >= fishListY && y <= fishListY + fishListH) {
            
            // Проверяем, был ли недавно скролл
            if (this.lastScrollTime && Date.now() - this.lastScrollTime < 300) {
                return true; // Игнорируем клик после скролла
            }
            
            const itemHeight = 70;
            const clickedIndex = Math.floor((y - fishListY + this.fishListScroll) / itemHeight);
            
            if (clickedIndex >= 0 && clickedIndex < this.availableFish.length) {
                this.openCraftModal(this.availableFish[clickedIndex]);
            }
            return true;
        }
        
        // Клик по списку чучел (справа) - не обрабатываем
        const trophyListX = w - listWidth - 20;
        const trophyListY = 150; // Обновляем координату (было 100)
        const trophyListH = h - 250; // Обновляем высоту (было h - 200)
        
        if (!this.listsHidden && x >= trophyListX && x <= trophyListX + listWidth &&
            y >= trophyListY && y <= trophyListY + trophyListH) {
            return true;
        }
        
        // Клик по слотам для разблокировки
        const centerX = w / 2;
        const centerY = h / 2;
        const slotSize = 100;
        
        for (const slot of this.trophySystem.slots) {
            const slotX = centerX + slot.x - slotSize / 2;
            const slotY = centerY + slot.y - slotSize / 2;
            
            if (x >= slotX && x <= slotX + slotSize &&
                y >= slotY && y <= slotY + slotSize) {
                
                if (!slot.unlocked) {
                    this.unlockSlot(slot);
                }
                return true;
            }
        }
        
        return true;
    }
    
    handleMouseDown(x, y) {
        if (!this.isOpen) return false;
        
        // Если открыто модальное окно создания - не активируем перетаскивание
        if (this.craftModal.visible) {
            return false;
        }
        
        // Сохраняем начальную позицию для определения клика
        this.dragStartX = x;
        this.dragStartY = y;
        
        const w = this.canvas.width;
        const h = this.canvas.height;
        const listWidth = 180;
        const trophyListY = 150;
        const trophyListH = h - 250;
        const fishListX = 20;
        const trophyListX = w - listWidth - 20;
        
        const inFishList = x >= fishListX && x <= fishListX + listWidth &&
                          y >= trophyListY && y <= trophyListY + trophyListH;
        const inTrophyList = x >= trophyListX && x <= trophyListX + listWidth &&
                            y >= trophyListY && y <= trophyListY + trophyListH;
        
        // Drag-scroll для списка рыб
        if (inFishList) {
            this.isDraggingList = true;
            this.activeList = 'fish';
            this.dragStartY = y;
            this.dragStartScroll = this.fishListScroll;
            this.lastDragY = y;
            return true;
        }
        
        // Drag-scroll для списка чучел
        if (inTrophyList) {
            // Запоминаем начальную позицию для определения намерения
            this.potentialDragTrophy = {
                x: x,
                y: y,
                startTime: Date.now()
            };
            
            // Сначала активируем drag-scroll
            this.isDraggingList = true;
            this.activeList = 'trophy';
            this.dragStartY = y;
            this.dragStartScroll = this.trophyListScroll;
            this.lastDragY = y;
            
            // Запоминаем индекс чучела на случай, если это будет перетаскивание
            const itemHeight = 70;
            const clickedIndex = Math.floor((y - trophyListY + this.trophyListScroll) / itemHeight);
            const installedIds = Object.values(this.trophySystem.installedTrophies);
            const availableTrophies = this.trophySystem.getAllTrophies().filter(
                trophy => !installedIds.includes(trophy.id)
            );
            
            if (clickedIndex >= 0 && clickedIndex < availableTrophies.length) {
                this.potentialDragTrophy.trophy = availableTrophies[clickedIndex];
                this.potentialDragTrophy.index = clickedIndex;
            }
            
            return true;
        }
        
        // Проверка начала перетаскивания установленного чучела
        const centerX = w / 2;
        const centerY = h / 2;
        const slotSize = 100;
        
        for (const slot of this.trophySystem.slots) {
            if (!slot.unlocked) continue;
            
            const trophyId = this.trophySystem.installedTrophies[slot.id];
            if (!trophyId) continue;
            
            const slotX = centerX + slot.x - slotSize / 2;
            const slotY = centerY + slot.y - slotSize / 2;
            
            if (x >= slotX && x <= slotX + slotSize &&
                y >= slotY && y <= slotY + slotSize) {
                const trophy = this.trophySystem.getTrophy(trophyId);
                if (trophy) {
                    this.draggedTrophy = trophy;
                    this.dragStartTime = Date.now();
                    this.isDraggingTrophy = true;
                    this.dragSourceIndex = -1;
                    this.dragOffset = { x: x - slotX - 50, y: y - slotY - 50 };
                    this.trophySystem.uninstallTrophy(slot.id);
                    return true;
                }
            }
        }
        
        return false;
    }
    
    handleMouseMove(x, y) {
        if (!this.isOpen) return false;
        
        // Сохраняем позицию мыши
        this.mousePos.x = x;
        this.mousePos.y = y;
        
        // Drag-scroll
        if (this.isDraggingList) {
            const deltaY = this.dragStartY - y;
            
            // Определяем порог для активации скролла в зависимости от устройства и списка
            const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isFishList = this.activeList === 'fish';
            
            // Для списка рыб на мобильных - увеличиваем порог до 20px, чтобы клики работали лучше
            const scrollThreshold = (isMobile && isFishList) ? 20 : 5;
            
            // Если движение достаточно большое, это точно скролл
            if (Math.abs(deltaY) > scrollThreshold) {
                this.isScrolling = true;
                // Отменяем потенциальное перетаскивание
                this.potentialDragTrophy = null;
            }
            
            if (this.activeList === 'fish') {
                this.fishListScroll = this.dragStartScroll + deltaY;
                this.fishListScroll = Math.max(0, Math.min(this.maxFishScroll, this.fishListScroll));
            } else if (this.activeList === 'trophy') {
                this.trophyListScroll = this.dragStartScroll + deltaY;
                this.trophyListScroll = Math.max(0, Math.min(this.maxTrophyScroll, this.trophyListScroll));
                
                // Проверяем, не пора ли активировать перетаскивание чучела
                if (!this.isScrolling && this.potentialDragTrophy && this.potentialDragTrophy.trophy) {
                    const elapsed = Date.now() - this.potentialDragTrophy.startTime;
                    const distance = Math.sqrt(
                        Math.pow(x - this.potentialDragTrophy.x, 2) + 
                        Math.pow(y - this.potentialDragTrophy.y, 2)
                    );
                    
                    // Если прошло достаточно времени и не было движения - активируем перетаскивание
                    if (elapsed >= this.dragThreshold && distance < 10) {
                        this.draggedTrophy = this.potentialDragTrophy.trophy;
                        this.dragSourceIndex = this.potentialDragTrophy.index;
                        this.isDraggingTrophy = true;
                        this.dragStartTime = Date.now();
                        
                        const w = this.canvas.width;
                        const listWidth = 180;
                        const trophyListX = w - listWidth - 20;
                        this.dragOffset = { x: x - trophyListX, y: 0 };
                        
                        // Отключаем drag-scroll
                        this.isDraggingList = false;
                        this.activeList = null;
                        this.potentialDragTrophy = null;
                        this.isScrolling = false;
                    }
                }
            }
            
            // Отмечаем время скролла
            this.lastScrollTime = Date.now();
            this.lastDragY = y;
            return true;
        }
        
        // Проверка активации перетаскивания после задержки
        if (this.draggedTrophy && !this.isDraggingTrophy && this.dragSourceIndex >= 0) {
            const elapsed = Date.now() - this.dragStartTime;
            if (elapsed >= this.dragThreshold) {
                this.isDraggingTrophy = true;
            }
        }
        
        // Обновление наведения
        this.updateHover(x, y);
        
        return false;
    }
    
    handleMouseUp(x, y) {
        if (!this.isOpen) return false;
        
        // Если открыто модальное окно создания - обрабатываем клик по нему в первую очередь
        if (this.craftModal.visible) {
            // Сбрасываем флаги перетаскивания
            this.isDraggingList = false;
            this.isDraggingTrophy = false;
            this.draggedTrophy = null;
            this.activeList = null;
            
            // Обрабатываем клик по модальному окну
            return this.handleClick(x, y);
        }
        
        // Завершение drag-scroll
        if (this.isDraggingList) {
            this.isDraggingList = false;
            const wasScrolling = this.isScrolling;
            this.isScrolling = false;
            const wasFishList = this.activeList === 'fish'; // Запоминаем, был ли это список рыб
            this.activeList = null;
            this.potentialDragTrophy = null;
            
            // Проверяем, был ли это клик (малое перемещение)
            if (this.dragStartX !== undefined && this.dragStartY !== undefined) {
                const dragDistanceX = Math.abs(x - this.dragStartX);
                const dragDistanceY = Math.abs(y - this.dragStartY);
                const totalDragDistance = Math.sqrt(dragDistanceX * dragDistanceX + dragDistanceY * dragDistanceY);
                
                // Для мобильных устройств: если это список рыб и движение небольшое (< 30px), считаем это кликом
                // даже если был небольшой скролл
                const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                const clickThreshold = isMobile ? 30 : 15; // Увеличенный порог для мобильных
                
                if (totalDragDistance < clickThreshold) {
                    // Для списка рыб на мобильных - всегда обрабатываем как клик если движение небольшое
                    if (wasFishList && isMobile) {
                        this.handleClick(x, y);
                    } else if (!wasScrolling) {
                        // Для остальных случаев - только если не было скролла
                        this.handleClick(x, y);
                    }
                }
            }
            
            return true;
        }
        
        // Завершение перетаскивания чучела
        if (this.draggedTrophy) {
            // Если не было активировано перетаскивание (короткий клик), сбрасываем
            if (!this.isDraggingTrophy) {
                this.draggedTrophy = null;
                this.dragSourceIndex = -1;
                return false; // Позволяем обработать как клик
            }
            
            const w = this.canvas.width;
            const h = this.canvas.height;
            const centerX = w / 2;
            const centerY = h / 2;
            const slotSize = 100;
            
            let installed = false;
            
            // Проверяем, попали ли в слот
            for (const slot of this.trophySystem.slots) {
                if (!slot.unlocked) continue;
                
                const slotX = centerX + slot.x - slotSize / 2;
                const slotY = centerY + slot.y - slotSize / 2;
                
                if (x >= slotX && x <= slotX + slotSize &&
                    y >= slotY && y <= slotY + slotSize) {
                    this.trophySystem.installTrophy(this.draggedTrophy.id, slot.id);
                    installed = true;
                    break;
                }
            }
            
            // Если не установили и чучело было из списка, оно автоматически вернется
            // (не удаляем из списка, пока не установим)
            
            this.draggedTrophy = null;
            this.isDraggingTrophy = false;
            this.dragSourceIndex = -1;
            return true;
        }
        
        // Если не было драга - проверяем клик по кнопкам
        if (this.dragStartX !== undefined && this.dragStartY !== undefined) {
            const dragDistanceX = Math.abs(x - this.dragStartX);
            const dragDistanceY = Math.abs(y - this.dragStartY);
            const totalDragDistance = Math.sqrt(dragDistanceX * dragDistanceX + dragDistanceY * dragDistanceY);
            
            if (totalDragDistance < 15) {
                // Это клик, обрабатываем его
                return this.handleClick(x, y);
            }
        }
        
        return false;
    }
    
    handleWheel(deltaY) {
        if (!this.isOpen) return false;
        
        const mouseX = this.mousePos.x;
        const mouseY = this.mousePos.y;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const listWidth = 180;
        const listY = 150; // Обновляем координату (было 100)
        const listH = h - 250; // Обновляем высоту (было h - 200)
        
        // Скролл списка рыб (слева)
        const fishListX = 20;
        if (mouseX >= fishListX && mouseX <= fishListX + listWidth &&
            mouseY >= listY && mouseY <= listY + listH) {
            this.fishListScroll += deltaY * 5;
            this.fishListScroll = Math.max(0, Math.min(this.maxFishScroll, this.fishListScroll));
            return true;
        }
        
        // Скролл списка чучел (справа)
        const trophyListX = w - listWidth - 20;
        if (mouseX >= trophyListX && mouseX <= trophyListX + listWidth &&
            mouseY >= listY && mouseY <= listY + listH) {
            this.trophyListScroll += deltaY * 5;
            this.trophyListScroll = Math.max(0, Math.min(this.maxTrophyScroll, this.trophyListScroll));
            return true;
        }
        
        return false;
    }
    
    updateHover(x, y) {
        this.hoveredFish = null;
        this.hoveredTrophy = null;
        this.hoveredSlot = null;
        this.hoveredButton = null;
        
        const w = this.canvas.width;
        const h = this.canvas.height;
        const listWidth = 180;
        
        // Наведение на кнопку закрытия
        if (x >= this.closeButton.x && x <= this.closeButton.x + this.closeButton.width &&
            y >= this.closeButton.y && y <= this.closeButton.y + this.closeButton.height) {
            this.hoveredButton = 'close';
        }
        
        // Наведение на кнопку скрытия списков
        if (x >= this.toggleListsButton.x && x <= this.toggleListsButton.x + this.toggleListsButton.width &&
            y >= this.toggleListsButton.y && y <= this.toggleListsButton.y + this.toggleListsButton.height) {
            this.hoveredButton = 'toggleLists';
        }
        
        // Наведение на слоты
        const centerX = w / 2;
        const centerY = h / 2;
        const slotSize = 100;
        
        for (const slot of this.trophySystem.slots) {
            const slotX = centerX + slot.x - slotSize / 2;
            const slotY = centerY + slot.y - slotSize / 2;
            
            if (x >= slotX && x <= slotX + slotSize &&
                y >= slotY && y <= slotY + slotSize) {
                this.hoveredSlot = slot;
                break;
            }
        }
    }
    
    openInfoModal(trophy) {
        this.infoModal.visible = true;
        this.infoModal.trophy = trophy;
    }
    
    openCraftModal(fish) {
        this.craftModal.visible = true;
        this.craftModal.fish = fish;
    }
    
    openSellModal(trophy) {
        this.sellModal.visible = true;
        this.sellModal.trophy = trophy;
    }
    
    craftTrophy() {
        if (!this.craftModal.fish) return;
        
        const fish = this.craftModal.fish;
        const fishData = this.trophySystem.getFishData(fish.id);
        const cost = Math.floor((fishData?.basePrice || 100) * fish.caughtWeight);
        
        if (this.playerCoins < cost) {
            console.log('Недостаточно монет для изготовления чучела');
            return;
        }
        
        // Создаем чучело
        this.trophySystem.createTrophy(fish);
        
        // Вызываем callback для списания денег и удаления рыбы
        if (this.onCraft) {
            this.onCraft(fish, cost);
        }
        
        this.craftModal.visible = false;
    }
    
    sellTrophy(trophy) {
        const sellPrice = this.trophySystem.sellTrophy(trophy.id);
        
        if (this.onSell) {
            this.onSell(sellPrice);
        }
    }
    
    unlockSlot(slot) {
        if (slot.currency === 'coins' && this.playerCoins < slot.cost) {
            console.log('Недостаточно монет');
            return;
        }
        
        if (slot.currency === 'gems' && this.playerGems < slot.cost) {
            console.log('Недостаточно кристаллов');
            return;
        }
        
        this.trophySystem.unlockSlot(slot.id);
        
        if (this.onUnlockSlot) {
            this.onUnlockSlot(slot.cost, slot.currency);
        }
    }
    
    update(dt) {
        if (!this.isOpen) return;
        this.updateLayout();
    }
    
    render() {
        if (!this.isOpen) return;
        
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Фон локации - используем kladovk.jpg
        const kladovkImage = assetManager.getImage('kladovk.jpg');
        if (kladovkImage) {
            ctx.drawImage(kladovkImage, 0, 0, w, h);
        } else {
            // Fallback - темный градиент если изображение не загружено
            const gradient = ctx.createLinearGradient(0, 0, 0, h);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
        }
        
        // Заголовок (белый цвет)
        ctx.fillStyle = '#ffffff';
        ctx.font = fontManager.getFont(36, 'bold');
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(L('trophy_room', 'Трофейная комната'), w / 2, 20);
        fontManager.applyLetterSpacing(ctx, false);
        
        // Баланс
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20);
        ctx.textAlign = 'right';
        
        // Рисуем баланс с иконками
        const balanceX = w - 30;
        const balanceY = 30;
        
        // Рисуем иконку монеты
        assetManager.drawCoinIcon(ctx, balanceX - 140, balanceY, 20);
        
        // Рисуем текст монет
        ctx.textAlign = 'left';
        ctx.fillText(`${this.playerCoins}`, balanceX - 115, balanceY);
        
        // Рисуем иконку гема
        assetManager.drawGemIcon(ctx, balanceX - 70, balanceY, 20);
        
        // Рисуем текст гемов
        ctx.fillText(`${this.playerGems}`, balanceX - 45, balanceY);
        
        // Рисуем списки и слоты
        if (!this.listsHidden) {
            this.renderFishList(ctx);
            this.renderTrophyList(ctx);
        }
        this.renderSlots(ctx);
        
        // Перетаскиваемое чучело (только если активировано)
        if (this.draggedTrophy && this.isDraggingTrophy) {
            this.renderDraggedTrophy(ctx);
        }
        
        // Модальное окно изготовления
        if (this.craftModal.visible) {
            this.renderCraftModal(ctx);
        }
        
        // Кнопки
        this.renderToggleListsButton(ctx);
        this.renderCloseButton(ctx);
    }
    
    renderFishList(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const listWidth = 180;
        const listX = 20;
        const listY = 150; // Опускаем на 50 пикселей (было 100)
        const listH = h - 250; // Корректируем высоту
        
        // Рамка rmk.png для списка рыб
        const rmkImage = assetManager.getImage('rmk.png');
        if (rmkImage) {
            // Растягиваем рамку на размер списка с небольшим отступом
            const frameMargin = 10;
            ctx.drawImage(rmkImage, 
                listX - frameMargin, 
                listY - frameMargin, 
                listWidth + frameMargin * 2, 
                listH + frameMargin * 2
            );
        }
        
        // Фон списка - полупрозрачный черный
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(listX, listY, listWidth, listH);
        
        // Убираем обводку
        
        // Заголовок (белый цвет с черной обводкой, увеличиваем на 15% и поднимаем на 20px)
        ctx.fillStyle = '#ffffff'; // Делаем белым
        ctx.strokeStyle = '#000000'; // Черная обводка
        ctx.lineWidth = 2; // Толщина обводки 2 пикселя
        ctx.font = fontManager.getFont(26, 'bold'); // Было 23, стало 26 (23 * 1.15 ≈ 26)
        ctx.textAlign = 'center';
        const fishListTitle = L('fish_list', 'Рыбы');
        ctx.strokeText(fishListTitle, listX + listWidth / 2, listY - 50); // Сначала обводка
        ctx.fillText(fishListTitle, listX + listWidth / 2, listY - 50); // Потом заливка
        
        // Подсказка (увеличиваем на 20% и делаем белой с черной обводкой, сдвигаем ниже на 10px)
        ctx.fillStyle = '#ffffff'; // Было #7f8c8d, стало белый
        ctx.strokeStyle = '#000000'; // Черная обводка
        ctx.lineWidth = 2; // Толщина обводки 2 пикселя
        ctx.font = fontManager.getFont(16); // Было 13, стало 16 (13 * 1.2 ≈ 16)
        ctx.strokeText(L('trophy_click_to_craft', 'Клик - изготовить'), listX + listWidth / 2, listY - 22); // Сначала обводка
        ctx.fillText(L('trophy_click_to_craft', 'Клик - изготовить'), listX + listWidth / 2, listY - 22); // Потом заливка
        
        // Клиппинг
        ctx.save();
        ctx.beginPath();
        ctx.rect(listX, listY, listWidth, listH);
        ctx.clip();
        
        // Рисуем рыб
        const itemHeight = 70;
        let y = listY - this.fishListScroll;
        
        for (const fish of this.availableFish) {
            if (y + itemHeight > listY && y < listY + listH) {
                this.renderFishItem(ctx, fish, listX, y, listWidth, itemHeight);
            }
            y += itemHeight;
        }
        
        ctx.restore();
    }
    
    renderFishItem(ctx, fish, x, y, width, height) {
        // Фон
        ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';
        ctx.fillRect(x + 5, y + 5, width - 10, height - 10);
        
        // Название
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(14);
        ctx.textAlign = 'left';
        const fishName = window.FishDB ? window.FishDB.getLocalizedName(fish) : fish.name;
        ctx.fillText(fishName, x + 10, y + 20);
        
        // Вес
        ctx.fillStyle = '#3498db';
        ctx.font = fontManager.getFont(12);
        ctx.fillText(`${fish.caughtWeight.toFixed(2)} ${L('kg', 'кг')}`, x + 10, y + 40);
        
        // Спрайт рыбы
        const iconSize = 40;
        const iconX = x + width - 30;
        const iconY = y + height / 2;
        
        assetManager.drawImageOrEmoji(
            ctx, 'fish', fish.id,
            iconX, iconY, iconSize,
            fish.emoji || (fish.isMonster ? '🦈' : '🐟')
        );
    }
    
    renderTrophyList(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const listWidth = 180;
        const listX = w - listWidth - 20;
        const listY = 150; // Опускаем на 50 пикселей (было 100)
        const listH = h - 250; // Корректируем высоту
        
        // Рамка rmk.png для списка чучел
        const rmkImage = assetManager.getImage('rmk.png');
        if (rmkImage) {
            // Растягиваем рамку на размер списка с небольшим отступом
            const frameMargin = 10;
            ctx.drawImage(rmkImage, 
                listX - frameMargin, 
                listY - frameMargin, 
                listWidth + frameMargin * 2, 
                listH + frameMargin * 2
            );
        }
        
        // Фон списка - полупрозрачный черный
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(listX, listY, listWidth, listH);
        
        // Убираем обводку
        
        // Заголовок (белый цвет с черной обводкой, увеличиваем на 15% и поднимаем на 20px)
        ctx.fillStyle = '#ffffff'; // Делаем белым
        ctx.strokeStyle = '#000000'; // Черная обводка
        ctx.lineWidth = 2; // Толщина обводки 2 пикселя
        ctx.font = fontManager.getFont(26, 'bold'); // Было 23, стало 26 (23 * 1.15 ≈ 26)
        ctx.textAlign = 'center';
        const trophyListTitle = L('trophy_list', 'Чучела');
        ctx.strokeText(trophyListTitle, listX + listWidth / 2, listY - 50); // Сначала обводка
        ctx.fillText(trophyListTitle, listX + listWidth / 2, listY - 50); // Потом заливка
        
        // Подсказка (увеличиваем на 20% и делаем белой с черной обводкой, сдвигаем ниже на 10px)
        ctx.fillStyle = '#ffffff'; // Было #7f8c8d, стало белый
        ctx.strokeStyle = '#000000'; // Черная обводка
        ctx.lineWidth = 2; // Толщина обводки 2 пикселя
        ctx.font = fontManager.getFont(16); // Было 13, стало 16 (13 * 1.2 ≈ 16)
        ctx.strokeText(L('trophy_drag_hint', 'Зажмите, чтобы перетащить'), listX + listWidth / 2, listY - 22); // Сначала обводка
        ctx.fillText(L('trophy_drag_hint', 'Зажмите, чтобы перетащить'), listX + listWidth / 2, listY - 22); // Потом заливка
        
        // Клиппинг
        ctx.save();
        ctx.beginPath();
        ctx.rect(listX, listY, listWidth, listH);
        ctx.clip();
        
        // Получаем только неустановленные чучела
        const installedIds = Object.values(this.trophySystem.installedTrophies);
        const availableTrophies = this.trophySystem.getAllTrophies().filter(
            trophy => !installedIds.includes(trophy.id)
        );
        
        // Рисуем чучела
        const itemHeight = 70;
        let y = listY - this.trophyListScroll;
        
        for (const trophy of availableTrophies) {
            if (y + itemHeight > listY && y < listY + listH) {
                this.renderTrophyItem(ctx, trophy, listX, y, listWidth, itemHeight);
            }
            y += itemHeight;
        }
        
        ctx.restore();
    }
    
    renderTrophyItem(ctx, trophy, x, y, width, height) {
        // Фон
        ctx.fillStyle = 'rgba(241, 196, 15, 0.2)';
        ctx.fillRect(x + 5, y + 5, width - 10, height - 10);
        
        // Название
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(14);
        ctx.textAlign = 'left';
        // Получаем локализованное название трофея (название рыбы)
        const trophyFishData = window.FISH_DATABASE ? window.FISH_DATABASE.find(f => f.id === trophy.fishId) : null;
        const trophyName = trophyFishData && window.FishDB ? window.FishDB.getLocalizedName(trophyFishData) : trophy.name;
        ctx.fillText(trophyName, x + 10, y + 20);
        
        // Вес
        ctx.fillStyle = '#f1c40f';
        ctx.font = fontManager.getFont(12);
        ctx.fillText(`${trophy.weight.toFixed(2)} ${L('kg', 'кг')}`, x + 10, y + 40);
        
        // Спрайт рыбы (чучело показывает рыбу, из которой оно сделано)
        const iconSize = 40;
        const iconX = x + width - 30;
        const iconY = y + height / 2;
        
        assetManager.drawImageOrEmoji(
            ctx, 'fish', trophy.fishId,
            iconX, iconY, iconSize,
            trophy.emoji || '🐟'
        );
    }
    
    renderSlots(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Центр экрана
        const centerX = w / 2;
        const centerY = h / 2;
        
        const slotSize = 100;
        const oblImage = assetManager.getImage('obl.png');
        const trafeImage = assetManager.getImage('trafe.png');
        
        for (const slot of this.trophySystem.slots) {
            // slot.x и slot.y - это смещение от центра
            const slotX = centerX + slot.x - slotSize / 2;
            const slotY = centerY + slot.y - slotSize / 2;
            
            const trophyId = this.trophySystem.installedTrophies[slot.id];
            const hasTrophy = slot.unlocked && trophyId;
            
            if (hasTrophy) {
                // Если чучело установлено - показываем подставку trafe.png
                if (trafeImage) {
                    ctx.save();
                    ctx.globalAlpha = 1; // Подставка полностью видима
                    const trafeWidth = slotSize * 0.5; // Уменьшаем в 2 раза (было 1.15)
                    const trafeHeight = slotSize * 0.5; // Уменьшаем в 2 раза
                    const trafeX = centerX + slot.x - trafeWidth / 2;
                    const trafeY = slotY + 60; // Опускаем на 10 пикселей ниже рыбы (было slotY)
                    ctx.drawImage(trafeImage, trafeX, trafeY, trafeWidth, trafeHeight);
                    ctx.restore();
                } else {
                    // Fallback - простой прямоугольник
                    ctx.fillStyle = 'rgba(139, 69, 19, 0.8)'; // Коричневый цвет подставки
                    const fallbackSize = slotSize * 0.5;
                    ctx.fillRect(slotX + 25, slotY + 60, fallbackSize, fallbackSize);
                }
                
                // Установленное чучело на подставке
                const trophy = this.trophySystem.getTrophy(trophyId);
                if (trophy) {
                    // Спрайт рыбы вместо кубка (увеличиваем размер и опускаем на 7 пикселей)
                    const iconSize = 90; // Было 70, стало 90
                    const iconX = slotX + 50;
                    const iconY = slotY + 62; // Было 55, стало 62 (опускаем на 7 пикселей)
                    
                    assetManager.drawImageOrEmoji(
                        ctx, 'fish', trophy.fishId,
                        iconX, iconY, iconSize,
                        trophy.emoji || '🐟'
                    );
                    
                    // Убираем название рыбы когда чучело установлено
                }
            } else {
                // Если чучело не установлено - показываем слот obl.png
                if (oblImage) {
                    ctx.save();
                    ctx.globalAlpha = 0.6; // Полупрозрачность 60%
                    const oblWidth = slotSize * 1.15; // Увеличиваем ширину на 15%
                    const oblHeight = slotSize;
                    const oblX = centerX + slot.x - oblWidth / 2; // Центрируем по новой ширине
                    ctx.drawImage(oblImage, oblX, slotY, oblWidth, oblHeight);
                    ctx.restore();
                } else {
                    // Fallback если спрайт не загружен
                    if (slot.unlocked) {
                        ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
                        ctx.fillRect(slotX, slotY, 100, 100);
                        ctx.strokeStyle = this.hoveredSlot === slot ? '#2ecc71' : '#27ae60';
                    } else {
                        ctx.fillStyle = 'rgba(127, 140, 141, 0.5)';
                        ctx.fillRect(slotX, slotY, 100, 100);
                        ctx.strokeStyle = this.hoveredSlot === slot ? '#95a5a6' : '#7f8c8d';
                    }
                    ctx.lineWidth = 3;
                    ctx.strokeRect(slotX, slotY, 100, 100);
                }
                
                if (!slot.unlocked) {
                    // Иконка замка для заблокированных слотов
                    ctx.fillStyle = '#fff';
                    ctx.font = fontManager.getFont(30);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🔒', slotX + 50, slotY + 35);
                    
                    // Цена разблокировки (с черной обводкой)
                    ctx.font = fontManager.getFont(14);
                    ctx.strokeStyle = '#000000'; // Черная обводка
                    ctx.lineWidth = 2; // Толщина обводки 2 пикселя
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center';
                    
                    if (slot.currency === 'gems') {
                        const costText = `${slot.cost}`;
                        const costWidth = ctx.measureText(costText).width;
                        ctx.strokeText(costText, slotX + 50 - 8, slotY + 65); // Сначала обводка
                        ctx.fillText(costText, slotX + 50 - 8, slotY + 65); // Потом заливка
                        assetManager.drawGemIcon(ctx, slotX + 50 + costWidth / 2 + 5, slotY + 65, 14);
                    } else {
                        const costText = `${slot.cost}`;
                        const costWidth = ctx.measureText(costText).width;
                        ctx.strokeText(costText, slotX + 50 - 8, slotY + 65); // Сначала обводка
                        ctx.fillText(costText, slotX + 50 - 8, slotY + 65); // Потом заливка
                        assetManager.drawCoinIcon(ctx, slotX + 50 + costWidth / 2 + 5, slotY + 65, 14);
                    }
                }
            }
        }
    }
    
    renderDraggedTrophy(ctx) {
        if (!this.draggedTrophy) return;
        
        const mouseX = this.mousePos.x;
        const mouseY = this.mousePos.y;
        
        ctx.save();
        ctx.globalAlpha = 0.7;
        
        ctx.fillStyle = 'rgba(241, 196, 15, 0.8)';
        ctx.fillRect(mouseX - 40, mouseY - 40, 80, 80);
        
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.strokeRect(mouseX - 40, mouseY - 40, 80, 80);
        
        // Спрайт рыбы вместо кубка
        const iconSize = 60;
        
        assetManager.drawImageOrEmoji(
            ctx, 'fish', this.draggedTrophy.fishId,
            mouseX, mouseY, iconSize,
            this.draggedTrophy.emoji || '🐟'
        );
        
        ctx.restore();
    }
    
    renderCraftModal(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const modalW = 400;
        const modalH = 300;
        const modalX = w / 2 - modalW / 2;
        const modalY = h / 2 - modalH / 2;
        
        // Затемнение
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, w, h);
        
        // Рамка модалки - используем rmk.png
        const rmkImage = assetManager.getImage('rmk.png');
        if (rmkImage) {
            const frameMargin = 10;
            ctx.drawImage(rmkImage, 
                modalX - frameMargin, 
                modalY - frameMargin, 
                modalW + frameMargin * 2, 
                modalH + frameMargin * 2
            );
        }
        
        // Фон модалки
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(modalX, modalY, modalW, modalH);
        
        // Кнопка закрытия
        ctx.save();
        ctx.globalAlpha = 0.9; // 90% прозрачность
        
        // Используем спрайт zak.png (увеличенный в 2 раза для craft modal)
        const zakImage = assetManager.getImage('zak.png');
        if (zakImage) {
            const size = 60; // Увеличиваем в 2 раза
            ctx.drawImage(zakImage, modalX + modalW - 70, modalY + 5, size, size); // Ближе к углу
        } else {
            // Fallback - обычный крестик если спрайт не загружен
            ctx.fillStyle = '#e74c3c';
            ctx.font = fontManager.getFont(48); // Увеличиваем размер
            ctx.textAlign = 'center';
            ctx.fillText('✕', modalX + modalW - 40, modalY + 40); // Корректируем позицию
        }
        
        ctx.restore();
        
        if (!this.craftModal.fish) return;
        
        const fish = this.craftModal.fish;
        const fishData = this.trophySystem.getFishData(fish.id);
        const cost = Math.floor((fishData?.basePrice || 100) * fish.caughtWeight);
        
        // Заголовок
        ctx.fillStyle = '#f1c40f';
        ctx.font = fontManager.getFont(24, 'bold');
        ctx.textAlign = 'center';
        ctx.fillText(L('crafting_trophy', 'Изготовление чучела'), modalX + modalW / 2, modalY + 40);
        
        // Информация о рыбе
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20);
        const fishName = window.FishDB ? window.FishDB.getLocalizedName(fish) : fish.name;
        ctx.fillText(fishName, modalX + modalW / 2, modalY + 90);
        
        ctx.font = fontManager.getFont(18);
        const weightLabel = L('trophy_weight', 'Вес:');
        ctx.fillText(`${weightLabel} ${fish.caughtWeight.toFixed(2)} ${L('ui_kg', 'кг')}`, modalX + modalW / 2, modalY + 120);
        
        ctx.fillStyle = '#f39c12';
        const costLabel = L('trophy_cost', 'Стоимость:');
        assetManager.drawTextWithCoinIcon(ctx, `${costLabel} 💰 ${cost}`, modalX + modalW / 2, modalY + 150, 18);
        
        // Кнопка "Сделать чучело" - используем uipan.png
        const btnY = modalY + modalH - 70;
        const btnX = modalX + 50;
        const btnW = modalW - 100;
        const btnH = 50;
        const canAfford = this.playerCoins >= cost;
        
        const uipanImage = assetManager.getImage('uipan.png');
        if (uipanImage) {
            ctx.save();
            if (!canAfford) {
                ctx.globalAlpha = 0.5; // Полупрозрачная если нельзя купить
            }
            ctx.drawImage(uipanImage, btnX, btnY, btnW, btnH);
            ctx.restore();
        } else {
            // Fallback
            ctx.fillStyle = canAfford ? '#27ae60' : '#7f8c8d';
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnW, btnH, 10);
            ctx.fill();
        }
        
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20);
        ctx.textAlign = 'center';
        ctx.fillText(L('trophy_craft_button', 'Сделать чучело'), modalX + modalW / 2, btnY + 25);
    }
    
    renderSellModal(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const modalW = 400;
        const modalH = 250;
        const modalX = w / 2 - modalW / 2;
        const modalY = h / 2 - modalH / 2;
        
        // Затемнение
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, w, h);
        
        // Фон модалки
        ctx.fillStyle = 'rgba(30, 30, 50, 0.95)';
        ctx.beginPath();
        ctx.roundRect(modalX, modalY, modalW, modalH, 15);
        ctx.fill();
        
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Кнопка закрытия
        ctx.save();
        ctx.globalAlpha = 0.9; // 90% прозрачность
        
        // Используем спрайт zak.png (увеличенный в 2 раза для sell modal)
        const zakImage = assetManager.getImage('zak.png');
        if (zakImage) {
            const size = 60; // Увеличиваем в 2 раза
            ctx.drawImage(zakImage, modalX + modalW - 70, modalY + 5, size, size); // Ближе к углу
        } else {
            // Fallback - обычный крестик если спрайт не загружен
            ctx.fillStyle = '#e74c3c';
            ctx.font = fontManager.getFont(48); // Увеличиваем размер
            ctx.textAlign = 'center';
            ctx.fillText('✕', modalX + modalW - 40, modalY + 40); // Корректируем позицию
        }
        
        ctx.restore();
        
        if (!this.sellModal.trophy) return;
        
        const trophy = this.sellModal.trophy;
        const fishData = this.trophySystem.getFishData(trophy.fishId);
        const sellPrice = Math.floor((fishData?.basePrice || 100) * trophy.weight * 0.3);
        
        // Заголовок
        ctx.fillStyle = '#e74c3c';
        ctx.font = fontManager.getFont(24, 'bold');
        ctx.textAlign = 'center';
        ctx.fillText(L('selling_trophy', 'Продажа чучела'), modalX + modalW / 2, modalY + 40);
        
        // Информация о чучеле
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20);
        // Получаем локализованное название трофея (название рыбы)
        const trophyFishData = window.FISH_DATABASE ? window.FISH_DATABASE.find(f => f.id === trophy.fishId) : null;
        const trophyName = trophyFishData && window.FishDB ? window.FishDB.getLocalizedName(trophyFishData) : trophy.name;
        ctx.fillText(trophyName, modalX + modalW / 2, modalY + 90);
        
        ctx.font = fontManager.getFont(18);
        const weightLabel = L('trophy_weight', 'Вес:');
        ctx.fillText(`${weightLabel} ${trophy.weight.toFixed(2)} ${L('ui_kg', 'кг')}`, modalX + modalW / 2, modalY + 120);
        
        ctx.fillStyle = '#27ae60';
        assetManager.drawTextWithCoinIcon(ctx, `Цена продажи: 💰 ${sellPrice}`, modalX + modalW / 2, modalY + 150, 18);
        
        // Кнопка "Продать"
        const btnY = modalY + modalH - 70;
        
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.roundRect(modalX + 50, btnY, modalW - 100, 50, 10);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20);
        ctx.fillText(L('trophy_sell_button', 'Продать'), modalX + modalW / 2, btnY + 25);
    }
    
    renderInfoModal(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const modalW = 400;
        const modalH = 300;
        const modalX = w / 2 - modalW / 2;
        const modalY = h / 2 - modalH / 2;
        
        // Затемнение
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, w, h);
        
        // Фон модалки
        ctx.fillStyle = 'rgba(30, 30, 50, 0.95)';
        ctx.beginPath();
        ctx.roundRect(modalX, modalY, modalW, modalH, 15);
        ctx.fill();
        
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Кнопка закрытия
        ctx.save();
        ctx.globalAlpha = 0.9; // 90% прозрачность
        
        // Используем спрайт zak.png
        const zakImage = assetManager.getImage('zak.png');
        if (zakImage) {
            const size = 60; // Увеличиваем в 2 раза для info modal
            ctx.drawImage(zakImage, modalX + modalW - 70, modalY + 5, size, size); // Ближе к углу
        } else {
            // Fallback - обычный крестик если спрайт не загружен
            ctx.fillStyle = '#e74c3c';
            ctx.font = fontManager.getFont(48); // Увеличиваем размер
            ctx.textAlign = 'center';
            ctx.fillText('✕', modalX + modalW - 40, modalY + 40); // Корректируем позицию
        }
        
        ctx.restore();
        
        if (!this.infoModal.trophy) return;
        
        const trophy = this.infoModal.trophy;
        
        // Заголовок
        ctx.fillStyle = '#f1c40f';
        ctx.font = fontManager.getFont(24, 'bold');
        ctx.textAlign = 'center';
        ctx.fillText('🏆 Чучело', modalX + modalW / 2, modalY + 40);
        
        // Иконка чучела
        ctx.font = fontManager.getFont(60);
        ctx.fillText('🏆', modalX + modalW / 2, modalY + 120);
        
        // Информация о чучеле
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20, 'bold');
        // Получаем локализованное название трофея (название рыбы)
        const trophyFishData = window.FISH_DATABASE ? window.FISH_DATABASE.find(f => f.id === trophy.fishId) : null;
        const trophyName = trophyFishData && window.FishDB ? window.FishDB.getLocalizedName(trophyFishData) : trophy.name;
        ctx.fillText(trophyName, modalX + modalW / 2, modalY + 180);
        
        ctx.font = fontManager.getFont(18);
        const weightLabel = L('trophy_weight', 'Вес:');
        ctx.fillText(`${weightLabel} ${trophy.weight.toFixed(2)} ${L('ui_kg', 'кг')}`, modalX + modalW / 2, modalY + 210);
        
        // Редкость
        const rarityColors = {
            common: '#95a5a6',
            uncommon: '#27ae60',
            rare: '#3498db',
            epic: '#9b59b6',
            legendary: '#f39c12'
        };
        ctx.fillStyle = rarityColors[trophy.rarity] || '#95a5a6';
        const rarityKey = trophy.rarity.charAt(0).toUpperCase() + trophy.rarity.slice(1); // common -> Common
        ctx.fillText(`${L('rarity_label', 'Редкость:')} ${L(`rarity_${rarityKey}`, rarityKey)}`, modalX + modalW / 2, modalY + 240);
    }
    
    renderToggleListsButton(ctx) {
        const btn = this.toggleListsButton;
        const isHovered = this.hoveredButton === 'toggleLists';
        
        ctx.save();
        
        // Подложка кнопки - используем uipan.png
        const uipanImage = assetManager.getImage('uipan.png');
        if (uipanImage) {
            ctx.drawImage(uipanImage, btn.x, btn.y, btn.width, btn.height);
        } else {
            // Fallback - обычная кнопка если спрайт не загружен
            ctx.fillStyle = isHovered ? '#3498db' : '#2980b9';
            ctx.beginPath();
            ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 10);
            ctx.fill();
        }
        
        // Глаз поверх подложки
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(30); // Увеличиваем размер глаза
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Добавляем тень при наведении
        if (isHovered) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetY = 2;
        }
        
        // Открытый глаз когда списки видны, закрытый когда скрыты
        ctx.fillText(this.listsHidden ? '👁️' : '👁️‍🗨️', btn.x + btn.width / 2, btn.y + btn.height / 2);
        fontManager.applyLetterSpacing(ctx, false);
        
        ctx.restore();
    }
    
    renderCloseButton(ctx) {
        const btn = this.closeButton;
        const isHovered = this.hoveredButton === 'close';
        
        ctx.save();
        ctx.globalAlpha = 0.9; // 90% прозрачность
        
        // Используем спрайт zak.png (уменьшен на 20%)
        const zakImage = assetManager.getImage('zak.png');
        if (zakImage) {
            // Уменьшаем размер на 20% (было btn.height * 2, стало btn.height * 1.6)
            const size = btn.height * 1.6;
            const centerX = btn.x + btn.width / 2;
            const centerY = btn.y + btn.height / 2;
            ctx.drawImage(zakImage, centerX - size/2, centerY - size/2, size, size);
        } else {
            // Fallback - обычная кнопка если спрайт не загружен
            if (isHovered) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 3;
            }
            
            ctx.fillStyle = isHovered ? '#e74c3c' : '#c0392b';
            ctx.beginPath();
            ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 10);
            ctx.fill();
            
            ctx.strokeStyle = isHovered ? '#fff' : 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = '#fff';
            ctx.font = fontManager.getFont(20);
            fontManager.applyLetterSpacing(ctx, true);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L('trophy_close_button', 'Закрыть'), btn.x + btn.width / 2, btn.y + btn.height / 2);
            fontManager.applyLetterSpacing(ctx, false);
        }
        
        ctx.restore();
    }
}
