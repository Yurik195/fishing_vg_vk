// UI индикатор загрузки файлов из облака
class LoadingIndicator {
    constructor() {
        this.isVisible = false;
        this.currentProgress = 0;
        this.currentText = '';
        
        // Локализация
        this.translations = {
            ru: {
                loading: 'Загрузка',
                loadingLocation: 'Загрузка локации',
                loadingFish: 'Загрузка рыб',
                loadingIcons: 'Загрузка карты',
                loadingMusic: 'Загрузка музыки',
                loadingSounds: 'Загрузка звуков'
            },
            en: {
                loading: 'Loading',
                loadingLocation: 'Loading location',
                loadingFish: 'Loading fish',
                loadingIcons: 'Loading map',
                loadingMusic: 'Loading music',
                loadingSounds: 'Loading sounds'
            }
        };
    }

    /**
     * Показать индикатор загрузки
     * @param {string} textKey - Ключ текста из translations
     * @param {number} progress - Прогресс 0-100 (опционально)
     */
    show(textKey = 'loading', progress = 0) {
        this.isVisible = true;
        this.currentProgress = progress;
        this.currentText = textKey;
    }

    /**
     * Обновить прогресс
     * @param {number} progress - Прогресс 0-100
     */
    updateProgress(progress) {
        this.currentProgress = Math.min(100, Math.max(0, progress));
    }

    /**
     * Скрыть индикатор
     */
    hide() {
        this.isVisible = false;
        this.currentProgress = 0;
    }

    /**
     * Отрисовка индикатора
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} canvasWidth
     * @param {number} canvasHeight
     * @param {string} locale - Текущая локаль ('ru' или 'en')
     */
    render(ctx, canvasWidth, canvasHeight, locale = 'ru') {
        if (!this.isVisible) return;

        const scale = canvasWidth / 1080;
        
        // Полупрозрачный фон
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Размеры панели загрузки
        const panelWidth = 400 * scale;
        const panelHeight = 120 * scale;
        const panelX = (canvasWidth - panelWidth) / 2;
        const panelY = (canvasHeight - panelHeight) / 2;

        // Панель загрузки
        ctx.fillStyle = 'rgba(30, 30, 30, 0.95)';
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 3 * scale;
        
        // Скругленный прямоугольник
        this._roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 15 * scale);
        ctx.fill();
        ctx.stroke();

        // Текст загрузки
        const text = this.translations[locale]?.[this.currentText] || this.translations['ru'][this.currentText];
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${24 * scale}px "BabyPop", Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(text + '...', canvasWidth / 2, panelY + 40 * scale);

        // Прогресс бар
        const barWidth = 350 * scale;
        const barHeight = 20 * scale;
        const barX = (canvasWidth - barWidth) / 2;
        const barY = panelY + 65 * scale;

        // Фон прогресс бара
        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        this._roundRect(ctx, barX, barY, barWidth, barHeight, 10 * scale);
        ctx.fill();

        // Заполненная часть прогресс бара
        if (this.currentProgress > 0) {
            const fillWidth = (barWidth - 4 * scale) * (this.currentProgress / 100);
            
            // Градиент для прогресса
            const gradient = ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
            gradient.addColorStop(0, '#4a90e2');
            gradient.addColorStop(1, '#63b3ed');
            
            ctx.fillStyle = gradient;
            this._roundRect(ctx, barX + 2 * scale, barY + 2 * scale, fillWidth, barHeight - 4 * scale, 8 * scale);
            ctx.fill();
        }

        // Процент
        ctx.fillStyle = '#ffffff';
        ctx.font = `${16 * scale}px "BabyPop", Arial`;
        ctx.fillText(`${Math.round(this.currentProgress)}%`, canvasWidth / 2, barY + barHeight + 20 * scale);
    }

    /**
     * Вспомогательная функция для рисования скругленного прямоугольника
     */
    _roundRect(ctx, x, y, width, height, radius) {
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
