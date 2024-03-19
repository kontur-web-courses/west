import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import Creature from './Creature.js'

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
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
    return 'Существо';
}



// Основа для утки.
class Duck extends Creature{
    constructor(name = 'Мирная утка', power = 2 ) {
        super(name, power);
    }
    quacks()  { console.log('quack') };
    swims() { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }

}

class Trasher extends Dog{
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
            continuation(value-1);
            this.view.signalAbility(() => {this.view.signalDamage(()=>{})})
    }

    getDescriptions() {
         let xx = super.getDescriptions();
         xx.unshift("Способность: Получает на 1 урон меньше.")
        return xx;

    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        for (const oppositeCard of gameContext.oppositePlayer.table) {
            if (oppositeCard)
            {
                taskQueue.push(onDone => this.view.showAttack(onDone));
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                });
            }
        }

        taskQueue.continueWith(continuation);
    };

    getDescriptions() {
        let xx = super.getDescriptions();
        xx.unshift("Способность: Наносит 2 единицы урона всем картам противника на доске.")
        return xx;

    }
}

class Lad extends Dog {
    constructor() {
        super('Браток', 2);
    }

    static getInGameCount() { return this.inGameCount || 0; }
    static setInGameCount(value) { this.inGameCount = value; }

    doAfterComingIntoPlay(gameContext, continuation)
    {
        Lad.setInGameCount(Lad.getInGameCount()+1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation)
    {
        Lad.setInGameCount(Math.max(Lad.getInGameCount()-1, 0));
        super.doBeforeRemoving(continuation);
    }

    static getBonus() {
        let protection = this.getInGameCount() * (this.getInGameCount() + 1) / 2;
        let extraDamage = this.getInGameCount() * (this.getInGameCount() + 1) / 2;
        return {protection, extraDamage};
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation)
    {
        let { protection, extraDamage } = Lad.getBonus();
        continuation(extraDamage + value);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation)
    {
        let { protection, extraDamage } = Lad.getBonus();
        continuation(Math.max(value - protection, 0));
    }

    getDescriptions() {
        let xx = super.getDescriptions();
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') &&
                Lad.prototype.hasOwnProperty('modifyTakenDamage'))
            xx.unshift("Способность: чем их больше, тем они сильнее.")
        return xx;
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Gatling(),
    new Duck(),
    new Duck(),
    new Gatling(),
    new Gatling(),
    new Duck(),
];
const banditStartDeck = [
    new Lad(),
    new Dog(),
    new Lad(),
    new Trasher(),
    new Trasher(),
    new Lad(),
    new Lad(),
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
