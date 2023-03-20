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
    constructor(...props) {
        super(...props);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
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
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', power = 5) {
        super(name, power);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
        })
    }

    getDescriptions() {
        return ['Получает на 1 менбше урона', ...super.getDescriptions()];
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (const oppositeCard of oppositePlayer.table) {
            taskQueue.push(onDone => {
                this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
            });
        }

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor(name = 'Браток', power = 2) {
        super(name, power);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static increaseInGameCount() {
        this.setInGameCount(this.getInGameCount() + 1);
    }

    static decreaseInGameCount() {
        this.setInGameCount(this.getInGameCount() - 1);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.increaseInGameCount();
        super.doAfterComingIntoPlay(gameContext, continuation);
    };

    doBeforeRemoving(gameContext, continuation) {
        Lad.decreaseInGameCount();
        super.doBeforeRemoving(gameContext, continuation);
    };

    static getBonus() {
        const count = this.getInGameCount();
        return count * (count + 1) / 2;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation);
    };

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation);
    };

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')) {
            return ['Чем их больше, тем они сильнее', ...super.getDescriptions()];
        }
    }
}


class Rogue extends Creature {
    constructor(name = 'Изгой', power = 2) {
        super(name, power);

        this._dealedDamageModofiers = [];
        this._playerDamageModifiers = [];
        this._takenDamageModifiers = [];
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        const oppositeCard = oppositePlayer.table[position];
        const proto = Object.getPrototypeOf(oppositeCard);
        if (proto.hasOwnProperty('modifyDealedDamageToCreature')) {
            this._dealedDamageModofiers.push(proto.modifyDealedDamageToCreature);
            delete oppositeCard['modifyDealedDamageToCreature'];
        }
        if (proto.hasOwnProperty('modifyDealedDamageToPlayer')) {
            this._playerDamageModifiers.push(proto.modifyDealedDamageToPlayer)
            delete oppositeCard['modifyDealedDamageToPlayer'];
        }
        if (proto.hasOwnProperty('modifyTakenDamage')) {
            this._takenDamageModifiers.push(proto.modifyTakenDamage);
            delete oppositeCard['modifyTakenDamage'];
        }

        gameContext.updateView();
        super.doBeforeAttack(gameContext, continuation);
    };

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        for (const mod of this._dealedDamageModofiers) {
            mod(value, toCard, gameContext, continuation);
        }

        super.modifyDealedDamageToCreature(value, toCard, gameContext, continuation);
    };

    modifyDealedDamageToPlayer(value, gameContext, continuation) {
        for (const mod of this._playerDamageModifiers) {
            mod(value, gameContext, continuation);
        }

        super.modifyDealedDamageToPlayer(value, gameContext, continuation);
    };
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        for (const mod of this._takenDamageModifiers) {
            mod(value, fromCard, gameContext, continuation);
        }

        super.modifyTakenDamage(value, fromCard, gameContext, continuation);
    };
}

class PseudoDuck extends Dog {
    constructor(name='Псевдоутка', power=3) {
        super(name, power);
    }

    quacks() {
        console.log('quack')
    };

    swims() {
        console.log('float: both;')
    };

}

const seriffStartDeck = [
    new Duck(),
];
const banditStartDeck = [
    new Dog(),
    new PseudoDuck(),
    new Dog(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(5);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
