// UI компонент для отображения садка с рыбой
class FishStorageUI {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.targetVisible = false;
        this.animProgress = 0;

        // Позиция и размеры окна
        this.x = 0;
        this.y = 0;
        this.width = 450;
        this.height = 400;

        // Кнопки массовых действий
        this.releaseAllButton = { x: 0, y: 0, width: 200, height: 50, hover: false };
        this.sellAllButton = { x: 0, y: 0, width: 200, height: 50, hover: false };

        this.onReleaseAll = null;
        this.onSellAll = null;

        // Модальное окно с деталями рыбы
        this.fishDetailModal = {
            visible: false,
            animProgress: 0,
            selectedFish: null
        };

        this.updatePosition();
    }

    updatePosition() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Размещаем в центре экрана
        this.x = (w - this.width) / 2;
        this.y = (h - this.height) / 2;

        // Позиции кнопок внизу окна
        const buttonSpacing = 10;
        const buttonY = this.y + this.height - 60;

        this.releaseAllButton.x = this.x + 20;
        this.releaseAllButton.y = buttonY;

        this.sellAllButton.x = this.x + this.width - this.sellAllButton.width - 20;
        this.sellAllButton.y = buttonY;
    }

    show() {
        this.targetVisible = true;
        this.animProgress = 0; // Сбрасываем анимацию для корректного открытия
    }

    hide() {
        this.targetVisible = false;
    }

    toggle() {
        if (this.targetVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    handleClick(x, y, storedFish) {
        // Воспроизводим звук клика
        if (this.audioManager) this.audioManager.playClickSound();
        
        // Если открыто модальное окно с деталями рыбы
        if (this.fishDetailModal.visible) {
            return this.handleFishDetailClick(x, y);
        }

        const closeButtonSize = 60; // Увеличиваем в 2 раза
        const closeX = this.x + this.width - closeButtonSize - 10; // Ближе к углу
        const closeY = this.y + 10;

        // Проверка клика на кнопке закрытия (увеличенная область)
        if (x >= closeX && x <= closeX + closeButtonSize &&
            y >= closeY && y <= closeY + closeButtonSize) {
            this.hide();
            return true;
        }

        // Проверка кнопки "Отпустить всех"
        if (this.isInsideButton(x, y, this.releaseAllButton) && storedFish && storedFish.length > 0) {
            if (this.onReleaseAll) this.onReleaseAll();
            return true;
        }

        // Проверка кнопки "Продать всех"
        if (this.isInsideButton(x, y, this.sellAllButton) && storedFish && storedFish.length > 0) {
            if (this.onSellAll) this.onSellAll();
            return true;
        }

        // Проверка клика на рыбу в списке
        const fishClicked = this.getFishAtPosition(x, y, storedFish);
        if (fishClicked) {
            this.showFishDetail(fishClicked);
            return true;
        }

        // Проверка клика вне окна
        if (x < this.x || x > this.x + this.width ||
            y < this.y || y > this.y + this.height) {
            this.hide();
            return true;
        }

        // Клик внутри окна - не закрываем, но клик обработан
        return true;
    }

    isInsideButton(x, y, btn) {
        return x >= btn.x && x <= btn.x + btn.width &&
               y >= btn.y && y <= btn.y + btn.height;
    }

    update(dt) {
        // Анимируем к целевому состоянию
        const targetProgress = this.targetVisible ? 1 : 0;
        const diff = targetProgress - this.animProgress;

        if (Math.abs(diff) > 0.01) {
            this.animProgress += diff * dt * 4;
            // Ограничиваем диапазон
            this.animProgress = Math.max(0, Math.min(1, this.animProgress));
        } else {
            // Когда анимация завершена, устанавливаем точное значение
            this.animProgress = targetProgress;
        }

        // Анимация модального окна деталей рыбы
        const targetModalProgress = this.fishDetailModal.visible ? 1 : 0;
        const modalDiff = targetModalProgress - this.fishDetailModal.animProgress;

        if (Math.abs(modalDiff) > 0.01) {
            this.fishDetailModal.animProgress += modalDiff * dt * 6;
            this.fishDetailModal.animProgress = Math.max(0, Math.min(1, this.fishDetailModal.animProgress));
        } else {
            this.fishDetailModal.animProgress = targetModalProgress;
        }

        this.updatePosition();
    }

    render(ctx, storedFish, capacity) {
        if (!this.targetVisible) return;

        const progress = this.easeOutBack(this.animProgress);

        ctx.save();

        // Анимация открытия - масштабирование снизу вверх
        const scale = progress;
        ctx.translate(this.x + this.width / 2, this.y + this.height);
        ctx.scale(1, scale);
        ctx.translate(-this.x - this.width / 2, -this.y - this.height);

        // Тень
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 8;

        // Рисуем фон рамки используя rmk.png
        const rmkImage = assetManager.getImage('rmk.png');
        if (rmkImage) {
            // Используем изображение rmk.png как фон рамки
            ctx.drawImage(
                rmkImage,
                this.x, this.y,
                this.width, this.height
            );
        } else {
            // Fallback - градиентный фон если изображение не загружено
            const bgGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            bgGradient.addColorStop(0, '#4a5568');
            bgGradient.addColorStop(0.5, '#2d3748');
            bgGradient.addColorStop(1, '#1a202c');

            const radius = 15;
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.width, this.height, radius);
            ctx.fillStyle = bgGradient;
            ctx.fill();

            const borderGradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
            borderGradient.addColorStop(0, '#f1c40f');
            borderGradient.addColorStop(0.5, '#f39c12');
            borderGradient.addColorStop(1, '#e67e22');

            ctx.strokeStyle = borderGradient;
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        ctx.shadowColor = 'transparent';

        // Кнопка закрытия (увеличенная в 2 раза, в углу)
        const closeButtonSize = 60; // Увеличиваем в 2 раза
        const closeX = this.x + this.width - closeButtonSize - 10; // Ближе к углу
        const closeY = this.y + 10;

        ctx.save();
        ctx.globalAlpha = 0.9; // 90% прозрачность
        
        // Используем спрайт zak.png
        const zakImage = assetManager.getImage('zak.png');
        if (zakImage) {
            ctx.drawImage(zakImage, closeX, closeY, closeButtonSize, closeButtonSize);
        } else {
            // Fallback - обычный крестик если спрайт не загружен
            ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
            ctx.beginPath();
            ctx.roundRect(closeX, closeY, closeButtonSize, closeButtonSize, 5);
            ctx.fill();
            
            ctx.strokeStyle = '#c0392b';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(closeX + 16, closeY + 16); // Увеличиваем отступы
            ctx.lineTo(closeX + closeButtonSize - 16, closeY + closeButtonSize - 16);
            ctx.moveTo(closeX + closeButtonSize - 16, closeY + 16);
            ctx.lineTo(closeX + 16, closeY + closeButtonSize - 16);
            ctx.stroke();
        }
        
        ctx.restore();

        // Заголовок
        ctx.fillStyle = '#f1c40f';
        ctx.font = fontManager.getFont(22);
        ctx.textAlign = 'center';
        ctx.fillText(L('keepnet_icon', 'Садок'), this.x + this.width / 2, this.y + 35);

        // Информация о вместимости
        const currentWeight = storedFish.reduce((sum, fish) => sum + fish.caughtWeight, 0);
        const fillRatio = currentWeight / capacity;

        // Цвет в зависимости от заполненности
        let capacityColor = '#2ecc71'; // Зеленый
        if (fillRatio > 0.8) capacityColor = '#e74c3c'; // Красный
        else if (fillRatio > 0.6) capacityColor = '#f1c40f'; // Желтый

        ctx.fillStyle = capacityColor;
        ctx.font = fontManager.getFont(16);
        ctx.fillText(`${currentWeight.toFixed(1)} / ${capacity} ${L('kg', 'кг')}`, this.x + this.width / 2, this.y + 65);

        // Индикатор заполненности
        const barWidth = this.width - 60;
        const barHeight = 10;
        const barY = this.y + 80;

        // Фон полосы со скругленными углами
        const barRadius = barHeight / 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.roundRect(this.x + 20, barY, barWidth, barHeight, barRadius);
        ctx.fill();

        // Заполнение со скругленными углами
        if (fillRatio > 0) {
            ctx.fillStyle = capacityColor;
            ctx.beginPath();
            ctx.roundRect(this.x + 20, barY, barWidth * Math.min(fillRatio, 1), barHeight, barRadius);
            ctx.fill();
        }

        // Показываем рыбу в садке
        let yOffset = this.y + 100;
        const maxVisible = 6;
        const itemHeight = 42;

        for (let i = 0; i < Math.min(storedFish.length, maxVisible); i++) {
            const fish = storedFish[i];

            // Иконка рыбы (используем спрайт, увеличено на 116%)
            const iconSize = 60; // 28 * 2.16 ≈ 60
            assetManager.drawImageOrEmoji(
                ctx, 'fish', fish.id,
                this.x + 44, yOffset + 18, iconSize,
                fish.emoji || '🐟'
            );

            // Название и вес
            ctx.font = fontManager.getFont(14, 'normal');
            ctx.fillStyle = '#ecf0f1';
            ctx.textAlign = 'left';
            
            // Получаем локализованное название рыбы
            let displayName = fish.name;
            if (fish.type === 'monster' && window.localizationSystem) {
                displayName = window.localizationSystem.getMonsterName(fish.id, fish.name);
            } else if (fish.type !== 'junk' && window.localizationSystem) {
                displayName = window.localizationSystem.getFishName(fish.id, fish.name);
            }
            
            ctx.fillText(`${displayName} ${fish.caughtWeight.toFixed(1)}${L('kg', 'кг')}`, this.x + 55, yOffset + 10);

            // Цена (используем sellPrice из новой базы данных)
            const fishPrice = fish.sellPrice || fish.price || 0;
            const priceValue = Math.round(fishPrice * fish.caughtWeight);
            ctx.fillStyle = '#2ecc71';
            ctx.textAlign = 'right';
            
            // Рисуем текст цены
            ctx.fillText(`${priceValue}`, this.x + this.width - 40, yOffset + 10);
            // Рисуем иконку монеты (сдвинута левее, чтобы не вылезала за края)
            assetManager.drawCoinIcon(ctx, this.x + this.width - 18, yOffset + 10, 16);

            yOffset += itemHeight;
        }

        // Если рыбы больше максимального количества
        if (storedFish.length > maxVisible) {
            ctx.fillStyle = '#7f8c8d';
            ctx.font = fontManager.getFont(14, 'normal');
            ctx.textAlign = 'center';
            ctx.fillText(`...${L('and_more', 'и ещё')} ${storedFish.length - maxVisible} ${L('pcs', 'шт')}.`, this.x + this.width / 2, yOffset);
        }

        // Если садок пуст
        if (storedFish.length === 0) {
            ctx.fillStyle = '#fff';
            ctx.font = fontManager.getFont(16, 'normal');
            ctx.textAlign = 'center';
            ctx.fillText(L('keepnet_empty_text', 'Садок пуст'), this.x + this.width / 2, this.y + this.height / 2 - 20);
        }

        // Кнопки массовых действий
        if (storedFish.length > 0) {
            // Рассчитываем общую стоимость и опыт
            let totalPrice = 0;
            let totalXPRelease = 0;
            let totalXPSell = 0;

            storedFish.forEach(fish => {
                const fishPrice = Math.round((fish.sellPrice || 0) * fish.caughtWeight);
                totalPrice += fishPrice;
                
                const fishXP = fish.xp || 0;
                totalXPRelease += fishXP;
                totalXPSell += Math.round(fishXP * 0.6);
            });

            // Кнопка "Отпустить всех"
            this.renderButton(ctx, this.releaseAllButton, 
                `🌊 ${L('release_all', 'Отпустить всех')}\n+${totalXPRelease} XP`, 
                '#3498db', '#2980b9');

            // Кнопка "Продать всех" - убираем эмодзи, добавим иконку отдельно
            this.renderButton(ctx, this.sellAllButton, 
                `${L('sell_all', 'Продать всех')}\n${totalPrice} +${totalXPSell} XP`, 
                '#2ecc71', '#27ae60', true, totalPrice); // Передаем флаг для иконки монеты
        }

        ctx.restore();

        // Отрисовка модального окна с деталями рыбы поверх всего
        this.renderFishDetail(ctx);
    }

    renderButton(ctx, btn, text, color1, color2, showCoinIcon = false, coinValue = 0) {
        // Используем спрайт uipan.png для фона кнопки
        const uipanImage = assetManager.getImage('uipan.png');
        
        if (uipanImage) {
            ctx.drawImage(uipanImage, btn.x, btn.y, btn.width, btn.height);
        } else {
            // Fallback - градиент если спрайт не загружен
            const gradient = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.height);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 8);
            ctx.fill();

            // Обводка
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Текст (может быть многострочным)
        const lines = text.split('\n');
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(14);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (lines.length === 1) {
            ctx.fillText(lines[0], btn.x + btn.width / 2, btn.y + btn.height / 2);
            
            // Рисуем иконку монеты если нужно
            if (showCoinIcon) {
                const textWidth = ctx.measureText(lines[0]).width;
                assetManager.drawCoinIcon(ctx, btn.x + btn.width / 2 + textWidth / 2 + 12, btn.y + btn.height / 2, 16);
            }
        } else {
            // Первая строка
            const firstLine = lines[0];
            ctx.fillText(firstLine, btn.x + btn.width / 2, btn.y + btn.height / 2 - 10);
            
            // Рисуем иконку монеты после первой строки если нужно
            if (showCoinIcon) {
                const textWidth = ctx.measureText(firstLine).width;
                assetManager.drawCoinIcon(ctx, btn.x + btn.width / 2 + textWidth / 2 + 12, btn.y + btn.height / 2 - 10, 16);
            }
            
            // Вторая строка
            ctx.font = fontManager.getFont(12, 'normal');
            ctx.fillText(lines[1], btn.x + btn.width / 2, btn.y + btn.height / 2 + 10);
        }
    }

    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    // Получить рыбу по позиции клика
    getFishAtPosition(x, y, storedFish) {
        let yOffset = this.y + 100;
        const maxVisible = 6;
        const itemHeight = 42;

        for (let i = 0; i < Math.min(storedFish.length, maxVisible); i++) {
            if (x >= this.x + 20 && x <= this.x + this.width - 20 &&
                y >= yOffset && y <= yOffset + itemHeight) {
                return storedFish[i];
            }
            yOffset += itemHeight;
        }
        return null;
    }

    // Проверить, наведена ли мышь на рыбу
    isHoveringFish(x, y, storedFish) {
        if (!this.targetVisible || this.fishDetailModal.visible) return false;
        return this.getFishAtPosition(x, y, storedFish) !== null;
    }

    // Показать детали рыбы
    showFishDetail(fish) {
        this.fishDetailModal.selectedFish = fish;
        this.fishDetailModal.visible = true;
        this.fishDetailModal.animProgress = 0;
    }

    // Скрыть детали рыбы
    hideFishDetail() {
        this.fishDetailModal.visible = false;
    }

    // Обработка клика в модальном окне деталей
    handleFishDetailClick(x, y) {
        const modalWidth = 500;
        const modalHeight = 600;
        const modalX = (this.canvas.width - modalWidth) / 2;
        const modalY = (this.canvas.height - modalHeight) / 2;

        // Кнопка закрытия (увеличенная в 2 раза)
        const closeButtonSize = 80; // Увеличиваем в 2 раза
        const closeX = modalX + modalWidth - closeButtonSize - 10; // Ближе к углу
        const closeY = modalY + 10;

        if (x >= closeX && x <= closeX + closeButtonSize &&
            y >= closeY && y <= closeY + closeButtonSize) {
            this.hideFishDetail();
            return true;
        }

        // Клик вне модального окна - закрываем
        if (x < modalX || x > modalX + modalWidth ||
            y < modalY || y > modalY + modalHeight) {
            this.hideFishDetail();
            return true;
        }

        return true;
    }

    // Отрисовка модального окна с деталями рыбы
    renderFishDetail(ctx) {
        if (!this.fishDetailModal.visible || !this.fishDetailModal.selectedFish) return;

        const progress = this.easeOutBack(this.fishDetailModal.animProgress);
        const fish = this.fishDetailModal.selectedFish;

        ctx.save();

        // Затемнение фона
        ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * progress})`;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Размеры и позиция модального окна
        const modalWidth = 500;
        const modalHeight = 600;
        const modalX = (this.canvas.width - modalWidth) / 2;
        const modalY = (this.canvas.height - modalHeight) / 2;

        // Анимация появления - масштабирование из центра
        const scale = progress;
        ctx.translate(modalX + modalWidth / 2, modalY + modalHeight / 2);
        ctx.scale(scale, scale);
        ctx.translate(-modalX - modalWidth / 2, -modalY - modalHeight / 2);

        // Тень модального окна
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 10;

        // Рисуем фон рамки используя rmk.png
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
            const bgGradient = ctx.createLinearGradient(modalX, modalY, modalX, modalY + modalHeight);
            bgGradient.addColorStop(0, '#2c3e50');
            bgGradient.addColorStop(0.5, '#34495e');
            bgGradient.addColorStop(1, '#2c3e50');

            const radius = 20;
            ctx.beginPath();
            ctx.roundRect(modalX, modalY, modalWidth, modalHeight, radius);
            ctx.fillStyle = bgGradient;
            ctx.fill();

            const borderGradient = ctx.createLinearGradient(modalX, modalY, modalX + modalWidth, modalY + modalHeight);
            borderGradient.addColorStop(0, '#3498db');
            borderGradient.addColorStop(0.5, '#2ecc71');
            borderGradient.addColorStop(1, '#f1c40f');

            ctx.strokeStyle = borderGradient;
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        ctx.shadowColor = 'transparent';

        // Кнопка закрытия (увеличенная в 2 раза, в углу)
        const closeButtonSize = 80; // Увеличиваем в 2 раза
        const closeX = modalX + modalWidth - closeButtonSize - 10; // Ближе к углу
        const closeY = modalY + 10;

        ctx.save();
        ctx.globalAlpha = 0.9; // 90% прозрачность
        
        // Используем спрайт zak.png
        const zakImage = assetManager.getImage('zak.png');
        if (zakImage) {
            ctx.drawImage(zakImage, closeX, closeY, closeButtonSize, closeButtonSize);
        } else {
            // Fallback - обычный крестик если спрайт не загружен
            ctx.fillStyle = 'rgba(231, 76, 60, 0.9)';
            ctx.beginPath();
            ctx.roundRect(closeX, closeY, closeButtonSize, closeButtonSize, 8);
            ctx.fill();
            
            ctx.strokeStyle = '#c0392b';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(closeX + 20, closeY + 20); // Увеличиваем отступы
            ctx.lineTo(closeX + closeButtonSize - 20, closeY + closeButtonSize - 20);
            ctx.moveTo(closeX + closeButtonSize - 20, closeY + 20);
            ctx.lineTo(closeX + 20, closeY + closeButtonSize - 20);
            ctx.stroke();
        }
        
        ctx.restore();

        // Изображение рыбы (используем спрайт, увеличено на 160% от оригинала)
        const iconSize = 312; // 120 * 2.6 = 312
        const imgBgY = modalY + 80;
        
        assetManager.drawImageOrEmoji(
            ctx, 'fish', fish.id,
            modalX + modalWidth / 2, imgBgY + 60, iconSize,
            fish.emoji || '🐟'
        );

        // Название рыбы
        ctx.font = fontManager.getFont(32);
        ctx.fillStyle = '#f1c40f';
        ctx.textAlign = 'center';
        
        // Получаем локализованное название рыбы
        let displayName = fish.name;
        if (fish.type === 'monster' && window.localizationSystem) {
            displayName = window.localizationSystem.getMonsterName(fish.id, fish.name);
        } else if (fish.type !== 'junk' && window.localizationSystem) {
            displayName = window.localizationSystem.getFishName(fish.id, fish.name);
        }
        
        ctx.fillText(displayName, modalX + modalWidth / 2, modalY + 290);

        // Вес
        ctx.font = fontManager.getFont(24);
        ctx.fillStyle = '#ecf0f1';
        ctx.fillText(`${fish.caughtWeight.toFixed(2)} ${L('kg', 'кг')}`, modalX + modalWidth / 2, modalY + 330);

        // Редкость (белый текст с черной обводкой)
        ctx.font = fontManager.getFont(18);
        const rarityText = L(`rarity_${fish.rarity}`, fish.rarity || 'Common');
        
        // Черная обводка
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeText(rarityText, modalX + modalWidth / 2, modalY + 360);
        
        // Белый текст
        ctx.fillStyle = '#fff';
        ctx.fillText(rarityText, modalX + modalWidth / 2, modalY + 360);

        // Описание рыбы
        let description = fish.description || L('no_description', 'Нет описания');
        
        // Локализуем описание рыбы
        if (fish.type === 'monster' && window.localizationSystem) {
            description = window.localizationSystem.t(`monster_${fish.id}_desc`, description);
        } else if (fish.type !== 'junk' && window.localizationSystem) {
            description = window.localizationSystem.getFishDescription(fish.id, description);
        }
        
        ctx.font = fontManager.getFont(18, 'normal'); // Увеличен размер с 16 до 18
        ctx.fillStyle = '#ecf0f1'; // Изменен цвет с #bdc3c7 на более яркий #ecf0f1
        ctx.textAlign = 'left';
        
        // Разбиваем текст на строки
        const maxWidth = modalWidth - 60;
        const words = description.split(' ');
        let lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) lines.push(currentLine);

        // Рисуем описание (ограничиваем количество строк, чтобы не вылезало за края)
        let descY = modalY + 400;
        const maxLines = 5; // Максимум 5 строк описания
        const lineHeight = 26; // Увеличен с 24 до 26
        lines.slice(0, maxLines).forEach(line => {
            ctx.fillText(line, modalX + 30, descY);
            descY += lineHeight;
        });

        // Дополнительная информация (белый текст с черной обводкой)
        const infoY = modalY + modalHeight - 100;
        ctx.font = fontManager.getFont(14, 'normal');
        
        // Цена
        const fishPrice = fish.sellPrice || fish.price || 0;
        const totalPrice = Math.round(fishPrice * fish.caughtWeight);
        const priceLabel = window.localizationSystem ? window.localizationSystem.t('price', 'Цена') : 'Цена';
        const priceText = `💰 ${priceLabel}: ${totalPrice}`;
        
        // Черная обводка
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeText(priceText, modalX + 30, infoY);
        // Белый текст
        ctx.fillStyle = '#fff';
        ctx.fillText(priceText, modalX + 30, infoY);
        
        // Опыт
        const fishXP = fish.xp || 0;
        const experienceLabel = window.localizationSystem ? window.localizationSystem.t('experience', 'Опыт') : 'Опыт';
        const xpText = `⭐ ${experienceLabel}: ${fishXP}`;
        
        // Черная обводка
        ctx.strokeText(xpText, modalX + 30, infoY + 25);
        // Белый текст
        ctx.fillText(xpText, modalX + 30, infoY + 25);

        // Время активности
        if (fish.timeOfDay) {
            // Преобразуем русское значение в ключ локализации
            let timeKey = '';
            const timeValue = fish.timeOfDay.toLowerCase();
            
            if (timeValue === 'день') {
                timeKey = 'time_day';
            } else if (timeValue === 'ночь') {
                timeKey = 'time_night';
            } else if (timeValue === 'вечер') {
                timeKey = 'time_evening';
            } else if (timeValue === 'утро') {
                timeKey = 'time_morning';
            } else if (timeValue === 'утро/вечер') {
                timeKey = 'time_morning_evening';
            } else if (timeValue === 'вечер/ночь') {
                timeKey = 'time_evening_night';
            } else if (timeValue === 'полночь') {
                timeKey = 'time_midnight';
            } else if (timeValue === 'туман') {
                timeKey = 'time_fog';
            } else {
                timeKey = 'time_any';
            }
            
            const localizedTime = L(timeKey, fish.timeOfDay);
            const timeLabel = window.localizationSystem ? window.localizationSystem.t('time', 'Время') : 'Время';
            const timeText = `🕐 ${timeLabel}: ${localizedTime}`;
            
            // Черная обводка
            ctx.strokeText(timeText, modalX + 30, infoY + 50);
            // Белый текст
            ctx.fillText(timeText, modalX + 30, infoY + 50);
        }

        ctx.restore();
    }
}