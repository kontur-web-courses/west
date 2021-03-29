import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
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

class Creature extends Card{
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

// Основа для утки.
class Duck extends Creature{
    constructor(name = "Мирная утка", power = 2) {
        super(name, power);
        this.name = name;
        this.power = power;
    }
    quacks() { console.log('quack') };
    swims () { console.log('float: both;') };
}

class Gatling extends Creature{
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    }

    attack (gameContext, continuation){
        const taskQueue = new TaskQueue();
        for(let position = 0; position < gameContext.oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const card = gameContext.oppositePlayer.table[position];
                if (card) {
                    this.dealDamageToCreature(this.currentPower, card, gameContext, onDone);
                } else {
                    this.dealDamageToPlayer(1, gameContext, onDone);
                }
            });
        }
        taskQueue.continueWith(continuation);
    }
}

class Dog extends Creature{
    constructor(name = "Пес-бандит", power = 3) {
        super(name, power);
        this.name = name;
        this.power = power;
    }
}

class Lad extends Dog{
    constructor(name = 'Браток', power = 2) {
        super(name, power);
    }

    static getInGameCount() { return this.inGameCount || 0; }
    static setInGameCount(value) { this.inGameCount = value; }
    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving (continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(continuation);
    }

    static getBonus() {
        return this.inGameCount * (this.inGameCount + 1) / 2;
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation){
        super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation);
    }

    modifyTakenDamage (value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation)
        });
    }

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
            Lad.prototype.hasOwnProperty('modifyTakenDamage'))
            return ['Чем их больше, тем они сильнее', ...super.getDescriptions()];
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', power = 5) {
        super(name, power);
    }

    modifyTakenDamage (value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation)
        });
    }

    getDescriptions() {
        return ["Если Громилу атакуют, то он получает на 1 меньше урона", ...super.getDescriptions()];
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
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
