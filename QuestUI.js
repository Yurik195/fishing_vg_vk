// QuestUI.js - Интерфейс системы заданий (Canvas)

class QuestUI {
    constructor(canvas, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        
        // Состояние
        this.visible = false;
        this.animProgress = 0;
        this.currentTab = 'daily'; // 'daily' или 'weekly'
        
        // Вкладки
        this.tabs = [
            { id: 'daily', name: L('daily_quests', 'Ежедневные'), icon: '📅' },
            { id: 'weekly', name: L('weekly_quests', 'Еженедельные'), icon: '📆' }
        ];
        
        // Список заданий
        this.quests = [];
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.maxVisibleItems = 3; // Уменьшено с 4 до 3 из-за уменьшения высоты списка
        
        // Размеры окна
        this.modalWidth = 1200;
        this.modalHeight = 700;
        this.modalX = 0;
        this.modalY = 0;
        
        // Размеры списка
        this.listWidth = 420;
        this.listItemHeight = 120;
        
        // Кнопки
        this.closeButton = { x: 0, y: 0, size: 42 };
        this.skipButton = { x: 0, y: 0, width: 250, height: 50, scale: 1.0, targetScale: 1.0 };
        this.claimButton = { x: 0, y: 0, width: 250, height: 60, scale: 1.0, targetScale: 1.0 };
        
        // Перетаскивание для скролла
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartScroll = 0;
        this.dragVelocity = 0;
        this.lastDragY = 0;
        this.lastDragTime = 0;
        
        // Таймер обновления
        this.updateInterval = null;
        
        // Анимация получения награды
        this.rewardAnimation = {
            active: false,
            progress: 0,
            coins: 0,
            gems: 0,
            particles: []
        };
        
        this.updatePositions();
    }

    updatePositions() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.modalX = (w - this.modalWidth) / 2;
        this.modalY = (h - this.modalHeight) / 2;
        
        // Кнопка закрытия - в глобальных координатах (увеличена в 2 раза, в углу)
        this.closeButton.x = this.modalX + this.modalWidth - 15;
        this.closeButton.y = this.modalY + 30;
        
        // Кнопка пропуска - в глобальных координатах
        this.skipButton.x = this.modalX + 30;
        this.skipButton.y = this.modalY + 90;
        
