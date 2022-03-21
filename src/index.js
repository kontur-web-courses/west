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
    getDescriptions() { return [super.getDescriptions(), getCreatureDescription(this)] };
}

// Основа для утки.
class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }
    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}

// Основа для собаки.
class Dog extends Creature {
    constructor() {
        super('Пес-бандит', 3);
    }
}

class Trasher extends Dog {
    constructor() {
        super();
        this.name = 'Громила';
        this.currentPower = 5;
        this.maxPower = 5;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) { super.modifyTakenDamage(Math.min(this.currentPower, Math.max(value - 1, 0)), fromCard, gameContext, continuation) };
    getDescriptions() { return ["Если Громилу атакуют, то он получает на 1 меньше урона" , ...super.getDescriptions()] };
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));

        for(let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => {
                const card = oppositePlayer.table[position];
                if (card) {
                    this.dealDamageToCreature(this.currentPower, card, gameContext, onDone);
                }
            });
        }
        taskQueue.continueWith(continuation);
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];
const banditStartDeck = [
    new Trasher(),
    new Dog(),
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
