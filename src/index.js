import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import card from './Card.js';

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
    getDescriptions() {
        return ([getCreatureDescription(this), ...super.getDescriptions()]);
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower = 2) {
        super(name, maxPower);
    }

    quacks() {
        console.log('quack');
    };

    swims() {
        console.log('float: both;');
    };
}


class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3) {
        super(name, maxPower);
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', maxPower = 6) {
        super(name, maxPower);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(2);
    };

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        for (let op of gameContext.oppositePlayer.table) {
            if (op !== null) {
                taskQueue.push(onDone => this.view.showAttack(onDone));
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(this.currentPower, op, gameContext, onDone);
                });
            }

            taskQueue.continueWith(continuation);
        }
    }
}

class PseudoDuck extends Dog {
    constructor(name = 'Псевдоутка', maxPower = 3) {
        super(name, maxPower);
    }

    quacks() {
        console.log('bark');
    };

    swims() {
        console.log('float: both;');
    };
}

console.assert(isDuck(new PseudoDuck()));

// // Колода Шерифа, нижнего игрока.
// const seriffStartDeck = [
//     new Card('Мирный житель', 2),
//     new Card('Мирный житель', 2),
//     new Card('Мирный житель', 2),
// ];
//
// // Колода Бандита, верхнего игрока.
// const banditStartDeck = [
//     new Card('Бандит', 3),
// ];
//

class Trasher extends Dog {
    constructor(name = 'Громила', maxPower = 5) {
        super(name, maxPower);
    }

    modifyTakenDamage(value, toCard, gameContext, continuation) {
        let t = this;
        value = Math.max(value - 1, 0);
        if (value > 0) {
            this.view.signalAbility(c => t.view.signalDamage(c => {
            }));
        }
        super.modifyTakenDamage(value, toCard, gameContext, continuation);
    };

    getDescriptions() {
        return ([...super.getDescriptions(), 'Получает на 1 урона меньше']);
    }
}

class Brewer extends Duck {
    constructor(name = 'Пивовар', maxPower = 2) {
        super(name, maxPower);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        for (card of currentPlayer.table + oppositePlayer.table) {
            if (isDuck(card)) {
                card.maxPower += 1;
                card.view.signalHeal(c => {
                    card.currentPower = Math.min(card.maxPower, card.currentPower + 2);
                    card.updateView();
                });
            }
        }

        continuation();
    };

    getDescriptions() {
        return ([...super.getDescriptions(), 'Угощает П И В О М всех уток.']);
    }
}

class Lad extends Dog {
    constructor(name = 'Браток', maxPower = 2) {
        super(name, maxPower);
    }

    static getInGameCount() { return this.inGameCount || 0; }
    static setInGameCount(value) { this.inGameCount = value; }
    static getBonus() {
        return this.inGameCount * (this.inGameCount + 1) / 2
    }

    getDescriptions() {
        return ([...super.getDescriptions(), "Чем их больше, тем они сильнее"]);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        super.doAfterComingIntoPlay(gameContext, continuation);
        Lad.setInGameCount(Lad.getInGameCount() + 1);
    }

    doBeforeRemoving(gameContext, continuation) {
        super.doBeforeRemoving(gameContext, continuation);
        Lad.setInGameCount(Lad.getInGameCount() - 1);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(Lad.getBonus());
    };

    modifyTakenDamage(value, toCard, gameContext, continuation) {
        let t = this;
        value = Math.max(Lad.getBonus(), 0);
        if (value > 0) {
            this.view.signalAbility(c => t.view.signalDamage(c => {
            }));
        }
        super.modifyTakenDamage(value, toCard, gameContext, continuation);
    };

}

const seriffStartDeck = [
    new Brewer(),
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new Lad(),
    new Lad(),
    new PseudoDuck(),
    new Trasher(),
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
