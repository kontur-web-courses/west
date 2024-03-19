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

function isTrasher(card) {
    return card instanceof Trasher;
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
    if (isTrasher(card)){
        return "Громила";
    }

    return 'Существо';
}

class Creature extends Card {
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions() {
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
        ];
    }
}


// Основа для утки.
class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }
    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}




// Основа для собаки.
class Dog extends Creature {
    constructor(name='Пес-бандит', power=3) {
        super(name, power);
    }
}

class Trasher extends Dog {
    constructor() {
        super();
        Card.call(this, "Громила", 5);
    }

    modifyTakenDamage (value, fromCard, gameContext, continuation) {
        this.view.signalAbility( () => continuation(value - 1));
    }

    getDescriptions() {
        return [
            getCreatureDescription(this),
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
        const enemyCards = gameContext.oppositePlayer.table;
        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (let i = 0; i < enemyCards.length; i++) {
            taskQueue.push(onDone => {
                const oppositeCard = enemyCards[i];

                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                }
            });
        }
        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    static inGameCount;

    constructor() {
        super("Браток", 2);
    }

    static getInGameCount() { return this.inGameCount || 0; }

    static setInGameCount(value) { this.inGameCount = value; }

    doAfterComingIntoPlay (gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }

    doBeforeRemoving (continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }

    static getBonus() {
        const count = this.getInGameCount();
        return count * (count + 1) / 2;
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - Lad.getBonus());
    }

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
            Lad.prototype.hasOwnProperty('modifyTakenDamage')){
            return [
                "Чем их больше, тем они сильнее",
                ...super.getDescriptions()
            ];
        }
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
        ];
    }

}


class PseudoDuck extends Dog{
    constructor() {
        super("Псевдоутка", 3);
    }

    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
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
