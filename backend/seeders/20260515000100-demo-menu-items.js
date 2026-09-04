"use strict";

const now = new Date();

const menuItems = [
  {
    name: "Шашлык из курицы",
    price: 450,
    description: "Сочный куриный шашлык, приготовленный на мангале",
    ingredients: "Курица, специи, лук, зелень",
    category: "Шашлык",
    emoji: "🍗",
    popular: true,
    available: true,
    image: "/uploads/potatoBeaf.jpg",
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Шашлык из баранины",
    price: 650,
    description: "Классический шашлык из баранины с ароматными специями",
    ingredients: "Баранина, специи, лук, зелень",
    category: "Шашлык",
    emoji: "🥩",
    popular: true,
    available: true,
    image: "/uploads/borw.jpg",
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Люля-кебаб",
    price: 520,
    description: "Нежный люля-кебаб из рубленого мяса на мангале",
    ingredients: "Фарш, лук, специи, зелень",
    category: "Кебаб",
    emoji: "🌯",
    popular: true,
    available: true,
    image: "/uploads/burger.jpg",
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Картофель на мангале",
    price: 250,
    description: "Запечённый картофель с дымком",
    ingredients: "Картофель, специи, масло",
    category: "Гарниры",
    emoji: "🥔",
    popular: false,
    available: true,
    image: "/uploads/potato.jpg",
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Овощи на мангале",
    price: 350,
    description: "Ассорти овощей, приготовленных на углях",
    ingredients: "Перец, баклажан, помидор, кабачок",
    category: "Гарниры",
    emoji: "🥗",
    popular: false,
    available: true,
    image: "/uploads/salat.jpg",
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Морс ягодный",
    price: 180,
    description: "Домашний ягодный морс",
    ingredients: "Ягоды, вода, сахар",
    category: "Напитки",
    emoji: "🥤",
    popular: false,
    available: true,
    image: null,
    createdAt: now,
    updatedAt: now,
  },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("MenuItems", menuItems);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("MenuItems", {
      name: menuItems.map((item) => item.name),
    });
  },
};
