// UI настроек игры
class SettingsUI {
    constructor(canvas, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        this.visible = false;
        
        // Размеры окна настроек
        this.width = 600;
        this.height = 500;
        this.x = 0;
        this.y = 0;
        
        // Ползунки
        this.sliders = [
            {
                id: 'sound',
                label: L('sound', '🔊 Звуки'),
                value: this.audioManager.soundVolume,
                x: 0, y: 0, width: 400, height: 40
            },
            {
                id: 'music',
                label: L('music', '🎵 Музыка'),
                value: this.audioManager.musicVolume,
                x: 0, y: 0, width: 400, height: 40
            },
            {
                id: 'ambient',
                label: '🌿 Окружение',
                value: this.audioManager.ambientVolume || 0.3, // Обновлено значение по умолчанию
                x: 0, y: 0, width: 400, height: 40
            }
        ];
        
        // Кнопка закрытия в правом верхнем углу
        this.closeButton = {
            x: 0, y: 0, width: 50, height: 50,
            label: ''
        };
        
        // Кнопка "Другие игры" внизу окна
        this.otherGamesButton = {
            x: 0, y: 0, width: 250, height: 50,
            label: L('other_games', '🎮 Другие игры')
        };
        
        // Состояние перетаскивания
        this.draggingSlider = null;
        
        this.updateLayout();
    }
    
    // Обновить метки после смены языка
    updateLabels() {
        this.sliders[0].label = L('sound', '🔊 Звуки');
        this.sliders[1].label = L('music', '🎵 Музыка');
        this.sliders[2].label = L('ambient', '🌿 Окружение');
        this.otherGamesButton.label = L('other_games', '🎮 Другие игры');
        this.updateLayout();
    }
    
    show() {
        this.visible = true;
        // Обновляем значения ползунков из audioManager
        this.sliders[0].value = this.audioManager.soundVolume;
        this.sliders[1].value = this.audioManager.musicVolume;
        this.sliders[2].value = this.audioManager.ambientVolume || 0.5;
        this.updateLayout();
    }
    
    hide() {
        this.visible = false;
        this.draggingSlider = null;
    }
    
    updateLayout() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Центрируем окно
        this.x = (w - this.width) / 2;
        this.y = (h - this.height) / 2;
        
        // Размещаем ползунки
        const startY = this.y + 120;
        const spacing = 100;
        
        this.sliders.forEach((slider, index) => {
            slider.x = this.x + (this.width - slider.width) / 2;
            slider.y = startY + index * spacing;
        });
        
        // Кнопка закрытия в правом верхнем углу
        this.closeButton.x = this.x + this.width - 60;
        this.closeButton.y = this.y + 10;
        
