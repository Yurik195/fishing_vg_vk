// -*- coding: utf-8 -*-
// Система рейтинга игроков
class RatingSystem {
    constructor() {
        this.mockPlayers = this.generateMockPlayers();
        
        // Настройки лидербордов Яндекс
        this.leaderboardNames = {
            level: 'Level',  // Технические названия из консоли Яндекс
            weight: 'Weight',
            totalFish: 'TotalFish',
            coins: 'Coins',
            fails: 'Fails'
        };
        
        // Кэш для реальных данных лидерборда
        this.realLeaderboardData = {};
        this.isLoadingLeaderboard = {};
    }
    
    // Генерация заглушки - 100 топовых игроков с разными параметрами
    generateMockPlayers() {
        const names = [
            'Рыбак-Профи', 'Морской Волк', 'Капитан Крюк', 'Удачливый', 'Мастер Спиннинга',
            'Король Озер', 'Речной Охотник', 'Щукарь', 'Карпятник', 'Сомятник',
            'Окунёвый Бог', 'Судачник', 'Жерешник', 'Налимыч', 'Форелевод',
            'Лещатник', 'Плотвяк', 'Язевик', 'Голавлятник', 'Хариусник'
        ];
        
        const suffixes = ['2000', 'Pro', 'Master', 'Legend', 'King', 'Boss', '777', 'Top', 'Best', 'Super'];
        
        const players = [];
        
        // Генерируем 100 игроков с разными параметрами
        for (let i = 0; i < 100; i++) {
            const baseName = names[Math.floor(Math.random() * names.length)];
            const suffix = Math.random() > 0.5 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
            const name = suffix ? `${baseName}_${suffix}` : baseName;
            
            players.push({
                id: `player_${i + 1}`,
                name: name,
                level: 100 - Math.floor(i * 0.8), // Уровни от 100 до 20
                maxWeight: (100 - i) * 10 + Math.random() * 50, // Вес от 1000 до 50 кг
                totalFish: 10000 - i * 80 + Math.floor(Math.random() * 100), // Рыб от 10000 до 2000
                coins: 1000000 - i * 9000 + Math.floor(Math.random() * 5000), // Монет от 1млн до 100к
                fishEscaped: 5000 - i * 40 + Math.floor(Math.random() * 50) // Срывов от 5000 до 1000
            });
        }
        
        return players;
    }
    
    /**
     * Обновить счет игрока в лидерборде
     * @param {string} type - Тип рейтинга (level, weight, totalFish, coins, fails)
     * @param {number} score - Счет игрока
     */
    async updateLeaderboardScore(type, score) {
        const leaderboardName = this.leaderboardNames[type];
        if (!leaderboardName) {
            console.warn(`Unknown leaderboard type: ${type}`);
            return false;
        }
        
        // Проверяем доступность SDK
        if (!window.playgamaSDK || !window.playgamaSDK.isInitialized) {
            return false;
        }
        
        return await window.playgamaSDK.setLeaderboardScore(leaderboardName, score);
    }
    
    /**
     * Загрузить данные лидерборда с Яндекс
     * @param {string} type - Тип рейтинга
     * @returns {Promise<Object|null>} - Данные лидерборда или null
     */
    async loadRealLeaderboard(type) {
        const leaderboardName = this.leaderboardNames[type];
        if (!leaderboardName) {
            console.warn(`Unknown leaderboard type: ${type}`);
            return null;
        }
        
        // Проверяем, не загружаем ли уже
        if (this.isLoadingLeaderboard[type]) {
            console.log(`🏆 Already loading leaderboard ${type}`);
            return this.realLeaderboardData[type] || null;
        }
        
        // Проверяем доступность SDK и авторизацию игрока
        if (!window.playgamaSDK || !window.playgamaSDK.isInitialized) {
            return null;
        }
        
        if (!window.playgamaSDK.isPlayerReady) {
            return null;
        }
        
        try {
            this.isLoadingLeaderboard[type] = true;
            
            // Загружаем топ-20 и данные вокруг игрока
            const data = await window.playgamaSDK.getLeaderboardEntries(leaderboardName, {
                quantityTop: 20,
                includeUser: true,
                quantityAround: 3
            });
            
            if (data) {
                this.realLeaderboardData[type] = data;
            }
            
            return data;
        } catch (error) {
            console.error(`🏆 Failed to load leaderboard ${type}:`, error);
            return null;
        } finally {
            this.isLoadingLeaderboard[type] = false;
        }
    }
    
