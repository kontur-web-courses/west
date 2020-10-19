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
    constructor(name, maxPower, image){
        super(name, maxPower, image);
    }
    
    getDescriptions() {    
        return [
            getCreatureDescription(this),
            super.getDescriptions()
        ]
    }
}


// Основа для утки.
class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower = 2, image){
        super(name, maxPower, image);
    }

    quacks = function () { console.log('quack') };
    swims = function () { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3, image){
        super(name, maxPower, image);
    }
}

class Trasher extends Dog {
    constructor(){
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value-1);
    };

    getDescriptions() {
        let arr = super.getDescriptions();
        arr.shift();
        arr.unshift('Получает на 1 меньше урона');
        return arr;
    }

}

class Gatling extends Creature {
    constructor(){
        super('Гатлинг', 6)
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for(let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => {
                const card = oppositePlayer.table[position];
                if (card) {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                } else {
                    onDone();
                }
            });
        }

        taskQueue.continueWith(continuation);
    };

    getDescriptions() {
        let arr = super.getDescriptions();
        arr.shift();
        arr.unshift('Наносит урон всем врагам');
        return arr;
    }
}

class Lad extends Dog {
    constructor() {
        super('Браток', 2);
    }

    static getInGameCount() { return this.inGameCount || 0; }
    static setInGameCount(value) { this.inGameCount = value; }
    static getBonus() { return (this.getInGameCount() * (this.getInGameCount() + 1)) / 2};

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - Lad.getBonus());
    };

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());
    };
    
    doAfterComingIntoPlay (gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    };

    doBeforeRemoving (continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    };

    getDescriptions() {
        let arr = super.getDescriptions();
        arr.shift();
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') 
        && Lad.prototype.hasOwnProperty('modifyTakenDamage'))
            arr.unshift('Чем их больше, тем они сильнее');
        return arr;
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Lad(),
    new Lad(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(2);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
