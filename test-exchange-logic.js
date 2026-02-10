/**
 * Простой тест логики обмена валют
 * Проверяет основные сценарии работы метода exchangeCurrency()
 */

// Имитация PlaygamaSDKManager для тестирования
class TestPlaygamaSDK {
    constructor() {
        this.sdk = null;
        this.isInitialized = false;
        this.savedData = null;
    }

    async saveData(data) {
        // Имитация сохранения данных
        this.savedData = JSON.parse(JSON.stringify(data));
        console.log('💾 Mock: Data saved');
        return true;
    }

    async exchangeCurrency(premiumAmount, playerData) {
        console.log(`💱 Initiating currency exchange: ${premiumAmount} premium coins`);
        
        // Validate inputs
        if (!premiumAmount || typeof premiumAmount !== 'number' || premiumAmount <= 0) {
            console.error('❌ Invalid premium amount provided');
            return { 
                success: false, 
                error: 'INVALID_AMOUNT' 
            };
        }
        
        if (!playerData || typeof playerData !== 'object') {
            console.error('❌ Invalid player data provided');
            return { 
                success: false, 
                error: 'INVALID_PLAYER_DATA' 
            };
        }
        
        // Check player's premium currency balance
        const playerPremiumBalance = playerData.premiumCoins || 0;
        
        if (playerPremiumBalance < premiumAmount) {
            console.warn(`❌ Insufficient premium currency: has ${playerPremiumBalance}, needs ${premiumAmount}`);
            return { 
                success: false, 
                error: 'INSUFFICIENT_PREMIUM_CURRENCY',
                required: premiumAmount,
                current: playerPremiumBalance
            };
        }
        
        try {
            // Convert at fixed rate 1:12
            const EXCHANGE_RATE = 12;
            const regularAmount = premiumAmount * EXCHANGE_RATE;
            
            console.log(`💱 Exchange rate: 1:${EXCHANGE_RATE}`);
            console.log(`💱 Converting ${premiumAmount} premium -> ${regularAmount} regular coins`);
            
            // Deduct premium currency
            playerData.premiumCoins -= premiumAmount;
            console.log(`💎 Deducted ${premiumAmount} premium coins, new balance: ${playerData.premiumCoins}`);
            
            // Add regular currency
            playerData.coins = (playerData.coins || 0) + regularAmount;
            console.log(`🪙 Added ${regularAmount} regular coins, new balance: ${playerData.coins}`);
            
            // Save data
            const saveSuccess = await this.saveData(playerData);
            
            if (!saveSuccess) {
                console.warn('⚠️ Failed to save data after currency exchange');
                // Rollback the exchange
                playerData.premiumCoins += premiumAmount;
                playerData.coins -= regularAmount;
                console.log(`🔄 Rolled back currency exchange`);
                
                return {
                    success: false,
                    error: 'SAVE_FAILED'
                };
            }
            
            console.log(`✅ Currency exchange successful`);
            console.log(`💰 New balances - Premium: ${playerData.premiumCoins}, Regular: ${playerData.coins}`);
            
            return {
                success: true,
                exchanged: {
                    premium: premiumAmount,
                    regular: regularAmount,
                    rate: EXCHANGE_RATE
                },
                newBalances: {
                    premiumCoins: playerData.premiumCoins,
                    regularCoins: playerData.coins
                }
            };
            
        } catch (error) {
            console.error('❌ Failed to process currency exchange:', error);
            
            return {
                success: false,
                error: 'EXCHANGE_FAILED',
                message: error.message
            };
        }
    }
}

