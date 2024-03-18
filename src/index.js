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
    constructor(name = 'Громила', power = 5) {
        super(name, power);
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

class Gatling extends Creature{
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    };

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (const oppositeCard of oppositePlayer.table) {
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
            });
        }

        taskQueue.continueWith(continuation);
    };
}

class Lad extends Dog{
    static inGameCount = 0;
    constructor(name = 'Браток', power = 2) {
        super(name, power);
    };

    static getInGameCount() {
        return this.inGameCount || 0;
    };

    static setInGameCount(value) {
        this.inGameCount = value;
    };

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.inGameCount++;
        super.doAfterComingIntoPlay(gameContext, continuation);
    };

    doBeforeRemoving(gameContext, continuation) {
        Lad.inGameCount--;
        super.doBeforeRemoving(gameContext, continuation);
    };

    static getBonus(){
        const count = this.getInGameCount();
        return count * (count + 1) / 2;
    };

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation);
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation);
    };

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')) {
            return ['Чем их больше, тем они сильнее', ...super.getDescriptions()];
        }
    }
}


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
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(2);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
