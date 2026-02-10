// -*- coding: utf-8 -*-
// Система смены дня и ночи
class DayNightSystem {
    constructor() {
        this.currentTime = 12; // Начинаем с 12:00 (полдень)
        this.baseTimeSpeed = 0.04 / 3; // Базовая скорость времени уменьшена в 3 раза (1 реальная секунда = 0.8 игровых минуты)
        this.timeSpeed = this.baseTimeSpeed; // Текущая скорость (может быть изменена бонусами)
        // Полный цикл = 30 минут реального времени (1800 секунд)
        
        this.isNight = false;
        this.listeners = [];
        
        this.timeConfig = {
            sunrise: 6,    // 6:00 - рассвет
            day: 8,        // 8:00 - полный день
            sunset: 18,    // 18:00 - закат
            night: 20      // 20:00 - полная ночь
        };
        
        this.lastUpdate = Date.now();
        this.isPaused = false;
        
        // Инициализируем состояние ночи
        this.isNight = this.currentTime >= this.timeConfig.night || this.currentTime < this.timeConfig.sunrise;
    }
    
    // Установить множитель скорости времени (для бонусов)
    setTimeSpeedMultiplier(multiplier) {
        this.timeSpeed = this.baseTimeSpeed * multiplier;
    }
    
    // Сбросить скорость времени к базовой
    resetTimeSpeed() {
        this.timeSpeed = this.baseTimeSpeed;
    }

    // Запуск системы
    start() {
        this.isPaused = false;
        this.update();
    }

    // Пауза
    pause() {
        this.isPaused = true;
    }

    // Возобновление
    resume() {
        this.isPaused = false;
        this.lastUpdate = Date.now();
    }

    // Обновление времени
    update() {
        if (this.isPaused) {
            requestAnimationFrame(() => this.update());
            return;
        }

        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000; // в секундах
        this.lastUpdate = now;

        // Обновляем игровое время
        this.currentTime += deltaTime * this.timeSpeed;
        if (this.currentTime >= 24) {
            this.currentTime -= 24;
        }

        // Проверяем смену дня/ночи
        const wasNight = this.isNight;
        this.isNight = this.currentTime >= this.timeConfig.night || this.currentTime < this.timeConfig.sunrise;

        if (wasNight !== this.isNight) {
            this.notifyListeners('timeOfDayChanged', { isNight: this.isNight });
        }

        // Уведомляем о текущем состоянии
        this.notifyListeners('timeUpdate', {
            time: this.currentTime,
            isNight: this.isNight,
            phase: this.getCurrentPhase(),
            brightness: this.getBrightness()
        });

        requestAnimationFrame(() => this.update());
    }

    // Получить текущую фазу дня
    getCurrentPhase() {
        const t = this.currentTime;
        
        if (t >= this.timeConfig.day && t < this.timeConfig.sunset) {
            return 'day';
        } else if (t >= this.timeConfig.sunset && t < this.timeConfig.night) {
            return 'sunset';
        } else if (t >= this.timeConfig.night || t < this.timeConfig.sunrise) {
            return 'night';
        } else {
            return 'sunrise';
        }
    }
    
    // Получить время суток для атмосферных звуков
    getTimeOfDay() {
        const phase = this.getCurrentPhase();
        if (phase === 'day' || phase === 'sunrise') {
            return 'day';
        } else if (phase === 'sunset') {
            return 'evening';
        } else {
            return 'night';
        }
    }

    // Получить яркость (0-1)
    getBrightness() {
        const t = this.currentTime;
        const config = this.timeConfig;

        if (t >= config.day && t < config.sunset) {
            // День - полная яркость
            return 1;
        } else if (t >= config.sunset && t < config.night) {
            // Закат - плавное затемнение
            const progress = (t - config.sunset) / (config.night - config.sunset);
            return 1 - (progress * 0.6); // От 1 до 0.4
        } else if (t >= config.night || t < config.sunrise) {
            // Ночь - минимальная яркость
            return 0.4;
        } else {
            // Рассвет - плавное осветление
            const progress = (t - config.sunrise) / (config.day - config.sunrise);
            return 0.4 + (progress * 0.6); // От 0.4 до 1
        }
    }

    // Получить цвет неба
    getSkyColor() {
        const phase = this.getCurrentPhase();
        const t = this.currentTime;
        const config = this.timeConfig;

        switch (phase) {
            case 'day':
                return { r: 135, g: 206, b: 235 }; // Светло-голубой
            
            case 'sunset':
                // Плавный переход от голубого к оранжевому и фиолетовому
                const sunsetProgress = (t - config.sunset) / (config.night - config.sunset);
                return {
                    r: 135 + (sunsetProgress * (255 - 135)),
                    g: 206 - (sunsetProgress * (140 - 66)),
                    b: 235 - (sunsetProgress * (100 - 0))
                };
            
            case 'night':
                return { r: 25, g: 25, b: 50 }; // Темно-синий
            
            case 'sunrise':
                // Плавный переход от темного к светлому
                const sunriseProgress = (t - config.sunrise) / (config.day - config.sunrise);
                return {
                    r: 25 + (sunriseProgress * (135 - 25)),
                    g: 25 + (sunriseProgress * (206 - 25)),
                    b: 50 + (sunriseProgress * (235 - 50))
                };
        }
    }

    // Получить форматированное время
    getFormattedTime() {
        const hours = Math.floor(this.currentTime);
        const minutes = Math.floor((this.currentTime - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Установить время
    setTime(hours) {
        this.currentTime = hours % 24;
    }

    // Подписка на события
    addEventListener(callback) {
        this.listeners.push(callback);
    }

    // Отписка от событий
    removeEventListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    // Уведомление слушателей
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            callback(event, data);
        });
    }

    // Сохранение состояния
    save() {
        return {
            currentTime: this.currentTime,
            isNight: this.isNight
        };
    }

    // Загрузка состояния
    load(data) {
        if (data) {
            this.currentTime = data.currentTime || 12;
            this.isNight = data.isNight || false;
        }
    }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DayNightSystem;
}
