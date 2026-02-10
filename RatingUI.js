// UI для отображения рейтинга игроков
class RatingUI {
    constructor(canvas, ratingSystem, profileSystem, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        this.ratingSystem = ratingSystem;
        this.profileSystem = profileSystem;
        
        this.isOpen = false;
        this.scrollOffset = 0;
        this.maxScroll = 0;
        this.itemHeight = 60;
        this.visibleItems = 0;
        
        // Вкладки рейтинга
        this.tabs = [
            { id: 'level', label: L('rating_levels', '📊 Уровни'), icon: '📊' },
            { id: 'weight', label: L('rating_weight', '⚖️ Вес рыбы'), icon: '⚖️' },
            { id: 'totalFish', label: L('rating_total_fish', '🐟 Всего\nпоймано'), icon: '🐟' },
            { id: 'coins', label: L('rating_businessman', '💰 Бизнесмен'), icon: '💰' },
            { id: 'fails', label: L('rating_antirating', '💔 Антирейтинг'), icon: '💔' }
        ];
        this.currentTab = 'level';
        this.hoveredTab = null;
        
        // Для drag-scroll
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartScroll = 0;
        this.lastDragY = 0;
        this.dragVelocity = 0;
        
        this.closeButton = { x: 0, y: 0, width: 173, height: 72 };
        this.hoveredCloseButton = false;
        
        this.ratingList = [];
        this.isLoading = false; // Индикатор загрузки
    }
    
    // Обновить метки вкладок после смены языка
    updateTabLabels() {
        this.tabs[0].label = L('rating_levels', '📊 Уровни');
        this.tabs[1].label = L('rating_weight', '⚖️ Вес рыбы');
        this.tabs[2].label = L('rating_total_fish', '🐟 Всего\nпоймано');
        this.tabs[3].label = L('rating_businessman', '💰 Бизнесмен');
        this.tabs[4].label = L('rating_antirating', '💔 Антирейтинг');
    }
    
    open() {
        this.isOpen = true;
        this.scrollOffset = 0;
        this.currentTab = 'level';
        this.ratingList = []; // Очищаем список
        this.loadRatingForCurrentTab();
        this.updateLayout();
    }
    
    async loadRatingForCurrentTab() {
        // Показываем индикатор загрузки
        this.isLoading = true;
        
        // Получаем рейтинг с учетом текущей вкладки (асинхронно)
        const playerStats = this.profileSystem.getStats();
        this.ratingList = await this.ratingSystem.getRatingList(this.currentTab, playerStats);
        
        this.isLoading = false;
        
        // Определяем позицию игрока
        const playerRank = await this.ratingSystem.getPlayerRank(this.currentTab, playerStats);
        
        // Находим позицию игрока в списке
        const playerIndex = this.ratingList.findIndex(p => p.isCurrentPlayer);
        
        if (typeof playerRank === 'number' && playerRank <= 100 && playerIndex !== -1) {
            // Если игрок в топ-100, скроллим к его позиции
            const targetScroll = playerIndex * this.itemHeight - (this.canvas.height - 300) / 2;
            this.scrollOffset = Math.max(0, Math.min(targetScroll, this.maxScroll));
        } else if (playerIndex !== -1) {
            // Если игрок вне топ-100, скроллим к концу списка (к его позиции)
            const targetScroll = playerIndex * this.itemHeight - (this.canvas.height - 300) / 2;
            this.scrollOffset = Math.max(0, Math.min(targetScroll, this.maxScroll));
        } else {
            // Если игрок не найден, показываем начало списка
            this.scrollOffset = 0;
        }
    }
    
    close() {
        this.isOpen = false;
    }
    
    updateLayout() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Кнопка закрытия
        this.closeButton.x = w / 2 - 87;
        this.closeButton.y = h - 96;
        
        // Вычисляем позиции вкладок
        const tabWidth = 140;
        const tabHeight = 50;
        const tabSpacing = 10;
        const totalTabsWidth = this.tabs.length * tabWidth + (this.tabs.length - 1) * tabSpacing;
        const tabStartX = (w - totalTabsWidth) / 2;
        const tabY = 80;
        