        // Кнопка "Другие игры" внизу окна по центру
        this.otherGamesButton.x = this.x + (this.width - this.otherGamesButton.width) / 2;
        this.otherGamesButton.y = this.y + this.height - 70;
    }
    
    handleClick(x, y) {
        if (!this.visible) return false;
        
        // Воспроизводим звук клика
        if (this.audioManager) this.audioManager.playClickSound();
        
        // Проверка клика по кнопке закрытия
        if (x >= this.closeButton.x && x <= this.closeButton.x + this.closeButton.width &&
            y >= this.closeButton.y && y <= this.closeButton.y + this.closeButton.height) {
            this.hide();
            return false; // Возвращаем false чтобы закрыть настройки
        }
        
        // Проверка клика по кнопке "Другие игры"
        if (x >= this.otherGamesButton.x && x <= this.otherGamesButton.x + this.otherGamesButton.width &&
            y >= this.otherGamesButton.y && y <= this.otherGamesButton.y + this.otherGamesButton.height) {
            this.openDeveloperGames();
            return true;
        }
        
        // Проверка клика по ползункам
        for (const slider of this.sliders) {
            const trackX = slider.x;
            const trackY = slider.y + 30;
            const trackWidth = slider.width;
            const trackHeight = 10;
            
            if (x >= trackX && x <= trackX + trackWidth &&
                y >= trackY - 10 && y <= trackY + trackHeight + 10) {
                // Устанавливаем значение по клику
                const value = Math.max(0, Math.min(1, (x - trackX) / trackWidth));
                this.setSliderValue(slider.id, value);
                return true;
            }
        }
        
        // Клик вне элементов - закрываем
        if (x < this.x || x > this.x + this.width ||
            y < this.y || y > this.y + this.height) {
            this.hide();
            return false;
        }
        
        return true;
    }
    
    handleMouseDown(x, y) {
        if (!this.visible) return false;
        
        // Проверка начала перетаскивания ползунка
        for (const slider of this.sliders) {
            const handleX = slider.x + slider.value * slider.width;
            const handleY = slider.y + 30;
            const handleSize = 20;
            
            if (x >= handleX - handleSize && x <= handleX + handleSize &&
                y >= handleY - handleSize && y <= handleY + handleSize) {
                this.draggingSlider = slider;
                return true;
            }
        }
        
        return false;
    }
    
    handleMouseMove(x, y) {
        if (!this.visible || !this.draggingSlider) return false;
        
        // Обновляем значение перетаскиваемого ползунка
        const slider = this.draggingSlider;
        const value = Math.max(0, Math.min(1, (x - slider.x) / slider.width));
        this.setSliderValue(slider.id, value);
        
        return true;
    }
    
    handleMouseUp() {
        this.draggingSlider = null;
    }
    
    setSliderValue(id, value) {
        const slider = this.sliders.find(s => s.id === id);
        if (!slider) return;
        
        slider.value = value;
        
        // Применяем изменения к audioManager
        if (id === 'sound') {
            this.audioManager.setSoundVolume(value);
        } else if (id === 'music') {
            this.audioManager.setMusicVolume(value);
        } else if (id === 'ambient') {
            this.audioManager.setAmbientVolume(value);
        }
    }
    
    update(dt) {
        if (!this.visible) return;
        this.updateLayout();
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        // Затемнение фона
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Тень
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        
        // Рисуем фон рамки используя rmk.png
        const rmkImage = assetManager.getImage('rmk.png');
        if (rmkImage) {
            // Используем изображение rmk.png как фон рамки
            ctx.drawImage(
                rmkImage,
                this.x, this.y,
                this.width, this.height
            );
        } else {
            // Fallback - градиентный фон если изображение не загружено
            ctx.fillStyle = '#2c3e50';
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.width, this.height, 15);
            ctx.fill();
            
            // Обводка
            ctx.strokeStyle = '#34495e';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Заголовок
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(36);
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(L('settings', '⚙️ Настройки'), this.x + this.width / 2, this.y + 30);
        fontManager.applyLetterSpacing(ctx, false);
        
        // Рисуем ползунки
        this.sliders.forEach(slider => {
            this.renderSlider(ctx, slider);
        });
        
        // Кнопка "Другие игры"
        this.renderOtherGamesButton(ctx, this.otherGamesButton);
        
        // Кнопка закрытия
        this.renderButton(ctx, this.closeButton);
    }
    
    renderSlider(ctx, slider) {
        // Название
        ctx.fillStyle = '#ecf0f1';
        ctx.font = fontManager.getFont(22);
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(slider.label, slider.x, slider.y);
        fontManager.applyLetterSpacing(ctx, false);
        
        // Значение в процентах
        const percent = Math.round(slider.value * 100);
        ctx.fillStyle = '#3498db';
        ctx.font = fontManager.getFont(20);
        ctx.textAlign = 'right';
        ctx.fillText(`${percent}%`, slider.x + slider.width, slider.y);
        
        // Трек ползунка
        const trackY = slider.y + 30;
        const trackHeight = 10;
        
        // Фон трека
        ctx.fillStyle = '#34495e';
        ctx.beginPath();
        ctx.roundRect(slider.x, trackY, slider.width, trackHeight, 5);
        ctx.fill();
        
        // Заполненная часть
        const fillWidth = slider.value * slider.width;
        const gradient = ctx.createLinearGradient(slider.x, 0, slider.x + fillWidth, 0);
        gradient.addColorStop(0, '#3498db');
        gradient.addColorStop(1, '#2980b9');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(slider.x, trackY, fillWidth, trackHeight, 5);
        ctx.fill();
        
        // Ручка ползунка
        const handleX = slider.x + slider.value * slider.width;
        const handleY = trackY + trackHeight / 2;
        const handleSize = 15;
        
        // Тень ручки
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        
        // Ручка
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(handleX, handleY, handleSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Обводка ручки
        ctx.strokeStyle = this.draggingSlider === slider ? '#3498db' : '#95a5a6';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    renderButton(ctx, button) {
        // Загружаем изображение zak.png
        const zakImage = assetManager.getImage('zak.png');
        
        if (zakImage) {
            // Рисуем изображение zak.png
            ctx.drawImage(
                zakImage,
                button.x, button.y,
                button.width, button.height
            );
        } else {
            // Fallback - простая кнопка с крестиком
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.roundRect(button.x, button.y, button.width, button.height, 8);
            ctx.fill();
            
            // Обводка
            ctx.strokeStyle = '#c0392b';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Крестик
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            
            const centerX = button.x + button.width / 2;
            const centerY = button.y + button.height / 2;
            const size = 12;
            
            ctx.beginPath();
            ctx.moveTo(centerX - size, centerY - size);
            ctx.lineTo(centerX + size, centerY + size);
            ctx.moveTo(centerX + size, centerY - size);
            ctx.lineTo(centerX - size, centerY + size);
            ctx.stroke();
        }
    }
    
    renderOtherGamesButton(ctx, button) {
        // Градиентный фон кнопки
        const gradient = ctx.createLinearGradient(button.x, button.y, button.x, button.y + button.height);
        gradient.addColorStop(0, '#3498db');
        gradient.addColorStop(1, '#2980b9');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(button.x, button.y, button.width, button.height, 10);
        ctx.fill();
        
        // Обводка
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Текст кнопки
        ctx.fillStyle = '#fff';
        ctx.font = fontManager.getFont(22);
        fontManager.applyLetterSpacing(ctx, true);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
        fontManager.applyLetterSpacing(ctx, false);
    }
    
    async openDeveloperGames() {
        // Проверяем доступность SDK
        if (window.playgamaSDK && window.playgamaSDK.isInitialized) {
            await window.playgamaSDK.openDeveloperGames();
        } else {
            alert('Функция доступна только в Яндекс Играх');
        }
    }
}
