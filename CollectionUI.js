// UI коллекции (энциклопедии)
class CollectionUI {
    constructor(canvas, collectionSystem, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        this.collection = collectionSystem;
        
        // Состояние
        this.visible = false;
        this.animProgress = 0;
        this.currentTab = 'fish'; // fish, monsters, items
        
        // Вкладки
        this.tabs = [
            { id: 'fish', name: L('fish_tab', 'Рыбы'), icon: '🐟' },
            { id: 'monsters', name: L('monsters_tab', 'Монстры'), icon: '🐉' },
            { id: 'items', name: L('items_tab', 'Предметы'), icon: '📦' }
        ];
        
        // Список записей
        this.entries = [];
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.maxVisibleItems = 5.5; // Показываем 5.5 элементов для видимости обрезки
        
        // Размеры окна
        this.modalWidth = 1238;
        this.modalHeight = 706;
        this.modalX = 0;
        this.modalY = 0;
        
        // Размеры списка
        this.listWidth = 400;
        this.listItemHeight = 90;
        
        // Кнопка закрытия
        this.closeButton = { x: 0, y: 0, size: 42 };
        
        // Перетаскивание для скролла
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartScroll = 0;
        this.dragVelocity = 0;
        this.lastDragY = 0;
        this.lastDragTime = 0;
        
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
    }
    
    // Получить шрифт (используем глобальный fontManager)
    getFont(size, weight = 'bold') {
        return fontManager.getFont(size, weight);
    }
    
    // Применить межбуквенное расстояние (используем глобальный fontManager)
    applyLetterSpacing(ctx, forTitles = false) {
        fontManager.applyLetterSpacing(ctx, forTitles);
    }
    
    show() {
        this.visible = true;
        this.currentTab = 'fish';
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.loadEntries();
        this.updatePositions();
        
    }
    
    hide() {
        this.visible = false;
        this.entries = [];
    }
    
    // Обновить названия вкладок после смены языка
    updateTabLabels() {
        this.tabs[0].name = L('fish_tab', 'Рыбы');
        this.tabs[1].name = L('monsters_tab', 'Монстры');
        this.tabs[2].name = L('items_tab', 'Предметы');
    }
    
    // Загрузить записи текущей вкладки
    loadEntries() {
        this.entries = [];
        
        if (this.currentTab === 'fish') {
            // Все рыбы из базы данных
            this.entries = FISH_DATABASE.map(fish => ({
                ...fish,
                isCaught: this.collection.isFishCaught(fish.id),
                type: 'fish'
            }));
        } else if (this.currentTab === 'monsters') {
            // Все монстры из базы данных
            if (typeof MONSTERS_DATABASE !== 'undefined') {
                this.entries = MONSTERS_DATABASE.map(monster => ({
                    type: 'monster',
                    ...monster,
                    isCaught: this.collection.isMonsterCaught(monster.id)
                }));
            } else {
                this.entries = [];
            }
        } else if (this.currentTab === 'items') {
            // Все предметы из базы данных
            if (typeof JUNK_DATABASE !== 'undefined') {
                this.entries = JUNK_DATABASE.map(item => ({
                    ...item,
                    isCaught: this.collection.isItemFound(item.id),
                    type: 'junk' // Используем 'junk' для совместимости с остальным кодом
                }));
            }
        }
    }
    
    update(dt) {
        const targetProgress = this.visible ? 1 : 0;
        this.animProgress += (targetProgress - this.animProgress) * dt * 10;
        
        if (!this.visible && this.animProgress < 0.01) {
            this.animProgress = 0;
        }
        
        // Инерция скролла
        if (!this.isDragging && Math.abs(this.dragVelocity) > 0.1) {
            this.scrollOffset += this.dragVelocity * dt * 60;
            this.dragVelocity *= 0.92; // Затухание
            
            // Ограничение скролла
            const maxScroll = Math.max(0, this.entries.length - this.maxVisibleItems);
            this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset));
            
            if (Math.abs(this.dragVelocity) < 0.1) {
                this.dragVelocity = 0;
            }
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
        
