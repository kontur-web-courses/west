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
    constructor(name, power, image) {
        super(name, power, image);
    }
    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()]
    }
}


class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
    }
    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}
class Dog extends Creature {
    constructor(name = 'Пёс-бандин', power = 3) {
        super(name, power);
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', power = 5) {
        super(name, power);
    }
    modifyTakenDamage(actualValue, fromCard, gameContext, v) {
        this.view.signalAbility(() => v(actualValue - 1));
    }
    getDescriptions() {
        return ['Блокирует 1 ед урона', ...super.getDescriptions()]
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    }
    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        gameContext.oppositePlayer.table.forEach(oppositeCard => {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone =>
                this.dealDamageToCreature(2, oppositeCard, gameContext, onDone));

        });
        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    static inGameCount = 0;
    constructor(name = 'Братки', power = 3) {
        super(name, power);
    }

    modifyTakenDamage(actualValue, fromCard, gameContext, v) {
        let count = Lad.getInGameCount();
        v(Math.max(actualValue - count * (count + 1) / 2, 0));
    }

    static getInGameCount() {
        return this.inGameCount;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1)
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1)
        continuation();
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCard = oppositePlayer.table[position];
            if (oppositeCard) {
                let count = Lad.getInGameCount();
                this.dealDamageToCreature(this.currentPower + count * (count + 1) / 2, oppositeCard, gameContext, onDone);
            } else {
                this.dealDamageToPlayer(1, gameContext, onDone);
            }
        });
        taskQueue.continueWith(continuation);
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    getDescriptions() {
        return ['Семья - это главное', ...super.getDescriptions()]
    }
}

class Brewer extends Duck {
    constructor(name = 'Пивовар', power = 2) {
        super(name, power);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCard = oppositePlayer.table[position];
            if (oppositeCard) {
                this.giveBeer(gameContext);
                this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
            } else {
                this.dealDamageToPlayer(1, gameContext, onDone);
            }
        });
        taskQueue.continueWith(continuation);
    }

    update(player) {
        for (const card of player.table) {
            if(!isDuck(card)) continue;
            this.view.signalHeal(() => {
                card.maxPower += 1;
                card.currentPower += 2;
                card.updateView();
            });
        }
    }

    giveBeer(gameContext) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        this.update(currentPlayer);
        this.update(oppositePlayer);
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

const sheriffStartDeck = [
    new Brewer(),
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new PseudoDuck(),
    new Trasher(),
    new Dog(),
    new Lad(),
    new Lad(),
    new Lad(),
];


// Создание игры.
const game = new Game(sheriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
