import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';



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
        super(name, maxPower, image)
    }
    getDescriptions() {
        return [super.getDescriptions(),getCreatureDescription(this)];
    }
}


class Duck extends Creature {
    constructor(name="Мирная утка", maxPower=2) {
        super(name, maxPower)
    }

    quacks() { 
        console.log('quack'); 
    }

    swims() { 
        console.log('float: both;'); 
    }
}

class Dog extends Creature {
    constructor(name="Пес-бандит", maxPower=3) {
        super(name, maxPower)
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5)
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => { super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation) });
    }

    getDescriptions() {
        return super.getDescriptions();
    }
}


class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6)
    }
    
    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const { currentPlayer, oppositePlayer, position, updateView } = gameContext;
        const opponentCards = oppositePlayer.table;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (let oppositeCard of opponentCards)
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
            });

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor() {
        super('Браток', 2)
        Lad.ladInGameCount = Lad.getInGameCount() || 0;
    }


    doAfterComingIntoPlay(...args) {
        Lad.ladInGameCount++;
        super.doAfterComingIntoPlay(...args)
    }

    doBeforeRemoving(...args) {
        Lad.ladInGameCount--;
        super.doBeforeRemoving(...args)

    }

    static getInGameCount() {
        return Lad.ladInGameCount;
    }

    static setInGameCount(value) {
        Lad.ladInGameCount = value;
    }

    static getBonus() {
        return Lad.getInGameCount() * (Lad.getInGameCount() + 1) / 2;
    }

    modifyTakenDamage(value, ...args) {
        this.view.signalAbility(() => { super.modifyTakenDamage(value - Lad.getBonus(), ...args) });
    }

    modifyDealedDamageToCreature(value, ...args) {
        this.view.signalAbility(() => { super.modifyDealedDamageToCreature(value + Lad.getBonus(), ...args) });
    }

    getDescriptions() {
        let descriptions = super.getDescriptions();
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') || Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            descriptions.push('Чем их больше, тем они сильнее');
        }
        return descriptions;
    }
}


function isDuck(card) {
    return card && card.quacks && card.swims;
}

function isDog(card) {
    return card instanceof Dog;
}



const seriffStartDeck = [
    new Duck('', 1),
    new Duck('', 1),
    new Duck('', 1),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new Lad(),
    new Lad(),
    new Lad(),
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
