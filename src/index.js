import Game from './Game.js';
import SpeedRate from './SpeedRate.js';
import Creature from "./Creature.js";
import TaskQueue from "./TaskQueue.js";

// Отвечает, является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает, является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
export function getCreatureDescription(card) {
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


class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3, image = null) {
        super(name, maxPower, image);
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower = 2, image = null) {
        super(name, maxPower, image);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;')
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', maxPower = 5, image = null) {
        super(name, maxPower, image);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
        })
        super.modifyTakenDamage(Math.max(0, value - 1), fromCard, gameContext, continuation);
    }

    getDescriptions() {
        return [
            '«Громила»',
            'Для уток все становится плохо, когда в рядах бандитов появляется Громила',
            ...super.getDescriptions()
        ];
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', maxPower = 6, image = null) {
        super(name, maxPower, image);
        this.damage = 2;
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (const oppositeCard of gameContext.oppositePlayer.table.filter(card => card)) {
            taskQueue.push(onDone =>
                this.dealDamageToCreature(this.damage, oppositeCard, gameContext, onDone));
        }

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor(name = 'Браток', maxPower = 2, image = null) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        if (!Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')) {
            return super.getDescriptions();
        }

        return [
            '«Братки»',
            'Чем их больше, тем они сильнее',
            ...super.getDescriptions()
        ];
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        if (value < 0)
            throw Error("Lad count can't be negative");

        this.inGameCount = value;
    }

    static getBonus() {
        const inGameCount = this.getInGameCount();
        return inGameCount * (inGameCount + 1) / 2;
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        super.modifyDealedDamageToCreature(value * Lad.getBonus(), toCard, gameContext, continuation);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value * Lad.getBonus(), fromCard, gameContext, continuation);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(continuation);
    }
}

class Brewer extends Duck {
    constructor(name = 'Пивовар', maxPower = 2, image = null) {
        super(name, maxPower, image);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        taskQueue.push(onDone => {
            this.view.signalHeal(onDone);
            this.updateView();
        });

        const allCards = gameContext.currentPlayer.table
            .concat(gameContext.oppositePlayer.table);

        for (const card of allCards) {
            if (isDuck(card)) {
                card.maxPower += 1;
                card.currentPower += 2;
                taskQueue.push(onDone => {
                    card.view.signalHeal(onDone);
                    card.updateView();
                });
            }
        }

        super.attack(gameContext, continuation);
    }
}

class PseudoDuck extends Dog {
    constructor(name = 'Псевдоутка', maxPower = 3, image = null) {
        super(name, maxPower, image);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }

    getDescriptions() {
        return super.getDescriptions();
    }
}

const seriffStartDeck = [
    new Duck(),
    new Brewer(),
];
const banditStartDeck = [
    new Dog(),
    new PseudoDuck(),
    new Dog(),
];

if (isDuck(new PseudoDuck())) {
    console.log(true)
}

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(3);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
