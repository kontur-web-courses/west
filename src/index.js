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


class Creature extends Card {
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}



// Основа для утки.
class Duck extends Creature {
    constructor(name='Мирная утка', power=2) {
        super(name, power);
    }
    quacks = function () { console.log('quack') };
    swims = function () { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name='Пес-бандит', power=3) {
        super(name, power);
    }
}

class Trasher extends Dog {
    constructor(name, power) {
        super(name, power);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - 1);
    }

    getDescriptions() {
        return ['Если Громилу атакуют, то он получает на 1 меньше урона', super.getDescriptions()]
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck('Мирная утка', 2),
    new Duck('Мирная утка', 2),
    new Duck('Мирная утка', 2)
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Trasher('Громила', 5),
    new Dog(),
    new Dog('Пес-бандит', 3),
    new Dog('Пес-бандит', 3)
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
