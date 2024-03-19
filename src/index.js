import Card from "./Card.js";
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

function getCreatureDescription(card) {
    return 'Существо';
}

class Creature extends Card {
    constructor(name, power, image) {
        super(name, power, image);
    }

    getDescriptions(){
        return [
            getCreatureDescription(this),
            super.getDescriptions()
        ];
    }
}

class Duck extends Creature {
    constructor(image=null) {
        super('Мирная утка', 2, image);
    }

    quacks () { console.log('quack'); }
    swims () { console.log('float: both;'); }    

    getDescriptions() {
        return ['Утка'].concat(super.getDescriptions());
    }
}

class Dog extends Creature {
    constructor(name='Пес-бандит', power=3, image=null) {
        super(name, power, image);
    }

    getDescriptions() {
        return ['Собака'].concat(super.getDescriptions());
    }
}

class Trasher extends Dog {
    constructor(name='Громила', power=5, image=null) {
        super(name, power, image);
    }

    modifyTakenDamage (value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {continuation(value - 1);});
    }

    getDescriptions() {
        return ['-1 dmg'].concat(super.getDescriptions());
    }
}

class Gatling extends Creature {
    constructor(name='Гатлинг', power=6, image=null) {
        super(name, power, image);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        for(let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCard = oppositePlayer.table[position];
                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                } else {
                    this.dealDamageToPlayer(1, gameContext, onDone);
                }
            });
        }
        taskQueue.continueWith(continuation);
    }


}

class Lad extends Dog {
    constructor(name='Браток', power=2, image=null){
        super(name, power, image);
        this.modifyDealedDamageToCreature = function (value, toCard, gameContext, continuation) {
            continuation(value + Lad.getBonus());
        };
        this.modifyTakenDamage = function (value, toCard, gameContext, continuation) {
            continuation(value - Lad.getBonus());
        };
    }
    

    static getInGameCount() { return this.inGameCount || 0; }
    static setInGameCount(value) { this.inGameCount = value; }

    static getBonus() {
        let amount = this.getInGameCount();
        return amount * (amount + 1) / 2;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }
    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(continuation);
    }

    getDescriptions() {
        if (this.hasOwnProperty('modifyDealedDamageToCreature')){
            return ['Чем их больше, тем они сильнее'].concat(super.getDescriptions());
        }
        return (super.getDescriptions());
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];


// Колода Бандита, верхнего игрока.
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