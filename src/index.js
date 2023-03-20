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
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

class Duck extends Creature {
    constructor() {
        super("Мирная утка", 2, "peacefulDuck.png");
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }
}

class Dog extends Creature {
    constructor(name = "Пес-бандит", power = 3, image = "angryDog.png") {
        super(name, power, image);
    }
}

class Trasher extends Dog {
    constructor() {
        super("Громила", 5, "Trasher.png");
    }

    getDescriptions() {
        const abilityDesc = "Уменшьает весь получаемый урон на 1";
        const desc = super.getDescriptions();
        return [abilityDesc, ...desc];
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
    };
}

class Gatling extends Creature {
    constructor() {
        super("Гатлинг", 6, "gatling.png");
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (const i in gameContext.oppositePlayer.table) {
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayer.table[i];
                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                }
            });
        }
        taskQueue.continueWith(continuation);
    }
}


class PseudoDuck extends Dog {
    constructor() {
        super("Псевдоутка", 3, "pseudoDuck.png");
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }
}

const seriffStartDeck = [
    new Duck(),
    new Duck(),

];
const banditStartDeck = [
    new Dog(),
    new PseudoDuck(),
    new Dog(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(5);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
