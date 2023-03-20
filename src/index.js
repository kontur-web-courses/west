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

class Duck extends Creature {
    constructor() {
        super("Мирная утка", 2);
    }

    quacks() {
        console.log('quack')
    };

    swims() {
        console.log('float: both;')
    };
}

class Dog extends Creature {
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

        for (let i = 0; i < oppositePlayer.table.length; i++){
            taskQueue.push(onDone => this.view.showAttack(onDone));
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

class Trasher extends Dog{
    constructor() {
        super();
        this.name = "Громила";
        this.maxPower = 5;
        this.currentPower = 5;

    }
    modifyTakenDamage(value, fromCard, gameContext, continuation){
        super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
    }
}


class Lad extends Dog {
    constructor() {
        super();
        this.name = "Браток";
        this.maxPower = 2;
        this.currentPower = 2;
    }

    static count;
    static inGameCount = 0;

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.count++;
        Lad.setInGameCount(Lad.count);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation) {
        Lad.count--;
        Lad.setInGameCount(Lad.count);
        super.doBeforeRemoving(continuation);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation);
    };

    static getBonus() {
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }


    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }
}


const seriffStartDeck = [
    new Duck(),
    new Gatling(),
    new Duck(),
    new Duck(),
];

const banditStartDeck = [
    new Trasher(),
    new Dog(),
    new Lad()
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});

