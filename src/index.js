import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import Creature from "./Creature.js";

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
export function getCreatureDescription(card) {
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



// Основа для утки.



// Основа для собаки.
class Duck extends Creature{
    constructor() {
        super();
        this.name = "Мирная утка";
        this.maxPower = 2;
        this.currentPower = 2;
    }
    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}

class Dog extends Creature{
    constructor() {
        super();
        this.name = "Пес-бандит";
        this.maxPower = 3;
        this.currentPower = 3;
    }
}

class Trasher extends Dog{
    constructor() {
        super();
        this.name = "Громила";
        this.maxPower = 5;
        this.currentPower = 5;

    }
    modifyTakenDamage(value, gameContext, continuation){
        super. modifyTakenDamage(value-1, gameContext, continuation);
    }
}



// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new Trasher(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});

