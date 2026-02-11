// Экран "Дом" с навигацией по разделам игры
class HomeScreen {
    constructor(canvas, onNavigate, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onNavigate = onNavigate; // Callback для навигации
        this.audioManager = audioManager;
        
        // Загрузка изображений
        this.images = {
            background: null,
            playButton: null,
            topBar: null,
            settingsIcon: null,
            coinIcon: null,
            gemIcon: null,
            // Иконки для правых кнопок
            profileIcon: null,
            encIcon: null,
            ratingIcon: null,
            // Иконки для левых кнопок
            trophyIcon: null,
            questIcon: null,
            rewardIcon: null,
            // Иконки для нижних кнопок
            mapIcon: null,
            shopIcon: null,
            invIcon: null,
            marketIcon: null
        };
        
        this.loadImages();
        
        // Центральная кнопка "Играть"
        this.playButton = { id: 'fishing', label: L('play', 'Играть'), x: 0, y: 0, width: 200, height: 80 };
        
        // Нижние кнопки (квадратные с иконками)
        this.bottomButtons = [
            { id: 'map', label: L('map', 'Локации'), icon: 'mapIcon', sprite: 'kart.png', x: 0, y: 0, width: 100, height: 100 },
            { id: 'shop', label: L('shop', 'Магазин'), icon: 'shopIcon', sprite: 'magaz.png', x: 0, y: 0, width: 100, height: 100 },
            { id: 'inventory', label: L('inventory', 'Инвентарь'), icon: 'invIcon', sprite: 'inv.png', x: 0, y: 0, width: 100, height: 100 },
            { id: 'market', label: L('market', 'Рынок'), icon: 'marketIcon', sprite: 'rinok.png', x: 0, y: 0, width: 100, height: 100 }
        ];
        
        // Правые кнопки (квадратные с иконками)
        this.rightButtons = [
            { id: 'profile', label: L('profile', 'Профиль'), icon: 'profileIcon', sprite: 'profl.png', x: 0, y: 0, width: 100, height: 100 },
            { id: 'collection', label: L('collection', 'Энциклопедия'), icon: 'encIcon', sprite: 'enc.png', x: 0, y: 0, width: 100, height: 100 },
            { id: 'rating', label: L('rating', 'Рейтинг'), icon: 'ratingIcon', sprite: 'reit.png', x: 0, y: 0, width: 100, height: 100 }
        ];
        
        // Левые кнопки (квадратные с иконками)
        this.leftButtons = [
            { id: 'trophies', label: L('trophies', 'Трофеи'), icon: 'trophyIcon', sprite: 'traf.png', x: 0, y: 0, width: 100, height: 100 },
            { id: 'quests', label: L('quests', 'Задания'), icon: 'questIcon', sprite: 'zad.png', x: 0, y: 0, width: 100, height: 100 },
            { id: 'rewards', label: L('rewards', 'Награды'), icon: 'rewardIcon', sprite: 'podr.png', x: 0, y: 0, width: 100, height: 100 }
        ];
        
        // VK кнопки (показываются только на платформе VK)
        this.vkButtons = [
            { id: 'vk_share', label: '📤', emoji: '📤', x: 0, y: 0, width: 80, height: 80 },
            { id: 'vk_community', label: '👥', emoji: '👥', x: 0, y: 0, width: 80, height: 80 }
        ];
        
        // Кнопка настроек (невидимая, в верхней панели)
        this.settingsButton = { id: 'settings', x: 0, y: 0, width: 50, height: 50 };
        
        this.hoveredButton = null;
        this.imagesLoaded = false;
        this.updateLayout();
    }
    
    // Обновить тексты кнопок после смены языка
    updateButtonLabels() {
        this.playButton.label = L('play', 'Играть');
        
        // Сбрасываем флаг отладки, чтобы увидеть новое название локации
        this._locationDebugLogged = false;
        
        // Обновляем нижние кнопки
        this.bottomButtons[0].label = L('map', 'Локации');
        this.bottomButtons[1].label = L('shop', 'Магазин');
        this.bottomButtons[2].label = L('inventory', 'Инвентарь');
        this.bottomButtons[3].label = L('market', 'Рынок');
        
        // Обновляем правые кнопки
        this.rightButtons[0].label = L('profile', 'Профиль');
        this.rightButtons[1].label = L('collection', 'Энциклопедия');
        this.rightButtons[2].label = L('rating', 'Рейтинг');
        
        // Обновляем левые кнопки
        this.leftButtons[0].label = L('trophies', 'Трофеи');
        this.leftButtons[1].label = L('quests', 'Задания');
        this.leftButtons[2].label = L('rewards', 'Награды');
        
        // VK кнопки не требуют обновления (используют эмодзи)
        
        console.log('[HomeScreen] Тексты кнопок обновлены для языка:', window.localizationSystem?.currentLocale);
    }
    
