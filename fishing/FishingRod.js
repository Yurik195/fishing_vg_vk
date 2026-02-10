// Класс удочки с анимациями
class FishingRod {
    constructor(canvas, progression = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.progression = progression; // Ссылка на систему прогрессии
        
        // Позиция основания удочки (правый нижний угол)
        this.baseX = 0;
        this.baseY = 0;
        
        // Параметры удочки
        this.length = 390; // Увеличено на 30% (было 300)
        this.angle = -1.3;        // Угол в радианах (направлена влево-вверх, было -1.1)
        this.restAngle = -1.3;    // Изменено с -1.1
        this.castAngle = -1.8;    // Угол при забросе (было -1.6)
        
        // Анимация
        this.animProgress = 0;
        this.isAnimating = false;
        this.animationType = null;
        
        // Кончик удочки
        this.tipX = 0;
        this.tipY = 0;
        
        // Катушка
        this.reelRotation = 0;
        this.isReeling = false;
        
        // Динамика при подмотке (имитация усилия)
        this.reelingStrain = 0; // Напряжение удочки при подмотке
        this.strainTime = 0; // Время для анимации напряжения
        
        // Спрайты удочки для разных уровней
        this.rodSprites = {
            'udchk0': new Image(),
            'udchk': new Image(),
            'udchk3': new Image()
        };
        
        // Загружаем все спрайты
        this.rodSprites['udchk0'].src = 'udchk0.png';
        this.rodSprites['udchk'].src = 'udchk.png';
        this.rodSprites['udchk3'].src = 'udchk3.png';
        
        this.rodSpritesLoaded = {
            'udchk0': false,
            'udchk': false,
            'udchk3': false
        };
        
        // Обработчики загрузки спрайтов
        this.rodSprites['udchk0'].onload = () => {
            this.rodSpritesLoaded['udchk0'] = true;
        };
        this.rodSprites['udchk'].onload = () => {
            this.rodSpritesLoaded['udchk'] = true;
        };
        this.rodSprites['udchk3'].onload = () => {
            this.rodSpritesLoaded['udchk3'] = true;
        };
        
        // Текущий спрайт (по умолчанию для уровня 1-2)
        this.currentRodSprite = this.rodSprites['udchk0'];
        this.currentSpriteLoaded = false;
        
        this.updatePosition();
    }
    
    // Получить смещение кончика удочки для разных спрайтов
    getTipOffset() {
        if (!this.progression) {
            return { x: 0, y: 0 }; // Нет смещения для базового спрайта
        }
        
        const currentRod = this.progression.getCurrentRod();
        if (!currentRod) {
            return { x: 0, y: 0 }; // Нет смещения для базового спрайта
        }
        
        const rodTier = currentRod.tier;
        
        // Смещения кончика для разных спрайтов (в пикселях)
        if (rodTier >= 1 && rodTier <= 2) {
            // udchk0 - базовый спрайт, нет смещения
            return { x: 0, y: 0 };
        } else if (rodTier >= 3 && rodTier <= 10) {
            // udchk - кончик сдвинут вправо на 18 пикселей
            return { x: 18, y: 0 };
        } else if (rodTier >= 11) {
            // udchk3 - используем поворот вместо смещения
            return { x: 0, y: 0 };
        } else {
            return { x: 0, y: 0 }; // По умолчанию
        }
    }
    
    // Определить спрайт удочки на основе уровня
    updateRodSprite() {
        if (!this.progression) {
            // Если нет системы прогрессии, используем базовый спрайт
            this.currentRodSprite = this.rodSprites['udchk0'];
            this.currentSpriteLoaded = this.rodSpritesLoaded['udchk0'];
            return;
        }
        
        const currentRod = this.progression.getCurrentRod();
        if (!currentRod) {
            // Если удочка не установлена, используем базовый спрайт
            this.currentRodSprite = this.rodSprites['udchk0'];
            this.currentSpriteLoaded = this.rodSpritesLoaded['udchk0'];
            return;
        }
        
        const rodTier = currentRod.tier;
        let spriteKey;
        
        if (rodTier >= 1 && rodTier <= 2) {
            spriteKey = 'udchk0'; // Уровни 1-2
        } else if (rodTier >= 3 && rodTier <= 10) {
            spriteKey = 'udchk'; // Уровни 3-10
        } else if (rodTier >= 11) {
            spriteKey = 'udchk3'; // Уровни 11+
        } else {
            spriteKey = 'udchk0'; // По умолчанию
        }
        
        this.currentRodSprite = this.rodSprites[spriteKey];
        this.currentSpriteLoaded = this.rodSpritesLoaded[spriteKey];
    }
    
