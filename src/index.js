import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

function isDuck(card) {
    return card instanceof Duck;
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
        let result = [getCreatureDescription(this)]
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor(name = 'Мирный житель', maxPower = 2) {
        super(name, maxPower);
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Бандит', maxPower = 3) {
        super(name, maxPower);
    }
}

class Trasher extends Dog{
    constructor(name='Громила', maxPower=5){
        super(name, maxPower);
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => super.modifyTakenDamage(value-1, fromCard, gameContext, continuation));
    }
    getDescriptions(){
        return ['Он получает на 1 меньше урона', ...super.getDescriptions()];
    }
    //this.view.signalAbility(() => { // то, что надо сделать сразу после мигания. }
}

class Gatling extends Creature{
    constructor(name='Гатлинг', maxPower=6){
        super(name, maxPower);
    }
    attack(gameContext, continuation){
        const taskQueue = new TaskQueue();
        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (const enemy of game.oppositePlayer.table) {
            taskQueue.push(onDone => {this.dealDamageToCreature(this.currentPower, enemy, gameContext, onDone);});
        }
        taskQueue.continueWith(continuation);
    };
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
//console.log(isDuck(seriffStartDeck[0]))


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
