// -*- coding: utf-8 -*-
// Русские переводы для игры
// Этот файл содержит переводы английских технических терминов на русский язык

const RU_TRANSLATIONS = {
    // Редкость рыб (переводы английских значений)
    'rarity_Common': 'Обычная',
    'rarity_Uncommon': 'Необычная',
    'rarity_Rare': 'Редкая',
    'rarity_Epic': 'Эпическая',
    'rarity_Legendary': 'Легендарная',
    
    // Редкость рыб (нижний регистр для совместимости)
    'rarity_common': 'Обычная',
    'rarity_uncommon': 'Необычная',
    'rarity_rare': 'Редкая',
    'rarity_epic': 'Эпическая',
    'rarity_legendary': 'Легендарная',
    
    // Коллекция (модальное окно с описанием рыб)
    'collection_time': 'Время:',
    'collection_xp': 'Опыт:',
    
    // Садок (модальное окно с описанием рыбы в рыбалке)
    'experience': 'Опыт',
    'time': 'Время',
    
    // Рыбалка - сообщения
    'miss': 'Промах!',
    'ui_miss': 'Промах!',
};

// Экспортируем для использования в LocalizationSystem
if (typeof window !== 'undefined') {
    window.RU_TRANSLATIONS = RU_TRANSLATIONS;
}
