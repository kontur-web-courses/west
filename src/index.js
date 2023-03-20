import Card from './Card.js';
import {Creature} from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(duck) {
    return duck instanceof Duck;
}

// Отвечает является ли карта собакой.
function isDog(dog) {
    return dog instanceof Dog;
}

function isTrasher(trasher) {
    return trasher instanceof Trasher;
}

// Дает описание существа по схожести с утками и собаками
export function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    if (isTrasher(card)){
        return 'Громила\nПолучает на 1 урона меньше';
    }
    return 'Существо';
}

class Gatling extends Creature {
    constructor(name="Гатлинг", power=6){
        super(name, power);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCards = oppositePlayer.table;

            if (oppositeCards.length == 0) {
                this.dealDamageToPlayer(1, gameContext, onDone);
                return;
            }

            let t = 0;
            for (let card of oppositeCards) {
                this.dealDamageToCreature(this.currentPower, card, gameContext, onDone);
            }

        });

        taskQueue.continueWith(continuation);
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor(name="Мирная утка", power=2){
        super(name, power);
    }
    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name="Пес-бандит", power=3){
        super(name, power);
    }
}

class Trasher extends Dog {
    constructor(name="Громила", power=5){
        super(name, power)
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => { super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation)})
    };
}

class Lad extends Dog {
    constructor(name, maxPower, image) {
        const nameCorrect = name || "Браток";
        const maxPowerCorrect = maxPower || 2;
        const imageCorrect = image || "/lad.jpeg";
        super(nameCorrect, maxPowerCorrect, imageCorrect);
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

    modifyTakenDamage = (value, fromCard, gameContext, continuation) =>
        super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation);


    modifyDealedDamageToCreature = (value, toCard, gameContext, continuation) =>
        super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation);


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


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Gatling(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Lad(),
    new Lad(),
    new Lad(),
    new Lad(),
    new Trasher(),
    new Dog(),
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
