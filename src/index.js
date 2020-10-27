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
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower = 2, image = '') {
        super(name, maxPower, image);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3, image = '') {
        super(name, maxPower, image);
    }
}

// Громила
class Trasher extends Dog {
    constructor(name = 'Громила', maxPower = 5, image = '') {
        super(name, maxPower, image);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => { 
            continuation(value - 1);
        });
    }

    getDescriptions() {
        return ['Если Громилу атакуют, то он получает на 1 меньше урона', ...super.getDescriptions()]
    }
}

// Гатлинг
class Gatling extends Creature {
    constructor(name = 'Гатлинг', maxPower = 6, image = '') {
        super(name, maxPower, image);
    }

    attack(gameContext, continuation) {
        const enemies = gameContext.oppositePlayer.table;

        const taskQueue = new TaskQueue();

        enemies.forEach(oppositeCard => {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                }
            });
        });


        taskQueue.continueWith(continuation);
    }
}

// Братки
class Lad extends Dog {
    constructor(name = 'Браток', maxPower = 2, image = '') {
        super(name, maxPower, image);        
    }

    static getInGameCount() { 
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        const ladCounts = this.getInGameCount();
        return ladCounts * (ladCounts + 1) / 2;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(continuation);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());        
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - Lad.getBonus());
    }
    
    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') || Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            return ['Чем их больше, тем они сильнее', ...super.getDescriptions()];
        }
        return super.getDescriptions();
    }
}

// Изгой
class Rogue extends Creature {
    constructor(name = 'Изгой', maxPower = 2, image = '') {
        super(name, maxPower, image);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        const enemy = oppositePlayer.table[position];

        if (enemy) {
            const enemyProto = Object.getPrototypeOf(enemy);

            function stealPower(rogue, enemy, power) {
                if (enemy.hasOwnProperty(power)) {
                    rogue[power] = enemy[power];
                    delete enemy[power];
                }
            }

            stealPower(this, enemyProto, 'modifyDealedDamageToCreature');
            stealPower(this, enemyProto, 'modifyDealedDamageToPlayer');
            stealPower(this, enemyProto, 'modifyTakenDamage');
        }

        updateView();
        super.doBeforeAttack(gameContext, continuation);
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Rogue(),
];
// Колода Бандита, верхнего игрока.
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
