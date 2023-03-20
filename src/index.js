import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';


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
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
        ];
    }
}


class Duck extends Creature {
    constructor() {
        super("Мирная утка", 2);
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }
}

class Dog extends Creature {
    constructor() {
        super("Пес-бандит", 3);
    }
}


class Trasher extends Dog {
    constructor() {
        super("Громила", 5);

        // this.view.signalAbility(() => { // то, что надо сделать сразу после мигания. }
    }

    // Изменяет урон, наносимый карте.
    // Можно переопределить в наследниках.
    // Позволяет определять способности, которые меняют наносимый карте урон.
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => { continuation(value - 1) });
    };
    getDescriptions() {
        return ["Броня 1", ...super.getDescriptions()];
    }
}


// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
}
// Отвечает является ли карта собакой.

function isDog(card) {
    return card instanceof Dog;
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
