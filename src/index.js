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


class Rogue extends Creature {
    constructor(name='Изгой', power=2){
        super(name, power, null);
    }
    doBeforeAttack (gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        let card = oppositePlayer.table[position];
        if (!card) {
            continuation();
            return;
        }
        let prototype = Object.getPrototypeOf(card);
        //`modifyDealedDamageToCreature`, `modifyDealedDamageToPlayer`, `modifyTakenDamage`
        let feature = prototype.modifyDealedDamageToCreature.bind(this);
        let curFeature = this.modifyDealedDamageToCreature.bind(this);
        this.modifyDealedDamageToCreature = function(value, toCard, gameContext, continuation) {
            curFeature(
                value,
                toCard,
                gameContext,
                function() {
                    feature(value, toCard, gameContext, continuation);
                } )
        };
        feature = prototype.modifyDealedDamageToPlayer.bind(this);
        curFeature = prototype.modifyDealedDamageToPlayer.bind(this);
        this.modifyDealedDamageToPlayer = function(value, gameContext, continuation) {
            curFeature(
                value,
                gameContext,
                function() {
                    feature(value, gameContext, continuation);
                } )
        };
        feature = prototype.modifyTakenDamage.bind(this);
        curFeature = prototype.modifyTakenDamage.bind(this);
        this.modifyTakenDamage = function(value, fromCard, gameContext, continuation) {
            curFeature(
                value,
                fromCard,
                gameContext,
                function() {
                    feature(value, fromCard, gameContext, continuation);
                } )
        };
        
        let newDesc = prototype.getDescriptions.bind(this);
        this.getDescriptions = function() {
            return newDesc();
        }
        delete prototype['getDescriptions'];
        delete prototype[`modifyDealedDamageToCreature`];
        delete prototype[`modifyDealedDamageToPlayer`];
        delete prototype[`modifyTakenDamage`];
        updateView();
        continuation();
    };
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Trasher(),
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];


// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Rogue(),
    new Rogue(),
    new Rogue(),
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