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
        return [getCreatureDescription(this), ...super.getDescriptions(this)];
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
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(Math.max(value - 1, 0));
        });
    }

    getDescriptions() {
        return [...super.getDescriptions(this), 'Получает на 1 урона меньше'];
    }

}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    getDescriptions() {
        return [...super.getDescriptions(this), 'Наносит 2 урона всем существам противника'];
    }

    attack(gameContext, continuation) {
        const cards = gameContext.oppositePlayer.table;
        const { currentPlayer, oppositePlayer, position, updateView } = gameContext;

        const taskQueue = new TaskQueue();
        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (let card of cards) {
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, card, gameContext, onDone);
            });
        }

        taskQueue.continueWith(continuation);
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
        let ladCount = this.getInGameCount();
        return ladCount * (ladCount + 1) / 2;
    }

    getDescriptions() {
        let descriptions = [...super.getDescriptions(this)];
        if(['modifyDealedDamageToCreature', 'modifyTakenDamage'].every(i => Lad.prototype.hasOwnProperty(i)))
        {
            descriptions.push('Чем их больше, тем они сильнее');
        }
        return descriptions;
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(Math.max(value - Lad.getBonus(), 0));
        });
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new Lad(),
    new Lad()
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
