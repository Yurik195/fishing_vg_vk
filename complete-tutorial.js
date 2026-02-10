// Функция для завершения туториала
function completeTutorial() {
    console.log('=== ЗАВЕРШЕНИЕ ТУТОРИАЛА ===');
    
    if (window.tutorialSystem) {
        console.log('Текущее состояние туториала:', {
            tutorialCompleted: window.tutorialSystem.tutorialCompleted,
            tutorialFishCount: window.tutorialSystem.tutorialFishCount,
            currentStep: window.tutorialSystem.getCurrentStep(),
            dataLoaded: window.tutorialSystem.dataLoaded
        });
        
        // Завершаем туториал
        window.tutorialSystem.completeTutorial();
        
        console.log('✅ Туториал завершен!');
        console.log('Новое состояние:', {
            tutorialCompleted: window.tutorialSystem.tutorialCompleted,
            tutorialFishCount: window.tutorialSystem.tutorialFishCount,
            currentStep: window.tutorialSystem.getCurrentStep(),
            dataLoaded: window.tutorialSystem.dataLoaded
        });
        
        // Сохраняем изменения
        if (window.game && window.game.saveGameDataDebounced) {
            window.game.saveGameDataDebounced();
            console.log('✅ Данные сохранены');
        }
        
        // Если мы на экране рыбалки, перезапускаем состояние IDLE
        if (window.game && window.game.currentScreen === 'fishing') {
            console.log('Перезапускаем состояние IDLE...');
            setTimeout(() => {
                if (window.game.fishingGame && window.game.fishingGame.stateMachine) {
                    window.game.fishingGame.stateMachine.transition('IDLE');
                }
            }, 500);
        }
        
    } else {
        console.log('❌ window.tutorialSystem не найдена');
    }
}

// Добавляем функцию в глобальную область
window.completeTutorial = completeTutorial;

console.log('Функция completeTutorial() добавлена. Вызовите completeTutorial() для завершения туториала.');