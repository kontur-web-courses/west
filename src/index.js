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
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}


// Основа для утки.
class Duck extends Creature {
    constructor(name, power) {
        super(name || 'Мирная утка', power || 2);
    }

    quacks() {
        console.log('quack');
    };

    swims() {
        console.log('float: both;');
    };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name, power) {
        super(name || 'Пес-бандит', power || 3);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    };

    getDescriptions() {
        return [getCreatureDescription(this), 'Получает на 1 меньше урона', ...super.getDescriptions()];
    }
}


class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        for (const entity of gameContext.oppositePlayer.table) {
            if (entity !== gameContext.oppositePlayer) {
                entity.takeDamage(2, this, gameContext, continuation)
                continuation(2);
            }
        }
    }
}

class Lad extends Dog {
    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        return Math.round(this.getInGameCount() * (this.getInGameCount() + 1) / 2)
    }

    constructor() {
        super('Братки');
    }

    doAfterComingIntoPlay(...args) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(...args)
    }

    doBeforeRemoving(...args) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(...args)
    }

    modifyDealedDamageToCreature(actualValue, toCard, gameContext, continuation) {
        continuation(actualValue + Lad.getBonus());
    }

    modifyTakenDamage(actualValue, fromCard, gameContext, continuation) {
        continuation(actualValue - Lad.getBonus())
    }

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')) {
            return ['Чем их больше, тем они сильнее', ...super.getDescriptions()];
        }
        return super.getDescriptions();
    }
}


class Rogue extends Creature {
    constructor() {
        super('Изгой', 2);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        if (oppositePlayer.table[position] !== undefined) {
            const cardPrototype = Object.getPrototypeOf(oppositePlayer.table[position]);
            this.prototype.modifyDealedDamageToCreature = cardPrototype.modifyDealedDamageToCreature;
            this.prototype.modifyDealedDamageToPlayer = cardPrototype.modifyDealedDamageToPlayer;
            this.prototype.modifyTakenDamage = cardPrototype.modifyTakenDamage;

            for (const propertyName of Object.getOwnPropertyNames(cardPrototype)) {
                delete cardPrototype[propertyName];
            }

            updateView();
            continuation();
        }
        else{
            continuation();
        }
    }
}

class Brewer extends Duck {
    constructor() {
        super('Пивовар', 2);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        for (let entity of currentPlayer.table.concat(oppositePlayer.table[position])) {
            if (isDuck(entity)) {
                entity.maxPower += 1;
                entity.currentPower = Math.min(entity.maxPower, entity.currentPower + 2);
                entity.view.signalHeal(() => {
                    entity.updateView();
                })
            }
        }
        continuation();
    };
}

class PseudoDuck extends Dog {
    constructor() {
        super('Псевдоутка', 3);
    }

    getDescriptions() {
        return ['Утка-Собака', ...super.getDescriptions()];
    }

    quacks() {
    }

    swims() {
    }
}

class Nemo extends Creature {
    constructor() {
        super('Nemo', 4);
    }

    getDescriptions() {
        return ['The one without a name without an honest heart as compass', ...super.getDescriptions()];
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        if (oppositePlayer.table[position] !== undefined){
            let proto = Object.getPrototypeOf(oppositePlayer.table[position]);
            Object.setPrototypeOf(this, proto);
            proto.doBeforeAttack(gameContext, continuation);
            updateView()
        }
        else {
            continuation();
        }
    };
}


const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Nemo()
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
