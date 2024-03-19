import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';


function isDuck(card) {
    return card && card.quacks && card.swims;
}

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
    constructor(...props) {
        super(...props);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}



// Основа для утки.
class Duck extends Creature{
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
    };

    quacks() {
        console.log('quack');
    };

    swims() {
        console.log('float: both;');
    };
}


// Основа для собаки.
class Dog extends Creature{
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    };
}

class Trasher extends Dog{
    constructor() {
        super('Громила', 5);
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
        })
    };

    getDescriptions() {
        return ['Получает на 1 меньше урона', ...super.getDescriptions()]
    };
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }
    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (const oppositeCard of game.oppositePlayer.table) {
            taskQueue.push(onDone => {
                this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
            });
        }

        taskQueue.continueWith(continuation);
    };
}


// Колода Шерифа, нижнего игрока.
        const seriffStartDeck = [
            //new Duck(),
            new Duck(),
            new Gatling(),
            new Duck(),
        ];

// Колода Бандита, верхнего игрока.
        const banditStartDeck = [
            //new Dog(),
            new Trasher(),
            new Trasher()
        ];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
