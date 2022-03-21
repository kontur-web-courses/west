import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card{
    constructor(name, power) {
        super(name, power);
    }
    getDescriptions(){
        return [getCreatureDescription(this),...super.getDescriptions()];
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



// Основа для утки.
class Duck extends Creature{
    constructor() {
        super('Мирная утка', 2);
    }
    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3){
        super(name, power);
    }
}

class Trasher extends Dog{
    constructor(){
        super("Громила", 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }

    getDescriptions(){
        return ['Если Громилу атакуют, то он получает на 1 меньше урона',...super.getDescriptions()];
    }
}

class Lad extends Dog{
    
    constructor(){
        super("Браток", 2);
    }

    static getBonus(){
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        continuation(Lad.setInGameCount(Lad.getInGameCount() + 1));
    }

    doBeforeRemoving(continuation) {
        continuation(Lad.setInGameCount(Lad.getInGameCount() - 1));
    }

    modifyDealedDamageToCreature(value, fromCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - Lad.getBonus());
    }

    getDescriptions(){
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')){
            return ['Чем их больше, тем они сильнее',...super.getDescriptions()];
        }
        return super.getDescriptions();
        

    }

}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    
    new Dog(),
    new Card('Мирный житель', 2),
    new Card('Мирный житель', 2),
    new Trasher(),
    new Trasher(),
    new Trasher(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Lad(),
    new Lad(),
    new Lad(),
    new Trasher(),
    new Card('Бандит', 3),
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
