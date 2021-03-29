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
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()]
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2, image) {
        super(name, power, image)
    }

    quacks () {
        console.log('quack')
    }

    swims () {
        console.log('float: both;')
    }
}


class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3, image) {
        super(name, power, image)
    }
}


class Trasher extends Dog {
    constructor(name = 'Громила', power = 5, image) {
        super(name, power, image);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }

    getDescriptions() {
        return [
            'Если Громилу атакуют, то он получает на 1 меньше урона',
            super.getDescriptions(),
        ];
    }
}


class Lad extends Dog {
    constructor(name = 'Браток', power = 2, image) {
        super(name, power, image);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        return this.inGameCount * (this.inGameCount + 1) / 2
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Math.max(0, Lad.getInGameCount() - 1))
        super.doBeforeRemoving(continuation);
    }

    modifyDealedDamageToCreature(value, ...args) {
        super.modifyDealedDamageToCreature(value + Lad.getBonus(), ...args);
    }

    modifyTakenDamage(value, ...args) {
        super.modifyTakenDamage(value - Lad.getBonus(), ...args);
    }


    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature'))
            return [
                'Чем их больше, тем они сильнее',
                super.getDescriptions(),
            ]
        return [
            getCreatureDescription(this),
            super.getDescriptions(),
        ]
    }

}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog(),
    new Lad(),
    new Trasher(),
    new Lad(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
