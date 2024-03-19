import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';



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


const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];

const banditStartDeck = [
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

class Duck extends Card {
    constructor() {
        super("Мирная утка", 2)
    }

    quacks() { 
        console.log('quack'); 
    }

    swims() { 
        console.log('float: both;'); 
    }


}

class Dog extends Card {
    constructor() {
        super("Пес-бандит", 3)
    }
}

function isDuck(card) {
    return card && card.quacks && card.swims;
}

function isDog(card) {
    return card instanceof Dog;
}