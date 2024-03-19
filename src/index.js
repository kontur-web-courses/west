import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()]
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


// Основа для утки.
class Duck extends Creature {
    constructor(name = "Мирный житель", maxPower = 2, image) {
        super(name, maxPower, image);
    }

    quacks = function () {
        console.log('quack')
    };
    swims = function () {
        console.log('float: both;')
    };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = "Бандит", maxPower = 3, image) {
        super(name, maxPower, image);
    }
}


class Trasher extends Dog {
    constructor(name = "Громила", maxPower = 5, ...args) {
        super(name, maxPower, ...args);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1)
        });
    }

    getDescriptions() {
        return ['Получает на 1 меньше урона', super.getDescriptions()];
    }
}

class Gatling extends Creature {
    constructor(name = "Гатлинг", maxPower = 6, ...args) {
        super(name, maxPower, ...args);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        for (let i = 0; i < oppositePlayer.table.length; i++) {
            console.log(i);
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayer.table[i];

                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                }
            });
        }
        taskQueue.continueWith(continuation);
    }
}


class Lad extends Dog {
    constructor(name = "Браток", maxPower = 2, image) {
        super(name, maxPower, image);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        const count = this.getInGameCount();
        return {
            protectionBonus: count * (count + 1) / 2,
            damageBonus: count * (count + 1) / 2
        };
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount((Lad.getInGameCount() || 0) + 1);
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        continuation(value + bonus.damageBonus);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        this.view.signalAbility(() => {
            continuation(value - bonus.protectionBonus);
        });
    }

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') || Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            return ['Чем их больше, тем они сильнее', super.getDescriptions()];
        } else {
            return super.getDescriptions();
        }
    }
}

class Brewer extends Duck {
    constructor(name = "Пивовар", maxPower = 2, image) {
        super(name, maxPower, image);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, updateView} = gameContext;
        const allCards = currentPlayer.table.concat(oppositePlayer.table);

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            allCards.forEach(card => {
                if (card instanceof Duck) {
                    card.maxPower += 1;
                    card.currentPower = Math.min(card.currentPower + 2, card.maxPower);
                    card.view.signalHeal();
                    card.updateView();
                }
            });

            this.maxPower += 1;
            this.currentPower = Math.min(this.currentPower + 2, this.maxPower);
            this.view.signalHeal();
            this.updateView();
            onDone();
        });

        taskQueue.continueWith(continuation);
    }
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
