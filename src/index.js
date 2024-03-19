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
    constructor(...props) {
        super(...props);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
    };

    quacks() {
        console.log('quack');
    };

    swims() {
        console.log('float: both;');
    };
}

class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    };
}

class Trasher extends Dog {
    constructor(name = 'Громила', power = 5) {
        super(name, power);
    };

    getDescriptions() {
        return ['Громила получает на 1 меньше урона', ...super.getDescriptions()];
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
        });
    };
}


class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    }

    attack(context, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = context;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (const oppositeCard of oppositePlayer.table) {
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, oppositeCard, context, onDone);
            });
        }

        taskQueue.continueWith(continuation);
    }
}

// Колода Шерифа, нижнего игрока.
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
