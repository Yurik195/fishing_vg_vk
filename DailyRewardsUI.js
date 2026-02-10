// UI для ежедневных наград
class DailyRewardsUI {
    constructor(canvas, rewardsSystem, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        this.rewardsSystem = rewardsSystem;
        
        this.visible = false;
        this.scrollOffset = 0;
        this.maxScroll = 0;
        
        // Кнопки
        this.closeButton = { x: 0, y: 0, size: 42 };
        this.claimButton = { x: 0, y: 0, width: 200, height: 60 };
        
        // Сетка наград
        this.rewardCards = [];
        this.hoveredCard = null;
        
        // Перетаскивание для скролла
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartScroll = 0;
        this.dragVelocity = 0;
        this.lastDragY = 0;
        this.lastDragTime = 0;
        
        // Анимация
        this.claimAnimation = null;
        this.claimAnimationTime = 0;
    }
    
    show() {
        this.visible = true;
        this.scrollOffset = 0;
        this.updateLayout();
    }
    
    hide() {
        this.visible = false;
        // Очищаем анимацию при закрытии окна
        this.claimAnimation = null;
        this.claimAnimationTime = 0;
    }
    
    updateLayout() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Кнопка закрытия (как в других окнах, в углу с отступом)
        this.closeButton.x = w - 75; // Сдвигаем ближе к углу
        this.closeButton.y = 45;
        
        // Кнопка получения награды
        this.claimButton.x = w / 2 - 100;
        this.claimButton.y = h - 100;
        
        // Сетка наград (6 колонок x 5 рядов = 30 дней)
        const cols = 6;
        const rows = 5;
        const cardWidth = 160;
        const cardHeight = 160; // Увеличена высота карточки для всех наград
        const spacing = 20;
        const startX = (w - (cardWidth * cols + spacing * (cols - 1))) / 2;
        const startY = 170; // Сдвинуто ниже, чтобы карточки не обрезались сверху
        
        this.rewardCards = [];
        const rewards = this.rewardsSystem.getAllRewards();
        
        for (let i = 0; i < 30; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            
            this.rewardCards.push({
                day: i + 1,
                x: startX + col * (cardWidth + spacing),
                y: startY + row * (cardHeight + spacing) - this.scrollOffset,
                width: cardWidth,
                height: cardHeight,
                reward: rewards[i],
                claimed: i < this.rewardsSystem.currentDay,
                current: i === this.rewardsSystem.currentDay && this.rewardsSystem.canClaimToday(),
                locked: i > this.rewardsSystem.currentDay
            });
        }
        
