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

// Задание 3
class Creature extends Card {
    constructor() {
        super();
        this._currentPower = this.maxPower;
    }

    get currentPower() {
        return this._currentPower;
    }

    set currentPower(value) {
        this._currentPower = Math.min(this.maxPower, value)
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

// Задание 2
class Duck extends Creature {
    constructor() {
        super();
        this.name = 'Мирная утка';
        this.maxPower = 2;
        this.currentPower = 2;
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

class Dog extends Creature {
    constructor() {
        super();
        this.name = 'Пес-бандит';
        this.maxPower = 3;
        this.currentPower = 3;
    }
}

// Задание 4
class Trasher extends Dog {
    constructor() {
        super();
        this.name = 'Громила';
        this.maxPower = 5;
        this.currentPower = 5;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const reducedDamage = value - 1;
        this.view.signalAbility(() => {
            continuation(Math.max(0, reducedDamage));
        });
    }

    getDescriptions() {
        const baseDescriptions = super.getDescriptions();
        const extraDescription = 'Получает на 1 меньше урона при атаке';
        return [extraDescription, ...baseDescriptions];
    }
}

class Gatling extends Creature {
    constructor() {
        super();
        this.name = 'Гатлинг';
        this.maxPower = 6;
        this.currentPower = 6;
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (const oppositeCard of oppositePlayer.table) {
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
            });
        }

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor() {
        super();
        this.name = 'Браток';
        this.maxPower = 2;
        this.currentPower = 2;
    }

    static getInGameCount() { return this.inGameCount || 0; }

    static setInGameCount(value) { this.inGameCount = value; }

    static getBonus() {
        const count = this.getInGameCount();
        return count * (count + 1) / 2;
    }

    doAfterComingIntoPlay(context, continuation) {
        super.doAfterComingIntoPlay(context, continuation);
        Lad.setInGameCount(Lad.getInGameCount() + 1);
    }

    doBeforeRemoving(context, continuation) {
        super.doBeforeRemoving(context, continuation);
        Lad.setInGameCount(Lad.getInGameCount() - 1);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const extraDamage = Lad.getBonus();
        this.view.signalAbility(() => {
            continuation(value + extraDamage);
        });
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const damageNegated = Lad.getBonus();
        this.view.signalAbility(() => {
            continuation(value - damageNegated);
        });
    }

    getDescriptions() {
        const baseDescriptions = super.getDescriptions();
        if (!(Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature'))) {
            return baseDescriptions;
        }
        const extraDescription = 'Чем их больше, тем они сильнее';
        return [extraDescription, ...baseDescriptions];
    }
}

class Brewer extends Duck {
    constructor() {
        super();
        this.name = 'Пивовар';
        this.maxPower = 2;
        this.currentPower = 2;
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const allCards = currentPlayer.table.concat(oppositePlayer.table);
        for (const card of allCards) {
            if (isDuck(card)) {
                card.maxPower += 1;
                card.currentPower += 2;
                card.view.signalHeal(continuation);
                card.updateView();
            }
        }
    }
}

class PseudoDuck extends Dog {
    constructor() {
        super();
        this.name = 'Псевдоутка';
        this.maxPower = 3;
        this.currentPower = 3;
    }

    quacks() {
        console.log('I can quack!');
    }

    swims() {
        console.log('I can swim!');
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Brewer(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new PseudoDuck(),
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
