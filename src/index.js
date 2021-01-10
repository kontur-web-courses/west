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
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }
    
    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()]
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
    constructor(name = 'Громила', maxPower = 5, image) {
        super(name, maxPower, image);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }

    getDescriptions() {
        return [...super.getDescriptions(), 'Если Громилу атакуют, то он получает на 1 меньше урона'];
    }
}

class Gatling extends Creature {
    constructor(name = "Гатлинг", maxPower = 6, image) {
        super(name, maxPower, image);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        for (const oppositeCard of gameContext.oppositePlayer.table) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone =>
                this.dealDamageToCreature(2, oppositeCard, gameContext, onDone));
        }

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    static inGameCount = 0;

    constructor(name = 'Браток', maxPower = 2, image) {
        super(name, maxPower, image);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        return this.inGameCount * (this.inGameCount + 1) / 2;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - Lad.getBonus());
    }

    getDescriptions() {
        const buffed = Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
            Lad.prototype.hasOwnProperty('modifyTakenDamage')
        return [
            buffed ? "Чем их больше, тем они сильнее" : "",
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
    new Lad(),
    new Lad(),
];

const game = new Game(seriffStartDeck, banditStartDeck);

SpeedRate.set(1);
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});