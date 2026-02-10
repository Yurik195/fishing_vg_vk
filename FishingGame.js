// Основной класс игры рыбалки
console.log('[FishingGame.js] Файл загружен, определяем класс FishingGame');
class FishingGame {
    constructor(canvas, inputManager, onExit = null, currentLocationId = 1) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.inputManager = inputManager;
        this.onExit = onExit; // Callback для выхода в главное меню
        
        // Время создания (для проверки готовности SDK)
        this.createdAt = Date.now();
        
        // ID текущей локации (передается из main.js)
        this.currentLocationId = currentLocationId;
        this.currentZone = currentLocationId; // Сохраняем текущую зону
        
        // Компоненты
        this.stateMachine = new FishingStateMachine();
        this.waterRenderer = new WaterRenderer(canvas, currentLocationId);
        this.progression = new FishingProgression();
        this.bobber = new Bobber(this.progression); // Передаем ссылку на прогрессию
        this.line = new FishingLine();
        this.gearInventory = new GearInventory();
        this.rod = new FishingRod(canvas, this.progression); // Передаем ссылку на прогрессию
        this.premiumEffects = new PremiumEffectsManager(); // Менеджер премиум эффектов
        
        this.zoneSystem = new FishingZoneSystem(canvas.width, canvas.height, currentLocationId); // Система зон
        
        this.ui = new FishingUI(canvas, this.progression, this.gearInventory);
        this.ui.setCurrentLocation(currentLocationId); // Устанавливаем текущую локацию для UI
        this.resultModal = new ResultModal(canvas);
        this.storageUI = new FishStorageUI(canvas);
        this.gearInventoryUI = new GearInventoryUI(canvas, this.gearInventory);
        this.bonusInventoryUI = new BonusInventoryUI(canvas, this.premiumEffects);
        this.tutorialHighlight = new TutorialHighlight(canvas); // Система подсветки для туториала
        
        // audioManager будет установлен позже из main.js
        this.audioManager = null;

        // Настройка обработчиков садка
        this.setupStorageUI();
        
        // Настройка инвентаря снастей
        this.setupGearInventory();
        
        // Игровые данные - начальные значения
        this.coins = 0; // Начальные монеты
        this.premiumCoins = 0; // Начальные марки
        
        // Разблокированные зоны (первая зона открыта по умолчанию)
        this.unlockedZones = [1];
        
        // Садок
        this.keepnetCapacity = 10; // Начальная вместимость
        this.keepnetUpgradeLevel = 0; // Уровень улучшения
        
        this.caughtFish = [];
        this.storedFish = []; // Рыба в садке
        this.storageCapacity = 10; // В кг
        this.currentFish = null;
        this.currentFishWeight = 0;
        // this.currentZone уже установлена выше (строка 11)
        this.currentZoneFish = null; // Текущая рыба из зоны
        this.hookTimeRemaining = 0;
        this.biteDelayRemaining = 0; // Задержка перед доступностью подсечки
        this.isReeling = false;
        this.tension = 0;
        
        // Новая система фаз поклевки
        this.bitePhase = 0; // 0 = легкое притапливание, 1 = основная поклевка (правильный момент), 2 = снова легкое
        this.bitePhaseTimer = 0; // Таймер текущей фазы
        this.bitePhaseDurations = [0.8, 1.5, 0.8]; // Длительность каждой фазы в секундах
        this.missedHookAttempts = 0; // Счетчик промахов
        this.maxMissedAttempts = 3; // Максимум промахов до потери наживки
        
        // Механика сопротивления рыбы
        this.fishResistance = 0;
        this.fishStrugglePower = 0;
        this.fishStruggleFrequency = 2.0;
        this.timeSinceLastStruggle = 0;
        this.lineCooldown = 0; // Время "остывания" лески
        this.maxCooldown = 2.0; // Максимальное время остывания
        this.overloadTime = 0; // Время перегрузки лески (для режима новичка)
        
        // Время ожидания поклёвки
        this.waitTime = 0;
        this.targetWaitTime = 0;
        
        // Флаг блокировки поклевок (когда игрок вытаскивает удочку)
        this.isRetractingRod = false;
        
        this.setupStateMachine();
        this.setupInput();
        this.setupResultModal();
        
        // Начальная подсказка будет показана при входе в состояние IDLE
        // (не показываем здесь, чтобы язык успел установиться)
        
        // НЕ запускаем туториал в конструкторе - он запустится при входе в IDLE
        // this.startTutorialIfNeeded(); // УБРАНО - будет вызвано после установки языка
        
