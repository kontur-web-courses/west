import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import card from "./Card.js";

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
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions(){
        return [getCreatureDescription(this), super.getDescriptions()];
    }
}



// Основа для утки.
class Duck extends Creature {
    constructor(name='Мирная утка', power=2) {
        super(name, power);
    }

    quacks() {
        return 'quack';
    }

    swims() {
        return 'float: both;';
    }
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name='Пес-бандит', power=3) {
        super(name, power);
    }
}


class Trasher extends Dog {
    constructor() {
        super('TRASHER', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(1));
    };

    getDescriptions() {
        let res = super.getDescriptions();
        res.push("Get only 1 damage");
        return res;
    }
}

class Gatling extends Creature {
    constructor(name='Гатлинг', power=6) {
        super(name, power);
    }

    attack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const taskQueue = new TaskQueue();
        for (let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayer.table[position];
                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                } else {
                    this.dealDamageToPlayer(1, gameContext, onDone);
                }
            });
        }
        taskQueue.continueWith(continuation);
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck()
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
