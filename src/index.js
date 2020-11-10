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
    constructor(name, maxPower, image, description) {
        super(name, maxPower, image, description);
    }

    get currentPower() {
        return this._currentPower;
    }

    set currentPower(value) {
        this._currentPower = Math.min(value, this.maxPower)
    }

    getDescriptions() {
        return [getCreatureDescription(this), this.description, ...super.getDescriptions()];
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка',
                maxPower = 2,
                image = 'sheriff.png',
                description = 'Обычный шериф') {
        super(name, maxPower, image, description);
    }

    quacks() {
        console.log('quack');
    };

    swims() {
        console.log('float: both;');
    };
}

class Brewer extends Duck {
    constructor(name = 'Пивовар',
                maxPower = 2,
                image = 'brewer.png',
                description = 'Пивка для рывка!') {
        super(name, maxPower, image, description);
    }

    doBeforeAttack(gameContext, continuation) {
        const cardsOnTable = gameContext.currentPlayer.table.concat(gameContext.oppositePlayer.table);
        for (const card of cardsOnTable)
            if (isDuck(card)) {
                card.maxPower += 1;
                card.currentPower = Math.min(card.currentPower + 2, card.maxPower);
                card.view.signalHeal(continuation);
                card.updateView();
            }
        continuation();
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг',
                maxPower = 6,
                image = 'gatling.png',
                description = 'Тупо убийство. Наносит всем картам противника 2 урона.') {
        super(name, maxPower, image, description);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        taskQueue.push(onDone => this.view.showAttack(onDone));

        for (const oppositeCard of gameContext.oppositePlayer.table)
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
            });

        taskQueue.continueWith(continuation);
    }
}

class Rogue extends Creature {
    constructor(name = 'Изгой',
                maxPower = 2,
                image = 'rogue.png',
                description = 'Забирает способности у карты') {
        super(name, maxPower, image, description);
    }

    checkAndSteal(property, cardProto, oppositeCard) {
        if (cardProto.hasOwnProperty(property)) {
            this[property] = oppositeCard[property];
            delete cardProto[property];

            return true;
        }

        return false;
    }

    doBeforeAttack(gameContext, continuation) {
        const oppositeCard = gameContext.oppositePlayer.table[gameContext.position];

        if (oppositeCard) {
            const cardProto = Object.getPrototypeOf(oppositeCard);
            const abilitiesToSteal = [
                'modifyTakenDamage',
                'modifyDealtDamageToCreature',
                'modifyDealtDamageToPlayer',
            ];

            let isSomethingStolen = false;
            for (const ability of abilitiesToSteal) {
                const isCurrentAbilityStolen = this.checkAndSteal(ability, cardProto, oppositeCard);
                isSomethingStolen = isSomethingStolen || isCurrentAbilityStolen;
            }

            if (isSomethingStolen)
                this.description = oppositeCard.description;
        }
        gameContext.updateView();
        continuation();
    }
}

class Nemo extends Creature{
    constructor(name = 'Немо',
                maxPower = 4,
                image = 'nemo.png',
                description = 'The one without a name without an honest heart as compass') {
        super(name, maxPower, image, description);
    }

    doBeforeAttack(gameContext, continuation) {
        const { oppositePlayer, position } = gameContext;
        const oppositeCard = oppositePlayer.table[position];

        if (oppositeCard) {
            const cardProto = Object.getPrototypeOf(oppositeCard);
            Object.setPrototypeOf(this, cardProto);
            this.description = oppositeCard.description;

            gameContext.updateView();
        }
        Object.getPrototypeOf(this).doBeforeAttack(gameContext, continuation);
    }
}

class Dog extends Creature {
    constructor(name = 'Пёс-бандит',
                maxPower = 3,
                image = 'bandit.png',
                description = 'Простой бандит') {
        super(name, maxPower, image, description);
    }
}

class PseudoDuck extends Dog {
    constructor(name = 'Псевдоутка',
                maxPower = 3,
                image = 'pseudoduck.png',
                description = 'Тщательно скрывается') {
        super(name, maxPower, image, description);
    }

    quacks() {
        console.log('Гав! Ой, то есть Кря-Кря!');
    };

    swims() {
        console.log('' +
            'Я собака - всех спасака, ' +
            'Кого хочешь я спасу' +
            'Попсу сгрызу за колбасу!'); // Мне аж стыдно стало немного за такую бездарную рифму, лол
    };
}


class Trasher extends Dog {
    constructor(name = 'Громила',
                maxPower = 5,
                image = 'trasher.png',
                description = 'Если Громилу атакуют, то он получает на 1 меньше урона.') {
        super(name, maxPower, image, description);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    }
}

class Lad extends Dog {
    constructor(name = 'Браток',
                maxPower = 2,
                image = 'lad.png') {
        super(name, maxPower, image);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        continuation(Lad.setInGameCount(Lad.getInGameCount() + 1));
    }

    doBeforeRemoving(continuation) {
        continuation(Lad.setInGameCount(Lad.getInGameCount() - 1));
    }

    static getBonus() {
        const ladsCount = Lad.getInGameCount();

        return ladsCount === 1 ? 0 : (Math.ceil(ladsCount * (ladsCount + 1) / 2));
    }

    modifyTakenDamage(actualValue, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(Math.max(actualValue - Lad.getBonus()), 0)
        })
    }

    modifyDealtDamageToCreature(actualValue, toCard, gameContext, continuation) {
        continuation(actualValue - Lad.getBonus());
    }

    getDescriptions() {
        if (!Lad.prototype.hasOwnProperty('modifyDealtDamageToCreature') &&
            !Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            this.description = '';
        } else {
            this.description = 'Чем их больше, тем они сильнее';
        }

        return super.getDescriptions();
    }
}

// Колода Шерифа, нижнего игрока.
const sheriffStartDeck = [
    new Nemo(),
    new Brewer(),
    new Duck(),
    new Duck(),
    new Rogue(),
    new Gatling(),
    new Brewer(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Brewer(),
    new Dog(),
    new PseudoDuck(),
    new Trasher(),
    new Lad(),
    new Lad(),
];


// Создание игры.
const game = new Game(sheriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
