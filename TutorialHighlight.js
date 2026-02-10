// Система подсветки интерфейса для туториала
class TutorialHighlight {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Текущая подсветка
        this.currentHighlight = null;
        
        // Анимация пульсации
        this.pulseTime = 0;
        
        // Массив областей для подсветки (можно подсвечивать несколько областей одновременно)
        this.areas = [];
    }
    
    // Показать подсветку области
    show(area, text, options = {}) {
        this.currentHighlight = {
            area: area, // { x, y, width, height, radius } или массив областей
            text: text,
            noDarkOverlay: options.noDarkOverlay || false // Опция: не показывать черную подложку
        };
        
        // Если передан массив областей, сохраняем его
        if (Array.isArray(area)) {
            this.areas = area;
        } else {
            this.areas = [area];
        }
    }
    
    // Скрыть подсветку
    hide() {
        this.currentHighlight = null;
        this.areas = [];
    }
    
    // Обновление анимации
    update(dt) {
        if (this.currentHighlight) {
            this.pulseTime += dt;
        }
    }
    
    // Отрисовка подсветки
    render() {
        if (!this.currentHighlight) return;
        
        const ctx = this.ctx;
        const text = this.currentHighlight.text;
        const noDarkOverlay = this.currentHighlight.noDarkOverlay;
        
        ctx.save();
        
        // Если нужна черная подложка
        if (!noDarkOverlay) {
            // Создаем временный canvas для маски
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Затемняем весь экран на временном canvas
            tempCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Вырезаем подсвеченные области используя destination-out
            tempCtx.globalCompositeOperation = 'destination-out';
            
            this.areas.forEach(area => {
                if (area.type === 'line') {
                    // Линия (удочка или леска)
                    const dx = area.x2 - area.x1;
                    const dy = area.y2 - area.y1;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    
                    tempCtx.save();
                    tempCtx.translate(area.x1, area.y1);
                    tempCtx.rotate(angle);
                    
                    // Создаем прямоугольник вдоль линии с плавными краями
                const halfWidth = area.width / 2;
                const gradient = tempCtx.createLinearGradient(0, -halfWidth - 15, 0, halfWidth + 15);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                gradient.addColorStop(0.3, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.7, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                tempCtx.fillStyle = gradient;
                tempCtx.fillRect(-10, -halfWidth - 15, length + 20, area.width + 30);
                
                tempCtx.restore();
            } else if (area.radius) {
                // Круглая область с плавными краями
                const gradient = tempCtx.createRadialGradient(area.x, area.y, 0, area.x, area.y, area.radius + 30);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.7, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                tempCtx.fillStyle = gradient;
                tempCtx.beginPath();
                tempCtx.arc(area.x, area.y, area.radius + 30, 0, Math.PI * 2);
                tempCtx.fill();
            } else {
                // Прямоугольная область с плавными краями
                const padding = 25;
                const fadeSize = 20;
                
                // Основная область (полностью прозрачная)
                tempCtx.fillStyle = 'rgba(255, 255, 255, 1)';
                tempCtx.fillRect(
                    area.x - padding, 
                    area.y - padding, 
                    area.width + padding * 2, 
                    area.height + padding * 2
                );
                
                // Плавные края (градиенты)
                // Верхний край
                const topGradient = tempCtx.createLinearGradient(
                    area.x, 
                    area.y - padding - fadeSize, 
                    area.x, 
                    area.y - padding
                );
                topGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                topGradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
                tempCtx.fillStyle = topGradient;
                tempCtx.fillRect(
                    area.x - padding - fadeSize, 
                    area.y - padding - fadeSize, 
                    area.width + padding * 2 + fadeSize * 2, 
                    fadeSize
                );
                
                // Нижний край
                const bottomGradient = tempCtx.createLinearGradient(
                    area.x, 
                    area.y + area.height + padding, 
                    area.x, 
                    area.y + area.height + padding + fadeSize
                );
                bottomGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                bottomGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                tempCtx.fillStyle = bottomGradient;
                tempCtx.fillRect(
                    area.x - padding - fadeSize, 
                    area.y + area.height + padding, 
                    area.width + padding * 2 + fadeSize * 2, 
                    fadeSize
                );
                
                // Левый край
                const leftGradient = tempCtx.createLinearGradient(
                    area.x - padding - fadeSize, 
                    area.y, 
                    area.x - padding, 
                    area.y
                );
                leftGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                leftGradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
                tempCtx.fillStyle = leftGradient;
                tempCtx.fillRect(
                    area.x - padding - fadeSize, 
                    area.y - padding, 
                    fadeSize, 
                    area.height + padding * 2
                );
                
                // Правый край
                const rightGradient = tempCtx.createLinearGradient(
                    area.x + area.width + padding, 
                    area.y, 
                    area.x + area.width + padding + fadeSize, 
                    area.y
                );
                rightGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                rightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                tempCtx.fillStyle = rightGradient;
                tempCtx.fillRect(
                    area.x + area.width + padding, 
                    area.y - padding, 
                    fadeSize, 
                    area.height + padding * 2
                );
                
                // Углы (диагональные градиенты)
                // Верхний левый угол
                const tlGradient = tempCtx.createRadialGradient(
                    area.x - padding, area.y - padding, 0,
                    area.x - padding, area.y - padding, fadeSize * 1.4
                );
                tlGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                tlGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                tempCtx.fillStyle = tlGradient;
                tempCtx.fillRect(
                    area.x - padding - fadeSize, 
                    area.y - padding - fadeSize, 
                    fadeSize, 
                    fadeSize
                );
                
                // Верхний правый угол
                const trGradient = tempCtx.createRadialGradient(
                    area.x + area.width + padding, area.y - padding, 0,
                    area.x + area.width + padding, area.y - padding, fadeSize * 1.4
                );
                trGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                trGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                tempCtx.fillStyle = trGradient;
                tempCtx.fillRect(
                    area.x + area.width + padding, 
                    area.y - padding - fadeSize, 
                    fadeSize, 
                    fadeSize
                );
                
                // Нижний левый угол
                const blGradient = tempCtx.createRadialGradient(
                    area.x - padding, area.y + area.height + padding, 0,
                    area.x - padding, area.y + area.height + padding, fadeSize * 1.4
                );
                blGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                blGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                tempCtx.fillStyle = blGradient;
                tempCtx.fillRect(
                    area.x - padding - fadeSize, 
                    area.y + area.height + padding, 
                    fadeSize, 
                    fadeSize
                );
                
                // Нижний правый угол
                const brGradient = tempCtx.createRadialGradient(
                    area.x + area.width + padding, area.y + area.height + padding, 0,
                    area.x + area.width + padding, area.y + area.height + padding, fadeSize * 1.4
                );
                brGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                brGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                tempCtx.fillStyle = brGradient;
                tempCtx.fillRect(
                    area.x + area.width + padding, 
                    area.y + area.height + padding, 
                    fadeSize, 
                    fadeSize
                );
            }
        });
        
            // Рисуем временный canvas на основной
            ctx.drawImage(tempCanvas, 0, 0);
            
            // Возвращаем нормальный режим рисования
            ctx.globalCompositeOperation = 'source-over';
        }
        
        // Пульсирующая рамка вокруг областей
        const pulse = 1 + Math.sin(this.pulseTime * 3) * 0.2;
        
        this.areas.forEach(area => {
            // Пропускаем линии - для них не рисуем рамки
            if (area.type === 'line') return;
            
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.9 * pulse})`;
            ctx.lineWidth = 5 * pulse;
            ctx.shadowColor = 'rgba(255, 215, 0, 0.9)';
            ctx.shadowBlur = 25;
            
            if (area.radius) {
                ctx.beginPath();
                ctx.arc(area.x, area.y, area.radius + 15, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                const radius = 10;
                ctx.beginPath();
                ctx.moveTo(area.x - 15 + radius, area.y - 15);
                ctx.lineTo(area.x + area.width + 15 - radius, area.y - 15);
                ctx.quadraticCurveTo(area.x + area.width + 15, area.y - 15, area.x + area.width + 15, area.y - 15 + radius);
                ctx.lineTo(area.x + area.width + 15, area.y + area.height + 15 - radius);
                ctx.quadraticCurveTo(area.x + area.width + 15, area.y + area.height + 15, area.x + area.width + 15 - radius, area.y + area.height + 15);
                ctx.lineTo(area.x - 15 + radius, area.y + area.height + 15);
                ctx.quadraticCurveTo(area.x - 15, area.y + area.height + 15, area.x - 15, area.y + area.height + 15 - radius);
                ctx.lineTo(area.x - 15, area.y - 15 + radius);
                ctx.quadraticCurveTo(area.x - 15, area.y - 15, area.x - 15 + radius, area.y - 15);
                ctx.closePath();
                ctx.stroke();
            }
        });
        
        // Текст подсказки
        if (text) {
            ctx.shadowColor = 'transparent';
            ctx.font = fontManager.getFont(32, 'bold');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            // Позиция текста (над первой областью)
            const firstArea = this.areas[0];
            let textY = firstArea.y - 80;
            if (firstArea.radius) {
                textY = firstArea.y - firstArea.radius - 80;
            }
            
            // Если текст выходит за верхний край, показываем снизу
            if (textY < 50) {
                textY = firstArea.y + (firstArea.height || firstArea.radius * 2) + 50;
            }
            
            // Черная обводка
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 6;
            ctx.strokeText(text, this.canvas.width / 2, textY);
            
            // Золотой текст
            ctx.fillStyle = '#FFD700';
            ctx.fillText(text, this.canvas.width / 2, textY);
        }
        
        ctx.restore();
    }
}