        // Максимальный скролл (увеличен для полного просмотра)
        const totalHeight = rows * (cardHeight + spacing) + spacing;
        this.maxScroll = Math.max(0, totalHeight - (h - 280));
    }
    
    handleClick(x, y) {
        if (!this.visible) return false;
        
        // Воспроизводим звук клика
        if (this.audioManager) this.audioManager.playClickSound();
        
        // Кнопка закрытия (круглая, увеличенная в 2 раза)
        const btn = this.closeButton;
        const distX = x - btn.x;
        const distY = y - btn.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        if (distance <= btn.size) {
            this.hide();
            return true;
        }
        
        // Кнопка получения награды
        if (this.rewardsSystem.canClaimToday() && 
            this.isPointInRect(x, y, this.claimButton)) {
            this.claimReward();
            return true;
        }
        
        // Начало драга в области карточек
        const w = this.canvas.width;
        const h = this.canvas.height;
        const panelX = 50;
        const panelY = 35;
        const panelWidth = w - 100;
        const panelHeight = h - 30;
        const listY = panelY + 110;
        const listHeight = panelHeight - 140;
        
        if (x >= panelX + 10 && x <= panelX + panelWidth - 10 &&
            y >= listY && y <= listY + listHeight) {
            this.isDragging = true;
            this.dragStartY = y;
            this.dragStartScroll = this.scrollOffset;
            this.lastDragY = y;
            this.lastDragTime = Date.now();
            this.dragVelocity = 0;
            return true;
        }
        
        return true;
    }
    
    handleMouseDown(x, y) {
        return this.handleClick(x, y);
    }
    
    handleMouseMove(x, y) {
        if (!this.visible) return;
        
        // Обработка перетаскивания
        if (this.isDragging) {
            const deltaY = this.dragStartY - y;
            this.scrollOffset = this.dragStartScroll + deltaY;
            this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, this.maxScroll));
            
            // Вычисляем скорость для инерции
            const now = Date.now();
            const timeDiff = now - this.lastDragTime;
            if (timeDiff > 0) {
                this.dragVelocity = (y - this.lastDragY) / timeDiff * -16;
            }
            this.lastDragY = y;
            this.lastDragTime = now;
            
            this.updateLayout();
            return;
        }
        
        // Обработка наведения
        this.hoveredCard = null;
        for (const card of this.rewardCards) {
            if (this.isPointInRect(x, y, card)) {
                this.hoveredCard = card;
                break;
            }
        }
    }
    
    handleMouseUp(x, y) {
        if (!this.visible) return;
        
        if (this.isDragging) {
            this.isDragging = false;
            
            // Если движение было минимальным, это клик
            const dragDistance = Math.abs(this.dragStartY - this.lastDragY);
            if (dragDistance < 5) {
                this.dragVelocity = 0;
            } else {
                // Применяем инерцию
                const now = Date.now();
                const timeDiff = now - this.lastDragTime;
                if (timeDiff < 100 && Math.abs(this.dragVelocity) > 1) {
                    this.applyInertia();
                }
            }
        }
    }
    
    handleWheel(deltaY) {
        if (!this.visible) return false;
        
        // Определяем устройство (ПК или мобильное)
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Прокрутка колесиком мыши - для ПК увеличиваем скорость в 10 раз
        const scrollSpeed = isMobile ? 30 : 300; // 30 для мобильных, 300 для ПК (в 10 раз быстрее)
        this.scrollOffset += deltaY * scrollSpeed / 100;
        this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, this.maxScroll));
        this.updateLayout();
        
        return true;
    }
    
    // Алиас для совместимости
    handleScroll(deltaY) {
        return this.handleWheel(deltaY);
    }
    
    applyInertia() {
        const friction = 0.95;
        const minVelocity = 0.5;
        
        const animate = () => {
            if (!this.visible || Math.abs(this.dragVelocity) < minVelocity) {
                this.dragVelocity = 0;
                return;
            }
            
            this.scrollOffset += this.dragVelocity;
            this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, this.maxScroll));
            this.dragVelocity *= friction;
            this.updateLayout();
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    claimReward() {
        const result = this.rewardsSystem.claimReward();
        
        if (result.success) {
            // Применяем награды
            this.applyReward(result.reward);
            
            // Запускаем анимацию
            this.claimAnimation = result.reward;
            this.claimAnimationTime = 0;
            
            // Обновляем UI
            this.updateLayout();
        }
    }
    
    applyReward(reward) {
        // Применяем награды к игроку
        if (reward.coins) {
            window.game.fishingGame.coins += reward.coins;
            // Регистрируем заработанные монеты в профиле
            if (window.game.profileSystem) {
                window.game.profileSystem.registerCoinsEarned(reward.coins);
            }
        }
        if (reward.gems) {
            window.game.fishingGame.premiumCoins += reward.gems;
            // Регистрируем заработанные марки в профиле
            if (window.game.profileSystem) {
                window.game.profileSystem.registerGemsEarned(reward.gems);
            }
        }
        if (reward.energyDrink) {
            // Добавляем энергетики в инвентарь бонусов
            const bonusInventory = window.game.fishingGame.bonusInventoryUI;
            if (bonusInventory && bonusInventory.inventory) {
                bonusInventory.inventory.energizer = (bonusInventory.inventory.energizer || 0) + reward.energyDrink;
                bonusInventory.saveInventory();
            }
        }
        if (reward.feedBonus) {
            // Добавляем подкормку (bait_booster)
            const bonusInventory = window.game.fishingGame.bonusInventoryUI;
            if (bonusInventory && bonusInventory.inventory) {
                bonusInventory.inventory.bait_booster = (bonusInventory.inventory.bait_booster || 0) + reward.feedBonus;
                bonusInventory.saveInventory();
            }
        }
        if (reward.blood) {
            // Добавляем кровь
            const bonusInventory = window.game.fishingGame.bonusInventoryUI;
            if (bonusInventory && bonusInventory.inventory) {
                bonusInventory.inventory.blood = (bonusInventory.inventory.blood || 0) + reward.blood;
                bonusInventory.saveInventory();
            }
        }
        if (reward.repairKit) {
            // Добавляем ремонтный набор
            const bonusInventory = window.game.fishingGame.bonusInventoryUI;
            if (bonusInventory && bonusInventory.inventory) {
                bonusInventory.inventory.repair_kit = (bonusInventory.inventory.repair_kit || 0) + reward.repairKit;
                bonusInventory.saveInventory();
            }
        }
        if (reward.jubileeCoin) {
            // Добавляем юбилейную монету (lucky_coin)
            const bonusInventory = window.game.fishingGame.bonusInventoryUI;
            if (bonusInventory && bonusInventory.inventory) {
                bonusInventory.inventory.lucky_coin = (bonusInventory.inventory.lucky_coin || 0) + reward.jubileeCoin;
                bonusInventory.saveInventory();
            }
        }
        if (reward.gear) {
            // Добавляем снасть в инвентарь через правильный метод
            const inventory = window.game.fishingGame.gearInventory;
            const gearType = reward.gear.type;
            const tier = reward.gear.tier;
            
            if (inventory && inventory.addGear) {
                inventory.addGear(gearType, tier);
            }
        }
        if (reward.bait) {
            // Добавляем наживку
            const inventory = window.game.fishingGame.gearInventory;
            if (inventory && inventory.addBait) {
                const baitId = reward.bait.id;
                const count = reward.bait.count || 1;
                inventory.addBait(baitId, count);
            }
        }
        
        // Сохраняем изменения
        if (window.game.fishingGame.gearInventory) {
            window.game.fishingGame.gearInventory.saveToStorage();
        }
    }
    
    update(dt) {
        if (!this.visible) return;
        
        // Анимация получения награды
        if (this.claimAnimation) {
            this.claimAnimationTime += dt;
            if (this.claimAnimationTime > 2000) { // 2 секунды: 1.5 сек анимация + 0.5 сек исчезновение
                this.claimAnimation = null;
                this.claimAnimationTime = 0;
            }
        }
    }
    
    render() {
        if (!this.visible) return;
        
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Затемнение фона
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);
        
        // Панель (увеличена высота на 70 пикселей, сдвинута выше на 15 пикселей)
        const panelWidth = w - 100;
        const panelHeight = h - 30; // Было h - 60, стало h - 30 (+30px)
        const panelX = 50;
        const panelY = 35; // Было 50, стало 35 (-15px)
        
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
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
            
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 3;
            ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        }
        
        ctx.restore();
        
        // Заголовок (убран смайлик подарка)
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(36);
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(L('daily_rewards', 'Ежедневные награды'), w / 2, panelY + 20);
        fontManager.applyLetterSpacing(ctx, false);
        
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
        const coinsX = panelX + panelWidth - 80; // Сдвинуто левее на 30px
        const coinsY = panelY + 35;
        
        // Рисуем текст монет: белый текст с черной обводкой
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${coins}`, coinsX, coinsY);
        ctx.fillStyle = '#fff';
        ctx.fillText(`${coins}`, coinsX, coinsY);
        
        // Рисуем иконку монет слева от текста (опущена на 3px)
        const coinImage = assetManager.getImage('sereb.png');
        if (coinImage) {
            const textWidth = ctx.measureText(`${coins}`).width;
            ctx.drawImage(coinImage, coinsX - textWidth - iconSize - iconTextGap, coinsY - iconSize / 2 + 3, iconSize, iconSize);
        }
        
        // Премиум валюта со спрайтом mark.png
        const gemsX = panelX + panelWidth - 220; // Сдвинуто левее на 30px
        const gemsY = panelY + 35;
        
        // Рисуем текст гемов: золотой текст с черной обводкой
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${gems}`, gemsX, gemsY);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`${gems}`, gemsX, gemsY);
        
        // Рисуем иконку гемов слева от текста (опущена на 3px)
        const gemImage = assetManager.getImage('mark.png');
        if (gemImage) {
            const textWidth = ctx.measureText(`${gems}`).width;
            ctx.drawImage(gemImage, gemsX - textWidth - iconSize - iconTextGap, gemsY - iconSize / 2 + 3, iconSize, iconSize);
        }
        
        ctx.restore();
        
        // Информация о прогрессе (увеличен размер текста на 10%)
        ctx.font = fontManager.getFont(20); // Было 18, стало 20 (+10%)
        const currentDay = this.rewardsSystem.getCurrentDisplayDay();
        const canClaim = this.rewardsSystem.canClaimToday();
        const statusText = canClaim ? 
            `${L('day', 'День')} ${currentDay} - ${L('reward_available', 'Награда доступна!')}` : 
            `${L('day', 'День')} ${currentDay} - ${L('come_back_tomorrow', 'Приходите завтра!')}`;
        ctx.fillText(statusText, w / 2, panelY + 70);
        
        // Предупреждение о сбросе прогресса (увеличен размер текста)
        ctx.font = fontManager.getFont(18); // Было 14, стало 18
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText(L('miss_day_warning', '⚠️ Пропустите один день - прогресс сбросится!'), w / 2, panelY + 95);
        ctx.fillStyle = '#fff';
        
        // Область для карточек с обрезкой (максимально увеличена область просмотра)
        ctx.save();
        ctx.beginPath();
        ctx.rect(panelX + 10, panelY + 110, panelWidth - 20, panelHeight - 140);
        ctx.clip();
        
        // Рисуем карточки наград
        this.rewardCards.forEach(card => {
            this.renderRewardCard(ctx, card);
        });
        
        ctx.restore();
        
        // Кнопка получения награды
        if (canClaim) {
            this.renderClaimButton(ctx);
        }
        
        // Кнопка закрытия
        this.renderCloseButton(ctx);
        
        // Анимация получения награды
        if (this.claimAnimation) {
            this.renderClaimAnimation(ctx);
        }
    }
    
    renderRewardCard(ctx, card) {
        const isHovered = this.hoveredCard === card && !this.isDragging;
        const scale = isHovered ? 1.03 : 1;
        
        ctx.save();
        ctx.translate(card.x + card.width / 2, card.y + card.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-card.width / 2, -card.height / 2);
        
        // Тень
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = isHovered ? 15 : 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = isHovered ? 6 : 3;
        
        // Используем спрайт nag.png как фон карточки
        const nagImage = assetManager.getImage('nag.png');
        if (nagImage) {
            // Рисуем фон используя nag.png
            ctx.drawImage(nagImage, 0, 0, card.width, card.height);
            
            // Добавляем цветовой оверлей в зависимости от статуса
            ctx.globalCompositeOperation = 'multiply';
            if (card.claimed) {
                ctx.fillStyle = '#27ae60';
            } else if (card.current) {
                ctx.fillStyle = '#f39c12';
            } else if (card.locked) {
                ctx.fillStyle = '#95a5a6';
            } else {
                ctx.fillStyle = '#ffffff';
            }
            ctx.fillRect(0, 0, card.width, card.height);
            ctx.globalCompositeOperation = 'source-over';
        } else {
            // Fallback - градиентный фон если изображение не загружено
            const gradient = ctx.createLinearGradient(0, 0, 0, card.height);
            if (card.claimed) {
                gradient.addColorStop(0, '#27ae60');
                gradient.addColorStop(1, '#1e8449');
            } else if (card.current) {
                gradient.addColorStop(0, '#f39c12');
                gradient.addColorStop(1, '#d68910');
            } else if (card.locked) {
                gradient.addColorStop(0, '#95a5a6');
                gradient.addColorStop(1, '#7f8c8d');
            }
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(0, 0, card.width, card.height, 12);
            ctx.fill();
        }
        
        // Убираем обводку - комментируем код обводки
        /*
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = isHovered ? '#fff' : 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.beginPath();
        ctx.roundRect(0, 0, card.width, card.height, 12);
        ctx.stroke();
        */
        
        // День (поднят выше на 5 пикселей)
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(22, 'bold');
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        const dayText = `${L('day', 'День')} ${card.day}`;
        ctx.strokeText(dayText, card.width / 2, 15); // Поднято с 20 до 15 (-5px)
        ctx.fillText(dayText, card.width / 2, 15);
        fontManager.applyLetterSpacing(ctx, false);
        
        // Награды (для последнего дня - в 2 столбика)
        ctx.font = fontManager.getFont(16);
        let yOffset = 50; // Сдвинуто ниже с 45 до 50
        const lineHeight = 22;
        
        // Проверяем, это ли последний день (30-й)
        const isLastDay = card.day === 30;
        let leftColumnY = yOffset;
        let rightColumnY = yOffset;
        let rewardIndex = 0;
        
        const rewards = [];
        if (card.reward.coins) {
            // Для монет используем специальный формат
            rewards.push({ type: 'coin', value: card.reward.coins });
        }
        if (card.reward.gems) {
            rewards.push({ type: 'gem', value: card.reward.gems });
        }
        if (card.reward.energyDrink) {
            rewards.push({ type: 'sprite', sprite: 'p1.png', text: `x${card.reward.energyDrink}` });
        }
        if (card.reward.feedBonus) {
            rewards.push({ type: 'sprite', sprite: 'p2.png', text: `x${card.reward.feedBonus}` });
        }
        if (card.reward.gear) {
            ctx.font = fontManager.getFont(14);
            // Определяем спрайт снасти
            let gearSprite = null;
            if (card.reward.gear.type === 'rod') {
                gearSprite = `u${card.reward.gear.tier}.png`;
            } else if (card.reward.gear.type === 'hook') {
                gearSprite = `k_${card.reward.gear.tier}.png`;
            } else if (card.reward.gear.type === 'line') {
                gearSprite = `l_${card.reward.gear.tier}.png`;
            } else if (card.reward.gear.type === 'float') {
                gearSprite = `float_${String(card.reward.gear.tier).padStart(2, '0')}.png`;
            } else if (card.reward.gear.type === 'reel') {
                gearSprite = `katush.png`; // Катушка использует один спрайт
            }
            // Получаем локализованное название снасти
            const gearName = window.localizationSystem ? 
                window.localizationSystem.t(`gear_${card.reward.gear.type}_${card.reward.gear.tier}_name`, card.reward.gear.name) : 
                card.reward.gear.name;
            rewards.push({ type: 'sprite', sprite: gearSprite, text: gearName });
            ctx.font = fontManager.getFont(16);
        }
        if (card.reward.bait) {
            ctx.font = fontManager.getFont(14);
            const baitSprite = `n${card.reward.bait.id}.png`;
            rewards.push({ type: 'sprite', sprite: baitSprite, text: `x${card.reward.bait.count}` });
            ctx.font = fontManager.getFont(16);
        }
        if (card.reward.blood) {
            rewards.push({ type: 'sprite', sprite: 'p4.png', text: `x${card.reward.blood}` });
        }
        if (card.reward.repairKit) {
            ctx.font = fontManager.getFont(14);
            rewards.push({ type: 'sprite', sprite: 'p11.png', text: L('daily_reward_repair_kit', 'Рем.набор') });
            ctx.font = fontManager.getFont(16);
        }
        
        // Определяем размер спрайтов в зависимости от количества наград
        // Если наград мало (1-2) - делаем спрайты больше (32px)
        // Если наград средне (3-4) - средний размер (28px)
        // Если наград много (5+) - стандартный размер (24px)
        const spriteSize = rewards.length <= 2 ? 32 : (rewards.length <= 4 ? 28 : 24);
        
        if (isLastDay && rewards.length > 3) {
            // Для последнего дня - размещаем в 2 столбика
            rewards.forEach((reward, index) => {
                if (index % 2 === 0) {
                    // Левый столбец
                    ctx.textAlign = 'left';
                    if (typeof reward === 'object' && reward.type === 'coin') {
                        // Рисуем иконку монеты (уменьшен размер с 24 до 19)
                        assetManager.drawCoinIcon(ctx, 20, leftColumnY, 19);
                        ctx.fillText(`${reward.value}`, 43, leftColumnY);
                    } else if (typeof reward === 'object' && reward.type === 'gem') {
                        // Рисуем иконку гема (уменьшен размер с 24 до 19)
                        assetManager.drawGemIcon(ctx, 20, leftColumnY, 19);
                        ctx.fillText(`${reward.value}`, 43, leftColumnY);
                    } else if (typeof reward === 'object' && reward.type === 'sprite') {
                        // Рисуем спрайт предмета (динамический размер)
                        const sprite = assetManager.getImage(reward.sprite);
                        if (sprite) {
                            const offset = spriteSize / 2;
                            ctx.drawImage(sprite, 10, leftColumnY - offset, spriteSize, spriteSize);
                            ctx.fillText(reward.text, 10 + spriteSize + 4, leftColumnY);
                        } else {
                            ctx.fillText(reward.text, 10, leftColumnY);
                        }
                    } else {
                        ctx.fillText(reward, 10, leftColumnY);
                    }
                    leftColumnY += lineHeight;
                } else {
                    // Правый столбец
                    ctx.textAlign = 'right';
                    if (typeof reward === 'object' && reward.type === 'coin') {
                        // Рисуем текст и иконку монеты (уменьшен размер с 24 до 19)
                        ctx.fillText(`${reward.value}`, card.width - 33, rightColumnY);
                        assetManager.drawCoinIcon(ctx, card.width - 10, rightColumnY, 19);
                    } else if (typeof reward === 'object' && reward.type === 'gem') {
                        // Рисуем текст и иконку гема (уменьшен размер с 24 до 19)
                        ctx.fillText(`${reward.value}`, card.width - 33, rightColumnY);
                        assetManager.drawGemIcon(ctx, card.width - 10, rightColumnY, 19);
                    } else if (typeof reward === 'object' && reward.type === 'sprite') {
                        // Рисуем спрайт предмета (динамический размер)
                        const sprite = assetManager.getImage(reward.sprite);
                        if (sprite) {
                            const offset = spriteSize / 2;
                            ctx.fillText(reward.text, card.width - spriteSize - 14, rightColumnY);
                            ctx.drawImage(sprite, card.width - spriteSize - 10, rightColumnY - offset, spriteSize, spriteSize);
                        } else {
                            ctx.fillText(reward.text, card.width - 10, rightColumnY);
                        }
                    } else {
                        ctx.fillText(reward, card.width - 10, rightColumnY);
                    }
                    rightColumnY += lineHeight;
                }
            });
        } else {
            // Обычное размещение по центру
            ctx.textAlign = 'center';
            rewards.forEach(reward => {
                if (typeof reward === 'object' && reward.type === 'coin') {
                    // Рисуем иконку монеты и текст (уменьшен размер с 24 до 19)
                    const textWidth = ctx.measureText(`${reward.value}`).width;
                    ctx.fillText(`${reward.value}`, card.width / 2 - 12, yOffset);
                    assetManager.drawCoinIcon(ctx, card.width / 2 + textWidth / 2 + 5, yOffset, 19);
                } else if (typeof reward === 'object' && reward.type === 'gem') {
                    // Рисуем иконку гема и текст (уменьшен размер с 24 до 19)
                    const textWidth = ctx.measureText(`${reward.value}`).width;
                    ctx.fillText(`${reward.value}`, card.width / 2 - 12, yOffset);
                    assetManager.drawGemIcon(ctx, card.width / 2 + textWidth / 2 + 5, yOffset, 19);
                } else if (typeof reward === 'object' && reward.type === 'sprite') {
                    // Рисуем спрайт предмета по центру (динамический размер)
                    const sprite = assetManager.getImage(reward.sprite);
                    if (sprite) {
                        const textWidth = ctx.measureText(reward.text).width;
                        const offset = spriteSize / 2;
                        ctx.drawImage(sprite, card.width / 2 - textWidth / 2 - spriteSize - 4, yOffset - offset, spriteSize, spriteSize);
                        ctx.fillText(reward.text, card.width / 2, yOffset);
                    } else {
                        ctx.fillText(reward.text, card.width / 2, yOffset);
                    }
                } else {
                    ctx.fillText(reward, card.width / 2, yOffset);
                }
                yOffset += lineHeight;
            });
        }
        
        // Статус
        if (card.claimed) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath();
            ctx.roundRect(0, 0, card.width, card.height, 12);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = fontManager.getFont(20, 'bold');
            ctx.textAlign = 'center';
            ctx.fillText('✓', card.width / 2, card.height / 2);
        } else if (card.current) {
            // Пульсация для текущего дня
            const pulse = 1 + Math.sin(Date.now() / 400) * 0.15;
            ctx.save();
            ctx.globalAlpha = pulse * 0.3;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.roundRect(0, 0, card.width, card.height, 12);
            ctx.fill();
            ctx.restore();
        }
        
        ctx.restore();
    }
    
    renderClaimButton(ctx) {
        const btn = this.claimButton;
        
        // Пульсация
        const pulse = 1 + Math.sin(Date.now() / 300) * 0.1;
        
        ctx.save();
        ctx.translate(btn.x + btn.width / 2, btn.y + btn.height / 2);
        ctx.scale(pulse, pulse);
        ctx.translate(-btn.width / 2, -btn.height / 2);
        
        // Используем uipan.png как фон кнопки
        const uipanImage = assetManager.getImage('uipan.png');
        if (uipanImage) {
            ctx.drawImage(uipanImage, 0, 0, btn.width, btn.height);
        } else {
            // Fallback - градиент если спрайт не загружен
            const gradient = ctx.createLinearGradient(0, 0, 0, btn.height);
            gradient.addColorStop(0, '#27ae60');
            gradient.addColorStop(1, '#229954');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, btn.width, btn.height);
            
            // Обводка
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 0, btn.width, btn.height);
        }
        
        // Текст
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(22, 'bold');
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L('claim_reward', 'Получить!'), btn.width / 2, btn.height / 2);
        fontManager.applyLetterSpacing(ctx, false);
        
        ctx.restore();
    }
    
    renderCloseButton(ctx) {
        const btn = this.closeButton;
        
        ctx.save();
        ctx.globalAlpha = 0.9; // 90% прозрачность
        
        // Используем спрайт zak.png (увеличен в 2 раза)
        const zakImage = assetManager.getImage('zak.png');
        if (zakImage) {
            const size = btn.size * 2; // Увеличиваем в 2 раза
            ctx.drawImage(zakImage, btn.x - size/2, btn.y - size/2, size, size);
        } else {
            // Fallback - обычный крестик если спрайт не загружен
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;
            
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(btn.x, btn.y, btn.size, 0, Math.PI * 2); // Увеличиваем радиус в 2 раза
            ctx.fill();
            
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            
            const crossSize = btn.size * 0.7; // Увеличиваем размер крестика
            ctx.beginPath();
            ctx.moveTo(btn.x - crossSize, btn.y - crossSize);
            ctx.lineTo(btn.x + crossSize, btn.y + crossSize);
            ctx.moveTo(btn.x + crossSize, btn.y - crossSize);
            ctx.lineTo(btn.x - crossSize, btn.y + crossSize);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    renderClaimAnimation(ctx) {
        if (!this.claimAnimation) return;
        
        const totalDuration = 2000; // Общая длительность: 1500ms движение + 500ms исчезновение
        const moveDuration = 1500; // Длительность движения
        const fadeDuration = 500; // Длительность исчезновения
        
        const progress = Math.min(this.claimAnimationTime / totalDuration, 1);
        const moveProgress = Math.min(this.claimAnimationTime / moveDuration, 1);
        
        const easeOut = 1 - Math.pow(1 - moveProgress, 3);
        
        ctx.save();
        
        // Позиция анимации - от центра кнопки к правому верхнему углу (баланс)
        const startX = this.claimButton.x + this.claimButton.width / 2;
        const startY = this.claimButton.y + this.claimButton.height / 2;
        const endX = this.canvas.width - 100;
        const endY = 50;
        
        const currentX = startX + (endX - startX) * easeOut;
        const currentY = startY + (endY - startY) * easeOut - Math.sin(moveProgress * Math.PI) * 80;
        
        // Прозрачность - плавное исчезновение в конце
        let alpha = 1;
        if (this.claimAnimationTime > moveDuration) {
            // Фаза исчезновения
            const fadeProgress = (this.claimAnimationTime - moveDuration) / fadeDuration;
            alpha = 1 - fadeProgress;
        }
        ctx.globalAlpha = alpha;
        
        // Масштаб
        const scale = 1 + moveProgress * 0.8;
        
        // Формируем текст награды
        const reward = this.claimAnimation;
        let rewardText = '';
        let hasCoin = false;
        let hasGem = false;
        let hasEnergyDrink = false;
        if (reward.coins) {
            rewardText += `+${reward.coins} `;
            hasCoin = true;
        }
        if (reward.gems) {
            rewardText += `+${reward.gems} `;
            hasGem = true;
        }
        if (reward.energyDrink) {
            rewardText += `+${reward.energyDrink} `;
            hasEnergyDrink = true;
        }
        
        // Текст с наградой
        ctx.fillStyle = '#f1c40f';
        ctx.font = fontManager.getFont(Math.floor(36 * scale), 'bold');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textWithoutEmoji = rewardText.trim();
        
        // Черная обводка для лучшей читаемости
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(textWithoutEmoji, currentX, currentY);
        ctx.fillText(textWithoutEmoji, currentX, currentY);
        
        // Рисуем иконки справа от текста
        const textWidth = ctx.measureText(textWithoutEmoji).width;
        let iconOffset = currentX + textWidth / 2 + 20;
        
        if (hasCoin) {
            assetManager.drawCoinIcon(ctx, iconOffset, currentY, 36 * scale);
            iconOffset += 40 * scale;
        }
        
        if (hasGem) {
            assetManager.drawGemIcon(ctx, iconOffset, currentY, 36 * scale);
            iconOffset += 40 * scale;
        }
        
        if (hasEnergyDrink) {
            const energySprite = assetManager.getImage('p1.png');
            if (energySprite) {
                ctx.drawImage(energySprite, iconOffset - 18 * scale, currentY - 18 * scale, 36 * scale, 36 * scale);
            }
        }
        
        // Эффект свечения
        ctx.shadowColor = '#f1c40f';
        ctx.shadowBlur = 30 * alpha;
        ctx.fillText(textWithoutEmoji, currentX, currentY);
        
        // Рисуем иконки с эффектом свечения
        iconOffset = currentX + textWidth / 2 + 20;
        if (hasCoin) {
            assetManager.drawCoinIcon(ctx, iconOffset, currentY, 36 * scale);
            iconOffset += 40 * scale;
        }
        if (hasGem) {
            assetManager.drawGemIcon(ctx, iconOffset, currentY, 36 * scale);
            iconOffset += 40 * scale;
        }
        if (hasEnergyDrink) {
            const energySprite = assetManager.getImage('p1.png');
            if (energySprite) {
                ctx.drawImage(energySprite, iconOffset - 18 * scale, currentY - 18 * scale, 36 * scale, 36 * scale);
            }
        }
        
        // Добавляем несколько летящих частиц
        for (let i = 0; i < 8; i++) {
            const particleProgress = Math.min((moveProgress - i * 0.1) * 1.5, 1);
            if (particleProgress <= 0) continue;
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = particleProgress * 100;
            const particleX = currentX + Math.cos(angle) * distance;
            const particleY = currentY + Math.sin(angle) * distance;
            const particleAlpha = (1 - particleProgress) * alpha;
            
            ctx.save();
            ctx.globalAlpha = particleAlpha;
            ctx.fillStyle = i % 2 === 0 ? '#FFD700' : '#27ae60';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(particleX, particleY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        ctx.restore();
    }
    
    // Easing функции для плавной анимации
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    easeInCubic(t) {
        return t * t * t;
    }
    
    easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
    
    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }
}
