// Класс лески
class FishingLine {
    constructor() {
        this.visible = false;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        
        // Параметры кривой
        this.tension = 0;
        this.sagAmount = 30;
        
        // Цвет и толщина
        this.color = FISHING_CONFIG.VISUALS.LINE_COLOR;
        this.width = FISHING_CONFIG.VISUALS.LINE_WIDTH;
    }
    
    setPoints(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
    }
    
    setTension(tension) {
        // tension: 0 = провисшая, 1 = натянутая
        this.tension = Math.max(0, Math.min(1, tension));
    }
    
    show() {
        this.visible = true;
    }
    
    hide() {
        this.visible = false;
    }

    reset() {
        this.visible = false;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.tension = 0;
        this.sagAmount = 30;
        this.color = FISHING_CONFIG.VISUALS.LINE_COLOR;
        this.width = FISHING_CONFIG.VISUALS.LINE_WIDTH;
    }
    
    render(ctx) {
        if (!this.visible) return;

        ctx.save();

        // Вычисляем провисание на основе натяжения
        const sag = this.sagAmount * (1 - this.tension * 0.8);

        // Контрольная точка для кривой Безье
        const midX = (this.startX + this.endX) / 2;
        const midY = (this.startY + this.endY) / 2 + sag;

        // Цвет лески зависит от натяжения (зеленый -> красный)
        const red = Math.floor(this.tension * 255);
        const green = Math.floor((1 - this.tension) * 255);
        const lineColor = `rgb(${red}, ${green}, 0)`;

        // Толщина лески увеличивается при натяжении
        const baseWidth = this.width;
        const tensionWidth = baseWidth + (this.tension * 3);

        // Основная леска
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = tensionWidth;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.quadraticCurveTo(midX, midY, this.endX, this.endY);
        ctx.stroke();

        // Блик на леске (только при нормальном натяжении)
        if (this.tension < 0.8) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.startX + 1, this.startY);
            ctx.quadraticCurveTo(midX + 1, midY - 2, this.endX + 1, this.endY);
            ctx.stroke();
        }

        // Анимация тряски при критическом натяжении
        if (this.tension > 0.8) {
            const shakeAmount = (this.tension - 0.8) * 10;
            const shakeX = (Math.random() - 0.5) * shakeAmount;
            const shakeY = (Math.random() - 0.5) * shakeAmount;

            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = tensionWidth + 1;
            ctx.beginPath();
            ctx.moveTo(this.startX + shakeX, this.startY + shakeY);
            ctx.quadraticCurveTo(midX + shakeX, midY + shakeY, this.endX + shakeX, this.endY + shakeY);
            ctx.stroke();
        }

        ctx.restore();
    }
    
    // Получить длину лески
    getLength() {
        const dx = this.endX - this.startX;
        const dy = this.endY - this.startY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
