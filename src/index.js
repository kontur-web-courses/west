import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    constructor(name, maxPower) {
        super(name, maxPower);
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()];
    }
}


class Dog extends Creature{
    constructor(name = 'Пес-бандит', maxPower = 3) {
        super(name, maxPower);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => {continuation(value - 1)});
        //continuation(value - 1);
    }
}

class Duck extends Creature{
    constructor(name = 'Мирная утка', maxPower = 2) {
        super(name, maxPower);
    }
}

class Gatling extends Duck{
    constructor() {
        super('Гатлинг', 6);
    }
    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        //const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        let enemies = gameContext.oppositePlayer.table;
        for (let i = 0; i < enemies.length; i++) {

            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCard = enemies[i];

                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                }
            });

            enemies = gameContext.oppositePlayer.table;
        }

        taskQueue.continueWith(continuation);
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
function Duck() {
    this.quacks = function () { console.log('quack') };
    this.swims = function () { console.log('float: both;') };
}


// Основа для собаки.
function Dog() {
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Gatling(),
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
