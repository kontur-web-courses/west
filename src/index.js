import Card from "./Card.js"
import Game from "./Game.js"
import TaskQueue from "./TaskQueue.js"
import SpeedRate from "./SpeedRate.js"

class Creature extends Card {
    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()]
    }

    get currentPowerProp() {
        return this.currentPower
    }

    set currentPowerProp(value) {
        if (this.currentPower + value <= this.maxPower) {
            this.currentPower += value
        } else {
            this.currentPower = this.maxPower
        }
    }
}

class Duck extends Creature {
    constructor() {
        super("Мирная утка", 2)
    }

    quacks() {
        console.log("quack")
    }

    swims() {
        console.log("float: both;")
    }
}

class Dog extends Creature {
    constructor(name = "Пес-бандит", maxPower = 3) {
        super(name, maxPower)
    }
}

class PseudoDuck extends Dog {
    constructor() {
        super("Псевдоутка", 3)
    }

    quacks() {
        console.log("quack")
    }

    swims() {
        console.log("float: both;")
    }
}

class Nemo extends Creature {
    constructor() {
        super("Немо", 4)
    }

    doBeforeAttack(gameContext, continuation) {
        const { currentPlayer, oppositePlayer, position, updateView } = gameContext

        let attackedCard = oppositePlayer.table[0]
        let nemoCard = currentPlayer.table[position]

        let prototype = Object.getPrototypeOf(attackedCard)
        Object.setPrototypeOf(nemoCard, prototype)
        updateView()
        nemoCard.doBeforeAttack(gameContext, continuation)
    }
}

class Brewer extends Duck {
    constructor() {
        super("Пивовар", 2)
    }

    doBeforeAttack(gameContext, continuation) {
        const { currentPlayer, oppositePlayer } = gameContext

        let cards = currentPlayer.table.concat(oppositePlayer.table)

        for (const card of cards) {
            if (isDuck(card)) {
                card.maxPower += 1
                card.currentPowerProp += 2
                this.view.signalHeal(continuation)
                card.updateView()
            }
        }
    }
}

class Gatling extends Creature {
    constructor() {
        super("Гатлинг", 6)
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue()

        const { oppositePlayer } = gameContext

        for (let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push((onDone) => this.view.showAttack(onDone))
            taskQueue.push((onDone) => {
                const oppositeCard = oppositePlayer.table[position]

                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone)
                }
            })
        }
        taskQueue.continueWith(continuation)
    }
}

class Rogue extends Creature {
    constructor() {
        super("Изгой", 2)
    }

    doBeforeAttack(gameContext, continuation) {
        const { currentPlayer, oppositePlayer, position, updateView } = gameContext

        let oppositeCard = oppositePlayer.table[0]
        let prototype = Object.getPrototypeOf(oppositeCard)
        let playerCard = currentPlayer.table[position]

        if (prototype.hasOwnProperty("modifyDealedDamageToCreature")) {
            playerCard["modifyDealedDamageToCreature"] = prototype["modifyDealedDamageToCreature"]
            delete prototype["modifyDealedDamageToCreature"]
        }

        if (prototype.hasOwnProperty("modifyDealedDamageToPlayer")) {
            playerCard["modifyDealedDamageToPlayer"] = prototype["modifyDealedDamageToPlayer"]
            delete prototype["modifyDealedDamageToPlayer"]
        }

        if (prototype.hasOwnProperty("modifyTakenDamage")) {
            playerCard["modifyTakenDamage"] = prototype["modifyTakenDamage"]
            delete prototype["modifyTakenDamage"]
        }

        updateView()
        continuation()
    }
}

class Lad extends Dog {
    constructor() {
        super("Браток", 2)
    }

    static getInGameCount() {
        return this.inGameCount || 0
    }

    static setInGameCount(value) {
        this.inGameCount = value
    }

    static getBonus() {
        let countLads = this.getInGameCount()

        return (countLads * (countLads + 1)) / 2
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1)
        continuation()
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1)
        continuation()
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(Lad.getBonus())
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - Lad.getBonus())
    }

    getDescriptions() {
        if (
            Lad.prototype.hasOwnProperty("modifyDealedDamageToCreature") ||
            Lad.prototype.hasOwnProperty("modifyTakenDamage")
        ) {
            return ["Чем их больше, тем они сильнее", ...super.getDescriptions()]
        }

        return super.getDescriptions()
    }
}

class Trasher extends Dog {
    constructor() {
        super("Громила", 5)
    }

    modifyTakenDamage = function (value, fromCard, gameContext, continuation) {
        const taskQueue = new TaskQueue()
        taskQueue.push((onDone) => {
            this.view.signalAbility(() => {
                continuation(value - 1)
            })
        })
    }

    getDescriptions() {
        return ["если Громилу атакуют, то он получает на 1 меньше урона", ...super.getDescriptions()]
    }
}

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return "Утка-Собака"
    }
    if (isDuck(card)) {
        return "Утка"
    }
    if (isDog(card)) {
        return "Собака"
    }
    return "Существо"
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [new Nemo()]

// Колода Бандита, верхнего игрока.
const banditStartDeck = [new Brewer(), new Brewer()]

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck)

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1)

// Запуск игры.
game.play(false, (winner) => {
    alert("Победил " + winner.name)
})