        // Кнопка получения награды (справа внизу, в глобальных координатах)
        const detailsX = this.modalX + this.listWidth + 50;
        const detailsWidth = this.modalWidth - this.listWidth - 75;
        this.claimButton.x = detailsX + detailsWidth / 2 - this.claimButton.width / 2;
        this.claimButton.y = this.modalY + this.modalHeight - 90;
    }

    show() {
        this.visible = true;
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.loadQuests();
        this.updatePositions();
        this.startTimer();
    }

    hide() {
        this.visible = false;
        this.quests = [];
        this.stopTimer();
    }
    
    // Обновить названия вкладок после смены языка
    updateTabLabels() {
        this.tabs[0].name = L('daily_quests', 'Ежедневные');
        this.tabs[1].name = L('weekly_quests', 'Еженедельные');
    }

    loadQuests() {
        if (!window.questSystem) return;
        
        const isWeekly = this.currentTab === 'weekly';
        const questList = isWeekly ? window.questSystem.weeklyQuests : window.questSystem.dailyQuests;
        const completedSet = isWeekly ? window.questSystem.completedWeekly : window.questSystem.completedDaily;
        
        this.quests = questList.map(quest => ({
            ...quest,
            isCompleted: quest.currentAmount >= quest.targetAmount,
            isClaimed: completedSet.has(quest.id),
            progress: Math.min(1, quest.currentAmount / quest.targetAmount)
        }));
    }

    switchTab(tabId) {
        if (this.currentTab === tabId) return;
        this.currentTab = tabId;
        this.selectedIndex = -1;
        this.scrollOffset = 0;
        this.loadQuests();
    }

    update(dt) {
        const targetProgress = this.visible ? 1 : 0;
        this.animProgress += (targetProgress - this.animProgress) * dt * 10;
        
        if (!this.visible && this.animProgress < 0.01) {
            this.animProgress = 0;
        }
        
        // Анимация масштаба кнопок
        this.skipButton.scale += (this.skipButton.targetScale - this.skipButton.scale) * dt * 15;
        this.claimButton.scale += (this.claimButton.targetScale - this.claimButton.scale) * dt * 15;
        
        // Анимация получения награды
        if (this.rewardAnimation.active) {
            this.rewardAnimation.progress += dt * 1.5; // Скорость анимации
            
            if (this.rewardAnimation.progress >= 1) {
                this.rewardAnimation.active = false;
            }
        }
        
        // Инерция скролла
        if (!this.isDragging && Math.abs(this.dragVelocity) > 0.1) {
            this.scrollOffset += this.dragVelocity * dt * 60;
            this.dragVelocity *= 0.92;
            
            const maxScroll = Math.max(0, this.quests.length - this.maxVisibleItems);
            this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset));
            
            if (Math.abs(this.dragVelocity) < 0.1) {
                this.dragVelocity = 0;
            }
        }
    }

    render() {
        if (this.animProgress < 0.01) return;
        
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        ctx.save();
        ctx.globalAlpha = this.animProgress;
        
        // Сбрасываем letterSpacing
        ctx.letterSpacing = '0px';
        
        // Затемнённый фон
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);
        
        // Масштабирование окна (как в CollectionUI - относительно центра canvas)
        const scale = 0.8 + this.animProgress * 0.2;
        ctx.translate(w / 2, h / 2);
        ctx.scale(scale, scale);
        ctx.translate(-w / 2, -h / 2);
        
        // Тень
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
            ctx.fillStyle = '#1a1a2e';
            this.roundRect(ctx, this.modalX, this.modalY, this.modalWidth, this.modalHeight, 20);
            ctx.fill();
        }
        
        // Сбрасываем тень
        ctx.shadowColor = 'transparent';
        
        // Заголовок
        ctx.letterSpacing = '0px';
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(42);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(L('quests', 'ЗАДАНИЯ'), this.modalX + this.modalWidth / 2, this.modalY + 25);
        
        // Валюты справа от названия (как в главном меню)
        const coins = window.profileSystem ? window.profileSystem.getCoins() : 0;
        const gems = window.profileSystem ? window.profileSystem.getGems() : 0;
        
        ctx.save();
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
        
        // Вкладки
        this.renderTabs(ctx);
        
        // Список заданий (слева)
        this.renderQuestList(ctx);
        
        // Детали задания (справа)
        this.renderQuestDetails(ctx);
        
        // Кнопка пропуска (всегда отображается в левом верхнем углу)
        const isWeekly = this.currentTab === 'weekly';
        this.renderSkipButton(ctx, isWeekly);
        
        // Кнопка закрытия
        this.renderCloseButton(ctx);
        
        ctx.restore();
        
        // Анимация получения награды (поверх всего)
        if (this.rewardAnimation.active) {
            this.renderRewardAnimation(ctx);
        }
    }

    renderTabs(ctx) {
        const tabY = this.modalY + 90;
        const tabWidth = 250;
        const tabHeight = 50;
        const tabSpacing = 15;
        const startX = this.modalX + (this.modalWidth - (tabWidth * 2 + tabSpacing)) / 2;
        
        this.tabs.forEach((tab, index) => {
            const x = startX + index * (tabWidth + tabSpacing);
            const isActive = this.currentTab === tab.id;
            
            // Используем спрайт uipan.png как подложку для кнопок
            const uipanImage = assetManager.getImage('uipan.png');
            if (uipanImage) {
                ctx.drawImage(uipanImage, x, tabY, tabWidth, tabHeight);
                
                // Белая обводка для активной вкладки
                if (isActive) {
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.roundRect(x, tabY, tabWidth, tabHeight, 12);
                    ctx.stroke();
                }
            } else {
                // Fallback - обычный фон если изображение не загружено
                if (isActive) {
                    ctx.fillStyle = '#667eea';
                } else {
                    ctx.fillStyle = '#2c3e50';
                }
                
                this.roundRect(ctx, x, tabY, tabWidth, tabHeight, 12);
                ctx.fill();
            }
            
            // Текст вкладки (без смайликов, увеличен размер на 20%)
            ctx.letterSpacing = '0px';
            ctx.fillStyle = '#fff';
            ctx.font = fontManager.getFont(24); // Увеличено с 20 до 24 (+20%)
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tab.name, x + tabWidth / 2, tabY + tabHeight / 2); // Убраны смайлики
        });
    }

    renderQuestList(ctx) {
        const listX = this.modalX + 25;
        const listY = this.modalY + 160;
        const listHeight = this.modalHeight - 200; // Увеличена высота еще на 30px (было -230, стало -200)
        
        // Фон списка - более светлая полупрозрачность
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // Уменьшено с 0.85 до 0.4
        this.roundRect(ctx, listX, listY, this.listWidth, listHeight, 15);
        ctx.fill();
        
        // Обрезка для скролла
        ctx.save();
        ctx.beginPath();
        ctx.rect(listX, listY, this.listWidth, listHeight);
        ctx.clip();
        
        // Рисуем задания
        this.quests.forEach((quest, index) => {
            const y = listY + 10 + (index - this.scrollOffset) * this.listItemHeight;
            
            if (y + this.listItemHeight < listY || y > listY + listHeight) return;
            
            this.renderQuestItem(ctx, quest, listX + 10, y, this.listWidth - 35, this.listItemHeight - 10, index === this.selectedIndex);
        });
        
        ctx.restore();
        
        // Скроллбар (как в CollectionUI - шире и заметнее)
        if (this.quests.length > this.maxVisibleItems) {
            this.renderScrollbar(ctx, listX + this.listWidth - 18, listY + 8, 12, listHeight - 16);
        }
    }

    renderQuestItem(ctx, quest, x, y, width, height, isSelected) {
        // Фон элемента - более светлая полупрозрачность
        if (quest.isClaimed) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Уменьшено с 0.75 до 0.3
        } else if (quest.isCompleted) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // Уменьшено с 0.8 до 0.4
        } else if (isSelected) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Уменьшено с 0.9 до 0.5
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; // Уменьшено с 0.85 до 0.35
        }
        
        this.roundRect(ctx, x, y, width, height, 12);
        ctx.fill();
        
        // Спрайт рыбы
        const iconSize = 50;
        const fishData = window.FISH_DATABASE ? window.FISH_DATABASE.find(f => f.id === quest.fishId) : null;
        if (fishData) {
            assetManager.drawImageOrEmoji(
                ctx, 'fish', fishData.id,
                x + 15 + iconSize / 2, y + 10 + iconSize / 2, iconSize,
                fishData.emoji || '🐟'
            );
        }
        
        // Название задания - увеличен размер шрифта
        ctx.letterSpacing = '0px';
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(18); // Увеличено с 16 до 18
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const description = window.questSystem.getQuestDescription(quest);
        
        // Обрезаем текст если он слишком длинный
        const maxWidth = width - 90;
        let displayText = description;
        let textWidth = ctx.measureText(displayText).width;
        
        if (textWidth > maxWidth) {
            while (textWidth > maxWidth && displayText.length > 0) {
                displayText = displayText.slice(0, -1);
                textWidth = ctx.measureText(displayText + '...').width;
            }
            displayText += '...';
        }
        
        ctx.fillText(displayText, x + 75, y + 10);
        
        // Звезды сложности
        const stars = '⭐'.repeat(Math.min(5, quest.difficulty + 1));
        ctx.font = fontManager.getFont(14);
        ctx.fillText(stars, x + 75, y + 35);
        
        // Прогресс-бар
        const barX = x + 75;
        const barY = y + 60;
        const barWidth = width - 90;
        const barHeight = 20;
        
        // Фон прогресс-бара
        ctx.fillStyle = '#1a1a2e';
        this.roundRect(ctx, barX, barY, barWidth, barHeight, 10);
        ctx.fill();
        
        // Заполнение прогресс-бара
        if (quest.progress > 0) {
            const fillWidth = barWidth * quest.progress;
            if (quest.isCompleted) {
                ctx.fillStyle = '#4CAF50';
            } else {
                ctx.fillStyle = '#667eea';
            }
            this.roundRect(ctx, barX, barY, fillWidth, barHeight, 10);
            ctx.fill();
        }
        
        // Текст прогресса
        ctx.letterSpacing = '0px';
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(14);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${quest.currentAmount} / ${quest.targetAmount}`, barX + barWidth / 2, barY + barHeight / 2);
        
        // Награды - сдвинуты ниже, используем спрайты монеты и гемов
        ctx.font = fontManager.getFont(14);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        
        // Рисуем награды
        const rewardY = y + 93;
        const rewardIconSize = 16;
        let rewardX = x + 75;
        
        // Рисуем иконку монеты
        assetManager.drawCoinIcon(ctx, rewardX + rewardIconSize / 2, rewardY, rewardIconSize);
        rewardX += rewardIconSize + 3;
        
        // Рисуем количество монет
        const coinsText = `${quest.rewards.coins}`;
        ctx.fillText(coinsText, rewardX, rewardY);
        rewardX += ctx.measureText(coinsText).width + 10;
        
        // Рисуем иконку гема
        assetManager.drawGemIcon(ctx, rewardX + rewardIconSize / 2, rewardY, rewardIconSize);
        rewardX += rewardIconSize + 3;
        
        // Рисуем количество гемов
        ctx.fillText(`${quest.rewards.gems}`, rewardX, rewardY);
        
        // Бейдж "Выполнено"
        if (quest.isClaimed) {
            ctx.fillStyle = 'rgba(76, 175, 80, 0.9)';
            this.roundRect(ctx, x + width - 90, y + 10, 80, 30, 8);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = fontManager.getFont(14);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✅', x + width - 50, y + 25);
        }
    }

    renderQuestDetails(ctx) {
        const detailsX = this.modalX + this.listWidth + 50;
        const detailsY = this.modalY + 160;
        const detailsWidth = this.modalWidth - this.listWidth - 75;
        const detailsHeight = this.modalHeight - 200; // Увеличена высота еще на 30px (было -230, стало -200)
        
        // Фон панели деталей - более светлая полупрозрачность
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // Уменьшено с 0.85 до 0.4
        this.roundRect(ctx, detailsX, detailsY, detailsWidth, detailsHeight, 15);
        ctx.fill();
        
        const selectedQuest = this.selectedIndex >= 0 ? this.quests[this.selectedIndex] : null;
        
        if (!selectedQuest) {
            // Таймер и кнопка пропуска
            this.renderTimer(ctx, detailsX, detailsY, detailsWidth);
            
            // Подсказка
            ctx.letterSpacing = '0px';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = fontManager.getFont(20);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(L('quest_select_to_view', 'Выберите задание для просмотра деталей'), detailsX + detailsWidth / 2, detailsY + detailsHeight / 2);
            return;
        }
        
        // Детали выбранного задания
        let currentY = detailsY + 30;
        
        // Спрайт рыбы
        const iconSize = 80;
        const fishData = window.FISH_DATABASE ? window.FISH_DATABASE.find(f => f.id === selectedQuest.fishId) : null;
        if (fishData) {
            assetManager.drawImageOrEmoji(
                ctx, 'fish', fishData.id,
                detailsX + detailsWidth / 2, currentY + iconSize / 2, iconSize,
                fishData.emoji || '🐟'
            );
        }
        currentY += iconSize + 20;
        
        // Описание
        ctx.letterSpacing = '0px';
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(24);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const description = window.questSystem.getQuestDescription(selectedQuest);
        ctx.fillText(description, detailsX + detailsWidth / 2, currentY);
        currentY += 40;
        
        // Сложность
        const stars = '⭐'.repeat(Math.min(5, selectedQuest.difficulty + 1));
        ctx.font = fontManager.getFont(20);
        ctx.fillText(stars, detailsX + detailsWidth / 2, currentY);
        currentY += 50;
        
        // Прогресс
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = fontManager.getFont(18);
        ctx.fillText(L('quest_progress', 'Прогресс:'), detailsX + detailsWidth / 2, currentY);
        currentY += 30;
        
        // Большой прогресс-бар
        const barWidth = detailsWidth - 80;
        const barHeight = 40;
        const barX = detailsX + 40;
        
        ctx.fillStyle = '#1a1a2e';
        this.roundRect(ctx, barX, currentY, barWidth, barHeight, 15);
        ctx.fill();
        
        if (selectedQuest.progress > 0) {
            const fillWidth = barWidth * selectedQuest.progress;
            if (selectedQuest.isCompleted) {
                ctx.fillStyle = '#4CAF50';
            } else {
                ctx.fillStyle = '#667eea';
            }
            this.roundRect(ctx, barX, currentY, fillWidth, barHeight, 15);
            ctx.fill();
        }
        
        ctx.letterSpacing = '0px';
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${selectedQuest.currentAmount} / ${selectedQuest.targetAmount}`, barX + barWidth / 2, currentY + barHeight / 2);
        currentY += barHeight + 40;
        
        // Награды
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = fontManager.getFont(18);
        ctx.fillText(L('quest_reward', 'Награда:'), detailsX + detailsWidth / 2, currentY);
        currentY += 35;
        
        // Блоки наград
        const rewardBoxWidth = 150;
        const rewardBoxHeight = 80;
        const rewardSpacing = 20;
        const rewardStartX = detailsX + (detailsWidth - rewardBoxWidth * 2 - rewardSpacing) / 2;
        
        // Монеты
        ctx.fillStyle = 'rgba(255, 193, 7, 0.2)';
        this.roundRect(ctx, rewardStartX, currentY, rewardBoxWidth, rewardBoxHeight, 12);
        ctx.fill();
        
        // Рисуем иконку монеты
        assetManager.drawCoinIcon(ctx, rewardStartX + rewardBoxWidth / 2, currentY + 25, 40);
        
        ctx.letterSpacing = '0px';
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(24);
        ctx.fillText(`${selectedQuest.rewards.coins}`, rewardStartX + rewardBoxWidth / 2, currentY + 60);
        
        // Бриллианты
        ctx.fillStyle = 'rgba(102, 126, 234, 0.2)';
        this.roundRect(ctx, rewardStartX + rewardBoxWidth + rewardSpacing, currentY, rewardBoxWidth, rewardBoxHeight, 12);
        ctx.fill();
        
        // Рисуем иконку гема
        assetManager.drawGemIcon(ctx, rewardStartX + rewardBoxWidth + rewardSpacing + rewardBoxWidth / 2, currentY + 25, 40);
        
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(24);
        ctx.fillText(`${selectedQuest.rewards.gems}`, rewardStartX + rewardBoxWidth + rewardSpacing + rewardBoxWidth / 2, currentY + 60);
        
        // Кнопка получения награды
        if (selectedQuest.isCompleted && !selectedQuest.isClaimed) {
            this.renderClaimButton(ctx);
        }
    }

    renderTimer(ctx, x, y, width) {
        if (!window.questSystem) return;
        
        const isWeekly = this.currentTab === 'weekly';
        const timeLeft = window.questSystem.getTimeUntilReset(isWeekly);
        const formatted = window.questSystem.formatTimeLeft(timeLeft);
        
        // Блок таймера
        const timerHeight = 80;
        ctx.fillStyle = 'rgba(102, 126, 234, 0.2)';
        this.roundRect(ctx, x + 20, y + 20, width - 40, timerHeight, 12);
        ctx.fill();
        
        // Иконка
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⏰', x + 60, y + 60);
        
        // Текст
        ctx.letterSpacing = '0px';
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(18);
        ctx.textAlign = 'left';
        ctx.fillText(L('quest_until_update', 'До обновления:'), x + 100, y + 45);
        
        ctx.font = fontManager.getFont(24);
        ctx.fillText(formatted, x + 100, y + 75);
    }

    renderSkipButton(ctx, isWeekly) {
        const btn = this.skipButton;
        
        ctx.save();
        ctx.translate(btn.x + btn.width / 2, btn.y + btn.height / 2);
        ctx.scale(btn.scale, btn.scale);
        ctx.translate(-btn.width / 2, -btn.height / 2);
        
        // Используем спрайт uipan.png как подложку
        const uipanImage = assetManager.getImage('uipan.png');
        if (uipanImage) {
            ctx.drawImage(uipanImage, 0, 0, btn.width, btn.height);
            
            // Золотая обводка
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(0, 0, btn.width, btn.height, 12);
            ctx.stroke();
        } else {
            // Fallback - градиентный фон если изображение не загружено
            const gradient = ctx.createLinearGradient(0, 0, 0, btn.height);
            gradient.addColorStop(0, '#f093fb');
            gradient.addColorStop(1, '#f5576c');
            ctx.fillStyle = gradient;
            
            this.roundRect(ctx, 0, 0, btn.width, btn.height, 12);
            ctx.fill();
        }
        
        // Текст и иконка гема
        ctx.letterSpacing = '0px';
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(18);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const skipCost = isWeekly ? window.questSystem.WEEKLY_SKIP_COST : window.questSystem.DAILY_SKIP_COST;
        const buttonTextPrefix = isWeekly ? L('quest_skip_week', 'Пропустить неделю (') : L('quest_skip_day', 'Пропустить день (');
        const buttonTextSuffix = `)`;
        
        // Вычисляем ширину текста
        const prefixWidth = ctx.measureText(buttonTextPrefix).width;
        const costWidth = ctx.measureText(`${skipCost}`).width;
        const suffixWidth = ctx.measureText(buttonTextSuffix).width;
        const gemSize = 18;
        const totalWidth = prefixWidth + costWidth + 3 + gemSize + 3 + suffixWidth;
        
        // Начальная позиция (центрируем всё вместе)
        let currentX = btn.width / 2 - totalWidth / 2;
        const centerY = btn.height / 2;
        
        // Рисуем текст слева
        ctx.textAlign = 'left';
        ctx.fillText(buttonTextPrefix, currentX, centerY);
        currentX += prefixWidth;
        
        // Рисуем стоимость
        ctx.fillText(`${skipCost}`, currentX, centerY);
        currentX += costWidth + 3;
        
        // Рисуем иконку гема
        assetManager.drawGemIcon(ctx, currentX + gemSize / 2, centerY, gemSize);
        currentX += gemSize + 3;
        
        // Рисуем закрывающую скобку
        ctx.fillText(buttonTextSuffix, currentX, centerY);
        
        ctx.restore();
    }

    renderClaimButton(ctx) {
        const btn = this.claimButton;
        
        ctx.save();
        ctx.translate(btn.x + btn.width / 2, btn.y + btn.height / 2);
        ctx.scale(btn.scale, btn.scale);
        ctx.translate(-btn.width / 2, -btn.height / 2);
        
        // Фон кнопки с пульсацией
        const gradient = ctx.createLinearGradient(0, 0, 0, btn.height);
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#45a049');
        ctx.fillStyle = gradient;
        
        this.roundRect(ctx, 0, 0, btn.width, btn.height, 12);
        ctx.fill();
        
        // Текст
        ctx.letterSpacing = '0px';
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(22);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L('quest_claim_reward', 'Забрать награду'), btn.width / 2, btn.height / 2);
        
        ctx.restore();
    }

    renderCloseButton(ctx) {
        // Кнопка закрытия в глобальных координатах
        const btnX = this.closeButton.x;
        const btnY = this.closeButton.y;
        
        ctx.save();
        ctx.globalAlpha = 0.9; // 90% прозрачность
        
        // Используем спрайт zak.png (увеличен в 2 раза)
        const zakImage = assetManager.getImage('zak.png');
        if (zakImage) {
            const size = this.closeButton.size * 2; // Увеличиваем в 2 раза
            ctx.drawImage(zakImage, btnX - size/2, btnY - size/2, size, size);
        } else {
            // Fallback - обычный крестик если спрайт не загружен
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(btnX, btnY, this.closeButton.size, 0, Math.PI * 2); // Увеличиваем радиус в 2 раза
            ctx.fill();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            
            const offset = this.closeButton.size / 2; // Увеличиваем offset
            ctx.beginPath();
            ctx.moveTo(btnX - offset, btnY - offset);
            ctx.lineTo(btnX + offset, btnY + offset);
            ctx.moveTo(btnX + offset, btnY - offset);
            ctx.lineTo(btnX - offset, btnY + offset);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    renderScrollbar(ctx, x, y, width, height) {
        const maxScroll = Math.max(0, this.quests.length - this.maxVisibleItems);
        if (maxScroll === 0) return;
        
        const scrollPercent = this.scrollOffset / maxScroll;
        const barHeight = Math.max(40, height * (this.maxVisibleItems / this.quests.length));
        const barY = y + (height - barHeight) * scrollPercent;
        
        // Фон скроллбара (более заметный)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        this.roundRect(ctx, x, y, width, height, 6);
        ctx.fill();
        
        // Ползунок (более яркий)
        ctx.fillStyle = 'rgba(102, 126, 234, 0.7)';
        this.roundRect(ctx, x, barY, width, barHeight, 6);
        ctx.fill();
    }

    handleClick(x, y) {
        if (!this.visible) return false;
        
        // Воспроизводим звук клика
        if (this.audioManager) this.audioManager.playClickSound();
        
        // Кнопка закрытия (глобальные координаты) - увеличенная в 2 раза
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
        
        // Вкладки (глобальные координаты)
        const tabY = this.modalY + 90;
        const tabWidth = 250;
        const tabHeight = 50;
        const tabSpacing = 15;
        const startX = this.modalX + (this.modalWidth - (tabWidth * 2 + tabSpacing)) / 2;
        
        for (let index = 0; index < this.tabs.length; index++) {
            const tab = this.tabs[index];
            const tabX = startX + index * (tabWidth + tabSpacing);
            if (x >= tabX && x <= tabX + tabWidth &&
                y >= tabY && y <= tabY + tabHeight) {
                this.switchTab(tab.id);
                return true;
            }
        }
        
        // Начало перетаскивания списка (глобальные координаты, как в CollectionUI)
        const listX = this.modalX + 25;
        const listY = this.modalY + 160;
        const listHeight = this.modalHeight - 175;
        
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
        
        // Кнопка пропуска (глобальные координаты)
        const btn = this.skipButton;
        if (x >= btn.x && x <= btn.x + btn.width &&
            y >= btn.y && y <= btn.y + btn.height) {
            if (this.currentTab === 'daily') {
                this.skipDay();
            } else {
                this.skipWeek();
            }
            return true;
        }
        
        // Кнопка получения награды (глобальные координаты)
        const selectedQuest = this.selectedIndex >= 0 ? this.quests[this.selectedIndex] : null;
        if (selectedQuest && selectedQuest.isCompleted && !selectedQuest.isClaimed) {
            const claimBtn = this.claimButton;
            if (x >= claimBtn.x && x <= claimBtn.x + claimBtn.width &&
                y >= claimBtn.y && y <= claimBtn.y + claimBtn.height) {
                this.claimReward(selectedQuest.id);
                return true;
            }
        }
        
        return true;
    }

    handleMouseDown(x, y) {
        return this.handleClick(x, y);
    }

    handleMouseMove(x, y) {
        if (!this.visible || !this.isDragging) return;
        
        const deltaY = this.dragStartY - y;
        const deltaItems = deltaY / this.listItemHeight;
        
        this.scrollOffset = this.dragStartScroll + deltaItems;
        
        // Ограничение скролла
        const maxScroll = Math.max(0, this.quests.length - this.maxVisibleItems);
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

    handleMouseUp() {
        if (!this.visible) return;
        
        if (this.isDragging) {
            this.isDragging = false;
            
            // Если движение было минимальным, это клик
            const dragDistance = Math.abs(this.dragStartY - this.lastDragY);
            if (dragDistance < 5) {
                const listY = this.modalY + 160;
                const relativeY = this.lastDragY - listY - 10;
                const clickedIndex = Math.floor(relativeY / this.listItemHeight + this.scrollOffset);
                
                if (clickedIndex >= 0 && clickedIndex < this.quests.length) {
                    this.selectedIndex = clickedIndex;
                }
                this.dragVelocity = 0;
            }
        }
    }

    handleScroll(deltaY) {
        if (!this.visible) return;
        
        const maxScroll = Math.max(0, this.quests.length - this.maxVisibleItems);
        if (maxScroll > 0) {
            this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset + deltaY * 0.5));
        }
        this.dragVelocity = 0;
    }

    claimReward(questId) {
        if (!window.questSystem) return;
        
        const isWeekly = this.currentTab === 'weekly';
        const result = window.questSystem.claimReward(questId, isWeekly);
        
        if (result.success) {
            // Запускаем анимацию получения награды
            this.startRewardAnimation(result.rewards.coins, result.rewards.gems);
            
            // Обновляем список заданий
            this.loadQuests();
            
            // Обновляем валюту в главном UI
            if (window.updateCurrencyDisplay) {
                window.updateCurrencyDisplay();
            }
            
            console.log('Награда получена:', result.rewards);
        } else {
            console.log('Ошибка получения награды:', result.message);
        }
    }
    
    startRewardAnimation(coins, gems) {
        this.rewardAnimation.active = true;
        this.rewardAnimation.progress = 0;
        this.rewardAnimation.coins = coins;
        this.rewardAnimation.gems = gems;
        this.rewardAnimation.particles = [];
        
        const centerX = this.modalX + this.modalWidth / 2;
        const centerY = this.modalY + this.modalHeight / 2;
        
        // Создаем монеты (как в MarketUI, но адаптировано)
        const coinCount = Math.min(10, Math.max(5, Math.floor(coins / 30)));
        for (let i = 0; i < coinCount; i++) {
            const angle = (Math.PI * 2 * i) / coinCount;
            const distance = 80 + Math.random() * 40;
            
            this.rewardAnimation.particles.push({
                type: 'coin',
                startX: centerX + Math.cos(angle) * 30,
                startY: centerY + Math.sin(angle) * 30,
                endX: centerX + Math.cos(angle) * distance,
                endY: centerY + Math.sin(angle) * distance - 100,
                progress: 0,
                delay: i * 0.04,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
        
        // Создаем бриллианты (меньше, но ярче)
        const gemCount = Math.min(8, Math.max(3, Math.floor(gems / 2)));
        for (let i = 0; i < gemCount; i++) {
            const angle = (Math.PI * 2 * i) / gemCount + Math.PI / gemCount;
            const distance = 90 + Math.random() * 50;
            
            this.rewardAnimation.particles.push({
                type: 'gem',
                startX: centerX + Math.cos(angle) * 25,
                startY: centerY + Math.sin(angle) * 25,
                endX: centerX + Math.cos(angle) * distance,
                endY: centerY + Math.sin(angle) * distance - 120,
                progress: 0,
                delay: i * 0.05,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 12
            });
        }
        
        // Звезды достижения (для вайба заданий)
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const distance = 100 + Math.random() * 60;
            
            this.rewardAnimation.particles.push({
                type: 'star',
                startX: centerX,
                startY: centerY,
                endX: centerX + Math.cos(angle) * distance,
                endY: centerY + Math.sin(angle) * distance - 80,
                progress: 0,
                delay: i * 0.03,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 15
            });
        }
        
        // Текстовые элементы
        this.rewardAnimation.particles.push({
            type: 'text',
            text: '🎉 ЗАДАНИЕ ВЫПОЛНЕНО! 🎉',
            x: centerX,
            y: centerY - 80,
            progress: 0,
            delay: 0
        });
        
        this.rewardAnimation.particles.push({
            type: 'text',
            text: `+${coins}🪙`,
            x: centerX - 60,
            y: centerY + 20,
            progress: 0,
            delay: 0.1
        });
        
        this.rewardAnimation.particles.push({
            type: 'text',
            text: `+${gems}`,
            x: centerX + 60,
            y: centerY + 20,
            progress: 0,
            delay: 0.15
        });
    }
    
    renderRewardAnimation(ctx) {
        if (!this.rewardAnimation.active) return;
        
        ctx.save();
        
        // Вспышка в начале (более яркая для вайба достижения)
        if (this.rewardAnimation.progress < 0.15) {
            const flashAlpha = (0.15 - this.rewardAnimation.progress) / 0.15;
            ctx.fillStyle = `rgba(102, 126, 234, ${flashAlpha * 0.4})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Рисуем частицы
        this.rewardAnimation.particles.forEach(particle => {
            // Учитываем задержку
            const effectiveProgress = Math.max(0, Math.min(1, (this.rewardAnimation.progress - particle.delay) / (1 - particle.delay)));
            
            if (effectiveProgress <= 0) return;
            
            if (particle.type === 'coin') {
                this.renderCoinParticle(ctx, particle, effectiveProgress);
            } else if (particle.type === 'gem') {
                this.renderGemParticle(ctx, particle, effectiveProgress);
            } else if (particle.type === 'star') {
                this.renderStarParticle(ctx, particle, effectiveProgress);
            } else if (particle.type === 'text') {
                this.renderTextParticle(ctx, particle, effectiveProgress);
            }
        });
        
        ctx.restore();
    }
    
    // Анимация монеты (из MarketUI)
    renderCoinParticle(ctx, particle, progress) {
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const x = particle.startX + (particle.endX - particle.startX) * easeOut;
        const y = particle.startY + (particle.endY - particle.startY) * easeOut;
        
        const alpha = progress < 0.1 ? progress / 0.1 : progress > 0.8 ? (1 - progress) / 0.2 : 1;
        const scale = progress < 0.2 ? progress / 0.2 : 1;
        const size = 40 * scale;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.rotate(particle.rotation + particle.rotationSpeed * progress);
        
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
        
        // Символ монеты - используем спрайт
        const coinSize = Math.floor(size * 0.6);
        assetManager.drawCoinIcon(ctx, 0, 0, coinSize);
        
        ctx.restore();
    }
    
    // Анимация бриллианта (адаптировано)
    renderGemParticle(ctx, particle, progress) {
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const x = particle.startX + (particle.endX - particle.startX) * easeOut;
        const y = particle.startY + (particle.endY - particle.startY) * easeOut;
        
        const alpha = progress < 0.1 ? progress / 0.1 : progress > 0.8 ? (1 - progress) / 0.2 : 1;
        const scale = progress < 0.2 ? progress / 0.2 : 1;
        const size = 45 * scale;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.rotate(particle.rotation + particle.rotationSpeed * progress);
        
        // Фиолетовый круг
        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Обводка
        ctx.strokeStyle = '#764ba2';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Блик
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(-size / 6, -size / 6, size / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Символ бриллианта - используем спрайт
        const gemSize = Math.floor(size * 0.6);
        assetManager.drawGemIcon(ctx, 0, 0, gemSize);
        
        ctx.restore();
    }
    
    // Анимация звезды (для вайба заданий)
    renderStarParticle(ctx, particle, progress) {
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const x = particle.startX + (particle.endX - particle.startX) * easeOut;
        const y = particle.startY + (particle.endY - particle.startY) * easeOut;
        
        const alpha = progress < 0.1 ? progress / 0.1 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        const scale = progress < 0.15 ? progress / 0.15 : 1;
        const size = 35 * scale;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.rotate(particle.rotation + particle.rotationSpeed * progress);
        
        // Желтое свечение
        ctx.shadowColor = '#f1c40f';
        ctx.shadowBlur = 15;
        
        // Символ звезды
        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', 0, 0);
        
        ctx.restore();
    }
    
    // Анимация текста (из MarketUI, адаптировано)
    renderTextParticle(ctx, particle, progress) {
        const easeInOut = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const y = particle.y - easeInOut * 60;
        
        let alpha;
        if (progress < 0.2) {
            alpha = progress / 0.2;
        } else if (progress > 0.7) {
            alpha = (1 - progress) / 0.3;
        } else {
            alpha = 1;
        }
        
        const scale = progress < 0.3 ? 0.8 + (progress / 0.3) * 0.2 : 1;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(particle.x, y);
        ctx.scale(scale, scale);
        
        // Тень для читаемости
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        
        // Определяем цвет в зависимости от текста
        let fillColor = '#4CAF50';
        let strokeColor = '#45a049';
        let hasCoin = false;
        let hasGem = false;
        
        if (particle.text.includes('🪙')) {
            fillColor = '#f1c40f';
            strokeColor = '#f39c12';
            hasCoin = true;
        } else if (particle.text.startsWith('+') && !particle.text.includes('💰')) {
            // Это гемы (текст начинается с + но без эмодзи монеты)
            fillColor = '#667eea';
            strokeColor = '#764ba2';
            hasGem = true;
            hasGem = true;
        }
        
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
        ctx.font = fontManager.getFont(32);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Убираем эмодзи из текста
        const textWithoutEmoji = particle.text.replace(/🪙|💎/g, '');
        
        // Обводка
        ctx.strokeText(textWithoutEmoji, 0, 0);
        // Заливка
        ctx.fillText(textWithoutEmoji, 0, 0);
        
        // Рисуем иконку монеты если есть
        if (hasCoin) {
            const textWidth = ctx.measureText(textWithoutEmoji).width;
            assetManager.drawCoinIcon(ctx, textWidth / 2 + 18, 0, 28);
        }
        
        // Рисуем иконку гема если есть
        if (hasGem) {
            const textWidth = ctx.measureText(textWithoutEmoji).width;
            assetManager.drawGemIcon(ctx, textWidth / 2 + 18, 0, 28);
        }
        
        ctx.restore();
    }

    skipDay() {
        if (!window.questSystem) return;
        
        const result = window.questSystem.skipDay();
        
        if (result.success) {
            this.loadQuests();
            
            if (window.updateCurrencyDisplay) {
                window.updateCurrencyDisplay();
            }
            
            console.log(result.message);
        } else {
            console.log('Ошибка пропуска дня:', result.message);
        }
    }

    skipWeek() {
        if (!window.questSystem) return;
        
        const result = window.questSystem.skipWeek();
        
        if (result.success) {
            this.loadQuests();
            
            if (window.updateCurrencyDisplay) {
                window.updateCurrencyDisplay();
            }
            
            console.log(result.message);
        } else {
            console.log('Ошибка пропуска недели:', result.message);
        }
    }

    startTimer() {
        this.stopTimer();
        this.updateInterval = setInterval(() => {
            if (this.visible) {
                window.questSystem?.checkAndResetQuests();
                this.loadQuests();
            }
        }, 60000); // Обновляем каждую минуту
    }

    stopTimer() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    getQuestIcon(quest) {
        if (quest.type === 'catch_fish') return '🎣';
        if (quest.type === 'find_rare_item') return '💎';
        if (quest.type === 'catch_monster') return '🐉';
        return '❓';
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

// Глобальный экземпляр (будет создан в main.js)