        // НЕ вызываем transition(IDLE) здесь - данные еще не загружены
        // Переход в IDLE произойдет при navigateTo('fishing')
    }
    
    // Запустить туториал если это первый вход
    startTutorialIfNeeded() {
        // Проверяем что туториал не завершен
        if (window.tutorialSystem && !window.tutorialSystem.isTutorialCompleted() && 
            window.tutorialSystem.isNoviceMode() && window.tutorialSystem.getCurrentStep() === 'cast') {
            const waterArea = {
                x: this.canvas.width / 2,
                y: this.canvas.height * 0.55,
                radius: 180
            };
            const text = L('tutorial_cast', 'Нажмите на воду для заброса');
            this.tutorialHighlight.show(waterArea, text);
        }
    }
    
    // Обновить текст подсказок после смены языка
    updateTutorialText() {
        // Показываем подсказку если мы в IDLE состоянии
        if (this.stateMachine && this.stateMachine.currentState === FISHING_CONFIG.STATES.IDLE) {
            // Всегда показываем обычную подсказку
            const message = L('tutorial_cast', 'Нажмите на воду для заброса');
            this.ui.showHint(message);
            
            // Дополнительно обновляем подсветку туториала если она активна
            // ВАЖНО: Проверяем что данные загружены через флаг dataLoaded
            if (window.tutorialSystem && 
                window.tutorialSystem.dataLoaded === true &&
                window.tutorialSystem.tutorialCompleted === false &&
                window.tutorialSystem.getCurrentStep() === 'cast') {
                const waterArea = {
                    x: this.canvas.width / 2,
                    y: this.canvas.height * 0.55,
                    radius: 180
                };
                const text = L('tutorial_cast', 'Нажмите на воду для заброса');
                this.tutorialHighlight.show(waterArea, text);
            }
        }
    }
    
    // Установить audioManager и передать его в UI компоненты
    setAudioManager(audioManager) {
        this.audioManager = audioManager;
        // Передаем audioManager в UI компоненты которые его используют
        if (this.gearInventoryUI) this.gearInventoryUI.audioManager = audioManager;
        if (this.bonusInventoryUI) this.bonusInventoryUI.audioManager = audioManager;
        if (this.storageUI) this.storageUI.audioManager = audioManager;
    }
    
    // Добавить XP с проверкой повышения уровня и звуком
    addXPWithSound(xp) {
        const oldLevel = this.progression.level;
        this.progression.addXP(xp);
        const newLevel = this.progression.level;
        
        // Если уровень повысился, воспроизводим звук
        if (newLevel > oldLevel && this.audioManager) {
            this.audioManager.playSound('newur');
        }
    }
    
    // Установить текущую локацию
    setLocation(locationId) {
        this.currentLocationId = locationId;
        this.currentZone = locationId;
        
        // Обновляем систему зон с новой локацией
        this.zoneSystem.setLocationTier(locationId);
        
        // Обновляем фон воды
        if (this.waterRenderer) {
            this.waterRenderer.updateZone(locationId);
        }
        
        // Обновляем локацию в UI для контроля показа подсказок
        if (this.ui && this.ui.setCurrentLocation) {
            this.ui.setCurrentLocation(locationId);
        }
    }
    
    setupStateMachine() {
        const STATES = FISHING_CONFIG.STATES;
        
        // Вход в состояние IDLE
        this.stateMachine.on(`enter:${FISHING_CONFIG.STATES.IDLE}`, () => {
            // Полный сброс всех состояний
            this.bobber.reset();
            this.line.reset();
            this.rod.reset();
            
            // Останавливаем все зацикленные звуки
            if (this.audioManager) {
                this.audioManager.stopAllLoopingSounds();
            }

            // Сброс игровых переменных
            this.currentFish = null;
            this.hookTimeRemaining = 0;
            this.biteDelayRemaining = 0;
            this.isReeling = false;
            this.tension = 0;
            this.waitTime = 0;
            this.targetWaitTime = 0;
            this.isRetractingRod = false; // Сбрасываем флаг блокировки поклевок
            
            // Сброс фаз поклевки
            this.bitePhase = 0;
            this.bitePhaseTimer = 0;
            this.missedHookAttempts = 0;

            // Сброс UI
            this.ui.hideHookButton();
            this.ui.hideRetractButton();
            this.ui.hideReelButton();
            this.ui.hideTensionBar();
            this.ui.hideHookTimer();
            
            // Всегда показываем обычную подсказку о забросе
            this.ui.showHint(L('tutorial_cast', 'Нажмите на воду для заброса'));
            
            // Дополнительно показываем туториальную подсветку для новичков
            // ВАЖНО: Проверяем что данные загружены через флаг dataLoaded
            console.log('[Tutorial Debug] enter:IDLE проверка:', {
                tutorialSystem: !!window.tutorialSystem,
                dataLoaded: window.tutorialSystem?.dataLoaded,
                tutorialCompleted: window.tutorialSystem?.tutorialCompleted,
                tutorialFishCount: window.tutorialSystem?.tutorialFishCount,
                maxAttempts: window.tutorialSystem?.maxTutorialAttempts,
                currentStep: window.tutorialSystem?.getCurrentStep()
            });
            
            if (window.tutorialSystem && 
                window.tutorialSystem.dataLoaded === true &&
                window.tutorialSystem.tutorialCompleted === false &&
                window.tutorialSystem.getCurrentStep() === 'cast') {
                
                console.log('[Tutorial] Показываем подсветку туториала');
                // Показываем визуальную подсветку для туториала
                const waterArea = {
                    x: this.canvas.width / 2,
                    y: this.canvas.height * 0.55,
                    radius: 180
                };
                const text = L('tutorial_cast', 'Нажмите на воду для заброса');
                this.tutorialHighlight.show(waterArea, text);
            } else {
                console.log('[Tutorial] НЕ показываем подсветку туториала');
                this.tutorialHighlight.hide();
            }
        });
        
        // Вход в состояние CASTING
        this.stateMachine.on(`enter:${FISHING_CONFIG.STATES.CASTING}`, (data) => {
            this.ui.hideHint();
            
            // Скрываем туториал при забросе
            this.tutorialHighlight.hide();
            
            // Звук взмаха удочки с задержкой 0.5 секунды
            if (this.audioManager) {
                setTimeout(() => {
                    this.audioManager.playSound('vzmah');
                }, 500);
            }
            
            // Запускаем анимацию заброса
            this.rod.startCastAnimation(() => {
                // После анимации заброса - получаем текущую позицию кончика удочки
                const tipPos = this.rod.getTipPosition();
                // Запускаем поплавок от текущей позиции кончика удочки
                this.bobber.castTo(tipPos.x, tipPos.y, data.targetX, data.targetY);
                this.line.show();
            });
        });
        
        // Обновление состояния CASTING
        this.stateMachine.on(`update:${FISHING_CONFIG.STATES.CASTING}`, ({ dt }) => {
            if (this.bobber.isLanded) {
                // Звук падения поплавка в воду (случайный из 3)
                if (this.audioManager) {
                    this.audioManager.playRandomSound(['pop1', 'pop2', 'pop3']);
                }
                
                // Переход к следующему шагу туториала (от заброса к ожиданию поклевки)
                if (window.tutorialSystem && window.tutorialSystem.isNoviceMode() && window.tutorialSystem.getCurrentStep() === 'cast') {
                    window.tutorialSystem.nextStep();
                }
                
                this.stateMachine.transition(FISHING_CONFIG.STATES.WAITING);
            }
        });
        
        // Вход в состояние WAITING
        this.stateMachine.on(`enter:${FISHING_CONFIG.STATES.WAITING}`, () => {
            // Показываем кнопку возврата удочки
            this.ui.showRetractButton();
            
            // Проверяем наличие наживки
            const equippedBait = this.gearInventory.getEquippedBait();
            if (!equippedBait || equippedBait.count <= 0) {
                this.ui.showHint(L('no_bait_no_bites', 'Нет наживки! Поклевок не будет'));
                // Не устанавливаем таймер поклевки - просто ждем
                this.targetWaitTime = Infinity; // Бесконечное ожидание без наживки
                this.waitTime = 0;
                return;
            }
            
            // Прикормка уменьшает время ожидания
            const biteBoost = this.premiumEffects.getBiteFrequencyMultiplier();
            const baseWaitTime = FISHING_CONFIG.WAITING.MIN_TIME + 
                Math.random() * (FISHING_CONFIG.WAITING.MAX_TIME - FISHING_CONFIG.WAITING.MIN_TIME);
            this.targetWaitTime = baseWaitTime / biteBoost;
            this.waitTime = 0;
            this.ui.showHint(L('waiting_for_bite', 'Ждём поклёвку...'));
        });
        
        // Обновление состояния WAITING
        this.stateMachine.on(`update:${FISHING_CONFIG.STATES.WAITING}`, ({ dt }) => {
            // Если игрок уже вытаскивает удочку - блокируем поклевки
            if (this.isRetractingRod) {
                return;
            }
            
            // Проверяем наличие наживки каждый кадр
            const equippedBait = this.gearInventory.getEquippedBait();
            if (!equippedBait || equippedBait.count <= 0) {
                // Наживка закончилась - показываем сообщение и ждем без поклевок
                const currentTime = Math.floor(this.waitTime);
                if (currentTime % 3 === 0 && this.waitTime - currentTime < dt) { // Каждые 3 секунды
                    this.ui.showHint(L('no_bait_no_bites', 'Нет наживки! Поклевок не будет'));
                }
                this.waitTime += dt;
                return; // Не проверяем поклевку без наживки
            }
            
            this.waitTime += dt;
            if (this.waitTime >= this.targetWaitTime) {
                // Проверяем есть ли рыба в зоне перед поклевкой
                this.selectRandomFish();
                
                if (this.currentFish) {
                    // Есть рыба - переходим к поклевке
                    this.stateMachine.transition(FISHING_CONFIG.STATES.BITE);
                } else {
                    // Нет рыбы - продолжаем ждать, показываем подсказку
                    if (Math.floor(this.waitTime) % 5 === 0) { // Каждые 5 секунд
                        this.ui.showHint(L('no_fish_here', 'Здесь нет рыбы...'));
                    }
                    this.waitTime = 0; // Сбрасываем таймер для повторной проверки
                }
            }
        });
        
        // Вход в состояние BITE
        this.stateMachine.on(`enter:${FISHING_CONFIG.STATES.BITE}`, () => {
            // Рыба уже выбрана в WAITING, просто проверяем
            if (!this.currentFish) {
                this.stateMachine.transition(FISHING_CONFIG.STATES.WAITING);
                return;
            }
            
            // Звук поклевки (случайный из 2)
            if (this.audioManager) {
                this.audioManager.playRandomSound(['pods1', 'pods2']);
            }
            
            // Скрываем кнопку возврата во время поклевки
            this.ui.hideRetractButton();
            
            // Рассчитываем динамическую длительность фазы подсечки
            // Базовая длительность: 1.5 сек
            // Для редких/тяжелых рыб - короче (минимум 0.3 сек)
            // Для обычных/легких - длиннее (максимум 2.0 сек)
            
            let hookWindowDuration = 1.5; // Базовая длительность
            
            // Учитываем редкость (power рыбы)
            const fishPower = this.currentFish.power || 50;
            const powerFactor = fishPower / 100; // 0.0 - 1.0
            
            // Учитываем вес рыбы
            const avgWeight = (this.currentFish.weightMin + this.currentFish.weightMax) / 2;
            const weightFactor = Math.min(avgWeight / 20, 1.0); // Нормализуем до 1.0 (20кг = максимум)
            
            // Комбинированный фактор сложности (чем выше, тем сложнее)
            const difficultyFactor = (powerFactor * 0.6 + weightFactor * 0.4); // 0.0 - 1.0
            
            // Рассчитываем длительность: от 2.0 сек (легкая) до 0.3 сек (сложная)
            hookWindowDuration = 2.0 - (difficultyFactor * 1.7);
            
            // Ограничиваем диапазон
            hookWindowDuration = Math.max(0.3, Math.min(2.0, hookWindowDuration));
            
            // Применяем бонус для новичков (увеличиваем окно подсечки в 2 раза)
            if (window.tutorialSystem && window.tutorialSystem.isNoviceMode()) {
                const noviceParams = window.tutorialSystem.getNoviceParams();
                if (noviceParams) {
                    hookWindowDuration *= noviceParams.biteWindowMultiplier;
                }
            }
            
            // Устанавливаем длительности фаз
            this.bitePhaseDurations = [0.8, hookWindowDuration, 0.8];
            
            // Запускаем поклевку с учетом стиля рыбы
            const biteStyle = this.currentFish.biteStyle;
            this.bobber.startBiteWithPhases(biteStyle);
            
            // Сбрасываем фазы поклевки (но НЕ счетчик промахов!)
            this.bitePhase = 0; // Начинаем с легкого притапливания
            this.bitePhaseTimer = 0;
            this.biteTotalTime = 0; // Общее время поклевки
            this.biteMaxTime = 15.0; // Максимум 15 секунд на поклевку
            // missedHookAttempts НЕ сбрасываем - он накапливается между поклевками
            
            // Кнопка подсечки доступна сразу (но подсекать рано!)
            this.ui.showHookButton();
            
            // Показываем подсказку на первой локации
            if (this.currentLocationId === 1) {
                this.ui.showHint(L('wait_for_strong_dip', 'Жди сильного погружения!'));
            } else {
                this.ui.showHint(L('bite', 'Поклевка!'));
            }
        });
        
        // Обновление состояния BITE
        this.stateMachine.on(`update:${FISHING_CONFIG.STATES.BITE}`, ({ dt }) => {
            // Проверяем, что мы все еще в состоянии BITE (защита от повторных вызовов)
            if (!this.stateMachine.is(FISHING_CONFIG.STATES.BITE)) {
                return;
            }
            
            // Если рыба уже сорвалась (currentFish = null), не обновляем таймер
            if (!this.currentFish) {
                return;
            }
            
            // Увеличиваем общее время поклевки
            this.biteTotalTime += dt;
            
            // Если прошло слишком много времени - рыба уходит
            if (this.biteTotalTime >= this.biteMaxTime) {
                // Рыба сорвалась
                this.ui.showHint(L('fish_escaped', 'Рыба сорвалась!'));
                this.bobber.stopBite();
                this.ui.hideHookButton();
                this.ui.hideHookTimer();
                
                // Сброс данных
                this.currentFish = null;
                this.hookTimeRemaining = 0;
                this.biteDelayRemaining = 0;
                this.bitePhase = 0;
                this.bitePhaseTimer = 0;
                this.biteTotalTime = 0;
                
                // Возвращаемся в WAITING
                setTimeout(() => {
                    if (this.stateMachine.is(FISHING_CONFIG.STATES.BITE)) {
                        this.stateMachine.transition(FISHING_CONFIG.STATES.WAITING);
                    }
                }, 1500);
                
                return;
            }
            
            // Обновляем таймер текущей фазы
            this.bitePhaseTimer += dt;
            
            // Проверяем переход к следующей фазе
            if (this.bitePhaseTimer >= this.bitePhaseDurations[this.bitePhase]) {
                this.bitePhaseTimer = 0;
                this.bitePhase++;
                
                // Обновляем фазу в поплавке
                this.bobber.setBitePhase(this.bitePhase);
                
                // Если прошли все фазы - начинаем заново (цикл)
                if (this.bitePhase >= this.bitePhaseDurations.length) {
                    this.bitePhase = 0;
                    this.bobber.setBitePhase(this.bitePhase);
                }
                
                // Обновляем подсказку на первой локации
                if (this.currentLocationId === 1) {
                    if (this.bitePhase === 1) {
                        this.ui.showHint(L('now_hook', 'СЕЙЧАС! Подсекай!'));
                    } else {
                        this.ui.showHint(L('wait_for_strong_dip', 'Жди сильного погружения!'));
                    }
                }
                
                // Подсветка кнопки подсечки для туториала (только в правильной фазе)
                if (window.tutorialSystem && window.tutorialSystem.isNoviceMode() && window.tutorialSystem.getCurrentStep() === 'hook') {
                    if (this.bitePhase === 1) {
                        // Подсвечиваем кнопку подсечки
                        const hookButtonArea = {
                            x: this.ui.hookButton.x,
                            y: this.ui.hookButton.y,
                            radius: this.ui.hookButton.size * 0.6
                        };
                        const text = L('tutorial_hook', 'Нажмите для подсечки!');
                        this.tutorialHighlight.show(hookButtonArea, text);
                    } else {
                        this.tutorialHighlight.hide();
                    }
                }
            }
            
            // Показываем прогресс фазы (убрано - не показываем таймер)
            // const phaseProgress = this.bitePhaseTimer / this.bitePhaseDurations[this.bitePhase];
            // this.ui.showHookTimer(phaseProgress);
        });
        
        // Вход в состояние HOOKING
        this.stateMachine.on(`enter:${FISHING_CONFIG.STATES.HOOKING}`, () => {
            // Проверяем фазу поклевки - правильная ли?
            const isCorrectPhase = this.bitePhase === 1; // Фаза 1 = основная поклевка (правильный момент)
            
            if (!isCorrectPhase) {
                // Промах! Подсекли не в ту фазу
                this.missedHookAttempts++;
                
                if (this.missedHookAttempts >= this.maxMissedAttempts) {
                    // Слишком много промахов - теряем наживку и рыба уходит
                    const equippedBait = this.gearInventory.getEquippedBait();
                    if (equippedBait && equippedBait.count > 0) {
                        this.gearInventory.useBait();
                        const updatedBait = this.gearInventory.getEquippedBait();
                        this.progression.baitCount = updatedBait ? updatedBait.count : 0;
                    }
                    
                    // Показываем сообщение о потере наживки (короткий текст)
                    this.ui.showHint(L('bait_eaten', 'Наживка съедена!'));
                    
                    // Останавливаем поклевку
                    this.bobber.stopBite();
                    this.ui.hideHookButton();
                    this.ui.hideHookTimer();
                    
                    // Сброс данных о текущей рыбе
                    this.currentFish = null;
                    this.hookTimeRemaining = 0;
                    this.biteDelayRemaining = 0;
                    this.bitePhase = 0;
                    this.bitePhaseTimer = 0;
                    this.missedHookAttempts = 0;
                    
                    // Анимация возврата поплавка (как при нажатии кнопки возврата)
                    const fishTargetPos = this.rod.getFishTargetPosition();
                    const bobberPos = this.bobber.getPosition();
                    const distance = Math.sqrt(
                        Math.pow(bobberPos.x - fishTargetPos.x, 2) + 
                        Math.pow(bobberPos.y - fishTargetPos.y, 2)
                    );
                    
                    // Плавное подтягивание поплавка к рыбаку
                    const retractSpeed = 300; // пикселей в секунду
                    const retractTime = distance / retractSpeed;
                    
                    // Анимация возврата
                    let elapsed = 0;
                    const retractInterval = setInterval(() => {
                        elapsed += 0.016; // ~60 FPS
                        
                        if (elapsed >= retractTime) {
                            clearInterval(retractInterval);
                            // Возвращаемся в IDLE
                            this.stateMachine.transition(FISHING_CONFIG.STATES.IDLE);
                        } else {
                            // Подтягиваем поплавок к рыбаку
                            const progress = elapsed / retractTime;
                            const currentFishTargetPos = this.rod.getFishTargetPosition();
                            this.bobber.reelTowards(currentFishTargetPos.x, currentFishTargetPos.y, retractSpeed, 0.016);
                        }
                    }, 16);
                    
                    return;
                } else {
                    // Еще есть попытки - продолжаем поклевку
                    this.ui.showHint(L('miss', 'Промах!'));
                    
                    // Возвращаемся к состоянию BITE
                    setTimeout(() => {
                        if (this.stateMachine.is(FISHING_CONFIG.STATES.HOOKING)) {
                            this.stateMachine.transition(FISHING_CONFIG.STATES.BITE);
                        }
                    }, 800);
                    return;
                }
            }
            
            // Правильная подсечка! Используем наживку
            const equippedBait = this.gearInventory.getEquippedBait();
            if (equippedBait && equippedBait.count > 0) {
                this.gearInventory.useBait();
                // Синхронизируем с прогрессией (useBait уже уменьшил count)
                const updatedBait = this.gearInventory.getEquippedBait();
                this.progression.baitCount = updatedBait ? updatedBait.count : 0;
            } else {
                // Если наживок нет - рыба сорвалась
                this.ui.showHint(L('no_bait', 'Нет наживки!'));
                
                setTimeout(() => {
                    this.fishEscaped();
                }, 1000);
                return;
            }
            
            this.bobber.stopBite();
            this.ui.hideHookButton();
            this.ui.hideHookTimer();
            
            
            // Переход к следующему шагу туториала (от подсечки к вываживанию)
            if (window.tutorialSystem && window.tutorialSystem.isNoviceMode() && window.tutorialSystem.getCurrentStep() === 'hook') {
                window.tutorialSystem.nextStep();
            }
            
            // Для всех объектов (рыба и предметы) - одинаковое вываживание
            this.ui.showHint(L('great_pull', 'Отлично! Тяни!'));
            
            // Убираем setTimeout - переходим к REELING немедленно
            if (this.stateMachine.is(FISHING_CONFIG.STATES.HOOKING)) {
                this.stateMachine.transition(FISHING_CONFIG.STATES.REELING);
            }
        });
        
        // Вход в состояние REELING
        this.stateMachine.on(`enter:${FISHING_CONFIG.STATES.REELING}`, () => {
            // Проверка наличия рыбы
            if (!this.currentFish) {
                this.ui.showHint(L('fish_escaped', 'Рыба сорвалась!'));
                setTimeout(() => {
                    this.stateMachine.transition(FISHING_CONFIG.STATES.IDLE);
                }, 1500);
                return;
            }
            
            const bobberPos = this.bobber.getPosition();
            this.fishTargetPos = this.rod.getFishTargetPosition();
            
            const dx = bobberPos.x - this.fishTargetPos.x;
            const dy = bobberPos.y - this.fishTargetPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            this.ui.showReelButton();
            this.ui.showTensionBar();
            this.ui.showHint(L('hold_reel', 'Зажми катушку!'));
            
            // Подсветка для туториала: только катушка + индикатор натяжения (без черной подложки)
            if (window.tutorialSystem && window.tutorialSystem.isNoviceMode() && window.tutorialSystem.getCurrentStep() === 'reel') {
                const areas = [
                    // Кнопка катушки
                    {
                        x: this.ui.reelButton.x,
                        y: this.ui.reelButton.y,
                        radius: this.ui.reelButton.size * 0.6
                    },
                    // Индикатор натяжения лески (верхняя полоска)
                    {
                        x: this.canvas.width / 2 - 200,
                        y: 100,
                        width: 400,
                        height: 40
                    }
                ];
                const text = L('tutorial_reel', 'Удерживайте катушку! Следите за натяжением!');
                this.tutorialHighlight.show(areas, text, { noDarkOverlay: true });
            }
            this.tension = 0.3;
            
            // Инициализация параметров сопротивления рыбы/предметов
            if (this.currentFish.type === 'junk') {
                // Для предметов - используем систему расчетов, но с адаптированными параметрами
                // Создаем временный объект "рыбы" для расчетов
                const junkAsFish = {
                    power: 30, // Умеренная сила (предметы легче большинства рыб)
                    weightMin: this.currentFish.weightMin,
                    weightMax: this.currentFish.weightMax
                };
                
                this.fishResistance = this.progression.calculateFishResistance(junkAsFish, this.currentFishWeight);
                this.fishStrugglePower = this.progression.calculateStrugglePower(junkAsFish, this.currentFishWeight);
                this.fishStruggleFrequency = this.progression.calculateStruggleFrequency(junkAsFish, this.currentFishWeight);
                
            } else {
                // Для рыбы - обычные расчеты
                this.fishResistance = this.progression.calculateFishResistance(
                    this.currentFish, 
                    this.currentFishWeight
                );
                this.fishStrugglePower = this.progression.calculateStrugglePower(
                    this.currentFish,
                    this.currentFishWeight
                );
                
                // Увеличиваем частоту рывков на 20-40%
                const baseFrequency = this.progression.calculateStruggleFrequency(
                    this.currentFish,
                    this.currentFishWeight
                );
                const frequencyBoost = 0.2 + Math.random() * 0.2; // 20-40%
                this.fishStruggleFrequency = baseFrequency * (1 - frequencyBoost); // Уменьшаем интервал = чаще рывки
            }
            
            this.timeSinceLastStruggle = 0;
            this.lineCooldown = 0;
            this.overloadTime = 0; // Сброс времени перегрузки
            
            // Сразу начинаем тягание рыбы (fishTargetPos уже установлена выше)
            const bobberPos2 = this.bobber.getPosition();
            const dx2 = bobberPos2.x - this.fishTargetPos.x;
            const dy2 = bobberPos2.y - this.fishTargetPos.y;
            const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            
            if (distance2 > 0) {
                const dirX = dx2 / distance2;
                const dirY = dy2 / distance2;
                const pullStrength = Math.max(0.3, this.fishResistance);
                this.bobber.startPulling({ x: dirX, y: dirY }, pullStrength);
            }
        });
        
        // Обновление состояния REELING
        this.stateMachine.on(`update:${FISHING_CONFIG.STATES.REELING}`, ({ dt }) => {
            const tipPos = this.rod.getTipPosition();
            // fishTargetPos уже объявлена в enter:REELING
            
            // Обновление таймера рывков рыбы (только при подмотке)
            if (this.isReeling) {
                this.timeSinceLastStruggle += dt;
            }

            if (this.isReeling) {
                // Подтягиваем рыбу к рыбаку (внизу экрана)
                const baseSpeed = FISHING_CONFIG.REELING.SPEED;
                const speedMultiplier = this.progression.getReelSpeedMultiplier(this.currentFish, this.currentFishWeight);
                const powerBoost = this.premiumEffects.getPowerMultiplier(); // Бонус от энергетика
                const resistanceFactor = (1 - this.fishResistance * 0.6);
                
                // Для предметов используем обычную скорость (сопротивление уже учтено в расчетах)
                const junkSpeedModifier = 1.0;
                
                // ШТРАФ: Если удочка не соответствует - скорость подмотки падает в 3 раза
                let rodPenalty = 1.0;
                if (this.progression.isRodMismatched(this.currentFish, this.currentFishWeight)) {
                    rodPenalty = 1 / 3;
                }
                
                const speed = baseSpeed * speedMultiplier * resistanceFactor * powerBoost * junkSpeedModifier * rodPenalty;
                
                
                const reached = this.bobber.reelTowards(this.fishTargetPos.x, this.fishTargetPos.y, speed, dt, this.currentFish.type === 'junk');
                

                // Останавливаем постоянное тягание
                this.bobber.stopPulling();

                // Увеличиваем натяжение при подмотке с учетом веса рыбы
                const weightRatio = this.currentFish.weightMax ? 
                    this.currentFishWeight / this.currentFish.weightMax : 0.1; // Для предметов используем минимальное значение
                const currentLine = this.progression.getCurrentLine();
                let weightFactor = 1.0;
                
                // Режим для новичков: только для первой локации (зона 1) и игроков до 6 уровня
                const isNoviceZone = this.currentFish.zoneId === 1;
                const isNoviceLevel = this.progression.level < 6;
                const isNoviceMode = isNoviceZone && isNoviceLevel;
                
                if (currentLine && currentLine.tier === 1 && isNoviceMode) {
                    // T1 в режиме новичка: облегчение - легкие рыбы (< 75%) дают меньше натяжения
                    weightFactor = weightRatio < 0.75 ? 0.4 : 1.0;
                } else {
                    // Обычный режим: реалистичная система - тяжелые рыбы дают больше натяжения
                    weightFactor = 0.7 + weightRatio * 0.6; // 0.7-1.3x в зависимости от веса
                }
                
                // Дополнительный множитель для тяжелой рыбы (>5 кг) и монстров
                let heavyFishMultiplier = 1.0;
                if (this.currentFishWeight > 5) {
                    // Чем тяжелее рыба, тем сильнее сопротивление при подмотке
                    heavyFishMultiplier = 1.0 + (this.currentFishWeight / 10) * 0.3; // +3% за каждые 10 кг
                }
                
                // Монстры дают еще больше сопротивления
                if (this.currentFish.type === 'monster') {
                    heavyFishMultiplier *= 1.5; // Монстры на 50% сильнее сопротивляются
                }
                
                // Энергетик также снижает натяжение
                const tensionReduction = powerBoost > 1 ? 0.85 : 1.0;
                
                // ШТРАФ: Если леска не соответствует - натяжение растет в 3 раза быстрее
                let linePenalty = 1.0;
                if (this.progression.isLineMismatched(this.currentFish, this.currentFishWeight)) {
                    linePenalty = 3.0;
                }
                
                // Увеличили базовое натяжение с 0.4 до 0.6 и добавили множитель для тяжелой рыбы
                const tensionIncrease = dt * (0.51 + this.fishResistance * 0.4) * weightFactor * heavyFishMultiplier * tensionReduction * linePenalty;
                this.tension = Math.min(1, this.tension + tensionIncrease);
                
                // Увеличиваем остывание при подмотке
                // Бонус от abrasionResist лески замедляет перегрев
                const abrasionBonus = this.progression.getAbrasionBonus();
                const cooldownRate = 0.8 * (1 - abrasionBonus);
                this.lineCooldown = Math.min(this.maxCooldown, this.lineCooldown + dt * cooldownRate);
                
                // Рыба дёргается во время подмотки
                if (this.timeSinceLastStruggle >= this.fishStruggleFrequency) {
                    this.fishStruggle();
                    this.timeSinceLastStruggle = 0;
                }

                // Проверка на разрыв лески
                const breakThreshold = this.progression.getBreakTension(this.currentFish, this.currentFishWeight);
                
                // Режим новичка: леска держится 2 секунды при 100% напряжении
                if (window.tutorialSystem && window.tutorialSystem.isNoviceMode()) {
                    const noviceParams = window.tutorialSystem.getNoviceParams();
                    if (noviceParams && this.tension >= breakThreshold) {
                        this.overloadTime += dt;
                        
                        if (this.overloadTime >= noviceParams.lineBreakDelay) {
                            this.lineBroke();
                            return;
                        }
                    } else {
                        // Сбрасываем счетчик если напряжение упало
                        this.overloadTime = 0;
                    }
                } else {
                    // Обычный режим: леска рвется сразу
                    if (this.tension >= breakThreshold) {
                        this.lineBroke();
                        return;
                    }
                }

                if (reached) {
                    
                    // Звук удачного улова (случайный выбор между ulov и ulov2)
                    if (this.audioManager) {
                        const catchSounds = ['ulov', 'ulov2'];
                        const randomSound = catchSounds[Math.floor(Math.random() * catchSounds.length)];
                        this.audioManager.playSound(randomSound);
                    }
                    
                    this.stateMachine.transition(FISHING_CONFIG.STATES.RESULT);
                }
            } else {
                // Леска остывает когда не подматываем
                this.lineCooldown = Math.max(0, this.lineCooldown - dt * 0.5);
                
                // Натяжение уменьшается
                const cooldownBonus = this.progression.getCooldownBonus(this.currentFish, this.currentFishWeight);
                const decayRate = FISHING_CONFIG.REELING.TENSION_DECAY * (1 + cooldownBonus);
                this.tension = Math.max(0, this.tension - dt * decayRate);
                
                // Рыба медленно тянет поплавок постоянно
                const bobberPos = this.bobber.getPosition();
                const dx = bobberPos.x - this.fishTargetPos.x; // Рыба тянется от рыбака (внизу экрана)
                const dy = bobberPos.y - this.fishTargetPos.y; // Рыба тянется от рыбака (внизу экрана)
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    const dirX = dx / distance;
                    const dirY = dy / distance;
                    
                    // Сила тягания (увеличена для заметности)
                    const pullStrength = Math.max(0.3, this.fishResistance);
                    
                    this.bobber.startPulling({ x: dirX, y: dirY }, pullStrength);
                }
            }

            this.ui.setTension(this.tension);
            this.line.setTension(this.tension);
        });
        
        // Вход в состояние RESULT
        this.stateMachine.on(`enter:${FISHING_CONFIG.STATES.RESULT}`, () => {
            
            this.ui.hideReelButton();
            this.ui.hideTensionBar();
            this.ui.hideHint();
            this.bobber.hide();
            this.line.hide();
            
            // Скрываем туториал при показе окна улова
            this.tutorialHighlight.hide();
            
            this.resultModal.show(this.currentFish, this.currentFishWeight, this.premiumEffects);
        });
    }
    
    setupInput() {
        this.inputManager.on('pointerdown', (pos) => {
            this.handlePointerDown(pos);
        });
        
        this.inputManager.on('pointerup', (pos) => {
            this.handlePointerUp(pos);
        });

        this.inputManager.on('pointermove', (pos) => {
            this.handlePointerMove(pos);
        });
        
        this.inputManager.on('wheel', (data) => {
            this.handleWheel(data);
        });
    }
    
    setupStorageUI() {
        // Обработчик "Отпустить всех"
        this.storageUI.onReleaseAll = () => {
            let totalXP = 0;
            this.storedFish.forEach(fish => {
                totalXP += fish.xp || 0;
            });
            
            // Применяем бонус к опыту от окна подсказок
            if (window.game && window.game.fishingTipsUI) {
                const xpMultiplier = window.game.fishingTipsUI.getXpMultiplier();
                totalXP = Math.floor(totalXP * xpMultiplier);
            }
            
            this.addXPWithSound(totalXP);
            this.storedFish = [];
            this.storageUI.hide();
            this.ui.showHint(`${L('all_fish_released', 'Вся рыба отпущена!')} +${totalXP} XP`);
            setTimeout(() => this.ui.hideHint(), 2000);
        };

        // Обработчик "Продать всех"
        this.storageUI.onSellAll = () => {
            let totalPrice = 0;
            let totalXP = 0;
            
            this.storedFish.forEach(fish => {
                const fishPrice = Math.round((fish.sellPrice || 0) * fish.caughtWeight);
                totalPrice += fishPrice;
                
                const fishXP = fish.xp || 0;
                totalXP += Math.round(fishXP * 0.6); // 60% опыта при продаже
            });
            
            // Применяем бонусы от окна подсказок
            if (window.game && window.game.fishingTipsUI) {
                const priceMultiplier = window.game.fishingTipsUI.getPriceMultiplier();
                const xpMultiplier = window.game.fishingTipsUI.getXpMultiplier();
                totalPrice = Math.floor(totalPrice * priceMultiplier);
                totalXP = Math.floor(totalXP * xpMultiplier);
            }
            
            this.coins += totalPrice;
            this.addXPWithSound(totalXP);
            
            // Регистрируем заработанные монеты в профиле
            if (window.game && window.game.profileSystem) {
                window.game.profileSystem.registerCoinsEarned(totalPrice);
            }
            
            this.storedFish = [];
            this.storageUI.hide();
            this.ui.showHint(`${L('all_fish_sold', 'Вся рыба продана!')} +${totalPrice}💰 +${totalXP} XP`);
            setTimeout(() => this.ui.hideHint(), 2000);
        };
    }
    
    setupGearInventory() {
        // Синхронизация инвентаря с прогрессией
        this.syncInventoryWithProgression();
        
        // Обработчик установки снасти
        this.gearInventoryUI.onEquip = (type, item) => {
            // Обновляем прогрессию
            if (type === 'bait') {
                this.progression.equipment.bait = item.id;
            } else {
                this.progression.equipment[type] = item.tier;
                // Обновляем прочность из инвентаря
                this.progression.durability[type] = item.durability;
            }
            
            // Получаем локализованное название
            let itemName = item.name;
            if (type === 'bait') {
                itemName = window.localizationSystem.getBaitName(item.id, item.name);
            } else {
                itemName = window.localizationSystem.getGearName(type, item.tier, item.name);
            }
            
            this.ui.showHint(`${itemName} ${L('equipped', 'установлено!')}`);
            setTimeout(() => this.ui.hideHint(), 1500);
        };
    }
    
    // Синхронизация инвентаря с системой прогрессии
    syncInventoryWithProgression() {
        // Устанавливаем снаряжение из инвентаря в прогрессию
        const equipped = this.gearInventory.equipped;
        
        // Если снасть не установлена (null), используем 0 или пропускаем
        this.progression.equipment.rod = equipped.rod || 0;
        this.progression.equipment.line = equipped.line || 0;
        this.progression.equipment.float = equipped.float || 0;
        this.progression.equipment.hook = equipped.hook || 0;
        this.progression.equipment.reel = equipped.reel || 0;
        this.progression.equipment.bait = equipped.bait || 0;
        
        // Синхронизируем прочность
        ['rod', 'line', 'float', 'hook', 'reel'].forEach(type => {
            const gear = this.gearInventory.getEquippedGear(type);
            if (gear) {
                this.progression.durability[type] = gear.durability;
            } else {
                // Если снасть не установлена, устанавливаем прочность в 0
                this.progression.durability[type] = 0;
            }
        });
        
        // Синхронизируем наживки
        const bait = this.gearInventory.getEquippedBait();
        if (bait) {
            this.progression.baitCount = bait.count;
        } else {
            this.progression.baitCount = 0;
        }
    }

    setupResultModal() {
        this.resultModal.onRelease = (xp) => {
            // Применяем бонус к опыту от окна подсказок
            if (window.game && window.game.fishingTipsUI) {
                const xpMultiplier = window.game.fishingTipsUI.getXpMultiplier();
                xp = Math.floor(xp * xpMultiplier);
            }
            
            // Отпускаем рыбу - получаем полный опыт
            this.addXPWithSound(xp);
            
            // Добавляем в коллекцию
            if (this.collectionSystem && this.currentFish) {
                let isFirstCatch = false;
                if (this.currentFish.type === 'junk') {
                    isFirstCatch = this.collectionSystem.markItemFound(this.currentFish.id);
                } else if (this.currentFish.type === 'monster') {
                    isFirstCatch = this.collectionSystem.markMonsterCaught(this.currentFish.id);
                } else {
                    isFirstCatch = this.collectionSystem.markFishCaught(this.currentFish.id);
                }
                
                if (isFirstCatch) {
                    const itemType = this.currentFish.type === 'junk' ? 'предмет' : 
                                   this.currentFish.type === 'monster' ? 'монстр' : 'рыба';
                }
            }
            
            // Регистрируем пойманный объект в профиле
            if (window.game && window.game.profileSystem && this.currentFish) {
                if (this.currentFish.type === 'junk') {
                    window.game.profileSystem.registerItemCaught(this.currentFish);
                } else if (this.currentFish.type === 'monster') {
                    window.game.profileSystem.registerMonsterCaught(this.currentFish, this.currentFishWeight);
                } else {
                    window.game.profileSystem.registerFishCaught(this.currentFish, this.currentFishWeight);
                }
            }
            
            // Обновляем прогресс заданий
            if (window.questSystem && this.currentFish) {
                window.questSystem.updateQuestProgress('fish_caught', {
                    fishId: this.currentFish.id,
                    id: this.currentFish.id
                });
            }
            
            // Применяем износ снастей (успешная ловля)
            const wearResults = this.progression.applyFishingWear(
                this.currentFish, 
                this.currentFishWeight, 
                true
            );
            this.handleWearResults(wearResults);
            
            // Переход к следующему шагу туториала (показ UI элементов)
            // Показываем UI туториал только один раз и только если это первая рыба
            if (window.tutorialSystem && window.tutorialSystem.isNoviceMode() && 
                window.tutorialSystem.getCurrentStep() === 'reel' &&
                !window.tutorialSystem.isUITutorialShown()) {
                window.tutorialSystem.nextStep();
                
                // Показываем подсветку UI элементов через небольшую задержку
                setTimeout(() => {
                    this.showUITutorial();
                }, 500);
                return; // Не переходим в IDLE, показываем туториал
            }
            
            // Во всех остальных случаях переходим в IDLE
            this.stateMachine.transition(FISHING_CONFIG.STATES.IDLE);
        };

        this.resultModal.onSell = (price, xp) => {
            // Применяем бонусы от окна подсказок
            if (window.game && window.game.fishingTipsUI) {
                const priceMultiplier = window.game.fishingTipsUI.getPriceMultiplier();
                const xpMultiplier = window.game.fishingTipsUI.getXpMultiplier();
                price = Math.floor(price * priceMultiplier);
                xp = Math.floor(xp * xpMultiplier);
            }
            
            // Продаём рыбу - получаем деньги и 60% опыта
            this.coins += price;
            this.addXPWithSound(xp);
            this.caughtFish.push(this.currentFish);
            
            // Регистрируем заработанные монеты в профиле
            if (window.game && window.game.profileSystem) {
                window.game.profileSystem.registerCoinsEarned(price);
            }
            
            // Отмечаем рыбу как пойманную в зоне (убрано - currentZone теперь ID, а не объект)
            // if (this.currentZone && this.currentZoneFish) {
            //     this.zoneSystem.catchFish(this.currentZone, this.currentFish);
            // }
            
            // Добавляем в коллекцию
            if (this.collectionSystem && this.currentFish) {
                let isFirstCatch = false;
                if (this.currentFish.type === 'junk') {
                    isFirstCatch = this.collectionSystem.markItemFound(this.currentFish.id);
                } else if (this.currentFish.type === 'monster') {
                    isFirstCatch = this.collectionSystem.markMonsterCaught(this.currentFish.id);
                } else {
                    isFirstCatch = this.collectionSystem.markFishCaught(this.currentFish.id);
                }
                
                if (isFirstCatch) {
                    const itemType = this.currentFish.type === 'junk' ? 'предмет' : 
                                   this.currentFish.type === 'monster' ? 'монстр' : 'рыба';
                }
            }
            
            // Регистрируем пойманный объект в профиле
            if (window.game && window.game.profileSystem && this.currentFish) {
                if (this.currentFish.type === 'junk') {
                    window.game.profileSystem.registerItemCaught(this.currentFish);
                } else if (this.currentFish.type === 'monster') {
                    window.game.profileSystem.registerMonsterCaught(this.currentFish, this.currentFishWeight);
                } else {
                    window.game.profileSystem.registerFishCaught(this.currentFish, this.currentFishWeight);
                }
            }
            
            // Обновляем прогресс заданий
            if (window.questSystem && this.currentFish) {
                window.questSystem.updateQuestProgress('fish_caught', {
                    fishId: this.currentFish.id,
                    id: this.currentFish.id
                });
            }
            
            // Применяем износ снастей (успешная ловля)
            const wearResults = this.progression.applyFishingWear(
                this.currentFish, 
                this.currentFishWeight, 
                true
            );
            this.handleWearResults(wearResults);
            
            // Показываем UI туториал только один раз и только если это первая рыба
            if (window.tutorialSystem && window.tutorialSystem.isNoviceMode() && 
                window.tutorialSystem.getCurrentStep() === 'reel' &&
                !window.tutorialSystem.isUITutorialShown()) {
                window.tutorialSystem.nextStep();
                
                setTimeout(() => {
                    this.showUITutorial();
                }, 500);
                return; // Не переходим в IDLE, показываем туториал
            }
            
            // Во всех остальных случаях переходим в IDLE
            this.stateMachine.transition(FISHING_CONFIG.STATES.IDLE);
        };

        this.resultModal.onStore = (fish, weight) => {
            if (this.canStoreFish(weight)) {
                this.storeFish(fish, weight);
                
                // Отмечаем рыбу как пойманную в зоне (убрано - currentZone теперь ID, а не объект)
                // if (this.currentZone && this.currentZoneFish) {
                //     this.zoneSystem.catchFish(this.currentZone, this.currentFish);
                // }
                
                // Добавляем в коллекцию
                if (this.collectionSystem && this.currentFish) {
                    let isFirstCatch = false;
                    if (this.currentFish.type === 'junk') {
                        isFirstCatch = this.collectionSystem.markItemFound(this.currentFish.id);
                    } else if (this.currentFish.type === 'monster') {
                        isFirstCatch = this.collectionSystem.markMonsterCaught(this.currentFish.id);
                    } else {
                        isFirstCatch = this.collectionSystem.markFishCaught(this.currentFish.id);
                    }
                    
                    if (isFirstCatch) {
                        const itemType = this.currentFish.type === 'junk' ? 'предмет' : 
                                       this.currentFish.type === 'monster' ? 'монстр' : 'рыба';
                    }
                }
                
                // Регистрируем пойманный объект в профиле
                if (window.game && window.game.profileSystem && this.currentFish) {
                    if (this.currentFish.type === 'junk') {
                        window.game.profileSystem.registerItemCaught(this.currentFish);
                    } else if (this.currentFish.type === 'monster') {
                        window.game.profileSystem.registerMonsterCaught(this.currentFish, this.currentFishWeight);
                    } else {
                        window.game.profileSystem.registerFishCaught(this.currentFish, this.currentFishWeight);
                    }
                }
                
                // Обновляем прогресс заданий
                if (window.questSystem && this.currentFish) {
                    window.questSystem.updateQuestProgress('fish_caught', {
                        fishId: this.currentFish.id,
                        id: this.currentFish.id
                    });
                }
                
                // Применяем износ снастей (успешная ловля)
                const wearResults = this.progression.applyFishingWear(
                    this.currentFish, 
                    this.currentFishWeight, 
                    true
                );
                this.handleWearResults(wearResults);
                
                // Показываем UI туториал только один раз и только если это первая рыба
                if (window.tutorialSystem && window.tutorialSystem.isNoviceMode() && 
                    window.tutorialSystem.getCurrentStep() === 'reel' &&
                    !window.tutorialSystem.isUITutorialShown()) {
                    window.tutorialSystem.nextStep();
                    
                    setTimeout(() => {
                        this.showUITutorial();
                    }, 500);
                    return true; // Не переходим в IDLE, показываем туториал
                }
                
                // Во всех остальных случаях переходим в IDLE
                this.stateMachine.transition(FISHING_CONFIG.STATES.IDLE);
                return true; // Успешно добавлено, окно можно закрыть
            } else {
                // Если не помещается, показываем сообщение и НЕ закрываем окно
                this.ui.showHint(L('keepnet_full', 'Садок переполнен! Освободите место.'));
                // Окно остается открытым, пользователь может выбрать "Продать" или "Отпустить"
                return false; // Не удалось добавить, окно остается открытым
            }
        };
    }
    
    handlePointerDown(pos) {
        const STATES = FISHING_CONFIG.STATES;

        // Проверка модального окна результата
        if (this.resultModal.visible) {
            this.resultModal.handleClick(pos.x, pos.y);
            return;
        }
        
        // Проверка окна инвентаря бонусов
        if (this.bonusInventoryUI.visible) {
            this.bonusInventoryUI.handleClick(pos.x, pos.y);
            return;
        }
        
        // Проверка кнопки открытия инвентаря бонусов
        if (this.bonusInventoryUI.isOpenButtonPressed(pos.x, pos.y)) {
            // Звук клика по доступной кнопке
            if (this.audioManager) this.audioManager.playClickSound();
            this.bonusInventoryUI.toggle();
            return;
        }
        
        // Проверка окна инвентаря снастей
        if (this.gearInventoryUI.visible) {
            this.gearInventoryUI.handleClick(pos.x, pos.y);
            return;
        }

        // Проверка клика на окне садка
        if (this.storageUI.targetVisible) {
            this.storageUI.handleClick(pos.x, pos.y, this.storedFish);
            return; // Блокируем все остальные взаимодействия когда окно садка открыто
        }

        // Проверка кнопки подсечки
        if (this.stateMachine.is(FISHING_CONFIG.STATES.BITE) && this.ui.isHookButtonPressed(pos.x, pos.y)) {
            // Без звука клика - только звуки рыбалки
            this.stateMachine.transition(FISHING_CONFIG.STATES.HOOKING);
            return;
        }

        // Проверка кнопки возврата удочки
        if (this.stateMachine.is(FISHING_CONFIG.STATES.WAITING) && this.ui.isRetractButtonPressed(pos.x, pos.y)) {
            // Звук клика по доступной кнопке
            if (this.audioManager) this.audioManager.playClickSound();
            this.retractRod();
            return;
        }

        // Проверка кнопки катушки
        if (this.stateMachine.is(FISHING_CONFIG.STATES.REELING) && this.ui.isReelButtonPressed(pos.x, pos.y)) {
            // Без звука клика - только звук катушки
            this.isReeling = true;
            this.ui.setReelPressed(true);
            this.rod.setReeling(true);
            
            // Запускаем зацикленный звук подмотки лески с увеличенной громкостью (максимум 1.0)
            if (this.audioManager) {
                this.audioManager.startLoopingSound('kat', 1.0); // Максимальная громкость
            }
            
            return;
        }

        // Проверка кнопки садка
        if (this.ui.isStorageButtonPressed(pos.x, pos.y)) {
            // Звук клика по доступной кнопке
            if (this.audioManager) this.audioManager.playClickSound();
            this.storageUI.toggle();
            return;
        }

        // Проверка кнопки выхода
        if (this.ui.isExitButtonPressed(pos.x, pos.y)) {
            // Звук клика по доступной кнопке
            if (this.audioManager) this.audioManager.playClickSound();
            // Сбрасываем состояние рыбалки перед выходом
            this.stateMachine.transition(FISHING_CONFIG.STATES.IDLE);
            
            // Сбрасываем все активные бонусы
            this.bonusInventoryUI.resetAllBonuses();
            
            if (this.onExit) {
                this.onExit();
            }
            return;
        }
        
        // Проверка клика на слот снасти (открытие инвентаря)
        if (this.stateMachine.is(FISHING_CONFIG.STATES.IDLE)) {
            const gearSlot = this.ui.getGearSlotAtPosition(pos.x, pos.y);
            if (gearSlot) {
                this.gearInventoryUI.show(gearSlot.slot.type);
                return;
            }
        }

        // Заброс в воду (только если мы точно в состоянии IDLE)
        if (this.stateMachine.is(FISHING_CONFIG.STATES.IDLE) && 
            this.waterRenderer.isInWaterZone(pos.x, pos.y)) {
            // Проверяем наличие всех необходимых снастей
            const missingGear = this.checkMissingGear();
            if (missingGear) {
                this.ui.showHint(`${L('equip', 'Установите')} ${missingGear}!`);
                return;
            }
            
            // Сразу переходим в CASTING чтобы заблокировать повторные клики
            this.stateMachine.transition(FISHING_CONFIG.STATES.CASTING, {
                targetX: pos.x,
                targetY: pos.y
            });
        }
    }
    
    handlePointerUp(pos) {
        // Обработка отпускания в окне бонусов
        if (this.bonusInventoryUI.visible) {
            this.bonusInventoryUI.handleMouseUp(pos.x, pos.y);
        }
        
        // Обработка отпускания в окне снастей
        if (this.gearInventoryUI.visible) {
            this.gearInventoryUI.handleMouseUp();
        }
        
        // Обработка отпускания в садке
        if (this.storageUI.targetVisible) {
            this.storageUI.handleMouseUp();
        }
        
        // Отпускание катушки
        if (this.isReeling) {
            this.isReeling = false;
            this.ui.setReelPressed(false);
            this.rod.setReeling(false);
            
            // Останавливаем звук подмотки лески
            if (this.audioManager) {
                this.audioManager.stopLoopingSound('kat');
            }
        }
    }

    handlePointerMove(pos) {
        // Обработка движения в окне бонусов
        if (this.bonusInventoryUI.visible) {
            this.bonusInventoryUI.handleMouseMove(pos.x, pos.y);
            this.canvas.style.cursor = 'default';
            return;
        }
        
        // Обработка движения в окне снастей
        if (this.gearInventoryUI.visible) {
            this.gearInventoryUI.handleMouseMove(pos.x, pos.y);
            this.canvas.style.cursor = 'default';
            return;
        }
        
        // Изменяем курсор при наведении на рыбу в садке
        if (this.storageUI.targetVisible && !this.storageUI.fishDetailModal.visible) {
            this.storageUI.handleMouseMove(pos.x, pos.y);
            const isHovering = this.storageUI.isHoveringFish(pos.x, pos.y, this.storedFish);
            this.canvas.style.cursor = isHovering ? 'pointer' : 'default';
        } else {
            this.canvas.style.cursor = 'default';
        }
        
        // Проверка наведения на слоты снастей
        const gearSlot = this.ui.getGearSlotAtPosition(pos.x, pos.y);
        if (gearSlot) {
            this.ui.showDurabilityTooltip(gearSlot.slot.type, gearSlot.x, gearSlot.y);
        } else {
            this.ui.hideDurabilityTooltip();
        }
    }
    
    handleWheel(data) {
        // Скролл в инвентаре бонусов
        if (this.bonusInventoryUI.visible) {
            this.bonusInventoryUI.handleWheel(data.deltaY);
            return;
        }
        
        // Скролл в инвентаре снастей
        if (this.gearInventoryUI.visible) {
            this.gearInventoryUI.handleScroll(data.deltaY);
        }
    }
    
    // Получить модификатор шанса поклевки в зависимости от времени суток
    getTimeOfDayModifier() {
        // Если нет системы дня/ночи, возвращаем нейтральный модификатор
        if (!window.game || !window.game.dayNightSystem) {
            return (fish) => 1.0;
        }
        
        const currentTime = window.game.dayNightSystem.currentTime; // 0-24
        
        // Определяем текущее время суток
        let currentPeriod = '';
        if (currentTime >= 5 && currentTime < 11) {
            currentPeriod = 'Утро';
        } else if (currentTime >= 11 && currentTime < 17) {
            currentPeriod = 'День';
        } else if (currentTime >= 17 && currentTime < 21) {
            currentPeriod = 'Вечер';
        } else {
            currentPeriod = 'Ночь';
        }
        
        console.log(`[DEBUG] Текущее время: ${currentTime.toFixed(1)}, период: ${currentPeriod}`);
        
        // Возвращаем функцию-модификатор для конкретной рыбы
        return (fish) => {
            if (!fish.timeOfDay) return 1.0;
            
            const fishTimeOfDay = fish.timeOfDay;
            
            // Проверяем совпадение времени
            if (fishTimeOfDay === currentPeriod) {
                if (fish.name === 'Густера') {
                    console.log(`[DEBUG] Густера в своё время (${currentPeriod}): множитель 1.5`);
                }
                return 1.5; // +50% шанс в свое время
            }
            
            // Проверяем составные периоды (например "Утро/Вечер")
            if (fishTimeOfDay.includes('/')) {
                const periods = fishTimeOfDay.split('/');
                if (periods.includes(currentPeriod)) {
                    if (fish.name === 'Густера') {
                        console.log(`[DEBUG] Густера в своё время (составной период): множитель 1.5`);
                    }
                    return 1.5; // +50% шанс
                }
            }
            
            // Не свое время - небольшое снижение
            if (fish.name === 'Густера') {
                console.log(`[DEBUG] Густера НЕ в своё время (${fishTimeOfDay} vs ${currentPeriod}): множитель 0.7`);
            }
            return 0.7; // -30% шанс в не свое время
        };
    }
    
    selectRandomFish() {
        // Получаем зону где находится поплавок
        const zone = this.zoneSystem.getZoneByPosition(this.bobber.x, this.bobber.y);
        
        if (!zone) {
            this.selectFallbackFish();
            return;
        }
        
        // ЧИТЫ: Проверяем дебаг флаги
        if (window.DEBUG_MONSTER_CHANCE && typeof MonstersDB !== 'undefined') {
            const monster = MonstersDB.getRandomMonsterFromZone(this.currentLocationId);
            if (monster) {
                console.log('[DEBUG] Принудительно выбран монстр:', monster.name);
                this.currentFish = {
                    id: monster.id,
                    originalMonsterId: monster.id,
                    name: monster.name,
                    emoji: monster.emoji,
                    type: 'monster',
                    sellPrice: monster.sellPrice,
                    xp: monster.xp,
                    rarity: 'Legendary',
                    resistance: 0.9,
                    strugglePower: 0.8,
                    biteStyle: monster.biteStyle,
                    weightMin: monster.weightMin,
                    weightMax: monster.weightMax,
                    power: monster.power
                };
                this.currentFishWeight = monster.weightMin + 
                    Math.random() * (monster.weightMax - monster.weightMin);
                return;
            }
        }
        
        if (window.DEBUG_ITEM_CHANCE && typeof JunkDB !== 'undefined') {
            const junkItem = JunkDB.getRandomJunkFromZone(this.currentLocationId);
            if (junkItem) {
                console.log('[DEBUG] Принудительно выбран предмет:', junkItem.name);
                this.currentFish = {
                    id: junkItem.id,
                    originalJunkId: junkItem.id,
                    name: junkItem.name,
                    emoji: junkItem.emoji,
                    type: 'junk',
                    category: junkItem.category,
                    sellPrice: junkItem.sellPrice,
                    rarity: junkItem.category === 'Сокровище' ? 'Epic' : 
                            junkItem.category === 'Редкость' ? 'Rare' : 'Common',
                    resistance: 0.8,
                    strugglePower: 0.4,
                    biteStyle: 'normal',
                    weightMin: 0.5,
                    weightMax: 0.5,
                    xp: 0
                };
                this.currentFishWeight = 0.5;
                return;
            }
        }
        
        // СНАЧАЛА проверяем выпадение МОНСТРА (используем currentLocationId вместо zone.id)
        if (typeof MonstersDB !== 'undefined') {
            const monster = MonstersDB.tryGetMonsterFromZone(this.currentLocationId);
            if (monster) {
                // Поймали монстра!
                this.currentFish = {
                    id: monster.id,
                    originalMonsterId: monster.id,
                    name: monster.name,
                    emoji: monster.emoji,
                    type: 'monster',
                    sellPrice: monster.sellPrice,
                    xp: monster.xp,
                    rarity: 'Legendary', // Все монстры легендарные
                    resistance: 0.9, // Очень высокое сопротивление
                    strugglePower: 0.8, // Очень высокая сила рывков
                    biteStyle: monster.biteStyle,
                    weightMin: monster.weightMin,
                    weightMax: monster.weightMax,
                    power: monster.power
                };
                this.currentFishWeight = monster.weightMin + 
                    Math.random() * (monster.weightMax - monster.weightMin);
                return;
            }
        }
        
        // ЗАТЕМ проверяем выпадение предмета (мусора/сокровища) (используем currentLocationId)
        if (typeof JunkDB !== 'undefined') {
            const junkItem = JunkDB.tryGetJunkFromZone(this.currentLocationId);
            if (junkItem) {
                // Поймали предмет вместо рыбы!
                this.currentFish = {
                    id: junkItem.id, // Используем оригинальный ID предмета
                    originalJunkId: junkItem.id, // Сохраняем для справки
                    name: junkItem.name,
                    emoji: junkItem.emoji,
                    type: 'junk',
                    category: junkItem.category,
                    sellPrice: junkItem.sellPrice,
                    rarity: junkItem.category === 'Сокровище' ? 'Epic' : 
                            junkItem.category === 'Редкость' ? 'Rare' : 'Common',
                    // Предметы имеют высокое сопротивление (как крупная рыба)
                    resistance: 0.8, // Высокое сопротивление
                    strugglePower: 0.4, // Высокая сила рывков
                    biteStyle: 'normal',
                    // Добавляем поля для совместимости с системой вываживания
                    weightMin: 0.5, // Легкие предметы
                    weightMax: 0.5, // Легкие предметы
                    xp: 0 // Предметы не дают опыт
                };
                this.currentFishWeight = 0.5; // Легкий символический вес
                return;
            }
        }
        
        // Получаем текущую наживку
        const currentBait = this.progression.getCurrentBait();
        const currentBaitId = currentBait ? currentBait.id : null;
        
        // Получаем доступных рыб в этой зоне с учетом наживки
        const availableFish = this.zoneSystem.getAvailableFish(zone, currentBaitId);
        
        if (availableFish.length === 0) {
            this.currentFish = null;
            this.currentFishWeight = 0;
            return;
        }
        
        // ЧИТЫ: Принудительно выбираем легендарную рыбу
        if (window.DEBUG_LEGENDARY_CHANCE) {
            const legendaryFish = availableFish.filter(f => f.species.rarity === 'Legendary');
            if (legendaryFish.length > 0) {
                const randomLegendary = legendaryFish[Math.floor(Math.random() * legendaryFish.length)];
                console.log('[DEBUG] Принудительно выбрана легендарная рыба:', randomLegendary.species.name);
                this.currentFish = randomLegendary.species;
                this.currentFishWeight = randomLegendary.weight;
                this.currentZoneFish = randomLegendary;
                return;
            }
        }
        
        // Получаем текущее время суток для модификации шансов
        const timeOfDayModifier = this.getTimeOfDayModifier();
        
        // Выбор рыбы на основе редкости с учётом бонусов снаряжения, премиум эффектов и окна подсказок
        const rareFishBonus = this.progression.getRareFishBonus();
        const premiumRareFishBonus = this.premiumEffects.getRareFishBonus();
        
        // Добавляем бонус от окна подсказок
        let tipsRareFishBonus = 0;
        if (window.game && window.game.fishingTipsUI) {
            tipsRareFishBonus = window.game.fishingTipsUI.getRareFishBonus();
        }
        
        const totalRareFishBonus = rareFishBonus + premiumRareFishBonus + tipsRareFishBonus;
        
        // Мапим редкость в числа
        const rarityWeights = {
            'Common': 1.0,
            'Uncommon': 0.5,
            'Rare': 0.2,
            'Epic': 0.08,
            'Legendary': 0.02
        };
        
        const totalWeight = availableFish.reduce((sum, f) => {
            const baseWeight = rarityWeights[f.species.rarity] || 1.0;
            // Увеличиваем шанс редких рыб от бонусов снаряжения и премиум эффектов
            const adjustedWeight = baseWeight * (1 + totalRareFishBonus * (1 - baseWeight));
            // Применяем модификатор времени суток
            const timeAdjustedWeight = adjustedWeight * timeOfDayModifier(f.species);
            return sum + timeAdjustedWeight;
        }, 0);
        
        let random = Math.random() * totalWeight;

        for (const fishInZone of availableFish) {
            const baseWeight = rarityWeights[fishInZone.species.rarity] || 1.0;
            const adjustedWeight = baseWeight * (1 + totalRareFishBonus * (1 - baseWeight));
            const timeAdjustedWeight = adjustedWeight * timeOfDayModifier(fishInZone.species);
            random -= timeAdjustedWeight;
            if (random <= 0) {
                this.currentFish = fishInZone.species;
                this.currentFishWeight = fishInZone.weight; // Используем вес из зоны!
                this.currentZoneFish = fishInZone; // Сохраняем ссылку на рыбу в зоне
                return;
            }
        }

        // Fallback на первую доступную рыбу
        const firstFish = availableFish[0];
        this.currentFish = firstFish.species;
        this.currentFishWeight = firstFish.weight;
        this.currentZoneFish = firstFish;
    }
    
    selectFallbackFish() {
        // Fallback на первую рыбу если нет доступных
        if (typeof FISH_DATABASE !== 'undefined' && FISH_DATABASE.length > 0) {
            this.currentFish = FISH_DATABASE[0];
            this.currentFishWeight = this.currentFish.weightMin + 
                Math.random() * (this.currentFish.weightMax - this.currentFish.weightMin);
        }
    }
    
    // Рывок рыбы - дёргает леску обратно
    fishStruggle() {
        // Сила рывка зависит от остывания лески
        const cooldownFactor = 1 + (this.lineCooldown / this.maxCooldown) * 1.2;
        
        // Уменьшаем силу рывка на 70% для маленьких рыб (resistance < 0.3)
        let strugglePower = this.fishStrugglePower * cooldownFactor;
        if (this.fishResistance < 0.3) {
            strugglePower *= 0.3; // Уменьшение на 70%
        }
        
        // Бонусы от снаряжения (теперь с учетом несоответствия)
        const holdBonus = this.progression.getHoldBonus(this.currentFish, this.currentFishWeight); // Крючок уменьшает силу рывков
        const stabilityBonus = this.progression.getStabilityBonus(this.currentFish, this.currentFishWeight); // Поплавок уменьшает натяжение от рывков
        
        // ШТРАФ: Если крючок не соответствует - 10% шанс срыва рыбы при рывке
        if (this.progression.isHookMismatched(this.currentFish, this.currentFishWeight)) {
            const escapeChance = 0.10; // 10% шанс
            if (Math.random() < escapeChance) {
                // Рыба сорвалась!
                this.ui.showHint(L('fish_escaped', 'Рыба сорвалась!'));
                
                // Применяем износ снастей (неудачная ловля)
                const wearResults = this.progression.applyFishingWear(
                    this.currentFish, 
                    this.currentFishWeight, 
                    false
                );
                this.handleWearResults(wearResults);
                
                // Возвращаемся в IDLE через 1.5 секунды
                setTimeout(() => {
                    if (this.stateMachine.is(FISHING_CONFIG.STATES.REELING)) {
                        this.stateMachine.transition(FISHING_CONFIG.STATES.IDLE);
                    }
                }, 1500);
                return;
            }
        }
        
        // Применяем бонус удержания крючка к силе рывка
        strugglePower *= (1 - holdBonus);
        
        // Увеличиваем натяжение с учетом веса рыбы
        const weightRatio = this.currentFishWeight / this.currentFish.weightMax;
        const currentLine = this.progression.getCurrentLine();
        let weightFactor = 1.0;
        
        if (currentLine && currentLine.tier === 1) {
            // T1: облегчение для новичков - легкие рыбы (< 75%) дают меньше натяжения
            weightFactor = weightRatio < 0.75 ? 0.4 : 1.0;
        } else {
            // T2+: реалистичная система - тяжелые рыбы дают больше натяжения при рывках
            weightFactor = 0.7 + weightRatio * 0.6; // 0.7-1.3x в зависимости от веса
        }
        
        // ШТРАФ: Если поплавок не соответствует - натяжение от рывков удваивается
        let floatPenalty = 1.0;
        if (this.progression.isFloatMismatched(this.currentFish, this.currentFishWeight)) {
            floatPenalty = 2.0;
        }
        
        // Применяем бонус стабильности поплавка к натяжению
        const tensionIncrease = strugglePower * 0.5 * weightFactor * (1 - stabilityBonus) * floatPenalty;
        this.tension = Math.min(1, this.tension + tensionIncrease);
        
        // Плавно отталкиваем поплавок назад
        const fishTargetPos = this.rod.getFishTargetPosition(); // Рыба отталкивается от рыбака (внизу экрана)
        const bobberPos = this.bobber.getPosition();
        const dx = bobberPos.x - fishTargetPos.x;
        const dy = bobberPos.y - fishTargetPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Расстояние рывка зависит от силы рыбы
            // Маленькие рыбки: уменьшенные рывки
            let baseDistance = 10 + this.fishResistance * 30;
            let pushDistance = baseDistance + strugglePower * 40;
            
            // Дополнительное уменьшение для маленьких рыб
            if (this.fishResistance < 0.3) {
                pushDistance *= 0.3; // Уменьшение на 70%
            }
            
            // Направление от удочки (нормализованное)
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            // Запускаем плавную анимацию рывка
            this.bobber.startStruggle(pushDistance, { x: dirX, y: dirY });
        }
        
        // Визуальная обратная связь
        this.ui.showHint(L('fish_jerks', 'Рыба дёргается!'));
        setTimeout(() => {
            if (this.stateMachine.is(FISHING_CONFIG.STATES.REELING)) {
                this.ui.showHint(L('hold_reel', 'Зажми катушку!'));
            }
        }, 800);
    }

    // Методы для работы с садком
    getStoredFishWeight() {
        return this.storedFish.reduce((sum, fish) => sum + fish.caughtWeight, 0);
    }

    canStoreFish(weight) {
        return this.getStoredFishWeight() + weight <= this.storageCapacity;
    }

    storeFish(fish, weight) {
        if (this.canStoreFish(weight)) {
            this.storedFish.push({
                ...fish,
                caughtWeight: weight
            });
            
            // Регистрируем улов в туториале (только для рыб, не для мусора)
            if (fish.type !== 'junk' && window.tutorialSystem && window.tutorialSystem.isNoviceMode()) {
                window.tutorialSystem.registerCatch();
                const remaining = window.tutorialSystem.getRemainingAttempts();
            }
            
            return true;
        }
        return false;
    }

    removeStoredFish(index) {
        if (index >= 0 && index < this.storedFish.length) {
            return this.storedFish.splice(index, 1)[0];
        }
        return null;
    }
    
    fishEscaped() {
        // Проверяем, что мы не вызываем этот метод повторно
        if (!this.currentFish) {
            return;
        }
        
        
        this.bobber.stopBite();
        this.ui.hideHookButton();
        this.ui.hideHookTimer();
        this.ui.showHint(L('fish_escaped', 'Рыба сорвалась!'));
        
        // Скрываем подсветку туториала
        this.tutorialHighlight.hide();

        // Регистрируем сорвавшуюся рыбу в профиле
        if (this.currentFish && window.game && window.game.profileSystem) {
            window.game.profileSystem.registerFishEscaped();
        }

        // Применяем износ снастей (неудачная попытка - больше износа)
        if (this.currentFish) {
            const wearResults = this.progression.applyFishingWear(
                this.currentFish, 
                this.currentFishWeight, 
                false
            );
            this.handleWearResults(wearResults);
        }

        // Сброс данных о текущей рыбе СРАЗУ (защита от повторных вызовов)
        this.currentFish = null;
        this.hookTimeRemaining = 0;
        this.biteDelayRemaining = 0;
        
        // Сброс фаз поклевки
        this.bitePhase = 0;
        this.bitePhaseTimer = 0;
        this.missedHookAttempts = 0;

        // Немедленно переходим в промежуточное состояние, затем в WAITING
        // Это предотвращает повторные вызовы fishEscaped из update:BITE
        setTimeout(() => {
            if (this.stateMachine.is(FISHING_CONFIG.STATES.BITE)) {
                this.stateMachine.transition(FISHING_CONFIG.STATES.WAITING);
            }
        }, 1500);
    }

    retractRod() {
        // Устанавливаем флаг блокировки поклевок
        this.isRetractingRod = true;
        
        // Возврат удочки без напряжения
        this.ui.hideRetractButton();
        this.ui.showHint(L('retracting_rod', 'Возвращаем удочку...'));
        
        const fishTargetPos = this.rod.getFishTargetPosition();
        const bobberPos = this.bobber.getPosition();
        const distance = Math.sqrt(
            Math.pow(bobberPos.x - fishTargetPos.x, 2) + 
            Math.pow(bobberPos.y - fishTargetPos.y, 2)
        );
        
        // Плавное подтягивание поплавка к рыбаку (быстрее чем при вываживании)
        const retractSpeed = 300; // пикселей в секунду
        const retractTime = distance / retractSpeed;
        
        // Анимация возврата
        let elapsed = 0;
        const retractInterval = setInterval(() => {
            elapsed += 0.016; // ~60 FPS
            
            if (elapsed >= retractTime) {
                clearInterval(retractInterval);
                // Возвращаемся в IDLE
                this.stateMachine.transition(FISHING_CONFIG.STATES.IDLE);
            } else {
                // Подтягиваем поплавок к рыбаку
                const progress = elapsed / retractTime;
                const currentFishTargetPos = this.rod.getFishTargetPosition();
                this.bobber.reelTowards(currentFishTargetPos.x, currentFishTargetPos.y, retractSpeed, 0.016);
            }
        }, 16);
    }

    lineBroke() {
        this.ui.hideReelButton();
        this.ui.hideTensionBar();
        this.ui.showHint(L('line_broken', 'Леска порвалась!'));
        
        // Скрываем подсветку туториала
        this.tutorialHighlight.hide();
        
        // Звук обрыва лески
        if (this.audioManager) {
            this.audioManager.playSound('porval');
            this.audioManager.stopLoopingSound('kat');
        }

        // Регистрируем сорвавшуюся рыбу в профиле
        if (this.currentFish && window.game && window.game.profileSystem) {
            window.game.profileSystem.registerFishEscaped();
        }

        // Применяем критический износ снастей (обрыв - максимальный износ)
        if (this.currentFish) {
            const wearResults = this.progression.applyFishingWear(
                this.currentFish, 
                this.currentFishWeight, 
                false
            );
            this.handleWearResults(wearResults);
        }

        // Полный сброс состояний
        this.bobber.reset();
        this.line.reset();
        this.rod.reset();

        // Сброс игровых переменных
        this.currentFish = null;
        this.hookTimeRemaining = 0;
        this.biteDelayRemaining = 0;
        this.isReeling = false;
        this.tension = 0;
        this.waitTime = 0;
        this.targetWaitTime = 0;
        this.isRetractingRod = false; // Сбрасываем флаг блокировки поклевок
        
        // Сброс фаз поклевки
        this.bitePhase = 0;
        this.bitePhaseTimer = 0;
        this.missedHookAttempts = 0;

        setTimeout(() => {
            this.stateMachine.reset();
        }, 2000);
    }
    
    // Обработка результатов износа снастей
    handleWearResults(wearResults) {
        // Синхронизируем прочность с инвентарем
        ['rod', 'line', 'reel', 'hook', 'float'].forEach(type => {
            const durability = this.progression.durability[type];
            if (durability !== null) {
                this.gearInventory.updateDurability(type, durability);
            }
        });
        
        // Проверяем сломанные снасти
        if (wearResults.broken.length > 0) {
            // Звук поломки снасти
            if (this.audioManager) {
                this.audioManager.playSound('slomal');
            }
            
            wearResults.broken.forEach(item => {
                const typeNames = {
                    rod: L('rod', 'Удочка'),
                    line: L('line', 'Леска'),
                    reel: L('reel', 'Катушка'),
                    hook: L('hook', 'Крючок'),
                    float: L('float', 'Поплавок')
                };
                this.ui.showHint(`${typeNames[item.type]} ${L('broke', 'сломалась!')}`);
                
                // Удаляем сломанную снасть из инвентаря (как у наживки)
                const tier = this.progression.equipment[item.type];
                if (tier) {
                    this.gearInventory.removeGear(item.type, tier);
                }
            });
        } else {
            // Показываем предупреждение если снасть близка к поломке
            ['rod', 'line', 'reel', 'hook', 'float'].forEach(type => {
                const percent = this.progression.getDurabilityPercent(type);
                if (percent <= 25 && percent > 0) {
                    const typeNames = {
                        rod: 'Удочка',
                        line: 'Леска',
                        reel: 'Катушка',
                        hook: 'Крючок',
                        float: 'Поплавок'
                    };
                }
            });
        }
    }
    
    update(dt) {
        // Синхронизируем инвентарь с прогрессией каждый кадр
        this.syncInventoryWithProgression();
        
        // Обновляем премиум эффекты
        this.premiumEffects.update();
        
        // Применяем замедление времени если активен бонус
        if (window.game && window.game.dayNightSystem) {
            if (this.premiumEffects.hasTimeSlowEffect()) {
                const multiplier = this.premiumEffects.getTimeSpeedMultiplier();
                window.game.dayNightSystem.setTimeSpeedMultiplier(multiplier);
            } else {
                window.game.dayNightSystem.resetTimeSpeed();
            }
        }
        
        // Обновляем систему зон (миграция рыб)
        this.zoneSystem.update(dt);
        
        // Проверка на паузу - когда открыты модальные окна
        const isPaused = this.resultModal.visible || this.storageUI.animProgress > 0.01 || this.gearInventoryUI.visible || this.bonusInventoryUI.visible;

        // Обновляем UI всегда
        this.ui.update(dt);
        this.resultModal.update(dt);
        this.storageUI.update(dt);
        this.gearInventoryUI.update(dt);
        this.bonusInventoryUI.update(dt);
        this.tutorialHighlight.update(dt); // Обновляем подсветку туториала

        // Обновляем игровую логику только если нет паузы
        if (!isPaused) {
            this.stateMachine.update(dt);
            this.waterRenderer.update(dt);
            
            // Передаем позицию поплавка в удочку для расчета натяжения
            if (this.bobber.visible && this.bobber.isLanded) {
                const bobberPos = this.bobber.getPosition();
                this.rod.setBobberPosition(bobberPos.x, bobberPos.y);
            }
            
            this.rod.update(dt);
            this.bobber.update(dt);

            // Обновление наклона поплавка на основе натяжения лески
            if (this.bobber.visible && this.bobber.isLanded && 
                (this.stateMachine.is(FISHING_CONFIG.STATES.REELING) || this.bobber.isStruggling || this.bobber.isPulling)) {
                const tipPos = this.rod.getTipPosition();
                this.bobber.updateTilt(tipPos.x, tipPos.y, dt);
            }

            // Обновление лески
            if (this.line.visible) {
                const tipPos = this.rod.getTipPosition();
                const bobberPos = this.bobber.getPosition();
                this.line.setPoints(tipPos.x, tipPos.y, bobberPos.x, bobberPos.y);
            }
        }
    }
    
    render() {
        const ctx = this.ctx;
        
        // Очистка
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Вода и окружение
        this.waterRenderer.render(ctx);
        
        // Леска (под поплавком)
        this.line.render(ctx);
        
        // Поплавок
        this.bobber.render(ctx);
        
        // Удочка
        this.rod.render(ctx);
        
        // Затемнение от ночи (перед UI)
        this.renderNightOverlay(ctx);
        
        // UI
        this.ui.render(ctx);
        
        // Сканер рыбы (если активен и идет поклевка)
        if (this.stateMachine.is(FISHING_CONFIG.STATES.BITE) && this.premiumEffects.hasFishScanner() && this.currentFish) {
            this.ui.renderFishScanInfo(ctx, this.currentFish);
        }
        
        // Эхолот (если активен)
        this.renderSonar(ctx);
        
        // Счёт монет
        this.renderCoins(ctx);
        
        // Модальное окно результата
        this.resultModal.render(ctx);

        // Окно садка
        this.storageUI.render(ctx, this.storedFish, this.storageCapacity);
        
        // Окно инвентаря снастей
        this.gearInventoryUI.render(ctx);
        
        // Окно инвентаря бонусов
        this.bonusInventoryUI.render(ctx);
        
        // Подсветка туториала (поверх всего)
        this.tutorialHighlight.render();
    }
    
    // Рендер затемнения от ночи
    renderNightOverlay(ctx) {
        if (!window.game || !window.game.dayNightSystem) return;
        
        const brightness = window.game.dayNightSystem.getBrightness();
        const darkness = 1 - brightness;
        const alpha = darkness * 0.6; // 60% максимум
        
        if (alpha > 0.01) {
            ctx.save();
            ctx.fillStyle = `rgba(0, 0, 20, ${alpha})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
        }
    }
    
    renderCoins(ctx) {
        // Метод удален - деньги теперь в верхней панели
    }
    
    // Отрисовка эхолота или компаса
    renderSonar(ctx) {
        const hasSonar = this.premiumEffects.permanentEffects.sonar;
        const hasCompass = this.premiumEffects.permanentEffects.compass;
        
        if (!hasSonar && !hasCompass) return;
        if (!this.bobber.isLanded) return;
        
        // Получаем информацию о зоне из системы зон
        const zoneInfo = this.zoneSystem.getZoneInfo(this.bobber.targetX, this.bobber.targetY);
        
        if (!zoneInfo) return;
        
        const isAdvanced = hasSonar && this.premiumEffects.permanentEffects.sonar === 'advanced';
        const isBasic = hasSonar && this.premiumEffects.permanentEffects.sonar === 'basic';
        const isCompass = hasCompass && !hasSonar;
        
        const x = this.canvas.width - 180;
        const y = 120;
        const width = 160;
        
        // Вычисляем точную высоту на основе содержимого
        let contentLines = 3; // Заголовок + 2 основные строки
        
        if (zoneInfo.fishCount === 0) {
            contentLines = 3;
        } else {
            if (zoneInfo.depleted) {
                contentLines += 1; // Добавляем строку предупреждения
            }
            if (isAdvanced && zoneInfo.species && zoneInfo.species.length > 0) {
                contentLines += 1 + zoneInfo.species.length; // "Виды:" + каждый вид
            }
        }
        
        const lineHeight = 20;
        const padding = 15;
        const height = contentLines * lineHeight + padding;
        
        ctx.save();
        
        // Фон
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 8);
        ctx.fill();
        
        // Заголовок
        ctx.fillStyle = zoneInfo.depleted ? '#e74c3c' : (isCompass ? '#f39c12' : '#3498db');
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        
        if (isCompass) {
            ctx.fillText(L('compass_title', '🧭 КОМПАС'), x + 10, y + 20);
        } else {
            ctx.fillText(L('sonar_title', '📡 ЭХОЛОТ'), x + 10, y + 20);
        }
        
        // Информация
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        
        let infoY = y + 40;
        
        if (zoneInfo.fishCount === 0) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(L('sonar_no_fish', 'Рыбы нет!'), x + 10, infoY);
            infoY += 20;
            ctx.fillStyle = '#95a5a6';
            ctx.font = '12px Arial';
            ctx.fillText(L('sonar_try_another', 'Попробуйте другое место'), x + 10, infoY);
        } else {
            ctx.fillText(`${L('sonar_fish_count', 'Рыб')}: ${zoneInfo.fishCount}`, x + 10, infoY);
            infoY += 20;
            
            // Вес только для эхолотов
            if (!isCompass) {
                ctx.fillText(`${L('sonar_weight', 'Вес')}: ${zoneInfo.weightRange.min.toFixed(1)}-${zoneInfo.weightRange.max.toFixed(1)} ${L('kg', 'кг')}`, x + 10, infoY);
                infoY += 20;
            }
            
            // Предупреждение если зона истощается
            if (zoneInfo.depleted) {
                ctx.fillStyle = '#e74c3c';
                ctx.font = '12px Arial';
                ctx.fillText(L('sonar_depleted', '⚠️ Зона истощена'), x + 10, infoY);
                infoY += 20;
            }
            
            // Виды рыб (только для продвинутого эхолота)
            if (isAdvanced && zoneInfo.species && zoneInfo.species.length > 0) {
                ctx.fillStyle = '#f39c12';
                ctx.font = '14px Arial';
                ctx.fillText(L('sonar_species', 'Виды:'), x + 10, infoY);
                infoY += 20;
                
                ctx.fillStyle = '#bdc3c7';
                ctx.font = '12px Arial';
                zoneInfo.species.forEach(species => {
                    // Получаем переведенное название рыбы
                    const translatedName = window.localizationSystem ? 
                        window.localizationSystem.getFishName(species.id, species.name) : 
                        species.name;
                    const displayName = translatedName.length > 20 ? translatedName.substring(0, 18) + '...' : translatedName;
                    ctx.fillText(`• ${displayName}`, x + 15, infoY);
                    infoY += 18;
                });
            }
        }
        
        ctx.restore();
    }
    
    // Отрисовка активных эффектов
    renderActiveEffects(ctx) {
        if (this.premiumEffects.activeEffects.length === 0) return;
        
        const x = 20;
        let y = 120;
        const width = 200;
        const itemHeight = 50;
        
        ctx.save();
        
        this.premiumEffects.activeEffects.forEach(effect => {
            // Фон
            ctx.fillStyle = 'rgba(155, 89, 182, 0.8)';
            ctx.beginPath();
            ctx.roundRect(x, y, width, itemHeight, 8);
            ctx.fill();
            
            // Обводка
            ctx.strokeStyle = '#9b59b6';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Иконка
            ctx.font = '24px Arial';
            ctx.textAlign = 'left';
            const icon = effect.type === 'power_boost' ? '⚡' :
                        effect.type === 'bite_frequency' ? '🌾' :
                        effect.type === 'treasure_luck' ? '🪙' :
                        effect.type === 'monster_chance' ? '🩸' : '💎';
            ctx.fillText(icon, x + 10, y + 32);
            
            // Название
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(effect.name, x + 45, y + 20);
            
            // Оставшееся время
            const remaining = this.premiumEffects.getRemainingTime(effect.type);
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            ctx.font = '12px Arial';
            ctx.fillStyle = '#f1c40f';
            ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}`, x + 45, y + 38);
            
            y += itemHeight + 10;
        });
        
        ctx.restore();
    }
    
    // Проверка наличия всех необходимых снастей
    checkMissingGear() {
        const requiredGear = ['rod', 'line', 'hook', 'float', 'reel'];
        
        for (const gearType of requiredGear) {
            const equipped = this.gearInventory.getEquippedGear(gearType);
            
            // Если снасть не установлена (null)
            if (!equipped) {
                const gearNames = {
                    rod: 'удочку',
                    line: 'леску',
                    hook: 'крючок',
                    float: 'поплавок',
                    reel: 'катушку'
                };
                return gearNames[gearType];
            }
        }
        
        return null; // Все снасти в порядке
    }
    
    // Показать туториал по UI элементам
    showUITutorial() {
        if (!window.tutorialSystem || !window.tutorialSystem.isNoviceMode()) return;
        
        // Отмечаем что UI туториал показан
        window.tutorialSystem.markUITutorialShown();
        
        // Показываем UI элементы по очереди
        this.showUITutorialStep(0);
    }
    
    // Показать конкретный шаг UI туториала
    showUITutorialStep(step) {
        const uiSteps = [
            {
                // Панель снастей (внизу слева, расширена вправо еще на 20px)
                area: {
                    x: 20,
                    y: this.canvas.height - 125,
                    width: 620, // Было 600, добавили еще 20px
                    height: 110
                },
                text: L('tutorial_ui_gear', 'Панель снастей - здесь можно менять удочку, леску, крючок и поплавок')
            },
            {
                // Кнопка бонусов (сдвинута выше и левее на 10px)
                area: {
                    x: 80, // Было 90, сдвинули левее на 10px
                    y: 80, // Было 90, сдвинули выше на 10px
                    radius: 45
                },
                text: L('tutorial_ui_bonuses', 'Бонусы - используйте прикормку и другие усиления')
            },
            {
                // Кнопка садка (сдвинута еще левее на 20px)
                area: {
                    x: this.canvas.width - 310, // Было -290, сдвинули левее еще на 20px
                    y: this.canvas.height - 55,
                    radius: 45
                },
                text: L('tutorial_ui_keepnet', 'Садок - храните рыбу и продавайте её на рынке')
            },
            {
                // Кнопка выхода (правый верхний угол)
                area: {
                    x: this.canvas.width - 74,
                    y: 64,
                    radius: 60
                },
                text: L('tutorial_ui_back', 'Выход - вернуться в главное меню')
            }
        ];
        
        if (step >= uiSteps.length) {
            // Завершаем туториал полностью
            this.tutorialHighlight.hide();
            
            // Отмечаем туториал как завершенный
            if (window.tutorialSystem) {
                window.tutorialSystem.completeTutorial();
            }
            
            this.stateMachine.transition(FISHING_CONFIG.STATES.IDLE);
            return;
        }
        
        const currentStep = uiSteps[step];
        this.tutorialHighlight.show(currentStep.area, currentStep.text);
        
        // Переходим к следующему шагу через 4 секунды (было 3)
        setTimeout(() => {
            this.showUITutorialStep(step + 1);
        }, 4000);
    }
}

