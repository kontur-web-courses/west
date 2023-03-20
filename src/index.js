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
    if (isDog(card) && card.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
                            card.prototype.hasOwnProperty('modifyTakenDamage')){
        return 'Браток';
    }
    return 'Существо';
}

class Creature extends Card {
    constructor(name, power) {
        super(name, power);
    }
    getDescriptions() {
        let s1 = getCreatureDescription(this);
        let s2 = super.getDescriptions();
        return [s1, s2];
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
    }

    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

class Rogue extends Creature {
    constructor(name = 'Изгой', power = 2) {
        super(name, power)
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const oppositeCard = oppositePlayer.table[position];
        if (oppositeCard) {
            const otherProto = Object.getPrototypeOf(oppositeCard);
            if (otherProto.hasOwnProperty('modifyDealedDamageToCreature')) {
                this.modifyDealedDamageToCreature = otherProto.modifyDealedDamageToCreature;
                delete otherProto['modifyDealedDamageToCreature'];
            }
            if (otherProto.hasOwnProperty('modifyTakenDamage')) {
                this.modifyTakenDamage = otherProto.modifyTakenDamage;
                delete otherProto['modifyTakenDamage'];
            }
            gameContext.updateView();
        }
        continuation();
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
        for(let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayer.table[position];
                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                } else {
                    onDone();
                }
            });
        }

        taskQueue.continueWith(continuation);
    }
}

class Trasher extends Dog{
    constructor(name = 'Громила', power = 5) {
        super(name, power);
    }

    modifyTakenDamage (value, fromCard, gameContext, continuation){
        this.view.signalAbility(() =>
        {super.modifyTakenDamage(value-1, fromCard, gameContext, continuation)});
    }

    getDescriptions() {
        let description = 'Получает на 1 меньше урона';
        let arr = super.getDescriptions();
        arr.push(description);
        return arr;
    }
}


class Lad extends Dog{
    constructor(name= 'Браток', power= 2) {
        super(name, power);
    }
    static getInGameCount() {
        return this.inGameCount || 0;
    }
    static setInGameCount(value) {
        this.inGameCount = value;
    }
    doAfterComingIntoPlay(gameContext, continuation){
        Lad.setInGameCount(Lad.getInGameCount()+1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }
    doBeforeRemoving(continuation){
        Lad.setInGameCount(Lad.getInGameCount()-1);
        super.doBeforeRemoving(continuation);
    }

    static getBonus() {
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }
    modifyDealedDamageToCreature(value, toCard, gameContext, continuation){
        value += Lad.getBonus();
        super.modifyDealedDamageToCreature(value, toCard, gameContext, continuation);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        value -= Lad.getBonus();
        super.modifyTakenDamage(value, fromCard, gameContext, continuation);
    }

    getDescriptions() {
        let description = 'Чем их больше, тем они сильнее';
        let arr = super.getDescriptions();
        arr.push(description);
        return arr;
    }
}


const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Rogue(),
];
const banditStartDeck = [
    new Lad(),
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