    /**
     * Получить позицию игрока в лидерборде
     * @param {string} type - Тип рейтинга
     * @returns {Promise<Object|null>} - Данные игрока или null
     */
    async getPlayerRankFromLeaderboard(type) {
        const leaderboardName = this.leaderboardNames[type];
        if (!leaderboardName) {
            return null;
        }
        
        if (!window.playgamaSDK || !window.playgamaSDK.isInitialized) {
            return null;
        }
        
        try {
            return await window.playgamaSDK.getPlayerLeaderboardEntry(leaderboardName);
        } catch (error) {
            console.error(`🏆 Failed to get player rank for ${type}:`, error);
            return null;
        }
    }
    
    // Получить рейтинг по типу (с поддержкой реальных данных)
    async getRatingList(type, playerStats) {
        // Пытаемся загрузить реальные данные
        const realData = await this.loadRealLeaderboard(type);
        
        if (realData && realData.entries && realData.entries.length > 0) {
            // Используем ТОЛЬКО реальные данные из Яндекс лидерборда
            return this.formatRealLeaderboardData(realData, type, playerStats);
        }
        
        // Если нет реальных данных, показываем хотя бы текущего игрока
        console.log('🏆 No real leaderboard data available, showing player only');
        return this.getPlayerOnlyList(type, playerStats);
    }
    
    /**
     * Создать список только с текущим игроком (когда нет данных лидерборда)
     */
    getPlayerOnlyList(type, playerStats) {
        let playerValue = 0;
        
        switch (type) {
            case 'level':
                playerValue = playerStats.level;
                break;
            case 'weight':
                // Вес хранится в граммах (умножен на 100), конвертируем обратно в кг
                playerValue = playerStats.heaviestFish ? Math.floor(playerStats.heaviestFish.weight * 100) : 0;
                break;
            case 'totalFish':
                playerValue = playerStats.totalFishCaught || 0;
                break;
            case 'coins':
                playerValue = playerStats.totalCoinEarned || 0;
                break;
            case 'fails':
                playerValue = playerStats.fishEscaped || 0;
                break;
        }
        
        return [{
            id: 'current_player',
            name: L('you', 'Вы'),
            value: playerValue,
            rank: '?',
            isCurrentPlayer: true
        }];
    }
    
    /**
     * Форматировать реальные данные лидерборда для отображения
     */
    formatRealLeaderboardData(data, type, playerStats) {
        const result = [];
        const currentPlayerUniqueID = window.playgamaSDK?.player?.getUniqueID?.();
        
        // Обрабатываем записи
        if (data.entries && data.entries.length > 0) {
            data.entries.forEach((entry, index) => {
                const isCurrentPlayer = currentPlayerUniqueID && entry.player.uniqueID === currentPlayerUniqueID;
                
                result.push({
                    id: entry.player.uniqueID,
                    name: isCurrentPlayer ? L('you', 'Вы') : (entry.player.publicName || L('player', 'Игрок')),
                    rank: entry.rank,
                    value: entry.score,
                    isCurrentPlayer: isCurrentPlayer,
                    avatar: entry.player.getAvatarSrc ? entry.player.getAvatarSrc('small') : null,
                    formattedScore: entry.formattedScore
                });
            });
        }
        
        // Если игрок не в списке, но есть его ранг
        if (data.userRank > 0) {
            const playerInList = result.some(p => p.isCurrentPlayer);
            
            if (!playerInList) {
                // Добавляем разделитель только если есть другие записи
                if (result.length > 0) {
                    result.push({
                        id: 'separator',
                        name: '...',
                        value: 0,
                        rank: '...',
                        isSeparator: true
                    });
                }
                
                // Добавляем текущего игрока
                let playerValue = 0;
                switch (type) {
                    case 'level':
                        playerValue = playerStats.level;
                        break;
                    case 'weight':
                        // Вес хранится в граммах (умножен на 100), конвертируем обратно в кг
                        playerValue = playerStats.heaviestFish ? Math.floor(playerStats.heaviestFish.weight * 100) : 0;
                        break;
                    case 'totalFish':
                        playerValue = playerStats.totalFishCaught || 0;
                        break;
                    case 'coins':
                        playerValue = playerStats.totalCoinEarned || 0;
                        break;
                    case 'fails':
                        playerValue = playerStats.fishEscaped || 0;
                        break;
                }
                
                result.push({
                    id: 'current_player',
                    name: L('you', 'Вы'),
                    value: playerValue,
                    rank: data.userRank,
                    isCurrentPlayer: true
                });
            }
        }
        
        return result;
    }
    
