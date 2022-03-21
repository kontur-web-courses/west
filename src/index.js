import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
        this._currentPower = maxPower;
    }

    get currentPower() {
        return this._currentPower || 0;
    }

    set currentPower(value) {
        this._currentPower = Math.min(this.maxPower, value);
    }

    getDescriptions() {
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
        ]
    }
}

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


class Duck extends Creature {
    constructor(name, maxPower, image) {
        const nameCorrect = name || 'Мирная утка';
        const maxPowerCorrect = maxPower || 2;
        const imageCorrect = image || 'duck.jpeg';

        super(nameCorrect, maxPowerCorrect, imageCorrect);
    }

    quacks() {
        console.log('quack')
    };

    swims() {
        console.log('float: both;')
    };
}

class Dog extends Creature {
    constructor(name, maxPower, image) {
        const nameCorrect = name || 'Пес-бандит';
        const maxPowerCorrect = maxPower || 3;
        const imageCorrect = image || '/dog.png';

        super(nameCorrect, maxPowerCorrect, imageCorrect);
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6, null);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        for (let i = 0; i < oppositePlayer.table.length; i++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayer.table[i];

                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                } else {
                    this.dealDamageToPlayer(1, gameContext, onDone);
                }
            });
        }

        taskQueue.continueWith(continuation);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
    }

    takeDamage(value, fromCard, gameContext, continuation) {
        if (value === 2) {
            this.view.signalAbility(() => {
                super.takeDamage(value, fromCard, gameContext, continuation)
            })
        } else {
            super.takeDamage(value, fromCard, gameContext, continuation);
        }
    }

    getDescriptions() {
        return [
            'Получает на 1 урон меньше',
            ...super.getDescriptions()
        ]
    }
}

class Lad extends Dog {
    constructor() {
        super('Браток', 2);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        const ladsInGame = Lad.getInGameCount();
        Lad.setInGameCount(ladsInGame + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation) {
        const ladsInGame = Lad.getInGameCount();
        Lad.setInGameCount(ladsInGame - 1);
        super.doBeforeRemoving(continuation);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation);
    }

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') || Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            return [
                'Чем их больше, тем они сильнее',
                ...super.getDescriptions()
            ]
        }

        return [
            ...super.getDescriptions()
        ]
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        const currentInGameCount = this.getInGameCount();
        return currentInGameCount * (currentInGameCount + 1) / 2;
    }
}

class Brewer extends Duck {
    constructor() {
        super('Пивовар', 2, 'bewer.jpeg');
    }

    attack(gameContext, continuation) {
        const allCards = gameContext.currentPlayer.table.concat(gameContext.oppositePlayer.table);

        for (const card of allCards) {
            if (!isDuck(card)) continue;

            card.maxPower++;
            card.currentPower += 2;
            card.view.signalHeal(() => card.updateView());
        }

        super.attack(gameContext, continuation);
    }

}


const seriffStartDeck = [
    new Duck(),
    new Brewer(),
    new Duck(),
];
const banditStartDeck = [
    new Dog(),
    new Duck(),
    new Dog(),
    new Dog(),
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

// console.log(isDuck(new Duck()));


