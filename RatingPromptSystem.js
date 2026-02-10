// -*- coding: utf-8 -*-
/**
 * Rating Prompt System
 * Предлагает игроку оценить игру через Yandex SDK каждые 5 уровней начиная с 3-го уровня
 */

class RatingPromptSystem {
    constructor() {
        // Настройки системы
        this.firstPromptLevel = 3;      // Первое предложение на 3 уровне
        this.promptInterval = 5;         // Каждые 5 уровней
        
        // Состояние
        this.lastPromptLevel = 0;        // Последний уровень, когда показывали предложение
        this.hasRated = false;           // Игрок уже оценил игру
        this.promptsShown = 0;           // Сколько раз показывали предложение
        
        this.loadFromStorage();
    }

    /**
     * Проверить, нужно ли показать предложение оценить игру
     * @param {number} currentLevel - Текущий уровень игрока
     * @returns {boolean} - true если нужно показать
     */
    shouldShowPrompt(currentLevel) {
        // Если игрок уже оценил - не показываем
        if (this.hasRated) {
            return false;
        }

        // Если уровень меньше первого порога - не показываем
        if (currentLevel < this.firstPromptLevel) {
            return false;
        }

        // Проверяем, прошло ли нужное количество уровней с последнего предложения
        const levelsSinceLastPrompt = currentLevel - this.lastPromptLevel;
        
        // Показываем на 3, 8, 13, 18, 23 и т.д.
        if (this.lastPromptLevel === 0) {
            // Первое предложение на уровне 3
            return currentLevel >= this.firstPromptLevel;
        } else {
            // Последующие предложения каждые 5 уровней
            return levelsSinceLastPrompt >= this.promptInterval;
        }
    }

