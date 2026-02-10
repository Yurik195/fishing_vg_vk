// -*- coding: utf-8 -*-
// Система туториала для новичков
class TutorialSystem {
    constructor() {
        // Флаг завершения туториала
        this.tutorialCompleted = false;
        
        // Счетчик пойманных рыб в туториале
        this.tutorialFishCount = 0;
        
        // Максимум попыток новичка
        this.maxTutorialAttempts = 10;
        
        // Текущий шаг туториала
        this.currentStep = 0;
        
        // Флаг первого входа в рыбалку
        this.firstFishingSession = true;
        
        // Флаг показа UI туториала (показываем только один раз)
        this.uiTutorialShown = false;
        
        // Флаг загрузки данных (инициализируется как false)
        this.dataLoaded = false;
        
        // Шаги туториала
        this.steps = [
            'cast',      // 0: Заброс удочки
            'hook',      // 1: Подсечка рыбы
            'reel',      // 2: Вываживание
            'ui'         // 3: Обзор UI элементов
        ];
        
        // Загружаем состояние
        this.loadFromStorage();
    }
    
    // Проверить, завершен ли туториал
    isTutorialCompleted() {
        return this.tutorialCompleted;
    }
    
    // Проверить, активен ли режим новичка
    isNoviceMode() {
        return !this.tutorialCompleted && this.tutorialFishCount < this.maxTutorialAttempts;
    }
    
    // Получить оставшиеся попытки новичка
    getRemainingAttempts() {
        if (this.tutorialCompleted) return 0;
        return Math.max(0, this.maxTutorialAttempts - this.tutorialFishCount);
    }
    
    // Зарегистрировать пойманную рыбу
    registerCatch() {
        if (!this.tutorialCompleted) {
            this.tutorialFishCount++;
            
            // Больше не завершаем туториал автоматически после 10 рыб
            // Туториал завершается только после показа всех подсказок UI
            
            this.saveToStorage();
        }
    }
    
    // Завершить туториал
    completeTutorial() {
        this.tutorialCompleted = true;
        // НЕ сбрасываем currentStep в 0, оставляем как есть
        this.saveToStorage();
        console.log('🎓 Туториал завершен!');
    }
    
    // Проверить, первый ли это вход в рыбалку
    isFirstFishingSession() {
        return this.firstFishingSession;
    }
    
    // Отметить, что первая сессия рыбалки завершена
    completeFirstSession() {
        this.firstFishingSession = false;
        this.saveToStorage();
    }
    
    // Проверить, показан ли UI туториал
    isUITutorialShown() {
        return this.uiTutorialShown;
    }
    
    // Отметить, что UI туториал показан
    markUITutorialShown() {
        this.uiTutorialShown = true;
        this.saveToStorage();
    }
    
    // Получить текущий шаг туториала
    getCurrentStep() {
        return this.steps[this.currentStep];
    }
    
    // Перейти к следующему шагу
    nextStep() {
        this.currentStep++;
        if (this.currentStep >= this.steps.length) {
            this.currentStep = this.steps.length - 1; // Остаемся на последнем шаге
        }
        this.saveToStorage();
        return this.getCurrentStep();
    }
    
    // Сбросить шаги туториала
    resetSteps() {
        this.currentStep = 0;
        this.saveToStorage();
    }
    
    // Получить параметры облегченного режима для новичков
    getNoviceParams() {
        if (!this.isNoviceMode()) return null;
        
        return {
            // Супер прочная леска
            lineBreakDelay: 2.0, // Держится 2 секунды при 100% напряжении
            lineBreakThreshold: 1.0, // Не рвется даже при 100%
            
            // Увеличенное окно подсечки
            biteWindowMultiplier: 2.0, // В 2 раза больше времени на подсечку
            
            // Облегченное вываживание
            tensionReductionBonus: 0.2 // -20% к напряжению лески
        };
    }
    
    // Сохранение в облако через главную систему
    saveToStorage() {
        if (window.game) {
            window.game.saveGameDataDebounced();
        }
    }
    
    // Загрузка из облака через главную систему
    loadFromStorage() {
        // Загрузка теперь происходит через game.loadGameData()
        // Оставляем метод для совместимости, но ничего не делаем
    }
    
    // Сброс туториала (для тестирования)
    reset() {
        this.tutorialCompleted = false;
        this.tutorialFishCount = 0;
        this.currentStep = 0;
        this.firstFishingSession = true;
        this.uiTutorialShown = false;
        this.dataLoaded = false; // Сбрасываем флаг загрузки данных
        this.saveToStorage();
        console.log('🔄 Туториал сброшен');
    }
}

// Глобальный экземпляр системы туториала
window.tutorialSystem = new TutorialSystem();
