import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.


// Дает описание существа по схожести с утками и собаками


class Creature extends Card{
    constructor(name, maxPower) {
        super(name, maxPower);
    }
    getDescriptions(){
        return [this.getCreatureDescription(), super.getDescriptions()]
    }
    getCreatureDescription() {
        if (this._isDuck() && this._isDog()) {
            return 'Утка-Собака';
        }
        if (this._isDuck()) {
            return 'Утка';
        }
        if (this._isDog()) {
            return 'Собака';
        }
        return 'Существо';
    }
    _isDuck() {
        return this && this.quacks && this.swims;
    }

    _isDog() {
        return this instanceof Dog;
    }
}

class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }

    quacks() {
        console.log('quack')
    };

    swims() {
        console.log('float: both;')
    };
}

class Dog extends Creature {
    constructor() {
        super('Пес-бандит', 3);
    }
}

class Trasher extends Dog{
    constructor(props) {
        super(props);
        this.name = 'Громила'
        this.currentPower = 5
        this.maxPower = 5
        this.powerDescription = 'Получает на 1 единицу меньше урона.'
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => super.modifyTakenDamage(value-1, fromCard, gameContext, continuation))
    }

    getDescriptions() {
        let superDescriptions = super.getDescriptions();
        return [...superDescriptions, this.powerDescription]
    }
}

class Gatling extends Creature{
    constructor() {
        super();
        this.name = 'Гатлинг'
        this.currentPower = 6
        this.maxPower = this.currentPower
    }
    attack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const taskQueue = new TaskQueue();
        for (let card of gameContext.oppositePlayer.table) {

            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {

                if (card) {
                    this.dealDamageToCreature(this.currentPower, card, gameContext, onDone);
                }
            });


        }
        taskQueue.continueWith(continuation);
    }
}


const seriffStartDeck = [
    new Duck(),
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
