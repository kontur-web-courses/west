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


class Creature extends Card{
    constructor(name, maxPower) {
        super(name, maxPower);
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()];
    }
}

// Основа для утки.
class Duck extends Creature{
    constructor() {
        super('Мирная утка', 2);
    }
    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3) {
        super(name, maxPower);
    }
}


class Trasher extends Dog{
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }

    getDescriptions() {
        return ['Получает на 1 меньше урона', super.getDescriptions()];
    }
}

class Gatling extends Creature{
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        taskQueue.push(onDone => {
            this.view.showAttack(onDone);
        });
        for (let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, gameContext.oppositePlayer.table[position], gameContext, onDone);
            });
        }
        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor() {
        super('Браток', 2);
    }

    static getBonus() {
        const inGameCount = this.getInGameCount();
        return inGameCount * (inGameCount + 1) / 2;
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value + Lad.getBonus());
        });
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - Lad.getBonus());
        });
    };


    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }


    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            return ['Чем их больше, тем они сильнее', super.getDescriptions()];
        } else {
            return super.getDescriptions();
        }
    }
}

class Rogue extends Creature {
    constructor() {
        super('Изгой', 2);
    }

    doBeforeAttack(gameContext, continuation) {
        const {oppositePlayer, position} = gameContext;
        const card = Object.getPrototypeOf(oppositePlayer.table[position]);
        this.view.signalAbility(() => {
            if (card.hasOwnProperty('modifyDealedDamageToCreature')) {
                this.modifyDealedDamageToCreature = card.modifyDealedDamageToCreature;
                delete card.modifyDealedDamageToCreature;
            }
            if (card.hasOwnProperty('modifyDealedDamageToPlayer')) {
                this.modifyDealedDamageToPlayer = card.modifyDealedDamageToPlayer;
                delete card.modifyDealedDamageToPlayer;
            }
            if (card.hasOwnProperty('modifyTakenDamage')) {
                this.modifyTakenDamage = card.modifyTakenDamage;
                delete card.modifyTakenDamage;
            }
            gameContext.updateView();
            continuation();
        });
    };
}

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Rogue(),
];
const banditStartDeck = [
    new Lad(),
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
