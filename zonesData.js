// -*- coding: utf-8 -*-
// База данных зон (20 локаций)
// Зоны разблокируются по мере прогрессии

const ZONES_DATABASE = [
  {
    id: 1,
    name: "Деревенский пруд",
    biome: "Пруд",
    region: "Европа",
    minGearTier: 1,
    minPlayerLevel: 1,
    unlockCost: 0,
    unlockXP: 0,
    description: "Старт: мелочь, много мусора.",
    sprite: "zone_01.png",
    emoji: "🏞️",
    background: "derev.jpg"
  },
  {
    id: 2,
    name: "Камышовое озеро",
    biome: "Озеро",
    region: "Европа",
    minGearTier: 2,
    minPlayerLevel: 5,
    unlockCost: 400,
    unlockXP: 250,
    description: "Трава/камыш, осторожный клёв.",
    sprite: "zone_02.png",
    emoji: "🌾",
    background: "kamish.jpg"
  },
  {
    id: 3,
    name: "Река у моста",
    biome: "Река",
    region: "Европа",
    minGearTier: 3,
    minPlayerLevel: 10,
    unlockCost: 1000,
    unlockXP: 600,
    description: "Течение. Нужна точность заброса.",
    sprite: "zone_03.png",
    emoji: "🌉",
    background: "rek_most.jpg"
  },
  {
    id: 4,
    name: "Горный ручей",
    biome: "Горная река",
    region: "Европа",
    minGearTier: 4,
    minPlayerLevel: 15,
    unlockCost: 2000,
    unlockXP: 1200,
    description: "Холодная вода, быстрая рыба.",
    sprite: "zone_04.png",
    emoji: "⛰️",
    background: "gor_ruch.jpg"
  },
  {
    id: 5,
    name: "Большое карповое озеро",
    biome: "Озеро",
    region: "Европа",
    minGearTier: 5,
    minPlayerLevel: 20,
    unlockCost: 3500,
    unlockXP: 2000,
    description: "Карповые трофеи, сильные рывки.",
    sprite: "zone_05.png",
    emoji: "🎣",
    background: "karp_ozer.jpg"
  },
  {
    id: 6,
    name: "Озеро Байкал",
    biome: "Озеро",
    region: "Сибирь",
    minGearTier: 6,
    minPlayerLevel: 25,
    unlockCost: 5200,
    unlockXP: 2800,
    description: "Глубочайшее озеро мира. Эндемики и сибирские виды.",
    sprite: "zone_06.png",
    emoji: "🏔️",
    background: "baikal.jpg"
  },
  {
    id: 7,
    name: "Дельта и лиман",
    biome: "Дельта",
    region: "Европа/Азия",
    minGearTier: 7,
    minPlayerLevel: 30,
    unlockCost: 7500,
    unlockXP: 3800,
    description: "Пресно-солёная вода, осетровые.",
    sprite: "zone_07.png",
    emoji: "🌊",
    background: "delt.jpg"
  },
  {
    id: 8,
    name: "Залив мангров",
    biome: "Лагуна",
    region: "Тропики",
    minGearTier: 8,
    minPlayerLevel: 35,
    unlockCost: 10500,
    unlockXP: 5200,
    description: "Много хищника, резкие атаки.",
    sprite: "zone_08.png",
    emoji: "🌴",
    background: "mangr.jpg"
  },
  {
    id: 9,
    name: "Коралловый риф",
    biome: "Риф",
    region: "Тропики",
    minGearTier: 9,
    minPlayerLevel: 40,
    unlockCost: 14000,
    unlockXP: 6800,
    description: "Рифовые, много сходов без топ крючка.",
    sprite: "zone_09.png",
    emoji: "🪸",
    background: "korall.jpg"
  },
  {
    id: 10,
    name: "Средиземное побережье",
    biome: "Море",
    region: "Средиземноморье",
    minGearTier: 10,
    minPlayerLevel: 45,
    unlockCost: 18000,
    unlockXP: 8500,
    description: "Пелагика, вечерний пик.",
    sprite: "zone_10.png",
    emoji: "🏖️",
    background: "sred.jpg"
  },
  {
    id: 11,
    name: "Карибский шельф",
    biome: "Море",
    region: "Карибы",
    minGearTier: 11,
    minPlayerLevel: 50,
    unlockCost: 23000,
    unlockXP: 10500,
    description: "Быстрые рыбы, важна скорость.",
    sprite: "zone_11.png",
    emoji: "🏝️",
    background: "karib.jpg"
  },
  {
    id: 12,
    name: "Болото и старица",
    biome: "Болото",
    region: "США/Юг",
    minGearTier: 11,
    minPlayerLevel: 55,
    unlockCost: 26000,
    unlockXP: 11500,
    description: "Тина: штраф к подсечке без правильного поплавка.",
    sprite: "zone_12.png",
    emoji: "🐊",
    background: "boloto.jpg"
  },
  {
    id: 13,
    name: "Амазонка: главное русло",
    biome: "Река",
    region: "Южная Америка",
    minGearTier: 12,
    minPlayerLevel: 60,
    unlockCost: 33000,
    unlockXP: 14500,
    description: "Сверхсильная рыба, ночные сомы.",
    sprite: "zone_13.png",
    emoji: "🌿",
    background: "amaz.jpg"
  },
  {
    id: 14,
    name: "Озеро Виктория",
    biome: "Озеро",
    region: "Африка",
    minGearTier: 12,
    minPlayerLevel: 65,
    unlockCost: 38000,
    unlockXP: 16000,
    description: "Нильский окунь, сильные трофеи.",
    sprite: "zone_14.png",
    emoji: "🦛",
    background: "vika.jpg"
  },
  {
    id: 15,
    name: "Река Конго",
    biome: "Река",
    region: "Африка",
    minGearTier: 13,
    minPlayerLevel: 70,
    unlockCost: 45000,
    unlockXP: 18000,
    description: "Голиаф-тигр: молниеносные атаки.",
    sprite: "zone_15.png",
    emoji: "🐯",
    background: "kongo.jpg"
  },
  {
    id: 16,
    name: "Японский залив",
    biome: "Море",
    region: "Япония",
    minGearTier: 13,
    minPlayerLevel: 75,
    unlockCost: 50000,
    unlockXP: 19500,
    description: "Жёлтохвосты, кальмар ночью.",
    sprite: "zone_16.png",
    emoji: "🗾",
    background: "japan.jpg"
  },
  {
    id: 17,
    name: "Северный фьорд",
    biome: "Фьорд",
    region: "Север",
    minGearTier: 14,
    minPlayerLevel: 80,
    unlockCost: 57000,
    unlockXP: 21500,
    description: "Донная ловля: треска/палтус.",
    sprite: "zone_17.png",
    emoji: "🏔️",
    background: "sev.jpg"
  },
  {
    id: 18,
    name: "Открытый океан: синяя вода",
    biome: "Океан",
    region: "Океан",
    minGearTier: 15,
    minPlayerLevel: 85,
    unlockCost: 65000,
    unlockXP: 24000,
    description: "Тунец/марлин. Длинные забеги.",
    sprite: "zone_18.png",
    emoji: "🌊",
    background: "fon.jpg"
  },
  {
    id: 19,
    name: "Глубины океана",
    biome: "Океан (глубь)",
    region: "Океан",
    minGearTier: 16,
    minPlayerLevel: 90,
    unlockCost: 74000,
    unlockXP: 27000,
    description: "Акулы/меч-рыба. Большие нагрузки.",
    sprite: "zone_19.png",
    emoji: "🦈",
    background: "gok.jpg"
  },
  {
    id: 20,
    name: "Акулья отмель",
    biome: "Океан (трофеи)",
    region: "Океан",
    minGearTier: 18,
    minPlayerLevel: 95,
    unlockCost: 88000,
    unlockXP: 32000,
    description: "Финал: большие акулы, легендарные трофеи.",
    sprite: "zone_20.png",
    emoji: "🦈",
    background: "okul.jpg"
  }
];

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ZONES_DATABASE };
}

