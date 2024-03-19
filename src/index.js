import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

function isDuck(card) {
    return card && card.quacks && card.swims;
}

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
        super(name, power, null);
    }
}

Creature.prototype.getDescriptions = function () {
    let arr = [];
    arr.push(getCreatureDescription(this));
    arr.push(Object.getPrototypeOf(Creature.prototype).getDescriptions.call(this));
    return arr;
}


// Основа для утки.
class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }
}

Duck.prototype.quacks = function () { console.log('quack') };
Duck.prototype.swims = function () { console.log('float: both;') };


class Dog extends Creature {
    constructor(name = 'Пес-бандит', pow = 3) {
        super(name, pow);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation); })
    };

    getDescriptions() {
        return ["-1 к получаемому урону", ...super.getDescriptions()];
    };
}


const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
];
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