        this.tabs.forEach((tab, index) => {
            tab.x = tabStartX + index * (tabWidth + tabSpacing);
            tab.y = tabY;
            tab.width = tabWidth;
            tab.height = tabHeight;
        });
        
        // Вычисляем максимальный скролл
        const contentHeight = this.ratingList.length * this.itemHeight;
        const viewportHeight = h - 340; // Высота области просмотра
        this.maxScroll = Math.max(0, contentHeight - viewportHeight);
        this.visibleItems = Math.ceil(viewportHeight / this.itemHeight) + 2;
    }
    
    handleClick(x, y) {
        if (!this.isOpen) return false;
        
        // Воспроизводим звук клика
        if (this.audioManager) this.audioManager.playClickSound();
        
        // Проверка клика по вкладкам
        for (const tab of this.tabs) {
            if (x >= tab.x && x <= tab.x + tab.width &&
                y >= tab.y && y <= tab.y + tab.height) {
                if (this.currentTab !== tab.id) {
                    this.currentTab = tab.id;
                    this.scrollOffset = 0;
                    this.ratingList = []; // Очищаем список
                    this.loadRatingForCurrentTab(); // Асинхронная загрузка
                    this.updateLayout();
                }
                return true;
            }
        }
        
        // Проверка клика по кнопке закрытия
        if (x >= this.closeButton.x && x <= this.closeButton.x + this.closeButton.width &&
            y >= this.closeButton.y && y <= this.closeButton.y + this.closeButton.height) {
            this.close();
            return true;
        }
        
        // Начало перетаскивания для скролла списка
        const w = this.canvas.width;
        const h = this.canvas.height;
        const panelWidth = Math.min(800, w - 40);
        const panelX = (w - panelWidth) / 2;
        const listTop = 20 + 200;
        const listHeight = h - 40 - 280;
        
        if (x >= panelX + 10 && x <= panelX + panelWidth - 10 &&
            y >= listTop && y <= listTop + listHeight) {
            this.isDragging = true;
            this.dragStartY = y;
            this.dragStartScroll = this.scrollOffset;
            this.lastDragY = y;
            this.dragVelocity = 0;
            return true;
        }
        
        return true; // Поглощаем все клики в окне
    }
    
    handleMouseDown(x, y) {
        return this.handleClick(x, y);
    }
    
    handleMouseMove(x, y) {
        if (!this.isOpen) return false;
        
        // Обработка драга
        if (this.isDragging) {
            const deltaY = this.dragStartY - y;
            this.scrollOffset = this.dragStartScroll + deltaY;
            this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset));
            
            // Вычисляем скорость для инерции
            const now = performance.now();
            const dt = (now - this.lastDragTime) / 1000;
            if (dt > 0) {
                this.dragVelocity = (this.lastDragY - y) / dt;
            }
            this.lastDragY = y;
            this.lastDragTime = now;
            
            return true;
        }
        
        return false;
    }
    
    handleMouseUp(x, y) {
        if (!this.isOpen) return false;
        
        if (this.isDragging) {
            this.isDragging = false;
            
            // Если движение было минимальным, это клик
            const dragDistance = Math.abs(this.dragStartY - this.lastDragY);
            if (dragDistance < 5) {
                this.dragVelocity = 0;
                // Обрабатываем как клик
                this.handleClick(x, y);
            }
            
            return true;
        }
        
        return false;
    }
    
    handleWheel(deltaY) {
        if (!this.isOpen) return false;
        
        // Увеличиваем скорость скролла в 30 раз
        this.scrollOffset += deltaY * 30;
        this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset));
        this.dragVelocity = 0; // Сбрасываем инерцию при колесике
        
        return true;
    }
    
    update(dt) {
        if (!this.isOpen) return;
        
        this.updateLayout();
        
        // Инерция после драга
        if (!this.isDragging && Math.abs(this.dragVelocity) > 0.1) {
            this.scrollOffset += this.dragVelocity;
            this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset));
            this.dragVelocity *= 0.92; // Затухание
        }
    }
    
    render() {
        if (!this.isOpen) return;
        
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Затемнение фона
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, w, h);
        
        // Панель рейтинга (расширенная)
        const panelWidth = Math.min(800, w - 40);
        const panelX = (w - panelWidth) / 2;
        const panelY = 20;
        const panelHeight = h - 40;
        
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
                panelX, panelY,
                panelWidth, panelHeight
            );
        } else {
            // Fallback - градиентный фон если изображение не загружено
            ctx.fillStyle = 'rgba(30, 30, 50, 0.95)';
            ctx.beginPath();
            ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 15);
            ctx.fill();
            
            // Обводка
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Заголовок
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(36, 'bold');
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(L('rating_title', 'Рейтинг игроков'), w / 2, panelY + 20);
        fontManager.applyLetterSpacing(ctx, false);
        
        // Рисуем вкладки
        this.renderTabs(ctx);
        
        // Информация о текущем игроке
        this.renderPlayerInfo(ctx, panelY);
        
        // Область списка
        const listTop = panelY + 200;
        const listHeight = panelHeight - 280;
        const listBottom = listTop + listHeight;
        
        // Клиппинг для списка
        ctx.save();
        ctx.beginPath();
        ctx.rect(panelX + 10, listTop, panelWidth - 20, listHeight);
        ctx.clip();
        
        // Если загружаем, показываем индикатор
        if (this.isLoading) {
            ctx.fillStyle = '#fff';
            ctx.font = fontManager.getFont(24);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L('loading', 'Загрузка...'), w / 2, listTop + listHeight / 2);
        } else if (this.ratingList.length === 0) {
            // Если список пуст, показываем сообщение
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = fontManager.getFont(20);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Проверяем авторизацию
            if (!window.playgamaSDK || !window.playgamaSDK.isPlayerReady) {
                ctx.fillText(L('leaderboard_auth_required', 'Войдите в аккаунт для просмотра рейтинга'), w / 2, listTop + listHeight / 2 - 20);
                ctx.font = fontManager.getFont(16);
                ctx.fillText(L('leaderboard_auth_hint', 'Рейтинг доступен только авторизованным игрокам'), w / 2, listTop + listHeight / 2 + 20);
            } else {
                ctx.fillText(L('leaderboard_empty', 'Рейтинг пока пуст'), w / 2, listTop + listHeight / 2 - 20);
                ctx.font = fontManager.getFont(16);
                ctx.fillText(L('leaderboard_empty_hint', 'Играйте и станьте первым в списке!'), w / 2, listTop + listHeight / 2 + 20);
            }
        } else {
            // Рисуем элементы списка
            const startIndex = Math.floor(this.scrollOffset / this.itemHeight);
            const endIndex = Math.min(this.ratingList.length, startIndex + this.visibleItems);
            
            for (let i = startIndex; i < endIndex; i++) {
                const player = this.ratingList[i];
                const itemY = listTop + i * this.itemHeight - this.scrollOffset;
                
                this.renderPlayerItem(ctx, player, panelX + 20, itemY, panelWidth - 40);
            }
        }
        
        ctx.restore();
        
        // Индикатор скролла
        if (this.maxScroll > 0) {
            this.renderScrollbar(ctx, panelX + panelWidth - 15, listTop, 8, listHeight);
        }
        
        // Кнопка закрытия
        this.renderCloseButton(ctx);
    }
    
    renderTabs(ctx) {
        this.tabs.forEach(tab => {
            const isActive = this.currentTab === tab.id;
            const isHovered = this.hoveredTab === tab.id;
            
            ctx.save();
            
            // Фон вкладки
            if (isActive) {
                ctx.fillStyle = '#f1c40f';
            } else if (isHovered) {
                ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            }
            
            ctx.beginPath();
            ctx.roundRect(tab.x, tab.y, tab.width, tab.height, 8);
            ctx.fill();
            
            // Обводка
            if (isActive) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            // Текст - увеличенный размер на 40% (14 * 1.4 = 19.6)
            ctx.fillStyle = isActive ? '#000' : '#fff';
            ctx.font = fontManager.getFont(16);
            fontManager.applyLetterSpacing(ctx, true);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Разбиваем текст на строки (по пробелу или \n)
            const lines = tab.label.includes('\n') ? tab.label.split('\n') : tab.label.split(' ');
            if (lines.length === 2) {
                ctx.fillText(lines[0], tab.x + tab.width / 2, tab.y + tab.height / 2 - 9);
                ctx.fillText(lines[1], tab.x + tab.width / 2, tab.y + tab.height / 2 + 9);
            } else {
                ctx.fillText(tab.label, tab.x + tab.width / 2, tab.y + tab.height / 2);
            }
            
            fontManager.applyLetterSpacing(ctx, false);
            
            ctx.restore();
        });
    }
    
    renderPlayerInfo(ctx, panelY) {
        const w = this.canvas.width;
        const playerStats = this.profileSystem.getStats();
        
        let descriptionText = '';
        let infoText = '';
        let valueText = '';
        
        // Если загружаем данные, показываем индикатор
        if (this.isLoading) {
            descriptionText = L('loading_rating', 'Загрузка рейтинга...');
            infoText = '';
            valueText = '';
        } else {
            // Пытаемся получить реальный ранг из кэша
            const realData = this.ratingSystem.realLeaderboardData[this.currentTab];
            let playerRank = '?';
            
            // Проверяем авторизацию игрока
            if (!window.playgamaSDK || !window.playgamaSDK.isPlayerReady) {
                playerRank = L('not_authorized', 'Не авторизован');
            } else if (realData && realData.userRank > 0) {
                playerRank = realData.userRank;
            }
            
            switch (this.currentTab) {
                case 'level':
                    descriptionText = L('top_by_level', 'Топ игроков по уровню');
                    infoText = L('your_position', 'Ваша позиция:');
                    valueText = `${playerRank} | ${L('level', 'Уровень')}: ${playerStats.level}`;
                    break;
                case 'weight':
                    descriptionText = L('top_by_weight', 'Топ по весу самой тяжелой рыбы');
                    const weight = playerStats.heaviestFish ? playerStats.heaviestFish.weight.toFixed(2) : '0.00';
                    infoText = L('your_position', 'Ваша позиция:');
                    valueText = `${playerRank} | ${L('record', 'Рекорд')}: ${weight} ${L('kg', 'кг')}`;
                    break;
                case 'totalFish':
                    descriptionText = L('top_by_total_fish', 'Топ по количеству пойманных рыб');
                    infoText = L('your_position', 'Ваша позиция:');
                    valueText = `${playerRank} | ${L('caught', 'Поймано')}: ${playerStats.totalFishCaught || 0} ${L('fish_plural', 'рыб')}`;
                    break;
                case 'coins':
                    descriptionText = L('top_by_coins', 'Топ по заработанным монетам');
                    infoText = L('your_position', 'Ваша позиция:');
                    valueText = `${playerRank} | ${L('earned', 'Заработано')}: ${playerStats.totalCoinEarned || 0} 💰`;
                    break;
                case 'fails':
                    descriptionText = L('top_by_fails', 'Топ по количеству срывов рыбы');
                    infoText = L('your_position', 'Ваша позиция:');
                    valueText = `${playerRank} | ${L('escapes', 'Срывов')}: ${playerStats.fishEscaped || 0}`;
                    break;
            }
        }
        
        // Описание рейтинга - поднято выше
        ctx.fillStyle = '#ecf0f1';
        ctx.font = fontManager.getFont(21);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(descriptionText, w / 2, panelY + 135);
        
        if (!this.isLoading) {
            // Ваша позиция - поднято выше
            ctx.fillStyle = '#bdc3c7';
            ctx.font = fontManager.getFont(17);
            ctx.fillText(infoText, w / 2, panelY + 161);
            
            // Значение - поднято выше
            ctx.fillStyle = '#fff';
            ctx.font = fontManager.getFont(20, 'bold');
            ctx.fillText(valueText, w / 2, panelY + 181);
        }
    }
    
    renderPlayerItem(ctx, player, x, y, width) {
        const height = this.itemHeight - 10;
        
        // Фон элемента
        if (player.isSeparator) {
            // Разделитель
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(x, y + height / 2 - 1, width, 2);
            
            ctx.fillStyle = '#7f8c8d';
            ctx.font = fontManager.getFont(24, 'bold');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(player.name, x + width / 2, y + height / 2);
            return;
        }
        
        // Обычный игрок
        if (player.isCurrentPlayer) {
            // Подсветка текущего игрока
            ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, 8);
            ctx.fill();
            
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, 8);
            ctx.fill();
        }
        
        // Ранг
        let rankColor = '#bdc3c7';
        if (player.rank === 1) rankColor = '#f1c40f'; // Золото
        else if (player.rank === 2) rankColor = '#95a5a6'; // Серебро
        else if (player.rank === 3) rankColor = '#cd7f32'; // Бронза
        
        ctx.fillStyle = rankColor;
        ctx.font = fontManager.getFont(24, 'bold');
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const rankText = player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`;
        ctx.fillText(rankText, x + 10, y + height / 2);
        fontManager.applyLetterSpacing(ctx, false);
        
        // Имя игрока
        ctx.fillStyle = player.isCurrentPlayer ? '#f1c40f' : '#fff';
        ctx.font = fontManager.getFont(20);
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'left';
        
        const nameX = x + 80;
        const maxNameWidth = width - 250;
        let displayName = player.name;
        
        // Обрезаем имя если слишком длинное
        if (ctx.measureText(displayName).width > maxNameWidth) {
            while (ctx.measureText(displayName + '...').width > maxNameWidth && displayName.length > 0) {
                displayName = displayName.slice(0, -1);
            }
            displayName += '...';
        }
        
        ctx.fillText(displayName, nameX, y + height / 2);
        fontManager.applyLetterSpacing(ctx, false);
        
        // Значение в зависимости от типа рейтинга
        ctx.fillStyle = player.isCurrentPlayer ? '#f39c12' : '#3498db';
        ctx.font = fontManager.getFont(20, 'bold');
        ctx.textAlign = 'right';
        
        let valueText = '';
        switch (this.currentTab) {
            case 'level':
                const levelAbbr = L('level_abbr', 'Ур.');
                valueText = `${levelAbbr} ${Math.floor(player.value)}`;
                break;
            case 'weight':
                valueText = `${(player.value / 100).toFixed(2)} ${L('kg', 'кг')}`;
                break;
            case 'totalFish':
                valueText = `${Math.floor(player.value)} 🐟`;
                break;
            case 'coins':
                valueText = `${Math.floor(player.value)} 💰`;
                break;
            case 'fails':
                valueText = `${Math.floor(player.value)} 💔`;
                break;
        }
        
        ctx.fillText(valueText, x + width - 10, y + height / 2);
    }
    
    renderScrollbar(ctx, x, y, width, height) {
        // Фон скроллбара
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, y, width, height);
        
        // Ползунок
        const scrollbarHeight = Math.max(30, (height * height) / (this.maxScroll + height));
        const scrollbarY = y + (this.scrollOffset / this.maxScroll) * (height - scrollbarHeight);
        
        ctx.fillStyle = 'rgba(241, 196, 15, 0.6)';
        ctx.beginPath();
        ctx.roundRect(x, scrollbarY, width, scrollbarHeight, width / 2);
        ctx.fill();
    }
    
    renderCloseButton(ctx) {
        const btn = this.closeButton;
        const isHovered = this.hoveredCloseButton;
        
        ctx.save();
        ctx.globalAlpha = 0.9; // 90% прозрачность
        
        // Используем спрайт zak.png
        const zakImage = assetManager.getImage('zak.png');
        if (zakImage) {
            // Для прямоугольной кнопки используем размер по высоте
            const size = btn.height;
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
            ctx.fillText(L('close', 'Закрыть'), btn.x + btn.width / 2, btn.y + btn.height / 2);
            fontManager.applyLetterSpacing(ctx, false);
        }
        
        ctx.restore();
    }
}
