import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card{
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions(){
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка',maxPower = 2, image = 'sheriff.png') {
        super(name, maxPower, image);
    };

    quacks = function () { console.log('quack') };
    swims = function () { console.log('float: both;') };
}

class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3, image = 'bandit.png') {
        super(name, maxPower, image);
    };
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6, 'gatling.jpg');
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        for(let position = 0; position < oppositePlayer.table.length; position++) {
            const card = oppositePlayer.table[position];
            if (card) {
                taskQueue.push(onDone => this.view.showAttack(onDone));
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                });
            }
        }
        taskQueue.continueWith(continuation);
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', maxPower = 5, image = 'trasher.png') {
        super(name, maxPower, image);
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
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

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    else if (isDuck(card)) {
        return 'Утка';
    }
    else if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Gatling(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog(),
    new Dog(),
    new Dog(),
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