// Вспомогательные функции
const ZonesDB = {
  // Получить зону по ID
  getById: (id) => ZONES_DATABASE.find(zone => zone.id === id),
  
  // Получить зоны по региону
  getByRegion: (region) => ZONES_DATABASE.filter(zone => zone.region === region),
  
  // Получить зоны по биому
  getByBiome: (biome) => ZONES_DATABASE.filter(zone => zone.biome === biome),
  
  // Получить доступные зоны для текущего уровня снастей
  getAvailableZones: (gearTier) => ZONES_DATABASE.filter(zone => zone.minGearTier <= gearTier),
  
  // Получить зоны которые можно разблокировать
  getUnlockableZones: (gearTier, currentCoins, currentXP) => {
    return ZONES_DATABASE.filter(zone => 
      zone.minGearTier <= gearTier && 
      zone.unlockCost <= currentCoins &&
      zone.unlockXP <= currentXP
    );
  },
  
  // Получить следующую зону для разблокировки
  getNextZone: (currentZoneId) => {
    const currentIndex = ZONES_DATABASE.findIndex(zone => zone.id === currentZoneId);
    return currentIndex >= 0 && currentIndex < ZONES_DATABASE.length - 1 
      ? ZONES_DATABASE[currentIndex + 1] 
      : null;
  },
  
  // Проверить доступность зоны
  isZoneUnlockable: (zoneId, gearTier, coins, xp) => {
    const zone = ZonesDB.getById(zoneId);
    if (!zone) return false;
    return zone.minGearTier <= gearTier && 
           zone.unlockCost <= coins && 
           zone.unlockXP <= xp;
  },
  
  // Получить общее количество зон
  getTotalCount: () => ZONES_DATABASE.length
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports.ZonesDB = ZonesDB;
}
