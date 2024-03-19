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
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        const baseDescriptions = super.getDescriptions();
        const creatureDescription = getCreatureDescription(this);

        return [creatureDescription, ...baseDescriptions];
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }
    quacks = function () { console.log('quack') };
    swims = function () { console.log('float: both;') };
}

// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-багдит', maxPower = 3) {
        super(name, maxPower);
    }
}

class Trasher extends Dog{
    constructor(name = 'Громила', maxPower = 5){
        super(name, maxPower)
    }
    modifyTakenDamage = (value, fromCard, gameContext, continuation) => {
        this.view.signalAbility(() => { 
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation)
        })
    }

    getDescriptions = () => {
        return [
            "Получает на 1 меньше урона",
            ...super.getDescriptions()
        ];
    }
}

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new Trasher(),
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
