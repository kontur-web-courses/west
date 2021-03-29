import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    constructor(name, power, image){
        super(name, power, image);
    }

    getDescriptions(){
        return [getCreatureDescription(this), super.getDescriptions()];
    }
}


class Duck extends Creature {
    constructor(image, name = 'Мирная Утка', power = 2){
        super(name, power, image);
    };

    quacks() {
        console.log('quack') ;
    };

    swims() {
        console.log('float: both;') ;
    };
}

class Dog extends Creature {
    constructor(image, name = 'Пес-бандит', power = 3){
        super(name, power, image);
    }
}

class Thrasher extends Dog {
    constructor(image, name = 'Громила', power = 5){
        super(name, power, image);
    }

    modifyTakenDamage = function (value, fromCard, gameContext, continuation) {
        continuation(value - 1);
    };
}

class ZigZag extends Duck{
    constructor(image, name = 'ЗигЗаг', power = 3){
        super(image, name, power);
    }

    modifyTakenDamage = function (value, fromCard, gameContext, continuation) {
        continuation(value);
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
    new ZigZag('zigZag.png'),
    new Duck('peaceful.png')
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog('banditDog.png'),
    new Thrasher('banditThrasher.png'),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
