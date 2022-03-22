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

class Creature extends Card{
    constructor(name, health) {
        super(name, health);
    }

    getDescriptions(){
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}

class Gatling extends Creature{
    constructor() {
        super('Гатлинг', 6);
    };

    attack(gameContext) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCardList = oppositePlayer.table;
            for (let oppositeCard of oppositeCardList){
                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCardList, gameContext, onDone);
                } else {
                    this.dealDamageToPlayer(1, gameContext, onDone);
                }
            }
        });

        taskQueue.continueWith(continuation);
    }
}

class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }

    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}


class Dog extends Creature {
    constructor(name='Пес-бандит', power=3) {
        super(name, power);
    }
}

class Trasher extends Dog{
    constructor() {
        super('Громила', 5);
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
    }
}

const seriffStartDeck = [
    new Gatling(),
    new Duck(),
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


