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

class Creature extends Card{
    constructor(name,power) {
        console.log(`creature name=${name}`)
        super(name,power);
    }

    getDescriptions() {
        return [getCreatureDescription(this), super.getDescriptions()];
    }

}


// Основа для утки.
class Duck extends Creature {
    constructor(name='Мирная утка', damage=2) {
        super(name, damage);
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }
}


// Основа для собаки.

class Dog extends Creature {
    constructor(name="Пёс-бандит", damage=3){
        super(name, damage)
    }
}

class Trasher extends Dog {
    constructor() {
        super("Громила", 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        super.modifyTakenDamage(value - 1,fromCard, gameContext, continuation);
    }

    getDescriptions() {
        return [getCreatureDescription(this), "Получает на 1 меньше урона"];
    }
}

class Gatling extends Creature {
    constructor(name="Гатлинг", damage=6){
        super(name, damage)
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        for (let card of oppositePlayer.table) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {    
                if (card) {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                }
            });
        }

        taskQueue.continueWith(continuation);
    }

    getDescriptions() {
        return [getCreatureDescription(this), "Наносит всем картам противника 2 урона"];
    }
}

class Lad extends Dog{
    constructor(name="Браток", damage=2) {
        super(name, damage);
        this.inGameCount = 0;
    }

    static getInGameCount() { return this.inGameCount || 0; }

    static setInGameCount(value) { this.inGameCount = value; }

    doAfterComingIntoPlay (gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    };

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
    };

    static getBonus() { 
        let bonus = Lad.getInGameCount();
        return bonus * (bonus + 1) / 2
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - Lad.getBonus());
    }

    getDescriptions() {
        return [getCreatureDescription(this), "Чем их больше, тем они сильнее"];
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
