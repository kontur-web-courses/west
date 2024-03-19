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
    constructor(...props) {
        super(...props);
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
    constructor(name = 'Мирная утка', maxPower = 2) {
        super(name, maxPower);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3) {
        super(name, maxPower);
    }
}

// Задание 4
class Trasher extends Dog {
    constructor(name = 'Громила', maxPower = 5) {
        super(name, maxPower);
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
    constructor(name = 'Гатлинг', maxPower = 6) {
        super(name, maxPower);
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
    constructor(name = 'Браток', maxPower = 2) {
        super(name, maxPower);
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
    constructor(name = 'Пивовар', maxPower = 2) {
        super(name, maxPower);
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
    constructor(name = 'Псевдоутка', maxPower = 3) {
        super(name, maxPower);
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
    new Duck(),
    new Duck(),
    new Gatling(),
    new Brewer(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog(),
    new PseudoDuck(),
    new Trasher(),
    new Lad(),
    new Lad(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(2);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
