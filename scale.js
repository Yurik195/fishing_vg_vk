class ScaleManager {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        this.isMobile = window.innerWidth < config.MOBILE_BREAKPOINT;
        
        this.baseWidth = config.BASE_WIDTH;
        this.baseHeight = config.BASE_HEIGHT;
        
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
                return;
        }
        
        this.canvas.width = this.baseWidth;
        this.canvas.height = this.baseHeight;
        
        const scaledWidth = this.baseWidth * this.scale;
        const scaledHeight = this.baseHeight * this.scale;
        
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
            x: (screenX - rect.left) / this.scale,
            y: (screenY - rect.top) / this.scale
        };
    }
}
