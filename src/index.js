import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
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

class Creature extends Card{
    constructor(name, power, image) {
        super(name, power, image);
    }

    getDescriptions () {
        return [getCreatureDescription(this), ...super.getDescriptions()]
    }
}

// Основа для утки.

class Duck extends Creature{
    constructor() {
        super("Мирная утка", 2, 'sheriff.png');
    }
    static quacks() {
        console.log('quack');
    }

    static swims() {
        console.log('float: both;')
    }
}


// Основа для собаки.
class Dog extends Creature {
    // constructor() {
    //     super("Пес-бандит", 3, 'bandit.png');
    // }
    constructor(name, power, image) {
        super(name, power, image);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5, 'mouse.jpg');
    }

    modifyTakenDamage(value, toCard, gameContext, continuation) {
        this.view.signalAbility(() => { continuation(--value); });
    }

}



// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.

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




