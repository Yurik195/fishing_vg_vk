class ScaleManager {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        this.isMobile = window.innerWidth < config.MOBILE_BREAKPOINT;
        
        this.baseWidth = config.BASE_WIDTH;
        this.baseHeight = config.BASE_HEIGHT;
        
        // Получаем плотность пикселей устройства для High DPI дисплеев
        this.dpr = window.devicePixelRatio || 1;
        
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.resize(), 100);
        });
        
        // Слушаем изменения visualViewport для iOS (баннеры, клавиатура и т.д.)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => this.resize());
            window.visualViewport.addEventListener('scroll', () => this.resize());
        }
    }
    
    resize() {
        // Обновляем DPR на случай изменения (например, перетаскивание между мониторами)
        this.dpr = window.devicePixelRatio || 1;
        
        // Используем visualViewport для iOS, который учитывает баннеры и другие наложенные элементы
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        
        // На iOS используем visualViewport для точного определения доступного пространства
        if (window.visualViewport) {
            windowWidth = window.visualViewport.width;
            windowHeight = window.visualViewport.height;
        }
        
        this.isMobile = windowWidth < this.config.MOBILE_BREAKPOINT;
        
        const scaleX = windowWidth / this.baseWidth;
        const scaleY = windowHeight / this.baseHeight;
        
        switch (this.config.SCALE_MODE) {
            case 'fit':
                this.scale = Math.min(scaleX, scaleY);
                break;
            case 'fill':
                this.scale = Math.max(scaleX, scaleY);
                break;
            case 'stretch':
                // Устанавливаем физическое разрешение с учетом DPR
                this.canvas.width = Math.floor(windowWidth * this.dpr);
                this.canvas.height = Math.floor(windowHeight * this.dpr);
                
                // Масштабируем контекст обратно для работы в логических координатах
                const ctxStretch = this.canvas.getContext('2d');
                ctxStretch.scale(this.dpr, this.dpr);
                
                // CSS размеры остаются логическими
                this.canvas.style.width = `${windowWidth}px`;
                this.canvas.style.height = `${windowHeight}px`;
                return;
        }
        
        // Устанавливаем физическое разрешение canvas с учетом DPR для четкости
        this.canvas.width = Math.floor(this.baseWidth * this.dpr);
        this.canvas.height = Math.floor(this.baseHeight * this.dpr);
        
        // Масштабируем контекст для работы в логических координатах (весь код продолжает работать как раньше)
        const ctx = this.canvas.getContext('2d');
        ctx.scale(this.dpr, this.dpr);
        
        // Включаем качественное сглаживание
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        const scaledWidth = this.baseWidth * this.scale;
        const scaledHeight = this.baseHeight * this.scale;
        
        this.offsetX = (windowWidth - scaledWidth) / 2;
        this.offsetY = (windowHeight - scaledHeight) / 2;
        
        // На iOS учитываем offsetLeft/offsetTop из visualViewport
        if (window.visualViewport) {
            this.offsetX += window.visualViewport.offsetLeft;
            this.offsetY += window.visualViewport.offsetTop;
        }
        
        // CSS размеры - логические пиксели (визуально все остается на тех же местах)
        this.canvas.style.width = `${scaledWidth}px`;
        this.canvas.style.height = `${scaledHeight}px`;
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = `${this.offsetX}px`;
        this.canvas.style.top = `${this.offsetY}px`;
    }
    
    screenToGame(screenX, screenY) {
        // Для iOS используем getBoundingClientRect для точных координат
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (screenX - rect.left) / this.scale,
            y: (screenY - rect.top) / this.scale
        };
    }
}
