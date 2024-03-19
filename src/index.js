import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
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
    constructor(name, power, image) {
        super(name, power, image);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()]
    }
}


// Основа для утки.
class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2, image) {
        super(name, power, image);

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
    constructor(name = 'Пес-бандит', power = 3, image) {
        super(name, power, image);
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', power = 5, image) {
        super(name, power, image);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    }

    getDescriptions() {
        return ['Ебашит', ...super.getDescriptions()];
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6, image) {
        super(name, power, image);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        for (const card of gameContext.oppositePlayer.table) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCard = card;
                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                }
            }, 0, 200);
            taskQueue.continueWith(continuation);
        }
    }
}

class Lad extends Dog {
    constructor() {
        super('Браток', 2);
    }

    static ladCount = 0;

    static getInGameCount() {
        return this.ladCount;
    }

    static setInGameCount(value) {
        this.ladCount = value;
    }

    static getBonus() {
        const count = this.getInGameCount();
        return {
            protectionBonus: count * (count + 1) / 2,
            damageBonus: count * (count + 1) / 2
        };
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount((Lad.getInGameCount() || 0) + 1);
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        continuation(value + bonus.damageBonus);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        this.view.signalAbility(() => {
            continuation(value - bonus.protectionBonus);
        });
    }

    getDescription() {
        return 'Чем их больше, тем они сильнее';
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
const
    game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate
    .set(
        1
    )
;

// Запуск игры.
game
    .play(
        false
        , (
            winner
        ) => {
            alert(
                'Победил '
                +
                winner
                    .name
            )
            ;
        }
    )
;
