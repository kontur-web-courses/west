import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';


class Creature extends Card {
    constructor(...args) {
        super(...args);
    }

    getDescriptions = () => {
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
        ]
    }
}


class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 2);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCards = oppositePlayer.table;
            for (let oppositeCard of oppositeCards) {
                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                }
            }
        });

        taskQueue.continueWith(continuation);
    };
}



class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }
}

class Dog extends Creature {
    constructor(name='Пес-бандит') {
        super(name, 3);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила');
    }

    modifyTakenDamage (value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(Math.max(0, value - 1), fromCard, gameContext, continuation);
        })

    };

    getDescriptions() {
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
        ]
    }
}


// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
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
    if (isTrasher()) {
        return 'Громила'
    }
    return 'Существо';
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
];
const banditStartDeck = [
    new Trasher(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
