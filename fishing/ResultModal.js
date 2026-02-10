// Полифилл для roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

// Модальное окно результата
class ResultModal {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.visible = false;
        this.animProgress = 0;
        
        this.fish = null;
        this.weight = 0;
        this.price = 0;
        this.xp = 0;
        this.xpRelease = 0;
        this.xpSell = 0;
        
        // Кнопки
        this.releaseButton = { x: 0, y: 0, width: 110, height: 50, hover: false };
        this.sellButton = { x: 0, y: 0, width: 110, height: 50, hover: false };
        this.storeButton = { x: 0, y: 0, width: 110, height: 50, hover: false };

        this.onRelease = null;
        this.onSell = null;
        this.onStore = null;
        
        // Загрузка изображений
        this.rmkImage = new Image();
        this.rmkImage.src = 'rmk.png';
        this.uipanImage = new Image();
        this.uipanImage.src = 'uipan.png';
    }
    
    show(fish, weight, premiumEffects = null) {
        this.visible = true;
        this.animProgress = 0;
        this.fish = fish;
        this.weight = weight;
        this.premiumEffects = premiumEffects;
        
        // Проверяем, это предмет или рыба
        const isJunk = fish.type === 'junk';
        
        // Получаем бонусы
        const priceBonus = premiumEffects ? premiumEffects.getPriceBonus() : 0;
        const xpBonus = premiumEffects ? premiumEffects.getXpBonus() : 0;
        
        if (isJunk) {
            // Для предметов - фиксированная цена с бонусом
            this.basePrice = fish.sellPrice;
            this.price = Math.round(this.basePrice * (1 + priceBonus));
            this.priceBonus = priceBonus;
            this.xp = 0; // Предметы не дают опыт
            this.xpRelease = 0;
            this.xpSell = 0;
            this.xpBonus = 0;
        } else {
            // Рассчитываем базовую цену на основе sellPrice из базы данных
            this.basePrice = Math.round(fish.sellPrice * (weight / ((fish.weightMin + fish.weightMax) / 2)));
            this.price = Math.round(this.basePrice * (1 + priceBonus));
            this.priceBonus = priceBonus;

            // Рассчитываем опыт
            this.xp = fish.xp || 0;
            const baseXpRelease = this.xp;
            const baseXpSell = Math.round(this.xp * 0.6);
            
            this.xpRelease = Math.round(baseXpRelease * (1 + xpBonus));
            this.xpSell = Math.round(baseXpSell * (1 + xpBonus));
            this.xpBonus = xpBonus;
        }

        this.updateButtonPositions();
    }
    
    hide() {
        this.visible = false;
        this.fish = null;
    }
    
    updateButtonPositions() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const modalWidth = 600;
        
        // Вычисляем количество строк в названии для определения высоты
        const ctx = this.ctx;
        ctx.font = fontManager.getFont(28);
        const maxWidth = modalWidth - 350 + 150 - 20;
        const fishName = this.fish ? this.fish.name : '';
        const nameLines = this.wrapText(ctx, fishName, maxWidth);
        const nameOffset = (nameLines.length - 1) * 30;
        
        // Динамическая высота окна
        const modalHeight = 320 + nameOffset;
        const modalX = w / 2 - modalWidth / 2;
        const modalY = h / 2 - modalHeight / 2;

        // Располагаем три кнопки в ряд
        const buttonSpacing = 20;
        const totalButtonWidth = 3 * this.releaseButton.width + 2 * buttonSpacing;
        const startX = modalX + (modalWidth - totalButtonWidth) / 2;

        this.releaseButton.x = startX;
        this.releaseButton.y = modalY + 250 + nameOffset;

        this.sellButton.x = startX + this.releaseButton.width + buttonSpacing;
        this.sellButton.y = modalY + 250 + nameOffset;

        this.storeButton.x = startX + 2 * (this.releaseButton.width + buttonSpacing);
        this.storeButton.y = modalY + 250 + nameOffset;
    }
    
    update(dt) {
        if (!this.visible) return;
        
        if (this.animProgress < 1) {
            this.animProgress += dt * 3;
            if (this.animProgress > 1) this.animProgress = 1;
        }
        
        this.updateButtonPositions();
    }
    
    render(ctx) {
        if (!this.visible) return;


        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Затемнение фона
        ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * this.animProgress})`;
        ctx.fillRect(0, 0, w, h);
        
        // Модальное окно - динамическая высота
        const modalWidth = 600;
        
        // Вычисляем количество строк в названии для определения высоты
        ctx.font = fontManager.getFont(28);
        const maxWidth = modalWidth - 350 + 150 - 20;
        const fishName = this.fish.name;
        const nameLines = this.wrapText(ctx, fishName, maxWidth);
        const nameOffset = (nameLines.length - 1) * 30;
        
        // Базовая высота + дополнительная высота для длинных названий
        const modalHeight = 320 + nameOffset;
        const modalX = w / 2 - modalWidth / 2;
        const modalY = h / 2 - modalHeight / 2;
        
        const scale = 0.5 + 0.5 * this.easeOutBack(this.animProgress);
        
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.scale(scale, scale);
        ctx.translate(-w / 2, -h / 2);
        
        // Тень
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;
        
        // Фон окна - rmk.png
        if (this.rmkImage.complete) {
            ctx.drawImage(this.rmkImage, modalX, modalY, modalWidth, modalHeight);
        } else {
            // Запасной вариант
            const bgGradient = ctx.createLinearGradient(modalX, modalY, modalX, modalY + modalHeight);
            bgGradient.addColorStop(0, '#2c3e50');
            bgGradient.addColorStop(1, '#1a252f');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
        }
        
        ctx.shadowColor = 'transparent';
        
        // Заголовок
        ctx.font = fontManager.getFont(32);
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        const titleText = L('catch_title', 'УЛОВ!');
        ctx.strokeText(titleText, w / 2, modalY + 45);
        ctx.fillStyle = '#f1c40f';
        ctx.fillText(titleText, w / 2, modalY + 45);
        
        // Левая часть - рыба/предмет
        const leftX = modalX + 150;
        
        // Рыба, монстр или предмет
        const isJunk = this.fish.type === 'junk';
        const isMonster = this.fish.type === 'monster';
        
        if (isJunk) {
            // Для предметов используем спрайт
            assetManager.drawImageOrEmoji(
                ctx, 'junk', this.fish.id,
                leftX, modalY + 150, 100,
                this.fish.emoji || '📦'
            );
        } else if (isMonster) {
            // Для монстров используем спрайт
            assetManager.drawImageOrEmoji(
                ctx, 'monster', this.fish.id,
                leftX, modalY + 150, 100,
                this.fish.emoji || '🐲'
            );
        } else {
            // Для рыбы используем спрайт (увеличено на 116% от оригинала)
            assetManager.drawImageOrEmoji(
                ctx, 'fish', this.fish.id,
                leftX, modalY + 150, 216,
                this.fish.emoji || '🐟'
            );
        }
        
        // Правая часть - информация
        const rightX = modalX + 350;
        
        // Название рыбы/монстра (с переводом)
        ctx.font = fontManager.getFont(28);
        ctx.textAlign = 'left';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        
        // Получаем переведенное название
        let displayName = this.fish.name;
        if (isJunk && window.localizationSystem) {
            displayName = window.localizationSystem.getJunkName(this.fish.id, this.fish.name);
        } else if (isMonster && window.localizationSystem) {
            displayName = window.localizationSystem.getMonsterName(this.fish.id, this.fish.name);
        } else if (!isJunk && !isMonster && window.localizationSystem) {
            displayName = window.localizationSystem.getFishName(this.fish.id, this.fish.name);
        }
        
        // Используем переведенное название для переноса строк
        const translatedNameLines = this.wrapText(ctx, displayName, maxWidth);
        
        // Используем уже вычисленные nameLines из начала render()
        let currentY = modalY + 90;
        translatedNameLines.forEach((line, index) => {
            ctx.strokeText(line, rightX, currentY);
            ctx.fillStyle = '#fff';
            ctx.fillText(line, rightX, currentY);
            if (index < translatedNameLines.length - 1) {
                currentY += 30; // Межстрочный интервал
            }
        });
        
        // Редкость
        const rarityColors = {
            'Common': '#95a5a6',
            'Uncommon': '#2ecc71',
            'Rare': '#3498db',
            'Epic': '#9b59b6',
            'Legendary': '#f39c12'
        };
        ctx.font = fontManager.getFont(18);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        const rarityText = L(`rarity_${this.fish.rarity}`, this.fish.rarity);
        ctx.strokeText(rarityText, rightX, modalY + 115 + nameOffset);
        ctx.fillStyle = rarityColors[this.fish.rarity] || '#95a5a6';
        ctx.fillText(rarityText, rightX, modalY + 115 + nameOffset);
        
        // Вес (только для рыбы)
        if (!isJunk) {
            ctx.font = fontManager.getFont(20, 'normal');
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            const weightText = `${L('catch_weight', 'Вес')}: ${this.weight.toFixed(2)} ${L('kg', 'кг')}`;
            ctx.strokeText(weightText, rightX, modalY + 145 + nameOffset);
            ctx.fillStyle = '#bdc3c7';
            ctx.fillText(weightText, rightX, modalY + 145 + nameOffset);
        } else {
            // Для предметов показываем категорию
            ctx.font = fontManager.getFont(20, 'normal');
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            // Получаем переведенную категорию
            const categoryName = window.localizationSystem 
                ? window.localizationSystem.getJunkCategory(this.fish.id, this.fish.category)
                : this.fish.category;
            const categoryText = `${L('catch_category', 'Категория')}: ${categoryName}`;
            ctx.strokeText(categoryText, rightX, modalY + 145 + nameOffset);
            ctx.fillStyle = '#bdc3c7';
            ctx.fillText(categoryText, rightX, modalY + 145 + nameOffset);
        }
        
        // Цена
        ctx.font = fontManager.getFont(22);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        const priceText = `${this.price} ${L('catch_coins', 'монет')}`;
        ctx.strokeText(priceText, rightX, modalY + 175 + nameOffset);
        ctx.fillStyle = '#2ecc71';
        ctx.fillText(priceText, rightX, modalY + 175 + nameOffset);
        
        // Показываем бонус к цене если есть (сдвинут правее еще на +20px)
        if (this.priceBonus > 0) {
            ctx.font = fontManager.getFont(14);
            const bonusText = `+${Math.round(this.priceBonus * 100)}%`;
            const bonusX = rightX + ctx.measureText(priceText).width + 55; // Увеличен отступ с 35 до 55 (+20px)
            ctx.strokeText(bonusText, bonusX, modalY + 175 + nameOffset);
            ctx.fillStyle = '#f1c40f';
            ctx.fillText(bonusText, bonusX, modalY + 175 + nameOffset);
        }
        
        // Опыт (только для рыбы)
        if (!isJunk) {
            ctx.font = fontManager.getFont(18);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            const releaseText = L('catch_release_xp', 'Отпустить: +{xp} XP').replace('{xp}', this.xpRelease);
            const sellText = L('catch_sell_xp', 'Продать: +{xp} XP').replace('{xp}', this.xpSell);
            ctx.strokeText(releaseText, rightX, modalY + 205 + nameOffset);
            ctx.fillStyle = '#3498db';
            ctx.fillText(releaseText, rightX, modalY + 205 + nameOffset);
            
            // Показываем бонус к опыту если есть (сдвинут правее еще на +20px)
            if (this.xpBonus > 0) {
                ctx.font = fontManager.getFont(12);
                const bonusText = `+${Math.round(this.xpBonus * 100)}%`;
                const bonusX = rightX + ctx.measureText(releaseText).width + 50; // Увеличен отступ с 30 до 50 (+20px)
                ctx.strokeText(bonusText, bonusX, modalY + 205 + nameOffset);
                ctx.fillStyle = '#f1c40f';
                ctx.fillText(bonusText, bonusX, modalY + 205 + nameOffset);
            }
            
            ctx.font = fontManager.getFont(18);
            ctx.strokeStyle = '#000';
            ctx.strokeText(sellText, rightX, modalY + 230 + nameOffset);
            ctx.fillStyle = '#3498db';
            ctx.fillText(sellText, rightX, modalY + 230 + nameOffset);
            
            // Показываем бонус к опыту если есть (сдвинут правее еще на +20px)
            if (this.xpBonus > 0) {
                ctx.font = fontManager.getFont(12);
                const bonusText = `+${Math.round(this.xpBonus * 100)}%`;
                const bonusX = rightX + ctx.measureText(sellText).width + 50; // Увеличен отступ с 30 до 50 (+20px)
                ctx.strokeText(bonusText, bonusX, modalY + 230 + nameOffset);
                ctx.fillStyle = '#f1c40f';
                ctx.fillText(bonusText, bonusX, modalY + 230 + nameOffset);
            }
        } else {
            // Для предметов - описание с переносом текста
            ctx.font = fontManager.getFont(18);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            const junkText = L('catch_junk_info', 'Предметы можно только продать');
            
            // Используем функцию переноса текста для описания предметов
            const maxDescWidth = modalWidth - rightX + modalX - 20; // Оставляем отступ справа
            const descLines = this.wrapText(ctx, junkText, maxDescWidth);
            
            let descY = modalY + 205 + nameOffset;
            descLines.forEach((line, index) => {
                ctx.strokeText(line, rightX, descY);
                ctx.fillStyle = '#95a5a6';
                ctx.fillText(line, rightX, descY);
                if (index < descLines.length - 1) {
                    descY += 22; // Межстрочный интервал для описания
                }
            });
        }
        
        ctx.restore();

        // Кнопки рисуем без трансформации анимации
        if (this.animProgress >= 1) {
            const isJunk = this.fish.type === 'junk';
            
            if (isJunk) {
                // Для предметов - только кнопка продажи по центру
                const centerBtn = {
                    x: w / 2 - this.sellButton.width / 2,
                    y: this.sellButton.y,
                    width: this.sellButton.width,
                    height: this.sellButton.height,
                    hover: this.sellButton.hover
                };
                this.renderButton(ctx, centerBtn, L('catch_sell', 'Продать'), '#2ecc71', '#27ae60');
            } else {
                // Для рыбы - все три кнопки
                this.renderButton(ctx, this.releaseButton, L('catch_release', 'Отпустить'), '#3498db', '#2980b9');
                this.renderButton(ctx, this.sellButton, L('catch_sell', 'Продать'), '#2ecc71', '#27ae60');
                this.renderButton(ctx, this.storeButton, L('catch_store', 'Забрать'), '#f39c12', '#e67e22');
            }
        }
    }
    
    renderButton(ctx, btn, text, color1, color2) {
        // Кнопка - uipan.png
        if (this.uipanImage.complete) {
            ctx.drawImage(this.uipanImage, btn.x, btn.y, btn.width, btn.height);
        } else {
            // Запасной вариант
            const gradient = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.height);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
        }

        ctx.font = fontManager.getFont(20);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(text, btn.x + btn.width / 2, btn.y + btn.height / 2);
        ctx.fillStyle = '#fff';
        ctx.fillText(text, btn.x + btn.width / 2, btn.y + btn.height / 2);
    }
    
    handleClick(x, y) {
        if (!this.visible || this.animProgress < 1) return false;
        
        const isJunk = this.fish.type === 'junk';
        
        if (isJunk) {
            // Для предметов - только кнопка продажи по центру
            const w = this.canvas.width;
            const centerBtn = {
                x: w / 2 - this.sellButton.width / 2,
                y: this.sellButton.y,
                width: this.sellButton.width,
                height: this.sellButton.height
            };
            
            if (this.isInsideButton(x, y, centerBtn)) {
                if (this.onSell) this.onSell(this.price, 0); // Предметы не дают XP
                this.hide();
                return true;
            }
        } else {
            // Для рыбы - все три кнопки
            // Проверка кнопки "Отпустить"
            if (this.isInsideButton(x, y, this.releaseButton)) {
                if (this.onRelease) this.onRelease(this.xpRelease);
                this.hide();
                return true;
            }
            
            // Проверка кнопки "Продать"
            if (this.isInsideButton(x, y, this.sellButton)) {
                if (this.onSell) this.onSell(this.price, this.xpSell);
                this.hide();
                return true;
            }

            // Проверка кнопки "Забрать"
            if (this.isInsideButton(x, y, this.storeButton)) {
                if (this.onStore) {
                    const result = this.onStore(this.fish, this.weight);
                    // Закрываем окно только если обработчик вернул true (успешно добавлено)
                    // Если вернул false или undefined, окно остается открытым
                    if (result !== false) {
                        this.hide();
                    }
                }
                return true;
            }
        }

        return false;
    }
    
    isInsideButton(x, y, btn) {
        return x >= btn.x && x <= btn.x + btn.width &&
               y >= btn.y && y <= btn.y + btn.height;
    }
    
    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    
    // Функция для переноса текста
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
}