// Тестовые функции
async function runTests() {
    console.log('🧪 Запуск тестов обмена валют\n');
    
    let passedTests = 0;
    let totalTests = 0;

    // Тест 1: Успешный обмен
    totalTests++;
    console.log('=== Тест 1: Успешный обмен 10 марок ===');
    const sdk1 = new TestPlaygamaSDK();
    const playerData1 = { coins: 1000, premiumCoins: 100 };
    const result1 = await sdk1.exchangeCurrency(10, playerData1);
    
    if (result1.success && 
        result1.exchanged.premium === 10 && 
        result1.exchanged.regular === 120 &&
        result1.newBalances.premiumCoins === 90 &&
        result1.newBalances.regularCoins === 1120) {
        console.log('✅ Тест 1 ПРОЙДЕН\n');
        passedTests++;
    } else {
        console.error('❌ Тест 1 ПРОВАЛЕН\n');
    }

    // Тест 2: Недостаточно марок
    totalTests++;
    console.log('=== Тест 2: Недостаточно марок ===');
    const sdk2 = new TestPlaygamaSDK();
    const playerData2 = { coins: 1000, premiumCoins: 5 };
    const result2 = await sdk2.exchangeCurrency(10, playerData2);
    
    if (!result2.success && 
        result2.error === 'INSUFFICIENT_PREMIUM_CURRENCY' &&
        result2.required === 10 &&
        result2.current === 5) {
        console.log('✅ Тест 2 ПРОЙДЕН\n');
        passedTests++;
    } else {
        console.error('❌ Тест 2 ПРОВАЛЕН\n');
    }

    // Тест 3: Неверное количество (ноль)
    totalTests++;
    console.log('=== Тест 3: Неверное количество (0) ===');
    const sdk3 = new TestPlaygamaSDK();
    const playerData3 = { coins: 1000, premiumCoins: 100 };
    const result3 = await sdk3.exchangeCurrency(0, playerData3);
    
    if (!result3.success && result3.error === 'INVALID_AMOUNT') {
        console.log('✅ Тест 3 ПРОЙДЕН\n');
        passedTests++;
    } else {
        console.error('❌ Тест 3 ПРОВАЛЕН\n');
    }

    // Тест 4: Неверное количество (отрицательное)
    totalTests++;
    console.log('=== Тест 4: Неверное количество (-10) ===');
    const sdk4 = new TestPlaygamaSDK();
    const playerData4 = { coins: 1000, premiumCoins: 100 };
    const result4 = await sdk4.exchangeCurrency(-10, playerData4);
    
    if (!result4.success && result4.error === 'INVALID_AMOUNT') {
        console.log('✅ Тест 4 ПРОЙДЕН\n');
        passedTests++;
    } else {
        console.error('❌ Тест 4 ПРОВАЛЕН\n');
    }

    // Тест 5: Курс обмена 1:12
    totalTests++;
    console.log('=== Тест 5: Проверка курса обмена 1:12 ===');
    const sdk5 = new TestPlaygamaSDK();
    const playerData5 = { coins: 0, premiumCoins: 50 };
    const result5 = await sdk5.exchangeCurrency(25, playerData5);
    
    if (result5.success && 
        result5.exchanged.rate === 12 &&
        result5.exchanged.regular === 25 * 12 &&
        result5.newBalances.regularCoins === 300) {
        console.log('✅ Тест 5 ПРОЙДЕН\n');
        passedTests++;
    } else {
        console.error('❌ Тест 5 ПРОВАЛЕН\n');
    }

    // Тест 6: Обновление обоих балансов
    totalTests++;
    console.log('=== Тест 6: Обновление обоих балансов ===');
    const sdk6 = new TestPlaygamaSDK();
    const playerData6 = { coins: 500, premiumCoins: 100 };
    const initialPremium = playerData6.premiumCoins;
    const initialRegular = playerData6.coins;
    const exchangeAmount = 20;
    const result6 = await sdk6.exchangeCurrency(exchangeAmount, playerData6);
    
    if (result6.success && 
        result6.newBalances.premiumCoins === initialPremium - exchangeAmount &&
        result6.newBalances.regularCoins === initialRegular + (exchangeAmount * 12)) {
        console.log('✅ Тест 6 ПРОЙДЕН\n');
        passedTests++;
    } else {
        console.error('❌ Тест 6 ПРОВАЛЕН\n');
    }

    // Тест 7: Неверные данные игрока
    totalTests++;
    console.log('=== Тест 7: Неверные данные игрока (null) ===');
    const sdk7 = new TestPlaygamaSDK();
    const result7 = await sdk7.exchangeCurrency(10, null);
    
    if (!result7.success && result7.error === 'INVALID_PLAYER_DATA') {
        console.log('✅ Тест 7 ПРОЙДЕН\n');
        passedTests++;
    } else {
        console.error('❌ Тест 7 ПРОВАЛЕН\n');
    }

    // Итоги
    console.log('='.repeat(50));
    console.log(`📊 Результаты тестирования:`);
    console.log(`✅ Пройдено: ${passedTests}/${totalTests}`);
    console.log(`❌ Провалено: ${totalTests - passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!');
    } else {
        console.error('⚠️ НЕКОТОРЫЕ ТЕСТЫ ПРОВАЛЕНЫ');
    }
}

// Запуск тестов
runTests().catch(error => {
    console.error('❌ Ошибка при выполнении тестов:', error);
});
