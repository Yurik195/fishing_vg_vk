// -*- coding: utf-8 -*-
// База данных наживок
// Наживки разблокируются по мере прогрессии

const BAITS_DATABASE = [
  {
    id: 1,
    name: "Хлеб",
    type: "Растительная",
    unlockTier: 1,
    role: "Начальная",
    targets: "мирная мелочь",
    sprite: "n1.png",
    emoji: "🍞"
  },
  {
    id: 2,
    name: "Червь",
    type: "Животная",
    unlockTier: 2,
    role: "Универсал",
    targets: "окунь/линь/форель",
    sprite: "n2.png",
    emoji: "🪱"
  },
  {
    id: 3,
    name: "Тесто/Каша",
    type: "Растительная",
    unlockTier: 3,
    role: "Карповые",
    targets: "лещ/карп",
    sprite: "n3.png",
    emoji: "🍚"
  },
  {
    id: 4,
    name: "Кукуруза",
    type: "Растительная",
    unlockTier: 4,
    role: "Карповые+",
    targets: "карп/амур",
    sprite: "n4.png",
    emoji: "🌽"
  },
  {
    id: 5,
    name: "Опарыш",
    type: "Животная",
    unlockTier: 4,
    role: "Белая рыба",
    targets: "язь/подуст/густера",
    sprite: "n5.png",
    emoji: "🐛"
  },
  {
    id: 6,
    name: "Насекомое (Муха)",
    type: "Животная",
    unlockTier: 5,
    role: "Горная рыба",
    targets: "хариус/форель",
    sprite: "n6.png",
    emoji: "🪰"
  },
  {
    id: 7,
    name: "Живец (мелкая рыбка)",
    type: "Животная",
    unlockTier: 6,
    role: "Хищник",
    targets: "щука/судак",
    sprite: "n7.png",
    emoji: "🐟"
  },
  {
    id: 8,
    name: "Лягушка",
    type: "Животная",
    unlockTier: 7,
    role: "Болота",
    targets: "змееголов/гар",
    sprite: "n8.png",
    emoji: "🐸"
  },
  {
    id: 9,
    name: "Креветка",
    type: "Морская",
    unlockTier: 8,
    role: "Берег",
    targets: "сибас/снаппер",
    sprite: "n9.png",
    emoji: "🦐"
  },
  {
    id: 10,
    name: "Кальмар",
    type: "Морская",
    unlockTier: 9,
    role: "Море/риф",
    targets: "амберджек/рифовые",
    sprite: "n10.png",
    emoji: "🦑"
  },
  {
    id: 11,
    name: "Филе рыбы",
    type: "Животная/морская",
    unlockTier: 10,
    role: "Крупный хищник",
    targets: "сом/акулы",
    sprite: "n11.png",
    emoji: "🥩"
  },
  {
    id: 12,
    name: "Мясо краба",
    type: "Морская",
    unlockTier: 12,
    role: "Дно/глубина",
    targets: "палтус/треска",
    sprite: "n12.png",
    emoji: "🦀"
  },
  {
    id: 13,
    name: "Полоска бонито",
    type: "Морская",
    unlockTier: 13,
    role: "Троллинговая",
    targets: "тунец/ваху",
    sprite: "n13.png",
    emoji: "🐟"
  },
  {
    id: 14,
    name: "Кусочки осьминога",
    type: "Морская",
    unlockTier: 15,
    role: "Трофейная",
    targets: "акулы/меч-рыба",
    sprite: "n14.png",
    emoji: "🐙"
  },
  {
    id: 15,
    name: "Мотыль",
    type: "Животная",
    unlockTier: 2,
    role: "Мелкая рыба",
    targets: "плотва/карась/густера",
    sprite: "n15.png",
    emoji: "🪱"
  },
  {
    id: 16,
    name: "Перловка",
    type: "Растительная",
    unlockTier: 3,
    role: "Карповые",
    targets: "карась/лещ/карп",
    sprite: "n16.png",
    emoji: "🌾"
  },
  {
    id: 17,
    name: "Манка",
    type: "Растительная",
    unlockTier: 3,
    role: "Белая рыба",
    targets: "плотва/густера/подуст",
    sprite: "n17.png",
    emoji: "🍚"
  },
  {
    id: 18,
    name: "Горох",
    type: "Растительная",
    unlockTier: 4,
    role: "Карповые",
    targets: "карп/сазан/амур",
    sprite: "n18.png",
    emoji: "🫛"
  },
  {
    id: 19,
    name: "Пшеница",
    type: "Растительная",
    unlockTier: 4,
    role: "Мирная рыба",
    targets: "лещ/язь/плотва",
    sprite: "n19.png",
    emoji: "🌾"
  },
  {
    id: 20,
    name: "Кузнечик",
    type: "Животная",
    unlockTier: 5,
    role: "Поверхностная",
    targets: "голавль/язь/жерех",
    sprite: "n20.png",
    emoji: "🦗"
  },
  {
    id: 21,
    name: "Саранча",
    type: "Животная",
    unlockTier: 5,
    role: "Крупная поверхностная",
    targets: "жерех/голавль/форель",
    sprite: "n21.png",
    emoji: "🦗"
  }
];

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BAITS_DATABASE };
}

// Вспомогательные функции
const BaitsDB = {
  getById: (id) => BAITS_DATABASE.find(bait => bait.id === id),
  getByTier: (tier) => BAITS_DATABASE.filter(bait => bait.unlockTier <= tier),
  getByType: (type) => BAITS_DATABASE.filter(bait => bait.type === type),
  getTotalCount: () => BAITS_DATABASE.length
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports.BaitsDB = BaitsDB;
}
