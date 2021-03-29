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

// Основа для утки.
function Duck() {}
Duck.prototype.quacks = function() { console.log('quack') };
Duck.prototype.swims = function() { console.log('float: both;') };

// Основа для собаки.
function Dog() {}

class PeacefulDuckCard extends Card {
    constructor() {
        super('Мирная утка', 2)
    }
    prototype = Object.create(Duck.prototype);
}

class GangstarDog extends Card {
    constructor() {
        super('Пес-бандит', 3)
    }
    prototype = Object.create(Dog.prototype);
}



// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new PeacefulDuckCard(),
    new PeacefulDuckCard(),
    new PeacefulDuckCard()
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new GangstarDog()
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});