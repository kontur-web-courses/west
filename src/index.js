import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import Creature from './Creature.js';

// зачем @ почему
// Отвечает является ли карта уткой.
function isDuck(card) {
    return card.constructor === Duck;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card.constructor === Dog;
}


// Основа для утки.
class Duck extends Creature {
    constructor() {
        super("Мирная утка", 2)
        this.currentPower = 2
    }

    getDescriptions() {
        return [
            'Утка',
            ...super.getDescriptions()
        ]
    }

    quacks () { console.log('quack'); }

    swims () { console.log('float: both;'); }
}


// Основа для собаки.
class Dog extends Creature {
    constructor() {
        super('Пес-бандит', 3)
        this.currentPower = 3;
        this.name = 'Пес-бандит';
    }

    getDescriptions() {
        return [
            'Псина',
            ...super.getDescriptions()
        ]
    }
}

// Основа для Громилы.
class Trasher extends Dog {
    constructor() {
        super('Громила', 5)
        this.currentPower = 5;
        this.name = 'Громила';
    }

    getDescriptions() {
        return [
            'Громила',
            ...super.getDescriptions()
        ]
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => { continuation(value - 1); });
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6)
    }

    getDescriptions() {
        return [
            'Гатлинг',
            ...super.getDescriptions()
        ]
    }

    attack(gameContext, continuation) {
        let cards = gameContext.oppositePlayer.table
        const taskQueue = new TaskQueue();

        for (let position = 0; position < cards.length; position++) {
            taskQueue.push(onDone => {
                const card = this.table[position]
                if (card) {
                    const gameContext = this.game.getContextForCard(position)
                    card.attack(gameContext, continuation)
                } else {
                    onDone();
                }
            })
        }

        taskQueue.continueWith(continuation);
    }
}

// Основа для Братков.
class Lad extends Dog {
    constructor() {
        super('Браток', 2)
        this.currentPower = 2;
        this.name = 'Браток';
    }

    getDescriptions() {
        return [
            'Браток',
            ...super.getDescriptions()
        ]
    }
    
    static getInGameCount() { return this.inGameCount || 0; }

    static setInGameCount(value) { this.inGameCount = value; }

    doAfterComingIntoPlay(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        continuation();
    };

    doBeforeRemoving(continuation) {
        
    };

    static getBonus() {

    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        
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
