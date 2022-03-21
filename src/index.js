import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
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
    constructor(name, power, img) {
        super(name, power, img);
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()];
    }
}


class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2, null);
    }

    quacks() {
        console.log('quack')
    };

    swims() {
        console.log('float: both;')
    };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name='Пёс-бандит', power=3, image=null) {
        super(name, power, image);
    }
}


class Trasher extends Dog {
    constructor(name='Громила', power=5, image=null) {
        super(name, power, image);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
        });
    }

    getDescriptions() {
        return [getCreatureDescription(this), 'Получает на 1 ед. урона меньше.', super.getDescriptions()[1]];
    }
}



class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6, null);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (let oppositeCard of oppositePlayer.table)
        {
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
            });
            taskQueue.continueWith(continuation);
        }
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
