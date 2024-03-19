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
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

class Duck extends Creature {
    constructor(name='Мирная утка', maxPower=2) {
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
    constructor (name='Пес-бандит', maxPower=3) {
        super(name, maxPower);
    }
}

class Trasher extends Dog {
    constructor(name='Громила', maxPower=3) {
        super(name, maxPower);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
        })
    }

    getDescriptions() {
        return ['Получает на 1 меньше урона', ...super.getDescriptions()];
    }
}

class Gatling extends Creature {
    constructor (name='Гатлинг', maxPower=6) {
        super(name, maxPower);
    }


    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const opponentCards = oppositePlayer.table;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (const card of opponentCards) {
            taskQueue.push(onDone => {
                this.dealDamageToCreature(this.currentPower, card, gameContext, onDone);
            });
        }
        taskQueue.continueWith(continuation);
    }
}


class Lad extends Dog {
    constructor(name='Браток', maxPower=2) {
        super(name, maxPower);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    };

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(continuation);
    };

    static getBonus() {
        const count = this.getInGameCount();
        return count * (count + 1) * 1.0 / 2;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation);
    };

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation);
    };

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')) {
            return ['Чем их больше, тем они сильнее', ...super.getDescriptions()];
        }
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
