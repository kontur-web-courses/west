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

function isTrasher(card) {
    return card instanceof Trasher;
}

function isGatling(card) {
    return card instanceof Gatling;
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
    if (isTrasher(card)) {
        return 'Громила';
    }
    if (isGatling(card)) {
        return 'Гатлинг';
    }
    return 'Существо';
}


class Creature extends Card {
    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor(){
        super('Мирная утка', 2, 'duck.jpg');
    }
    quacks () { console.log('quack'); };
    swims () { console.log('float: both;'); };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', volume = 3, pic = 'dog.jpg') {
        super(name, volume, pic);
    }
}


class Trasher extends Dog {
    constructor() {
        super('Громила', 5, 'dog.jpg');
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() =>  continuation(value - 1));
    }
    
    getDescriptions() {
        return ['Получаю на 1 урон меньше',...super.getDescriptions()];
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6, 'gatling_gun.jpg'); // Image taken from https://commons.wikimedia.org/wiki/File:Gatling_gun.jpg. Uploaded by WojciechSwiderski.
    }
    attack(gameContext, continuation) {
        let oppositeTable = gameContext.oppositePlayer.table;
        
        const taskQueue = new TaskQueue();

        taskQueue.push(onDone => {this.view.showAttack(onDone)});
        for(let position = 0; position < oppositeTable.length; position++) {
            taskQueue.push(onDone => {
                const card = oppositeTable[position];
                if (card) {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                } else {
                    onDone();
                }
            });
        }

        taskQueue.continueWith(continuation);
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Gatling(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
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
