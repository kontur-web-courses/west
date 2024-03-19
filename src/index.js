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
    }

    getDescriptions() {
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
        ];
    }
}


// Основа для утки.
/*function Duck() {
    this.quacks = function () { console.log('quack') };
    this.swims = function () { console.log('float: both;') };
}*/
class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
        this.quacks = function () { console.log('quack') };
        this.swims = function () { console.log('float: both;') };
    }
}


// класс Собаки с именем Пес-собака и силой 3
class Dog extends Creature {
    constructor() {
        super('Пес-собака', 3);
    }
}

class Gatling extends Creature{
    constructor() {
        super('Гатлинг', 6, null);
    }
    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        for (let position = 0; position < gameContext.oppositePlayer.table.length; position++){
            const oppositeCard = gameContext.oppositePlayer.table[position];
            if (oppositeCard) {
                taskQueue.push(onDone => this.view.showAttack(onDone));
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                });
            }
        }
        taskQueue.continueWith(continuation);
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Gatling(),
];
const banditStartDeck = [
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
