import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    constructor(...args) {
        super(...args);
    }

    getDescriptions() {
        const firstLine = getCreatureDescription(this);
        const secondLine = super.getDescriptions(this);
        return [firstLine, secondLine]
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
    quacks() {
        console.log('quack')
    };

    swims() {
        console.log('float: both;')
    };

    constructor() {
        super("Мирная утка", 2);
    }
}


// Основа для собаки.
class Dog extends Creature {
    constructor(...args) {
        if (args.length !== 0){
            super(...args);
            return;
        }
        super("Пес-бандит", 3);
    }
}

class Lad extends Dog{
    constructor() {
        super("Браток", 2);
    }
    attack (gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        let count = 0;
        for (const neighbourCard of currentPlayer.table){
            if (neighbourCard.name === "Браток"){
                count += 1;
            }
        }

        const addDamage = (count + 1 ) / 2 * count

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCard = oppositePlayer.table[position];

            if (oppositeCard) {
                this.dealDamageToCreature(this.currentPower + addDamage, oppositeCard, gameContext, onDone);
            } else {
                this.dealDamageToPlayer(1 + addDamage, gameContext, onDone);
            }
        });

        taskQueue.continueWith(continuation);
    };


    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        let count = 0;
        for (const neighbourCard of currentPlayer.table){
            if (neighbourCard.name === "Браток"){
                count += 1;
            }
        }

        const addDamage = (count + 1 ) / 2 * count
        super.modifyTakenDamage(Math.max(value - addDamage, 0), fromCard, gameContext, continuation)
    }
}

class Trasher extends Dog {
    constructor() {
        super("Громила", 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(Math.max(value - 1, 0), fromCard, gameContext, continuation)
    }

}

class Gatling extends Creature{
    constructor() {
        super("Гатлинг", 6);
    }
    attack (gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            for (const oppositeCard of oppositePlayer.table) {
                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                } else {
                    this.dealDamageToPlayer(1, gameContext, onDone);
                }
            }
        });

        taskQueue.continueWith(continuation);
    };
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling()
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Trasher(),
    new Dog(),
    new Lad(),
    new Lad(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});