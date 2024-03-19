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


// Основа для собаки.
class Dog extends Creature {
    constructor(name = "Пес-бандит", maxPower = 3, image) {
        super(name, maxPower, image);
    }
}


class Trasher extends Dog {
    constructor(name = "Громила", maxPower = 5, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        return ["Получает на 1 меньше урона", ...super.getDescriptions()];
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', maxPower = 6, image){
        super(name, maxPower, image);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        for(let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayer.table[position];
    
                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                } else {
                    this.dealDamageToPlayer(1, gameContext, onDone);
                }
            });
        }

        taskQueue.continueWith(continuation);
    }

    getDescriptions() {
        return ['При атаке наносит 2 урона по очереди всем картам противника', ...super.getDescriptions()];
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    // new Card('Мирный житель', 2),
    // new Card('Мирный житель', 2),
    // new Card('Мирный житель', 2),
    new Duck(),
    new Gatling(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    // new Card('Бандит', 3),
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
