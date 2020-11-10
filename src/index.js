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





//
class Creature extends Card {
    constructor(name, maxPower, image) {
        super(name, maxPower, image);

    }
    getDescriptions() {
        return [
            getCreatureDescription(this),
            super.getDescriptions()
        ];
    };
}

// Основа для утки.
class Duck extends Creature {
    constructor(name = "Мирная утка", maxPower = 2, image = '') {
        super(name, maxPower, image);
    }
    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}

// Основа для собаки.
class Dog extends Creature {
    constructor(name = "Пес-бандит", maxPower = 3, image = '') {
        super(name, maxPower, image);
    }
}

// Громила, получает на 1 меньше урона
class Trasher extends Dog {
    constructor(name = "Громила", maxPower = 5, image = '', ) {
        super(name, maxPower, image);
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }
}

// Преопределение метода Громилы, изменение описания
Trasher.prototype.getDescriptions = function () {
    return [
        getCreatureDescription(this),
        "Descr: Takes 1 less damage"
    ];
};

// Гатлинг
class Gatling extends Creature {
    constructor(name = "Гатлинг", maxPower = 6, image = '') {
        super(name, maxPower, image);
    }
}

// Переопределение метода Гатлинг для урона по нескольким картам
Gatling.prototype.attack = function (gameContext, continuation) {
    const taskQueue = new TaskQueue();

    const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
    for(let position = 0; position < gameContext.oppositePlayer.table.length; position++) {
        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
        const oppositeCard = gameContext.oppositePlayer.table[position];

        if (gameContext.oppositePlayer.table[position]) { // урон по одной карте = 2
            this.dealDamageToCreature(2, gameContext.oppositePlayer.table[position], gameContext, onDone);
        } else {
            this.dealDamageToPlayer(1, gameContext, onDone);
        }
    });
    }
    

    taskQueue.continueWith(continuation);
};

// Браток
class Lad extends Dog {
    constructor(name = "Браток", maxPower = 3, image = '') {
        super(name, maxPower, image);
    }
    static getInGameCount() { return this.inGameCount || 0; } ;
    static setInGameCount(value) { this.inGameCount = value; };
    static getBonus() {  
        return this.getInGameCount()*(this.getInGameCount() + 1)/2;
    }
}

Lad.prototype.modifyDealedDamageToCreature = function (value, toCard, gameContext, continuation) {
    this.view.signalAbility(() => continuation(value + Lad.getBonus()));
};
Lad.prototype.modifyTakenDamage= function(value, fromCard, gameContext, continuation) {
    this.view.signalAbility(() => continuation(value - Lad.getBonus()));
};
Lad.prototype.doAfterComingIntoPlay = function (gameContext, continuation) {
    const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
    Lad.setInGameCount(Lad.getInGameCount()+1);
    Lad.modifyDealedDamageToCreature(this.maxPower, toCard, gameContext, continuation);
    Lad.modifyTakenDamage(this.maxPower, fromCard, gameContext, continuation);
    continuation();
};
Lad.prototype.doBeforeRemoving = function (continuation) {
    Lad.setInGameCount(Lad.getInGameCount()-1);
    Lad.modifyDealedDamageToCreature(this.maxPower, toCard, gameContext, continuation);
    Lad.modifyTakenDamage(this.maxPower, fromCard, gameContext, continuation);
    continuation();
};
Lad.prototype.getDescriptions = function () {
    if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') || 
    Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
        return [
            getCreatureDescription(this),
            "Чем их больше, тем они сильнее"
        ];
    }
    
};


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.
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


