import Card from "./Card.js";
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

function getCreatureDescription(card) {
    return 'Существо';
}

class Creature extends Card {
    constructor(name, power, image) {
        super(name, power, image);
    }

    getDescriptions(){
        return [
            getCreatureDescription(this),
            super.getDescriptions()
        ];
    }
}

class Duck extends Creature {
    constructor(image=null) {
        super('Мирная утка', 2, image);
    }

    quacks () { console.log('quack'); }
    swims () { console.log('float: both;'); }    
}

<<<<<<< HEAD
class Dog extends Creature {
    constructor(image=null) {
        super('Пес-бандит', 3, image);
    }
}
    // // Основа для утки.
// function Duck() {
//     this. = function () { console.log('quack') };
//     this.swims = function () { console.log('float: both;') };
// }


// // Основа для собаки.
// function Dog() {
// }
=======
class Dog extends Card {
    constructor(name='Пес-бандит', power=3, image=null) {
        super(name, power, image);
    }
}

class Trasher extends Dog {
    constructor(name='Громила', power=5, image=null) {
        super(name, power, image);
        this.modifyTakenDamage = function (value, fromCard, gameContext, continuation) {
            this.view.signalAbility(() => {continuation(value - 1);});
        }
    }
}

// Колода Шерифа, нижнего игрока.
>>>>>>> c4c4abb0f1add763b4b7555f93f6a6e94d69b049
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck()
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});