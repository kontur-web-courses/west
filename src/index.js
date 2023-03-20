import Card from './Card.js';
import Game from './Game.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions() {
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
        ];
    }
}

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
    constructor() {
        super('Мирная утка', 2);
    }

    quacks() {
        console.log('quack');
    };

    swims() {
        console.log('float: both;');
    };
}


class Dog extends Creature {
    constructor() {
        super('Пес-бандит', 3);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    };

    getDescriptions() {
        return [
            getCreatureDescription(this),
            'Получает на 1 меньше урона',
            ...super.getDescriptions()
        ];
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        for (const item of gameContext.oppositePlayer.table) {
            if (item === gameContext.oppositePlayer) {
                continue;
            }
            item.takeDamage(2, this, gameContext, continuation)
            continuation(2);
        }
    }
}

class Lad extends Dog {

    constructor() {
        super('Братки');
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        return Math.round(this.getInGameCount() * (this.getInGameCount() + 1) / 2)
    }

    doBeforeRemoving(...args) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(...args)
    }

    doAfterComingIntoPlay(...args) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(...args)
    }

    modifyTakenDamage(actualValue, damageFromCard, context, continuation) {
        continuation(actualValue - Lad.getBonus())
    }

    modifyDealedDamageToCreature(actualValue, damageToCard, context, continuation) {
        continuation(actualValue + Lad.getBonus());
    }

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')) {
            return [
                'Чем их больше, тем они сильнее',
                ...super.getDescriptions()
            ];
        }
        return super.getDescriptions();
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
