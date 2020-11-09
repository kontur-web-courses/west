import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    constructor(name, power) {
        super(name, power)
    }

    isDuck(card) {
        return card && card.quacks && card.swims;
    }

    isDog(card) {
        return card instanceof Dog;
    }

    getCreatureDescription(card) {
        if (this.isDuck(card) && this.isDog(card)) {
            return 'Утка-Собака';
        }
        if (this.isDuck(card)) {
            return 'Утка';
        }
        if (this.isDog(card)) {
            return 'Собака';
        }
        return 'Существо';
    }

    getDescriptions() {
        return [this.getCreatureDescription(this), ...super.getDescriptions()]
    }

}

class Duck extends Creature {
    constructor(name = "Мирная утка", power = 2) {
        super(name, power);
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }

    isDuck() {
        return true
    }
}

class Dog extends Creature {
    constructor(name = "Пес-бандит", power = 3) {
        super(name, power);
    }

    isDog() {
        return true
    }
}

class Trasher extends Dog {
    constructor(name = "Громила", power = 5) {
        super(name, power);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1)
        })
    }

    getDescriptions() {
        return ["Получает на 1 меньше урона", ...super.getDescriptions()];
    }
}

class Gatling extends Creature {
    constructor(name = "Гатлинг", power = 6) {
        super(name, power);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        for (let position = 0; position < gameContext.oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                const oppositeCard = gameContext.oppositePlayer.table[position]
                if (oppositeCard)
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone)
            })
        }
        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor(name = "Браток", power = 2) {
        super(name, power);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        continuation(Lad.setInGameCount(Lad.getInGameCount() + 1))
    }

    doBeforeRemoving(continuation) {
        continuation(Lad.setInGameCount(Lad.getInGameCount() - 1))
    }

    static getBonus() {
        let inGameCount = this.getInGameCount();
        if (inGameCount == 1) return 0;
        return (inGameCount * (inGameCount + 1)) / 2
    };

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus())
        console.log(Lad.getBonus())
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - Lad.getBonus())
            console.log(Lad.getBonus())
        })
    }

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') || Lad.prototype.hasOwnProperty('modifyTakenDamage'))
            return ["Чем их больше, тем они сильней", ...super.getDescriptions()]
        else
            return [...super.getDescriptions()]
    }
}

class Rogue extends Creature {
    constructor(name = "Изгой", power = 3) {
        super(name, power);
    }

    modifyDealedDamageToCreature(gameContext, continuation) {
        let prototypeCard = Object.getPrototypeOf(gameContext.oppositePlayer)
        for (const ownPropertyName of Object.getOwnPropertyNames(prototypeCard)) {
            if (prototypeCard.hasOwnProperty(ownPropertyName)) {
                switch (ownPropertyName) {
                    case "modifyTakenDamage":
                        this.modifyTakenDamage = prototypeCard.modifyTakenDamage
                        delete prototypeCard[ownPropertyName]
                        break;
                    case "modifyDealedDamageToPlayer":
                        this.modifyDealedDamageToPlayer = prototypeCard.modifyDealedDamageToPlayer
                        delete prototypeCard[ownPropertyName]
                        break;
                    case "modifyDealedDamageToCreature":
                        this.modifyDealedDamageToCreature = prototypeCard.modifyDealedDamageToCreature
                        delete prototypeCard[ownPropertyName]
                        break;
                }
            }
        }
        gameContext.updateView()
        continuation();
    }
}

class Brewer extends Duck {
    constructor(name = "Пивовар", power = 2) {
        super(name, power);
    }

    doBeforeAttack(gameContext, continuation) {
        let oppositePlayerCard = gameContext.oppositePlayer.table
        let currentPlayerCard = gameContext.currentPlayer.table
        let allCards = currentPlayerCard.concat(oppositePlayerCard)
        for (const card of allCards) {
            if (card != null) {
                console.log("1")
                if (this.isDuck(card)) {
                    let currentPower = card.currentPower
                    card.maxPower += 1
                    if (currentPower + 2 > card.maxPower)
                        card.currentPower = card.maxPower
                    else card.currentPower += 2
                    this.view.signalHeal(continuation)
                    card.updateView()
                }
            }
        }
        continuation()
    }
}

class PseudoDuck extends Dog {
    constructor(name = "Псевдоутка", power = 3) {
        super(name, power);
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }
}

class Nemo extends Creature {
    constructor(name = "Немо", power = 4) {
        super(name, power);
    }

    doBeforeAttack(gameContext, continuation) {
        let currentPlayerCard = gameContext.currentPlayer.table[gameContext.position]
        let oppositePlayerCard = gameContext.oppositePlayer.table[0]
        let prototypeOppsiteCard = Object.getPrototypeOf(oppositePlayerCard)
        Object.setPrototypeOf(currentPlayerCard, prototypeOppsiteCard)
        gameContext.updateView()
        continuation()
        this.doBeforeAttack(gameContext, continuation)
        console.log(document.body)
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Nemo(),
];
const banditStartDeck = [
    new Brewer(),
    new Brewer(),
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(5);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});