    updatePosition() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Основание удочки - размещаем так, чтобы вся удочка была видна
        // Учитываем рукоятку (80px) и угол наклона
        // Сдвинуто левее (было w - 250, потом w - 150)
        this.baseX = w - 400;
        this.baseY = h - 300; // Поднято еще выше (было h - 250)
        
        // БАЗОВЫЕ координаты кончика (которые мы настроили правильно)
        const baseTipX = w - 325;
        const baseTipY = h - 420;
        
        // Добавляем смещение для разных спрайтов удочек
        const tipOffset = this.getTipOffset();
        const adjustedBaseTipX = baseTipX + tipOffset.x;
        const adjustedBaseTipY = baseTipY + tipOffset.y;
        
        // Добавляем смещения от движения удочки (разные коэффициенты для X и Y)
        const angleOffset = this.angle - this.restAngle; // Отклонение от базового угла
        const offsetMultiplierX = 150; // Большой коэффициент для горизонтального движения
        const offsetMultiplierY = 80; // Увеличен коэффициент для вертикального движения
        
        this.tipX = adjustedBaseTipX + angleOffset * offsetMultiplierX;
        this.tipY = adjustedBaseTipY + angleOffset * offsetMultiplierY;
    }
    
    // Запуск анимации заброса
    startCastAnimation(callback) {
        this.isAnimating = true;
        this.animationType = 'cast';
        this.animProgress = 0;
        this.castCallback = callback;
    }
    
    // Обновление катушки
    setReeling(isReeling) {
        this.isReeling = isReeling;
    }
    
    // Установить позицию поплавка для расчета направления натяжения
    setBobberPosition(bobberX, bobberY) {
        this.bobberX = bobberX;
        this.bobberY = bobberY;
    }
    
    update(dt) {
        this.updatePosition();
        this.updateRodSprite(); // Обновляем спрайт удочки на основе уровня
        
        // Динамика при подмотке (имитация усилия)
        if (this.isReeling) {
            // Увеличиваем напряжение
            this.reelingStrain = Math.min(1, this.reelingStrain + dt * 3);
            this.strainTime += dt * 8; // Скорость колебаний
        } else {
            // Плавно возвращаемся в исходное положение
            this.reelingStrain = Math.max(0, this.reelingStrain - dt * 4);
            this.strainTime = 0;
        }
        
        // Определяем направление натяжения на основе позиции поплавка
        let lateralPull = 0; // Боковое натяжение
        if (this.isReeling && this.bobberX !== undefined) {
            // Инвертируем: если поплавок справа - удочка наклоняется вправо
            // Если поплавок слева - удочка наклоняется влево
            const horizontalDiff = this.bobberX - this.baseX;
            lateralPull = -Math.sign(horizontalDiff) * Math.min(Math.abs(horizontalDiff) / 300, 1) * 0.15;
        }
        
        // Применяем колебания к углу удочки при подмотке
        const strainWobble = Math.sin(this.strainTime) * 0.08 * this.reelingStrain; // Покачивание
        const strainBend = this.reelingStrain * 0.03; // Небольшой изгиб назад от усилия (уменьшено с 0.12)
        
        // Анимация заброса
        if (this.isAnimating && this.animationType === 'cast') {
            this.animProgress += dt / FISHING_CONFIG.CAST.DURATION;
            
            if (this.animProgress < 0.3) {
                // Замах назад
                const t = this.animProgress / 0.3;
                this.angle = this.restAngle + (0.3) * this.easeOut(t);
            } else if (this.animProgress < 0.6) {
                // Бросок вперёд
                const t = (this.animProgress - 0.3) / 0.3;
                this.angle = this.restAngle + 0.3 - (0.3 - this.castAngle + this.restAngle) * this.easeIn(t);
            } else if (this.animProgress < 1.0) {
                // Возврат в исходное
                const t = (this.animProgress - 0.6) / 0.4;
                this.angle = this.castAngle + (this.restAngle - this.castAngle) * this.easeOut(t);
            } else {
                this.angle = this.restAngle;
                this.isAnimating = false;
                this.animationType = null;
                if (this.castCallback) this.castCallback();
            }
            
            // Обновляем позицию кончика - используем базовые координаты + смещение
            const w = this.canvas.width;
            const h = this.canvas.height;
            const baseTipX = w - 325;
            const baseTipY = h - 420;
            
            // Добавляем смещение для разных спрайтов удочек
            const tipOffset = this.getTipOffset();
            const adjustedBaseTipX = baseTipX + tipOffset.x;
            const adjustedBaseTipY = baseTipY + tipOffset.y;
            
            const angleOffset = this.angle - this.restAngle;
            const offsetMultiplierX = 150; // Большой коэффициент для горизонтального движения
            const offsetMultiplierY = 80; // Увеличен коэффициент для вертикального движения
            
            this.tipX = adjustedBaseTipX + angleOffset * offsetMultiplierX;
            this.tipY = adjustedBaseTipY + angleOffset * offsetMultiplierY;
        } else {
            // Применяем динамику подмотки к углу (боковое натяжение важнее изгиба)
            this.angle = this.restAngle + strainBend + strainWobble + lateralPull * this.reelingStrain * 2.0;
            
            // Обновляем позицию кончика - используем базовые координаты + смещение
            const w = this.canvas.width;
            const h = this.canvas.height;
            const baseTipX = w - 325;
            const baseTipY = h - 420;
            
            // Добавляем смещение для разных спрайтов удочек
            const tipOffset = this.getTipOffset();
            const adjustedBaseTipX = baseTipX + tipOffset.x;
            const adjustedBaseTipY = baseTipY + tipOffset.y;
            
            const angleOffset = this.angle - this.restAngle;
            const offsetMultiplierX = 150; // Большой коэффициент для горизонтального движения
            const offsetMultiplierY = 80; // Увеличен коэффициент для вертикального движения
            
            this.tipX = adjustedBaseTipX + angleOffset * offsetMultiplierX;
            this.tipY = adjustedBaseTipY + angleOffset * offsetMultiplierY;
        }
        
        // Вращение катушки
        if (this.isReeling) {
            this.reelRotation += dt * 10;
        }
    }
    
    easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    easeIn(t) {
        return t * t * t;
    }
    
    render(ctx) {
        ctx.save();
        
        if (this.currentSpriteLoaded) {
            // Рисуем спрайт удочки
            const handleLength = 80;
            let handleEndX = this.baseX - Math.cos(this.angle) * handleLength;
            let handleEndY = this.baseY - Math.sin(this.angle) * handleLength;
            
            // Дополнительное смещение для udchk3 (влево на 30 пикселей, вниз на 18 пикселей)
            if (this.progression) {
                const currentRod = this.progression.getCurrentRod();
                if (currentRod && currentRod.tier >= 11) {
                    handleEndX -= 30; // Сдвигаем спрайт влево на 30 пикселей
                    handleEndY += 18; // Сдвигаем спрайт вниз на 18 пикселей
                }
            }
            
            // Тень
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 5;
            
            // Перемещаем и поворачиваем контекст для отрисовки спрайта
            ctx.translate(handleEndX, handleEndY);
            
            // Добавляем 90 градусов (Math.PI/2) к углу для поворота по часовой стрелке
            let rotationAngle = this.angle + Math.PI / 2;
            
            // Дополнительный наклон для udchk3 (влево на 15 градусов)
            if (this.progression) {
                const currentRod = this.progression.getCurrentRod();
                if (currentRod && currentRod.tier >= 11) {
                    rotationAngle -= 0.26; // ~15 градусов влево (в радианах)
                }
            }
            
            ctx.rotate(rotationAngle);
            
            // Рисуем спрайт удочки с фиксированной высотой (как у базовой удочки)
            const baseRodSprite = this.rodSprites['udchk0']; // Базовая удочка для эталона размера
            const baseRodWidth = 75; // Ширина базовой удочки
            const baseRodHeight = baseRodSprite.height * (baseRodWidth / baseRodSprite.width); // Высота базовой удочки
            
            // Все удочки имеют одинаковую высоту, равную базовой
            const rodHeight = baseRodHeight;
            const rodWidth = this.currentRodSprite.width * (rodHeight / this.currentRodSprite.height); // Пропорциональная ширина
            
            ctx.drawImage(this.currentRodSprite, 
                0, // Начинаем от точки поворота
                -rodHeight / 2, // Центрируем по вертикали
                rodWidth, 
                rodHeight);
            
            ctx.shadowColor = 'transparent';
            
        } else {
            // Fallback: рисуем удочку как раньше, если спрайт не загружен
            const handleLength = 80;
            const handleEndX = this.baseX - Math.cos(this.angle) * handleLength;
            const handleEndY = this.baseY - Math.sin(this.angle) * handleLength;
            
            // Тень
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 5;
            
            // Основной стержень удочки
            const gradient = ctx.createLinearGradient(handleEndX, handleEndY, this.tipX, this.tipY);
            gradient.addColorStop(0, '#4a3728');
            gradient.addColorStop(0.3, '#2c3e50');
            gradient.addColorStop(1, '#1a252f');
            
            ctx.strokeStyle = gradient;
            ctx.lineCap = 'round';
            
            // Рисуем удочку с уменьшающейся толщиной
            ctx.beginPath();
            ctx.moveTo(handleEndX, handleEndY);
            ctx.lineWidth = 12;
            ctx.lineTo(this.baseX, this.baseY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.baseX, this.baseY);
            ctx.lineWidth = 8;
            ctx.lineTo(this.tipX, this.tipY);
            ctx.stroke();
            
            ctx.shadowColor = 'transparent';
        }
        
        ctx.restore();
        
        // Катушка и кольца больше не рисуем
    }
    
    renderReel(ctx) {
        const reelX = this.baseX - Math.cos(this.angle) * 30;
        const reelY = this.baseY - Math.sin(this.angle) * 30 + 15;
        
        ctx.save();
        ctx.translate(reelX, reelY);
        
        // Корпус катушки
        ctx.fillStyle = '#34495e';
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Шпуля
        ctx.fillStyle = '#95a5a6';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ручка катушки
        ctx.save();
        ctx.rotate(this.reelRotation);
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(20, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        ctx.restore();
    }
    
    renderRings(ctx) {
        const ringCount = 4;
        for (let i = 1; i <= ringCount; i++) {
            const t = i / (ringCount + 1);
            const x = this.baseX + (this.tipX - this.baseX) * t;
            const y = this.baseY + (this.tipY - this.baseY) * t;
            
            ctx.fillStyle = '#7f8c8d';
            ctx.beginPath();
            ctx.arc(x, y - 5, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#95a5a6';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y - 5, 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    getTipPosition() {
        return { x: this.tipX, y: this.tipY };
    }
    
    getBasePosition() {
        return { x: this.baseX, y: this.baseY };
    }
    
    // Точка притяжения рыбы - ниже основания удочки (к рыбаку)
    getFishTargetPosition() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        return { 
            x: this.baseX - 20, // Сдвинуто левее на 20 пикселей
            y: h - 20 // Точка притяжения еще ниже (ближе к рыбаку)
        };
    }

    reset() {
        this.angle = this.restAngle;
        this.animProgress = 0;
        this.isAnimating = false;
        this.animationType = null;
        this.reelRotation = 0;
        this.isReeling = false;
        this.reelingStrain = 0;
        this.strainTime = 0;
        this.updatePosition();
    }
}
