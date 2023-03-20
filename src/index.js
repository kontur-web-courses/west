import Card from './Card.js';
import Game from './Game.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    constructor(name, power) {
        super(name, power)
    }

    getDescriptions() {
       return [
           getCreatureDescription(this), 
           ...super.getDescriptions()
        ]
    }
}

function isDuck(card) {
    return card instanceof Duck;
}

function isDog(card) {
    return card instanceof Dog;
}

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

// Основа для утки.
class Duck extends Creature {
    constructor(name, power) {
        super(name || 'Мирная утка', power || 2);
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
    constructor(name, power) {
        super(name || 'Пес-бандит', power || 3);
    }
}

<<<<<<< HEAD
class Gatling extends Creature {
    constructor(name, power) {
        super(name || 'Гатлинг', power || 6)
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        gameContext.oppositePlayer.table.forEach(x => {
            taskQueue.push(x => this.view.showAttack(x));
            taskQueue.push(x => this.dealDamageToCreature(2, x, gameContext, x));
        });
        taskQueue.continueWith(continuation);
    }
}

=======
class Trasher extends Dog {
    constructor(name, power) {
        super(name || 'Громила', power || 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(--value);
        });
    }

    getDescriptions() {
        const description = super.getDescriptions();
        description.unshift("Получает на 1 ед. меньше урона");
        return description;
    }
}
>>>>>>> origin/master

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
<<<<<<< HEAD
    new Gatling(),
=======
    new Duck(),
    new Duck(),
    new Duck(),
>>>>>>> origin/master
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
<<<<<<< HEAD
    new Dog(),
    new Dog(),
=======
    new Trasher(),
>>>>>>> origin/master
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});

