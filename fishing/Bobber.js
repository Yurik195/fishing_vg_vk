// Класс поплавка
class Bobber {
    constructor(progression = null) {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        this.visible = false;
        this.isLanded = false;
        
        // Анимация падения
        this.fallProgress = 0;
        this.startX = 0;
        this.startY = 0;
        
        // Покачивание
        this.wobbleTime = 0;
        this.wobbleOffset = 0;
        
        // Поклёвка
        this.dipAmount = 0;
        this.isBiting = false;
        this.biteStyle = 'Плавное притапливание'; // Стиль поклевки
        this.bitePhase = 0; // Фаза анимации поклевки (0 = легкое, 1 = основная, 2 = легкое)
        this.biteTimer = 0; // Таймер для анимации
        this.biteIntensity = 0.3; // Интенсивность текущей фазы (0.3 = легкое, 1.0 = сильное)
        
        // Рывок рыбы
        this.isStruggling = false;
        this.struggleProgress = 0;
        this.struggleStartX = 0;
        this.struggleStartY = 0;
        this.struggleTargetX = 0;
        this.struggleTargetY = 0;
        this.struggleTilt = 0; // Наклон поплавка
        
        // Постоянное тягание рыбы (когда не подматываем)
        this.isPulling = false;
        this.pullDirection = { x: 0, y: 0 };
        this.pullStrength = 0;
        
        // Размер и цвет
        this.size = FISHING_CONFIG.VISUALS.BOBBER_SIZE;
        this.color = FISHING_CONFIG.VISUALS.BOBBER_COLOR;
        
        // Всплеск воды
        this.splashParticles = [];
        this.showSplash = false;
        
        // Система прогрессии для получения текущего поплавка
        this.progression = progression;
        
        // Спрайты поплавков (18 уровней)
        this.floatSprites = {};
        this.floatSpritesLoaded = {};
        
        // Загружаем все спрайты поплавков
        for (let i = 1; i <= 18; i++) {
            const spriteKey = `float_${String(i).padStart(2, '0')}`;
            this.floatSprites[spriteKey] = new Image();
            this.floatSprites[spriteKey].src = `${spriteKey}.png`;
            this.floatSpritesLoaded[spriteKey] = false;
            
            this.floatSprites[spriteKey].onload = () => {
                this.floatSpritesLoaded[spriteKey] = true;
            };
        }
        
        // Текущий спрайт
        this.currentFloatSprite = null;
        this.currentSpriteLoaded = false;
    }
    
    // Обновить спрайт поплавка на основе уровня
    updateFloatSprite() {
        if (!this.progression) {
            // Если нет системы прогрессии, используем базовый спрайт
            this.currentFloatSprite = this.floatSprites['float_01'];
            this.currentSpriteLoaded = this.floatSpritesLoaded['float_01'];
            return;
        }
        
        const currentFloat = this.progression.getCurrentFloat();
        if (!currentFloat) {
            // Если поплавок не установлен, используем базовый спрайт
            this.currentFloatSprite = this.floatSprites['float_01'];
            this.currentSpriteLoaded = this.floatSpritesLoaded['float_01'];
            return;
        }
        
        const floatTier = currentFloat.tier;
        const spriteKey = `float_${String(floatTier).padStart(2, '0')}`;
        
        this.currentFloatSprite = this.floatSprites[spriteKey];
        this.currentSpriteLoaded = this.floatSpritesLoaded[spriteKey];
    }
    
    // Запуск заброса к точке
    castTo(startX, startY, targetX, targetY) {
        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.x = startX;
        this.y = startY;
        this.fallProgress = 0;
        this.visible = true;
        this.isLanded = false;
        this.dipAmount = 0;
        this.isBiting = false;
    }
    
    // Начало поклёвки с фазами
    startBiteWithPhases(biteStyle) {
        this.isBiting = true;
        this.biteStyle = biteStyle || 'Плавное притапливание';
        this.bitePhase = 0; // Начинаем с легкого притапливания
        this.biteTimer = 0;
        this.biteIntensity = 0.3; // Легкое притапливание
    }
    
