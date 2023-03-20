import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import card from "./Card.js";

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
    };

    getDescriptions() {
        const first = getCreatureDescription(this);
        const second = super.getDescriptions();
        return [first, ...second];
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
    }

    quacks = function () {
        console.log('quack');
    };

    swims = function () {
        console.log('float: both;');
    };
}

class Dog extends Creature {
    constructor(name = "Пес-бандит", power = 3) {
        super(name, power);
    };

}

// Основа для утки.
// function Duck() {
//     this.quacks = function () {
//         console.log('quack')
//     };
//     this.swims = function () {
//         console.log('float: both;')
//     };
// }

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    }

    getDescriptions() {
        const first = 'Если Громилу атакуют, то он получает на 1 меньше урона';
        const second = super.getDescriptions();
        return [first, ...second];
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const opponentCards = gameContext.oppositePlayer.table;

        taskQueue.push(x => this.view.showAttack(x));
        for (let oppositeCard of opponentCards) {
            taskQueue.push(x => {
                this.dealDamageToCreature(2, oppositeCard, gameContext, x);
            });
        }
        taskQueue.continueWith(continuation);
    }
}


// Основа для собаки.
// function Dog() {
// }


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];
const banditStartDeck = [
    new Trasher(),
    new Dog(),
    new Dog(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1.8);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