    /**
     * Показать модальное окно с предложением оценить игру
     * @param {number} currentLevel - Текущий уровень игрока
     */
    async showPrompt(currentLevel) {
        // Обновляем последний уровень показа
        this.lastPromptLevel = currentLevel;
        this.promptsShown++;
        this.saveToStorage();

        // Создаем модальное окно
        const modal = this.createModal();
        document.body.appendChild(modal);

        // Анимация появления
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.querySelector('.rating-prompt-content').style.transform = 'scale(1)';
        });
    }

    /**
     * Создать модальное окно
     * @returns {HTMLElement} - DOM элемент модального окна
     */
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'rating-prompt-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const content = document.createElement('div');
        content.className = 'rating-prompt-content';
        content.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;

        // Получаем тексты через систему локализации
        const getText = (key, fallback) => {
            if (window.localization && window.localization.get) {
                return window.localization.get(key);
            }
            return fallback;
        };

        const title = getText('rating_prompt_title', '⭐ Оцените игру! ⭐');
        const message = getText('rating_prompt_message', 'Вам нравится наша игра?\nПожалуйста, поставьте оценку!');
        const rateButtonText = getText('rating_prompt_rate_button', 'Оценить игру');
        const laterButtonText = getText('rating_prompt_later_button', 'Позже');

        content.innerHTML = `
            <h2 style="
                color: white;
                font-family: 'BabyPop', Arial, sans-serif;
                font-size: 28px;
                margin: 0 0 20px 0;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            ">${title}</h2>
            
            <p style="
                color: white;
                font-family: 'BabyPop', Arial, sans-serif;
                font-size: 18px;
                margin: 0 0 30px 0;
                line-height: 1.5;
                white-space: pre-line;
            ">${message}</p>
            
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button class="rating-prompt-rate" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 15px 30px;
                    font-family: 'BabyPop', Arial, sans-serif;
                    font-size: 18px;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
                    transition: all 0.2s ease;
                    flex: 1;
                ">${rateButtonText}</button>
                
                <button class="rating-prompt-later" style="
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 2px solid white;
                    border-radius: 12px;
                    padding: 15px 30px;
                    font-family: 'BabyPop', Arial, sans-serif;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    flex: 1;
                ">${laterButtonText}</button>
            </div>
        `;

        modal.appendChild(content);

        // Обработчики кнопок
        const rateButton = content.querySelector('.rating-prompt-rate');
        const laterButton = content.querySelector('.rating-prompt-later');

        // Hover эффекты
        rateButton.addEventListener('mouseenter', () => {
            rateButton.style.transform = 'scale(1.05)';
            rateButton.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.6)';
        });
        rateButton.addEventListener('mouseleave', () => {
            rateButton.style.transform = 'scale(1)';
            rateButton.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.4)';
        });

        laterButton.addEventListener('mouseenter', () => {
            laterButton.style.transform = 'scale(1.05)';
            laterButton.style.background = 'rgba(255, 255, 255, 0.3)';
        });
        laterButton.addEventListener('mouseleave', () => {
            laterButton.style.transform = 'scale(1)';
            laterButton.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        // Клик на "Оценить"
        rateButton.addEventListener('click', () => {
            this.onRateClicked();
            this.closeModal(modal);
        });

        // Клик на "Позже"
        laterButton.addEventListener('click', () => {
            this.closeModal(modal);
        });

        return modal;
    }

    /**
     * Закрыть модальное окно
     * @param {HTMLElement} modal - DOM элемент модального окна
     */
    closeModal(modal) {
        modal.style.opacity = '0';
        modal.querySelector('.rating-prompt-content').style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    /**
     * Обработчик клика на кнопку "Оценить"
     */
    async onRateClicked() {
        console.log('⭐ Player clicked rate button');
        
        // Отмечаем, что игрок оценил игру
        this.hasRated = true;
        this.saveToStorage();

        // Пытаемся открыть страницу оценки через Playgama SDK
        try {
            if (window.playgamaSDK?.isInitialized && window.playgamaSDK.ysdk?.feedback) {
                await window.playgamaSDK.ysdk.feedback.canReview()
                    .then(({ value, reason }) => {
                        if (value) {
                            window.playgamaSDK.ysdk.feedback.requestReview()
                                .then(({ feedbackSent }) => {
                                    console.log('⭐ Feedback sent:', feedbackSent);
                                });
                        }
                    });
            }
        } catch (error) {
            console.error('⭐ Failed to open rating:', error);
        }
    }

    /**
     * Проверить и показать предложение при повышении уровня
     * Вызывается из системы прогрессии при получении нового уровня
     * @param {number} newLevel - Новый уровень игрока
     */
    checkAndShow(newLevel) {
        if (this.shouldShowPrompt(newLevel)) {
            console.log(`⭐ Showing rating prompt at level ${newLevel}`);
            this.showPrompt(newLevel);
        }
    }

    /**
     * Сбросить состояние (для тестирования)
     */
    reset() {
        this.lastPromptLevel = 0;
        this.hasRated = false;
        this.promptsShown = 0;
        this.saveToStorage();
        console.log('⭐ Rating prompt system reset');
    }

    /**
     * Сохранить состояние в localStorage
     */
    saveToStorage() {
        try {
            const data = {
                lastPromptLevel: this.lastPromptLevel,
                hasRated: this.hasRated,
                promptsShown: this.promptsShown
            };
            localStorage.setItem('ratingPromptState', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save rating prompt state:', error);
        }
    }

    /**
     * Загрузить состояние из localStorage
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('ratingPromptState');
            if (saved) {
                const data = JSON.parse(saved);
                this.lastPromptLevel = data.lastPromptLevel || 0;
                this.hasRated = data.hasRated || false;
                this.promptsShown = data.promptsShown || 0;
                console.log('⭐ Rating prompt state loaded:', data);
            }
        } catch (error) {
            console.error('Failed to load rating prompt state:', error);
        }
    }
}

// Создаем глобальный экземпляр
window.ratingPromptSystem = new RatingPromptSystem();
