import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()]
    };
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

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Основа для утки.
class Duck extends Creature {
    constructor() {
        super("Мирная утка", 2);
    }

    quacks() {
        console.log('quack')
    };

    swims() {
        console.log('float: both;')
    };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = "Пес-банди", power = 3) {
        super(name, power);
    }
}

class Trasher extends Dog {
    constructor() {
        super("Громила", 5);
        this.view.signalAbility(this.modifyTakenDamage);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - 1)
    }

}

class Lad extends Dog{
    constructor() {
        super("Браток", 2);
    }
    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        let count = 1;
        for (let position = 0; position < gameContext.oppositePlayer.table.length; position++) {
            if (gameContext.oppositePlayer.table[position] && gameContext.oppositePlayer.table[position] instanceof Lad)
                count++;
        }
        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCard = oppositePlayer.table[position];

            if (oppositeCard) {
                this.dealDamageToCreature(Math.max(0,this.currentPower - ((count + 1)/2 * count)), oppositeCard, gameContext, onDone);
            } else {
                this.dealDamageToPlayer(1, gameContext, onDone);
            }
        });

        taskQueue.continueWith(continuation);
    };
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        let count = 1;
        for (let position = 0; position < gameContext.oppositePlayer.table.length; position++) {
            if (gameContext.oppositePlayer.table[position] && gameContext.oppositePlayer.table[position] instanceof Lad)
                count++;
        }
        continuation(Math.max(0,value - ((count + 1)/2 * count)));
    }

}

class Gatling extends Creature {
    constructor() {
        super("Гатлинг", 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        for (let position = 0; position < gameContext.oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                let card = gameContext.oppositePlayer.table[position];
                if (card)
                    this.dealDamageToCreature(2, gameContext.oppositePlayer.table[position], gameContext, onDone);
                else
                    onDone();
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
];
const banditStartDeck = [
    new Lad(),
    new Lad(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
