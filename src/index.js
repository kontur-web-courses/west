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
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
        this.currentPower = maxPower;
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }

    // doBeforeAttacking(gameContext, continuation) {
    //     const taskQueue = new TaskQueue();
    //
    //     taskQueue.push(onDone => this.view.showAttack(onDone));
    //     taskQueue.push(onDone => this.view.hideAttack(onDone));
    //
    //     taskQueue.continueWith(continuation);
    // }
    //
    // doBeforeTakingDamage(damage, fromCard, gameContext, continuation) {
    //     const taskQueue = new TaskQueue();
    //
    //     taskQueue.push(onDone => this.view.showDamage(onDone));
    //     taskQueue.push(onDone => this.view.hideDamage(onDone));
    //
    //     taskQueue.continueWith(continuation);
    // }
}
class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower = 2) {
        super(name, maxPower);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3) {
        super(name, maxPower);
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', maxPower = 5) {
        super(name, maxPower);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }

    getDescriptions() {
        return ['Получает на 1 урон меньше', ...super.getDescriptions()];
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', maxPower = 6) {
        super(name, maxPower);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => {
            this.view.showAttack(onDone);
        });

        for (let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, oppositePlayer.table[position], gameContext, onDone);
            });
        }
        // taskQueue.push(onDone => {
        //     oppositePlayer.table.forEach((card) => {
        //         this.dealDamageToCreature(2, card, gameContext, onDone);
        //     });
        // });

        taskQueue.push(onDone => {
            this.view.hideAttack(onDone);
        });

        taskQueue.continueWith(continuation);
    }
}

// Основа для утки.
// function Duck() {
//     this.quacks = function () { console.log('quack') };
//     this.swims = function () { console.log('float: both;') };
// }


// Основа для собаки.
// function Dog() {
// }


// Колода Шерифа, нижнего игрока.
// const seriffStartDeck = [
//
//     new Card('Мирный житель', 2),
//     new Card('Мирный житель', 2),
//     new Card('Мирный житель', 2),
// ];
const seriffStartDeck = [
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




