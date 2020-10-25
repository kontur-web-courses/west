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

// Отвечает является ли карта собакой.
function isTrasher(card) {
    return card instanceof Trasher;
}

// Отвечает является ли карта Гатлингом.
function isGatling(card) {
    return card instanceof Gatling;
}

// Отвечает является ли карта братком>.
function isLad(card) {
    return card instanceof Lad;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isTrasher(card)) {
        return 'Громила';
    }
    if (isGatling(card)) {
        return 'Гатлинг';
    }
    if (isLad(card)) {
        return 'Браток';
    }
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
    constructor() {
        super('Мирная утка', 2);
    }
    quacks() {
        console.log('quack');
    }
    swims() { console.log('float: both;'); }
}

// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3) {
        super(name, maxPower);
    }
}

// Основа для громилы
class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    }
    getDescriptions() {
        return ['Получает на 1 урон меньше', getCreatureDescription(this), super.getDescriptions()[1]];
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }
    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        const cards = gameContext.oppositePlayer.table;
        for (const card of cards) {
            taskQueue.push(onDone => {
                const oppositeCard = card;

                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                } else {
                    this.dealDamageToPlayer(1, gameContext, onDone);
                }
            });
        }
        taskQueue.continueWith(continuation);
    };
}

//Основа для Братка
class Lad extends Dog {
    //static inGameCount;
    static getInGameCount() { return this.inGameCount || 0; }
    static setInGameCount(value) { this.inGameCount = value; }

    constructor() {
        super('Браток', 2);
        Lad.setInGameCount(0);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.inGameCount++;
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.inGameCount--;
        continuation();
    }

    static getBonus() {
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - Lad.getBonus());
        });
    }
    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());
    }

    getDescriptions() {
        if(Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature'))
            return ['Чем их больше, тем они сильнее', getCreatureDescription(this), super.getDescriptions()[1]];
        return super.getDescriptions();
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
     new Duck(),
     new Duck(),
     new Duck(),
];

// Колода Бандита, верхнего игрока.
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
