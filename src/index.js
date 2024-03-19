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
    constructor(name, power, image) {
        super(name, power, image);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }

    set currentPower(value) {
        this._currentPower = value > this.maxPower ? this.maxPower : value;
    }

    get currentPower() {
        return this._currentPower;
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor(name = "Мирный житель", power = 2, image) {
        super(name, power, image);
    }

    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = "Бандит", power = 3, image) {
        super(name, power, image);
    }
}

class Trasher extends Dog {
    constructor() {
        super("Громила", 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }

    getDescriptions() {
        return ["Снижает любой полученный урон на 1.", ...super.getDescriptions()];
    }
}

class Lad extends Dog {
    static inGameCount = 0;

    static getBonus() {
        return this.inGameCount * (this.inGameCount + 1) / 2;
    }
    
    constructor() {
        super("Браток", 2);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value + Lad.getBonus()));
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const newDamageValue = value < Lad.getBonus() ? 0 : value - Lad.getBonus(); 
        this.view.signalAbility(() => continuation(newDamageValue));
    }

    getDescriptions() {
        const additionalDesc = Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')
            ? "Чем их больше, тем они сильнее"
            : ""
        return [additionalDesc, ...super.getDescriptions()];
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.inGameCount += 1;
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.inGameCount -= 1;
        continuation();
    };
}

class Gatling extends Creature {
    constructor() {
        super("Гатлинг", 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (const oppositeCard of oppositePlayer.table) {
            taskQueue.push(onDone => this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone));
        }

        taskQueue.continueWith(continuation);
    };
}

class Rogue extends Creature {
    constructor() {
        super("Изгой", 2);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCard = oppositePlayer.table[position];

            if (oppositeCard) {
                this.stealModifiers(oppositeCard, gameContext);
                this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
            } else {
                this.dealDamageToPlayer(1, gameContext, onDone);
            }
        });

        taskQueue.continueWith(continuation);
    }

    stealModifiers(card, gameContext) {
        const cardProto = Object.getPrototypeOf(card);
        if (cardProto.hasOwnProperty("modifyDealedDamageToCreature")) {
            this.modifyDealedDamageToCreature = cardProto.modifyDealedDamageToCreature;
            delete cardProto["modifyDealedDamageToCreature"];
        }

        if (cardProto.hasOwnProperty("modifyTakenDamage")) {
            this.modifyTakenDamage = cardProto.modifyTakenDamage;
            delete cardProto["modifyTakenDamage"];
        }

        if (cardProto.hasOwnProperty("modifyDealedDamageToPlayer")) {
            this.modifyDealedDamageToPlayer = cardProto.modifyDealedDamageToPlayer;
            delete cardProto["modifyDealedDamageToPlayer"];
        }

        gameContext.updateView();
    }
}

class Brewer extends Duck {
    constructor() {
        super("Пивовар", 2);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCard = oppositePlayer.table[position];

            if (oppositeCard) {
                this.giveBeer(gameContext);
                this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
            } else {
                this.dealDamageToPlayer(1, gameContext, onDone);
            }
        });

        taskQueue.continueWith(continuation);
    }

    giveBeer(gameContext) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        for (const card of currentPlayer.table) {
            if(!isDuck(card)) continue;
            this.view.signalHeal(() => {
                card.maxPower += 1;
                card.currentPower += 2;
                card.updateView();
            });
            
        }

        for (const card of oppositePlayer.table) {
            if(!isDuck(card)) continue;

            this.view.signalHeal(() => {
                card.maxPower += 1;
                card.currentPower += 2;
                card.updateView();
            });
        }
    }
}


const seriffStartDeck = [
    new Duck(),
    new Rogue()
];

const banditStartDeck = [
    new Lad(),
    new Lad(),
    new Lad()
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(2);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
