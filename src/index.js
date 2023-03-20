import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import Creature from "./Creature.js";

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


class Duck extends Creature{
    constructor() {
        super("Мирная утка", 2);
    }
    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}

class Dog extends Creature{
    constructor() {
        super("Пес-бандит", 3);
    }
}

class Gatling extends Creature {
    constructor() {
        super("Gatling", 6);
        this.currentPower = 2;
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));

        for (let i = 0; i < oppositePlayer.table.length; i++){
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayer.table[i];

                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                } else {
                    onDone();
                }
            })
        }

        taskQueue.continueWith(continuation);
    }
}


const seriffStartDeck = [
    new Duck(),
    new Gatling(),
    new Duck(),
    new Duck(),
];

const banditStartDeck = [
    new Dog(),
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


