import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
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
    constructor(...rest) {
        super(...rest);
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}

class Duck extends Creature {
    constructor(...rest) {
        super(rest);
        this.name = "Мирная утка";
        this.maxPower = 2;
    }

    quacks = function () {
        console.log('quack')
    };
    swims = function () {
        console.log('float: both;')
    };
}

class Dog extends Creature {
    constructor(...rest) {
        super(rest);
        this.name = "Пес-бандит";
        this.maxPower = 3;
    }
}

class Trasher extends Dog {
    constructor(...rest) {
        super(rest);
        this.name = 'Громила';
        this.maxPower = 5;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            if (value > 1) {
                continuation(value - 1);
            }
        })
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
];


// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Trasher(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});

