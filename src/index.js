import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';


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
    constructor(...args) {
        super(...args);
    }

    getDescriptions() {
        return [
            getCreatureDescription(this),
            ...super.getDescriptions()
        ];
    }
}


class Duck extends Creature {
    constructor(name = "Мирная утка", maxPower = 2) {
        super(name, maxPower);
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }
}

class Gatling extends Creature {
    constructor() {
        super("Гатлинг", 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {oppositePlayer} = gameContext;
        for (const card of oppositePlayer.table) {

            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                this.dealDamageToCreature(this.currentPower, card, gameContext, onDone);
            });
        }

        taskQueue.continueWith(continuation);
    }
}

class Rogue extends Creature {
    constructor() {
        super("Изгой", 2);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {oppositePlayer, position} = gameContext;
        const abilities = ["modifyDealedDamageToCreature", "modifyDealedDamageToPlayer", "modifyTakenDamage"]
        taskQueue.push(onDone => {
            const oppositeCard = oppositePlayer.table[position];
            const proto = Object.getPrototypeOf(oppositeCard);
            for (const ability of abilities) {
                if (proto.hasOwnProperty(ability)) {
                    this[ability] = proto[ability];
                    delete proto[ability];
                }
            }
            gameContext.updateView()
        });

        super.attack(gameContext, continuation);
    }
}

class Dog extends Creature {
    constructor(name = "Пес-бандит", maxPower = 3) {
        super(name, maxPower);
    }
}


class Trasher extends Dog {
    constructor() {
        super("Громила", 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => { continuation(value - 1) });
    };
    getDescriptions() {
        return ["Броня 1", ...super.getDescriptions()];
    }
}

class Lad extends Dog {
    constructor() {
        super("Браток", 2);
    }
    static getInGameCount() { return this.inGameCount || 0; }
    static setInGameCount(value) { this.inGameCount = value; }

    static getBonus() {
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }


    // Вызывается при входе карты в игру, сразу после размещения карты в нужной позиции на столе.
    // Можно переопределить в наследниках.
    // Позволяет определять способности, которые должны активироваться при входе в игру.
    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    };

    // Вызывается при выходе карты из игры непосредственно перед удалением ее со стола.
    // Можно переопределить в наследниках.
    // Позволяет определять способности, которые должны активироваться или завершаться при выходе карты из игры.
    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(continuation);
    };


    // Изменяет урон, наносимый картой при атаке карт противника.
    // Можно переопределить в наследниках.
    // Позволяет определять способности, которые меняют наносимый урон при атаке карт противника.
    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation);
    };


    // Изменяет урон, наносимый карте.
    // Можно переопределить в наследниках.
    // Позволяет определять способности, которые меняют наносимый карте урон.
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1)
        });
        super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation);
    };

    getDescriptions() {
        let result = super.getDescriptions();
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') || Lad.prototype.hasOwnProperty('modifyTakenDamage'))
        {
            result.unshift("Чем их больше, тем они сильнее");
        }
        return result;
    }
}


// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
}

// Отвечает является ли карта собакой.

function isDog(card) {
    return card instanceof Dog;
}

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Rogue(),
    new Rogue(),
];
const banditStartDeck = [
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
