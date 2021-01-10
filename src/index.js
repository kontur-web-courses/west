import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    constructor(name, maxPower) {
        super(name, maxPower);
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()]
    }
}

// Отвечает является ли карта уткой
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой
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

// Основа для утки
class Duck extends Creature {
    constructor(name='Мирная утка', maxPower=2) {
        super(name, maxPower);
    }
    quacks = function () { console.log('quack') };
    swims = function () { console.log('float: both;') };
}

// Основа для собаки
class Dog extends Creature {
    constructor(name='Пес-бандит', maxPower=3) {
        super(name, maxPower);
    }
}

// Основа громила
class Trasher extends Dog {
    constructor(name='Громила', maxPower=5) {
        super(name, maxPower);
    }
    
    modifyTakenDamage(value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => super.modifyTakenDamage(value-1, fromCard, gameContext, continuation))
    }

    getDescriptions() {
        let newDescriptions = super.getDescriptions();
        return [...newDescriptions, 'Получает на 1 меньше урона']
    }
}

class Gatling extends Creature {
    constructor(name='Гатлинг', maxPower=6) {
        super(name, maxPower);
    }
    
    attack(gameContext, continuation){
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        for(let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCard = oppositePlayer.table[position];

            if (oppositeCard) {
                this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
            }
        });
        }

        taskQueue.continueWith(continuation);
    }

    getDescriptions() {
        let newDescriptions = super.getDescriptions();
        return [...newDescriptions, 'Наносит 2 урона по очереди всем картам противника на столе']
    }
}

class Lad extends Dog{
    constructor(name='Браток', maxPower=2) {
        super(name, maxPower);
    }
    static getInGameCount() { return this.inGameCount || 0; }
    static setInGameCount(value) { this.inGameCount = value; }
    doAfterComingIntoPlay(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        Lad.setInGameCount(Lad.getInGameCount() + 1)
        continuation();
    };
    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1)
        continuation();
    };
    static getBonus() {
        return Lad.getInGameCount() * (Lad.getInGameCount() + 1) /  2
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation))
    }
    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        this.view.signalAbility(() => super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation))
    };
    getDescriptions() {
        let newDescriptions = super.getDescriptions();
        return [...newDescriptions, Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ? 'Чем их больше, тем они сильнее' : null]
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

// Создание игры
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций
SpeedRate.set(1);

// Запуск игры
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
