import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';


function isDuck(card) {
    return card && card.quacks && card.swims;
}

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
class Duck extends Creature{
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
    };

    quacks() {
        console.log('quack');
    };

    swims() {
        console.log('float: both;');
    };
}


// Основа для собаки.
class Dog extends Creature{
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    };
}

class Trasher extends Dog{
    constructor() {
        super('Громила', 5);
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
        })
    };

    getDescriptions() {
        return ['Получает на 1 меньше урона', ...super.getDescriptions()]
    };
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }
    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (const oppositeCard of game.oppositePlayer.table) {
            taskQueue.push(onDone => {
                this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
            });
        }

        taskQueue.continueWith(continuation);
    };
}

class Lad extends Dog {
    constructor(name, power) {
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
        super.modifyDealedDamageToCreature(this.currentPower + Lad.getBonus(), toCard, gameContext, continuation);
    }

    getDescriptions() {
        return ["Чем их больше, тем они сильнее", ...super.getDescriptions()];
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

class Rogue extends Creature {
    constructor() {
        super('Изгой', 2);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const oppositeCard = oppositePlayer.table[position];
        if (oppositeCard) {
            const cardProto = Object.getPrototypeOf(oppositeCard);
            if (cardProto.hasOwnProperty('modifyDealedDamageToCreature')) {
                this.modifyDealedDamageToCreature = cardProto.modifyDealedDamageToCreature;
                delete cardProto['modifyDealedDamageToCreature'];
            }
            if (cardProto.hasOwnProperty('modifyDealedDamageToPlayer')) {
                this.modifyDealedDamageToPlayer = cardProto.modifyDealedDamageToPlayer;
                delete cardProto['modifyDealedDamageToPlayer'];
            }
            if (cardProto.hasOwnProperty('modifyTakenDamage')) {
                this.modifyTakenDamage = cardProto.modifyTakenDamage;
                delete cardProto['modifyTakenDamage'];
            }
            gameContext.updateView();
        }
        continuation();
    }
}



        const seriffStartDeck = [
            new Duck(),
            new Duck(),
            new Rogue()
        ];

        const banditStartDeck = [
            //new Dog(),
            new Lad(),
            new Lad()
        ];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