    loadImages() {
        const imagesToLoad = [
            { key: 'playButton', src: 'go.png' },
            { key: 'topBar', src: 'ramk.png' },
            { key: 'settingsIcon', src: 'nastr.png' },
            { key: 'coinIcon', src: 'sereb.png' },
            { key: 'gemIcon', src: 'mark.png' },
            // Правые кнопки
            { key: 'profileIcon', src: 'profl.png' },
            { key: 'encIcon', src: 'enc.png' },
            { key: 'ratingIcon', src: 'reit.png' },
            // Левые кнопки
            { key: 'trophyIcon', src: 'traf.png' },
            { key: 'questIcon', src: 'zad.png' },
            { key: 'rewardIcon', src: 'podr.png' },
            // Нижние кнопки
            { key: 'mapIcon', src: 'kart.png' },
            { key: 'shopIcon', src: 'magaz.png' },
            { key: 'invIcon', src: 'inv.png' },
            { key: 'marketIcon', src: 'rinok.png' }
        ];
        
        let loadedCount = 0;
        
        imagesToLoad.forEach(({ key, src }) => {
            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                loadedCount++;
                if (loadedCount === imagesToLoad.length) {
                    this.imagesLoaded = true;
                }
            };
            img.onerror = () => {
                console.warn(`Не удалось загрузить изображение: ${src}`);
                loadedCount++;
                if (loadedCount === imagesToLoad.length) {
                    this.imagesLoaded = true;
                }
            };
            img.src = src;
        });
        
