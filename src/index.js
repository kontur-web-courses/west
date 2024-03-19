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

function isDuck(card) {
    return card && card.quacks && card.swims;
}

function isDog(card) {
    return card instanceof Dog;
}



const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Gatling(),
];
const banditStartDeck = [
    new Trasher(),
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
