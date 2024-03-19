import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        return [
            getCreatureDescription(this),
            ...super.getDescriptions(),
        ]
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower = 2, image) {
        super(name, maxPower, image);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

class Dog extends Creature {
    constructor(name = 'Пёс бандит', maxPower = 3, image) {
        super(name, maxPower, image);
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', power = 5, image) {
        super(name, power, image);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const queue = new TaskQueue();
        queue.push(onDone => {
            this.view.signalAbility(onDone);
        })
        queue.continueWith(() => continuation(value - 1))
    }

    getDescriptions() {
        return ['Получает на 1 урона меньше',
            ...super.getDescriptions(),
        ]
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6, image) {
        super(name, power, image);
    }

    attack(gameContext, continuation) {
        const queue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const oppositeCards = oppositePlayer.table;
        queue.push(onDone => this.view.showAttack(onDone));
        if (oppositeCards.length !== 0) {
            for (const card of oppositeCards) {
                queue.push(onDone => {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                });
            }
        } else {
            queue.push(onDone => {
                this.dealDamageToPlayer(1, gameContext, onDone);
            });
        }
        queue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor(name = 'Браток', power = 2, image) {
        super(name, power, image);
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
        const queue = new TaskQueue();
        queue.push(onDone => {
            this.view.signalAbility(onDone);
        })
        queue.continueWith(() => continuation((value - Lad.getBonus()) || 0))
    }
    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(Lad.getBonus());
    }

    getDescriptions() {
        const description = [];
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')
            || Lad.prototype.hasOwnProperty('modifyTakenDamage')){
            description.push('Чем их больше, тем они сильнее');
        }
        description.push(...super.getDescriptions());
        return description
    }


    static inGameCount;

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        return this.inGameCount * (this.inGameCount + 1) / 2;
    }
}

class PseudoDuck extends Dog{
    constructor(name = 'Псевдоутка', power = 3, image) {
        super(name, power, image);
    }
    swims(){
        console.log('Типо плыву');
    }

    quacks(){
        console.log('Типо крякаю');
    }
}


class Brewer extends Duck{
    constructor(name = 'Пивовар', power = 2, image) {
        super(name, power, image);
    }
    doBeforeAttack(gameContext, continuation) {
        const queue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const allCards = currentPlayer.table.concat(oppositePlayer.table);
        for (const card of allCards){
            if (isDuck(card)) {
                queue.push(onDone => {
                    card.maxPower++;
                    if (card.currentPower + 2 > card.maxPower){
                        card.currentPower = card.maxPower;
                    } else{
                        card.currentPower += 2;
                    }
                    card.view.signalHeal(onDone);
                    card.updateView();
                });
            }
        }
        queue.continueWith(continuation());
    }
}
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

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];

// Колода Бандита, верхнего игрока.
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