    // Установить фазу поклевки (вызывается из FishingGame)
    setBitePhase(phase) {
        this.bitePhase = phase;
        
        // Устанавливаем интенсивность в зависимости от фазы
        if (phase === 0 || phase === 2) {
            // Легкое притапливание
            this.biteIntensity = 0.3;
        } else if (phase === 1) {
            // Основная поклевка - сильное погружение
            this.biteIntensity = 1.0;
        }
    }
    
    // Начало поклёвки с учетом стиля (старый метод для совместимости)
    startBite(biteStyle) {
        this.startBiteWithPhases(biteStyle);
    }
    
    // Остановка поклёвки
    stopBite() {
        this.isBiting = false;
        this.dipAmount = 0;
    }
    
    // Подтягивание к точке
    reelTowards(targetX, targetY, speed, dt, isJunk = false) {
        if (!this.isLanded) return;
        
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Для предметов требуется такое же расстояние как для рыбы (92 пикселя)
        const requiredDistance = 92;
        
        if (dist > requiredDistance) {
            const moveAmount = speed * dt;
            // Ограничиваем максимальное движение за кадр для предметов
            const maxMovePerFrame = isJunk ? 5 : 50; // Предметы двигаются максимум на 5 пикселей за кадр
            const limitedMoveAmount = Math.min(moveAmount, maxMovePerFrame);
            this.x += (dx / dist) * limitedMoveAmount;
            this.y += (dy / dist) * limitedMoveAmount;
            
            return false; // Ещё не дошёл
        }
        
        return true; // Достиг цели
    }
    
    // Начать рывок рыбы (плавная анимация) - только при подмотке
    startStruggle(pushDistance, direction) {
        this.isStruggling = true;
        this.struggleProgress = 0;
        this.struggleStartX = this.x;
        this.struggleStartY = this.y;
        
        // Целевая точка рывка (от удочки)
        this.struggleTargetX = this.x + direction.x * pushDistance;
        this.struggleTargetY = this.y + direction.y * pushDistance;
    }
    
    // Начать постоянное тягание (когда ждём остывания)
    startPulling(direction, strength) {
        this.isPulling = true;
        this.pullDirection = direction;
        this.pullStrength = strength;
    }
    
    // Остановить тягание
    stopPulling() {
        this.isPulling = false;
        this.pullStrength = 0;
    }
    
    // Получить дистанцию до точки
    distanceTo(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Обновить наклон поплавка на основе натяжения лески
    updateTilt(rodX, rodY, dt) {
        // Вектор от поплавка к удочке
        const dx = rodX - this.x;
        const dy = rodY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Угол от поплавка к удочке
            const angleToRod = Math.atan2(dy, dx);
            
            // Наклон: низ поплавка идёт в противоположную сторону (от удочки),
            // верх - к удочке. Это создаёт эффект натяжения
            const targetTilt = angleToRod * 0.7; // Увеличен коэффициент наклона с 0.35 до 0.7
            
            // Плавный переход к целевому наклону
            const smoothness = this.isStruggling ? 10 : 6;
            this.struggleTilt += (targetTilt - this.struggleTilt) * smoothness * dt;
            
            // Увеличено ограничение угла наклона
            this.struggleTilt = Math.max(-1.0, Math.min(1.0, this.struggleTilt));
        }
    }
    
