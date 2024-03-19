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

class Creature extends Card{
    constructor() {
        super();
        this._currentPower = super.maxPower;
    }
    getDescriptions() {
        let a = getCreatureDescription(this);
        let b = super.getDescriptions();
        return [a, ...b]
    }

    get currentPower() {
        return this._currentPower
    }

    set currentPower(value) {
        if (value >= super.maxPower) {
            value = super.maxPower;
        }
        this._currentPower = value;
    }


}

// Основа для утки.
class Duck extends Creature {
    constructor() {
        super();
        this.name = 'Мирная утка';
        this.currentPower = 2;
        this.maxPower = 2;
    }
    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor() {
        super();
        this.name = 'Пес-бандит';
        this.currentPower = 3;
        this.maxPower = 3;
    }
}

class Trasher extends Dog {
    constructor() {
        super();
        this.name = 'Громила';
        this.currentPower = 5;
        this.maxPower = 5;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    };
}

class Lad extends Dog {
    constructor() {
        super();
        this.name = 'Браток';
        this.currentPower = 2;
        this.maxPower = 2;
    }

    static getDamageBonus() {
        const totalCount = Lad.getInGameCount();
        return totalCount * (totalCount + 1) / 2;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const bonus = Lad.getDamageBonus();
        this.view.signalAbility(() => {
            continuation(value - bonus);
        });
    };

    getDescriptions() {
        let b = super.getDescriptions();
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')) {
            const s = 'Чем их больше, тем они сильнее';
            return [...b, s];
        }
        return b;
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const bonus = Lad.getDamageBonus();
        continuation(value + bonus);
    };

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.inGameCount++;
        continuation();
    };

    doBeforeRemoving(continuation) {
        Lad.inGameCount--;
        continuation();
    };

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static inGameCount = 0;
}

class Gatling extends Creature {
    constructor() {
        super();
        this.name = 'Гаттлинг';
        this.currentPower = 6;
        this.maxPower = 6;
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        if (gameContext.oppositePlayer.table.length === 0){
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                this.dealDamageToPlayer(1, gameContext, onDone);
            });
        } else {
            for (let card of gameContext.oppositePlayer.table) {
                taskQueue.push(onDone => this.view.showAttack(onDone));
                taskQueue.push(onDone => {
                    if (card) {
                        this.dealDamageToCreature(this.currentPower, card, gameContext, onDone);
                    } else {
                        this.dealDamageToPlayer(1, gameContext, onDone);
                    }
                });
            }
        }
        taskQueue.continueWith(continuation);
    };
}


class Rogue extends Creature {
    constructor() {
        super();
        this.name = 'Изгой';
        this.currentPower = 2;
        this.maxPower = 2;
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCard = oppositePlayer.table[position];

            if (oppositeCard) {
                let prot = Object.getPrototypeOf(oppositeCard)
                if (prot.hasOwnProperty('modifyDealedDamageToCreature')){
                    delete prot['modifyDealedDamageToCreature']
                }
                if (prot.hasOwnProperty('modifyDealedDamageToPlayer')){
                    delete prot['modifyDealedDamageToPlayer']
                }
                if (prot.hasOwnProperty('modifyTakenDamage')){
                    delete prot['modifyTakenDamage']
                }
                gameContext.updateView();
                this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
            } else {
                this.dealDamageToPlayer(1, gameContext, onDone);
            }
        });

        taskQueue.continueWith(continuation);
    };
}

// Колода Шерифа, нижнего игрока.

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Rogue(),
];
const banditStartDeck = [
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
