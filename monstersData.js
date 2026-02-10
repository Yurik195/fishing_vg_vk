// -*- coding: utf-8 -*-
// База данных монстров (20 видов)
// Редкие и опасные существа, которые можно поймать с шансом 1%
// Доступны начиная с зоны 5
// Вес ограничен снастями: максимум 220 кг
// ЛОГИКА: Пресноводные монстры (зоны 5-7, 12-15) и морские монстры (зоны 8-11, 16-20)

const MONSTERS_DATABASE = [
  // ========== ПРЕСНОВОДНЫЕ МОНСТРЫ (Зоны 5-7: Европа/Сибирь) ==========
  {
    id: 1,
    name: "Карп-мутант",
    zones: [5],
    baseChance: 0.35,
    chanceModifier: { 5: 1.0 },
    weightMin: 3.0,
    weightMax: 6.0,
    power: 40,
    biteStyle: "Яростный рывок",
    timeOfDay: "Ночь",
    preferredBaitId: 11,
    minGearTier: 6,
    sellPrice: 3500,
    xp: 700,
    sprite: "m1.png",
    emoji: "🐲",
    description: "Мутировавший карп огромных размеров. Агрессивен и невероятно силён. Обитает в карповых озёрах Европы."
  },
  {
    id: 2,
    name: "Сом-людоед",
    zones: [6, 7],
    baseChance: 0.30,
    chanceModifier: { 6: 1.4, 7: 1.2 },
    weightMin: 18.0,
    weightMax: 28.0,
    power: 50,
    biteStyle: "Затягивание на дно",
    timeOfDay: "Ночь",
    preferredBaitId: 11,
    minGearTier: 7,
    sellPrice: 5000,
    xp: 1000,
    sprite: "m2.png",
    emoji: "😈",
    description: "Легендарный сом, по слухам пожиравший людей. Обитает в глубоких ямах Байкала и дельты."
  },
  {
    id: 3,
    name: "Щука-призрак",
    zones: [7],
    baseChance: 0.28,
    chanceModifier: { 7: 1.0 },
    weightMin: 12.0,
    weightMax: 22.0,
    power: 55,
    biteStyle: "Молниеносная атака",
    timeOfDay: "Туман",
    preferredBaitId: 7,
    minGearTier: 7,
    sellPrice: 6500,
    xp: 1300,
    sprite: "m3.png",
    emoji: "👻",
    description: "Призрачная щука, появляющаяся в туманные дни. Атакует с невероятной скоростью в дельте рек."
  },
  
  // ========== МОРСКИЕ МОНСТРЫ (Зоны 8-11: Тропики/Средиземноморье/Карибы) ==========
  {
    id: 4,
    name: "Угорь-электрошок",
    zones: [8],
    baseChance: 0.25,
    chanceModifier: { 8: 1.0 },
    weightMin: 20.0,
    weightMax: 35.0,
    power: 60,
    biteStyle: "Электрический разряд",
    timeOfDay: "Ночь",
    preferredBaitId: 11,
    minGearTier: 8,
    sellPrice: 8000,
    xp: 1600,
    sprite: "m4.png",
    emoji: "⚡",
    description: "Гигантский морской угорь, способный генерировать мощные электрические разряды. Обитает в мангровых зарослях."
  },
  {
    id: 5,
    name: "Барракуда-титан",
    zones: [8, 9],
    baseChance: 0.22,
    chanceModifier: { 8: 1.2, 9: 1.1 },
    weightMin: 25.0,
    weightMax: 45.0,
    power: 65,
    biteStyle: "Молниеносная атака",
    timeOfDay: "День",
    preferredBaitId: 10,
    minGearTier: 9,
    sellPrice: 10000,
    xp: 2000,
    sprite: "m5.png",
    emoji: "🐉",
    description: "Гигантская барракуда с невероятной скоростью. Атакует молниеносно в тропических водах."
  },
  {
    id: 6,
    name: "Групер-гигант",
    zones: [9, 10],
    baseChance: 0.20,
    chanceModifier: { 9: 1.2, 10: 1.0 },
    weightMin: 40.0,
    weightMax: 80.0,
    power: 70,
    biteStyle: "Донная тяжесть",
    timeOfDay: "Ночь",
    preferredBaitId: 11,
    minGearTier: 10,
    sellPrice: 15000,
    xp: 3000,
    sprite: "m6.png",
    emoji: "👑",
    description: "Гигантский рифовый групер. Обитает в глубоких расщелинах кораллов, невероятно силён."
  },
  {
    id: 7,
    name: "Скат-манта мутант",
    zones: [10, 11],
    baseChance: 0.18,
    chanceModifier: { 10: 1.2, 11: 1.0 },
    weightMin: 90.0,
    weightMax: 150.0,
    power: 75,
    biteStyle: "Донная тяжесть",
    timeOfDay: "Вечер",
    preferredBaitId: 11,
    minGearTier: 11,
    sellPrice: 22000,
    xp: 4400,
    sprite: "m7.png",
    emoji: "🤍",
    description: "Гигантский скат-манта с аномальными размерами. Обитает в Средиземном море и Карибах."
  },
  
  // ========== ПРЕСНОВОДНЫЕ МОНСТРЫ (Зоны 12-15: Болота/Амазонка/Африка) ==========
  {
    id: 8,
    name: "Аллигатор-щука",
    zones: [12],
    baseChance: 0.16,
    chanceModifier: { 12: 1.0 },
    weightMin: 35.0,
    weightMax: 65.0,
    power: 75,
    biteStyle: "Яростный рывок",
    timeOfDay: "Ночь",
    preferredBaitId: 11,
    minGearTier: 11,
    sellPrice: 18000,
    xp: 3600,
    sprite: "m8.png",
    emoji: "😈",
    description: "Древняя рыба с зубами аллигатора. Обитает в болотах и старицах, невероятно агрессивна."
  },
  {
    id: 9,
    name: "Арапайма-титан",
    zones: [13],
    baseChance: 0.15,
    chanceModifier: { 13: 1.0 },
    weightMin: 100.0,
    weightMax: 160.0,
    power: 80,
    biteStyle: "Трофейный рывок",
    timeOfDay: "Вечер",
    preferredBaitId: 11,
    minGearTier: 12,
    sellPrice: 28000,
    xp: 5600,
    sprite: "m9.png",
    emoji: "🐊",
    description: "Древняя арапайма невероятных размеров. Живое ископаемое Амазонки, способна дышать воздухом."
  },
  {
    id: 10,
    name: "Пиранья-королева",
    zones: [13],
    baseChance: 0.14,
    chanceModifier: { 13: 1.0 },
    weightMin: 8.0,
    weightMax: 15.0,
    power: 70,
    biteStyle: "Бешеная атака",
    timeOfDay: "День",
    preferredBaitId: 11,
    minGearTier: 12,
    sellPrice: 20000,
    xp: 4000,
    sprite: "m10.png",
    emoji: "💪",
    description: "Матка стаи пираний Амазонки. Агрессивна и смертельно опасна, атакует молниеносно."
  },
  {
    id: 11,
    name: "Нильский дракон",
    zones: [14],
    baseChance: 0.12,
    chanceModifier: { 14: 1.0 },
    weightMin: 120.0,
    weightMax: 180.0,
    power: 85,
    biteStyle: "Яростный рывок",
    timeOfDay: "Вечер",
    preferredBaitId: 11,
    minGearTier: 13,
    sellPrice: 35000,
    xp: 7000,
    sprite: "m11.png",
    emoji: "👻",
    description: "Гигантский нильский окунь, прозванный драконом. Обитает в озере Виктория, способен проглотить человека."
  },
  {
    id: 12,
    name: "Голиаф-демон",
    zones: [15],
    baseChance: 0.11,
    chanceModifier: { 15: 1.0 },
    weightMin: 60.0,
    weightMax: 95.0,
    power: 85,
    biteStyle: "Трофейный рывок",
    timeOfDay: "День",
    preferredBaitId: 11,
    minGearTier: 13,
    sellPrice: 32000,
    xp: 6400,
    sprite: "m12.png",
    emoji: "⚔️",
    description: "Легендарный голиаф-тигр с зубами как у демона. Самый опасный хищник реки Конго."
  },
  
  // ========== МОРСКИЕ МОНСТРЫ (Зоны 16-20: Океан) ==========
  {
    id: 13,
    name: "Тунец-берсерк",
    zones: [16, 17, 18],
    baseChance: 0.10,
    chanceModifier: { 16: 1.2, 17: 1.1, 18: 0.9 },
    weightMin: 120.0,
    weightMax: 180.0,
    power: 90,
    biteStyle: "Трофейный рывок",
    timeOfDay: "День",
    preferredBaitId: 13,
    minGearTier: 14,
    sellPrice: 42000,
    xp: 8400,
    sprite: "m13.png",
    emoji: "🦈",
    description: "Огромный тунец с невероятной силой. Способен тащить лодку часами в открытом океане."
  },
  {
    id: 14,
    name: "Марлин-призрак",
    zones: [17, 18],
    baseChance: 0.09,
    chanceModifier: { 17: 1.2, 18: 1.0 },
    weightMin: 140.0,
    weightMax: 200.0,
    power: 92,
    biteStyle: "Молниеносная атака",
    timeOfDay: "Ночь",
    preferredBaitId: 14,
    minGearTier: 15,
    sellPrice: 55000,
    xp: 11000,
    sprite: "m14.png",
    emoji: "🐙",
    description: "Легендарный белый марлин, которого никто не может поймать. Призрак океана."
  },
  {
    id: 15,
    name: "Меч-рыба титан",
    zones: [18, 19],
    baseChance: 0.08,
    chanceModifier: { 18: 1.1, 19: 1.0 },
    weightMin: 130.0,
    weightMax: 190.0,
    power: 93,
    biteStyle: "Трофейный рывок",
    timeOfDay: "Ночь",
    preferredBaitId: 14,
    minGearTier: 16,
    sellPrice: 50000,
    xp: 10000,
    sprite: "m15.png",
    emoji: "🦈",
    description: "Гигантская меч-рыба с клинком длиной в человеческий рост. Пробивает лодки."
  },
  {
    id: 16,
    name: "Акула-людоед",
    zones: [19, 20],
    baseChance: 0.07,
    chanceModifier: { 19: 1.1, 20: 1.0 },
    weightMin: 150.0,
    weightMax: 210.0,
    power: 95,
    biteStyle: "Яростный рывок",
    timeOfDay: "Ночь",
    preferredBaitId: 14,
    minGearTier: 17,
    sellPrice: 65000,
    xp: 13000,
    sprite: "m16.png",
    emoji: "🐋",
    description: "Белая акула-людоед. Самый опасный хищник океана с кровавой репутацией."
  },
  {
    id: 17,
    name: "Акула-молот альфа",
    zones: [19, 20],
    baseChance: 0.06,
    chanceModifier: { 19: 1.1, 20: 1.0 },
    weightMin: 140.0,
    weightMax: 200.0,
    power: 97,
    biteStyle: "Трофейный рывок",
    timeOfDay: "Ночь",
    preferredBaitId: 14,
    minGearTier: 18,
    sellPrice: 90000,
    xp: 18000,
    sprite: "m17.png",
    emoji: "🔨",
    description: "Альфа-самец акулы-молота. Вожак стаи, невероятно агрессивен."
  },
  {
    id: 18,
    name: "Мегалодон-призрак",
    zones: [20],
    baseChance: 0.05,
    chanceModifier: { 20: 1.0 },
    weightMin: 180.0,
    weightMax: 220.0,
    power: 98,
    biteStyle: "Трофейный рывок",
    timeOfDay: "Ночь",
    preferredBaitId: 14,
    minGearTier: 18,
    sellPrice: 130000,
    xp: 26000,
    sprite: "m18.png",
    emoji: "🐍",
    description: "Призрак вымершего мегалодона. Живая легенда, которая не должна существовать."
  },
  {
    id: 19,
    name: "Кракен-детёныш",
    zones: [20],
    baseChance: 0.04,
    chanceModifier: { 20: 1.0 },
    weightMin: 180.0,
    weightMax: 220.0,
    power: 99,
    biteStyle: "Затягивание на дно",
    timeOfDay: "Ночь",
    preferredBaitId: 14,
    minGearTier: 18,
    sellPrice: 220000,
    xp: 44000,
    sprite: "m19.png",
    emoji: "🦑",
    description: "Молодой кракен. Даже детёныш этого чудовища способен утопить корабль."
  },
  {
    id: 20,
    name: "Повелитель Бездны",
    zones: [20],
    baseChance: 0.03,
    chanceModifier: { 20: 1.0 },
    weightMin: 200.0,
    weightMax: 220.0,
    power: 100,
    biteStyle: "Апокалипсис",
    timeOfDay: "Полночь",
    preferredBaitId: 14,
    minGearTier: 18,
    sellPrice: 500000,
    xp: 100000,
    sprite: "m20.png",
    emoji: "💀",
    description: "Абсолютное зло океана. Древнее существо, правящее бездной. Финальный босс."
  }
];

