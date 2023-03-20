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

class Creature extends Card {
    constructor(...args) {
        super(args);
    }

    getDescriptions(){
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
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


// Основа для утки.
class Duck extends Creature {
    constructor(...args) {
        super(args);
        this.name = 'Мирная утка';
        this.power = 2;
    }

    quacks = function () { console.log('quack') };
    swims = function () { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(...args) {
        super(args);
        this.name = 'Пес-бандит';
        this.power = 3;
    }
}


class Trasher extends Dog {
    constructor() {
        super();
        this.name = 'Громила';
        this.power = 5;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        if (value > 1){
            this.view.signalAbility(() => {
                this.view.signalDamage(() => {
                    continuation(value - 1);
                })
            });
        }
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.
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
