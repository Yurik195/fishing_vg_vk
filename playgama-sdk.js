/**
 * Playgama SDK Mock/Stub
 * Minimal implementation for local development and testing
 * 
 * This is a stub implementation that provides the basic Playgama SDK API
 * for development and testing purposes when the official SDK is not available.
 */

(function() {
    'use strict';
    
    console.log('[Playgama SDK Mock] Initializing...');
    
    // Create Playgama SDK object
    window.Playgama = {
        version: '1.0.0-mock',
        
        // Platform information
        platform: {
            type: 'web',
            language: 'ru'
        },
        
        // Initialize SDK
        init: async function() {
            console.log('[Playgama SDK Mock] init() called');
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('[Playgama SDK Mock] Initialized successfully');
                    resolve();
                }, 100);
            });
        },
        
        // Game lifecycle
        gameReady: async function() {
            console.log('[Playgama SDK Mock] gameReady() called');
            return Promise.resolve();
        },
        
        gameplayStart: async function() {
            console.log('[Playgama SDK Mock] gameplayStart() called');
            return Promise.resolve();
        },
        
        gameplayStop: async function() {
            console.log('[Playgama SDK Mock] gameplayStop() called');
            return Promise.resolve();
        },
        
        // Player data
        player: {
            get: function(key) {
                console.log('[Playgama SDK Mock] player.get(' + key + ')');
                const data = localStorage.getItem('playgama_player_' + key);
                return data ? JSON.parse(data) : null;
            },
            
            set: function(key, value) {
                console.log('[Playgama SDK Mock] player.set(' + key + ', ...)', value);
                localStorage.setItem('playgama_player_' + key, JSON.stringify(value));
                return Promise.resolve();
            },
            
            getData: async function() {
                console.log('[Playgama SDK Mock] player.getData()');
                const keys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('playgama_player_')) {
                        keys.push(key.replace('playgama_player_', ''));
                    }
                }
                
                const data = {};
                keys.forEach(key => {
                    const value = localStorage.getItem('playgama_player_' + key);
                    if (value) {
                        try {
                            data[key] = JSON.parse(value);
                        } catch (e) {
                            data[key] = value;
                        }
                    }
                });
                
                return data;
            },
            
            setData: async function(data) {
                console.log('[Playgama SDK Mock] player.setData(...)', data);
                Object.keys(data).forEach(key => {
                    localStorage.setItem('playgama_player_' + key, JSON.stringify(data[key]));
                });
                return Promise.resolve();
            }
        },
        
        // Payments (stub)
        payments: {
            purchase: async function(options) {
                console.log('[Playgama SDK Mock] payments.purchase(...)', options);
                console.warn('[Playgama SDK Mock] Payments not available in mock mode');
                throw new Error('PAYMENTS_NOT_AVAILABLE');
            },
            
            consumePurchase: async function(token) {
                console.log('[Playgama SDK Mock] payments.consumePurchase(' + token + ')');
                return Promise.resolve();
            },
            
            getPurchases: async function() {
                console.log('[Playgama SDK Mock] payments.getPurchases()');
                return [];
            },
            
            getCatalog: async function() {
                console.log('[Playgama SDK Mock] payments.getCatalog()');
                return [];
            }
        },
        
        // Ads (stub)
        ads: {
            showInterstitial: async function() {
                console.log('[Playgama SDK Mock] ads.showInterstitial()');
                console.warn('[Playgama SDK Mock] Ads not available in mock mode');
                return Promise.resolve();
            },
            
            showRewarded: async function() {
                console.log('[Playgama SDK Mock] ads.showRewarded()');
                console.warn('[Playgama SDK Mock] Ads not available in mock mode');
                return Promise.resolve({ success: true });
            }
        },
        
        // Social (stub)
        social: {
            share: async function(options) {
                console.log('[Playgama SDK Mock] social.share(...)', options);
                console.warn('[Playgama SDK Mock] Social features not available in mock mode');
                return Promise.resolve();
            },
            
            invite: async function(options) {
                console.log('[Playgama SDK Mock] social.invite(...)', options);
                console.warn('[Playgama SDK Mock] Social features not available in mock mode');
                return Promise.resolve();
            }
        },
        
        // Leaderboards (stub)
        leaderboards: {
            setScore: async function(leaderboardId, score) {
                console.log('[Playgama SDK Mock] leaderboards.setScore(' + leaderboardId + ', ' + score + ')');
                return Promise.resolve();
            },
            
            getScore: async function(leaderboardId) {
                console.log('[Playgama SDK Mock] leaderboards.getScore(' + leaderboardId + ')');
                return 0;
            },
            
            getEntries: async function(leaderboardId, options) {
                console.log('[Playgama SDK Mock] leaderboards.getEntries(' + leaderboardId + ', ...)', options);
                return [];
            }
        }
    };
    
    console.log('[Playgama SDK Mock] Ready. window.Playgama available.');
    console.log('[Playgama SDK Mock] This is a MOCK implementation for development.');
    console.log('[Playgama SDK Mock] Replace with official SDK for production!');
    
})();