// Конфигурация общего шанса выпадения монстров по зонам (1%)
const MONSTER_ZONE_CHANCE = {
  5: 0.01, 6: 0.01, 7: 0.01, 8: 0.01, 9: 0.01, 10: 0.01,
  11: 0.01, 12: 0.01, 13: 0.01, 14: 0.01, 15: 0.01, 16: 0.01,
  17: 0.01, 18: 0.01, 19: 0.01, 20: 0.01
};

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MONSTERS_DATABASE, MONSTER_ZONE_CHANCE };
}

// Вспомогательные функции
const MonstersDB = {
  getById: (id) => MONSTERS_DATABASE.find(monster => monster.id === id),
  getByZone: (zoneId) => MONSTERS_DATABASE.filter(monster => 
    monster.zones && monster.zones.includes(zoneId)
  ),
  getTotalCount: () => MONSTERS_DATABASE.length,
  
  // ГЛАВНАЯ ФУНКЦИЯ: Попытка поймать монстра в зоне
  tryGetMonsterFromZone: (zoneId) => {
    console.log(`🔍 tryGetMonsterFromZone: проверка зоны ${zoneId}`);
    
    if (zoneId < 5) {
      console.log(`❌ Зона ${zoneId} < 5, монстры недоступны`);
      return null;
    }
    
    const zoneChance = MONSTER_ZONE_CHANCE[zoneId] || 0.01;
    const roll = Math.random();
    console.log(`🎲 Бросок: ${roll.toFixed(4)} vs шанс ${zoneChance} (${(zoneChance * 100).toFixed(1)}%)`);
    
    if (roll > zoneChance) {
      console.log(`❌ Монстр не выпал (${roll.toFixed(4)} > ${zoneChance})`);
      return null;
    }
    
    const availableMonsters = MONSTERS_DATABASE.filter(monster => 
      monster.zones && monster.zones.includes(zoneId)
    );
    
    console.log(`✅ Монстр выпал! Доступно монстров в зоне ${zoneId}: ${availableMonsters.length}`);
    
    if (availableMonsters.length === 0) {
      console.log(`❌ Нет доступных монстров в зоне ${zoneId}`);
      return null;
    }
    
    const weightedMonsters = availableMonsters.map(monster => {
      const modifier = monster.chanceModifier && monster.chanceModifier[zoneId] 
        ? monster.chanceModifier[zoneId] : 1.0;
      return {
        monster: monster,
        weight: monster.baseChance * modifier
      };
    });
    
    const totalWeight = weightedMonsters.reduce((sum, wm) => sum + wm.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const weightedMonster of weightedMonsters) {
      random -= weightedMonster.weight;
      if (random <= 0) {
        console.log(`🐉 Выбран монстр: ${weightedMonster.monster.name}`);
        return weightedMonster.monster;
      }
    }
    
    console.log(`🐉 Выбран монстр (fallback): ${weightedMonsters[0].monster.name}`);
    return weightedMonsters[0].monster;
  },
  
  getMonsterChanceInZone: (zoneId) => {
    if (zoneId < 5) {
      return { totalChance: 0, monsterCount: 0, monsters: [] };
    }
    
    const zoneChance = MONSTER_ZONE_CHANCE[zoneId] || 0.01;
    const availableMonsters = MONSTERS_DATABASE.filter(monster => 
      monster.zones && monster.zones.includes(zoneId)
    );
    
    return {
      totalChance: zoneChance,
      monsterCount: availableMonsters.length,
      monsters: availableMonsters.map(monster => {
        const modifier = monster.chanceModifier && monster.chanceModifier[zoneId] 
          ? monster.chanceModifier[zoneId] : 1.0;
        return {
          id: monster.id,
          name: monster.name,
          relativeChance: monster.baseChance * modifier,
          power: monster.power,
          sellPrice: monster.sellPrice,
          xp: monster.xp
        };
      })
    };
  },
  
  getZoneStatistics: () => {
    const stats = {};
    for (let zoneId = 5; zoneId <= 20; zoneId++) {
      stats[zoneId] = MonstersDB.getMonsterChanceInZone(zoneId);
    }
    return stats;
  },
  
  // Функция для дебаг панели - принудительно выбирает случайного монстра из зоны
  getRandomMonsterFromZone: (zoneId) => {
    const availableMonsters = MONSTERS_DATABASE.filter(monster => 
      monster.zones && monster.zones.includes(zoneId)
    );
    
    if (availableMonsters.length === 0) {
      return null;
    }
    
    return availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports.MonstersDB = MonstersDB;
}
