import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import CardView from './CardView.js';


class Creature extends Card {
    constructor(name, maxPower, path) {
        super(name, maxPower, path);
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
    return card instanceof Duck;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
export default function getCreatureDescription(card) {
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
    constructor(name = 'Мирная утка', maxPower = 2) {
        super(name, maxPower, 'sheriff.png');
    }

    quacks() {
        console.log('quack');
    };

    swims() {
        console.log('float: both;');
    };


    static [Symbol.hasInstance](instance) {
        return instance.quacks && instance.swims;
    }
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Бандит', maxPower = 3) {
        super(name, maxPower, 'bandit.png');
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power, 'gosling.jpg');
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        for (const card of gameContext.oppositePlayer.table) {
            if (card) {
                taskQueue.push(onDone => this.view.showAttack(onDone));
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(this.currentPower, card, gameContext, onDone);
                });
            }
        }

        taskQueue.continueWith(continuation);
    }
}


class Trasher extends Dog {
    constructor(name = 'Громила', maxPower = 5) {
        super(name, maxPower);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        if (value >= 2) {
            continuation(value - 1);
            this.view.signalAbility(() => {
                this.view.signalDamage(continuation);
            });
        } else {
            this.view.signalAbility(() => {
            });
        }
    }

    getDescriptions() {
        const description = super.getDescriptions();
        description.push('Получает на один урон меньше');
        return description;
    }
}

class Lad extends Dog {
    constructor(name = 'Братишка', maxPower = 2) {
        super(name, maxPower);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }

    doBeforeRemoving(continuation) {
        continuation();
        Lad.setInGameCount(Lad.getInGameCount() - 1);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(Math.max(value - Lad.getBonus()), 0);
    };

    getDescriptions() {
        const description = super.getDescriptions();
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
            Lad.prototype.hasOwnProperty('modifyTakenDamage'))
            description.push('Чем их больше, тем они сильнее');
        return description;
    }

    static inGameCount;

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }

}

class PseudoDuck extends Dog {
    constructor(name = 'Пвсевдоутка', power = 3) {
        super(name, power);
    }

    quacks() {
        console.log('Gaw');
    }

    swims() {
        console.log('float: both;');
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Gatling(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new Dog(),
    new PseudoDuck(),
    new Trasher(),
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