    // Получить рейтинг по типу (mock данные - fallback)
    getMockRatingList(type, playerStats) {
        let sortedPlayers = [...this.mockPlayers];
        let playerValue = 0;
        let valueKey = '';
        let minTopValue = 0;
        
        // Сортируем в зависимости от типа рейтинга
        switch (type) {
            case 'level':
                sortedPlayers.sort((a, b) => b.level - a.level);
                playerValue = playerStats.level;
                valueKey = 'level';
                minTopValue = sortedPlayers[99].level;
                break;
            case 'weight':
                sortedPlayers.sort((a, b) => b.maxWeight - a.maxWeight);
                // Вес хранится в граммах (умножен на 100)
                playerValue = playerStats.heaviestFish ? Math.floor(playerStats.heaviestFish.weight * 100) : 0;
                valueKey = 'maxWeight';
                minTopValue = sortedPlayers[99].maxWeight;
                break;
            case 'totalFish':
                sortedPlayers.sort((a, b) => b.totalFish - a.totalFish);
                playerValue = playerStats.totalFishCaught || 0;
                valueKey = 'totalFish';
                minTopValue = sortedPlayers[99].totalFish;
                break;
            case 'coins':
                sortedPlayers.sort((a, b) => b.coins - a.coins);
                playerValue = playerStats.totalCoinEarned || 0;
                valueKey = 'coins';
                minTopValue = sortedPlayers[99].coins;
                break;
            case 'fails':
                sortedPlayers.sort((a, b) => b.fishEscaped - a.fishEscaped);
                playerValue = playerStats.fishEscaped || 0;
                valueKey = 'fishEscaped';
                minTopValue = sortedPlayers[99].fishEscaped;
                break;
        }
        
        const result = [];
        
        // Добавляем топ-100 с рангами
        sortedPlayers.forEach((player, index) => {
            result.push({
                ...player,
                rank: index + 1,
                value: player[valueKey]
            });
        });
        
        // Проверяем, попадает ли игрок в топ-100
        const playerInTop100 = playerValue >= minTopValue;
        
        if (!playerInTop100) {
            // Добавляем разделитель
            result.push({
                id: 'separator',
                name: '...',
                value: 0,
                rank: '...',
                isSeparator: true
            });
            
            // Добавляем текущего игрока
            result.push({
                id: 'current_player',
                name: L('you', 'Вы'),
                value: playerValue,
                rank: '100+',
                isCurrentPlayer: true
            });
        } else {
            // Находим позицию игрока в топ-100 и помечаем его
            for (let i = 0; i < result.length; i++) {
                if (result[i].value <= playerValue) {
                    result[i].isCurrentPlayer = true;
                    result[i].name = L('you', 'Вы');
                    result[i].value = playerValue;
                    break;
                }
            }
        }
        
        return result;
    }
    
    // Получить позицию игрока по типу рейтинга (с поддержкой реальных данных)
    async getPlayerRank(type, playerStats) {
        // Пытаемся получить реальный ранг
        const realEntry = await this.getPlayerRankFromLeaderboard(type);
        if (realEntry && realEntry.rank) {
            return realEntry.rank;
        }
        
        // Если нет реального ранга, возвращаем '?'
        console.log('🏆 No real player rank available');
        return '?';
    }
    
    // Получить позицию игрока по типу рейтинга (mock данные - fallback)
    getMockPlayerRank(type, playerStats) {
        let sortedPlayers = [...this.mockPlayers];
        let playerValue = 0;
        
        switch (type) {
            case 'level':
                sortedPlayers.sort((a, b) => b.level - a.level);
                playerValue = playerStats.level;
                break;
            case 'weight':
                sortedPlayers.sort((a, b) => b.maxWeight - a.maxWeight);
                // Вес хранится в граммах (умножен на 100)
                playerValue = playerStats.heaviestFish ? Math.floor(playerStats.heaviestFish.weight * 100) : 0;
                break;
            case 'totalFish':
                sortedPlayers.sort((a, b) => b.totalFish - a.totalFish);
                playerValue = playerStats.totalFishCaught || 0;
                break;
            case 'coins':
                sortedPlayers.sort((a, b) => b.coins - a.coins);
                playerValue = playerStats.totalCoinEarned || 0;
                break;
            case 'fails':
                sortedPlayers.sort((a, b) => b.fishEscaped - a.fishEscaped);
                playerValue = playerStats.fishEscaped || 0;
                break;
        }
        
        for (let i = 0; i < sortedPlayers.length; i++) {
            const compareValue = type === 'level' ? sortedPlayers[i].level :
                                type === 'weight' ? sortedPlayers[i].maxWeight :
                                type === 'totalFish' ? sortedPlayers[i].totalFish :
                                type === 'coins' ? sortedPlayers[i].coins :
                                sortedPlayers[i].fishEscaped;
            
            if (playerValue >= compareValue) {
                return i + 1;
            }
        }
        return '100+';
    }
}
