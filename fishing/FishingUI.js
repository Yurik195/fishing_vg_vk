// UI система для рыбалки

class FishingUI {
    constructor(canvas, progression, gearInventory = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.progression = progression;
        this.gearInventory = gearInventory;
        
        // Загрузка спрайтов
        this.sprites = {
            sadok: new Image(),
            dom: new Image(),
            tini: new Image(),
            katush: new Image(),
            uipan: new Image(),
            topBar: new Image(),
            coinIcon: new Image(),
            gemIcon: new Image()
        };
        this.sprites.sadok.src = 'sadok.png';
        this.sprites.dom.src = 'dom.png';
        this.sprites.tini.src = 'tini.png';
        this.sprites.katush.src = 'katush.png';
        this.sprites.uipan.src = 'uipan.png';
        this.sprites.topBar.src = 'ramk.png';
        this.sprites.coinIcon.src = 'sereb.png';
        this.sprites.gemIcon.src = 'mark.png';
        
        // Кнопка подсечки (теперь со спрайтом)
        this.hookButton = {
            x: 0, y: 0,
            size: FISHING_CONFIG.UI.HOOK_BUTTON_SIZE,
            visible: false,
            pressed: false,
            pulseTime: 0,
            sprite: this.sprites.tini
        };
        
        // Кнопка возврата удочки (меньше кнопки подсечки)
        this.retractButton = {
            x: 0, y: 0,
            size: 60, // Меньше чем hookButton
            visible: false,
            pressed: false,
            label: '↩️'
        };
        
        // Кнопка катушки (теперь со спрайтом)
        this.reelButton = {
            x: 0, y: 0,
            size: FISHING_CONFIG.UI.REEL_BUTTON_SIZE,
            visible: false,
            pressed: false,
            sprite: this.sprites.katush
        };
        
        // Индикатор натяжения (старый, убран)
        this.tensionBar = {
            x: 0, y: 0,
            width: 200,
            height: 20,
            value: 0,
            visible: false
        };
        
        // Новый индикатор натяжения лески (полоска вверху под подсказками)
        this.lineTensionIndicator = {
            visible: false,
            value: 0, // 0-1
            maxWidth: 240, // Максимальная ширина полоски (уменьшено на 20%)
            height: 6, // Высота полоски (уменьшена в два раза с 12 до 6)
            y: 0 // Будет установлено в updatePositions
        };
        
        // Таймер подсечки
        this.hookTimer = {
            visible: false,
            progress: 1,
            x: 0, y: 0
        };

        // Кнопка садка (теперь со спрайтом)
        this.storageButton = {
            x: 0, y: 0,
            size: 72,
            visible: true,
            pressed: false,
            sprite: this.sprites.sadok
        };

        // Кнопка выхода (теперь со спрайтом, увеличена на 80%)
        this.exitButton = {
            x: 0, y: 0,
            size: 108, // 60 * 1.8 = 108
            visible: true,
            pressed: false,
            sprite: this.sprites.dom
        };

        // Подсказка
        this.hint = {
            text: '',
            visible: false,
            alpha: 0
        };
        
        // Текущая локация (для ограничения показа подсказок)
        this.currentLocationId = 1;
        
        // Всплывающая подсказка о прочности
        this.durabilityTooltip = {
            visible: false,
            x: 0,
            y: 0,
            text: '',
            gearType: null,
            alpha: 0
        };
        
        // Панель снастей (внизу слева, на фоне uipan)
        this.gearPanel = {
            x: 20,
            y: 0, // Будет установлено в updatePositions
            slotSize: 85, // Уменьшено на 15% (было 100)
            spacing: 17, // Уменьшено на 15% (было 20)
            sprite: this.sprites.uipan,
            slots: [
                { type: 'bait', label: '�',  name: 'Наживка' },
                { type: 'hook', label: '⚓', name: 'Крючок' },
                { type: 'float', label: '🔴', name: 'Поплавок' },
                { type: 'line', label: '➰', name: 'Леска' },
                { type: 'reel', label: '⚙️', name: 'Катушка' },
                { type: 'rod', label: '🎣', name: 'Удочка' }
            ]
        };
        
        this.updatePositions();
    }
    
    updatePositions() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const margin = FISHING_CONFIG.UI.BUTTON_MARGIN;
        
        // Кнопка катушки - справа внизу (опущена ниже)
        this.reelButton.x = w - this.reelButton.size / 2 - margin;
        this.reelButton.y = h - this.reelButton.size / 2 - margin;
        
        // Кнопка подсечки - на тех же координатах что и кнопка катушки
        this.hookButton.x = this.reelButton.x;
        this.hookButton.y = this.reelButton.y;
        
        // Кнопка возврата - выше кнопки подсечки
        this.retractButton.x = this.hookButton.x;
        this.retractButton.y = this.hookButton.y - this.hookButton.size / 2 - this.retractButton.size / 2 - 20;
        
        // Кнопка садка - левее кнопок подсечки и катушки, опущена ниже (сдвинута правее на 10px и ниже на 5px)
        this.storageButton.x = this.reelButton.x - this.reelButton.size / 2 - this.storageButton.size / 2 - 30 + 10;
        this.storageButton.y = this.reelButton.y + 80 + 5;
        
        // Кнопка выхода - правый верхний угол с небольшими отступами
        this.exitButton.x = w - this.exitButton.size / 2 - 20;
        this.exitButton.y = this.exitButton.size / 2 + 10;
        
        // Индикатор натяжения - внизу по центру
        this.tensionBar.x = w / 2 - this.tensionBar.width / 2;
        this.tensionBar.y = h - 60;
        
        // Таймер подсечки - вокруг кнопки подсечки (те же координаты)
        this.hookTimer.x = this.hookButton.x;
        this.hookTimer.y = this.hookButton.y;
        
        // Панель снастей - внизу слева
        this.gearPanel.y = h - this.gearPanel.slotSize - 20;
        
