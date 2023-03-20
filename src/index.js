import Card from "./Card.js";
import Game from "./Game.js";
import TaskQueue from "./TaskQueue.js";
import SpeedRate from "./SpeedRate.js";


class Creature extends Card {
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
        ];
    }
}

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
        return "Утка-Собака";
    }
    if (isDuck(card)) {
        return "Утка";
    }
    if (isDog(card)) {
        return "Собака";
    }
    return "Существо";
}


class Duck extends Creature {
    constructor() {
        super("Мирная утка", 2, null);
    }

    quacks() {
        console.log("quack");
    };

    swims() {
        console.log("float: both;");
    };
}

class Dog extends Creature {
    constructor(name, maxPower, image) {
        const nameCorrect = name || "Пес-бандит";
        const maxPowerCorrect = maxPower || 3;
        const imageCorrect = image || null;

        super(nameCorrect, maxPowerCorrect, imageCorrect);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
    }

    takeDamage(value, fromCard, gameContext, continuation) {
        if (value === 2) {
            this.view.signalAbility(() => {
                super.takeDamage(value, fromCard, gameContext, continuation)
            })
        } else {
            super.takeDamage(value, fromCard, gameContext, continuation);
        }
    }

    getDescriptions() {
        return [
            'Получает на 1 урон меньше',
            ...super.getDescriptions()
        ]
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6, null);
    }
    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        for (let i = 0; i < oppositePlayer.table.length; i++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayer.table[i];

                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                } else {
                    this.dealDamageToPlayer(1, gameContext, onDone);
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
    alert("Победил " + winner.name);
});
