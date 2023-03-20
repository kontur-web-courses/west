import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card{
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions(){
        return [getCreatureDescription(this), super.getDescriptions()];
    }
}

class Duck extends Creature{
    constructor() {
        super("Мирная утка", 2);
    }

    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}

class Dog extends Creature{
    constructor(name="Пес-бандит", power=3) {
        super(name, power);
    }
}

class Lad extends Dog{
    static inGameCount;
    constructor() {
        super("Братки", 2);
    }
    static getInGameCount() { return this.inGameCount || 0; }
    static setInGameCount(value) { this.inGameCount = value; }

    static getBonus() {
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }

    doAfterComingIntoPlay(gameContext, continuation){
        Lad.setInGameCount(Lad.inGameCount + 1);
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        continuation();
    }
    doBeforeRemoving(continuation){
        Lad.setInGameCount(Lad.inGameCount - 1);
        continuation();
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation){
        continuation(Lad.getBonus() + value);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        continuation(value - Lad.getBonus());
    }
}

class Trasher extends Dog{
    constructor() {
        super("Громила", 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        if (value > 1){
            this.view.signalAbility(() => {
                continuation(value - 1)
            });
        }
    }
}
class Gatling extends Creature {
    constructor() {
        super("Гатлинг", 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        for (let position = 0; position < gameContext.oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => {
                const card = gameContext.oppositePlayer.table[position];
                if (card) {
                    this.view.showAttack(onDone);
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                } else {
                    onDone();
                }
            });
        }

        taskQueue.continueWith(continuation);
    }
}


// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
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
    if (card instanceof Lad){
        return "Чем их больше - тем они сильнее";
    }
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (card instanceof Trasher){
        return 'Громилдыч';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    if (isGatling(card)) {
        return 'Гатлинг';
    }
    return 'Существо';
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Gatling()
];
const banditStartDeck = [
    new Lad(),
    new Lad(),
    new Lad(),
    new Lad(),
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
