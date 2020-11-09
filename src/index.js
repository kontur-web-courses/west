import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card{
    constructor(name, maxPower) {
        super(name, maxPower);
    }
    getDescriptions(){
        return [this.getCreatureDescription(), super.getDescriptions()]
    }
    get _currentPower() {
        return this.currentPower;
    }
    set _currentPower(value) {
        let finalValue = this.currentPower + value;
        this.currentPower = finalValue <= this.maxPower ? finalValue : this.maxPower;
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
    constructor(name, maxPower) {
        super(name, maxPower);
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

class Lad extends Dog {
    constructor() {
        super();
        this.name = "Браток"
        this.maxPower = 2;
        this.currentPower = this.maxPower;
        this.powerDescription = 'Чем их больше, тем они сильнее.'
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        let count = this.getInGameCount();
        console.log(count * (count + 1) / 2)
        return count * (count + 1) / 2;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        let defense = Lad.getBonus();
        super.modifyTakenDamage(value - defense, fromCard, gameContext, continuation);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation);
    }

    getDescriptions() {
        let superDescriptions = super.getDescriptions();
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') || Lad.prototype.hasOwnProperty("modifyTakenDamage"))
            return [...superDescriptions, this.powerDescription];
        else
            return [...superDescriptions];
    }
}

class Rogue extends Creature {
    constructor() {
        super("Изгой", 2);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const oppositeCard = oppositePlayer.table[position];
        let prototype = Object.getPrototypeOf(oppositeCard);
        if (prototype.hasOwnProperty("modifyTakenDamage")) {
            this.modifyTakenDamage = prototype.modifyTakenDamage;
            delete prototype["modifyTakenDamage"];
        }
        if (prototype.hasOwnProperty("modifyDealedDamageToPlayer")) {
            this.modifyDealedDamageToPlayer = prototype.modifyDealedDamageToPlayer;
            delete prototype["modifyDealedDamageToPlayer"];
        }
        if (prototype.hasOwnProperty("modifyDealedDamageToCreature")) {
            this.modifyDealedDamageToCreature = prototype.modifyDealedDamageToCreature;
            delete prototype["modifyDealedDamageToCreature"];
        }
        updateView();
        continuation();
    }
}

class Brewer extends Duck {
    constructor() {
        super("Пивовар", 2);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const taskQueue = new TaskQueue();
        const allCards = currentPlayer.table.concat(oppositePlayer.table).filter((value) => { return value !== null });
        for (let card of allCards) {
            if (card.getCreatureDescription() === "Утка") {
                card.maxPower++;
                card._currentPower += 2;
                taskQueue.push(onDone => card.view.signalHeal(onDone));
                //taskQueue.push(onDone => { card.updateView(); onDone(); })
            }
        }
        taskQueue.continueWith(continuation);
        continuation();
    }
}


const seriffStartDeck = [
    new Duck("Мирная утка", 2),
    new Brewer(),
];
const banditStartDeck = [
    new Trasher(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
