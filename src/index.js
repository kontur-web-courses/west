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


class Creature extends Card {
    constructor(...args) {
        super(...args);
    }

    getDescriptions() {
        let parts = [
            getCreatureDescription(this),
            super.getDescriptions()
        ]
        return parts;
    }
}

class Duck extends Creature {
    constructor() {
        super("Мирная утка", 2);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}


class Dog extends Creature  {
    constructor(...args) {
        var ctorParams = args;
        if (args.length == 0)
            ctorParams = ['Бандит', 3];
        super(...args);
    }
}

class Trasher extends Dog {
    constructor() {
        super("Громила", 5);
        
    }


    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        if (value >= 1) {
            this.view.signalAbility(() => {
                value--;
                continuation(value);
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



