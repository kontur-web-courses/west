import Creature from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Duck extends Card{
    constructor(name = 'Мирная Утка', power = 2, image){
        super(name, power, image);
    };

    quacks() {
        console.log('quack') ;
    };

    swims() {
        console.log('float: both;') ;
    };

}

class Dog extends Card{
    constructor(name = 'Пес-бандит', power = 3, image){
        super(name, power, image);
    }
}

class Thrasher extends Dog{
    constructor(name = 'Громила', power = 5, image){
        super(name, power, image);
    }

    modifyTakenDamage = function (value, fromCard, gameContext, continuation) {
        continuation(value - 1);
    };
}

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



// // Основа для утки.
// function Duck() {
//     this.quacks = function () { console.log('quack') };
//     this.swims = function () { console.log('float: both;') };
// }
//
//
// // Основа для собаки.
// function Dog() {
// }


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck('peaceful.png'),
    new Duck('peaceful.png'),
    new Duck('peaceful.png'),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog('banditDog.png'),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
