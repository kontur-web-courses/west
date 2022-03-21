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
    constructor(name, power, image) {
        super(name, power, image);
    }

    getDescriptions() {
        const first = getCreatureDescription(this);
        const second = super.getDescriptions();
        return [first, ...second];
    }
}

// Основа для утки.

class Duck extends Creature{
    constructor() {
        super('Мирная утка', 2);
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }
}




class Dog extends Creature{
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }

    getDescriptions() {
        return ['Если Громилу атакуют, то он получает на 1 меньше урона', ...super.getDescriptions()]
    }
}

class Gatling extends Creature{
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const opponentCards = oppositePlayer.table;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        for (let oppositeCard of opponentCards)
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
            });

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor() {
        super('Браток', 2);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.SetLagCount(1 + Lad.GetLadCount());
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.SetLagCount(Lad.GetLadCount() - 1);
        continuation();
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(Lad.UpSkill() + value);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - Lad.UpSkill());
    }

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature'))
            return ['болучает бонусы к защите и атаке, если на столе есть еще Братки', ...super.getDescriptions()]
        return super.getDescriptions()
    }

    static GetLadCount() {
        return this.inGameCount || 0;

    }

    static SetLagCount(value) {
        if (value < 0)
            value = 0;
        this.inGameCount = value;
    }

    static UpSkill() {
        return (this.inGameCount * (this.inGameCount + 1)) / 2;
    }
}




// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
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
