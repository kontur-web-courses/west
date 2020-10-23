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
    constructor(name, maxPower) {
        super(name, maxPower);
    }
    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower = 1) {
        super(name, maxPower);
    }

    quacks() { console.log('quack') }
    swims() { console.log('float: both;') }
}

// Основа для собаки.

class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3) {
        super(name, maxPower);
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', maxPower = 5) {
        super(name, maxPower, 'bandit.png');
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => { continuation(value - 1) });
        //continuation(value - 1)
    };
    getDescriptions() {
        return [getCreatureDescription(this), 'Снижение урона на 1', super.getDescriptions()[1]];
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', maxPower = 6) {
        super(name, maxPower);
    }

    attack(gameContext, continuation) {
        //super.attack(gameContext, continuation);

        const taskQueue = new TaskQueue();
        let oppositeTable = gameContext.oppositePlayer.table;


        for (let position = 0; position < oppositeTable.length; position++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const card = oppositeTable[position];
                if (card) {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                }
            });
        }
        taskQueue.continueWith(continuation);
    }

}

class Lad extends Dog {
    constructor(name = 'Браток', maxPower = 3) {
        super(name, maxPower);
    }

    static inGameCount = 0;
    static getInGameCount() {
        return this.inGameCount || 0;
    }
    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        let count = this.inGameCount;
        return count * (count + 1) / 2;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.inGameCount + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.inGameCount - 1);
        super.doBeforeRemoving(continuation);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation)
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation);
    }

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') || Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            return [getCreatureDescription(this), 'Чем их больше, тем они сильнее', super.getDescriptions()[1]];
        }
        return super.getDescriptions();
    }
}

class Rogue extends Creature {
    constructor(name = 'Изгой', maxPower = 2) {
        super(name, maxPower);
    }
    attack(gameContext, continuation) {
        const { oppositePlayer, updateView } = gameContext;
        for (const oppositeCard of oppositePlayer.table) {
            if (!oppositeCard) {
                continue;
            }

            if (oppositeCard.constructor.name === oppositePlayer.table[0].constructor.name) {
                let proto = Object.getPrototypeOf(oppositeCard);
                console.log(proto);
                if (proto.hasOwnProperty('modifyDealedDamageToCreature')) {
                    this.modifyDealedDamageToCreature = proto.modifyDealedDamageToCreature;
                    delete proto['modifyDealedDamageToCreature'];

                }
                if (proto.hasOwnProperty('modifyDealedDamageToPlayer')) {
                    this.modifyDealedDamageToPlayer = proto.modifyDealedDamageToPlayer;
                    delete proto['modifyDealedDamageToPlayer'];

                }
                if (proto.hasOwnProperty('modifyTakenDamage')) {
                    this.modifyTakenDamage = proto.modifyTakenDamage;
                    delete proto['modifyTakenDamage'];

                }
            }
        }
        console.log(this.updateView);
        updateView();
        super.attack(gameContext, continuation);

    }
}

/* // Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck('Мирный житель', 4),
    new Duck('Мирный житель', 2),
    new Duck('Мирный житель', 2),
    new Gatling()
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Trasher(),
    new Dog('Бандит', 3),
]; */
const seriffStartDeck = [

    new Duck(),
    new Rogue(),
];
const banditStartDeck = [
    new Lad(),
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
