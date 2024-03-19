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
        this._currentPower = maxPower;
    }

    get currentPower() {
        return this._currentPower;
    }

    set currentPower(value) {
        if (value <= this.maxPower) {
            this._currentPower = value;
        } else {
            this._currentPower = this.maxPower;
        }
    }

    getDescriptions() {
        const baseDescriptions = super.getDescriptions();
        const creatureDescription = getCreatureDescription(this);

        return [creatureDescription, ...baseDescriptions];
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower = 2) {
        super(name, maxPower);
    }
    quacks = function () { console.log('quack') };
    swims = function () { console.log('float: both;') };
}

// Основа для собаки.
class Dog extends Creature {
    constructor(name='Пес-бандит', maxPower = 3) {
        super(name, maxPower);
    }
}

class Trasher extends Dog{
    constructor(name = 'Громила', maxPower = 5){
        super(name, maxPower)
    }
    modifyTakenDamage = (value, fromCard, gameContext, continuation) => {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation)
        })
    }

    getDescriptions = () => {
        return [
            "Получает на 1 меньше урона",
            ...super.getDescriptions()
        ];
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const oppositePlayer = gameContext.oppositePlayer;

        for (let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => {
                const card = oppositePlayer.table[position];
                if (card) {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                } else {
                    onDone();
                }
            });
        }

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor() {
        super('Браток', 2);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        this.constructor.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation) {
        this.constructor.setInGameCount(lad.getInGameCount() - 1);
        super.doBeforeRemoving(continuation);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const bonus = this.constructor.getBonus();
        super.modifyDealedDamageToCreature(value + bonus, toCard, gameContext, continuation);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const bonus = this.constructor.getBonus();
        super.modifyTakenDamage(value - bonus, fromCard, gameContext, continuation);
    }

    getDescriptions() {
        return ["Чем их больше, тем они сильнее", ...super.getDescriptions()];
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static getBonus() {
        const count = this.getInGameCount();
        return count * (count + 1) / 2;
    }
}


class PseudoDuck extends Dog{
    constructor() {
        super("Псевдоутка", 3)
    }
    quacks = function () { console.log('quack') };
    swims = function () { console.log('float: both;') };
}

class Brewer extends Duck {
    constructor() {
        super('Пивовар', 2);
    }

    attack(gameContext, continuation) {
        const allCards = gameContext.currentPlayer.table.concat(gameContext.oppositePlayer.table);

        allCards.forEach(card => {
            if (isDuck(card)) {
                this.giveBeer(card);
            }
        });

        super.attack(gameContext, continuation);
    }

    giveBeer(card) {
        const maxPowerBefore = card.maxPower;
        card.maxPower += 1;
        card.currentPower += 2;

        card.view.signalHeal();
        card.updateView();
    }
}

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
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
