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
    constructor(...props) {
        super(...props);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
    };

    quacks() {
        console.log('quack');
    };

    swims() {
        console.log('float: both;');
    };
}

class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    };
}

class Trasher extends Dog {
    constructor(name = 'Громила', power = 5) {
        super(name, power);
    };

    getDescriptions() {
        return ['Громила получает на 1 меньше урона', ...super.getDescriptions()];
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
        });
    };
}


class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    }

    attack(context, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = context;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (const oppositeCard of oppositePlayer.table) {
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, oppositeCard, context, onDone);
            });
        }

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog{
    static inGameCount = 0;
    constructor(name = 'Браток', power = 2) {
        super(name, power);
    };

    doAfterComingIntoPlay(context, continuation) {
        super.doAfterComingIntoPlay(context, continuation);
        Lad.inGameCount++;
    };

    doBeforeRemoving(context, continuation) {
        super.doBeforeRemoving(context, continuation);
        Lad.inGameCount--;
    };

    modifyDealedDamageToCreature(value, toCard, context, continuation) {
        super.modifyDealedDamageToCreature(value + Lad.bonus, toCard, context, continuation);
    };

    modifyTakenDamage(value, fromCard, context, continuation) {
        super.modifyTakenDamage(value - Lad.bonus, fromCard, context, continuation);
    };

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')) {
            return ['Чем их больше, тем они сильнее', ...super.getDescriptions()];
        }

        return super.getDescriptions();
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    };

    static setInGameCount(value) {
        this.inGameCount = value;
    };

    static get bonus(){
        const count = this.getInGameCount();
        return count * (count + 1) / 2;
    };
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

const game = new Game(seriffStartDeck, banditStartDeck);

SpeedRate.set(5);

game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
