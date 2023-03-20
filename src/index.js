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
        const first = getCreatureDescription(this);
        const second = super.getDescriptions();
        return [first, ...second];
    }
}

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

class Dog extends Creature {
    constructor(name = 'Браток', power = 2) {
        super(name, power);
    }
}

class Lad extends Dog {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount+1)
        continuation();
        super.doAfterComingIntoPlay(gameContext, continuation);
    };
    doBeforeRemoving (continuation) {
        Lad.setInGameCount(Lad.getInGameCount-1)
        super.doBeforeRemoving(continuation);
    };


    static getBonus() {
        const currentInGameCount = this.getInGameCount();
        return currentInGameCount * (currentInGameCount + 1) / 2;
    }
    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation);
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation);
    }
    getDescriptions() {
        if (Lad.prototype.hasOwnProperty("modifyDealedDamageToCreature") || Lad.prototype.hasOwnProperty("modifyTakenDamage")) {
            return [
                "Чем их больше, тем они сильнее",
                ...super.getDescriptions()
            ];
        }

        return [
            ...super.getDescriptions()
        ];
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const oppositeCards = gameContext.oppositePlayer.table;
        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (let oppositeCard of oppositeCards)
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
            });
        taskQueue.continueWith(continuation);
    }
}


class Trasher extends Dog {
    constructor(name = 'Громила', power = 5) {
        super(name, power);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }

    getDescriptions() {
        const ability = 'Если Громилу атакуют, то он получает на 1 меньше урона';
        const s_res = super.getDescriptions();
        return [ability, ...s_res];
    }
}

class Rogue extends Creature {
    constructor(name = 'Изгой', power = 2) {
        super(name, power);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const oppositeCard = oppositePlayer.table[position];

        let prototype = Object.getPrototypeOf(oppositeCard);
        if (prototype.hasOwnProperty("modifyTakenDamage")) {
            this.modifyTakenDamage = prototype.modifyTakenDamage;
            delete prototype["modifyTakenDamage"];
        }
        if (prototype.hasOwnProperty("modifyDealedDamageToPlayer")) {
            this.modifyDealedDamageToPlayer = prototype.modifyDealedDamageToPlayer;
            delete prototype["modifyDealedDamageToPlayer"];
        }
        if (prototype.hasOwnProperty("modifyDealedDamageToCreature")) {
            this.modifyDealedDamageToCreature = prototype.modifyDealedDamageToCreature;
            delete prototype["modifyDealedDamageToCreature"];
        }
        updateView();
        continuation();
    }
}

// Основа для утки.
// function Duck() {
//     this.quacks = function () { console.log('quack') };
//     this.swims = function () { console.log('float: both;') };
// }
//
//
// // Основа для собаки.
// function Dog() {
// }


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Rogue(),
];
const banditStartDeck = [
    new Dog(),
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









