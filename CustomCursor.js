/**
 * Система кастомного курсора
 * Отображает спрайт palec.png вместо курсора по нажатию клавиши "З"
 */
class CustomCursor {
    constructor() {
        this.enabled = false;
        this.cursorSprite = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;
        this.normalScale = 0.8; // Уменьшен на 20%
        this.pressedScale = 0.68; // 0.8 * 0.85
        this.currentScale = this.normalScale;
        this.offsetX = -10; // Смещение влево
        this.offsetY = 0; // Будет вычислено после загрузки спрайта
        
        this.init();
    }
    
    init() {
        // Загружаем спрайт курсора
        // this.cursorSprite = new Image();
        // this.cursorSprite.src = 'palec.png';
        
        // Вычисляем смещение по Y после загрузки
        // this.cursorSprite.onload = () => {
        //     this.offsetY = this.cursorSprite.height * this.normalScale / 2; // Половина высоты спрайта
        //     console.log(`👆 Спрайт курсора загружен: ${this.cursorSprite.width}x${this.cursorSprite.height}, offsetY: ${this.offsetY}`);
        // };
        
        // Слушаем движение мыши
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Слушаем нажатие ЛКМ
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0 && this.enabled) { // ЛКМ
                this.isMouseDown = true;
                this.currentScale = this.pressedScale;
            }
        });
        
        // Слушаем отпускание ЛКМ
        document.addEventListener('mouseup', (e) => {
            if (e.button === 0 && this.enabled) { // ЛКМ
                this.isMouseDown = false;
                this.currentScale = this.normalScale;
            }
        });
        
        // Слушаем клавишу "З" для переключения
        document.addEventListener('keydown', (e) => {
            if (e.key === 'з' || e.key === 'З' || e.key === 'p' || e.key === 'P') {
                this.toggle();
            }
        });
        
        console.log('✅ CustomCursor инициализирован (клавиша "З" для переключения)');
    }
    
    toggle() {
        this.enabled = !this.enabled;
        
        if (this.enabled) {
            // Скрываем системный курсор
            document.body.style.cursor = 'none';
            console.log('👆 Кастомный курсор включен');
        } else {
            // Показываем системный курсор
            document.body.style.cursor = 'default';
            this.isMouseDown = false;
            this.currentScale = this.normalScale;
            console.log('👆 Кастомный курсор выключен');
        }
    }
    
    render(ctx) {
        if (!this.enabled || !this.cursorSprite.complete) {
            return;
        }
        
        // Сохраняем контекст
        ctx.save();
        
        // Переходим к позиции курсора с учетом смещения
        ctx.translate(this.mouseX + this.offsetX, this.mouseY + this.offsetY);
        
        // Применяем масштаб
        ctx.scale(this.currentScale, this.currentScale);
        
        // Рисуем спрайт (центрируем)
        const width = this.cursorSprite.width;
        const height = this.cursorSprite.height;
        ctx.drawImage(this.cursorSprite, -width / 2, -height / 2, width, height);
        
        // Восстанавливаем контекст
        ctx.restore();
    }
}