        // Вкладки
        const tabY = this.modalY + 75;
        const tabHeight = 50;
        const tabWidth = 180;
        const spacing = 15;
        const startX = this.modalX + (this.modalWidth - (tabWidth * this.tabs.length + spacing * (this.tabs.length - 1))) / 2;
        
        for (let i = 0; i < this.tabs.length; i++) {
            const tab = this.tabs[i];
            const tabX = startX + i * (tabWidth + spacing);
            
            if (x >= tabX && x <= tabX + tabWidth &&
                y >= tabY && y <= tabY + tabHeight) {
                if (this.currentTab !== tab.id) {
                    this.currentTab = tab.id;
                    this.selectedIndex = -1;
                    this.scrollOffset = 0;
                    this._fontDebugShown = false; // Сброс флага отладки
                    this.loadEntries();
                }
                return true;
            }
        }
        
        // Начало перетаскивания списка
        const listX = this.modalX + 25;
        const listY = this.modalY + 145;
        const listHeight = this.modalHeight - 170;
        
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
        
        return true;
    }
    
    handleMouseDown(x, y) {
        // Сохраняем координаты для обработки клика
        this.dragStartX = x;
        return this.handleClick(x, y);
    }
    
    handleMouseMove(x, y) {
        if (!this.visible || !this.isDragging) return;
        
        const listY = this.modalY + 145;
        const deltaY = this.dragStartY - y;
        const deltaItems = deltaY / this.listItemHeight;
        
        this.scrollOffset = this.dragStartScroll + deltaItems;
        
        // Ограничение скролла
        const maxScroll = Math.max(0, this.entries.length - this.maxVisibleItems);
        this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset));
        
        // Вычисление скорости для инерции
        const now = performance.now();
        const dt = (now - this.lastDragTime) / 1000;
        if (dt > 0) {
            const velocity = (this.lastDragY - y) / dt / this.listItemHeight;
            this.dragVelocity = velocity * 0.3; // Коэффициент инерции
        }
        
        this.lastDragY = y;
        this.lastDragTime = now;
    }
    
    handleMouseUp() {
        if (!this.visible) return;
        
        if (this.isDragging) {
            // Определяем мобильное устройство
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // Если движение было минимальным, это клик
            const dragDistance = Math.abs(this.dragStartY - this.lastDragY);
            // Увеличиваем порог для мобильных устройств
            if (dragDistance < 15) {
                const listX = this.modalX + 25;
                const listY = this.modalY + 145;
                const relativeY = this.lastDragY - listY;
                const clickedIndex = Math.floor(relativeY / this.listItemHeight + this.scrollOffset);
                
                if (clickedIndex >= 0 && clickedIndex < this.entries.length) {
                    this.selectedIndex = clickedIndex;
                }
                this.dragVelocity = 0;
                
                // Также проверяем клик по кнопкам
                this.handleClick(this.dragStartX || 0, this.lastDragY);
            }
            
            // Сбрасываем isDragging сразу на ПК, чтобы скролл не прилипал
            if (!isMobile) {
                this.isDragging = false;
            } else {
                // На мобильных сбрасываем с небольшой задержкой для инерции
                setTimeout(() => {
                    this.isDragging = false;
                }, 50);
            }
        }
    }
    
    handleScroll(deltaY) {
        if (!this.visible) return;
        
        const maxScroll = Math.max(0, this.entries.length - this.maxVisibleItems);
        this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset + deltaY * 0.5));
        this.dragVelocity = 0; // Сброс инерции при скролле колесом
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
        
        // Список записей (слева)
        this.renderEntryList(ctx);
        
        // Детали выбранной записи (справа)
        this.renderEntryDetails(ctx);
        
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
            gradient.addColorStop(1, '#34495e');
            
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
        ctx.font = this.getFont(40);
        this.applyLetterSpacing(ctx, true); // Увеличенное расстояние
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L('collection_title', 'ЭНЦИКЛОПЕДИЯ'), this.modalX + this.modalWidth / 2, this.modalY + 40);
        this.applyLetterSpacing(ctx, false); // Сброс
        
        // Статистика
        const stats = this.collection.getStats();
        let statText = '';
        
        if (this.currentTab === 'fish') {
            statText = `${stats.fish.caught} / ${stats.fish.total}`;
        } else if (this.currentTab === 'monsters') {
            statText = `${stats.monsters.caught} / ${stats.monsters.total}`;
        } else if (this.currentTab === 'items') {
            statText = `${stats.items.caught} / ${stats.items.total}`;
        }
        
        ctx.fillStyle = '#f1c40f';
        ctx.font = this.getFont(24);
        ctx.textAlign = 'right';
        ctx.fillText(statText, this.modalX + this.modalWidth - 140, this.modalY + 40);
        
        ctx.restore();
    }
    
    renderTabs(ctx) {
        const tabY = this.modalY + 75;
        const tabHeight = 50;
        const tabWidth = 180;
        const spacing = 15;
        const startX = this.modalX + (this.modalWidth - (tabWidth * this.tabs.length + spacing * (this.tabs.length - 1))) / 2;
        
        ctx.save();
        
        // Получаем изображение uipan.png
        const uipanImage = assetManager.getImage('uipan.png');
        
        this.tabs.forEach((tab, index) => {
            const x = startX + index * (tabWidth + spacing);
            const isActive = tab.id === this.currentTab;
            
            // Рисуем фон вкладки используя uipan.png
            if (uipanImage) {
                // Подгоняем размер изображения под размер вкладки
                ctx.drawImage(
                    uipanImage,
                    x, tabY,
                    tabWidth, tabHeight
                );
            } else {
                // Fallback - обычный фон если изображение не загружено
                if (isActive) {
                    ctx.fillStyle = '#9b59b6';
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                }
                
                ctx.beginPath();
                ctx.roundRect(x, tabY, tabWidth, tabHeight, 10);
                ctx.fill();
            }
            
            // Обводка для активной вкладки
            if (isActive) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(x, tabY, tabWidth, tabHeight, 10);
                ctx.stroke();
            }
            
            // Текст
            ctx.fillStyle = '#fff';
            ctx.font = this.getFont(20);
            this.applyLetterSpacing(ctx, true); // Увеличенное расстояние
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${tab.icon} ${tab.name}`, x + tabWidth / 2, tabY + tabHeight / 2);
            this.applyLetterSpacing(ctx, false); // Сброс
        });
        
        ctx.restore();
    }
    
    renderEntryList(ctx) {
        const listX = this.modalX + 25;
        const listY = this.modalY + 145;
        const listHeight = this.modalHeight - 170;
        
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
        if (this.entries.length === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = this.getFont(20, 'normal');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L('collection_empty', 'Пока пусто'), listX + this.listWidth / 2, listY + listHeight / 2);
        } else {
            const visibleStart = Math.floor(this.scrollOffset);
            const visibleEnd = Math.min(this.entries.length, visibleStart + this.maxVisibleItems + 2);
            
            for (let i = visibleStart; i < visibleEnd; i++) {
                const entry = this.entries[i];
                const itemY = listY + (i - this.scrollOffset) * this.listItemHeight + 8;
                
                this.renderListEntry(ctx, entry, i, listX + 8, itemY);
            }
        }
        
        ctx.restore();
        ctx.restore();
        
        // Скроллбар
        if (this.entries.length > this.maxVisibleItems) {
            this.renderScrollbar(ctx, listX + this.listWidth - 15, listY + 8, 10, listHeight - 16);
        }
    }
    
    renderListEntry(ctx, entry, index, x, y) {
        const width = this.listWidth - 25;
        const height = this.listItemHeight - 8;
        const isSelected = index === this.selectedIndex;
        const isCaught = entry.isCaught;
        
        ctx.save();
        
        // Фон элемента
        if (isSelected) {
            ctx.fillStyle = 'rgba(155, 89, 182, 0.4)';
        } else if (isCaught) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        }
        
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 6);
        ctx.fill();
        
        // Обводка для выбранного
        if (isSelected) {
            ctx.strokeStyle = '#9b59b6';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Иконка или силуэт (уменьшено для лучшего отображения)
        const iconSize = 70; // Уменьшенный размер
        const iconX = x + 40;
        const iconY = y + height / 2;
        
        if (isCaught) {
            // Показываем картинку
            const assetType = entry.type === 'fish' ? 'fish' : (entry.type === 'monster' ? 'monster' : 'junk');
            const defaultEmoji = entry.emoji || (entry.type === 'fish' ? '🐟' : (entry.type === 'monster' ? '🐲' : '📦'));
            
            assetManager.drawImageOrEmoji(
                ctx, assetType, entry.id,
                iconX, iconY, iconSize,
                defaultEmoji
            );
        } else {
            // Черный силуэт
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = this.getFont(30);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', iconX, iconY);
        }
        
        // Название
        ctx.fillStyle = isCaught ? '#fff' : 'rgba(255, 255, 255, 0.5)';
        ctx.font = this.getFont(18);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Локализуем название
        let name = '??????';
        if (isCaught) {
            if (entry.type === 'monster' && window.localizationSystem) {
                name = window.localizationSystem.getMonsterName(entry.id, entry.name);
            } else if (entry.type === 'fish' && window.localizationSystem) {
                name = window.localizationSystem.getFishName(entry.id, entry.name);
            } else if (entry.type === 'junk' && window.localizationSystem) {
                name = window.localizationSystem.getJunkName(entry.id, entry.name);
            } else {
                name = entry.name;
            }
        }
        
        const displayName = name.length > 20 ? name.substring(0, 18) + '...' : name;
        ctx.fillText(displayName, x + 80, y + 15);
        
        // Дополнительная информация
        if (isCaught) {
            ctx.fillStyle = '#3498db';
            ctx.font = this.getFont(15, 'normal');
            
            if (entry.type === 'fish') {
                ctx.fillText(`${entry.weightMin}-${entry.weightMax} ${L('kg', 'кг')}`, x + 80, y + 40);
                ctx.fillStyle = this.getRarityColor(entry.rarity);
                ctx.fillText(this.getRarityTranslation(entry.rarity), x + 80, y + 60);
            } else if (entry.type === 'monster') {
                ctx.fillText(`${entry.weightMin}-${entry.weightMax} ${L('kg', 'кг')}`, x + 80, y + 40);
                ctx.fillStyle = '#FF0000';
                ctx.fillText(`💀 Монстр`, x + 80, y + 60);
            } else if (entry.type === 'junk') {
                // Локализованная категория
                const localizedCategory = window.localizationSystem ? 
                    window.localizationSystem.getJunkCategory(entry.id, entry.category) : 
                    entry.category;
                ctx.fillText(`${localizedCategory}`, x + 80, y + 40);
                ctx.fillStyle = '#f39c12';
                assetManager.drawTextWithCoinIcon(ctx, `${entry.sellPrice} 💰`, x + 80, y + 60, 15);
            }
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = this.getFont(15, 'normal');
            
            // Разный текст для рыб и предметов
            if (entry.type === 'fish') {
                ctx.fillText(L('collection_not_caught_fish', 'Не поймана'), x + 80, y + 40);
            } else if (entry.type === 'monster') {
                ctx.fillText(L('collection_not_caught_monster', 'Не пойман'), x + 80, y + 40);
            } else if (entry.type === 'junk') {
                ctx.fillText(L('collection_not_found_item', 'Не найден'), x + 80, y + 40);
            } else {
                ctx.fillText(L('collection_not_found', 'Не найдено'), x + 80, y + 40);
            }
        }
        
        ctx.restore();
    }
    
    renderScrollbar(ctx, x, y, width, height) {
        const totalItems = this.entries.length;
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
    
    renderEntryDetails(ctx) {
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
        
        if (this.selectedIndex < 0 || this.selectedIndex >= this.entries.length) {
            // Нет выбранного элемента
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = this.getFont(22, 'normal');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L('collection_select_entry', 'Выберите запись'), detailsX + detailsWidth / 2, detailsY + detailsHeight / 2);
            ctx.restore();
            return;
        }
        
        const entry = this.entries[this.selectedIndex];
        const isCaught = entry.isCaught;
        
        if (!isCaught) {
            // Не поймана - показываем заглушку
            this.renderUnknownEntry(ctx, detailsX, detailsY, detailsWidth, detailsHeight);
        } else {
            // Поймана - показываем полную информацию
            this.renderKnownEntry(ctx, entry, detailsX, detailsY, detailsWidth, detailsHeight);
        }
        
        ctx.restore();
    }
    
    renderUnknownEntry(ctx, x, y, width, height) {
        // Большой силуэт
        const iconSize = 150;
        const iconX = x + width / 2;
        const iconY = y + 100;
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = this.getFont(80);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', iconX, iconY);
        
        // Текст
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = this.getFont(32);
        ctx.fillText('??????', iconX, y + 200);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = this.getFont(20, 'normal');
        
        // Разный текст для рыб и предметов
        if (this.currentTab === 'fish') {
            ctx.fillText(L('collection_catch_fish_to_unlock', 'Поймайте эту рыбу, чтобы'), iconX, y + 250);
            ctx.fillText(L('collection_unlock_info', 'открыть информацию'), iconX, y + 280);
        } else if (this.currentTab === 'items') {
            ctx.fillText(L('collection_find_item_to_unlock', 'Найдите этот предмет, чтобы'), iconX, y + 250);
            ctx.fillText(L('collection_unlock_info', 'открыть информацию'), iconX, y + 280);
        } else {
            ctx.fillText(L('collection_find_to_unlock', 'Найдите это, чтобы'), iconX, y + 250);
            ctx.fillText(L('collection_unlock_info', 'открыть информацию'), iconX, y + 280);
        }
    }
    
    renderKnownEntry(ctx, entry, x, y, width, height) {
        // Большая иконка (для рыб +60%, для монстров +20% размер)
        const baseIconSize = 120;
        const iconSize = entry.type === 'fish' ? baseIconSize * 1.6 : 
                        (entry.type === 'monster' ? baseIconSize * 1.2 : baseIconSize);
        const iconX = x + width / 2;
        const iconY = y + 80;
        
        const assetType = entry.type === 'fish' ? 'fish' : (entry.type === 'monster' ? 'monster' : 'junk');
        const defaultEmoji = entry.emoji || (entry.type === 'fish' ? '🐟' : (entry.type === 'monster' ? '🐲' : '📦'));
        
        assetManager.drawImageOrEmoji(
            ctx, assetType, entry.id,
            iconX, iconY, iconSize,
            defaultEmoji
        );
        
        // Название
        ctx.fillStyle = '#fff';
        ctx.font = this.getFont(32);
        ctx.textAlign = 'center';
        
        // Локализуем название
        let displayName = entry.name;
        if (entry.type === 'monster' && window.localizationSystem) {
            displayName = window.localizationSystem.getMonsterName(entry.id, entry.name);
        } else if (entry.type === 'fish' && window.localizationSystem) {
            displayName = window.localizationSystem.getFishName(entry.id, entry.name);
        } else if (entry.type === 'junk' && window.localizationSystem) {
            displayName = window.localizationSystem.getJunkName(entry.id, entry.name);
        }
        
        ctx.fillText(displayName, iconX, y + 155);
        
        // Характеристики
        ctx.font = this.getFont(18, 'normal');
        ctx.textAlign = 'left';
        ctx.fillStyle = '#bdc3c7';
        
        let statsY = y + 190;
        const statsX = x + 25;
        const lineHeight = 28;
        
        if (entry.type === 'fish') {
            // Редкость
            ctx.fillStyle = this.getRarityColor(entry.rarity);
            ctx.font = this.getFont(20);
            ctx.textAlign = 'center';
            ctx.fillText(this.getRarityTranslation(entry.rarity), iconX, statsY);
            statsY += lineHeight + 10;
            
            ctx.font = this.getFont(18, 'normal');
            ctx.textAlign = 'left';
            
            ctx.fillStyle = '#3498db';
            ctx.fillText(`${L('collection_weight', 'Вес:')} ${entry.weightMin} - ${entry.weightMax} ${L('ui_kg', 'кг')}`, statsX, statsY);
            statsY += lineHeight;
            
            ctx.fillStyle = '#e67e22';
            ctx.fillText(`${L('collection_power', 'Мощность:')} ${entry.power}`, statsX, statsY);
            statsY += lineHeight;
            
            ctx.fillStyle = '#9b59b6';
            const roleText = entry.role === 'peace' ? L('collection_role_peace', 'Мирная') : entry.role === 'pred' ? L('collection_role_pred', 'Хищник') : L('collection_role_bottom', 'Донная');
            ctx.fillText(`${L('collection_role', 'Роль:')} ${roleText}`, statsX, statsY);
            statsY += lineHeight;
            
            ctx.fillStyle = '#f39c12';
            // Преобразуем русское значение времени в ключ локализации
            const timeKey = this.getTimeKey(entry.timeOfDay);
            const timeOfDayText = window.localizationSystem ? window.localizationSystem.t(timeKey, entry.timeOfDay) : entry.timeOfDay;
            ctx.fillText(`${L('collection_time', 'Время:')} ${timeOfDayText}`, statsX, statsY);
            statsY += lineHeight;
            
            ctx.fillStyle = '#2ecc71';
            // Преобразуем русское значение типа поклевки в ключ локализации
            const biteKey = this.getBiteStyleKey(entry.biteStyle);
            const biteStyleText = window.localizationSystem ? window.localizationSystem.t(biteKey, entry.biteStyle) : entry.biteStyle;
            ctx.fillText(`${L('collection_bite', 'Поклёвка:')} ${biteStyleText}`, statsX, statsY);
            statsY += lineHeight;
        } else if (entry.type === 'monster') {
            // Монстр
            ctx.fillStyle = '#FF0000';
            ctx.font = this.getFont(20);
            ctx.textAlign = 'center';
            ctx.fillText('💀 МОНСТР 💀', iconX, statsY);
            statsY += lineHeight + 10;
            
            ctx.font = this.getFont(18, 'normal');
            ctx.textAlign = 'left';
            
            ctx.fillStyle = '#3498db';
            ctx.fillText(`${L('collection_weight', 'Вес:')} ${entry.weightMin} - ${entry.weightMax} ${L('ui_kg', 'кг')}`, statsX, statsY);
            statsY += lineHeight;
            
            ctx.fillStyle = '#FF0000';
            ctx.fillText(`${L('collection_power', 'Мощность:')} ${entry.power} ⚠️`, statsX, statsY);
            statsY += lineHeight;
            
            ctx.fillStyle = '#f39c12';
            // Преобразуем русское значение времени в ключ локализации
            const timeKey = this.getTimeKey(entry.timeOfDay);
            const timeOfDayText = window.localizationSystem ? window.localizationSystem.t(timeKey, entry.timeOfDay) : entry.timeOfDay;
            ctx.fillText(`${L('collection_time', 'Время:')} ${timeOfDayText}`, statsX, statsY);
            statsY += lineHeight;
            
            ctx.fillStyle = '#e74c3c';
            // Преобразуем русское значение типа поклевки в ключ локализации
            const biteKey = this.getBiteStyleKey(entry.biteStyle);
            const biteStyleText = window.localizationSystem ? window.localizationSystem.t(biteKey, entry.biteStyle) : entry.biteStyle;
            ctx.fillText(`${L('collection_bite', 'Поклёвка:')} ${biteStyleText}`, statsX, statsY);
            statsY += lineHeight;
            
            ctx.fillStyle = '#2ecc71';
            assetManager.drawTextWithCoinIcon(ctx, `${L('collection_reward', 'Награда:')} ${entry.sellPrice} 💰`, statsX, statsY, 18);
            statsY += lineHeight;
            
            ctx.fillStyle = '#9b59b6';
            ctx.fillText(`${L('collection_xp', 'Опыт:')} ${entry.xp} XP`, statsX, statsY);
            statsY += lineHeight;
        } else if (entry.type === 'junk') {
            // Категория (локализованная)
            const localizedCategory = window.localizationSystem ? 
                window.localizationSystem.getJunkCategory(entry.id, entry.category) : 
                entry.category;
            ctx.fillStyle = '#9b59b6';
            ctx.font = this.getFont(20);
            ctx.textAlign = 'center';
            ctx.fillText(localizedCategory, iconX, statsY);
            statsY += lineHeight + 10;
            
            ctx.font = this.getFont(18, 'normal');
            ctx.textAlign = 'left';
            
            ctx.fillStyle = '#f39c12';
            assetManager.drawTextWithCoinIcon(ctx, `${L('collection_sell_price', 'Цена продажи:')} ${entry.sellPrice} 💰`, statsX, statsY, 18);
            statsY += lineHeight;
            
            ctx.fillStyle = '#3498db';
            const zones = entry.zones ? entry.zones : [];
            const zoneText = zones.length > 0 ? `${L('collection_zones', 'Зоны:')} ${zones.slice(0, 3).join(', ')}${zones.length > 3 ? '...' : ''}` : L('collection_zones_unknown', 'Зоны: неизвестно');
            ctx.fillText(zoneText, statsX, statsY);
            statsY += lineHeight;
        }
        
        // Описание
        if (entry.description) {
            statsY += 15;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = this.getFont(22, 'normal');
            
            // Получаем локализованное описание
            let description = entry.description;
            if (entry.type === 'junk' && window.localizationSystem) {
                description = window.localizationSystem.getJunkDescription(entry.id, entry.description);
            } else if (entry.type === 'monster' && window.localizationSystem) {
                description = window.localizationSystem.getMonsterDescription(entry.id, entry.description);
            } else if (entry.type === 'fish' && window.FishDB) {
                description = window.FishDB.getLocalizedDescription(entry);
            }
            
            const words = description.split(' ');
            let line = '';
            const maxWidth = width - 50;
            
            words.forEach(word => {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && line !== '') {
                    ctx.fillText(line.trim(), statsX, statsY);
                    line = word + ' ';
                    statsY += 22;
                } else {
                    line = testLine;
                }
            });
            
            if (line.trim()) {
                ctx.fillText(line.trim(), statsX, statsY);
            }
        }
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
    
    getRarityColor(rarity) {
        switch (rarity) {
            case 'Common': return '#95a5a6';
            case 'Uncommon': return '#2ecc71';
            case 'Rare': return '#3498db';
            case 'Epic': return '#9b59b6';
            case 'Legendary': return '#f39c12';
            default: return '#fff';
        }
    }
    
    getRarityTranslation(rarity) {
        // Используем систему локализации для перевода редкости
        if (window.localizationSystem) {
            return window.localizationSystem.t(`rarity_${rarity}`, rarity);
        }
        return rarity;
    }
    
    // Преобразование времени активности в ключ локализации
    getTimeKey(timeOfDay) {
        if (!timeOfDay) return 'time_any';
        
        const timeValue = timeOfDay.toLowerCase();
        
        if (timeValue === 'день') {
            return 'time_day';
        } else if (timeValue === 'ночь') {
            return 'time_night';
        } else if (timeValue === 'вечер') {
            return 'time_evening';
        } else if (timeValue === 'утро') {
            return 'time_morning';
        } else if (timeValue === 'утро/вечер') {
            return 'time_morning_evening';
        } else if (timeValue === 'вечер/ночь') {
            return 'time_evening_night';
        } else if (timeValue === 'полночь') {
            return 'time_midnight';
        } else if (timeValue === 'туман') {
            return 'time_fog';
        } else {
            return 'time_any';
        }
    }
    
    // Преобразование типа поклевки в ключ локализации
    getBiteStyleKey(biteStyle) {
        if (!biteStyle) return 'bite_unknown';
        
        const biteMap = {
            'Тык-тык (мелкие касания)': 'bite_tap_tap',
            'Плавное притапливание': 'bite_smooth_sinking',
            'Фальстарт (взял/бросил)': 'bite_false_start',
            'Серия ударов (дробь)': 'bite_series_hits',
            'Трофейный рывок': 'bite_trophy_jerk',
            'Донная тяжесть (как зацеп)': 'bite_bottom_weight',
            'Резкий уход в сторону': 'bite_sharp_side',
            'Молниеносная атака': 'bite_lightning_attack',
            'Яростный рывок': 'bite_furious_jerk',
            'Затягивание на дно': 'bite_drag_bottom',
            'Электрический разряд': 'bite_electric_shock',
            'Донная тяжесть': 'bite_bottom_heavy',
            'Бешеная атака': 'bite_mad_attack',
            'Апокалипсис': 'bite_apocalypse'
        };
        
        return biteMap[biteStyle] || 'bite_unknown';
    }
}
