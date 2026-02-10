class InputManager {
    constructor(canvas, scaleManager) {
        this.canvas = canvas;
        this.scaleManager = scaleManager;
        this.pointers = new Map();
        this.listeners = [];
        
        this.init();
    }
    
    init() {
        // Запрещаем контекстное меню на всей странице (включая черные рамки)
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Флаг для отслеживания скролла в UI
        this.isScrollingUI = false;
        
        // Определяем iOS для специальной обработки
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        // Только для iOS: отслеживание начальной позиции тача для определения движения
        if (this.isIOS) {
            this.touchStartPos = new Map();
            this.touchMoveThreshold = 15; // Порог движения для iOS
        }
        
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });
        
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        // Обработка скролла колесиком мыши
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());
    }
    
    // Метод для установки флага скролла UI (вызывается из UI компонентов)
    setScrollingUI(isScrolling) {
        this.isScrollingUI = isScrolling;
    }
    
    handleTouchStart(e) {
        // Всегда предотвращаем выделение текста и zoom
        e.preventDefault();
        
        // Только для iOS: сохраняем начальные позиции для определения движения
        if (this.isIOS) {
            for (let touch of e.changedTouches) {
                this.touchStartPos.set(touch.identifier, {
                    x: touch.clientX,
                    y: touch.clientY,
                    hasMoved: false
                });
            }
        }
        
        for (let touch of e.changedTouches) {
            const pos = this.scaleManager.screenToGame(touch.clientX, touch.clientY);
            this.pointers.set(touch.identifier, pos);
            this.emit('pointerdown', pos, touch.identifier);
        }
    }
    
    handleTouchMove(e) {
        // Для iOS: умная обработка с проверкой движения
        if (this.isIOS) {
            let hasMovement = false;
            for (let touch of e.changedTouches) {
                const startPos = this.touchStartPos.get(touch.identifier);
                if (startPos) {
                    const dx = touch.clientX - startPos.x;
                    const dy = touch.clientY - startPos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > this.touchMoveThreshold) {
                        hasMovement = true;
                        startPos.hasMoved = true;
                    }
                }
            }
            
            // Предотвращаем только если было реальное движение
            if (hasMovement) {
                e.preventDefault();
            }
        } else {
            // Для Android и других: всегда предотвращаем (старое поведение)
            e.preventDefault();
        }
        
        for (let touch of e.changedTouches) {
            const pos = this.scaleManager.screenToGame(touch.clientX, touch.clientY);
            this.pointers.set(touch.identifier, pos);
            this.emit('pointermove', pos, touch.identifier);
        }
    }
    
    handleTouchEnd(e) {
        // Для iOS: предотвращаем только если было движение
        if (this.isIOS) {
            for (let touch of e.changedTouches) {
                const startPos = this.touchStartPos.get(touch.identifier);
                if (startPos && startPos.hasMoved) {
                    e.preventDefault();
                    break;
                }
            }
        } else {
            // Для Android и других: всегда предотвращаем (старое поведение)
            e.preventDefault();
        }
        
        for (let touch of e.changedTouches) {
            const pos = this.scaleManager.screenToGame(touch.clientX, touch.clientY);
            this.emit('pointerup', pos, touch.identifier);
            this.pointers.delete(touch.identifier);
            
            // Только для iOS: очищаем данные о начальной позиции
            if (this.isIOS) {
                this.touchStartPos.delete(touch.identifier);
            }
        }
    }
    
    handleMouseDown(e) {
        const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
        this.pointers.set('mouse', pos);
        this.emit('pointerdown', pos, 'mouse');
    }
    
    handleMouseMove(e) {
        const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
        
        if (this.pointers.has('mouse')) {
            this.pointers.set('mouse', pos);
        }
        
        // Всегда отправляем событие движения для обработки hover
        this.emit('pointermove', pos, 'mouse');
    }
    
    handleMouseUp(e) {
        if (this.pointers.has('mouse')) {
            const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
            this.emit('pointerup', pos, 'mouse');
            this.pointers.delete('mouse');
        }
    }
    
    handleWheel(e) {
        e.preventDefault();
        const pos = this.scaleManager.screenToGame(e.clientX, e.clientY);
        const deltaY = e.deltaY > 0 ? 1 : -1;
        this.emit('wheel', { pos, deltaY });
    }
    
    on(event, callback) {
        this.listeners.push({ event, callback });
    }
    
    removeAllListeners() {
        this.listeners = [];
    }
    
    emit(event, ...args) {
        this.listeners
            .filter(l => l.event === event)
            .forEach(l => l.callback(...args));
    }
}
