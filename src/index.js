import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card{
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions(){
        return [getCreatureDescription(this), super.getDescriptions()];
    }
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
        super("Гатлинг", 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        for (let position = 0; position < gameContext.oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => {
                const card = gameContext.oppositePlayer.table[position];
                if (card) {
                    this.view.showAttack(onDone);
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                } else {
                    onDone();
                }
            });
        }

        taskQueue.continueWith(continuation);
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

function isGatling(card) {
    return card instanceof Gatling;
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
    if (isGatling(card)) {
        return 'Гатлинг';
    }
    return 'Существо';
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Gatling()
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog(),
    new Dog(),
    new Dog(),
    new Dog(),
    new Dog()
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