    update(dt) {
        if (!this.visible) return;
        
        // Обновляем спрайт поплавка на основе уровня
        this.updateFloatSprite();
        
        // Анимация падения
        if (!this.isLanded) {
            this.fallProgress += dt * 2.5;
            
            if (this.fallProgress >= 1) {
                this.fallProgress = 1;
                this.isLanded = true;
                this.x = this.targetX;
                this.y = this.targetY;
                this.createSplash();
            } else {
                // Параболическая траектория
                const t = this.fallProgress;
                const height = -400 * t * (t - 1); // Парабола
                
                this.x = this.startX + (this.targetX - this.startX) * t;
                this.y = this.startY + (this.targetY - this.startY) * t - height;
            }
        } else {
            // Покачивание на воде
            this.wobbleTime += dt * FISHING_CONFIG.WAITING.BOBBER_WOBBLE_SPEED;
            this.wobbleOffset = Math.sin(this.wobbleTime) * FISHING_CONFIG.WAITING.BOBBER_WOBBLE_AMOUNT;
            
            // Анимация поклёвки с учетом стиля и фазы
            if (this.isBiting) {
                this.biteTimer += dt;
                
                // Разные стили поклевки с учетом интенсивности фазы
                switch (this.biteStyle) {
                    case 'Тык-тык (мелкие касания)':
                        // Быстрые мелкие дёргания
                        const targetDipTyk = Math.sin(this.biteTimer * 12) * 8 * this.biteIntensity;
                        this.dipAmount += (targetDipTyk - this.dipAmount) * 15 * dt;
                        this.wobbleOffset += Math.sin(this.biteTimer * 12) * 3 * this.biteIntensity;
                        break;
                        
                    case 'Плавное притапливание':
                        // Медленное погружение с учетом фазы
                        const targetDipSmooth = FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * this.biteIntensity;
                        this.dipAmount += (targetDipSmooth - this.dipAmount) * FISHING_CONFIG.BITE.BOBBER_DIP_SPEED * dt;
                        break;
                        
                    case 'Фальстарт (взял/бросил)':
                        // Резкое погружение и всплытие
                        const phase = Math.floor(this.biteTimer * 3) % 2;
                        const targetDipFalse = phase === 0 ? FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * this.biteIntensity : 0;
                        this.dipAmount += (targetDipFalse - this.dipAmount) * 8 * dt;
                        break;
                        
                    case 'Серия ударов (дробь)':
                        // Серия быстрых ударов
                        const targetDipSeries = Math.abs(Math.sin(this.biteTimer * 10)) * FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * this.biteIntensity;
                        this.dipAmount += (targetDipSeries - this.dipAmount) * 12 * dt;
                        this.wobbleOffset += Math.sin(this.biteTimer * 10) * 5 * this.biteIntensity;
                        break;
                        
                    case 'Резкий уход в сторону':
                        // Поплавок дёргается в сторону
                        const targetDipSide = FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * 0.5 * this.biteIntensity;
                        this.dipAmount += (targetDipSide - this.dipAmount) * FISHING_CONFIG.BITE.BOBBER_DIP_SPEED * dt;
                        this.wobbleOffset += Math.sin(this.biteTimer * 8) * 15 * this.biteIntensity;
                        break;
                        
                    case 'Донная тяжесть (как зацеп)':
                        // Медленное постоянное погружение
                        const targetDipBottom = FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * 1.5 * this.biteIntensity;
                        this.dipAmount += (targetDipBottom - this.dipAmount) * 2 * dt;
                        break;
                        
                    case 'Молниеносная атака':
                        // Резкое мгновенное погружение
                        this.dipAmount = FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * this.biteIntensity;
                        this.wobbleOffset += Math.sin(this.biteTimer * 15) * 8 * this.biteIntensity;
                        break;
                        
                    case 'Трофейный рывок':
                        // Сильное погружение с рывками
                        const targetDipTrophy = FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * 1.2 * this.biteIntensity;
                        this.dipAmount += (targetDipTrophy - this.dipAmount) * 6 * dt;
                        this.wobbleOffset += Math.sin(this.biteTimer * 6) * 10 * this.biteIntensity;
                        break;
                        
                    case 'Яростный рывок':
                        // Очень сильные рывки с большой амплитудой
                        const targetDipFury = FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * 1.5 * this.biteIntensity;
                        this.dipAmount += (targetDipFury - this.dipAmount) * 8 * dt;
                        this.wobbleOffset += Math.sin(this.biteTimer * 10) * 20 * this.biteIntensity;
                        break;
                        
                    case 'Затягивание на дно':
                        // Постоянное сильное погружение
                        const targetDipDrag = FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * 2.0 * this.biteIntensity;
                        this.dipAmount += (targetDipDrag - this.dipAmount) * 3 * dt;
                        break;
                        
                    case 'Бешеная атака':
                        // Хаотичные быстрые движения
                        const targetDipMad = Math.sin(this.biteTimer * 15) * FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * this.biteIntensity;
                        this.dipAmount += (targetDipMad - this.dipAmount) * 20 * dt;
                        this.wobbleOffset += Math.sin(this.biteTimer * 15) * 25 * this.biteIntensity;
                        break;
                        
                    case 'Электрический разряд':
                        // Быстрая вибрация с погружением
                        const targetDipElectric = FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * this.biteIntensity;
                        this.dipAmount += (targetDipElectric - this.dipAmount) * 10 * dt;
                        this.wobbleOffset += Math.sin(this.biteTimer * 30) * 5 * this.biteIntensity;
                        break;
                        
                    case 'Безумие глубин':
                        // Хаотичные движения с глубоким погружением
                        const targetDipMadness = FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * (1.5 + Math.sin(this.biteTimer * 7) * 0.5) * this.biteIntensity;
                        this.dipAmount += (targetDipMadness - this.dipAmount) * 12 * dt;
                        this.wobbleOffset += (Math.sin(this.biteTimer * 20) * 30 + Math.cos(this.biteTimer * 13) * 15) * this.biteIntensity;
                        break;
                        
                    case 'Апокалипсис':
                        // Экстремальные движения во всех направлениях
                        const targetDipApoc = FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * (2.0 + Math.sin(this.biteTimer * 5) * 0.8) * this.biteIntensity;
                        this.dipAmount += (targetDipApoc - this.dipAmount) * 15 * dt;
                        this.wobbleOffset += (Math.sin(this.biteTimer * 25) * 40 + Math.cos(this.biteTimer * 17) * 25) * this.biteIntensity;
                        break;
                        
                    default:
                        // Стандартная поклевка
                        const targetDipDefault = FISHING_CONFIG.BITE.BOBBER_DIP_AMOUNT * this.biteIntensity;
                        this.dipAmount += (targetDipDefault - this.dipAmount) * FISHING_CONFIG.BITE.BOBBER_DIP_SPEED * dt;
                        this.wobbleOffset += Math.sin(this.biteTimer * 8) * 5 * this.biteIntensity;
                }
            } else {
                this.dipAmount *= 0.9;
                this.biteTimer = 0;
            }
            
            // Анимация рывка рыбы (только при подмотке)
            if (this.isStruggling) {
                this.struggleProgress += dt * 2.5; // Скорость анимации рывка
                
                if (this.struggleProgress >= 1) {
                    this.struggleProgress = 1;
                    this.isStruggling = false;
                    this.x = this.struggleTargetX;
                    this.y = this.struggleTargetY;
                } else {
                    // Плавная интерполяция с ease-out
                    const t = 1 - Math.pow(1 - this.struggleProgress, 3);
                    this.x = this.struggleStartX + (this.struggleTargetX - this.struggleStartX) * t;
                    this.y = this.struggleStartY + (this.struggleTargetY - this.struggleStartY) * t;
                }
            } else if (this.isPulling) {
                // Медленное постоянное тягание (когда не подматываем)
                const pullSpeed = 15 * this.pullStrength;
                this.x += this.pullDirection.x * pullSpeed * dt;
                this.y += this.pullDirection.y * pullSpeed * dt;
            } else if (!this.isStruggling && !this.isPulling) {
                // Плавное возвращение наклона к нулю только когда нет натяжения
                this.struggleTilt *= 0.9;
            }
        }
        
        // Обновление частиц всплеска
        this.updateSplash(dt);
    }
    
