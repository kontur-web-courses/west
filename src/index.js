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
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}

// Основа для утки.
class Duck extends Creature{
    constructor(name = "Мирная утка", power = 2) {
        super(name, power);
    }

    quacks = function () { console.log('quack') };
    swims = function () { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

class Trasher extends Dog{
    constructor(name = 'Громила', power = 5) {
        super(name, power);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
        });
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    };

    attack(gameContext, continuation) {
        const {oppositePlayer} = gameContext;
        const oppositeCardList = oppositePlayer.table;
        const taskQueue = new TaskQueue();
        for (let oppositeCard of oppositeCardList) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {

                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                }

            });
        }

        taskQueue.continueWith(continuation);
    }
}

class PseudoDuck extends Dog {
    constructor(name = 'Псевдо-утка', power = 3) {
        super(name, power);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

class Rogue extends Creature {
    constructor(name, maxPower, image) {
        const nameCorrect = name || "Изгой";
        const maxPowerCorrect = maxPower || 2;
        const imageCorrect = image || null;
        super(nameCorrect, maxPowerCorrect, imageCorrect);
    }

    doBeforeAttack(gameContext, continuation) {
        const {oppositePlayer, position} = gameContext;
        const oppositeCard = oppositePlayer.table[position];

        if (oppositeCard) {
            const cardPrototype = Object.getPrototypeOf(oppositeCard);
            const abilities = ['modifyDealedDamageToCreature', 'modifyDealedDamageToPlayer', 'modifyTakenDamage'];

            abilities.forEach(ability => {
                if (cardPrototype.hasOwnProperty(ability)) {
                    this[ability] = cardPrototype[ability];
                    delete cardPrototype[ability];
                }
            });

            gameContext.updateView();
        }

        continuation();
    }
}

class Lad extends Dog{
    static _inGameCount;
    constructor(name = 'Браток', power = 2) {
        super(name, power);
    }

    static getBonus(){
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }

    getDescriptions() {
        if (Lad.getBonus() === 0){
            return ['Чем их больше, тем они сильнее', super.getDescriptions()];
        } else {
            return [getCreatureDescription(this), super.getDescriptions()]
        }
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const newDamage = value + Lad.getBonus();
        super.modifyDealedDamageToCreature(newDamage, toCard, gameContext, continuation);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const newDamage = value - Lad.getBonus();
        super.modifyTakenDamage(newDamage, fromCard, gameContext, continuation);
    }

    static getInGameCount() {
        return this._inGameCount || 0;
    }

    static setInGameCount(value) {
        this._inGameCount = value;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1)
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1)
        super.doBeforeRemoving(continuation);
    }
}

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];
const banditStartDeck = [
    new Trasher(),
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
