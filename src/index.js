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
        super('Мирный житель', 2);
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

        for(let oppositeCard in oppositePlayer){
            if(oppositeCard){
                taskQueue.push(onDone => this.view.showAttack(onDone));
                taskQueue.push(onDone => {
                        this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                });
            }
        }

        taskQueue.continueWith(continuation);
    }
}


// Основа для собаки.
class Dog extends Creature{
    constructor(){
        super('Бандит', 3);
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Gatling()
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog(),
    new Dog(),
    new Dog(),
    new Dog(),
    
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(2);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
