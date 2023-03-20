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
    constructor(name, maxPower) {
        super(name, maxPower);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()]
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower = 2) {
        super(name, maxPower);
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }
}

class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3) {
        super(name, maxPower);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        if (value === 2) {
            this.view.signalAbility(() => {
                this.updateView()
            });
        }
        continuation(value - 1);
    }

    getDescriptions() {
        return [...super.getDescriptions(), 'Получает на 1 меньше урона'];
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        
        if (oppositePlayer.table.length > 0) {
            for (const oppositeCard of oppositePlayer.table) {
                taskQueue.push(onDone => this.view.showAttack(onDone));
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone)
                });
            }
        } else {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {this.dealDamageToPlayer(2, gameContext, onDone)});
        }
        taskQueue.continueWith(continuation);
    };
}

// const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
// if(oppositePlayer.table.length > 0) {
//     for (const oppositeCard of oppositePlayer.table) {
//         taskQueue.push(onDone => this.view.showAttack(onDone));
//         taskQueue.push(onDone => {
//             this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone)});
//     }
// } else {
//     this.dealDamageToPlayer(1, gameContext, onDone);
// }
// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Dog(),
    new Dog(),
    new Dog()
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Gatling()
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
