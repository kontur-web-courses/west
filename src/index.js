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

    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
        ];
    }
}


// Основа для утки.
/*function Duck() {
    this.quacks = function () { console.log('quack') };
    this.swims = function () { console.log('float: both;') };
}*/
class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
        this.quacks = function () {
            console.log('quack')
        };
        this.swims = function () {
            console.log('float: both;')
        };
    }
}


// класс Собаки с именем Пес-собака и силой 3
class Dog extends Card {
    constructor(name='Пес-собака', MaxPower=3, image=null) {
        super(name, MaxPower);
    }
}
class Trasher extends Dog {
class Dog extends Creature {
    constructor(name = 'Пес-собака', maxPower = 3, image = null) {
        super(name, maxPower, image);
    }
}

class Lad extends Dog {
    static getInGameCount() { 
        return this.inGameCount || 0; 
    } 
    
    static setInGameCount(value) { 
        this.inGameCount = value; 
    }

    static getBonus() {
        const count = this.getInGameCount();
        return count * (count + 1) / 2;
    }

    constructor(name='Браток', maxPower=2, image=null) {
        super(name, maxPower, image)
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(Lad.getBonus() + value);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(Lad.getBonus() + value);
    }

    getDescriptions() {
        return [
            Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') && 'Чем их больше, тем они сильнее',
            ...super.getDescriptions()
        ]
    }
}

class Gatling extends Creature{
    constructor() {
        super('Громила', 5);
        super('Гатлинг', 6, null);
    }
    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        for (let position = 0; position < gameContext.oppositePlayer.table.length; position++){
            const oppositeCard = gameContext.oppositePlayer.table[position];
            if (oppositeCard) {
                taskQueue.push(onDone => this.view.showAttack(onDone));
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                });
            }
        }
        taskQueue.continueWith(continuation);
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const modifiedValue = value - 1;
        if (this.currentPower < 4) {
            this.view.signalAbility(() => {
                console.log('Громила активировал способность');

                this.view.signalDamage(() => {
                    console.log('Громила получил урон');
                });
            });
        }
        else {
            this.view.signalDamage(() => {
                console.log('Громила получил урон');
            });
        }
        continuation(modifiedValue);
    }

    getDescriptions() {
        const descriptions = super.getDescriptions();
        descriptions.unshift('Уменьшает урон на 1');
        return descriptions;
    }
}

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];
const banditStartDeck = [
    new Trasher(),
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
