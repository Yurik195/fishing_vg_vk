// Рендерер воды и окружения
class WaterRenderer {
    constructor(canvas, zoneId = 1) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.zoneId = zoneId;
        
        // Настройки производительности
        this.performanceMode = false; // Упрощенный рендеринг
        
        // Автоматическое определение производительности
        this.detectPerformance();
        
        // Временный canvas для рендеринга фона перед применением эффекта
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        
        // Загрузка фонового изображения для локации из облака
        this.backgroundImage = null;
        this.backgroundLoaded = false;
        
        // Устанавливаем фон в зависимости от локации из ZONES_DATABASE
        const zone = ZONES_DATABASE ? ZONES_DATABASE.find(z => z.id === zoneId) : null;
        if (zone && zone.background) {
            // Загружаем фон из облака через AssetManager
            if (window.assetManager) {
                window.assetManager.loadLocationBackground(zone.background).then(img => {
                    this.backgroundImage = img;
                    this.backgroundLoaded = !!img;
                });
            }
        }
        
        this.waveTime = 0;
        this.waves = [];
        
        // Генерируем волны
        for (let i = 0; i < 5; i++) {
            this.waves.push({
                amplitude: 3 + Math.random() * 4,
                frequency: 0.01 + Math.random() * 0.02,
                speed: 0.5 + Math.random() * 1,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    // Автоматическое определение производительности устройства
    detectPerformance() {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        const startTime = performance.now();
        
        // Простой тест производительности
        for (let i = 0; i < 1000; i++) {
            ctx.fillRect(Math.random() * 100, Math.random() * 100, 10, 10);
        }
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Если рендеринг медленный, включаем режим производительности
        if (renderTime > 50) {
            this.performanceMode = true;
        }
    }
    
    // Загрузка фона через AssetManager
    async loadBackground(zoneId) {
        const zone = ZONES_DATABASE ? ZONES_DATABASE.find(z => z.id === zoneId) : null;
        const backgroundFile = zone && zone.background ? zone.background : 'fon.jpg';
        
        if (window.assetManager) {
            try {
                this.backgroundImage = await window.assetManager.loadLocationBackground(backgroundFile);
                this.backgroundLoaded = true;
            } catch (error) {
            }
        }
    }
    
    // Обновление зоны (смена фона)
    updateZone(zoneId) {
        this.zoneId = zoneId;
        this.backgroundLoaded = false;
        this.backgroundImage = null; // Сбрасываем старый фон
        
        // Загружаем новый фон через AssetManager
        this.loadBackground(zoneId);
    }
    
    // Ручная настройка качества
    setQuality(level) {
        switch (level) {
            case 'performance':
                this.performanceMode = true;
                break;
            case 'low':
            case 'medium':
            case 'high':
                this.performanceMode = false;
                break;
        }
    }
    
    update(dt) {
        this.waveTime += dt;
    }
    
    render(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Настраиваем размер offscreen canvas
        if (this.offscreenCanvas.width !== w || this.offscreenCanvas.height !== h) {
            this.offscreenCanvas.width = w;
            this.offscreenCanvas.height = h;
        }
        
        // Рисуем фон на offscreen canvas
        if (this.backgroundLoaded && this.backgroundImage) {
            this.offscreenCtx.drawImage(this.backgroundImage, 0, 0, w, h);
            
            // Определяем где начинается вода (половина экрана)
            const waterTopY = h * 0.5;
            
            // Рисуем весь фон без искажений
            ctx.drawImage(this.offscreenCanvas, 0, 0, w, h);
        } else {
            // Небо с градиентом (запасной вариант)
            const skyGradient = ctx.createLinearGradient(0, 0, 0, h * FISHING_CONFIG.WATER_ZONE.TOP);
            skyGradient.addColorStop(0, '#4a90d9');
            skyGradient.addColorStop(0.5, '#87ceeb');
            skyGradient.addColorStop(1, '#b0e0e6');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, w, h * FISHING_CONFIG.WATER_ZONE.TOP + 20);
            
            // Облака
            this.renderClouds(ctx, w, h);
            
            // Далёкий берег/остров
            this.renderIsland(ctx, w, h);
            
            // Вода
            this.renderWater(ctx, w, h);
        }
    }
    
    renderClouds(ctx, w, h) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        const clouds = [
            { x: w * 0.2, y: h * 0.08, scale: 1 },
            { x: w * 0.5, y: h * 0.12, scale: 0.7 },
            { x: w * 0.8, y: h * 0.06, scale: 0.9 }
        ];
        
        for (const cloud of clouds) {
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, 30 * cloud.scale, 0, Math.PI * 2);
            ctx.arc(cloud.x + 25 * cloud.scale, cloud.y - 5, 25 * cloud.scale, 0, Math.PI * 2);
            ctx.arc(cloud.x + 50 * cloud.scale, cloud.y, 28 * cloud.scale, 0, Math.PI * 2);
            ctx.arc(cloud.x + 25 * cloud.scale, cloud.y + 10, 20 * cloud.scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderIsland(ctx, w, h) {
        const islandY = h * FISHING_CONFIG.WATER_ZONE.TOP;
        
        // Горы/холмы на заднем плане
        ctx.fillStyle = '#2d5a3d';
        ctx.beginPath();
        ctx.moveTo(0, islandY);
        ctx.lineTo(w * 0.1, islandY - 40);
        ctx.lineTo(w * 0.25, islandY - 80);
        ctx.lineTo(w * 0.4, islandY - 50);
        ctx.lineTo(w * 0.5, islandY - 90);
        ctx.lineTo(w * 0.65, islandY - 60);
        ctx.lineTo(w * 0.8, islandY - 30);
        ctx.lineTo(w, islandY);
        ctx.fill();
        
        // Пляж
        ctx.fillStyle = '#f4e4bc';
        ctx.beginPath();
        ctx.moveTo(w * 0.15, islandY);
        ctx.quadraticCurveTo(w * 0.3, islandY + 15, w * 0.5, islandY + 5);
        ctx.quadraticCurveTo(w * 0.7, islandY - 5, w * 0.85, islandY);
        ctx.lineTo(w * 0.85, islandY + 20);
        ctx.lineTo(w * 0.15, islandY + 20);
        ctx.fill();
    }
    
    renderWater(ctx, w, h) {
        const waterTop = h * FISHING_CONFIG.WATER_ZONE.TOP;
        const waterBottom = h * FISHING_CONFIG.WATER_ZONE.BOTTOM;
        
        // Градиент воды
        const waterGradient = ctx.createLinearGradient(0, waterTop, 0, waterBottom);
        waterGradient.addColorStop(0, '#40c9c9');
        waterGradient.addColorStop(0.3, '#1e90aa');
        waterGradient.addColorStop(0.7, '#0d7a8c');
        waterGradient.addColorStop(1, '#0d5c6e');
        
        ctx.fillStyle = waterGradient;
        ctx.fillRect(0, waterTop, w, waterBottom - waterTop);
        
        // Волны на поверхности
        this.renderWaves(ctx, w, waterTop);
        
        // Блики на воде
        this.renderWaterHighlights(ctx, w, waterTop, waterBottom);
    }
    
    renderWaves(ctx, w, waterTop) {
        // В режиме производительности рисуем меньше волн
        const waveCount = this.performanceMode ? 1 : 3;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        
        for (let row = 0; row < waveCount; row++) {
            const y = waterTop + 20 + row * 40;
            
            ctx.beginPath();
            ctx.moveTo(0, y);
            
            // В режиме производительности используем меньше точек
            const step = this.performanceMode ? 20 : 10;
            
            for (let x = 0; x <= w; x += step) {
                let waveY = y;
                
                // В режиме производительности используем меньше волн
                const waveLimit = this.performanceMode ? 2 : this.waves.length;
                
                for (let i = 0; i < waveLimit; i++) {
                    const wave = this.waves[i];
                    waveY += Math.sin(x * wave.frequency + this.waveTime * wave.speed + wave.phase + row) * wave.amplitude;
                }
                ctx.lineTo(x, waveY);
            }
            
            ctx.stroke();
        }
    }
    
    renderWaterHighlights(ctx, w, waterTop, waterBottom) {
        // В режиме производительности пропускаем блики
        if (this.performanceMode) return;
        
        // Солнечные блики
        const highlights = [
            { x: w * 0.3, y: waterTop + 80, size: 60 },
            { x: w * 0.5, y: waterTop + 150, size: 40 },
            { x: w * 0.7, y: waterTop + 100, size: 50 }
        ];
        
        for (const hl of highlights) {
            const shimmer = Math.sin(this.waveTime * 2 + hl.x * 0.01) * 0.3 + 0.7;
            const gradient = ctx.createRadialGradient(hl.x, hl.y, 0, hl.x, hl.y, hl.size);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${0.15 * shimmer})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(hl.x, hl.y, hl.size, hl.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Проверка, находится ли точка в зоне воды
    isInWaterZone(x, y) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const waterTop = h * FISHING_CONFIG.WATER_ZONE.TOP;
        const waterBottom = h * FISHING_CONFIG.WATER_ZONE.BOTTOM;

        // Отступ 10% от краев экрана по горизонтали
        const marginX = w * 0.1;
        const leftBound = marginX;
        const rightBound = w - marginX;

        return y >= waterTop && y <= waterBottom && x >= leftBound && x <= rightBound;
    }
    
    getWaterTop() {
        return this.canvas.height * FISHING_CONFIG.WATER_ZONE.TOP;
    }
}
