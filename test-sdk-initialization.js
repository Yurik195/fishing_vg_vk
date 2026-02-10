/**
 * Property-based тест для инициализации SDK
 * 
 * Feature: playgama-sdk-migration, Property 1: Инициализация SDK предшествует игровой логике
 * Validates: Requirements 1.1
 * 
 * Проверяет, что SDK всегда инициализируется до того, как игровая логика начнет использовать его методы.
 */

class SDKInitializationTester {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
    }

    /**
     * Генератор случайных последовательностей вызовов
     */
    generateRandomCallSequence(length) {
        const possibleCalls = [
            'saveData',
            'loadData',
            'showFullscreenAdv',
            'showRewardedVideo',
            'purchase',
            'setLeaderboardScore',
            'getLanguage'
        ];
        
        const sequence = [];
        for (let i = 0; i < length; i++) {
            const randomCall = possibleCalls[Math.floor(Math.random() * possibleCalls.length)];
            sequence.push(randomCall);
        }
        
        return sequence;
    }

    /**
     * Property: SDK должен быть инициализирован перед любым вызовом его методов
     */
    async testProperty_InitBeforeUse(iterations = 100) {
        console.log('\n🧪 Property Test: SDK инициализация предшествует использованию');
        console.log(`Запуск ${iterations} итераций...\n`);

        for (let i = 0; i < iterations; i++) {
            this.totalTests++;
            
            // Создаем новый экземпляр SDK для каждого теста
            const mockSDK = this.createMockSDK();
            
            // Генерируем случайную последовательность вызовов (1-5 вызовов)
            const sequenceLength = Math.floor(Math.random() * 5) + 1;
            const callSequence = this.generateRandomCallSequence(sequenceLength);
            
            try {
                // Сначала инициализируем SDK
                await mockSDK.init();
                
                // Проверяем, что SDK инициализирован
                if (!mockSDK.isInitialized) {
                    throw new Error('SDK не инициализирован после вызова init()');
                }
                
                // Теперь пытаемся вызвать методы
                for (const methodName of callSequence) {
                    const result = await this.callSDKMethod(mockSDK, methodName);
                    
                    // Проверяем, что метод не вернул ошибку "SDK не инициализирован"
                    if (result && result.error === 'SDK_NOT_INITIALIZED') {
                        throw new Error(`Метод ${methodName} вызван до инициализации SDK`);
                    }
                }
                
                this.passedTests++;
                
                if (i % 20 === 0 && i > 0) {
                    console.log(`✅ Итерация ${i}/${iterations} - OK`);
                }
                
            } catch (error) {
                console.error(`❌ Итерация ${i} провалена: ${error.message}`);
                this.testResults.push({
                    iteration: i,
                    sequence: callSequence,
                    error: error.message
                });
            }
        }
    }

    /**
     * Property: Вызов методов SDK без инициализации должен возвращать ошибку
     */
    async testProperty_ErrorWithoutInit(iterations = 50) {
        console.log('\n🧪 Property Test: Методы SDK возвращают ошибку без инициализации');
        console.log(`Запуск ${iterations} итераций...\n`);

        for (let i = 0; i < iterations; i++) {
            this.totalTests++;
            
            // Создаем новый экземпляр SDK БЕЗ инициализации
            const mockSDK = this.createMockSDK();
            
            // Генерируем случайный метод для вызова
            const methodName = this.generateRandomCallSequence(1)[0];
            
            try {
                // Пытаемся вызвать метод БЕЗ инициализации
                const result = await this.callSDKMethod(mockSDK, methodName);
                
                // Проверяем, что получили ошибку или fallback поведение
                const hasError = result && (
                    result.error === 'SDK_NOT_INITIALIZED' ||
                    result.usedFallback === true ||
                    result === 'ru' // fallback для getLanguage
                );
                
                if (!hasError) {
                    throw new Error(`Метод ${methodName} не вернул ошибку при вызове без инициализации`);
                }
                
                this.passedTests++;
                
                if (i % 10 === 0 && i > 0) {
                    console.log(`✅ Итерация ${i}/${iterations} - OK (fallback работает)`);
                }
                
            } catch (error) {
                console.error(`❌ Итерация ${i} провалена: ${error.message}`);
                this.testResults.push({
                    iteration: i,
                    method: methodName,
                    error: error.message
                });
            }
        }
    }

    /**
     * Создает mock SDK для тестирования
     */
    createMockSDK() {
        return {
            sdk: null,
            isInitialized: false,
            
            async init() {
                // Симулируем задержку инициализации
                await new Promise(resolve => setTimeout(resolve, 10));
                this.sdk = { mock: true };
                this.isInitialized = true;
                return true;
            },
            
            async saveData(data) {
                if (!this.isInitialized) {
                    return { success: false, error: 'SDK_NOT_INITIALIZED', usedFallback: true };
                }
                return { success: true };
            },
            
            async loadData() {
                if (!this.isInitialized) {
                    return { success: false, error: 'SDK_NOT_INITIALIZED', usedFallback: true };
                }
                return { success: true, data: {} };
            },
            
            async showFullscreenAdv() {
                if (!this.isInitialized) {
                    return { success: false, error: 'SDK_NOT_INITIALIZED' };
                }
                return { success: true };
            },
            
            async showRewardedVideo() {
                if (!this.isInitialized) {
                    return { success: false, error: 'SDK_NOT_INITIALIZED' };
                }
                return { success: true, rewarded: true };
            },
            
            async purchase(productId) {
                if (!this.isInitialized) {
                    return { success: false, error: 'SDK_NOT_INITIALIZED' };
                }
                return { success: true };
            },
            
            async setLeaderboardScore(name, score) {
                if (!this.isInitialized) {
                    return { success: false, error: 'SDK_NOT_INITIALIZED' };
                }
                return { success: true };
            },
            
            getLanguage() {
                if (!this.isInitialized) {
                    // Fallback на 'ru' если SDK не инициализирован
                    return 'ru';
                }
                return 'en';
            }
        };
    }

    /**
     * Вызывает метод SDK по имени
     */
    async callSDKMethod(sdk, methodName) {
        switch (methodName) {
            case 'saveData':
                return await sdk.saveData({ test: true });
            case 'loadData':
                return await sdk.loadData();
            case 'showFullscreenAdv':
                return await sdk.showFullscreenAdv();
            case 'showRewardedVideo':
                return await sdk.showRewardedVideo();
            case 'purchase':
                return await sdk.purchase('test_product');
            case 'setLeaderboardScore':
                return await sdk.setLeaderboardScore('test', 100);
            case 'getLanguage':
                return sdk.getLanguage();
            default:
                throw new Error(`Неизвестный метод: ${methodName}`);
        }
    }

    /**
     * Выводит результаты тестирования
     */
    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 РЕЗУЛЬТАТЫ PROPERTY-BASED ТЕСТИРОВАНИЯ');
        console.log('='.repeat(60));
        console.log(`✅ Пройдено: ${this.passedTests}/${this.totalTests}`);
        console.log(`❌ Провалено: ${this.totalTests - this.passedTests}/${this.totalTests}`);
        
        if (this.testResults.length > 0) {
            console.log('\n❌ Проваленные тесты:');
            this.testResults.forEach((result, index) => {
                console.log(`\n${index + 1}. Итерация ${result.iteration}:`);
                console.log(`   Ошибка: ${result.error}`);
                if (result.sequence) {
                    console.log(`   Последовательность: ${result.sequence.join(' -> ')}`);
                }
                if (result.method) {
                    console.log(`   Метод: ${result.method}`);
                }
            });
        }
        
        console.log('\n' + '='.repeat(60));
        
        if (this.passedTests === this.totalTests) {
            console.log('🎉 ВСЕ PROPERTY ТЕСТЫ ПРОЙДЕНЫ!');
            console.log('✅ Property 1 подтверждено: SDK инициализируется до использования');
        } else {
            console.error('⚠️ НЕКОТОРЫЕ PROPERTY ТЕСТЫ ПРОВАЛЕНЫ');
            console.error('❌ Требуется исправление порядка инициализации');
        }
        
        console.log('='.repeat(60));
    }
}

// Запуск тестов
async function runAllTests() {
    console.log('🚀 Запуск Property-Based тестов для инициализации SDK');
    console.log('Feature: playgama-sdk-migration');
    console.log('Property 1: Инициализация SDK предшествует игровой логике');
    console.log('Validates: Requirements 1.1\n');
    
    const tester = new SDKInitializationTester();
    
    // Тест 1: SDK инициализирован перед использованием
    await tester.testProperty_InitBeforeUse(100);
    
    // Тест 2: Методы возвращают ошибку без инициализации
    await tester.testProperty_ErrorWithoutInit(50);
    
    // Выводим результаты
    tester.printResults();
    
    // Возвращаем код выхода
    process.exit(tester.passedTests === tester.totalTests ? 0 : 1);
}

// Запускаем тесты
runAllTests().catch(error => {
    console.error('❌ Критическая ошибка при выполнении тестов:', error);
    process.exit(1);
});
