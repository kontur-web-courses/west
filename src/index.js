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
    constructor(name, maxPower) {
        super(name, maxPower);
    }

    getcurrentPower() {
        return this.currentPower;
    }

    setcurrentPower(value) {
        if (value < this.maxPower) {
            this.currentPower = value;
        } else {
            this.currentPower = this.maxPower;
        }
    }

    getDescriptions() {
        let arr = super.getDescriptions();
        arr.unshift(getCreatureDescription(this));
        return arr;
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const { currentPlayer, oppositePlayer } = gameContext;
        for (let position = 0; position < gameContext.oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayer.table[position];
                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                }
            });
        }
        taskQueue.continueWith(continuation);
    };
}

class Rogue extends Creature {
    constructor(name = 'Изгой', power = 2) {
        super(name, power);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const { currentPlayer, oppositePlayer, position, updateView } = gameContext;
        const oppositeCard = oppositePlayer.table[position];
        if (oppositeCard) {
            const prototypeCard = Object.getPrototypeOf(oppositeCard);
            Rogue.prototype.modifyDealedDamageToCreature = prototypeCard['modifyDealedDamageToCreature'];
            delete prototypeCard['modifyDealedDamageToCreature'];
            Rogue.prototype.modifyDealedDamageToPlayer = prototypeCard['modifyDealedDamageToPlayer'];
            delete prototypeCard['modifyDealedDamageToPlayer'];
            Rogue.prototype.modifyTakenDamage = prototypeCard['modifyTakenDamage'];
            delete prototypeCard['modifyTakenDamage'];
            gameContext.updateView();
        }

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            if (oppositeCard) {
                this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
            } else {
                this.dealDamageToPlayer(1, gameContext, onDone);
            }
        });

        taskQueue.continueWith(continuation);
    };
}

class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

class Lad extends Dog {
    constructor() {
        super('Браток', 2);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }
    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    };

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => { continuation(value - Lad.getBonus()) });
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        this.view.signalAbility(() => { continuation(value + Lad.getBonus()) });
    }

    getDescriptions() {
        let arr = super.getDescriptions();
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') && Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            arr.unshift("Чем их больше, тем они сильнее");
        }
        return arr;
    }
}


class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    getDescriptions() {
        let arr = super.getDescriptions();
        arr.unshift("Получает на 1 меньше урона");
        return arr;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => { continuation(value - 1) });
    }
}


class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
    }

    static quacks() {
        console.log('quack')
    }

    static swims() {
        console.log('float: both;')
    }
}

class Brewer extends Duck {
    constructor(name = 'Пивовар', power = 2) {
        super(name, power);
    }

    doBeforeAttack(gameContext, continuation) {
        const { currentPlayer, oppositePlayer, position, updateView } = gameContext;
        let cards = currentPlayer.table.concat(oppositePlayer.table);
        for (let card of cards) {
            if (isDuck(card)) {
                card.maxPower += 1;
                card.setcurrentPower(card.getcurrentPower() + 2);
                card.updateView();
            }
        }
        continuation();
    };

}

const seriffStartDeck = [
    new Duck(),
    new Brewer(),
];
const banditStartDeck = [
    new Dog(),
    new Dog(),
    new Dog(),
    new Dog(),
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});