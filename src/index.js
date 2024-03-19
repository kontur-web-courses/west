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

    getDescriptions() {
        return ['Утка'].concat(super.getDescriptions());
    }
}

class Dog extends Creature {
    constructor(name='Пес-бандит', power=3, image=null) {
        super(name, power, image);
    }

    getDescriptions() {
        return ['Собака'].concat(super.getDescriptions());
    }
}

class Trasher extends Dog {
    constructor(name='Громила', power=5, image=null) {
        super(name, power, image);
    }

    modifyTakenDamage (value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {continuation(value - 1);});
    }

    getDescriptions() {
        return ['-1 dmg'].concat(super.getDescriptions());
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck()
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