    createSplash() {
        this.showSplash = true;
        this.splashParticles = [];
        
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i + Math.random() * 0.3;
            const speed = 80 + Math.random() * 60;
            this.splashParticles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 50,
                life: 1,
                size: 3 + Math.random() * 4
            });
        }
    }
    
    updateSplash(dt) {
        for (let i = this.splashParticles.length - 1; i >= 0; i--) {
            const p = this.splashParticles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 200 * dt; // Гравитация
            p.life -= dt * 2;
            
            if (p.life <= 0) {
                this.splashParticles.splice(i, 1);
            }
        }
        
        if (this.splashParticles.length === 0) {
            this.showSplash = false;
        }
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        // Всплеск
        if (this.showSplash) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            for (const p of this.splashParticles) {
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
        
        const drawY = this.y + this.wobbleOffset + this.dipAmount;
        
        // Линия воды для эффекта погружения (фиксированная, не зависит от погружения)
        const waterLineY = this.y + this.wobbleOffset; // Уровень воды (без учета погружения)
        
        // Эффект обрезки поплавка при погружении в воду
        // Применяем маску всегда когда поплавок на воде
        const shouldClip = this.isLanded;
        
        if (shouldClip) {
            ctx.save();
            
            // Создаем маску обрезки - показываем только часть поплавка выше воды
            // Маска всегда на уровне воды, независимо от того, насколько глубоко погружен поплавок
            ctx.beginPath();
            ctx.rect(0, 0, ctx.canvas.width, waterLineY + 5); // +5 для небольшого запаса
            ctx.clip();
        }
        
        ctx.save();
        ctx.translate(this.x, drawY);
        ctx.rotate(this.struggleTilt);
        
        // Рисуем спрайт поплавка, если загружен
        if (this.currentSpriteLoaded && this.currentFloatSprite) {
            // Размер спрайта (пропорционально размеру поплавка) + 30%
            const spriteHeight = this.size * 3 * 1.3; // Высота спрайта увеличена на 30%
            const spriteWidth = this.currentFloatSprite.width * (spriteHeight / this.currentFloatSprite.height);
            
            // Рисуем спрайт с центром в точке поплавка
            ctx.drawImage(
                this.currentFloatSprite,
                -spriteWidth / 2,
                -spriteHeight / 2,
                spriteWidth,
                spriteHeight
            );
        } else {
            // Fallback: рисуем поплавок как раньше, если спрайт не загружен
            
            // Поплавок - нижняя часть (белая)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, this.size * 0.3, this.size * 0.6, this.size * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Поплавок - верхняя часть (красная)
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, -this.size * 0.3, this.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
            
            // Антенна
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -this.size * 0.8);
            ctx.lineTo(0, -this.size * 2);
            ctx.stroke();
            
            // Шарик на антенне
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(0, -this.size * 2, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // Закрываем маску обрезки
        if (shouldClip) {
            ctx.restore();
        }
        
        // Круги на воде при поклёвке, рывке или тягании
        if ((this.isBiting || this.isStruggling || this.isPulling) && this.isLanded) {
            const rippleSize = 20 + Math.sin(this.wobbleTime * 6) * 10;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(this.x, waterLineY + 10, rippleSize, rippleSize * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    hide() {
        this.visible = false;
        this.isLanded = false;
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;

        this.visible = false;
        this.isLanded = false;

        this.fallProgress = 0;
        this.startX = 0;
        this.startY = 0;

        this.wobbleTime = 0;
        this.wobbleOffset = 0;

        this.dipAmount = 0;
        this.isBiting = false;
        this.biteStyle = 'Плавное притапливание';
        this.bitePhase = 0;
        this.biteTimer = 0;
        this.biteIntensity = 0.3;
        this.biteIntensity = 0.3;

        this.isStruggling = false;
        this.struggleProgress = 0;
        this.struggleStartX = 0;
        this.struggleStartY = 0;
        this.struggleTargetX = 0;
        this.struggleTargetY = 0;
        this.struggleTilt = 0;
        
        this.isPulling = false;
        this.pullDirection = { x: 0, y: 0 };
        this.pullStrength = 0;

        this.size = FISHING_CONFIG.VISUALS.BOBBER_SIZE;
        this.color = FISHING_CONFIG.VISUALS.BOBBER_COLOR;

        this.splashParticles = [];
        this.showSplash = false;
    }
    
    getPosition() {
        return { 
            x: this.x, 
            y: this.y + this.wobbleOffset + this.dipAmount 
        };
    }
}
