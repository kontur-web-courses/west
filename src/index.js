import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';


class Creature extends Card {
    constructor(...args) {
        super(...args);
    }

    getDescriptions () {
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
        ]

    }

}


class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 2);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCards = oppositePlayer.table;
            for (let oppositeCard of oppositeCards) {
                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                }
            }
        });

        taskQueue.continueWith(continuation);
    };
}



class Duck extends Creature {
    constructor(name='Мирная утка', power=2) {
        super(name, power);
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }
}

class Dog extends Creature {
    constructor(name='Пес-бандит', power = 3) {
        super(name, power);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила');
    }

    modifyTakenDamage (value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(Math.max(0, value - 1), fromCard, gameContext, continuation);
        })

    };

    getDescriptions() {
        return [
            ...super.getDescriptions(),'Получает на 1 урона меньше'
        ]
    }
}


class Brewer extends Duck{
    constructor() {
        super('Пивовар', 2);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, updateView} = gameContext;
        const allCards = currentPlayer.table.concat(oppositePlayer.table);

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            allCards.forEach(card => {
                if (card instanceof Duck) {
                    card.maxPower += 1;
                    card.currentPower = Math.min(card.currentPower + 2, card.maxPower);
                    card.view.signalHeal();
                    card.updateView();
                }
            });

            this.maxPower += 1;
            this.currentPower = Math.min(this.currentPower + 2, this.maxPower);
            this.view.signalHeal();
            this.updateView();
            onDone();
        });

        taskQueue.continueWith(continuation);
    }

}

class PseudoDuck extends Dog {
    constructor() {
        super('Псевдоутка', 3);
    }
}

Object.assign(PseudoDuck.prototype, Duck.prototype.swims)
Object.assign(PseudoDuck.prototype, Duck.prototype.quacks)


// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

function isTrasher(card) {
    return card instanceof Trasher;
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
    if (isTrasher()) {
        return 'Громила'
    }
    return 'Существо';
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Brewer(),
];
const banditStartDeck = [
    new Dog(),
    new PseudoDuck(),
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
