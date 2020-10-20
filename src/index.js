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
        return [
            getCreatureDescription(this),
            super.getDescriptions(),
        ];
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor(name = "Мирная утка", maxPower = 2, image) {
        super(name, maxPower, image);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalDamage(() => continuation(value));
    }
}

// Основа для собаки.
class Dog extends Creature {
    constructor(name = "Пес-бандит", maxPower = 3, image) {
        super(name, maxPower, image);
    }
}

class Trasher extends Dog {
    constructor(name = "Громила", maxPower = 5, image) {
        super(name, maxPower, image);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }

    getDescriptions() {
        return [
            "Eсли Громилу атакуют, то он получает на 1 меньше урона.",
            ...super.getDescriptions()
        ];
    }
}

class Gatling extends Creature {
    constructor(name = "Гатлинг", maxPower = 6, image) {
        super(name, maxPower, image);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const oppositePlayer = gameContext.oppositePlayer;

        for (const oppositeCard of oppositePlayer.table) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone =>
                this.dealDamageToCreature(2, oppositeCard, gameContext, onDone));
        }

        taskQueue.continueWith(continuation);
    }
}

//name, maxPower, image
class Lad extends Dog {
    static inGameCount = 0;

    constructor(name = "Браток", maxPower = 2, image) {
        super(name, maxPower, image);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.inGameCount++;
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.inGameCount--;
        continuation();
    }

    static getBonus() {
        return this.inGameCount * (this.inGameCount + 1) / 2;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        this.view.signalAbility(() => continuation(value - bonus));
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        this.view.signalAbility(() => continuation(value + bonus));
    }

    getDescriptions() {
        const hasProps = Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
            Lad.prototype.hasOwnProperty('modifyTakenDamage')
        return [
            hasProps ? "Чем их больше, тем они сильнее" : "",
            ...super.getDescriptions()
        ];
    }
}

class Rogue extends Creature {
    static stealableAbilities = [
        "modifyTakenDamage",
        "modifyDealedDamageToPlayer",
        "modifyDealedDamageToCreature"
    ];

    constructor(name = "Изгой", maxPower = 2, image) {
        super(name, maxPower, image);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const oppositeCard = oppositePlayer.table[position];
        if (oppositeCard) {
            this.stealAbilities(oppositeCard);
            updateView();
        }
        continuation();
    }

    stealAbilities(card) {
        const cardPrototype = Object.getPrototypeOf(card);
        const abilities = Object.getOwnPropertyNames(cardPrototype)
            .filter(x => Rogue.stealableAbilities.indexOf(x) !== -1)
        for (const ability of abilities) {
            Rogue.prototype[ability] = cardPrototype[ability];
            delete cardPrototype[ability];
        }
    }
}

class Brewer extends Duck {
    constructor(name = "Пивовар", maxPower = 2, image) {
        super(name, maxPower, image);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const taskQueue = new TaskQueue();
        currentPlayer.table
            .concat(oppositePlayer.table)
            .filter(isDuck)
            .forEach(c => {
                c.maxPower++;
                c.currentPower += 2;
                c.currentPower -= c.currentPower > c.maxPower ? c.currentPower - c.maxPower : 0;
                taskQueue.push(onDone => {
                    c.view.signalHeal(onDone);
                });
                taskQueue.push(onDone => {
                    c.updateView();
                    onDone();
                });
            });
        taskQueue.continueWith(continuation);
    }
}

class PseudoDuck extends Dog {
    constructor(name = "Псевдоутка", maxPower = 3, image) {
        super(name, maxPower, image);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

class Nemo extends Creature {
    constructor(name = "Немо", maxPower = 4, image) {
        super(name, maxPower, image);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const oppositeCard = oppositePlayer.table[position];
        if (oppositeCard)
            this.stealPrototype(oppositeCard, gameContext, continuation);
        else
            continuation();
    }
    
    stealPrototype(card, gameContext, continuation){
        Object.setPrototypeOf(this, Object.getPrototypeOf(card));
        if ('doBeforeAttack' in this)
            this.doBeforeAttack(gameContext, continuation);
    }
}

const seriffStartDeck = [
    new Nemo(),
];
const banditStartDeck = [
    new Brewer(),
    new Brewer(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
