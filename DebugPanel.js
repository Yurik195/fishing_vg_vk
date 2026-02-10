// Дебаг панель для тестирования игры
class DebugPanel {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.panel = null;
        this.createPanel();
        this.setupKeyListener();
    }

    createPanel() {
        // Создаем контейнер панели
        this.panel = document.createElement('div');
        this.panel.id = 'debug-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            border: 2px solid #00ff00;
            border-radius: 10px;
            padding: 20px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            display: none;
            max-height: 80vh;
            overflow-y: auto;
        `;

        // Заголовок
        const title = document.createElement('h3');
        title.textContent = 'DEBUG PANEL';
        title.style.cssText = `
            margin: 0 0 15px 0;
            color: #00ff00;
            text-align: center;
            border-bottom: 1px solid #00ff00;
            padding-bottom: 10px;
        `;
        this.panel.appendChild(title);

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 10px;
            background: none;
            border: none;
            color: #ff0000;
            font-size: 18px;
            cursor: pointer;
            font-weight: bold;
        `;
        closeBtn.onclick = () => this.hide();
        this.panel.appendChild(closeBtn);

        // Создаем кнопки
        this.createButtons();

        // Добавляем панель в документ
        document.body.appendChild(this.panel);
    }

    createButtons() {
        const buttonStyle = `
            width: 100%;
            padding: 8px;
            margin: 5px 0;
            background: #333;
            color: white;
            border: 1px solid #666;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        `;

        const activeButtonStyle = `
            width: 100%;
            padding: 8px;
            margin: 5px 0;
            background: #006600;
            color: white;
            border: 1px solid #00ff00;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        `;

        // Функция создания кнопки
        const createButton = (text, onClick, isToggle = false) => {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.style.cssText = buttonStyle;
            btn.onmouseover = () => btn.style.background = isToggle && btn.classList.contains('active') ? '#008800' : '#555';
            btn.onmouseout = () => btn.style.background = isToggle && btn.classList.contains('active') ? '#006600' : '#333';
            btn.onclick = () => {
                onClick();
                if (isToggle) {
                    this.updateToggleButton(btn);
                }
            };
            this.panel.appendChild(btn);
            return btn;
        };

        // Кнопки управления ресурсами
        createButton('+1 Уровень', () => {
            if (this.game.fishingGame && this.game.fishingGame.progression) {
                const oldLevel = this.game.fishingGame.progression.level;
                
                // Повышаем уровень напрямую и обнуляем текущий опыт
                this.game.fishingGame.progression.level++;
                this.game.fishingGame.progression.currentXP = 0;
                
                // Ограничиваем максимальный уровень до 100
                if (this.game.fishingGame.progression.level > 100) {
                    this.game.fishingGame.progression.level = 100;
                }
                
                // Пересчитываем опыт для следующего уровня
                const coefficient = this.game.fishingGame.progression.level < 20 ? 1.2 : 1.09;
                this.game.fishingGame.progression.xpToNextLevel = Math.floor(100 * Math.pow(coefficient, this.game.fishingGame.progression.level - 1));
                
                const newLevel = this.game.fishingGame.progression.level;
                console.log(`[DEBUG] Уровень повышен с ${oldLevel} до ${newLevel}, текущий опыт: ${this.game.fishingGame.progression.currentXP}`);
            }
        });

        createButton('+100 Монет', () => {
            if (this.game.fishingGame) {
                this.game.fishingGame.coins += 100;
                console.log(`[DEBUG] Добавлено 100 монет! Всего: ${this.game.fishingGame.coins}`);
            }
        });

        createButton('+100 Марок', () => {
            if (this.game.fishingGame) {
                this.game.fishingGame.premiumCoins += 100;
                console.log(`[DEBUG] Добавлено 100 марок! Всего: ${this.game.fishingGame.premiumCoins}`);
            }
        });

        createButton('Обнулить валюты', () => {
            if (this.game.fishingGame) {
                this.game.fishingGame.coins = 0;
                this.game.fishingGame.premiumCoins = 0;
                console.log(`[DEBUG] Валюты обнулены! Монеты: ${this.game.fishingGame.coins}, Марки: ${this.game.fishingGame.premiumCoins}`);
            }
        });

        createButton('Обнулить уровень', () => {
            if (this.game.fishingGame && this.game.fishingGame.progression) {
                this.game.fishingGame.progression.level = 1;
                this.game.fishingGame.progression.currentXP = 0;
                this.game.fishingGame.progression.xpToNextLevel = 100;
                console.log(`[DEBUG] Уровень обнулен! Уровень: ${this.game.fishingGame.progression.level}, Опыт: ${this.game.fishingGame.progression.currentXP}`);
            }
        });

        // Разделитель
        const separator1 = document.createElement('hr');
        separator1.style.cssText = 'border: 1px solid #666; margin: 15px 0;';
        this.panel.appendChild(separator1);

        // Кнопки читов
        this.monsterBtn = createButton('Монстры 100%', () => {
            window.DEBUG_MONSTER_CHANCE = window.DEBUG_MONSTER_CHANCE ? false : true;
            console.log(`[DEBUG] Монстры 100%: ${window.DEBUG_MONSTER_CHANCE ? 'ВКЛ' : 'ВЫКЛ'}`);
        }, true);

        this.itemBtn = createButton('Предметы 100%', () => {
            window.DEBUG_ITEM_CHANCE = window.DEBUG_ITEM_CHANCE ? false : true;
            console.log(`[DEBUG] Предметы 100%: ${window.DEBUG_ITEM_CHANCE ? 'ВКЛ' : 'ВЫКЛ'}`);
        }, true);

        this.legendaryBtn = createButton('Легендарные 100%', () => {
            window.DEBUG_LEGENDARY_CHANCE = window.DEBUG_LEGENDARY_CHANCE ? false : true;
            console.log(`[DEBUG] Легендарные рыбы 100%: ${window.DEBUG_LEGENDARY_CHANCE ? 'ВКЛ' : 'ВЫКЛ'}`);
        }, true);

        // Разделитель
        const separator2 = document.createElement('hr');
        separator2.style.cssText = 'border: 1px solid #666; margin: 15px 0;';
        this.panel.appendChild(separator2);

        // Кнопки коллекции
        createButton('Открыть всех рыб', () => {
            if (this.game.collectionSystem && window.FISH_DATABASE) {
                window.FISH_DATABASE.forEach(fish => {
                    this.game.collectionSystem.caughtFish.add(fish.id);
                });
                console.log(`[DEBUG] Открыты все рыбы в энциклопедии (${window.FISH_DATABASE.length} шт.)`);
            }
        });

        createButton('Открыть всех монстров', () => {
            if (this.game.collectionSystem && window.MONSTERS_DATABASE) {
                window.MONSTERS_DATABASE.forEach(monster => {
                    this.game.collectionSystem.caughtMonsters.add(monster.id);
                });
                console.log(`[DEBUG] Открыты все монстры в энциклопедии (${window.MONSTERS_DATABASE.length} шт.)`);
            }
        });

        // Разделитель
        const separator3 = document.createElement('hr');
        separator3.style.cssText = 'border: 1px solid #666; margin: 15px 0;';
        this.panel.appendChild(separator3);

        // Кнопки облачных сохранений
        createButton('💾 Сохранить сейчас', async () => {
            console.log('[DEBUG] Принудительное сохранение...');
            await this.game.saveGameData();
            alert('Данные сохранены! Проверьте консоль для деталей.');
        });

        createButton('📥 Загрузить сейчас', async () => {
            console.log('[DEBUG] Принудительная загрузка...');
            await this.game.loadGameData();
            alert('Данные загружены! Проверьте консоль для деталей.');
        });

        createButton('🔍 Проверить облако', async () => {
            console.log('[DEBUG] Проверка облачных сохранений...');
            console.log('SDK инициализирован:', this.game.sdkInitialized);
            console.log('Player готов:', window.playgamaSDK?.isPlayerReady);
            
            if (window.playgamaSDK?.isPlayerReady) {
                try {
                    const data = await window.playgamaSDK.player.getData();
                    console.log('Данные из облака:', data);
                    alert(`Облачные данные:\nМонеты: ${data.coins || 0}\nГемы: ${data.premiumCoins || 0}\nУровень: ${data.level || 1}\n\nПодробности в консоли`);
                } catch (error) {
                    console.error('Ошибка загрузки из облака:', error);
                    alert('Ошибка! Проверьте консоль.');
                }
            } else {
                alert('Player не готов! SDK не инициализирован или игрок не авторизован.');
            }
        });

        // Разделитель
        const separator4 = document.createElement('hr');
        separator4.style.cssText = 'border: 1px solid #666; margin: 15px 0;';
        this.panel.appendChild(separator4);

        // Информационная секция
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = `
            font-size: 11px;
            color: #aaa;
            text-align: center;
            margin-top: 10px;
        `;
        infoDiv.innerHTML = `
            <div>Нажмите 'ъ' для открытия/закрытия</div>
            <div style="margin-top: 5px;">Читы работают только во время рыбалки</div>
        `;
        this.panel.appendChild(infoDiv);
    }

    updateToggleButton(btn) {
        const isActive = btn.classList.contains('active');
        if (isActive) {
            btn.classList.remove('active');
            btn.style.cssText = `
                width: 100%;
                padding: 8px;
                margin: 5px 0;
                background: #333;
                color: white;
                border: 1px solid #666;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            `;
        } else {
            btn.classList.add('active');
            btn.style.cssText = `
                width: 100%;
                padding: 8px;
                margin: 5px 0;
                background: #006600;
                color: white;
                border: 1px solid #00ff00;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            `;
        }
    }

    setupKeyListener() {
        // Отключено для продакшена - раскомментируйте для тестирования
        /*
        document.addEventListener('keydown', (event) => {
            // Проверяем нажатие клавиши 'ъ' (русская раскладка) или ']' (английская)
            if (event.code === 'BracketRight') {
                event.preventDefault();
                this.toggle();
            }
        });
        */
    }

    show() {
        this.isVisible = true;
        this.panel.style.display = 'block';
        this.updateButtonStates();
        console.log('[DEBUG] Дебаг панель открыта');
    }

    updateButtonStates() {
        // Обновляем состояние кнопок читов
        if (this.monsterBtn) {
            if (window.DEBUG_MONSTER_CHANCE) {
                this.monsterBtn.classList.add('active');
                this.updateToggleButton(this.monsterBtn);
            }
        }
        if (this.itemBtn) {
            if (window.DEBUG_ITEM_CHANCE) {
                this.itemBtn.classList.add('active');
                this.updateToggleButton(this.itemBtn);
            }
        }
        if (this.legendaryBtn) {
            if (window.DEBUG_LEGENDARY_CHANCE) {
                this.legendaryBtn.classList.add('active');
                this.updateToggleButton(this.legendaryBtn);
            }
        }
    }

    hide() {
        this.isVisible = false;
        this.panel.style.display = 'none';
        console.log('[DEBUG] Дебаг панель закрыта');
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    // Обновление информации в панели (если нужно)
    update() {
        // Здесь можно добавить обновление информации в реальном времени
    }
}

// Глобальные переменные для читов
window.DEBUG_MONSTER_CHANCE = false;
window.DEBUG_ITEM_CHANCE = false;
window.DEBUG_LEGENDARY_CHANCE = false;