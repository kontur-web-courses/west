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
    constructor(name, health) {
        super(name, health);
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}

class Gatling extends Creature {
    constructor(name='Гатлинг', health=6) {
        super(name, health);
    };

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCardList = oppositePlayer.table;
            for (let oppositeCard of oppositeCardList) {
                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                } else {
                    this.dealDamageToPlayer(1, gameContext, onDone);
                }
            }
        });

        taskQueue.continueWith(continuation);
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка', health = 2) {
        super(name, health);
    }

    quacks() {
        console.log('quack')
    };

    swims() {
        console.log('float: both;')
    };
}


class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', health = 5) {
        super(name, health);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
    }
}

const seriffStartDeck = [
    new Duck(),
    new Gatling(),
    new Duck(),
];
const banditStartDeck = [
    new Dog(),
    new Trasher(),
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


