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

    get currentPower() {
        return this._currentPower;
    }

    set currentPower(value) {
        if (value > this.maxPower) {
            this._currentPower = this.maxPower;
        } else {
            this._currentPower = value;
        }

    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()];
    }
}


// Основа для утки.
class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
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
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

//Громила
class Trasher extends Dog {
    constructor(name = 'Громила', power = 5) {
        super(name, power);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() =>
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation));
    }

    getDescriptions() {
        return super.getDescriptions().concat(['Получает на 1 меньше урона']);
    }
}

//Гатлинг
class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {oppositePlayer} = gameContext;

        for (let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayer.table[position];

                this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);

                const card = this.table[position];
                if (card) {
                    const gameContext = this.game.getContextForCard(position);
                    card.actInTurn(gameContext, onDone);
                } else {
                    onDone();
                }
            });
        }
        taskQueue.continueWith(continuation);
    };
}

//Браток
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

    static getBonus() {
        return this.inGameCount * (this.inGameCount + 1) / 2
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(continuation);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() =>
            super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation));
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        this.view.signalAbility(() =>
            super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation));
    }

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')) {
            return super.getDescriptions().concat(['Чем их больше, тем они сильнее']);
        }
        return super.getDescriptions();
    }
}

//Изгой
class Rogue extends Creature {
    ability = [`modifyDealedDamageToCreature`, `modifyDealedDamageToPlayer`, `modifyTakenDamage`];

    constructor(name = 'Изгой', power = 2) {
        super(name, power);
    }

    doBeforeAttack(gameContext, continuation) {
        super.doBeforeAttack(gameContext, continuation);
        const {oppositePlayer, updateView} = gameContext;

        for (const card of oppositePlayer.table) {
            const cardPrototype = Object.getPrototypeOf(card);
            const ownProperties = Object.getOwnPropertyNames(cardPrototype);

            for (const property of ownProperties) {
                if (this.ability.includes(property))
                    delete cardPrototype[property];
            }
        }
        updateView();
    }
}

//Пивовар
class Brewer extends Duck {
    constructor(name = 'Пивовар', power = 2) {
        super(name, power);
    }

    doBeforeAttack(gameContext, continuation) {
        super.doBeforeAttack(gameContext, continuation);
        const {oppositePlayer, currentPlayer} = gameContext;
        const allCards = currentPlayer.table.concat(oppositePlayer.table);

        for (const card of allCards) {
            if (!isDuck(card))
                continue;
            card.maxPower++;
            card.currentPower += 2;
            card.view.signalHeal(() => card.updateView());
        }
    }
}

//Псевдоутка
class PseudoDuck extends Dog {
    constructor(name = 'Псевдоутка', power = 3) {
        super(name, power);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Brewer(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog(),
    new PseudoDuck(),
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
