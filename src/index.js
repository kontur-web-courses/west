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

class Creature extends Card{
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}



// Основа для утки.
class Duck extends Creature{
    constructor(name = "Мирная утка", power = 2) {
        super(name, power);
    }
    quacks = function () { console.log('quack') };
    swims = function () { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

class Trasher extends Dog{
    constructor(name = 'Громила', power = 5) {
        super(name, power);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
        });
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    };

    attack(gameContext, continuation) {
        const {oppositePlayer} = gameContext;
        const oppositeCardList = oppositePlayer.table;
        const taskQueue = new TaskQueue();
        for (let oppositeCard of oppositeCardList) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {

                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                }

            });
        }

        taskQueue.continueWith(continuation);
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
