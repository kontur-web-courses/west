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
    getDescriptions(){
        return [
            getCreatureDescription(this), 
            super.getDescriptions()
        ];
    }
}



// Основа для утки.
class Duck extends Creature {
    constructor(){
        super('Мирная утка', 2);
    }
  
    quacks() { console.log('quack') }
    swims() { console.log('float: both;') }
}

class Gatling extends Creature{
    constructor(){
        super('Гатлиг', 6);
    }

    attack(gameContext, continuation){
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        for(let oppositeCard of oppositePlayer){
            if(oppositeCard){
                taskQueue.push(onDone => this.view.showAttack(onDone));
                taskQueue.push(onDone => {
                        this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                });
                setTimeout(() => {}, 1000);
            }
        }

        taskQueue.continueWith(continuation);
    }
}


// Основа для собаки.
class Dog extends Creature{
    constructor(){
        super('Собака', 3);
    }
}
class Trasher extends Dog{
    constructor(){
        super();
        this.maxPower = 5;
        this.name = 'Громила';
    }
    getDescriptions(){
        return [
            "Получает на 1 меньше урона", super.getDescriptions()
        ];
    };
    
}
Trasher.prototype.modifyTakenDamage = function (value, fromCard, gameContext, continuation) {
    if (value === 1)
        this.view.signalAbility(() => { continuation(value - 1); });
    else
    {
        this.view.signalAbility(() => {continuation(value - 1)})
    }

};

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Gatling(),
    new Duck()
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    // new Dog(),
    // new Dog(),
    // new Dog(),
    // new Dog(),
    
    new Trasher()
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(2);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
