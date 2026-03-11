class ScaleManager {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        this.isMobile = window.innerWidth < config.MOBILE_BREAKPOINT;
        
        this.baseWidth = config.BASE_WIDTH;
        this.baseHeight = config.BASE_HEIGHT;
        
        this.scale = 1;
        this.displayScaleX = 1;
        this.displayScaleY = 1;
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
                this.canvas.width = windowWidth;
                this.canvas.height = windowHeight;
                this.displayScaleX = 1;
                this.displayScaleY = 1;
                return;
        }
        
        this.canvas.width = this.baseWidth;
        this.canvas.height = this.baseHeight;
        
        this.displayScaleX = this.scale;
        this.displayScaleY = this.scale;
        if (this.config.SCALE_MODE === 'fit') {
            if (scaleX > this.scale) {
                const maxHorizontalStretch = this.config.MAX_HORIZONTAL_STRETCH || 1;
                this.displayScaleX = Math.min(scaleX, this.scale * maxHorizontalStretch);
            }

            if (scaleY > this.scale) {
                const maxVerticalStretch = this.config.MAX_VERTICAL_STRETCH || 1;
                this.displayScaleY = Math.min(scaleY, this.scale * maxVerticalStretch);
            }
        }

        const scaledWidth = this.baseWidth * this.displayScaleX;
        const scaledHeight = this.baseHeight * this.displayScaleY;
        
        this.offsetX = (windowWidth - scaledWidth) / 2;
        this.offsetY = (windowHeight - scaledHeight) / 2;
        
        // На iOS учитываем offsetLeft/offsetTop из visualViewport
        if (window.visualViewport) {
            this.offsetX += window.visualViewport.offsetLeft;
            this.offsetY += window.visualViewport.offsetTop;
        }
        
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
            x: (screenX - rect.left) / this.displayScaleX,
            y: (screenY - rect.top) / this.displayScaleY
        };
    }
}




