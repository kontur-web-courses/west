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
    constructor(name,maxPower,image) {
        super(name,maxPower,image);
    }
    getDescriptions(){
        return [getCreatureDescription(this),super.getDescriptions()];
    }
}

// Основа для утки.
class Duck extends Creature{
    constructor(name,maxPower,image) {
        super(name || 'Мирная утка', maxPower || 2, image);
    }
    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature{
    constructor(name,maxPower,image) {
        super(name || 'Пес-бандит', maxPower || 2, image);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила',5);
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - 1);
        this.view.signalAbility(() => {value - 1})
    }
}

class Gatling extends Creature{
    constructor() {
        super('Гатлинг',6);
    }
    attack(gameContext, continuation){
        const taskQueue = new TaskQueue();
        for(let position = 0; position < gameContext.oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCard = gameContext.oppositePlayer.table[position];
                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                }
            });
        }
        taskQueue.continueWith(continuation);

    }
}

class Lad extends Dog{
    constructor() {
        super('Браток',2);
    }
    static getInGameCount(){return this.inGameCount || 0;}
    static setInGameCount(value) { this.inGameCount = value; }


}
// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Trasher(),
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
