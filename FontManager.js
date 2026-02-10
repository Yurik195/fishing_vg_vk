// Менеджер шрифтов для игры
class FontManager {
    constructor() {
        this.customFont = 'BabyPop';
        this.customFontLoaded = false;
        this.checkCustomFont();
    }
    
    // Проверка загрузки кастомного шрифта
    checkCustomFont() {
        if (typeof document !== 'undefined' && document.fonts) {
            document.fonts.ready.then(() => {
                document.fonts.load('20px BabyPop').then(() => {
                    this.customFontLoaded = true;
                    console.log('✅ Шрифт BabyPop загружен для игры');
                }).catch(() => {
                    console.log('⚠️ Шрифт BabyPop не найден, используется Arial');
                });
            });
        }
    }
    
    // Получить шрифт
    getFont(size, weight = 'bold') {
        if (this.customFontLoaded) {
            const fontWeight = weight === 'bold' ? 'bold ' : '';
            return `${fontWeight}${size}px ${this.customFont}, Arial`;
        }
        return `${weight} ${size}px Arial`;
    }
    
    // Применить межбуквенное расстояние
    applyLetterSpacing(ctx, forTitles = false) {
        if (forTitles && this.customFontLoaded) {
            // Увеличенное расстояние для заголовков и названий
            ctx.letterSpacing = '1.5px';
        } else {
            ctx.letterSpacing = '0px';
        }
    }
}

// Глобальный экземпляр менеджера шрифтов
const fontManager = new FontManager();
