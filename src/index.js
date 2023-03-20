import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Duck extends Creature {
    constructor(name, maxPower, image) {
        const nameCorrect = name || "Мирная утка";
        const maxPowerCorrect = maxPower || 2;
        const imageCorrect = image || "/duck.webp";
        super(nameCorrect, maxPowerCorrect, imageCorrect);
    }

    quacks() {
        console.log("quack");
    };

    swims() {
        console.log("float: both;");
    };
}

class Dog extends Creature {
    constructor(name, maxPower, image) {
        const nameCorrect = name || "Пес-бандит";
        const maxPowerCorrect = maxPower || 3;
        const imageCorrect = image || "/dog.webp";

        super(nameCorrect, maxPowerCorrect, imageCorrect);
    }
}

// Основа для утки.
function Duck() {
    this.quacks = function () { console.log('quack') };
    this.swims = function () { console.log('float: both;') };
}


// Основа для собаки.
function Dog() {
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new Dog(),
    new Dog(),
    new Dog(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
