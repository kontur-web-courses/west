import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
export function getCreatureDescription(card) {
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



// Основа для утки.
class Duck extends Creature {
    constructor() {
        super('Duck', 2, 'sheriff.png');
    }
    quacks = function () { console.log('quack') };
    swims = function () { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor() {
        super('Dog', 3, 'bandit.png');
    }
}

class Gatling extends Card {
    constructor() {
        super('Dog', 6, 'gatling.png');
        this.currentPower = 2;
        this.attack = function (gameContext, continuation) {
            const taskQueue = new TaskQueue();

            const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCards = oppositePlayer.table;

                if (oppositeCards.length) {
                    for (let oppositeCard of oppositeCards)
                        if (oppositeCard)
                            this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                } else {
                    this.dealDamageToPlayer(1, gameContext, onDone);
                }
            });

            taskQueue.continueWith(continuation);
        }
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck('Мирный житель', 2),
    new Duck('Мирный житель', 2),
    new Duck('Мирный житель', 2),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog('Бандит', 3),
    new Gatling('Гатлинг', 2),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
