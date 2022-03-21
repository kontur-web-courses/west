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
    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor(name='Мирная утка', maxPower=2, image) {
        super(name, maxPower, image);
    }

    quacks() {
        console.log('quack');
    }
    
    swims() {
        console.log('float: both;');
    }
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name='Пес-бандит', maxPower=3, image) {
        super(name, maxPower, image);
    }
}

class Trasher extends Dog {
    constructor(name='Громила', maxPower=5, image) {
        super(name, maxPower, image);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        if (value > 0) {
            this.view.signalAbility(() => continuation(value - 1));
        } else {
            continuation(value);
        }
    }

    getDescriptions() {
        return ['Если Громилу атакуют, то он получает на 1 меньше урона', ...super.getDescriptions()];
    }
}

class Gatling extends Creature {
    constructor(name='Гатлинг', maxPower=6, image) {
        super(name, maxPower, image);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        taskQueue.push(onDone => this.view.showAttack(onDone));

        for(let position = 0; position < gameContext.oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => {
                const card = gameContext.oppositePlayer.table[position];
                if (card) {
                    this.dealDamageToCreature(this.currentPower, card, gameContext, onDone);
                } else {
                    onDone();
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

// Колода Бандита, верхнего игрока.
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
