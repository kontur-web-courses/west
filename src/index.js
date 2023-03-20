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


class Trasher extends Dog {
    constructor(name, maxPower) {
        super(name, maxPower);
        this.name = "Громила";
        this.maxPower = 5;
    }
}

class Duck extends Card {
    constructor(name, maxPower) {
        super(name, maxPower);
        this.name = "Утка";
        this.maxPower = maxPower;
    }
    quacks() {
        super.quacks();
    }
    swims(){
        super.swims();
    }
}

class Dog extends Card{
    constructor(name, maxPower) {
        super(name, maxPower);
        this.name = "Собакен";
        this.maxPower = maxPower;
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck('Мирный житель', 2),
    new Duck('Мирный житель', 2),
    new Duck('Мирный житель', 2),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog('Бандит', 3),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
