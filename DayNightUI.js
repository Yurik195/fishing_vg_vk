// UI для системы дня и ночи
class DayNightUI {
    constructor(dayNightSystem) {
        this.system = dayNightSystem;
        this.overlay = null;
    }

    // Создание UI
    create() {
        this.createOverlay();
        // Индикатор времени не создаем - он уже есть в верхней панели UI
        this.setupEventListeners();
    }

    // Создание оверлея для затемнения
    createOverlay() {
        this.overlay = document.createElement('canvas');
        this.overlay.id = 'dayNightOverlay';
        
        // Получаем игровой canvas для позиционирования
        const gameCanvas = document.getElementById('gameCanvas');
        
        if (gameCanvas) {
            this.overlay.width = gameCanvas.width;
            this.overlay.height = gameCanvas.height;
            
            this.overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
                transition: opacity 2s ease;
                display: none;
            `;
            
            // Вставляем overlay сразу после игрового canvas
            gameCanvas.parentElement.appendChild(this.overlay);
        }
        
        this.overlayCtx = this.overlay.getContext('2d');
        this.currentAlpha = 0;
    }

    // Настройка слушателей событий
    setupEventListeners() {
        this.system.addEventListener((event, data) => {
            if (event === 'timeUpdate') {
                this.updateUI(data);
            } else if (event === 'timeOfDayChanged') {
                this.onTimeOfDayChanged(data);
            }
        });
    }

    // Обновление UI
    updateUI(data) {
        // Обновляем затемнение (только если overlay видим)
        if (this.overlay && this.overlay.style.display !== 'none') {
            const darkness = 1 - data.brightness;
            const targetAlpha = darkness * 0.6; // Увеличиваем затемнение до 60%
            
            // Плавное изменение прозрачности
            this.currentAlpha += (targetAlpha - this.currentAlpha) * 0.05;
            
            // Рисуем затемнение
            this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
            this.overlayCtx.fillStyle = `rgba(0, 0, 20, ${this.currentAlpha})`;
            this.overlayCtx.fillRect(0, 0, this.overlay.width, this.overlay.height);
        }
    }

    // Событие смены дня/ночи
    onTimeOfDayChanged(data) {
        // Событие смены времени суток (можно использовать для эффектов)
    }

    // Удаление UI
    destroy() {
        if (this.overlay) this.overlay.remove();
    }
    
    // Показать затемнение (для экрана рыбалки)
    show() {
        if (this.overlay) {
            this.overlay.style.display = 'block';
        }
    }
    
    // Скрыть затемнение (для других экранов)
    hide() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DayNightUI;
}
