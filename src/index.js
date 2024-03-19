import Card from './Card.js';
import Game from './Game.js';
import SpeedRate from './SpeedRate.js';
import TaskQueue from './TaskQueue.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
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
    if (isGatling(card)) {
        return 'Гатлинг';
    }

    return 'Существо';
}

class Creature extends Card {
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions(this)];
    }
}

class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }

    quacks() {
        console.log('quack');
    };

    swims() {
        console.log('float: both;');
    };
}

class Dog extends Creature {
    constructor() {
        super('Пес-бандит', 3);
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    modifyDealedDamageToPlayer(value, gameContext, continuation) {
        continuation(0);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const oppositeTable = gameContext.oppositePlayer.table;

        for (let position = 0; position < oppositeTable.length; position++) {
            taskQueue.push(onDone => {
                const oppositeCard = oppositeTable[position];

                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                }
            });
        }

        taskQueue.continueWith(continuation);
    }
}

class Trasher extends Dog{
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        const reducedValue = value - 1; // Уменьшаем урон на 1

        this.view.signalAbility(() => {
            super.modifyTakenDamage(reducedValue, fromCard, gameContext, continuation);
        });
    }

    getDescriptions(){
        let a = super.getDescriptions();
        a.push("Обезьяна");
        return a;
    }
}

class Lad extends Dog {
    static inGameCount = 0;
    constructor() {
        super('Братки', 2);
    }

    static getInGameCount() {
        return Lad.inGameCount;
    }

    static setInGameCount(value) {
        Lad.inGameCount = value;
    }

    doAfterComingIntoPlay(gameContext, continuation){
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(gameContext, continuation){
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(gameContext, continuation);
    }

    static getBonus() {
        // количество * (количество + 1) / 2
        return this.inGameCount * (this.inGameCount + 1) / 2;
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation){
        value = value - Lad.getBonus();
        super.modifyDealedDamageToCreature(value >= 0 ? value : 0, toCard, gameContext, continuation);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        value = value + Lad.getBonus();
        super.modifyTakenDamage(value, fromCard, gameContext, continuation);
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
