import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {

    constructor(name, power) {
        super(name, power);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()]
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
        super("Мирная утка", 2);
    }

    quacks () { console.log('quack') };
    swims () { console.log('float: both;') };
}

class Dog extends Creature {
    constructor(name="Пес-бандит", maxPower=3) {
        super(name, maxPower);
    }
}

class Trasher extends Dog {
    constructor() {
        super("Громила", 5);
    }

    getDescriptions() {
        return ["Если Громилу атакуют, то он получает на 1 меньше урона", ...super.getDescriptions()];
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value-1));
    }
}

class Lad extends Dog {
    constructor() {
        super("Браток", 2);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => continuation(value - Lad.getBonus()));
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value + Lad.getBonus()));
    }

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
            Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            return ["Чем их больше, тем они сильнее", ...super.getDescriptions()];
        }
        return super.getDescriptions();
    }


    static getBonus() {
        // Защита от урона = количество * (количество + 1) / 2 Дополнительный урон = количество * (количество + 1) / 2
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }
}

class Gatling extends Creature {
    constructor() {
        super("Гатлинг", 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, pos, updateView} = gameContext;

        for(let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayer.table[position];

                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                } else {
                    onDone();
                }
            });
        }

        taskQueue.continueWith(continuation);
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