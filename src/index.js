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
    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()];
    }
}
// Основа для утки.
class Duck extends Creature {
    constructor(name='Мирная утка', maxPower=2) {
        super(name, maxPower);
        this.name = name;
        this.maxPower = maxPower;
    }
    quacks() { console.log('quack'); }
    swims() { console.log('float: both;'); }
}
// Основа для собаки.
class Dog extends Creature {
    constructor(name='Пес-бандит', maxPower=3) {
        super(name, maxPower);
        this.name = name;
        this.maxPower = maxPower;
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', maxPower = 5) {
        super(name, maxPower);
        this.name = name;
        this.maxPower = maxPower;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => { continuation(value - 1); });
    }

    getDescriptions() {
        return [
            "Если Громилу атакуют, то он получает на 1 меньше урона",
            super.getDescriptions(),
        ];
    }
}

class Gatling extends Creature {
    constructor(name='Гатлинг', maxPower=6) {
        super(name, maxPower);
        this.name = name;
        this.maxPower = maxPower;
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (const oppositePlayer of gameContext.oppositePlayer.table) {
            taskQueue.push((onDone) => {
                this.dealDamageToCreature(2, oppositePlayer, gameContext, onDone);
            });
        }
        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor(name='Братки', maxPower=2) {
        super(name, maxPower);
        this.name = name;
        this.maxPower = maxPower;

    }
    static getInGameCount () { return this.inGameCount || 0; }

    static setInGameCount (value) { this.inGameCount = value; }

    static getBonus () { return this.inGameCount * (this.inGameCount + 1) / 2; }

    doAfterComingIntoPlay (gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }

    doBeforeRemoving (continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }

    modifyDealedDamageToCreature (value, toCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value + Lad.getBonus()));
    }

    modifyTakenDamage (value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - Lad.getBonus()));
    }

    getDescriptions () {
        const hasProperties =
            Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') || Lad.prototype.hasOwnProperty('modifyTakenDamage');
        return [
            hasProperties ? 'Чем их больше, тем они сильнее' : '', super.getDescriptions()];
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Gatling(),

];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
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
