// UI профиля игрока (Canvas)
class ProfileUI {
    constructor(canvas, profileSystem, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        this.profileSystem = profileSystem;
        
        // Состояние
        this.visible = false;
        this.animProgress = 0;
        
        // Размеры окна
        this.modalWidth = 1100;
        this.modalHeight = 700;
        this.modalX = 0;
        this.modalY = 0;
        
        // Кнопка закрытия
        this.closeButton = { x: 0, y: 0, size: 42 };
        
        this.updatePositions();
    }
    
    updatePositions() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.modalX = (w - this.modalWidth) / 2;
        this.modalY = (h - this.modalHeight) / 2;
        
        // Кнопка закрытия (в углу с отступом, сдвинута ниже)
        this.closeButton.x = this.modalX + this.modalWidth - 60;
        this.closeButton.y = this.modalY + 50;
    }
    
    show() {
        this.visible = true;
        this.updatePositions();
    }
    
    hide() {
        this.visible = false;
    }
    
    update(dt) {
        const targetProgress = this.visible ? 1 : 0;
        this.animProgress += (targetProgress - this.animProgress) * dt * 10;
        
        if (!this.visible && this.animProgress < 0.01) {
            this.animProgress = 0;
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
        
        return true;
    }
    
    render() {
        if (this.animProgress < 0.01) return;
        
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        ctx.save();
        ctx.globalAlpha = this.animProgress;
        
        // Затемнение фона
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);
        
        // Масштабирование окна
        const scale = 0.8 + this.animProgress * 0.2;
        ctx.translate(w / 2, h / 2);
        ctx.scale(scale, scale);
        ctx.translate(-w / 2, -h / 2);
        
        // Фон модального окна
        this.renderModalBackground(ctx);
        
        // Заголовок
        this.renderHeader(ctx);
        
        // Статистика
        this.renderStats(ctx);
        
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
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            
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
        ctx.font = fontManager.getFont(52);
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L('profile_title', '👤 ПРОФИЛЬ ИГРОКА'), this.modalX + this.modalWidth / 2, this.modalY + 50);
        fontManager.applyLetterSpacing(ctx, false);
        
        ctx.restore();
    }
    
    renderStats(ctx) {
        const stats = this.profileSystem.getStats();
        const startX = this.modalX + 40;
        const startY = this.modalY + 115;
        const columnWidth = (this.modalWidth - 120) / 2;
        const lineHeight = 70;
        
        ctx.save();
        
        // Левая колонка
        let currentY = startY;
        
        // Уровень
        this.renderStatItem(ctx, `⭐ ${L('level', 'Уровень')}`, stats.level.toString(), startX, currentY, columnWidth);
        currentY += lineHeight;
        
        // Всего поймано рыб
        this.renderStatItem(ctx, L('total_fish_caught', '🐟 Всего поймано рыб'), stats.totalFishCaught.toString(), startX, currentY, columnWidth);
        currentY += lineHeight;
        
        // Всего поймано монстров
        this.renderStatItem(ctx, L('total_monsters_caught', '🐉 Всего поймано монстров'), stats.totalMonstersCaught.toString(), startX, currentY, columnWidth);
        currentY += lineHeight;
        
        // Всего поймано предметов
        this.renderStatItem(ctx, L('total_items_caught', '📦 Всего поймано предметов'), stats.totalItemsCaught.toString(), startX, currentY, columnWidth);
        currentY += lineHeight;
        
        // Самая тяжелая рыба (увеличенная высота для длинных названий)
        let heaviestText = L('none_yet', 'Пока нет');
        if (stats.heaviestFish) {
            const fishData = window.FishDB?.getById(stats.heaviestFish.id);
            const fishName = fishData ? window.FishDB.getLocalizedName(fishData) : stats.heaviestFish.name;
            heaviestText = `${fishName} (${stats.heaviestFish.weight.toFixed(2)} ${L('kg', 'кг')})`;
        }
        this.renderStatItem(ctx, L('heaviest_fish', '🏆 Самая тяжелая рыба'), heaviestText, startX, currentY, columnWidth, '#f39c12', 85);
        currentY += 85 + 15; // Увеличиваем отступ: высота ячейки + отступ
        
        // Выполнено заданий
        this.renderStatItem(ctx, `📜 ${L('quests_completed', 'Выполнено заданий')}`, stats.questsCompleted.toString(), startX, currentY, columnWidth);
        
        // Правая колонка
        currentY = startY;
        const rightX = startX + columnWidth + 40;
        
        // Открыто локаций
        this.renderStatItem(ctx, `🗺️ ${L('locations_unlocked', 'Открыто локаций')}`, stats.locationsUnlocked.toString(), rightX, currentY, columnWidth);
        currentY += lineHeight;
        
        // Мастерство
        const masteryColor = this.getMasteryColor(stats.mastery);
        this.renderStatItem(ctx, L('mastery', '🎯 Мастерство'), `${stats.mastery}%`, rightX, currentY, columnWidth, masteryColor);
        currentY += lineHeight;
        
        // Прогресс-бар мастерства
        this.renderMasteryBar(ctx, stats.mastery, rightX, currentY, columnWidth - 20);
        currentY += lineHeight;
        
        // Всего заработано монет
        this.renderStatItemWithIcon(ctx, L('total_earned', 'Всего заработано'), stats.totalCoinEarned.toString(), rightX, currentY, columnWidth, 'coin');
        currentY += lineHeight;
        
        // Всего заработано бриллиантов
        this.renderStatItemWithIcon(ctx, L('total_earned', 'Всего заработано'), stats.totalGemsEarned.toString(), rightX, currentY, columnWidth, 'gem');
        currentY += lineHeight;
        
        // Время игры
        const playTimeText = this.profileSystem.getFormattedPlayTime();
        this.renderStatItem(ctx, L('play_time', '⏱️ Время игры'), playTimeText, rightX, currentY, columnWidth);
        
        // Описание мастерства внизу
        this.renderMasteryDescription(ctx, stats);
        
        ctx.restore();
    }
    
    renderStatItem(ctx, label, value, x, y, width, valueColor = '#3498db', height = 55) {
        // Фон элемента
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 8);
        ctx.fill();
        
        // Метка
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = fontManager.getFont(20);
        ctx.fillText(label, x + 15, y + 12);
        
        // Значение - проверяем нужен ли перенос строки
        const maxWidth = width - 30;
        ctx.font = fontManager.getFont(28);
        let textWidth = ctx.measureText(value).width;
        
        // Если текст не влезает и высота позволяет, переносим на две строки
        if (textWidth > maxWidth && height > 60) {
            // Разбиваем текст на части
            const words = value.split(' ');
            let line1 = '';
            let line2 = '';
            
            // Пытаемся разделить по скобке
            const parenIndex = value.indexOf('(');
            if (parenIndex > 0) {
                line1 = value.substring(0, parenIndex).trim();
                line2 = value.substring(parenIndex).trim();
            } else {
                // Иначе делим пополам по словам
                const mid = Math.ceil(words.length / 2);
                line1 = words.slice(0, mid).join(' ');
                line2 = words.slice(mid).join(' ');
            }
            
            ctx.fillStyle = valueColor;
            ctx.textAlign = 'right';
            ctx.font = fontManager.getFont(22);
            ctx.fillText(line1, x + width - 15, y + 48);
            ctx.fillText(line2, x + width - 15, y + 70);
        } else {
            // Одна строка - уменьшаем размер если текст длинный
            if (textWidth > maxWidth) {
                ctx.font = fontManager.getFont(20);
                textWidth = ctx.measureText(value).width;
                
                // Если все еще не влезает, уменьшаем еще больше
                if (textWidth > maxWidth) {
                    ctx.font = fontManager.getFont(16);
                }
            }
            
            ctx.fillStyle = valueColor;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(value, x + width - 15, y + height / 2);
        }
    }
    
    renderStatItemWithIcon(ctx, label, value, x, y, width, iconType, valueColor = '#3498db', height = 55) {
        // Фон элемента
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 8);
        ctx.fill();
        
        // Метка с отступом для иконки
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = fontManager.getFont(20);
        ctx.fillText(label, x + 45, y + 12);
        
        // Рисуем иконку слева от метки
        if (iconType === 'coin') {
            assetManager.drawCoinIcon(ctx, x + 15, y + 17, 20);
        } else if (iconType === 'gem') {
            assetManager.drawGemIcon(ctx, x + 15, y + 17, 20);
        }
        
        // Значение
        const maxWidth = width - 30;
        ctx.font = fontManager.getFont(28);
        let textWidth = ctx.measureText(value).width;
        
        // Если текст не влезает, уменьшаем шрифт
        if (textWidth > maxWidth) {
            ctx.font = fontManager.getFont(20);
            textWidth = ctx.measureText(value).width;
            
            if (textWidth > maxWidth) {
                ctx.font = fontManager.getFont(16);
            }
        }
        
        ctx.fillStyle = valueColor;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(value, x + width - 15, y + height / 2);
    }
    
    renderMasteryBar(ctx, mastery, x, y, width) {
        const barHeight = 40;
        
        // Фон прогресс-бара
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x, y, width, barHeight, 10);
        ctx.fill();
        
        // Заполнение
        if (mastery > 0) {
            const fillWidth = (width * mastery) / 100;
            const color = this.getMasteryColor(mastery);
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(x, y, fillWidth, barHeight, 10);
            ctx.fill();
        }
        
        // Текст процента
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${mastery}%`, x + width / 2, y + barHeight / 2);
    }
    
    renderMasteryDescription(ctx, stats) {
        const descY = this.modalY + this.modalHeight - 90;
        const descX = this.modalX + this.modalWidth / 2;
        
        // Фон описания
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(this.modalX + 40, descY - 10, this.modalWidth - 80, 70, 8);
        ctx.fill();
        
        // Заголовок
        ctx.fillStyle = '#3498db';
        ctx.font = fontManager.getFont(22);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(L('mastery_info', 'ℹ️ Мастерство'), descX, descY);
        
        // Описание
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = fontManager.getFont(18);
        const descText = L('mastery_ratio', 'Отношение пойманных рыб к сорвавшимся: {caught} / {escaped}')
            .replace('{caught}', stats.successfulCatches)
            .replace('{escaped}', stats.fishEscaped);
        ctx.fillText(descText, descX, descY + 30);
    }
    
    getMasteryColor(mastery) {
        if (mastery >= 90) return '#2ecc71'; // Отлично (зеленый)
        if (mastery >= 75) return '#3498db'; // Хорошо (синий)
        if (mastery >= 60) return '#f39c12'; // Средне (оранжевый)
        if (mastery >= 40) return '#e67e22'; // Плохо (темно-оранжевый)
        return '#e74c3c'; // Очень плохо (красный)
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
}
