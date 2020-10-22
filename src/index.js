import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import Creature from './Creature.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
export function getCreatureDescription(card) {
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



// Основа для утки.
class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower = 2, image) {
        super(name, maxPower, image);
    }

    quacks() { console.log('quack') }
    swims() { console.log('float: both;') }
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3, image) {
        super(name, maxPower, image);   
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', maxPower = 5, image) {
        super(name, maxPower, image);   
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    }

    getDescriptions() {
        return [
            ...super.getDescriptions(),
            'при атаке на 1 меньше урона'
        ]
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', maxPower = 6, image) {
        super(name, maxPower, image);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        for(let player of gameContext.oppositePlayer.table) {
            if (player !== currentPlayer) {
                taskQueue.push(onDone => this.view.showAttack(onDone));
                taskQueue.push(onDone => {
                    if (player) {
                        this.dealDamageToCreature(this.currentPower, player, gameContext, onDone);
                    } else {
                        this.dealDamageToPlayer(1, gameContext, onDone);
                    }
                });
            }
        }

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor(name = 'Браток', maxPower = 2, image) {
        super(name, maxPower, image);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        const count = Lad.getInGameCount();
        Lad.setInGameCount(count + 1);

        continuation();
    }

    doBeforeRemoving(continuation) {
        const count = Lad.getInGameCount();
        Lad.setInGameCount(count - 1);

        continuation();
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        console.log('BONUS', this.inGameCount);
        return this.inGameCount * (this.inGameCount + 1) / 2;
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        console.log('modifyDealedDamageToCreature', Lad.getBonus());
        continuation(Lad.getBonus());
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        console.log('modifyTakenDamage', Lad.getBonus());
        continuation(Lad.getBonus());
    }

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') || Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            return [
                ...super.getDescriptions(),
                'Чем их больше, тем они сильнее'
            ];
        } else {
            super.getDescriptions();
        }
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.
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