        // Загружаем фон из облака через AssetManager
        if (window.assetManager) {
            window.assetManager.loadLocationBackground('fon.jpg').then(img => {
                this.images.background = img;
            });
        }
    }
    
    updateLayout() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Центральная кнопка "Играть" - растянута по ширине, сдвинута на 20px вправо
        this.playButton.width = 400;
        this.playButton.height = 100;
        this.playButton.x = (w - this.playButton.width) / 2 + 20; // Сдвиг на 20px вправо
        this.playButton.y = (h - this.playButton.height) / 2;
        
        // Нижние кнопки - квадратные с иконками
        const bottomMargin = 40; // Увеличен отступ снизу, чтобы поднять кнопки выше (было 20)
        const bottomSpacing = 35; // Еще больше увеличен отступ между кнопками (было 20)
        const bottomButtonSize = 100;
        const totalBottomWidth = bottomButtonSize * this.bottomButtons.length + bottomSpacing * (this.bottomButtons.length - 1);
        const bottomStartX = (w - totalBottomWidth) / 2;
        
        this.bottomButtons.forEach((btn, i) => {
            btn.width = bottomButtonSize;
            btn.height = bottomButtonSize;
            btn.x = bottomStartX + i * (bottomButtonSize + bottomSpacing);
            btn.y = h - bottomButtonSize - bottomMargin;
        });
        
        // Правые кнопки - квадратные с иконками
        const rightMargin = 50; // Увеличен отступ от края и сдвинуты к центру
        const rightSpacing = 40; // Еще больше увеличен отступ между кнопками (было 25)
        const rightButtonSize = 100;
        const topBarHeight = 60;
        const totalRightHeight = rightButtonSize * this.rightButtons.length + rightSpacing * (this.rightButtons.length - 1);
        const rightStartY = topBarHeight + 20 + (h - topBarHeight - 20 - totalRightHeight) / 2;
        
        this.rightButtons.forEach((btn, i) => {
            btn.width = rightButtonSize;
            btn.height = rightButtonSize;
            btn.x = w - rightButtonSize - rightMargin;
            btn.y = rightStartY + i * (rightButtonSize + rightSpacing);
        });
        
        // Левые кнопки - квадратные с иконками
        const leftMargin = 50; // Увеличен отступ от края и сдвинуты к центру
        const leftSpacing = 40; // Еще больше увеличен отступ между кнопками (было 25)
        const leftButtonSize = 100;
        const totalLeftHeight = leftButtonSize * this.leftButtons.length + leftSpacing * (this.leftButtons.length - 1);
        const leftStartY = topBarHeight + 20 + (h - topBarHeight - 20 - totalLeftHeight) / 2;
        
        this.leftButtons.forEach((btn, i) => {
            btn.width = leftButtonSize;
            btn.height = leftButtonSize;
            btn.x = leftMargin;
            btn.y = leftStartY + i * (leftButtonSize + leftSpacing);
        });
        
        // VK кнопки (только на платформе VK)
        const vkButtonSize = 80;
        const vkMargin = 40;
        
        // Кнопка "Поделиться" - слева снизу
        this.vkButtons[0].width = vkButtonSize;
        this.vkButtons[0].height = vkButtonSize;
        this.vkButtons[0].x = vkMargin;
        this.vkButtons[0].y = h - vkButtonSize - vkMargin;
        
        // Кнопка "Сообщество" - справа снизу
        this.vkButtons[1].width = vkButtonSize;
        this.vkButtons[1].height = vkButtonSize;
        this.vkButtons[1].x = w - vkButtonSize - vkMargin;
        this.vkButtons[1].y = h - vkButtonSize - vkMargin;
        
        // Кнопка настроек (в правом верхнем углу верхней панели)
        this.settingsButton.width = 50;
        this.settingsButton.height = 50;
        this.settingsButton.x = w - 60;
        this.settingsButton.y = 5;
    }
    
    handleClick(x, y) {
        // Воспроизводим звук клика
        if (this.audioManager) this.audioManager.playClickSound();
        
        // Запускаем музыку при первом клике (если еще не запущена или на паузе)
        if (window.game && window.game.audioManager) {
            const audioMgr = window.game.audioManager;
            
            if (!audioMgr.music) {
                console.warn('🎵 Музыка еще не загружена');
            } else if (audioMgr.music.paused) {
                console.log('🎵 Музыка на паузе, запускаем...');
                audioMgr.playMusic(); // Без параметров - использует уже загруженную музыку
            } else {
                console.log('🎵 Музыка уже играет');
            }
        }
        
        // Проверяем, завершен ли туториал или это не первая сессия
        const showAllButtons = window.tutorialSystem ? 
            (window.tutorialSystem.isTutorialCompleted() || !window.tutorialSystem.isFirstFishingSession()) : 
            true;
        
        // Проверка центральной кнопки "Играть" - всегда доступна
        if (this.isPointInButton(x, y, this.playButton)) {
            this.onNavigate('fishing');
            return true;
        }
        
        // Проверка кнопки настроек - всегда доступна
        if (this.isPointInButton(x, y, this.settingsButton)) {
            this.onNavigate('settings');
            return true;
        }
        
        // Остальные кнопки доступны только после первой рыбалки
        if (!showAllButtons) {
            return false;
        }
        
        // Проверка нижних кнопок
        for (const btn of this.bottomButtons) {
            if (this.isPointInButton(x, y, btn)) {
                this.onNavigate(btn.id);
                return true;
            }
        }
        
        // Проверка правых кнопок
        // Для VK и OK платформ скрываем кнопку "Рейтинг"
        const platform = window.playgamaSDK?.platform;
        for (const btn of this.rightButtons) {
            // Пропускаем кнопку рейтинга для VK и OK
            if (btn.id === 'rating' && (platform === 'vk' || platform === 'ok')) {
                continue;
            }
            if (this.isPointInButton(x, y, btn)) {
                this.onNavigate(btn.id);
                return true;
            }
        }
        
        // Проверка левых кнопок
        for (const btn of this.leftButtons) {
            if (this.isPointInButton(x, y, btn)) {
                this.onNavigate(btn.id);
                return true;
            }
        }
        
        // Проверка VK кнопок (только на платформе VK)
        if (this.isVKPlatform()) {
            for (const btn of this.vkButtons) {
                if (this.isPointInButton(x, y, btn)) {
                    this.handleVKButtonClick(btn.id);
                    return true;
                }
            }
        }
        
        return false;
    }
    
    isPointInButton(x, y, btn) {
        return x >= btn.x && x <= btn.x + btn.width &&
               y >= btn.y && y <= btn.y + btn.height;
    }
    
    handleMouseMove(x, y) {
        this.hoveredButton = null;
        
        // Проверка центральной кнопки
        if (this.isPointInButton(x, y, this.playButton)) {
            this.hoveredButton = this.playButton;
            return;
        }
        
        // Проверка нижних кнопок
        for (const btn of this.bottomButtons) {
            if (this.isPointInButton(x, y, btn)) {
                this.hoveredButton = btn;
                return;
            }
        }
        
        // Проверка правых кнопок
        // Для VK и OK платформ скрываем кнопку "Рейтинг"
        const platform = window.playgamaSDK?.platform;
        for (const btn of this.rightButtons) {
            // Пропускаем кнопку рейтинга для VK и OK
            if (btn.id === 'rating' && (platform === 'vk' || platform === 'ok')) {
                continue;
            }
            if (this.isPointInButton(x, y, btn)) {
                this.hoveredButton = btn;
                return;
            }
        }
        
        // Проверка левых кнопок
        for (const btn of this.leftButtons) {
            if (this.isPointInButton(x, y, btn)) {
                this.hoveredButton = btn;
                return;
            }
        }
        
        // Проверка VK кнопок (только на платформе VK)
        if (this.isVKPlatform()) {
            for (const btn of this.vkButtons) {
                if (this.isPointInButton(x, y, btn)) {
                    this.hoveredButton = btn;
                    return;
                }
            }
        }
        
        // Проверка кнопки настроек
        if (this.isPointInButton(x, y, this.settingsButton)) {
            this.hoveredButton = this.settingsButton;
        }
    }
    
    update(dt) {
        this.updateLayout();
    }
    
    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Пытаемся запустить музыку если она загружена но не играет
        if (window.game && window.game.audioManager) {
            const audioMgr = window.game.audioManager;
            if (audioMgr.music && audioMgr.music.paused && audioMgr.musicEnabled && !audioMgr.isMuted) {
                // Музыка загружена но на паузе - пытаемся запустить
                audioMgr.playMusic();
            }
        }
        
        // Проверяем, завершен ли туториал или это не первая сессия
        const showAllButtons = window.tutorialSystem ? 
            (window.tutorialSystem.isTutorialCompleted() || !window.tutorialSystem.isFirstFishingSession()) : 
            true;
        
        // Фон - загружаем из облака
        const backgroundImg = assetManager.getImage('backgrounds/fon.jpg');
        if (backgroundImg) {
            ctx.drawImage(backgroundImg, 0, 0, w, h);
        } else {
            // Если фон еще не загружен, загружаем его
            if (!this._backgroundLoading) {
                this._backgroundLoading = true;
                assetManager.loadImage('backgrounds/fon.jpg').then(() => {
                    this._backgroundLoading = false;
                });
            }
            
            // Показываем градиент пока фон загружается
            const gradient = ctx.createLinearGradient(0, 0, 0, h);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
        }
        
        // Верхняя панель (ramk.png)
        this.renderTopBar(ctx, w);
        
        // Центральная кнопка "Играть" (go.png) - всегда видна
        this.renderPlayButton(ctx);
        
        // Остальные кнопки показываем только после первой рыбалки
        if (showAllButtons) {
            // Нижние кнопки (квадратные с иконками)
            this.bottomButtons.forEach(btn => {
                this.renderSquareButton(ctx, btn);
            });
            
            // Правые кнопки (квадратные с иконками)
            // Для VK и OK платформ скрываем кнопку "Рейтинг"
            const platform = window.playgamaSDK?.platform;
            this.rightButtons.forEach(btn => {
                // Пропускаем кнопку рейтинга для VK и OK
                if (btn.id === 'rating' && (platform === 'vk' || platform === 'ok')) {
                    return;
                }
                this.renderSquareButton(ctx, btn);
            });
            
            // Левые кнопки (квадратные с иконками)
            this.leftButtons.forEach(btn => {
                this.renderSquareButton(ctx, btn);
            });
        }
        
        // VK кнопки (показываются только на платформе VK)
        if (this.isVKPlatform()) {
            this.vkButtons.forEach(btn => {
                this.renderVKButton(ctx, btn);
            });
        }
    }
    
    renderTopBar(ctx, w) {
        const barHeight = 60;
        const barWidth = w * 0.8; // Уменьшаем ширину на 20%
        const barX = (w - barWidth) / 2; // Центрируем
        
        // Фон верхней панели
        if (this.images.topBar) {
            ctx.drawImage(this.images.topBar, barX, 0, barWidth, barHeight);
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(barX, 0, barWidth, barHeight);
        }
        
        // Уровень слева на зеленой области - поднимаем на 4 пикселя выше
        const level = window.profileSystem ? window.profileSystem.getLevel() : 1;
        ctx.save();
        
        // Черная обводка для текста уровня
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = fontManager.getFont(20, 'bold');
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const levelAbbr = L('level_abbr', 'Ур.');
        ctx.strokeText(`${levelAbbr} ${level}`, barX + 50, barHeight / 2 + 4); // Поднято на 4 пикселя (было +8)
        
        ctx.fillStyle = '#fff';
        ctx.fillText(`${levelAbbr} ${level}`, barX + 50, barHeight / 2 + 4);
        fontManager.applyLetterSpacing(ctx, false);
        ctx.restore();
        
        // Валюты справа - немного сдвинуты вправо
        const coins = window.profileSystem ? window.profileSystem.getCoins() : 0;
        const gems = window.profileSystem ? window.profileSystem.getGems() : 0;
        
        ctx.save();
        
        // Включаем сглаживание для качественных изображений
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        const iconSize = 48; // Увеличено в 2 раза (было 24)
        const iconTextGap = 5;
        
        // Обычные монеты со спрайтом sereb.png
        ctx.font = fontManager.getFont(18, 'bold');
        ctx.textAlign = 'right';
        const coinsX = barX + barWidth - 50; // Сдвинуты левее на 10 пикселей (было -40)
        const coinsY = barHeight / 2 + 6;
        
        // Рисуем текст монет: белый текст с черной обводкой
        ctx.strokeStyle = '#000'; // Черная обводка
        ctx.lineWidth = 3;
        ctx.strokeText(`${coins}`, coinsX, coinsY);
        ctx.fillStyle = '#fff'; // Белый текст
        ctx.fillText(`${coins}`, coinsX, coinsY);
        
        // Рисуем иконку монет слева от текста (поднята на 2 пикселя)
        if (this.images.coinIcon) {
            const textWidth = ctx.measureText(`${coins}`).width;
            ctx.drawImage(this.images.coinIcon, coinsX - textWidth - iconSize - iconTextGap, coinsY - iconSize / 2 - 2, iconSize, iconSize);
        }
        
        // Премиум валюта со спрайтом mark.png
        const gemsX = barX + barWidth - 190; // Сдвинуты левее на 10 пикселей (было -180)
        const gemsY = barHeight / 2 + 6;
        
        // Рисуем текст гемов: золотой текст с черной обводкой
        ctx.strokeStyle = '#000'; // Черная обводка
        ctx.lineWidth = 3;
        ctx.strokeText(`${gems}`, gemsX, gemsY);
        ctx.fillStyle = '#FFD700'; // Золотой текст
        ctx.fillText(`${gems}`, gemsX, gemsY);
        
        // Рисуем иконку гемов слева от текста (поднята на 2 пикселя)
        if (this.images.gemIcon) {
            const textWidth = ctx.measureText(`${gems}`).width;
            ctx.drawImage(this.images.gemIcon, gemsX - textWidth - iconSize - iconTextGap, gemsY - iconSize / 2 - 2, iconSize, iconSize);
        }
        
        ctx.restore();
        
        // Индикатор времени суток по центру верхней панели
        if (window.game && window.game.dayNightSystem) {
            const timeIconSize = 32;
            
            // Получаем данные о времени
            const isNight = window.game.dayNightSystem.isNight;
            const timeString = window.game.dayNightSystem.getFormattedTime();
            
            // Измеряем ширину времени для центрирования
            ctx.font = fontManager.getFont(18, 'bold');
            const timeTextWidth = ctx.measureText(timeString).width;
            const totalWidth = timeIconSize + 10 + timeTextWidth; // иконка + отступ + текст
            
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
        
        // Кнопка настроек - увеличена в 2 раза, в правом верхнем углу с отступами, с ховером
        const settingsSize = 100; // Увеличено в 2 раза (было 50)
        const settingsMargin = 20; // Отступ от края
        const settingsX = w - settingsSize - settingsMargin; // Правый верхний угол
        const settingsY = settingsMargin; // Отступ сверху
        const isSettingsHovered = this.hoveredButton === this.settingsButton;
        
        ctx.save();
        
        // Применяем масштаб при ховере
        if (isSettingsHovered) {
            ctx.translate(settingsX + settingsSize / 2, settingsY + settingsSize / 2);
            ctx.scale(1.1, 1.1);
            ctx.translate(-(settingsX + settingsSize / 2), -(settingsY + settingsSize / 2));
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 15;
        }
        
        if (this.images.settingsIcon) {
            // Рисуем спрайт настроек
            ctx.drawImage(this.images.settingsIcon, settingsX, settingsY, settingsSize, settingsSize);
        } else {
            // Запасной вариант - эмодзи
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.font = fontManager.getFont(48); // Увеличен размер шрифта
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText('⚙️', settingsX + settingsSize / 2, settingsY + settingsSize / 2);
            ctx.fillStyle = '#fff';
            ctx.fillText('⚙️', settingsX + settingsSize / 2, settingsY + settingsSize / 2);
        }
        
        ctx.restore();
        
        // Обновляем позицию кнопки настроек для кликов
        this.settingsButton.x = settingsX;
        this.settingsButton.y = settingsY;
        this.settingsButton.width = settingsSize;
        this.settingsButton.height = settingsSize;
        
        // Полоска опыта рядом с текстом Ур. - рисуем в конце, чтобы была поверх
        this.renderXPBar(ctx, barX, barWidth, barHeight);
    }
    
    // Полоска опыта - справа от текста Ур.
    renderXPBar(ctx, barX, barWidth, barHeight) {
        if (!window.profileSystem) {
            return;
        }

        const xp = window.profileSystem.getXP();
        const xpForNext = window.profileSystem.getXPForNextLevel();
        
        // Если нет системы опыта (xpForNext = 0), не рисуем полоску
        if (xpForNext === 0) {
            return;
        }
        
        // Позиция полоски - сдвигаем еще правее на 15 пикселей
        const progressBarWidth = 200;
        const progressBarHeight = 16;
        const progressBarX = barX + 155; // Сдвинуто еще правее (было 140)
        const progressBarY = (barHeight - progressBarHeight) / 2 + 3; // Сдвинуто ниже на 3 пикселя

        ctx.save();

        // Фон полоски
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.drawRoundRect(ctx, progressBarX, progressBarY, progressBarWidth, progressBarHeight, 8);
        ctx.fill();

        // Заполнение полоски
        const progress = xp / xpForNext;
        const fillWidth = (progressBarWidth - 4) * progress;

        if (fillWidth > 0) {
            const xpGradient = ctx.createLinearGradient(progressBarX + 2, progressBarY, progressBarX + 2 + fillWidth, progressBarY);
            xpGradient.addColorStop(0, '#3498db');
            xpGradient.addColorStop(1, '#2980b9');

            ctx.fillStyle = xpGradient;
            this.drawRoundRect(ctx, progressBarX + 2, progressBarY + 2, fillWidth, progressBarHeight - 4, 6);
            ctx.fill();
        }

        // Текст с цифрами справа от полоски - также сдвигаем ниже
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
    
    renderPlayButton(ctx) {
        const btn = this.playButton;
        const isHovered = this.hoveredButton === btn;
        const scale = isHovered ? 1.1 : 1;
        
        ctx.save();
        ctx.translate(btn.x + btn.width / 2, btn.y + btn.height / 2);
        ctx.scale(scale * 1.1, scale * 1.1); // Увеличиваем на 10%
        
        if (isHovered) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 20;
        }
        
        // Фон кнопки - сдвинут левее
        if (this.images.playButton) {
            ctx.drawImage(this.images.playButton, -btn.width / 2 - 30, -btn.height / 2, btn.width, btn.height);
        } else {
            ctx.fillRect(-btn.width / 2 - 30, -btn.height / 2, btn.width, btn.height);
        }
        
        // Текст "Играть" с черной обводкой - увеличен на 30%
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = fontManager.getFont(42, 'bold'); // 32 * 1.3 ≈ 42
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const playText = L('play', 'Играть');
        ctx.strokeText(playText, 0, 0);
        ctx.fillStyle = '#fff';
        ctx.fillText(playText, 0, 0);
        fontManager.applyLetterSpacing(ctx, false);
        
        ctx.restore();
    }
    
    renderBottomButton(ctx, btn) {
        const isHovered = this.hoveredButton === btn;
        const scale = isHovered ? 1.05 : 1;
        
        ctx.save();
        ctx.translate(btn.x + btn.width / 2, btn.y + btn.height / 2);
        ctx.scale(scale, scale);
        
        if (isHovered) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 15;
        }
        
        // Рисуем иконку кнопки (go.png)
        if (this.images.playButton) {
            ctx.drawImage(this.images.playButton, -btn.width / 2, -btn.height / 2, btn.width, btn.height);
        }
        
        // Текст с черной обводкой
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // Для "Инвентарь" уменьшаем на 5%
        const fontSize = btn.label === 'Инвентарь' ? 25 : 26; // 26 * 0.95 ≈ 25
        ctx.font = fontManager.getFont(fontSize, 'bold');
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(btn.label, 0, 0);
        ctx.fillStyle = '#fff';
        ctx.fillText(btn.label, 0, 0);
        fontManager.applyLetterSpacing(ctx, false);
        
        ctx.restore();
    }
    
    renderSquareButton(ctx, btn) {
        const isHovered = this.hoveredButton === btn;
        const scale = isHovered ? 1.1 : 1;
        
        ctx.save();
        ctx.translate(btn.x + btn.width / 2, btn.y + btn.height / 2);
        ctx.scale(scale, scale);
        
        // Рисуем черную круглую подложку с сильно размытыми краями
        const bgRadius = btn.width * 0.96; // Радиус подложки уменьшен на 20% (1.2 * 0.8 = 0.96)
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bgRadius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)'); // Еще темнее на 40% (0.94 * 1.4 = 1.316, ограничено до 1)
        gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.66)'); // Еще темнее на 40% (0.47 * 1.4 = 0.658 ≈ 0.66)
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.22)'); // Еще темнее на 40% (0.16 * 1.4 = 0.224 ≈ 0.22)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, bgRadius, 0, Math.PI * 2);
        ctx.fill();
        
        if (isHovered) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 15;
        }
        
        ctx.shadowColor = 'transparent';
        
        // Рисуем иконку (увеличена в 2 раза - до 140% размера кнопки)
        if (this.images[btn.icon]) {
            const iconSize = btn.width * 1.4;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(this.images[btn.icon], -iconSize / 2, -iconSize / 2 - 10, iconSize, iconSize);
        }
        
        // Текст снизу с черной обводкой (увеличен на 30%, опущен ниже)
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = fontManager.getFont(26, 'bold');
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        // Для нижних кнопок текст опущен еще на 6 пикселей
        const textOffset = btn.y > this.canvas.height / 2 ? 11 : 5; // Если кнопка внизу, опускаем на 11 (5+6)
        ctx.strokeText(btn.label, 0, btn.height / 2 + textOffset);
        ctx.fillStyle = '#fff';
        ctx.fillText(btn.label, 0, btn.height / 2 + textOffset);
        fontManager.applyLetterSpacing(ctx, false);
        
        ctx.restore();
        
        // Уведомления
        if (btn.id === 'quests' && window.questSystem && window.questSystem.hasUnclaimedQuests()) {
            this.renderNotificationBadge(ctx, btn.x + btn.width - 10, btn.y + 10);
        }
        
        if (btn.id === 'rewards' && window.dailyRewardsSystem && window.dailyRewardsSystem.canClaimToday()) {
            this.renderNotificationBadge(ctx, btn.x + btn.width - 10, btn.y + 10);
        }
    }
    
    renderSideButton(ctx, btn) {
        const isHovered = this.hoveredButton === btn;
        const scale = isHovered ? 1.1 : 1;
        
        ctx.save();
        ctx.translate(btn.x + btn.width / 2, btn.y + btn.height / 2);
        ctx.scale(scale, scale);
        
        if (isHovered) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 15;
        }
        
        // Рисуем иконку кнопки
        if (btn.icon && this.images[btn.icon]) {
            ctx.drawImage(this.images[btn.icon], -btn.width / 2, -btn.height / 2, btn.width, btn.height);
        }
        
        // Текст с черной обводкой - увеличен на 40%
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = fontManager.getFont(28, 'bold'); // 20 * 1.4 = 28
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(btn.label, 0, 0);
        ctx.fillStyle = '#fff';
        ctx.fillText(btn.label, 0, 0);
        fontManager.applyLetterSpacing(ctx, false);
        
        ctx.restore();
        
        // Уведомления
        if (btn.id === 'quests' && window.questSystem && window.questSystem.hasUnclaimedQuests()) {
            this.renderNotificationBadge(ctx, btn.x + btn.width - 10, btn.y + 10);
        }
        
        if (btn.id === 'rewards' && window.dailyRewardsSystem && window.dailyRewardsSystem.canClaimToday()) {
            this.renderNotificationBadge(ctx, btn.x + btn.width - 10, btn.y + 10);
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
    
    // Проверка, запущена ли игра на платформе VK
    isVKPlatform() {
        if (!window.playgamaSDK) {
            return false;
        }
        return window.playgamaSDK.platform === 'vk';
    }
    
    // Обработка клика по VK кнопкам
    handleVKButtonClick(buttonId) {
        if (!window.playgamaSDK || !window.playgamaSDK.sdk) {
            console.warn('[HomeScreen] Playgama SDK не доступен');
            return;
        }
        
        if (buttonId === 'vk_share') {
            // Кнопка "Поделиться"
            this.shareToVK();
        } else if (buttonId === 'vk_community') {
            // Кнопка "Сообщество"
            this.openVKCommunity();
        }
    }
    
    // Поделиться игрой в VK
    async shareToVK() {
        console.log('[HomeScreen] Открываем окно "Поделиться" VK');
        
        try {
            const sdk = window.playgamaSDK.sdk;
            
            // Проверяем наличие API социальных функций
            if (sdk.social && typeof sdk.social.share === 'function') {
                await sdk.social.share({
                    text: 'Играю в рыболовную игру! Присоединяйся!'
                });
                console.log('[HomeScreen] Окно "Поделиться" открыто');
            } else {
                console.warn('[HomeScreen] API социальных функций недоступно');
            }
        } catch (error) {
            console.error('[HomeScreen] Ошибка при открытии окна "Поделиться":', error);
        }
    }
    
    // Открыть сообщество VK
    openVKCommunity() {
        console.log('[HomeScreen] Открываем сообщество VK');
        
        const communityUrl = 'https://vk.com/club217329390';
        
        try {
            // Открываем в новом окне
            window.open(communityUrl, '_blank');
            console.log('[HomeScreen] Сообщество VK открыто в новом окне');
        } catch (error) {
            console.error('[HomeScreen] Ошибка при открытии сообщества VK:', error);
        }
    }
    
    // Рендер VK кнопки
    renderVKButton(ctx, btn) {
        const isHovered = this.hoveredButton === btn;
        const scale = isHovered ? 1.1 : 1;
        
        ctx.save();
        ctx.translate(btn.x + btn.width / 2, btn.y + btn.height / 2);
        ctx.scale(scale, scale);
        
        // Рисуем круглую подложку с градиентом VK (синий)
        const bgRadius = btn.width * 0.5;
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bgRadius);
        gradient.addColorStop(0, 'rgba(0, 119, 255, 0.9)'); // VK синий
        gradient.addColorStop(0.7, 'rgba(0, 119, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(0, 119, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, bgRadius, 0, Math.PI * 2);
        ctx.fill();
        
        if (isHovered) {
            ctx.shadowColor = 'rgba(0, 119, 255, 0.8)';
            ctx.shadowBlur = 20;
        }
        
        ctx.shadowColor = 'transparent';
        
        // Рисуем эмодзи
        ctx.font = `${btn.width * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(btn.emoji, 0, 0);
        
        ctx.restore();
    }
    
    // Вспомогательный метод для рисования скругленных прямоугольников
    drawRoundRect(ctx, x, y, width, height, radius) {
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
