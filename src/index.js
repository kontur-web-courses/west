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
    constructor(name, maxPower, image, description) {
        super(name, maxPower, image, description);
    }

    getDescriptions() {
        return [getCreatureDescription(this), this.description, ...super.getDescriptions()];
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower =  2, image = 'sheriff.png', description = 'Обычный шериф') {
        super(name, maxPower, image, description);
    }

    quacks() {
        console.log('quack');
    };

    swims() {
        console.log('float: both;');
    };
}

class Dog extends Creature {
    constructor(name = 'Пёс-бандит', maxPower =  3, image = 'bandit.png', description = 'Простой бандит') {
        super(name, maxPower, image, description);
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', maxPower =  5, image = 'bandit.png', description = 'Если Громилу атакуют, то он получает на 1 меньше урона.') {
        super(name, maxPower, image, description);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    }
}

// Колода Шерифа, нижнего игрока.
const sheriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog(),
    new Trasher(),
];


// Создание игры.
const game = new Game(sheriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
