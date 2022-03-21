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
    getDescriptions() {
        let first = getCreatureDescription(this);
        let second = super.getDescriptions();
        return [first, ...second];
    }
}

class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both');
    }
}

class Dog extends Creature {
    constructor(...params) {
        if (params.length != 0)
            super(params[0], params[1], params.length==3 ? params[2] : undefined)
        else
            super('Пес-бандит', 3);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5)
        // super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        if (value >= 1) {
            this.view.signalAbility(() => continuation(value - 1));
        }
    }

    getDescriptions() {
        let info = super.getDescriptions();

        return ['Уменьшает входящий урон на 1', ...info];
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const cards = oppositePlayer.table;
        for (const card of cards){
            taskQueue.push(onDone => {this.view.showAttack(onDone);
                this.dealDamageToCreature(this.currentPower, card, gameContext, onDone);});
        }
        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog{
    constructor() {
        super('Браток', 2);
        //this.setInGameCount(this.getInGameCount() + 1)
    }
    static getInGameCount() { return this.inGameCount || 0; }
    static setInGameCount(value) { this.inGameCount = value; }
    static getBonus() {return this.getInGameCount() * (this.getInGameCount() + 1) / 2; }
    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        continuation();
    };
    //
    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        if (value >= 1) {
            this.view.signalAbility(() => continuation(value - Lad.getBonus()));
        }
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation){
        continuation(value + Lad.getBonus());
    }
}


// Колода Шерифа, нижнего игрока.
// const seriffStartDeck = [
//     new Card('Мирный житель', 2),
//     new Card('Мирный житель', 2),
//     new Card('Мирный житель', 2),
// ];
//
// // Колода Бандита, верхнего игрока.
// const banditStartDeck = [
//     new Card('Бандит', 3),
// ];

// const seriffStartDeck = [
//     new Duck(),
//     new Duck(),
//     new Duck(),
// ];
// const banditStartDeck = [
//     new Dog(),
// ];

// const seriffStartDeck = [
//     new Duck(),
//     new Duck(),
//     new Duck(),
//         new Gatling()
// ];
// const banditStartDeck = [
//     new Trasher(),
//         new Dog(),
//         new Dog()
// ];

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];
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
