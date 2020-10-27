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
    constructor(name, strength, description) {
        super(name, strength, description);
        this._currentPower = strength;

    }

    get currentPower() {
        return this._currentPower;
    }

    set currentPower(value) {
        if (this.maxPower >= value) {
            this._currentPower = value;
        } else {
            this._currentPower = this.maxPower;
        }
    }

    getDescriptions() {
        const creatureDescription = getCreatureDescription(this);
        const cardDescription = super.getDescriptions();

        return [creatureDescription, ...cardDescription];
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor(name = 'Злая-утка', strength = 2, description = 'просто утка') {
        super(name, strength, description);
    }

    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', strength = 3, description = 'просто пёс') {
        super(name, strength, description);
    }

}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6, 'наносит 2 урона всем картам противника на столе');
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const { oppositePlayer } = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));

        const oppositeCards = oppositePlayer.table;

        for (const oppositeCard of oppositeCards) {
            if (oppositeCard) {
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                });
            }
        }

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor() {
        super('Браток', 2, 'Чем их больше, тем они сильнее');
        this.inGameCount = 0;
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }
    static setInGameCount(value) {
         this.inGameCount = value;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        console.log(gameContext);
        Lad.setInGameCount(this.inGameCount++);
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(this.inGameCount--);
        continuation();
    }

    modifyTakenDamage(actualValue, fromCard, gameContext, continuation) {
        const count = Lad.getInGameCount();
        const check = actualValue - count;
        const damage = Math.max(check, 0);

        continuation(damage);
    }

    modifyDealedDamageToCreature(actualValue, toCard, gameContext, continuation) {
        const count = Lad.getInGameCount();
        continuation(actualValue+count);
    }

}

class Rouge extends Creature {
    constructor() {
        super('Изгой', 2, 'забирает способности у карты');
    }

    attack(gameContext, continuation) {
        const { oppositePlayer, position } = gameContext;
        const oppositeCard = oppositePlayer.table[position];

        if (oppositeCard) {
            const cardProto = Object.getPrototypeOf(oppositeCard);

            this.modifyTakenDamage = oppositeCard.modifyTakenDamage;
            this.modifyDealedDamageToCreature = oppositeCard.modifyDealedDamageToCreature;
            this.modifyDealedDamageToPlayer = oppositeCard.modifyDealedDamageToPlayer;

            delete cardProto['modifyTakenDamage'];
            delete cardProto['modifyDealedDamageToCreature'];
            delete cardProto['modifyDealedDamageToPlayer'];

            gameContext.updateView();
        }

        super.attack(gameContext, continuation);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5, 'Получает на 1 урона меньше');
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    }
}

class Brewer extends Duck {
    constructor(){
        super('Пивовар', 2, 'Ты меня уважаешь??');
    }

    doBeforeAttack(gameContext, continuation) {
        let currentCardsInTable = gameContext.currentPlayer.table.concat(gameContext.oppositePlayer.table);
        currentCardsInTable.forEach(card => {
            if(isDuck(card)){
                card.maxPower += 1;
                card.currentPower += 2;
                card.view.signalHeal();
                card.updateView();
            }
        });

        continuation();
    }
}

class PseudoDuck extends Dog {
    constructor() {
        super('Псевдоутка', 3, 'Амальгама');
    }

    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}

class Nemo extends Creature{
    constructor(){
        super('Немо', 4, 'The one without a name without an honest heart as compass')
    }

    doBeforeAttack(gameContext, continuation) {
        const { oppositePlayer, position } = gameContext;
        const oppositeCard = oppositePlayer.table[position];

        if (oppositeCard) {
            const cardProto = Object.getPrototypeOf(oppositeCard);
            Object.setPrototypeOf(this, cardProto);

            gameContext.updateView();
        }
        Object.getPrototypeOf(this).doBeforeAttack(gameContext, continuation);
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Nemo(),
];

const banditStartDeck = [
    new Brewer(),
    new Brewer(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
