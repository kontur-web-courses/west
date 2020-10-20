import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return !!(card && card.quacks && card.swims);
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

function isTrasher(card) {
    return card instanceof Trasher;
}

function isGatling(card){
    return card instanceof Gatling;
}

function isLad(card){
    return card instanceof Lad;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isTrasher(card)){
        return 'Громила';
    }

    if (isGatling(card)){
        return 'Гатлинг';
    }

    if (isLad(card)){
        return 'Браток. Чем их больше, тем они сильнее';
    }

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
        return [getCreatureDescription(this),...super.getDescriptions()]
    }

}



class Duck extends Creature {
    constructor(name = "Duck", maxPower = 2, image) {
        super(name, maxPower, image);
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    };

}

class Dog extends Creature {
    constructor(name = "Dog", maxPower = 3, image) {
        super(name, maxPower, image);
    }
}

class Trasher extends Dog {
    constructor(name = "Trasher", maxPower = 5, image) {
        super(name, maxPower, image);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(continuation(value -1))
    }
}

class Gatling extends Creature{
    constructor(name = "Gatling", maxPower = 6, image) {
        super(name, maxPower, image);
    }

    attack(gameContext, continuation){
        const opponentCards = gameContext.oppositePlayer.table
        const taskQueue = new TaskQueue();
        opponentCards.forEach(card=>{
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push((onDone)=>{
                card.dealDamageToCreature(2, card, gameContext, onDone);
            })
            taskQueue.continueWith(continuation);
        })
    }
}


class Lad extends Dog{
    static _count = 0;

    static getBonus(){
        let count = this._count;
        return count * (count + 1) / 2
    }

    static reduceCount(){
        this._count--;
    }

    static increaseCount(){
        this._count++;
    }
    constructor(name = "Lad", maxPower = 2, image) {
        super(name, maxPower, image);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation){
        value = Lad.getBonus();
        continuation(value);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        let new_value = value - Lad.getBonus();
        value = new_value >= 0 ? new_value : 0;
        continuation(value);
    }

    doAfterComingIntoPlay(gameContext, continuation){
        Lad.increaseCount();
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.reduceCount();
        continuation();
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
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
