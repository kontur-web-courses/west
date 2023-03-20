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
    constructor(name, power, image) {
        super(name, power, image);
    }

    getDescriptions() {
        let first = getCreatureDescription();
        let second = super.getDescriptions();
        return [first, second[0]]
    }
}

class Duck extends Creature {
    constructor(image) {
        super("Мирная утка", 2, image);
    }

    static quacks() {
        console.log('quack');
    }

    static swims() {
        console.log('float: both;');
    }

}

class Dog extends Creature {
    constructor(image, name = "Пес-бандит", power = 3) {
        super(name, power, image);
    }

}

class Trasher extends Dog {
    constructor(image) {
        super(image, "Громила", 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        if (value > 1) {
            this.view.signalAbility(() => this.view.signalDamage());
        }
        super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation)
    }
}

class Lad extends Dog {
    constructor(image) {
        super(image, "Браток", 2);
        this.inGameCount = 0;
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(continuation);
    }

    static getBonus() {
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation);
    }
}

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new Lad(),
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