        // Индикатор натяжения лески - вверху под подсказками
        this.lineTensionIndicator.y = 130; // Под подсказками в верхней части экрана
    }
    
    showHookButton() {
        this.hookButton.visible = true;
        this.hookButton.pulseTime = 0;
    }
    
    hideHookButton() {
        this.hookButton.visible = false;
    }
    
    showRetractButton() {
        this.retractButton.visible = true;
    }
    
    hideRetractButton() {
        this.retractButton.visible = false;
    }
    
    showReelButton() {
        this.reelButton.visible = true;
    }
    
    hideReelButton() {
        this.reelButton.visible = false;
    }
    
    showTensionBar() {
        this.tensionBar.visible = true;
        this.lineTensionIndicator.visible = true;
    }
    
    hideTensionBar() {
        this.tensionBar.visible = false;
        this.lineTensionIndicator.visible = false;
    }
    
    setTension(value) {
        this.tensionBar.value = Math.max(0, Math.min(1, value));
        this.lineTensionIndicator.value = Math.max(0, Math.min(1, value));
    }
    
    showHookTimer(progress) {
        this.hookTimer.visible = true;
        this.hookTimer.progress = progress;
    }
    
    hideHookTimer() {
        this.hookTimer.visible = false;
    }
    
    showHint(text) {
        // Показываем подсказки на всех локациях для обратной связи
        this.hint.text = text;
        this.hint.visible = true;
        this.hint.alpha = 1;
    }
    
    setCurrentLocation(locationId) {
        this.currentLocationId = locationId;
    }
    
    hideHint() {
        this.hint.visible = false;
    }
    
    setReelPressed(pressed) {
        this.reelButton.pressed = pressed;
    }
    
    update(dt) {
        this.updatePositions();
        
        // Пульсация кнопки подсечки (уменьшена)
        if (this.hookButton.visible) {
            this.hookButton.pulseTime += dt * 3; // Было 5, стало 3 (медленнее)
        }
        
        // Затухание подсказки
        if (this.hint.visible && this.hint.alpha > 0) {
            // Подсказка остаётся видимой
        }
    }
    
    render(ctx) {
        // Верхняя панель (как в главном меню)
        this.renderTopBar(ctx);
        
        // Подсказка
        if (this.hint.visible) {
            this.renderHint(ctx);
        }
        
        // Кнопка подсечки
        if (this.hookButton.visible) {
            this.renderHookButton(ctx);
        }
        
        // Кнопка возврата удочки
        if (this.retractButton.visible) {
            this.renderRetractButton(ctx);
        }
        
        // Кнопка катушки
        if (this.reelButton.visible) {
            this.renderReelButton(ctx);
        }
        
        // Индикатор натяжения (убран)
        // if (this.tensionBar.visible) {
        //     this.renderTensionBar(ctx);
        // }
        
        // Новый индикатор натяжения лески
        if (this.lineTensionIndicator.visible) {
            this.renderLineTensionIndicator(ctx);
        }

        // Кнопка садка
        this.renderStorageButton(ctx);
        
        // Панель снастей
        this.renderGearPanel(ctx);
        
        // Всплывающая подсказка о прочности
        if (this.durabilityTooltip.visible) {
            this.renderDurabilityTooltip(ctx);
        }
    }
    
    renderHookButton(ctx) {
        const btn = this.hookButton;
        const pulse = Math.sin(btn.pulseTime) * 0.08 + 1; // Было 0.15, стало 0.08 (меньше пульсация)
        const size = btn.size * pulse;
        
        ctx.save();
        ctx.translate(btn.x, btn.y);
        
        // Внешнее свечение
        const glow = ctx.createRadialGradient(0, 0, size * 0.4, 0, 0, size * 0.8);
        glow.addColorStop(0, 'rgba(231, 76, 60, 0.8)');
        glow.addColorStop(1, 'rgba(231, 76, 60, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Рисуем спрайт кнопки подсечки
        if (btn.sprite && btn.sprite.complete) {
            ctx.drawImage(btn.sprite, -size * 0.5, -size * 0.5, size, size);
        } else {
            // Fallback если спрайт не загружен
            const gradient = ctx.createRadialGradient(0, -size * 0.2, 0, 0, 0, size * 0.5);
            gradient.addColorStop(0, '#e74c3c');
            gradient.addColorStop(1, '#c0392b');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    renderRetractButton(ctx) {
        const btn = this.retractButton;
        
        ctx.save();
        ctx.translate(btn.x, btn.y);
        
        // Используем спрайт naz.png для кнопки возврата
        const nazImage = assetManager.getImage('naz.png');
        if (nazImage) {
            const size = btn.size;
            ctx.drawImage(nazImage, -size * 0.5, -size * 0.5, size, size);
        } else {
            // Fallback - оригинальная кнопка если спрайт не загружен
            const gradient = ctx.createRadialGradient(0, -btn.size * 0.2, 0, 0, 0, btn.size * 0.5);
            gradient.addColorStop(0, '#95a5a6');
            gradient.addColorStop(1, '#7f8c8d');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, btn.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
            
            // Обводка
            ctx.strokeStyle = '#ecf0f1';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Текст только в fallback режиме
            ctx.fillStyle = '#fff';
            ctx.font = fontManager.getFont(24, 'normal');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(btn.label, 0, 0);
        }
        
        // Убираем текст поверх спрайта - только спрайт naz.png
        
        ctx.restore();
    }
    
    renderReelButton(ctx) {
        const btn = this.reelButton;
        
        ctx.save();
        ctx.translate(btn.x, btn.y);
        
        // Рисуем спрайт катушки (без вращения)
        if (btn.sprite && btn.sprite.complete) {
            const size = btn.size;
            ctx.drawImage(btn.sprite, -size * 0.5, -size * 0.5, size, size);
            
            // Эффект нажатия (легкое затемнение)
            if (btn.pressed) {
                ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Fallback если спрайт не загружен
            const bgGradient = ctx.createRadialGradient(0, -10, 0, 0, 0, btn.size * 0.5);
            bgGradient.addColorStop(0, btn.pressed ? '#3498db' : '#2c3e50');
            bgGradient.addColorStop(1, btn.pressed ? '#2980b9' : '#1a252f');
            
            ctx.fillStyle = bgGradient;
            ctx.beginPath();
            ctx.arc(0, 0, btn.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = btn.pressed ? '#3498db' : '#7f8c8d';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    renderTensionBar(ctx) {
        const bar = this.tensionBar;
        
        ctx.save();
        
        // Фон
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.roundRect(bar.x - 5, bar.y - 5, bar.width + 10, bar.height + 10, 10);
        ctx.fill();
        
        // Полоса фона
        ctx.fillStyle = '#2c3e50';
        ctx.roundRect(bar.x, bar.y, bar.width, bar.height, 5);
        ctx.fill();
        
        // Заполнение с градиентом по значению
        let fillColor;
        if (bar.value < 0.3) {
            fillColor = '#2ecc71'; // Зелёный
        } else if (bar.value < 0.7) {
            fillColor = '#f1c40f'; // Жёлтый
        } else {
            fillColor = '#e74c3c'; // Красный
        }
        
        ctx.fillStyle = fillColor;
        ctx.roundRect(bar.x, bar.y, bar.width * bar.value, bar.height, 5);
        ctx.fill();
        
        // Иконка рыбы слева
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(16, 'normal');
        ctx.textAlign = 'right';
        ctx.fillText('🐟', bar.x - 10, bar.y + bar.height / 2 + 5);
        
        ctx.restore();
    }
    
    // Новый индикатор натяжения лески (полоска между UI и удочкой)
    renderLineTensionIndicator(ctx) {
        const indicator = this.lineTensionIndicator;
        const w = this.canvas.width;
        
        // Текущая ширина полоски (растет из центра)
        const currentWidth = indicator.maxWidth * indicator.value;
        
        // Центр экрана по X (без смещения)
        const centerX = w / 2;
        
        // Позиция полоски (растет из центра в обе стороны)
        const x = centerX - currentWidth / 2;
        const y = indicator.y;
        
        // Цвет меняется от зеленого к красному
        let color;
        if (indicator.value < 0.3) {
            // Зеленый
            color = '#2ecc71';
        } else if (indicator.value < 0.6) {
            // Желтый
            color = '#f1c40f';
        } else if (indicator.value < 0.8) {
            // Оранжевый
            color = '#e67e22';
        } else {
            // Красный
            color = '#e74c3c';
        }
        
        ctx.save();
        
        // Рисуем полоску с скругленными углами
        if (currentWidth > 0) {
            const radius = indicator.height / 2;
            
            ctx.fillStyle = color;
            ctx.beginPath();
            
            // Рисуем скругленный прямоугольник вручную
            if (currentWidth >= radius * 2) {
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + currentWidth - radius, y);
                ctx.arcTo(x + currentWidth, y, x + currentWidth, y + indicator.height, radius);
                ctx.lineTo(x + currentWidth, y + indicator.height - radius);
                ctx.arcTo(x + currentWidth, y + indicator.height, x + currentWidth - radius, y + indicator.height, radius);
                ctx.lineTo(x + radius, y + indicator.height);
                ctx.arcTo(x, y + indicator.height, x, y + indicator.height - radius, radius);
                ctx.lineTo(x, y + radius);
                ctx.arcTo(x, y, x + radius, y, radius);
            } else {
                // Если ширина меньше диаметра - рисуем круг
                ctx.arc(x + currentWidth / 2, y + indicator.height / 2, currentWidth / 2, 0, Math.PI * 2);
            }
            
            ctx.closePath();
            ctx.fill();
            
            // Добавляем легкое свечение
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    renderHookTimer(ctx) {
        const timer = this.hookTimer;
        const btn = this.hookButton;
        const radius = btn.size * 0.55; // Радиус чуть больше кнопки
        
        ctx.save();
        ctx.translate(timer.x, timer.y);
        
        // Прогресс вокруг кнопки
        ctx.strokeStyle = timer.progress > 0.3 ? '#2ecc71' : '#e74c3c';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * timer.progress);
        ctx.stroke();
        
        ctx.restore();
    }

    renderStorageButton(ctx) {
        const btn = this.storageButton;

        ctx.save();
        ctx.translate(btn.x, btn.y);

        // Рисуем спрайт садка
        if (btn.sprite && btn.sprite.complete) {
            const size = btn.size;
            ctx.drawImage(btn.sprite, -size * 0.5, -size * 0.5, size, size);
        } else {
            // Fallback если спрайт не загружен
            const gradient = ctx.createRadialGradient(0, -btn.size * 0.2, 0, 0, 0, btn.size * 0.4);
            gradient.addColorStop(0, '#f39c12');
            gradient.addColorStop(1, '#e67e22');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, btn.size * 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.restore();
    }

    renderExitButton(ctx) {
        const btn = this.exitButton;

        ctx.save();
        ctx.translate(btn.x, btn.y);

        // Рисуем спрайт кнопки домой (уменьшенный для верхней панели)
        if (btn.sprite && btn.sprite.complete) {
            const size = btn.size;
            ctx.drawImage(btn.sprite, -size * 0.5, -size * 0.5, size, size);
        } else {
            // Fallback если спрайт не загружен
            const gradient = ctx.createRadialGradient(0, -btn.size * 0.2, 0, 0, 0, btn.size * 0.4);
            gradient.addColorStop(0, '#e74c3c');
            gradient.addColorStop(1, '#c0392b');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, btn.size * 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.restore();
        
        // Красный кружок-уведомление если есть выполненные задания
        if (window.questSystem && window.questSystem.hasUnclaimedQuests()) {
            this.renderNotificationBadge(ctx, btn.x + btn.size * 0.3, btn.y - btn.size * 0.3);
        }
    }
    
    // Рисование красного кружка-уведомления
    renderNotificationBadge(ctx, x, y) {
        ctx.save();
        
        // Пульсация
        const pulse = 1 + Math.sin(Date.now() / 300) * 0.15;
        const size = 18 * pulse;
        
        // Тень для заметности
        ctx.shadowColor = 'rgba(231, 76, 60, 0.8)';
        ctx.shadowBlur = 10;
        
        // Красный круг
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Белая обводка
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Восклицательный знак
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(12, 'bold');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', x, y);
        
        ctx.restore();
    }

    renderHint(ctx) {
        const w = this.canvas.width;
        
        ctx.save();
        ctx.globalAlpha = this.hint.alpha;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.roundRect(w / 2 - 150, 80, 300, 40, 10);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(18, 'normal');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.hint.text, w / 2, 100);
        
        ctx.restore();
    }
    
    // Отображение информации о рыбе при поклевке (сканер рыбы)
    renderFishScanInfo(ctx, fish) {
        const w = this.canvas.width;
        
        ctx.save();
        
        // Панель с информацией о рыбе
        const panelWidth = 250;
        const panelHeight = 80;
        const panelX = w / 2 - panelWidth / 2;
        const panelY = 140;
        
        // Фон панели
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 10);
        ctx.fill();
        
        // Рамка
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Иконка рыбы - используем спрайт через AssetManager
        const iconSize = 50;
        const iconX = panelX + 40;
        const iconY = panelY + panelHeight / 2;
        
        // Определяем тип объекта
        let assetType = 'fish'; // По умолчанию рыба
        let spriteId = fish.id;
        let defaultEmoji = '🐟';
        
        if (fish.type === 'junk') {
            // Предмет
            assetType = 'junk';
            spriteId = fish.originalJunkId || fish.id;
            defaultEmoji = fish.emoji || '📦';
        } else if (fish.type === 'monster') {
            // Монстр
            assetType = 'monster';
            spriteId = fish.originalMonsterId || fish.id;
            defaultEmoji = fish.emoji || '🐲';
        } else {
            // Обычная рыба (type не установлен или type === 'fish')
            assetType = 'fish';
            spriteId = fish.id;
            defaultEmoji = fish.emoji || '🐟';
        }
        
        if (typeof assetManager !== 'undefined') {
            assetManager.drawImageOrEmoji(
                ctx,
                assetType,
                spriteId,
                iconX,
                iconY,
                iconSize,
                iconSize,
                defaultEmoji
            );
        } else {
            // Fallback на эмодзи если AssetManager не доступен
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(defaultEmoji, iconX, iconY);
        }
        
        // Название рыбы (с переводом)
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(20);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        // Получаем переведенное название
        let displayName = fish.name;
        if (fish.type === 'monster' && window.localizationSystem) {
            displayName = window.localizationSystem.getMonsterName(fish.id, fish.name);
        } else if (fish.type !== 'junk' && window.localizationSystem) {
            displayName = window.localizationSystem.getFishName(fish.id, fish.name);
        }
        
        ctx.fillText(displayName, panelX + 70, panelY + panelHeight / 2);
        
        // Метка "Сканер"
        ctx.fillStyle = '#3498db';
        ctx.font = fontManager.getFont(12);
        ctx.textAlign = 'center';
        ctx.fillText(L('scanner_title', '📡 СКАНЕР'), panelX + panelWidth / 2, panelY + 15);
        
        ctx.restore();
    }
    
    // Проверка нажатия на кнопку подсечки
    isHookButtonPressed(x, y) {
        if (!this.hookButton.visible) return false;
        const dx = x - this.hookButton.x;
        const dy = y - this.hookButton.y;
        return Math.sqrt(dx * dx + dy * dy) < this.hookButton.size * 0.5;
    }
    
    // Проверка нажатия на кнопку возврата удочки
    isRetractButtonPressed(x, y) {
        if (!this.retractButton.visible) return false;
        const dx = x - this.retractButton.x;
        const dy = y - this.retractButton.y;
        return Math.sqrt(dx * dx + dy * dy) < this.retractButton.size * 0.5;
    }
    
    // Проверка нажатия на кнопку катушки
    isReelButtonPressed(x, y) {
        if (!this.reelButton.visible) return false;
        const dx = x - this.reelButton.x;
        const dy = y - this.reelButton.y;
        return Math.sqrt(dx * dx + dy * dy) < this.reelButton.size * 0.5;
    }

    // Проверка нажатия на кнопку садка
    isStorageButtonPressed(x, y) {
        if (!this.storageButton.visible) return false;
        const dx = x - this.storageButton.x;
        const dy = y - this.storageButton.y;
        return Math.sqrt(dx * dx + dy * dy) < this.storageButton.size * 0.5;
    }

    // Проверка нажатия на кнопку выхода
    isExitButtonPressed(x, y) {
        if (!this.exitButton.visible) return false;
        const dx = x - this.exitButton.x;
        const dy = y - this.exitButton.y;
        return Math.sqrt(dx * dx + dy * dy) < this.exitButton.size * 0.5;
    }
    
    // Проверка наведения на слот снасти
    getGearSlotAtPosition(x, y) {
        const panel = this.gearPanel;
        const slotSize = panel.slotSize;
        const spacing = panel.spacing;
        
        for (let index = 0; index < panel.slots.length; index++) {
            const slot = panel.slots[index];
            let slotX = panel.x + spacing + index * (slotSize + spacing);
            let slotY = panel.y - 8; // Базовое смещение как при рендеринге
            
            // Применяем те же индивидуальные смещения что и при рендеринге
            if (slot.type === 'bait') {
                slotX -= 8;
                slotY -= 3;
            } else if (slot.type === 'hook') {
                slotX += 8;
            } else if (slot.type === 'float') {
                slotX += 26;
            } else if (slot.type === 'line') {
                slotX += 34;
            } else if (slot.type === 'reel') {
                slotX += 46;
                slotY += 0;
            } else if (slot.type === 'rod') {
                slotX += 34;
            }
            
            if (x >= slotX && x <= slotX + slotSize && y >= slotY && y <= slotY + slotSize) {
                return { slot, index, x: slotX, y: slotY };
            }
        }
        return null;
    }
    
    // Показать всплывающую подсказку о прочности
    showDurabilityTooltip(gearType, x, y) {
        if (!this.progression || gearType === 'bait') {
            this.durabilityTooltip.visible = false;
            return;
        }
        
        const durabilityPercent = this.progression.getDurabilityPercent(gearType);
        const durabilityState = this.progression.getDurabilityState(gearType);
        const gearItem = this.progression[`getCurrent${gearType.charAt(0).toUpperCase() + gearType.slice(1)}`]?.();
        
        if (!gearItem) {
            this.durabilityTooltip.visible = false;
            return;
        }
        
        this.durabilityTooltip.visible = true;
        this.durabilityTooltip.gearType = gearType;
        this.durabilityTooltip.x = x;
        this.durabilityTooltip.y = y;
        this.durabilityTooltip.alpha = 1;
        
        // Формируем текст подсказки
        const typeNames = {
            rod: L('gear_rod', 'Удочка'),
            line: L('gear_line', 'Леска'),
            reel: L('gear_reel', 'Катушка'),
            hook: L('gear_hook', 'Крючок'),
            float: L('gear_float', 'Поплавок')
        };
        
        // Получаем переведенное название снасти
        let gearName = gearItem.name;
        if (gearItem.tier && window.GearDB) {
            gearName = window.GearDB.getLocalizedGearName(gearType, gearItem.tier, gearItem.name);
        }
        
        this.durabilityTooltip.text = `${typeNames[gearType]} ${gearName}\n${durabilityState.text} (${Math.round(durabilityPercent)}%)`;
    }
    
    // Скрыть всплывающую подсказку
    hideDurabilityTooltip() {
        this.durabilityTooltip.visible = false;
    }
    
    // Рендер всплывающей подсказки о прочности
    renderDurabilityTooltip(ctx) {
        const tooltip = this.durabilityTooltip;
        if (!tooltip.visible) return;
        
        const durabilityState = this.progression.getDurabilityState(tooltip.gearType);
        
        ctx.save();
        ctx.globalAlpha = tooltip.alpha;
        
        // Размеры подсказки
        const padding = 16;
        const lineHeight = 32; // Увеличено
        const lines = tooltip.text.split('\n');
        const width = Math.max(280, lines[0].length * 12 + padding * 2); // Увеличено
        const height = lines.length * lineHeight + padding * 2;
        
        // Позиция (над слотом)
        let tooltipX = tooltip.x + 50 - width / 2;
        let tooltipY = tooltip.y - height - 10;
        
        // Проверка границ экрана
        if (tooltipX < 10) tooltipX = 10;
        if (tooltipX + width > this.canvas.width - 10) tooltipX = this.canvas.width - width - 10;
        if (tooltipY < 10) tooltipY = tooltip.y + 110;
        
        // Фон подсказки
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.beginPath();
        ctx.roundRect(tooltipX, tooltipY, width, height, 8);
        ctx.fill();
        
        // Обводка (цвет зависит от состояния прочности)
        ctx.strokeStyle = durabilityState.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Текст подсказки
        ctx.fillStyle = durabilityState.color;
        ctx.font = fontManager.getFont(22); // Увеличено
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        lines.forEach((line, index) => {
            ctx.fillText(line, tooltipX + padding, tooltipY + padding + index * lineHeight);
        });
        
        ctx.restore();
    }
    
    // Рендер верхней панели (как в главном меню)
    renderTopBar(ctx) {
        const w = this.canvas.width;
        const barHeight = 60;
        const barWidth = w * 0.8;
        const barX = (w - barWidth) / 2;
        
        // Фон верхней панели (полупрозрачность уменьшена на 10%)
        ctx.save();
        ctx.globalAlpha = 0.9; // Уменьшена прозрачность на 10% (было 1.0)
        if (this.sprites.topBar && this.sprites.topBar.complete) {
            ctx.drawImage(this.sprites.topBar, barX, 0, barWidth, barHeight);
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.63)'; // 0.7 * 0.9 = 0.63
            ctx.fillRect(barX, 0, barWidth, barHeight);
        }
        ctx.restore();
        
        // Уровень слева на зеленой области
        const level = window.profileSystem ? window.profileSystem.getLevel() : 1;
        ctx.save();
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = fontManager.getFont(20, 'bold');
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const levelAbbr = L('level_abbr', 'Ур.');
        ctx.strokeText(`${levelAbbr} ${level}`, barX + 50, barHeight / 2 + 4);
        
        ctx.fillStyle = '#fff';
        ctx.fillText(`${levelAbbr} ${level}`, barX + 50, barHeight / 2 + 4);
        fontManager.applyLetterSpacing(ctx, false);
        ctx.restore();
        
        // Валюты справа
        const coins = window.profileSystem ? window.profileSystem.getCoins() : 0;
        const gems = window.profileSystem ? window.profileSystem.getGems() : 0;
        
        ctx.save();
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        const iconSize = 48;
        const iconTextGap = 5;
        
        // Обычные монеты
        ctx.font = fontManager.getFont(18, 'bold');
        ctx.textAlign = 'right';
        const coinsX = barX + barWidth - 50;
        const coinsY = barHeight / 2 + 6;
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${coins}`, coinsX, coinsY);
        ctx.fillStyle = '#fff';
        ctx.fillText(`${coins}`, coinsX, coinsY);
        
        if (this.sprites.coinIcon && this.sprites.coinIcon.complete) {
            const textWidth = ctx.measureText(`${coins}`).width;
            ctx.drawImage(this.sprites.coinIcon, coinsX - textWidth - iconSize - iconTextGap, coinsY - iconSize / 2 - 2, iconSize, iconSize);
        }
        
        // Премиум валюта
        const gemsX = barX + barWidth - 190;
        const gemsY = barHeight / 2 + 6;
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${gems}`, gemsX, gemsY);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`${gems}`, gemsX, gemsY);
        
        if (this.sprites.gemIcon && this.sprites.gemIcon.complete) {
            const textWidth = ctx.measureText(`${gems}`).width;
            ctx.drawImage(this.sprites.gemIcon, gemsX - textWidth - iconSize - iconTextGap, gemsY - iconSize / 2 - 2, iconSize, iconSize);
        }
        
        ctx.restore();
        
        // Индикатор времени суток по центру верхней панели (как в главном меню)
        if (window.game && window.game.dayNightSystem) {
            const timeIconSize = 32;
            
            // Получаем данные о времени
            const isNight = window.game.dayNightSystem.isNight;
            const timeString = window.game.dayNightSystem.getFormattedTime();
            
            // Измеряем ширину времени для центрирования
            ctx.font = fontManager.getFont(18, 'bold');
            const timeTextWidth = ctx.measureText(timeString).width;
            const totalWidth = timeIconSize + 10 + timeTextWidth;
            
            // Центрируем по панели
            const timeX = barX + (barWidth - totalWidth) / 2;
            const timeY = barHeight / 2;
            
            // Рисуем иконку времени суток
            ctx.font = `${timeIconSize}px Arial`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(isNight ? '🌙' : '☀️', timeX, timeY);
            
            // Рисуем время справа от иконки
            ctx.font = fontManager.getFont(18, 'bold');
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText(timeString, timeX + timeIconSize + 10, timeY + 6);
            ctx.fillStyle = '#fff';
            ctx.fillText(timeString, timeX + timeIconSize + 10, timeY + 6);
        }
        
        // Кнопка выхода (домой) - в правом верхнем углу
        this.renderExitButton(ctx);
        
        // Полоска опыта рядом с текстом Ур.
        this.renderXPBarInTopPanel(ctx, barX, barWidth, barHeight);
    }
    
    // Полоска опыта в верхней панели
    renderXPBarInTopPanel(ctx, barX, barWidth, barHeight) {
        if (!window.profileSystem) {
            return;
        }

        const xp = window.profileSystem.getXP();
        const xpForNext = window.profileSystem.getXPForNextLevel();
        
        if (xpForNext === 0) {
            return;
        }
        
        const progressBarWidth = 200;
        const progressBarHeight = 16;
        const progressBarX = barX + 155;
        const progressBarY = (barHeight - progressBarHeight) / 2 + 3;

        ctx.save();

        // Фон полоски
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 8);
        ctx.fill();

        // Заполнение полоски
        const progress = xp / xpForNext;
        const fillWidth = (progressBarWidth - 4) * progress;

        if (fillWidth > 0) {
            const xpGradient = ctx.createLinearGradient(progressBarX + 2, progressBarY, progressBarX + 2 + fillWidth, progressBarY);
            xpGradient.addColorStop(0, '#3498db');
            xpGradient.addColorStop(1, '#2980b9');

            ctx.fillStyle = xpGradient;
            ctx.beginPath();
            ctx.roundRect(progressBarX + 2, progressBarY + 2, fillWidth, progressBarHeight - 4, 6);
            ctx.fill();
        }

        // Текст с цифрами справа от полоски
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = fontManager.getFont(16, 'bold');
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const textX = progressBarX + progressBarWidth + 10;
        const textY = progressBarY + progressBarHeight / 2;
        
        ctx.strokeText(`${xp}/${xpForNext}`, textX, textY);
        ctx.fillStyle = '#fff';
        ctx.fillText(`${xp}/${xpForNext}`, textX, textY);

        ctx.restore();
    }
    
    // Рендер панели опыта (УДАЛЕН - теперь в верхней панели)
    renderXPBar(ctx) {
        // Метод оставлен пустым для совместимости
    }

    // Рендер панели снастей
    renderGearPanel(ctx) {
        // Сбрасываем все настройки контекста перед рисованием панели
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        const panel = this.gearPanel;
        const slotSize = panel.slotSize;
        const spacing = panel.spacing;
        
        // Рисуем фоновую панель uipan (увеличена на 7% по ширине и на 10% по высоте)
        if (panel.sprite && panel.sprite.complete) {
            const panelWidth = (panel.slots.length * (slotSize + spacing) + spacing * 2) * 1.07;
            const panelHeight = (slotSize + spacing * 2) * 1.10;
            const offsetX = (panelWidth - (panel.slots.length * (slotSize + spacing) + spacing * 2)) / 2;
            const offsetY = (panelHeight - (slotSize + spacing * 2)) / 2;
            ctx.drawImage(panel.sprite, panel.x - offsetX, panel.y - spacing - offsetY, panelWidth, panelHeight);
        }
        
        // Получаем текущее снаряжение
        const equipment = this.progression ? this.progression.getEquipmentInfo() : {};
        
        // Рендерим каждый слот
        panel.slots.forEach((slot, index) => {
            let x = panel.x + spacing + index * (slotSize + spacing);
            let y = panel.y - 8; // Все значки подняты на 8 пикселей (было 10, уменьшено на 15%)
            
            // Индивидуальные смещения для каждого слота (уменьшены на 15%)
            if (slot.type === 'bait') {
                x -= 8; // Наживка левее на 8 пикселей (было 10)
                y -= 3; // Наживка выше на 3 пикселя (было 4)
            } else if (slot.type === 'hook') {
                x += 8; // Крючок правее на 8 пикселей (было 10)
            } else if (slot.type === 'float') {
                x += 26; // Поплавок правее на 26 пикселей (было 30)
            } else if (slot.type === 'line') {
                x += 34; // Леска правее на 34 пикселя (было 40)
            } else if (slot.type === 'reel') {
                x += 46; // Катушка правее на 46 пикселей (еще +10)
                y += 0; // Катушка на базовой линии (было 3, подняли еще на 3)
            } else if (slot.type === 'rod') {
                x += 34; // Удочка правее на 34 пикселя (было 40)
            }
            
            // Проверяем наличие и состояние снасти
            let isEquipped = false;
            let isBroken = false;
            
            // Слот бонусов всегда "установлен"
            if (slot.type === 'bonus') {
                isEquipped = true;
            } else if (slot.type !== 'bait' && this.gearInventory) {
                const equipped = this.gearInventory.getEquippedGear(slot.type);
                isEquipped = equipped !== null;
                // Не проверяем isBroken, так как сломанные снасти автоматически снимаются
            } else if (slot.type === 'bait' && this.gearInventory) {
                const equippedBait = this.gearInventory.getEquippedBait();
                isEquipped = equippedBait && equippedBait.count > 0;
            }
            
            ctx.save();
            
            // Убраны квадратные подложки со скругленными краями
            
            ctx.restore();
            
            // Если слот пуст - показываем вопросительный знак
            if (!isEquipped) {
                ctx.save();
                ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
                ctx.font = fontManager.getFont(54, 'normal'); // Уменьшено на 15% (было 64)
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('❓', x + slotSize / 2, y + slotSize / 2);
                ctx.restore();
            } else {
                // Иконка снасти - используем спрайт для поплавка, лески, крючка и удочки, смайлик для остальных
                ctx.save();
                
                if (slot.type === 'float' && equipment.float) {
                    const floatTier = equipment.float.tier;
                    const floatSpriteKey = `float_${String(floatTier).padStart(2, '0')}.png`;
                    const floatSprite = assetManager.getImage(floatSpriteKey);
                    
                    if (floatSprite) {
                        const spriteSize = slotSize * 0.8;
                        ctx.drawImage(floatSprite, x + slotSize / 2 - spriteSize / 2, y + slotSize / 2 - spriteSize / 2, spriteSize, spriteSize);
                    } else {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = fontManager.getFont(54, 'normal');
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(slot.label, x + slotSize / 2, y + slotSize / 2);
                    }
                } else if (slot.type === 'line' && equipment.line) {
                    const lineTier = equipment.line.tier;
                    const lineSpriteKey = `l_${lineTier}.png`;
                    const lineSprite = assetManager.getImage(lineSpriteKey);
                    
                    if (lineSprite) {
                        const spriteSize = slotSize * 0.8;
                        ctx.drawImage(lineSprite, x + slotSize / 2 - spriteSize / 2, y + slotSize / 2 - spriteSize / 2, spriteSize, spriteSize);
                    } else {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = fontManager.getFont(54, 'normal');
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(slot.label, x + slotSize / 2, y + slotSize / 2);
                    }
                } else if (slot.type === 'hook' && equipment.hook) {
                    const hookTier = equipment.hook.tier;
                    const hookSpriteKey = `k_${hookTier}.png`;
                    const hookSprite = assetManager.getImage(hookSpriteKey);
                    
                    if (hookSprite) {
                        const spriteSize = slotSize * 0.8;
                        ctx.drawImage(hookSprite, x + slotSize / 2 - spriteSize / 2, y + slotSize / 2 - spriteSize / 2, spriteSize, spriteSize);
                    } else {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = fontManager.getFont(54, 'normal');
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(slot.label, x + slotSize / 2, y + slotSize / 2);
                    }
                } else if (slot.type === 'rod' && equipment.rod) {
                    const rodTier = equipment.rod.tier;
                    const rodSpriteKey = `u${rodTier}.png`;
                    const rodSprite = assetManager.getImage(rodSpriteKey);
                    
                    if (rodSprite) {
                        const spriteSize = slotSize * 0.8;
                        ctx.drawImage(rodSprite, x + slotSize / 2 - spriteSize / 2, y + slotSize / 2 - spriteSize / 2, spriteSize, spriteSize);
                    } else {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = fontManager.getFont(54, 'normal');
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(slot.label, x + slotSize / 2, y + slotSize / 2);
                    }
                } else if (slot.type === 'reel' && equipment.reel) {
                    const reelTier = equipment.reel.tier;
                    const reelSpriteKey = `h${reelTier}.png`;
                    const reelSprite = assetManager.getImage(reelSpriteKey);
                    
                    if (reelSprite) {
                        const spriteSize = slotSize * 0.8;
                        ctx.drawImage(reelSprite, x + slotSize / 2 - spriteSize / 2, y + slotSize / 2 - spriteSize / 2, spriteSize, spriteSize);
                    } else {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = fontManager.getFont(54, 'normal');
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(slot.label, x + slotSize / 2, y + slotSize / 2);
                    }
                } else {
                    // Для наживки используем спрайт
                    if (slot.type === 'bait' && this.gearInventory) {
                        const equippedBait = this.gearInventory.getEquippedBait();
                        if (equippedBait) {
                            const baitSpriteKey = `n${equippedBait.id}.png`;
                            const baitSprite = assetManager.getImage(baitSpriteKey);
                            
                            if (baitSprite) {
                                ctx.drawImage(baitSprite, x, y, slotSize, slotSize);
                            } else {
                                // Fallback на эмодзи
                                ctx.fillStyle = '#FFFFFF';
                                ctx.font = fontManager.getFont(54, 'normal');
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(equippedBait.emoji || slot.label, x + slotSize / 2, y + slotSize / 2);
                            }
                        } else {
                            // Нет наживки - показываем иконку слота
                            ctx.fillStyle = '#FFFFFF';
                            ctx.font = fontManager.getFont(54, 'normal');
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(slot.label, x + slotSize / 2, y + slotSize / 2);
                        }
                    } else {
                        // Для остальных снастей используем смайлики
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = fontManager.getFont(54, 'normal');
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(slot.label, x + slotSize / 2, y + slotSize / 2);
                    }
                }
                
                ctx.restore();
                
                // Tier/уровень снасти убран (У1, И2, #1 и т.д.)
            }
        });
        
        // Рисуем индикаторы прочности/наживок ПОСЛЕ всех иконок (вторым проходом)
        panel.slots.forEach((slot, index) => {
            // Пропускаем слот бонусов
            if (slot.type === 'bonus') return;
            
            const x = panel.x + spacing + index * (slotSize + spacing);
            const y = panel.y;
            
            // Проверяем наличие снасти
            let isEquipped = false;
            if (slot.type !== 'bait' && this.gearInventory) {
                const equipped = this.gearInventory.getEquippedGear(slot.type);
                isEquipped = equipped !== null; // Снятые снасти (null) не показывают индикатор
            } else if (slot.type === 'bait' && this.gearInventory) {
                const equippedBait = this.gearInventory.getEquippedBait();
                isEquipped = equippedBait && equippedBait.count > 0;
            }
            
            // ============= ИНДИКАТОР ПРОЧНОСТИ / СЧЕТЧИК НАЖИВОК =============
            if (slot.type === 'bait') {
                // Счетчик наживок - берем из инвентаря если есть
                let baitCount = 0;
                if (this.gearInventory) {
                    const equippedBait = this.gearInventory.getEquippedBait();
                    baitCount = equippedBait ? equippedBait.count : 0;
                } else if (this.progression) {
                    baitCount = this.progression.baitCount || 0;
                }
                
                ctx.save();
                
                // Фон счетчика (поднят ближе к наживке на 8 пикселей, уменьшен на 15%)
                const counterSize = 27; // Уменьшено на 15% (было 32)
                const counterX = x + slotSize - counterSize - 3; // Уменьшено на 15% (было 4)
                const counterY = y + slotSize - counterSize - 12; // Уменьшено на 15% (было 14)
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.beginPath();
                ctx.arc(counterX + counterSize / 2, counterY + counterSize / 2, counterSize / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Обводка
                ctx.strokeStyle = baitCount > 0 ? '#2ecc71' : '#e74c3c';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Число наживок
                ctx.fillStyle = baitCount > 0 ? '#fff' : '#e74c3c';
                ctx.font = fontManager.getFont(17); // Уменьшено на 15% (было 20)
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(baitCount.toString(), counterX + counterSize / 2, counterY + counterSize / 2);
                
                ctx.restore();
            } else if (slot.type !== 'bait' && this.progression && isEquipped) {
                // ========== ПОЛОСА ПРОЧНОСТИ (ПЕРЕДЕЛАННАЯ) ==========
                const durabilityPercent = this.progression.getDurabilityPercent(slot.type);
                const durabilityState = this.progression.getDurabilityState(slot.type);
                
                // Параметры полоски (поднята на 7 пикселей для крючка, поплавка, лески и удочки, уменьшена на 15%)
                const barHeight = 8; // Уменьшено на 15% (было 10)
                const barWidth = slotSize - 10; // Уменьшено на 15% (было 12)
                let barX = x + 5; // Уменьшено на 15% (было 6)
                let barY = y + slotSize - barHeight - 5; // Уменьшено на 15% (было 6)
                
                // Поднимаем полоски для крючка, поплавка, лески, катушки и удочки на 7 пикселей (было 8)
                if (slot.type === 'hook' || slot.type === 'float' || slot.type === 'line' || slot.type === 'reel' || slot.type === 'rod') {
                    barY -= 7; // Уменьшено на 15% (было 8)
                }
                
                // Смещаем полоски по X чтобы они были под соответствующими элементами (уменьшено на 15%)
                if (slot.type === 'hook') {
                    barX += 8; // Под крючком (было 10)
                } else if (slot.type === 'float') {
                    barX += 26; // Под поплавком (было 30)
                } else if (slot.type === 'line') {
                    barX += 34; // Под леской (было 40)
                } else if (slot.type === 'reel') {
                    barX += 46; // Под катушкой (как иконка)
                } else if (slot.type === 'rod') {
                    barX += 34; // Под удочкой (было 40)
                }
                
                const barRadius = 3; // Уменьшено на 15% (было 4)
                
                // Создаем изолированный контекст для полоски
                ctx.save();
                
                // Полный сброс всех параметров контекста
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = 'source-over';
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                if (ctx.filter !== undefined) ctx.filter = 'none';
                
                // 1. Рисуем темную подложку (фон полоски)
                ctx.fillStyle = '#1a1a1a';
                ctx.beginPath();
                ctx.roundRect(barX, barY, barWidth, barHeight, barRadius);
                ctx.fill();
                
                // 2. Рисуем цветную полоску прочности
                const fillWidth = Math.max(0, barWidth * (durabilityPercent / 100));
                
                if (fillWidth > 0) {
                    // Используем яркий цвет напрямую
                    const brightColor = durabilityState.color;
                    ctx.fillStyle = brightColor;
                    ctx.beginPath();
                    ctx.roundRect(barX, barY, fillWidth, barHeight, barRadius);
                    ctx.fill();
                }
                
                // 3. Добавляем тонкую обводку для четкости
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(barX, barY, barWidth, barHeight, barRadius);
                ctx.stroke();
                
                ctx.restore();
                
                // 4. Рисуем текст процента (в отдельном контексте)
                ctx.save();
                
                ctx.globalAlpha = 1;
                ctx.font = fontManager.getFont(14); // Уменьшено на 15% (было 16)
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Черная обводка для читаемости
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 3;
                ctx.strokeText(`${Math.round(durabilityPercent)}%`, barX + barWidth / 2, barY + barHeight / 2);
                
                // Белый текст
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`${Math.round(durabilityPercent)}%`, barX + barWidth / 2, barY + barHeight / 2);
                
                ctx.restore();
            }
        });
        
        ctx.restore(); // Восстанавливаем контекст после всей панели
    }
}

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
